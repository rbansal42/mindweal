import type { UserRole } from "@/entities/User";

/**
 * Typed user object from Better Auth session.
 * Use this instead of casting to `any` for type safety.
 */
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string | null;
    timezone: string;
    emailVerified?: Date | null;
    image?: string | null;
    therapistId?: string | null;
}

/**
 * Typed session object from Better Auth.
 * Use this to type-check session data in API routes.
 * 
 * @example
 * const session = await auth.api.getSession({ headers }) as AuthSession | null;
 * if (session?.user.role === "admin") { ... }
 */
export interface AuthSession {
    user: AuthUser;
    session: {
        id: string;
        userId: string;
        expiresAt: Date;
    };
}
