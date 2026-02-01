import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { headers } from "next/headers";
import type { AuthSession } from "@/types/auth";

export type UserRole = "client" | "therapist" | "admin" | "reception";

export async function getServerSession(): Promise<AuthSession | null> {
    const headersList = await headers();
    return auth.api.getSession({ headers: headersList }) as Promise<AuthSession | null>;
}

export async function requireAuth(allowedRoles?: UserRole[]) {
    const session = await getServerSession();

    if (!session) {
        return { error: "Unauthorized", redirect: "/auth/login" };
    }

    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(session.user.role)) {
            return { error: "Forbidden", redirect: "/" };
        }
    }

    return { session };
}

export async function requireAuthAPI(
    request: NextRequest,
    allowedRoles?: UserRole[]
) {
    const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    }

    return { session };
}
