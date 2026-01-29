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
        let createdUser;
        try {
            createdUser = await auth.api.createUser({
                body: {
                    email,
                    name,
                    password: tempPassword,
                    role,
                    data: {
                        phone: phone || null,
                        timezone: timezone || "Asia/Kolkata",
                    }
                },
                headers: request.headers
            });
        } catch (createError: any) {
            console.error("Create user error:", createError);
            return NextResponse.json(
                { error: createError.message || "Failed to create user" },
                { status: 400 }
            );
        }

        // 7. Send password reset email using sendResetPassword
        // Note: Better Auth will automatically trigger the sendResetPassword callback
        // configured in auth.ts when we call the internal reset password flow
        try {
            // Use the emailAndPassword plugin's built-in password reset
            // Since this is a new user, we can trigger the reset flow directly
            const resetUrl = `${process.env.BETTER_AUTH_URL}/api/auth/forget-password`;
            await fetch(resetUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });
        } catch (emailError) {
            console.error("Password reset email error:", emailError);
            // Don't fail the request if email fails
            return NextResponse.json({
                success: true,
                user: createdUser,
                warning: "User created but password reset email failed to send"
            });
        }

        return NextResponse.json({
            success: true,
            user: createdUser
        });
    } catch (error) {
        console.error("Create user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
