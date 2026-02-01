"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Plus, Users } from "lucide-react";

interface TeamMember {
    id: string;
    name: string;
    slug: string;
    role: string;
    qualifications: string | null;
    photoUrl: string | null;
    email: string | null;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function TeamMembersPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTeamMembers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/team-members");
            if (!res.ok) throw new Error("Failed to fetch team members");
            const data = await res.json();
            setTeamMembers(data.teamMembers);
        } catch (error) {
            console.error("Error fetching team members:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeamMembers();
    }, [fetchTeamMembers]);

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const res = await fetch(`/api/admin/team-members/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive }),
            });
            if (!res.ok) throw new Error("Failed to update team member");
            await fetchTeamMembers();
        } catch (error) {
            console.error("Error updating team member:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this team member?")) return;
        try {
            const res = await fetch(`/api/admin/team-members/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete team member");
            await fetchTeamMembers();
        } catch (error) {
            console.error("Error deleting team member:", error);
        }
    };

    return (
        <div className="space-y-3">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="portal-title">Team Members</h1>
                    <p className="text-gray-600 text-sm">
                        Manage your team profiles displayed on the website
                    </p>
                </div>
                <Link
                    href="/admin/team-members/new"
                    className="portal-btn portal-btn-primary portal-btn-sm flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" /> Add Team Member
                </Link>
            </div>

            {/* Table */}
            <div className="portal-card p-0">
                {loading ? (
                    <div className="portal-loading">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500 text-sm">Loading team members...</p>
                    </div>
                ) : teamMembers.length === 0 ? (
                    <div className="portal-empty">
                        <Users className="portal-empty-icon" />
                        <p className="text-gray-500 text-sm">No team members found</p>
                        <Link
                            href="/admin/team-members/new"
                            className="text-[var(--primary-teal)] hover:underline text-sm"
                        >
                            Add your first team member
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="portal-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Order</th>
                                    <th>Active</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.map((member) => (
                                    <tr key={member.id}>
                                        <td>
                                            <div className="flex items-center">
                                                {member.photoUrl ? (
                                                    <img
                                                        src={member.photoUrl}
                                                        alt={member.name}
                                                        className="h-8 w-8 rounded-full object-cover mr-2"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {member.name}
                                                    </div>
                                                    {member.email && (
                                                        <div className="text-xs text-gray-500">
                                                            {member.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-gray-900">{member.role}</div>
                                            {member.qualifications && (
                                                <div className="text-xs text-gray-500">
                                                    {member.qualifications}
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-gray-500">
                                            {member.displayOrder}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(member.id, !member.isActive)}
                                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
                                                    member.isActive ? "bg-teal-600" : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        member.isActive ? "translate-x-4" : "translate-x-0"
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="text-right space-x-2">
                                            <Link
                                                href={`/admin/team-members/${member.id}/edit`}
                                                className="text-teal-600 hover:text-teal-900 text-sm"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(member.id)}
                                                className="text-red-600 hover:text-red-900 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
