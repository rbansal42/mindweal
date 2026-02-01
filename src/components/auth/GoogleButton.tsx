"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import { GoogleIcon } from "@/components/icons";

interface GoogleButtonProps {
    callbackURL?: string;
}

export default function GoogleButton({ callbackURL }: GoogleButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn.social({
                provider: "google",
                // callbackURL is optional - Better Auth hook handles role-based redirect
                ...(callbackURL && { callbackURL }),
            });
        } catch (error) {
            console.error("Google sign-in error:", error);
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <GoogleIcon size={20} />
            {isLoading ? "Signing in..." : "Continue with Google"}
        </button>
    );
}
