"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Filter } from "lucide-react";
import { ContentTable } from "@/components/admin/ContentTable";

interface CommunityProgram {
    id: string;
    name: string;
    slug: string;
    description: string;
    schedule: string;
    coverImage: string | null;
    status: "draft" | "published";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function CommunityProgramsPage() {
    const router = useRouter();
    const [programs, setPrograms] = useState<CommunityProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const fetchPrograms = useCallback(async () => {
        try {
            setLoading(true);
            const url = statusFilter === "all"
                ? "/api/admin/community-programs"
                : `/api/admin/community-programs?status=${statusFilter}`;

            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch community programs");
            }

            setPrograms(data.programs);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms]);

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const res = await fetch(`/api/admin/community-programs/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update");
            }

            // Refresh the list
            fetchPrograms();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/community-programs/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete");
            }

            // Refresh the list
            fetchPrograms();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="text-gray-500 text-sm">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="text-red-500 text-sm">{error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="portal-title">Community Programs</h1>
                    <p className="text-gray-600 text-sm">
                        Manage community programs and workshops
                    </p>
                </div>
                <Link
                    href="/admin/community-programs/new"
                    className="portal-btn portal-btn-primary flex items-center gap-1.5"
                >
                    <Plus className="w-4 h-4" /> New Program
                </Link>
            </div>

            {/* Filter */}
            <div className="portal-card p-3">
                <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <label className="portal-label">Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="portal-input py-1 w-auto"
                    >
                        <option value="all">All</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="portal-card">
                <ContentTable
                    items={programs.map(p => ({
                        id: p.id,
                        name: p.name,
                        status: p.status,
                        isActive: p.isActive,
                        updatedAt: p.updatedAt,
                    }))}
                    basePath="/admin/community-programs"
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                    titleField="name"
                />
            </div>
        </div>
    );
}
