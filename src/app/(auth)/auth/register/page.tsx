import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
    title: "Create Account | Mindweal by Pihu Suri",
    description: "Create your Mindweal account to book therapy sessions and manage appointments.",
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f0fdf9] to-[#ecfdf5] flex items-center justify-center py-12 px-4">
            <RegisterForm />
        </div>
    );
}
