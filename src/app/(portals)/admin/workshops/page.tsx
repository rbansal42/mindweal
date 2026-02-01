"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Calendar, Loader2 } from "lucide-react";

interface Workshop {
    id: string;
    title: string;
    slug: string;
    description: string;
    date: string;
    duration: string;
    capacity: number;
    coverImage: string | null;
    status: "draft" | "published";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function WorkshopsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const statusFilter = searchParams.get("status") as "draft" | "published" | null;

    const fetchWorkshops = async () => {
        setIsLoading(true);
        try {
            const url = statusFilter
                ? `/api/admin/workshops?status=${statusFilter}`
                : "/api/admin/workshops";
            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch workshops");
            }
            setWorkshops(data.workshops);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkshops();
    }, [statusFilter]);

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const res = await fetch(`/api/admin/workshops/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive }),
            });
            if (!res.ok) {
                throw new Error("Failed to update workshop");
            }
            await fetchWorkshops();
        } catch (err) {
            console.error("Error toggling active:", err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/workshops/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Failed to delete workshop");
            }
            await fetchWorkshops();
        } catch (err) {
            console.error("Error deleting:", err);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value) {
            router.push(`/admin/workshops?status=${value}`);
        } else {
            router.push("/admin/workshops");
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 text-sm">{error}</p>
                <button
                    onClick={fetchWorkshops}
                    className="mt-3 text-[var(--primary-teal)] hover:underline text-sm"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="portal-title">Workshops</h1>
                    <p className="text-gray-600 text-sm">
                        Manage workshops and events
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter || ""}
                        onChange={handleFilterChange}
                        className="portal-input py-1.5 px-2 text-sm w-auto"
                    >
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <Link
                        href="/admin/workshops/new"
                        className="portal-btn portal-btn-primary portal-btn-sm flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> New Workshop
                    </Link>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--primary-teal)]" />
                </div>
            ) : workshops.length === 0 ? (
                <div className="portal-card p-6 text-center">
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No workshops found</p>
                    <Link
                        href="/admin/workshops/new"
                        className="text-[var(--primary-teal)] hover:underline mt-1.5 inline-block text-sm"
                    >
                        Create your first workshop
                    </Link>
                </div>
            ) : (
                <div className="portal-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="portal-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Active</th>
                                    <th>Updated</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workshops.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="font-medium text-gray-900">
                                                {item.title}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-gray-600">
                                                {formatDate(item.date)}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`px-1.5 py-0.5 inline-flex text-xs font-medium rounded ${
                                                    item.status === "published"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggleActive(
                                                        item.id,
                                                        !item.isActive
                                                    )
                                                }
                                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
                                                    item.isActive
                                                        ? "bg-teal-600"
                                                        : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        item.isActive
                                                            ? "translate-x-4"
                                                            : "translate-x-0"
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="text-gray-500">
                                            {new Date(
                                                item.updatedAt
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="text-right space-x-2">
                                            <Link
                                                href={`/admin/workshops/${item.id}/edit`}
                                                className="text-teal-600 hover:text-teal-900"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            "Are you sure you want to delete this workshop?"
                                                        )
                                                    ) {
                                                        handleDelete(item.id);
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
