# Admin User Management Design

**Date:** 2026-01-29
**Status:** Approved
**Author:** Rahul with Claude Sonnet 4.5

## Overview

Enable admins and reception staff to create, edit, and manage user accounts with role-based permissions using Better Auth's admin plugin.

## Requirements

### User Roles
- **Admin:** Full access - can create/edit users with any role
- **Reception:** Limited access - can only create/edit client users

### Capabilities
1. **Create Users:** Admin creates accounts directly with email, name, role, and optional fields
2. **Edit Users:** Full editing of all user fields (email, name, role, phone, timezone)
3. **Password Management:** System generates temporary password, user receives reset link
4. **Soft Delete:** Inactive users cannot log in but data is preserved (using Better Auth ban)
5. **Email Verification:** When admin changes email, require re-verification

## Architecture

### Better Auth Admin Plugin

Enable Better Auth's built-in admin plugin for user management:

```typescript
// src/lib/auth.ts
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
    plugins: [
        admin({
            defaultRole: "client",
        })
    ],
});
```

**Admin Plugin Features Used:**
- `auth.api.createUser` - Create users with role
- `auth.api.updateUser` - Update user fields
- `auth.api.setRole` - Change user roles
- `auth.api.banUser/unbanUser` - Soft delete (inactive users)
- `auth.api.forgetPassword` - Trigger password reset email

### Password Reset Flow

When admin creates a user:
1. Call `auth.api.createUser` with temporary random password (crypto.randomBytes)
2. Immediately call `auth.api.forgetPassword` for that user
3. User receives email: "Your account has been created. Click here to set your password."
4. Uses Better Auth's native password reset with 24-hour expiry
5. User sets their own password via reset link

### Soft Delete via Ban

Instead of custom `active` field, use Better Auth's built-in ban feature:
- Banned users cannot log in
- All data is preserved in database
- Can unban to reactivate accounts
- Already integrated with auth system

## UI Components

### Enhanced User List (`/admin/users/page.tsx`)

**Additions:**
- "Create User" button in header (admin/reception see different labels)
- Edit action button for each user
- Status column showing Active/Inactive badge (based on ban status)
- Role-based filtering (reception only sees edit for clients)

**Layout:**
```
[Header with title and "Create User" button]
[Stats cards: Total, Clients, Therapists, Admins, Reception]
[Table: User | Email | Role | Status | Verified | Joined | Actions]
```

### Create User Page (`/admin/users/new/page.tsx`)

