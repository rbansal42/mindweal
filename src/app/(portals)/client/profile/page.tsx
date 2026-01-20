import { Metadata } from "next";
import { getServerSession } from "@/lib/auth-middleware";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = {
    title: "Profile | Client Portal | Mindweal by Pihu Suri",
    description: "Manage your profile settings",
};

export default async function ProfilePage() {
    const session = await getServerSession();
    if (!session) return null;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">
                    Manage your account information and preferences
                </p>
            </div>

            <ProfileForm user={session.user as any} />
        </div>
    );
}
