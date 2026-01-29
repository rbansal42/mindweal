import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-middleware";
import { canAccessUserManagement } from "@/lib/permissions";

export default async function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/login?callbackUrl=/admin/users");
    }

    const userRole = (session.user as any).role;

    // Only admin and reception can access user management
    if (!canAccessUserManagement(userRole)) {
        redirect("/client");
    }

    return <>{children}</>;
}
