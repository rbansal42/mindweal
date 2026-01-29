"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Briefcase, MapPin, Clock } from "lucide-react";

interface JobPosting {
    id: string;
    title: string;
    slug: string;
    department: string;
    location: string;
    type: "full-time" | "part-time" | "contract";
    status: "draft" | "published";
    isActive: boolean;
    updatedAt: string;
}

const typeLabels: Record<string, string> = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    "contract": "Contract",
};

export default function JobPostingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const statusFilter = searchParams.get("status") || "all";

    const fetchJobPostings = useCallback(async () => {
        try {
            setLoading(true);
            const url = statusFilter === "all"
                ? "/api/admin/job-postings"
                : `/api/admin/job-postings?status=${statusFilter}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch job postings");
            }

            setJobPostings(data.jobPostings);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchJobPostings();
    }, [fetchJobPostings]);

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const response = await fetch(`/api/admin/job-postings/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive }),
            });

            if (!response.ok) {
                throw new Error("Failed to update job posting");
            }

            // Refresh the list
            await fetchJobPostings();
        } catch (err) {
            console.error("Error toggling active status:", err);
            alert("Failed to update job posting");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/job-postings/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete job posting");
            }

            // Refresh the list
            await fetchJobPostings();
        } catch (err) {
            console.error("Error deleting job posting:", err);
            alert("Failed to delete job posting");
        }
    };

    const handleStatusFilter = (status: string) => {
        const params = new URLSearchParams(searchParams);
        if (status === "all") {
            params.delete("status");
        } else {
            params.set("status", status);
        }
        router.push(`/admin/job-postings?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
                <button
                    onClick={fetchJobPostings}
                    className="mt-1 text-xs text-red-700 underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="portal-title">Job Postings</h1>
                    <p className="text-gray-600 text-sm">
                        Manage career opportunities
                    </p>
                </div>
                <Link
                    href="/admin/job-postings/new"
                    className="portal-btn portal-btn-primary flex items-center gap-1.5"
                >
                    <Plus className="w-4 h-4" /> New Job
                </Link>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
                <label className="portal-label">
                    Filter by status:
                </label>
                <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="portal-input py-1 w-auto"
                >
                    <option value="all">All</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>

            {/* Table */}
            <div className="portal-card overflow-hidden">
                {jobPostings.length === 0 ? (
                    <div className="p-6 text-center">
                        <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No job postings found</p>
                        <Link
                            href="/admin/job-postings/new"
                            className="text-[var(--primary-teal)] hover:underline mt-1 inline-block text-sm"
                        >
                            Create your first job posting
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="portal-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Department</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Active</th>
                                    <th>Updated</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobPostings.map((job) => (
                                    <tr key={job.id}>
                                        <td>
                                            <div className="text-sm font-medium text-gray-900">
                                                {job.title}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                {job.location}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sm text-gray-700">
                                                {job.department}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                <Clock className="w-3 h-3" />
                                                {typeLabels[job.type]}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`px-1.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                                                    job.status === "published"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                                {job.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(job.id, !job.isActive)}
                                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
                                                    job.isActive ? "bg-teal-600" : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        job.isActive ? "translate-x-4" : "translate-x-0"
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="text-xs text-gray-500">
                                            {new Date(job.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="text-right text-sm space-x-2">
                                            <Link
                                                href={`/admin/job-postings/${job.id}/edit`}
                                                className="text-teal-600 hover:text-teal-900 text-xs"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this job posting?")) {
                                                        handleDelete(job.id);
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-900 text-xs"
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
