import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
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
        expiresIn: authConfig.session.expiresIn,
        updateAge: authConfig.session.updateAge,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
        },
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "client",
                input: false,
            },
            phone: {
                type: "string",
                required: false,
            },
            timezone: {
                type: "string",
                defaultValue: "Asia/Kolkata",
            },
        },
    },

    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google"],
        },
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
