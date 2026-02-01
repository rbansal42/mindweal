import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { canManageUserRole } from "@/lib/permissions";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { createUserSchema } from "@/lib/validation";
import crypto from "crypto";
import { Not } from "typeorm";

export async function GET(request: NextRequest) {
    try {
        // 1. Auth check
        const session = await getServerSession() as AuthSession | null;
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Role check
        if (!["admin", "reception"].includes(session.user.role)) {
            return NextResponse.json(
                { error: "Forbidden - insufficient permissions" },
                { status: 403 }
            );
        }

        // 3. Get all users except clients
        const ds = await getDataSource();
        const users = await ds.getRepository(User).find({
            where: { role: Not("client") },
            order: { createdAt: "DESC" }
        });

        return NextResponse.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Get users error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // 1. Check session and role
        const session = await getServerSession() as AuthSession | null;
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!["admin", "reception"].includes(session.user.role)) {
            return NextResponse.json(
                { error: "Forbidden - insufficient permissions" },
                { status: 403 }
            );
        }

        // 2. Parse and validate request body
        const body = await request.json();
        const validated = createUserSchema.safeParse(body);
        
        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const { email, name, role, phone, timezone } = validated.data;

        // 4. Validate permissions
        if (!canManageUserRole(session.user.role, role)) {
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
                    role: role as "admin" | "user", // Cast for Better Auth (actual role stored via DB)
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

        // 6b. Update phone and timezone in database
        try {
            const ds = await getDataSource();
            const userRepo = ds.getRepository(User);
            const user = await userRepo.findOne({ where: { id: createdUser.user.id } });

            if (user) {
                user.phone = phone || null;
                user.timezone = timezone || "Asia/Kolkata";
                await userRepo.save(user);
            }
        } catch (updateError) {
            console.error("Update phone/timezone error:", updateError);
            // Don't fail the request if this update fails
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
