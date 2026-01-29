import { Metadata } from "next";
import { getServerSession } from "@/lib/auth-middleware";
import { UserRole } from "@/entities/User";
import CreateUserForm from "./CreateUserForm";

export const metadata: Metadata = {
    title: "Create User | Admin | Mindweal by Pihu Suri",
    description: "Create a new user account",
};

export default async function CreateUserPage() {
    const session = await getServerSession();
    const userRole = (session?.user as any)?.role as UserRole | undefined;

    return (
        <div className="max-w-2xl">
            <div className="mb-4">
                <h1 className="portal-title">
                    {userRole === "reception" ? "Create Client" : "Create User"}
                </h1>
                <p className="text-gray-600 text-sm">
                    Create a new user account. They will receive a password reset email.
                </p>
            </div>

            <CreateUserForm currentUserRole={userRole} />
        </div>
    );
}
