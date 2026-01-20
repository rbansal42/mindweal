"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Filter } from "lucide-react";
import { ContentTable } from "@/components/admin/ContentTable";
import { useRouter } from "next/navigation";

interface Program {
    id: string;
    title: string;
    slug: string;
    description: string;
    duration: string;
    coverImage: string | null;
    benefits: string[] | null;
    status: "draft" | "published";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function ProgramsPage() {
    const router = useRouter();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<"" | "draft" | "published">("");

    const fetchPrograms = useCallback(async () => {
        setLoading(true);
        try {
            const url = statusFilter
                ? `/api/admin/programs?status=${statusFilter}`
                : "/api/admin/programs";
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch programs");
            const data = await res.json();
            setPrograms(data.programs);
        } catch (error) {
            console.error("Error fetching programs:", error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms]);

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const res = await fetch(`/api/admin/programs/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive }),
            });
            if (!res.ok) throw new Error("Failed to update program");
            await fetchPrograms();
        } catch (error) {
            console.error("Error updating program:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/programs/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete program");
            await fetchPrograms();
        } catch (error) {
            console.error("Error deleting program:", error);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Programs</h1>
                    <p className="text-gray-600 mt-1">
                        Manage therapy and wellness programs
                    </p>
                </div>
                <Link
                    href="/admin/programs/new"
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> New Program
                </Link>
            </div>

            {/* Filter */}
            <div className="card p-4">
                <div className="flex items-center gap-4">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                        Status:
                    </label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "" | "draft" | "published")}
                        className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                    >
                        <option value="">All</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading programs...</p>
                    </div>
                ) : programs.length === 0 ? (
                    <div className="p-8 text-center">
                        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No programs found</p>
                        <Link
                            href="/admin/programs/new"
                            className="text-[var(--primary-teal)] hover:underline mt-2 inline-block"
                        >
                            Create your first program
                        </Link>
                    </div>
                ) : (
                    <ContentTable
                        items={programs}
                        basePath="/admin/programs"
                        onToggleActive={handleToggleActive}
                        onDelete={handleDelete}
                        titleField="title"
                    />
                )}
            </div>
        </div>
    );
}
