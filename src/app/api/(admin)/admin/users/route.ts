import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";
import { canManageUserRole } from "@/lib/permissions";
import { AppDataSource } from "@/lib/db";
import { VerificationToken } from "@/entities/VerificationToken";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

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

        // 7. Create password reset token and send email
        try {
            const ds = await getDataSource();
            const tokenRepo = ds.getRepository(VerificationToken);

            // Generate token
            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Save token
            const verificationToken = tokenRepo.create({
                identifier: email,
                token,
                type: "password_reset",
                expiresAt,
            });
            await tokenRepo.save(verificationToken);

            // Send email
            const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
            await sendEmail({
                to: email,
                subject: "Set your password",
                template: "PasswordReset",
                data: {
                    name,
                    resetUrl,
                },
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
