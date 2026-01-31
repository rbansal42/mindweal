# Role-Based Login Redirects Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** After login, redirect users to their appropriate portal based on their role (admin/reception → /admin, therapist → /therapist, client → /client).

**Architecture:** Add a Better Auth `after` hook in `auth.ts` that intercepts successful logins and redirects based on user role. This handles both email/password and Google OAuth flows server-side.

**Tech Stack:** Better Auth hooks, createAuthMiddleware from better-auth/api

---

## Task 1: Add Better Auth After Hook for Role-Based Redirects

**Files:**
- Modify: `src/lib/auth.ts`

**Step 1: Add the createAuthMiddleware import**

At the top of `src/lib/auth.ts`, add:

```typescript
import { createAuthMiddleware } from "better-auth/api";
```

**Step 2: Add the hooks configuration to betterAuth config**

After the `plugins` array (around line 114), add the `hooks` configuration:

```typescript
    plugins: [
        admin({
            defaultRole: "client",
        }),
    ],

    // Role-based redirect after successful login
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            // Only handle sign-in related paths
            const signInPaths = ["/sign-in/email", "/callback/google", "/sign-in/social"];
            if (!signInPaths.some(path => ctx.path.startsWith(path))) {
                return;
            }

            // Check if a new session was created (successful login)
            const newSession = ctx.context.newSession;
            if (!newSession) {
                return;
            }

            // Check for explicit callbackUrl in query params (from protected routes)
            const callbackUrl = ctx.query?.callbackUrl as string | undefined;
            if (callbackUrl && callbackUrl !== "/client") {
                // Respect explicit redirects from protected routes
                throw ctx.redirect(callbackUrl);
            }

            // Role-based redirect
            const role = (newSession.user as any).role || "client";
            const roleRedirects: Record<string, string> = {
                admin: "/admin",
                reception: "/admin",
                therapist: "/therapist",
                client: "/client",
            };

            const redirectTo = roleRedirects[role] || "/client";
            throw ctx.redirect(redirectTo);
        }),
    },
```

**Step 3: Verify build passes**

Run: `bun run build`
Expected: Build completes successfully

**Step 4: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: add role-based redirect hook after login"
```

---

## Task 2: Update LoginForm to Remove Hardcoded Redirect

**Files:**
- Modify: `src/components/auth/LoginForm.tsx`

**Step 1: Update the callbackUrl default**

Change line 22 from:
```typescript
const callbackUrl = searchParams.get("callbackUrl") || "/client";
```

To:
```typescript
const callbackUrl = searchParams.get("callbackUrl");
```

**Step 2: Update the redirect logic after login**

The `signIn.email()` function doesn't return control to our code after Better Auth's hook redirects. However, if the hook fails or for any edge case, we should handle it.

Update the onSubmit function (around line 50) from:
```typescript
router.push(callbackUrl);
router.refresh();
```

To:
```typescript
// Server-side Better Auth hook handles redirect based on role
// This is a fallback in case the hook doesn't redirect
if (callbackUrl) {
    router.push(callbackUrl);
} else {
    router.push("/client"); // Fallback, should not reach here normally
}
router.refresh();
```

**Step 3: Verify build passes**

Run: `bun run build`
Expected: Build completes successfully

**Step 4: Commit**

```bash
git add src/components/auth/LoginForm.tsx
git commit -m "refactor: remove hardcoded /client redirect from LoginForm"
```

---

## Task 3: Update GoogleButton to Remove Hardcoded Default

**Files:**
- Modify: `src/components/auth/GoogleButton.tsx`

**Step 1: Update the default prop**

Change line 11 from:
```typescript
export default function GoogleButton({ callbackURL = "/client" }: GoogleButtonProps) {
```

To:
```typescript
export default function GoogleButton({ callbackURL }: GoogleButtonProps) {
```

**Step 2: Update the signIn.social call**

The `callbackURL` prop may now be undefined, which is fine - Better Auth's hook will handle the redirect.

Change line 17-20 from:
```typescript
await signIn.social({
    provider: "google",
    callbackURL,
});
```

To:
```typescript
await signIn.social({
    provider: "google",
    // callbackURL is optional - Better Auth hook handles role-based redirect
    ...(callbackURL && { callbackURL }),
});
```

**Step 3: Verify build passes**

Run: `bun run build`
Expected: Build completes successfully

**Step 4: Commit**

```bash
git add src/components/auth/GoogleButton.tsx
git commit -m "refactor: remove hardcoded /client default from GoogleButton"
```

---

## Task 4: Final Verification and Summary Commit

**Step 1: Run full build**

Run: `bun run build`
Expected: Build completes successfully with no errors

**Step 2: Run lint**

Run: `bun run lint`
Expected: No lint errors

**Step 3: Create summary commit if needed**

If any additional cleanup was done, commit it.

---

## Testing Checklist (Manual)

After deployment, verify these scenarios:

1. **Admin login via email at /auth/login** → Should redirect to `/admin`
2. **Therapist login via email at /auth/login** → Should redirect to `/therapist`
3. **Client login via email at /auth/login** → Should redirect to `/client`
4. **Admin tries to access /admin (not logged in)** → Redirected to login → After login, back to `/admin`
5. **Google OAuth for admin** → Should redirect to `/admin`
6. **Google OAuth for client** → Should redirect to `/client`

---

## Rollback Plan

If issues arise, the fix is isolated to three files:
1. Revert `src/lib/auth.ts` - remove the `hooks` block
2. Revert `src/components/auth/LoginForm.tsx` - restore `|| "/client"` default
3. Revert `src/components/auth/GoogleButton.tsx` - restore `= "/client"` default
