import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { headers } from "next/headers";

export type UserRole = "client" | "therapist" | "admin" | "reception";

export async function getServerSession() {
    const headersList = await headers();
    return auth.api.getSession({ headers: headersList });
}

export async function requireAuth(allowedRoles?: UserRole[]) {
    const session = await getServerSession();

    if (!session) {
        return { error: "Unauthorized", redirect: "/auth/login" };
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = (session.user as any).role as UserRole;
        if (!allowedRoles.includes(userRole)) {
            return { error: "Forbidden", redirect: "/" };
        }
    }

    return { session };
}

export async function requireAuthAPI(
    request: NextRequest,
    allowedRoles?: UserRole[]
) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = (session.user as any).role as UserRole;
        if (!allowedRoles.includes(userRole)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    }

    return { session };
}
