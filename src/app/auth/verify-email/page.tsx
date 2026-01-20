"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Suspense } from "react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function verifyEmail() {
            if (!token) {
                setStatus("error");
                setError("Invalid or missing verification token");
                return;
            }

            try {
                const result = await authClient.verifyEmail({ query: { token } });

                if (result.error) {
                    setStatus("error");
                    setError(result.error.message || "Verification failed");
                    return;
                }

                setStatus("success");
            } catch (err) {
                setStatus("error");
                setError("An unexpected error occurred");
                console.error("Email verification error:", err);
            }
        }

        verifyEmail();
    }, [token]);

    if (status === "loading") {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">Verifying your email...</h2>
                <p className="text-gray-600 mt-2">Please wait a moment.</p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-6">
                    {error || "The verification link is invalid or has expired."}
                </p>
                <Link href="/auth/login" className="btn btn-primary">
                    Back to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
                Your email has been successfully verified. You can now sign in to your account.
            </p>
            <Link href="/auth/login" className="btn btn-primary">
                Sign In
            </Link>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f0fdf9] to-[#ecfdf5] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md mx-auto">
                <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}
