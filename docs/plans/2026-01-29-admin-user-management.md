# Admin User Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable admins and reception staff to create, edit, and manage user accounts with role-based permissions using Better Auth's admin plugin.

**Architecture:** Leverage Better Auth's admin plugin for user CRUD operations, ban/unban for soft delete, and forgetPassword for password reset flow. Add UI pages for creation/editing with role-based access control.

**Tech Stack:** Better Auth (admin plugin), Next.js 16 App Router, React Hook Form, Zod validation, TypeORM

---

## Task 1: Enable Better Auth Admin Plugin

**Files:**
- Modify: `frontend/src/lib/auth.ts:1-110`
- Modify: `frontend/src/lib/auth-client.ts`

**Step 1: Add admin plugin to Better Auth server config**

In `frontend/src/lib/auth.ts`, add admin plugin import and configuration:

```typescript
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { createPool } from "mysql2/promise";
import bcrypt from "bcryptjs";
import { databaseConfig, authConfig, appConfig } from "@/config";
import { sendEmail } from "./email";

const pool = createPool({
    host: databaseConfig.host,
    port: databaseConfig.port,
    user: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
});

export const auth = betterAuth({
    database: pool,
    secret: authConfig.secret,
    baseURL: authConfig.baseUrl,

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        password: {
            hash: async (password) => {
                return await bcrypt.hash(password, 10);
            },
            verify: async ({ hash, password }) => {
                return await bcrypt.compare(password, hash);
            },
        },
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: `Reset your ${appConfig.name} password`,
                template: "PasswordReset",
                data: {
                    name: user.name,
                    resetUrl: url,
                },
            });
        },
    },

    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: `Verify your ${appConfig.name} email`,
                template: "EmailVerification",
                data: {
                    name: user.name,
                    verificationUrl: url,
                },
            });
        },
        sendOnSignUp: true,
    },

    socialProviders: {
        google: {
            clientId: authConfig.google.clientId,
            clientSecret: authConfig.google.clientSecret,
        },
    },

    session: {
        modelName: "sessions",
        expiresIn: authConfig.session.expiresIn,
        updateAge: authConfig.session.updateAge,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
        },
    },

    user: {
        modelName: "users",
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "client",
                input: false,
            },
            phone: {
                type: "string",
                required: false,
            },
            timezone: {
                type: "string",
                defaultValue: "Asia/Kolkata",
            },
        },
    },

    account: {
        modelName: "accounts",
        accountLinking: {
            enabled: true,
            trustedProviders: ["google"],
        },
    },

    verification: {
        modelName: "verification_tokens",
    },

    plugins: [
        admin({
            defaultRole: "client",
        })
    ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

**Step 2: Add admin client plugin**

In `frontend/src/lib/auth-client.ts`, add admin client plugin:

```typescript
import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4242",
    plugins: [
        adminClient()
    ]
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    forgetPassword,
    resetPassword,
} = authClient;
```

**Step 3: Verify configuration builds**

Run: `cd frontend && bun run build`
Expected: Build succeeds with no TypeScript errors

**Step 4: Commit**

```bash
git add frontend/src/lib/auth.ts frontend/src/lib/auth-client.ts
git commit -m "feat: enable Better Auth admin plugin

Add admin and adminClient plugins to enable user management APIs
including createUser, setRole, banUser/unbanUser, and forgetPassword.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Permission Utility

**Files:**
- Create: `frontend/src/lib/permissions.ts`

**Step 1: Write permission utility**

Create `frontend/src/lib/permissions.ts`:

