import { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
    title: "Forgot Password | Mindweal by Pihu Suri",
    description: "Reset your Mindweal account password.",
};

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f0fdf9] to-[#ecfdf5] flex items-center justify-center py-12 px-4">
            <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
                <ForgotPasswordForm />
            </Suspense>
        </div>
    );
}
