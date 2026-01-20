"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContentForm } from "@/components/admin/ContentForm";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditJobPostingPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [department, setDepartment] = useState("");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState("");
    const [location, setLocation] = useState("");
    const [type, setType] = useState<"full-time" | "part-time" | "contract">("full-time");
    const [status, setStatus] = useState<"draft" | "published">("draft");
    const [isActive, setIsActive] = useState(true);

    // Fetch existing job posting
    useEffect(() => {
        async function fetchJobPosting() {
            try {
                const response = await fetch(`/api/admin/job-postings/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch job posting");
                }

                const job = data.jobPosting;
                setTitle(job.title);
                setDepartment(job.department);
                setDescription(job.description);
                setRequirements(job.requirements || "");
                setLocation(job.location);
                setType(job.type);
                setStatus(job.status);
                setIsActive(job.isActive);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchJobPosting();
    }, [id]);

    const handleSubmit = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/admin/job-postings/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    department,
                    description,
                    requirements: requirements || null,
                    location,
                    type,
                    status,
                    isActive,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update job posting");
            }

            router.push("/admin/job-postings");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push("/admin/job-postings");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/admin/job-postings"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Job Postings
                </Link>
                <h1 className="text-xl font-bold">Edit Job Posting</h1>
                <p className="text-gray-600 mt-1">
                    Update this career opportunity
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Form */}
            <div className="card p-6">
                <ContentForm
                    status={status}
                    isActive={isActive}
                    onStatusChange={setStatus}
                    onActiveChange={setIsActive}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                    submitLabel="Save Changes"
                >
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Licensed Clinical Psychologist"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                required
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="e.g., Clinical Services"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                required
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., New Delhi, India"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                required
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employment Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as "full-time" | "part-time" | "contract")}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                            >
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <RichTextEditor
                                content={description}
                                onChange={setDescription}
                                placeholder="Describe the role and responsibilities..."
                            />
                        </div>

                        {/* Requirements */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Requirements
                            </label>
                            <RichTextEditor
                                content={requirements}
                                onChange={setRequirements}
                                placeholder="List the qualifications and requirements..."
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Optional. List qualifications, experience, and skills required.
                            </p>
                        </div>
                    </div>
                </ContentForm>
            </div>
        </div>
    );
}
