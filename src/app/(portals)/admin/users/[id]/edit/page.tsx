import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-middleware";
import { AppDataSource } from "@/lib/db";
import { User, type UserRole } from "@/entities/User";
import { canManageUserRole } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import EditUserForm from "./EditUserForm";

export const metadata: Metadata = {
    title: "Edit User | Admin | Mindweal by Pihu Suri",
    description: "Edit user account",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getUser(id: string) {
    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);
    return userRepo.findOne({ where: { id } });
}

async function getUserBanStatus(id: string) {
    const userListResult = await auth.api.listUsers({
        query: {
            limit: 1,
            filterField: "id",
            filterValue: id,
            filterOperator: "eq"
        }
    });

    const user = userListResult.users?.find((u: any) => u.id === id);
    return user?.banned || false;
}

export default async function EditUserPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getServerSession();
    const currentUserRole = (session?.user as any)?.role as UserRole | undefined;

    const { id } = await params;
    const user = await getUser(id);

    if (!user) {
        notFound();
    }

    // Check permissions
    if (!canManageUserRole(currentUserRole, user.role)) {
        redirect("/admin/users");
    }

    const isBanned = await getUserBanStatus(id);

    return (
        <div className="max-w-2xl">
            <div className="mb-4">
                <h1 className="portal-title">Edit User</h1>
                <p className="text-gray-600 text-sm">
                    Update user account details and permissions
                </p>
            </div>

            <EditUserForm
                user={{
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    phone: user.phone || "",
                    timezone: user.timezone,
                    active: !isBanned,
                }}
                currentUserRole={currentUserRole}
                currentUserId={session?.user.id || ""}
            />
        </div>
    );
}
