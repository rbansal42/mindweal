"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { ContentTable } from "@/components/admin/ContentTable";

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

    // Transform workshops for ContentTable with date column
    const workshopItems = workshops.map((w) => ({
        id: w.id,
        title: w.title,
        status: w.status,
        isActive: w.isActive,
        updatedAt: w.updatedAt,
        date: new Date(w.date),
    }));

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={fetchWorkshops}
                    className="mt-4 text-[var(--primary-teal)] hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Workshops</h1>
                    <p className="text-gray-600 mt-1">
                        Manage workshops and events
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter || ""}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border rounded-lg text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <Link
                        href="/admin/workshops/new"
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New Workshop
                    </Link>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-teal)]" />
                </div>
            ) : workshops.length === 0 ? (
                <div className="card p-8 text-center">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No workshops found</p>
                    <Link
                        href="/admin/workshops/new"
                        className="text-[var(--primary-teal)] hover:underline mt-2 inline-block"
                    >
                        Create your first workshop
                    </Link>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Active
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Updated
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {workshopItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {formatDate(item.date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    item.status === "published"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggleActive(
                                                        item.id,
                                                        !item.isActive
                                                    )
                                                }
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                                                    item.isActive
                                                        ? "bg-teal-600"
                                                        : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        item.isActive
                                                            ? "translate-x-5"
                                                            : "translate-x-0"
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(
                                                item.updatedAt
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
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
