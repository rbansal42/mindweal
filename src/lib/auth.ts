import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { createAuthMiddleware } from "better-auth/api";
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
                input: true,
            },
            timezone: {
                type: "string",
                defaultValue: "Asia/Kolkata",
                input: true,
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
                // Security: Validate callbackUrl is a safe internal path (prevent open redirect)
                const isSafeRedirect = callbackUrl.startsWith("/") && 
                                       !callbackUrl.startsWith("//") && 
                                       !callbackUrl.includes("://");
                if (isSafeRedirect) {
                    throw ctx.redirect(callbackUrl);
                }
                // Invalid callbackUrl ignored - fall through to role-based redirect
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
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
