import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { authConfig } from "@/config";

export const authClient = createAuthClient({
    baseURL: authConfig.baseUrl,
    plugins: [adminClient()],
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;
