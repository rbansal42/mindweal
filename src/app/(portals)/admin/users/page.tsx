import { Metadata } from "next";
import { format } from "date-fns";
import { UserCircle, Plus } from "lucide-react";
import Link from "next/link";
import { AppDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { getServerSession } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Users | Admin | Mindweal by Pihu Suri",
    description: "Manage user accounts",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getUsers() {
    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);

    return userRepo.find({
        order: { createdAt: "DESC" },
    });
}

async function getUserBanStatus() {
    // Query database directly for ban status
    // Better Auth stores ban status in the users table
    const ds = await getDataSource();
    const result = await ds.query(
        `SELECT id FROM users WHERE banned = true`
    );

    const bannedUserIds = new Set(
        result.map((row: any) => row.id)
    );

    return bannedUserIds;
}

const roleColors = {
    client: "bg-blue-100 text-blue-800",
    therapist: "bg-green-100 text-green-800",
    admin: "bg-red-100 text-red-800",
    reception: "bg-yellow-100 text-yellow-800",
};

export default async function UsersPage() {
    const session = await getServerSession();
    const userRole = (session?.user as any)?.role;

    const users = await getUsers();
    const bannedUserIds = await getUserBanStatus();

    // Stats
    const stats = {
        total: users.length,
        clients: users.filter((u) => u.role === "client").length,
        therapists: users.filter((u) => u.role === "therapist").length,
        admins: users.filter((u) => u.role === "admin").length,
        reception: users.filter((u) => u.role === "reception").length,
        active: users.filter((u) => !bannedUserIds.has(u.id)).length,
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="portal-title">Users</h1>
                    <p className="text-gray-600 text-sm">
                        Manage user accounts and permissions
                    </p>
                </div>
                <Link href="/admin/users/new" className="btn-primary text-sm">
                    <Plus className="w-4 h-4" />
                    {userRole === "reception" ? "Create Client" : "Create User"}
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                <div className="portal-card p-3">
                    <p className="text-gray-500 text-xs">Total</p>
                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="portal-card p-3">
                    <p className="text-green-600 text-xs">Active</p>
                    <p className="text-xl font-bold text-green-700">{stats.active}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-blue-600 text-xs">Clients</p>
                    <p className="text-xl font-bold text-blue-700">{stats.clients}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-green-600 text-xs">Therapists</p>
                    <p className="text-xl font-bold text-green-700">{stats.therapists}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-red-600 text-xs">Admins</p>
                    <p className="text-xl font-bold text-red-700">{stats.admins}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-yellow-600 text-xs">Reception</p>
                    <p className="text-xl font-bold text-yellow-700">{stats.reception}</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="portal-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Verified</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center">
                                        <UserCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const isBanned = bannedUserIds.has(user.id);
                                    const canEdit =
                                        userRole === "admin" ||
                                        (userRole === "reception" && user.role === "client");

                                    return (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {user.image ? (
                                                        <img
                                                            src={user.image}
                                                            alt={user.name}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-600 text-sm font-medium">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-gray-900 text-sm">
                                                        {user.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-gray-600 text-sm">{user.email}</span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                        roleColors[user.role as keyof typeof roleColors]
                                                    }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                {isBanned ? (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        Inactive
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {user.emailVerified ? (
                                                    <span className="text-green-600 text-xs">
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="text-yellow-600 text-xs">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="text-gray-500 text-xs">
                                                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                                                </span>
                                            </td>
                                            <td>
                                                {canEdit ? (
                                                    <Link
                                                        href={`/admin/users/${user.id}/edit`}
                                                        className="text-primary hover:text-primary-dark text-sm font-medium"
                                                    >
                                                        Edit
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
