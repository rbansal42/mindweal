import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-middleware";
import type { AuthSession } from "@/types/auth";
import { canAccessUserManagement } from "@/lib/permissions";

export default async function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession() as AuthSession | null;

    if (!session) {
        redirect("/auth/login?callbackUrl=/admin/users");
    }

    const userRole = session.user.role;

    // Only admin and reception can access user management
    if (!canAccessUserManagement(userRole)) {
        redirect("/client");
    }

    return <>{children}</>;
}
