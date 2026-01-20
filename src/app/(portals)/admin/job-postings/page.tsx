"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Briefcase, MapPin, Clock } from "lucide-react";
import { ContentTable } from "@/components/admin/ContentTable";

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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchJobPostings}
                    className="mt-2 text-sm text-red-700 underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Job Postings</h1>
                    <p className="text-gray-600 mt-1">
                        Manage career opportunities
                    </p>
                </div>
                <Link
                    href="/admin/job-postings/new"
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> New Job Posting
                </Link>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                    Filter by status:
                </label>
                <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                >
                    <option value="all">All</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {jobPostings.length === 0 ? (
                    <div className="p-8 text-center">
                        <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No job postings found</p>
                        <Link
                            href="/admin/job-postings/new"
                            className="text-[var(--primary-teal)] hover:underline mt-2 inline-block"
                        >
                            Create your first job posting
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
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
                                {jobPostings.map((job) => (
                                    <tr key={job.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {job.title}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {job.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">
                                                {job.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                <Clock className="w-3 h-3" />
                                                {typeLabels[job.type]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    job.status === "published"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(job.id, !job.isActive)}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                                                    job.isActive ? "bg-teal-600" : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        job.isActive ? "translate-x-5" : "translate-x-0"
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(job.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Link
                                                href={`/admin/job-postings/${job.id}/edit`}
                                                className="text-teal-600 hover:text-teal-900"
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
                )}
            </div>
        </div>
    );
}