**Form Fields:**
- Email (required, validated)
- Name (required)
- Role (dropdown, filtered by current user's role)
- Phone (optional)
- Timezone (dropdown, default: "Asia/Kolkata")

**Role Options:**
- Admin sees: Client, Therapist, Reception, Admin
- Reception sees: Client only

**Submit Flow:**
1. Generate secure random temporary password
2. Call `POST /api/admin/users` with form data
3. API creates user via `auth.api.createUser`
4. API triggers password reset via `auth.api.forgetPassword`
5. Show success: "User created! Password reset email sent."
6. Redirect to `/admin/users`

### Edit User Page (`/admin/users/[id]/edit/page.tsx`)

**Form Fields (pre-populated):**
- Email (editable)
- Name (editable)
- Role (dropdown, filtered)
- Phone (editable)
- Timezone (dropdown)
- **Status Toggle:** Active/Inactive switch

**Email Change Behavior:**
- If email changes, set `emailVerified` to null
- Trigger verification email to new address
- Show warning message to admin

**Role Change Restrictions:**
- Reception cannot access edit page for non-client users (403)
- Reception sees role dropdown disabled

**Submit Flow:**
1. Call `PATCH /api/admin/users/[id]`
2. API checks email change → reset emailVerified
3. API updates fields via `auth.api.updateUser`
4. If role changed → call `auth.api.setRole`
5. If status changed → call `auth.api.banUser` or `auth.api.unbanUser`
6. Show success and redirect

## API Routes

### Create User API (`POST /api/admin/users/route.ts`)

```typescript
export async function POST(req: Request) {
    // 1. Check session and role
    const session = await getServerSession();
    const userRole = session.user.role;

    // 2. Parse request body
    const { email, name, role, phone, timezone } = await req.json();

    // 3. Validate permissions
    if (userRole === "reception" && role !== "client") {
        return Response.json(
            { error: "Reception can only create client accounts" },
            { status: 403 }
        );
    }

    // 4. Generate temporary password
    const tempPassword = crypto.randomBytes(16).toString("hex");

    // 5. Create user via Better Auth
    const newUser = await auth.api.createUser({
        body: {
            email,
            name,
            password: tempPassword,
            role,
            data: { phone, timezone }
        }
    });

    // 6. Send password reset email
    await auth.api.forgetPassword({
        body: { email }
    });

    return Response.json({ success: true, user: newUser });
}
```

### Update User API (`PATCH /api/admin/users/[id]/route.ts`)

```typescript
export async function PATCH(req: Request, { params }) {
    // 1. Check session and role
    const session = await getServerSession();
    const userRole = session.user.role;
    const { id } = params;

    // 2. Get existing user
    const existingUser = await getUserById(id);

    // 3. Reception permission check
    if (userRole === "reception" && existingUser.role !== "client") {
        return Response.json(
            { error: "Cannot edit non-client users" },
            { status: 403 }
        );
    }

    // 4. Parse updates
    const { email, name, role, phone, timezone, active } = await req.json();

    // 5. Handle email change
    let emailVerified = existingUser.emailVerified;
    if (email !== existingUser.email) {
        emailVerified = null; // Require re-verification
        await sendVerificationEmail(email, name);
    }

    // 6. Update user fields
    await auth.api.updateUser({
        body: { id, email, name, phone, timezone, emailVerified }
    });

    // 7. Update role if changed
    if (role !== existingUser.role) {
        await auth.api.setRole({
            body: { userId: id, role }
        });
    }

    // 8. Update ban status
    if (active !== !existingUser.banned) {
        if (active) {
            await auth.api.unbanUser({ body: { userId: id } });
        } else {
            await auth.api.banUser({ body: { userId: id } });
        }
    }

    return Response.json({ success: true });
}
```

## Permissions & Security

### Route Protection

```typescript
// src/app/(portals)/admin/users/layout.tsx
export default async function UsersLayout({ children }) {
    const session = await getServerSession();
    const userRole = session.user.role;

    // Only admin and reception can access user management
    if (!["admin", "reception"].includes(userRole)) {
        redirect("/client");
    }

    return children;
}
```

### Permission Utility

```typescript
// src/lib/permissions.ts
export function canManageUserRole(
    currentUserRole: string,
    targetUserRole: string
): boolean {
    // Admin can manage everyone
    if (currentUserRole === "admin") return true;

    // Reception can only manage clients
    if (currentUserRole === "reception" && targetUserRole === "client") {
        return true;
    }

    return false;
}
```

### Better Auth Admin Client

```typescript
// src/lib/auth-client.ts
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    plugins: [
        adminClient()
    ]
});
```

### Security Measures

- Never expose temporary passwords in API responses
- Rate limit user creation endpoint
- Log all role changes for audit trail
- Validate email format and domains
- Prevent self-demotion (admin can't demote themselves)
- Protect last admin (can't deactivate last admin account)

## Edge Cases

### 1. Duplicate Email Prevention
- Better Auth handles automatically
- Show friendly error: "Email already exists"

### 2. Self-Demotion Prevention
- Admin cannot demote themselves or deactivate own account
- Check: `if (targetUserId === session.user.id && role !== "admin")`

### 3. Last Admin Protection
- Cannot deactivate or demote the last admin
- Query admin count before allowing changes

### 4. Email Delivery Failures
- Wrap password reset email in try-catch
- If fails, still create user but show warning
- Log failure for admin follow-up

### 5. Banned User Login Attempt
- Better Auth blocks automatically
- Show: "Account inactive. Contact administrator."

## Testing Checklist

**Manual Testing:**
- [ ] Admin creates users with all roles (client, therapist, reception, admin)
- [ ] Reception creates only client users
- [ ] Reception cannot access edit page for non-clients (403)
- [ ] Edit email triggers new verification email
- [ ] Inactive users cannot log in
- [ ] Password reset links work within 24 hours
- [ ] Role changes apply immediately
- [ ] Admin cannot deactivate own account
- [ ] Cannot deactivate last admin account
- [ ] Status toggle works (ban/unban)

**Build Verification:**
- [ ] Run `bun run build` - no TypeScript errors
- [ ] All routes compile successfully

## Future Enhancements (Out of Scope)

- Bulk user import via CSV
- User activity logs/audit trail
- Custom password policies (length, complexity)
- Two-factor authentication management
- User search and filtering
- Export user list to CSV

## Summary

This design leverages Better Auth's admin plugin for secure, native user management with minimal custom code. Key features:

✅ Create users with role-based permissions
✅ Edit all user fields including role
✅ Soft delete via ban/unban
✅ Automatic password reset flow
✅ Email verification on email changes
✅ Admin and reception role restrictions

All functionality uses Better Auth's tested, secure APIs rather than custom implementations.

## References

- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [Better Auth User Management](https://www.better-auth.com/docs/concepts/users-accounts)
- [Force Password Reset Feature Request](https://github.com/better-auth/better-auth/issues/2324)
