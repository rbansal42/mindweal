import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
    title: "Reset Password | Mindweal by Pihu Suri",
    description: "Set a new password for your Mindweal account.",
};

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f0fdf9] to-[#ecfdf5] flex items-center justify-center py-12 px-4">
            <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
