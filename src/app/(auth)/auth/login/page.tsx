import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
    title: "Sign In | Mindweal by Pihu Suri",
    description: "Sign in to your Mindweal account to manage your therapy appointments.",
};

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f0fdf9] to-[#ecfdf5] flex items-center justify-center py-12 px-4">
            <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
