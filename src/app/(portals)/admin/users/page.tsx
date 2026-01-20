import { Metadata } from "next";
import { format } from "date-fns";
import { UserCircle, Mail, Shield } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { User } from "@/entities/User";

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

const roleColors = {
    client: "bg-blue-100 text-blue-800",
    therapist: "bg-green-100 text-green-800",
    admin: "bg-red-100 text-red-800",
    reception: "bg-yellow-100 text-yellow-800",
};

export default async function UsersPage() {
    const users = await getUsers();

    // Stats
    const stats = {
        total: users.length,
        clients: users.filter((u) => u.role === "client").length,
        therapists: users.filter((u) => u.role === "therapist").length,
        admins: users.filter((u) => u.role === "admin").length,
        reception: users.filter((u) => u.role === "reception").length,
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-600 mt-1">
                    View and manage user accounts
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-500 text-sm">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-blue-600 text-sm">Clients</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.clients}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-green-600 text-sm">Therapists</p>
                    <p className="text-2xl font-bold text-green-700">{stats.therapists}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-red-600 text-sm">Admins</p>
                    <p className="text-2xl font-bold text-red-700">{stats.admins}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                    <p className="text-yellow-600 text-sm">Reception</p>
                    <p className="text-2xl font-bold text-yellow-700">{stats.reception}</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                                    User
                                </th>
                                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                                    Email
                                </th>
                                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                                    Role
                                </th>
                                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                                    Verified
                                </th>
                                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-600 font-medium">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-900">
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600">{user.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                                    roleColors[user.role as keyof typeof roleColors]
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.emailVerified ? (
                                                <span className="text-green-600 text-sm">
                                                    ✓ Verified
                                                </span>
                                            ) : (
                                                <span className="text-yellow-600 text-sm">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-500 text-sm">
                                                {format(new Date(user.createdAt), "MMM d, yyyy")}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
