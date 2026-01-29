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
    { params }: { params: Promise<{ id: string }> }
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

        const { id } = await params;

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

        // 4. Parse request body once
        const body = await request.json();

        // 5. Prevent self-demotion/deactivation
        if (id === session.user.id) {
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

        // 6. Parse updates
        const { email, name, role, phone, timezone, active } = body;

        // 7. Validate new role permission
        if (role && !canManageUserRole(userRole, role)) {
            return NextResponse.json(
                { error: "Reception can only assign client role" },
                { status: 403 }
            );
        }

        // 8. Check last admin protection
        if (existingUser.role === "admin" && (role !== "admin" || active === false)) {
            const adminCount = await userRepo.count({ where: { role: "admin" } });
            if (adminCount <= 1) {
                return NextResponse.json(
                    { error: "Cannot modify the last admin account" },
                    { status: 403 }
                );
            }
        }

        // 9. Handle email change
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

        // 10. Update basic user fields
        if (name || phone || timezone) {
            existingUser.name = name || existingUser.name;
            existingUser.phone = phone !== undefined ? phone : existingUser.phone;
            existingUser.timezone = timezone || existingUser.timezone;
            await userRepo.save(existingUser);
        }

        // 11. Update role if changed
        if (role && role !== existingUser.role) {
            try {
                await auth.api.setRole({
                    body: { userId: id, role },
                    headers: request.headers
                });

                // Update local record
                existingUser.role = role;
                await userRepo.save(existingUser);
            } catch (roleError) {
                console.error("Set role error:", roleError);
                return NextResponse.json(
                    { error: "Failed to update role" },
                    { status: 400 }
                );
            }
        }

        // 12. Update ban status
        if (active !== undefined) {
            try {
                // Get current ban status from Better Auth
                // We need to check if user is currently banned before toggling
                const userList = await auth.api.listUsers({
                    query: {
                        limit: 1,
                        filterField: "id",
                        filterValue: id,
                        filterOperator: "eq"
                    },
                    headers: request.headers
                });

                const currentUser = userList.users?.find((u: any) => u.id === id);
                const isBanned = currentUser?.banned || false;

                if (active && isBanned) {
                    // Unban user
                    await auth.api.unbanUser({
                        body: { userId: id },
                        headers: request.headers
                    });
                } else if (!active && !isBanned) {
                    // Ban user
                    await auth.api.banUser({
                        body: { userId: id },
                        headers: request.headers
                    });
                }
            } catch (banError) {
                console.error("Ban/unban error:", banError);
                // Don't fail the request if ban/unban fails
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
