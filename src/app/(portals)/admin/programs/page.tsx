"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Filter } from "lucide-react";
import { ContentTable } from "@/components/admin/ContentTable";

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
        <div className="space-y-3">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="portal-title">Programs</h1>
                    <p className="text-gray-600 text-sm">
                        Manage therapy and wellness programs
                    </p>
                </div>
                <Link
                    href="/admin/programs/new"
                    className="portal-btn portal-btn-primary portal-btn-sm flex items-center gap-1.5"
                >
                    <Plus className="w-4 h-4" /> New Program
                </Link>
            </div>

            {/* Filter */}
            <div className="portal-card p-3">
                <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <label htmlFor="status-filter" className="portal-label">
                        Status:
                    </label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "" | "draft" | "published")}
                        className="portal-input py-1.5 px-2 text-sm w-auto"
                    >
                        <option value="">All</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="portal-card">
                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="mt-3 text-gray-500 text-sm">Loading programs...</p>
                    </div>
                ) : programs.length === 0 ? (
                    <div className="p-6 text-center">
                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No programs found</p>
                        <Link
                            href="/admin/programs/new"
                            className="text-[var(--primary-teal)] hover:underline mt-1.5 inline-block text-sm"
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