```typescript
/**
 * Permission utility for role-based access control
 */

export type UserRole = "client" | "therapist" | "admin" | "reception";

/**
 * Check if current user can manage a target user's role
 * @param currentUserRole - Role of the user performing the action
 * @param targetUserRole - Role of the user being managed
 * @returns true if action is allowed
 */
export function canManageUserRole(
    currentUserRole: string,
    targetUserRole: string
): boolean {
    // Admin can manage everyone
    if (currentUserRole === "admin") {
        return true;
    }

    // Reception can only manage clients
    if (currentUserRole === "reception" && targetUserRole === "client") {
        return true;
    }

    return false;
}

/**
 * Get available roles that current user can assign
 * @param currentUserRole - Role of the user performing the action
 * @returns Array of role options
 */
export function getAvailableRoles(currentUserRole: string): UserRole[] {
    if (currentUserRole === "admin") {
        return ["client", "therapist", "reception", "admin"];
    }

    if (currentUserRole === "reception") {
        return ["client"];
    }

    return [];
}

/**
 * Check if user can access user management
 * @param userRole - Role to check
 * @returns true if user can access user management
 */
export function canAccessUserManagement(userRole: string): boolean {
    return ["admin", "reception"].includes(userRole);
}
```

**Step 2: Commit**

```bash
git add frontend/src/lib/permissions.ts
git commit -m "feat: add permission utility for role-based access

Add helper functions to check user management permissions based on
roles (admin has full access, reception limited to clients).

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create User API Routes

**Files:**
- Create: `frontend/src/app/api/admin/users/route.ts`
- Create: `frontend/src/app/api/admin/users/[id]/route.ts`

**Step 1: Create POST /api/admin/users route**

Create `frontend/src/app/api/admin/users/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";
import { canManageUserRole } from "@/lib/permissions";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    try {
        // 1. Check session and role
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userRole = (session.user as any).role;
        if (!["admin", "reception"].includes(userRole)) {
            return NextResponse.json(
                { error: "Forbidden - insufficient permissions" },
                { status: 403 }
            );
        }

        // 2. Parse request body
        const body = await request.json();
        const { email, name, role, phone, timezone } = body;

        // 3. Validate required fields
        if (!email || !name || !role) {
            return NextResponse.json(
                { error: "Missing required fields: email, name, role" },
                { status: 400 }
            );
        }

        // 4. Validate permissions
        if (!canManageUserRole(userRole, role)) {
            return NextResponse.json(
                { error: "Reception can only create client accounts" },
                { status: 403 }
            );
        }

        // 5. Generate temporary password
        const tempPassword = crypto.randomBytes(16).toString("hex");

        // 6. Create user via Better Auth
        const createResult = await auth.api.createUser({
            body: {
                email,
                name,
                password: tempPassword,
                role,
                phone: phone || null,
                timezone: timezone || "Asia/Kolkata",
            }
        });

        if (createResult.error) {
            console.error("Create user error:", createResult.error);
            return NextResponse.json(
                { error: createResult.error.message || "Failed to create user" },
                { status: 400 }
            );
        }

        // 7. Send password reset email
        try {
            await auth.api.forgetPassword({
                body: { email }
            });
        } catch (emailError) {
            console.error("Password reset email error:", emailError);
            // Don't fail the request if email fails
            return NextResponse.json({
                success: true,
                user: createResult.data,
                warning: "User created but password reset email failed to send"
            });
        }

        return NextResponse.json({
            success: true,
            user: createResult.data
        });
    } catch (error) {
        console.error("Create user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
```

**Step 2: Create PATCH /api/admin/users/[id] route**

Create `frontend/src/app/api/admin/users/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";
import { canManageUserRole } from "@/lib/permissions";
import { AppDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { sendEmail } from "@/lib/email";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Check session and role
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userRole = (session.user as any).role;
        if (!["admin", "reception"].includes(userRole)) {
            return NextResponse.json(
                { error: "Forbidden - insufficient permissions" },
                { status: 403 }
            );
        }

        const { id } = params;

        // 2. Get existing user
        const ds = await getDataSource();
        const userRepo = ds.getRepository(User);
        const existingUser = await userRepo.findOne({ where: { id } });

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // 3. Reception permission check
        if (!canManageUserRole(userRole, existingUser.role)) {
            return NextResponse.json(
                { error: "Cannot edit non-client users" },
                { status: 403 }
            );
        }

        // 4. Prevent self-demotion/deactivation
        if (id === session.user.id) {
            const body = await request.json();
            if (body.role && body.role !== "admin") {
                return NextResponse.json(
                    { error: "Cannot demote yourself from admin" },
                    { status: 403 }
                );
            }
            if (body.active === false) {
                return NextResponse.json(
                    { error: "Cannot deactivate your own account" },
                    { status: 403 }
                );
            }
        }

        // 5. Parse updates
        const body = await request.json();
        const { email, name, role, phone, timezone, active } = body;

        // 6. Validate new role permission
        if (role && !canManageUserRole(userRole, role)) {
            return NextResponse.json(
                { error: "Reception can only assign client role" },
                { status: 403 }
            );
        }

        // 7. Check last admin protection
        if (existingUser.role === "admin" && (role !== "admin" || active === false)) {
            const adminCount = await userRepo.count({ where: { role: "admin" } });
            if (adminCount <= 1) {
                return NextResponse.json(
                    { error: "Cannot modify the last admin account" },
                    { status: 403 }
                );
            }
        }

        // 8. Handle email change
        let emailVerified = existingUser.emailVerified;
        let emailChanged = false;
        if (email && email !== existingUser.email) {
            emailChanged = true;
            emailVerified = null;

            // Update in database
            existingUser.email = email;
            existingUser.emailVerified = null;
            await userRepo.save(existingUser);

            // Send verification email
            try {
                await sendEmail({
                    to: email,
                    subject: "Verify your new email address",
                    template: "EmailVerification",
                    data: {
                        name: name || existingUser.name,
                        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}`
                    }
                });
            } catch (emailError) {
                console.error("Verification email error:", emailError);
            }
        }

        // 9. Update basic user fields
        if (name || phone || timezone) {
            existingUser.name = name || existingUser.name;
            existingUser.phone = phone !== undefined ? phone : existingUser.phone;
            existingUser.timezone = timezone || existingUser.timezone;
            await userRepo.save(existingUser);
        }

        // 10. Update role if changed
        if (role && role !== existingUser.role) {
            const roleResult = await auth.api.setRole({
                body: { userId: id, role }
            });

            if (roleResult.error) {
                console.error("Set role error:", roleResult.error);
                return NextResponse.json(
                    { error: "Failed to update role" },
                    { status: 400 }
                );
            }

            // Update local record
            existingUser.role = role;
            await userRepo.save(existingUser);
        }

        // 11. Update ban status
        if (active !== undefined) {
            // Get current ban status from Better Auth
            const userList = await auth.api.listUsers({
                query: {
                    limit: 1,
                    filter: { id }
                }
            });

            const currentUser = userList.data?.users?.[0];
            const isBanned = currentUser?.banned || false;

            if (active && isBanned) {
                // Unban user
                const unbanResult = await auth.api.unbanUser({
                    body: { userId: id }
                });
                if (unbanResult.error) {
                    console.error("Unban error:", unbanResult.error);
                }
            } else if (!active && !isBanned) {
                // Ban user
                const banResult = await auth.api.banUser({
                    body: { userId: id }
                });
                if (banResult.error) {
                    console.error("Ban error:", banResult.error);
                }
            }
        }

        return NextResponse.json({
            success: true,
            emailChanged
        });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
```

**Step 3: Test API routes build**

Run: `cd frontend && bun run build`
Expected: Build succeeds with no TypeScript errors

**Step 4: Commit**

```bash
git add frontend/src/app/api/admin/users/
git commit -m "feat: add user management API routes

Add POST /api/admin/users to create users with Better Auth admin plugin
Add PATCH /api/admin/users/[id] to update users with role/ban management
Includes permission checks, email verification, and edge case handling.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Update User List Page

**Files:**
- Modify: `frontend/src/app/(portals)/admin/users/page.tsx:1-164`

**Step 1: Enhance user list with Create button and Actions column**

Replace the content of `frontend/src/app/(portals)/admin/users/page.tsx`:

```typescript
import { Metadata } from "next";
import { format } from "date-fns";
import { UserCircle, Plus } from "lucide-react";
import Link from "next/link";
import { AppDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { getServerSession } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Users | Admin | Mindweal by Pihu Suri",
    description: "Manage user accounts",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getUsers() {
    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);

    return userRepo.find({
        order: { createdAt: "DESC" },
    });
}

async function getUserBanStatus() {
    // Get ban status from Better Auth
    const userListResult = await auth.api.listUsers({
        query: { limit: 1000 }
    });

    const bannedUserIds = new Set(
        userListResult.data?.users
            ?.filter(u => u.banned)
            .map(u => u.id) || []
    );

    return bannedUserIds;
}

const roleColors = {
    client: "bg-blue-100 text-blue-800",
    therapist: "bg-green-100 text-green-800",
    admin: "bg-red-100 text-red-800",
    reception: "bg-yellow-100 text-yellow-800",
};

export default async function UsersPage() {
    const session = await getServerSession();
    const userRole = (session?.user as any)?.role;

    const users = await getUsers();
    const bannedUserIds = await getUserBanStatus();

    // Stats
    const stats = {
        total: users.length,
        clients: users.filter((u) => u.role === "client").length,
        therapists: users.filter((u) => u.role === "therapist").length,
        admins: users.filter((u) => u.role === "admin").length,
        reception: users.filter((u) => u.role === "reception").length,
        active: users.filter((u) => !bannedUserIds.has(u.id)).length,
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="portal-title">Users</h1>
                    <p className="text-gray-600 text-sm">
                        Manage user accounts and permissions
                    </p>
                </div>
                <Link href="/admin/users/new" className="btn-primary text-sm">
                    <Plus className="w-4 h-4" />
                    {userRole === "reception" ? "Create Client" : "Create User"}
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                <div className="portal-card p-3">
                    <p className="text-gray-500 text-xs">Total</p>
                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="portal-card p-3">
                    <p className="text-green-600 text-xs">Active</p>
                    <p className="text-xl font-bold text-green-700">{stats.active}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-blue-600 text-xs">Clients</p>
                    <p className="text-xl font-bold text-blue-700">{stats.clients}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-green-600 text-xs">Therapists</p>
                    <p className="text-xl font-bold text-green-700">{stats.therapists}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-red-600 text-xs">Admins</p>
                    <p className="text-xl font-bold text-red-700">{stats.admins}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-yellow-600 text-xs">Reception</p>
                    <p className="text-xl font-bold text-yellow-700">{stats.reception}</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="portal-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Verified</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center">
                                        <UserCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const isBanned = bannedUserIds.has(user.id);
                                    const canEdit =
                                        userRole === "admin" ||
                                        (userRole === "reception" && user.role === "client");

                                    return (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {user.image ? (
                                                        <img
                                                            src={user.image}
                                                            alt={user.name}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-600 text-sm font-medium">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-gray-900 text-sm">
                                                        {user.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-gray-600 text-sm">{user.email}</span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                        roleColors[user.role as keyof typeof roleColors]
                                                    }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                {isBanned ? (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        Inactive
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {user.emailVerified ? (
                                                    <span className="text-green-600 text-xs">
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="text-yellow-600 text-xs">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="text-gray-500 text-xs">
                                                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                                                </span>
                                            </td>
                                            <td>
                                                {canEdit ? (
                                                    <Link
                                                        href={`/admin/users/${user.id}/edit`}
                                                        className="text-primary hover:text-primary-dark text-sm font-medium"
                                                    >
                                                        Edit
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
```

**Step 2: Test page builds**

Run: `cd frontend && bun run build`
Expected: Build succeeds, users page compiles

**Step 3: Commit**

```bash
git add frontend/src/app/\(portals\)/admin/users/page.tsx
git commit -m "feat: enhance user list with create button and actions

Add Create User button with role-based label
Add Status column showing active/inactive based on ban status
Add Actions column with Edit link (filtered by permissions)
Add Active user count to stats

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create User Layout with Access Control

**Files:**
- Create: `frontend/src/app/(portals)/admin/users/layout.tsx`

**Step 1: Create layout with access check**

Create `frontend/src/app/(portals)/admin/users/layout.tsx`:

```typescript
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-middleware";
import { canAccessUserManagement } from "@/lib/permissions";

export default async function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/login?callbackUrl=/admin/users");
    }

    const userRole = (session.user as any).role;

    // Only admin and reception can access user management
    if (!canAccessUserManagement(userRole)) {
        redirect("/client");
    }

    return <>{children}</>;
}
```

**Step 2: Commit**

```bash
git add frontend/src/app/\(portals\)/admin/users/layout.tsx
git commit -m "feat: add user management layout with access control

Only admin and reception roles can access user management pages.
Others are redirected to client portal.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create User Creation Page

**Files:**
- Create: `frontend/src/app/(portals)/admin/users/new/page.tsx`
- Create: `frontend/src/app/(portals)/admin/users/new/CreateUserForm.tsx`

**Step 1: Create new user page**

Create `frontend/src/app/(portals)/admin/users/new/page.tsx`:

```typescript
import { Metadata } from "next";
import { getServerSession } from "@/lib/auth-middleware";
import CreateUserForm from "./CreateUserForm";

export const metadata: Metadata = {
    title: "Create User | Admin | Mindweal by Pihu Suri",
    description: "Create a new user account",
};

export default async function CreateUserPage() {
    const session = await getServerSession();
    const userRole = (session?.user as any)?.role;

    return (
        <div className="max-w-2xl">
            <div className="mb-4">
                <h1 className="portal-title">
                    {userRole === "reception" ? "Create Client" : "Create User"}
                </h1>
                <p className="text-gray-600 text-sm">
                    Create a new user account. They will receive a password reset email.
                </p>
            </div>

            <CreateUserForm currentUserRole={userRole} />
        </div>
    );
}
```

**Step 2: Create user form component**

Create `frontend/src/app/(portals)/admin/users/new/CreateUserForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Mail, User as UserIcon, Phone, Globe } from "lucide-react";
import Link from "next/link";
import { getAvailableRoles } from "@/lib/permissions";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["client", "therapist", "admin", "reception"]),
    phone: z.string().optional(),
    timezone: z.string(),
});

type FormData = z.infer<typeof formSchema>;

const TIMEZONES = [
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
    { value: "America/New_York", label: "America/New_York (EST)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
    { value: "Europe/London", label: "Europe/London (GMT)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
];

interface Props {
    currentUserRole: string;
}

export default function CreateUserForm({ currentUserRole }: Props) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableRoles = getAvailableRoles(currentUserRole);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            name: "",
            role: availableRoles[0] || "client",
            phone: "",
            timezone: "Asia/Kolkata",
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create user");
            }

            if (result.warning) {
                alert(result.warning);
            }

            // Success
            router.push("/admin/users");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create user");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="portal-card">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="email"
                            {...form.register("email")}
                            className="portal-input pl-10"
                            placeholder="user@example.com"
                        />
                    </div>
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            {...form.register("name")}
                            className="portal-input pl-10"
                            placeholder="John Doe"
                        />
                    </div>
                    {form.formState.errors.name && (
                        <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.name.message}
                        </p>
                    )}
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select {...form.register("role")} className="portal-input">
                        {availableRoles.map((role) => (
                            <option key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                        ))}
                    </select>
                    {form.formState.errors.role && (
                        <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.role.message}
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone (optional)
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="tel"
                            {...form.register("phone")}
                            className="portal-input pl-10"
                            placeholder="+91 98765 43210"
                        />
                    </div>
                </div>

                {/* Timezone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select {...form.register("timezone")} className="portal-input pl-10">
                            {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Info box */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> The user will receive an email with a link to set their password.
                        The link is valid for 24 hours.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create User"
                        )}
                    </button>
                    <Link href="/admin/users" className="btn-secondary">
                        <ArrowLeft className="w-4 h-4" />
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
```

**Step 3: Test page builds**

Run: `cd frontend && bun run build`
Expected: Build succeeds, create user page compiles

**Step 4: Commit**

```bash
git add frontend/src/app/\(portals\)/admin/users/new/
git commit -m "feat: add user creation page with role-based form

Add create user page with form for email, name, role, phone, timezone
Role dropdown filtered based on current user permissions
Form validates input and calls POST /api/admin/users

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create User Edit Page

**Files:**
- Create: `frontend/src/app/(portals)/admin/users/[id]/edit/page.tsx`
- Create: `frontend/src/app/(portals)/admin/users/[id]/edit/EditUserForm.tsx`

**Step 1: Create edit user page**

Create `frontend/src/app/(portals)/admin/users/[id]/edit/page.tsx`:

```typescript
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-middleware";
import { AppDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { canManageUserRole } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import EditUserForm from "./EditUserForm";

export const metadata: Metadata = {
    title: "Edit User | Admin | Mindweal by Pihu Suri",
    description: "Edit user account",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getUser(id: string) {
    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);
    return userRepo.findOne({ where: { id } });
}

async function getUserBanStatus(id: string) {
    const userListResult = await auth.api.listUsers({
        query: { limit: 1, filter: { id } }
    });

    const user = userListResult.data?.users?.[0];
    return user?.banned || false;
}

export default async function EditUserPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession();
    const currentUserRole = (session?.user as any)?.role;

    const user = await getUser(params.id);

    if (!user) {
        notFound();
    }

    // Check permissions
    if (!canManageUserRole(currentUserRole, user.role)) {
        redirect("/admin/users");
    }

    const isBanned = await getUserBanStatus(params.id);

    return (
        <div className="max-w-2xl">
            <div className="mb-4">
                <h1 className="portal-title">Edit User</h1>
                <p className="text-gray-600 text-sm">
                    Update user account details and permissions
                </p>
            </div>

            <EditUserForm
                user={{
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    phone: user.phone || "",
                    timezone: user.timezone,
                    active: !isBanned,
                }}
                currentUserRole={currentUserRole}
                currentUserId={session?.user.id || ""}
            />
        </div>
    );
}
```

**Step 2: Create edit user form component**

Create `frontend/src/app/(portals)/admin/users/[id]/edit/EditUserForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Mail, User as UserIcon, Phone, Globe, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getAvailableRoles } from "@/lib/permissions";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["client", "therapist", "admin", "reception"]),
    phone: z.string().optional(),
    timezone: z.string(),
    active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

const TIMEZONES = [
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
    { value: "America/New_York", label: "America/New_York (EST)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
    { value: "Europe/London", label: "Europe/London (GMT)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
];

interface Props {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        phone: string;
        timezone: string;
        active: boolean;
    };
    currentUserRole: string;
    currentUserId: string;
}

export default function EditUserForm({ user, currentUserRole, currentUserId }: Props) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailChangeWarning, setEmailChangeWarning] = useState(false);

    const availableRoles = getAvailableRoles(currentUserRole);
    const isSelf = user.id === currentUserId;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: user.email,
            name: user.name,
            role: user.role as any,
            phone: user.phone,
            timezone: user.timezone,
            active: user.active,
        },
    });

    const watchEmail = form.watch("email");

    // Show warning if email changed
    if (watchEmail !== user.email && !emailChangeWarning) {
        setEmailChangeWarning(true);
    } else if (watchEmail === user.email && emailChangeWarning) {
        setEmailChangeWarning(false);
    }

    const onSubmit = async (data: FormData) {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update user");
            }

            // Success
            if (result.emailChanged) {
                alert("User updated! A verification email has been sent to the new email address.");
            }

            router.push("/admin/users");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update user");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="portal-card">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {emailChangeWarning && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                            <strong>Email changed:</strong> A verification email will be sent to the new address.
                            The user must verify before logging in.
                        </p>
                    </div>
                )}

                {isSelf && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">
                            You are editing your own account. You cannot demote yourself from admin or deactivate
                            your account.
                        </p>
                    </div>
                )}

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="email"
                            {...form.register("email")}
                            className="portal-input pl-10"
                            placeholder="user@example.com"
                        />
                    </div>
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            {...form.register("name")}
                            className="portal-input pl-10"
                            placeholder="John Doe"
                        />
                    </div>
                    {form.formState.errors.name && (
                        <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.name.message}
                        </p>
                    )}
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...form.register("role")}
                        className="portal-input"
                        disabled={currentUserRole === "reception"}
                    >
                        {availableRoles.map((role) => (
                            <option key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                        ))}
                    </select>
                    {form.formState.errors.role && (
                        <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.role.message}
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone (optional)
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="tel"
                            {...form.register("phone")}
                            className="portal-input pl-10"
                            placeholder="+91 98765 43210"
                        />
                    </div>
                </div>

                {/* Timezone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select {...form.register("timezone")} className="portal-input pl-10">
                            {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Active Status */}
                <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            {...form.register("active")}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                            disabled={isSelf}
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Account Active
                        </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        Inactive users cannot log in. Data is preserved and account can be reactivated.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                    <Link href="/admin/users" className="btn-secondary">
                        <ArrowLeft className="w-4 h-4" />
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
```

**Step 3: Test page builds**

Run: `cd frontend && bun run build`
Expected: Build succeeds, edit user page compiles

**Step 4: Commit**

```bash
git add frontend/src/app/\(portals\)/admin/users/\[id\]/edit/
git commit -m "feat: add user edit page with status toggle

Add edit user page with pre-populated form
Include active/inactive status toggle (ban/unban)
Email change triggers verification warning
Prevent self-demotion and self-deactivation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Final Testing and Verification

**Step 1: Build the application**

Run: `cd frontend && bun run build`
Expected: Build completes successfully with no errors

**Step 2: Manual testing checklist**

Test the following scenarios:

1. **Admin creates client user**
   - Navigate to `/admin/users/new`
   - Fill form with client role
   - Submit and verify redirect to list
   - Check user appears in list

2. **Admin creates admin user**
   - Create user with admin role
   - Verify password reset email sent

3. **Reception creates client user**
   - Login as reception user
   - Verify only "Client" role available
   - Create client user successfully

4. **Reception cannot create admin**
   - Verify reception user cannot select other roles

5. **Admin edits user email**
   - Go to user edit page
   - Change email address
   - Submit and verify warning about verification

6. **Admin changes user role**
   - Edit user and change role
   - Verify role updates in list

7. **Admin deactivates user**
   - Uncheck "Account Active" toggle
   - Submit and verify status shows "Inactive" in list
   - Attempt to login as that user - should fail

8. **Admin reactivates user**
   - Check "Account Active" toggle
   - Verify status shows "Active"
   - User can login again

9. **Prevent self-demotion**
   - Admin edits own account
   - Try to change role to client
   - Verify error message

10. **Prevent last admin deactivation**
    - If only one admin exists
    - Try to deactivate
    - Verify error message

**Step 3: Document any issues**

Create notes in a file if any issues found:

Create `docs/plans/2026-01-29-user-management-test-results.md` with findings

**Step 4: Final commit**

```bash
git add .
git commit -m "test: verify user management feature

Manual testing completed for admin and reception user workflows
including create, edit, role changes, and ban/unban functionality.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Summary

**Completed Features:**
✅ Better Auth admin plugin enabled
✅ Permission utility for role-based access
✅ API routes for create/update users
✅ Enhanced user list with status and actions
✅ User creation page with role filtering
✅ User edit page with ban/unban toggle
✅ Email verification on email change
✅ Self-demotion and last-admin protection
✅ Route access control layout

**Key Files Created/Modified:**
- `frontend/src/lib/auth.ts` - Added admin plugin
- `frontend/src/lib/auth-client.ts` - Added adminClient plugin
- `frontend/src/lib/permissions.ts` - Permission utilities
- `frontend/src/app/api/admin/users/route.ts` - Create user API
- `frontend/src/app/api/admin/users/[id]/route.ts` - Update user API
- `frontend/src/app/(portals)/admin/users/page.tsx` - Enhanced list
- `frontend/src/app/(portals)/admin/users/layout.tsx` - Access control
- `frontend/src/app/(portals)/admin/users/new/*` - Create page
- `frontend/src/app/(portals)/admin/users/[id]/edit/*` - Edit page

**Manual Testing Required:**
See Task 8 Step 2 for complete testing checklist

**Build Verification:**
Run `cd frontend && bun run build` after each task to ensure no TypeScript errors
