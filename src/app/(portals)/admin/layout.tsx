import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-middleware";
import type { AuthSession } from "@/types/auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession() as AuthSession | null;

    if (!session) {
        redirect("/auth/login?callbackUrl=/admin");
    }

    // Check if user is admin or reception
    const userRole = session.user.role;
    if (userRole !== "admin" && userRole !== "reception") {
        redirect("/client");
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex h-screen">
                <AdminSidebar user={session.user} role={userRole} />
                <main className="flex-1 p-3 lg:p-4 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
