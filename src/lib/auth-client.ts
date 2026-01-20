import { createAuthClient } from "better-auth/react";
import { authConfig } from "@/config";

export const authClient = createAuthClient({
    baseURL: authConfig.baseUrl,
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;
