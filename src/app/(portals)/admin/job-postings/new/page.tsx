"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContentForm } from "@/components/admin/ContentForm";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export default function NewJobPostingPage() {
    const router = useRouter();
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

    const handleSubmit = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/admin/job-postings", {
                method: "POST",
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
                throw new Error(data.error || "Failed to create job posting");
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

    return (
        <div className="max-w-4xl mx-auto space-y-3">
            {/* Header */}
            <div>
                <Link
                    href="/admin/job-postings"
                    className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 mb-2 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Job Postings
                </Link>
                <h1 className="portal-title">New Job Posting</h1>
                <p className="text-gray-600 text-sm">
                    Create a new career opportunity
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Form */}
            <div className="portal-card p-4">
                <ContentForm
                    status={status}
                    isActive={isActive}
                    onStatusChange={setStatus}
                    onActiveChange={setIsActive}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                    submitLabel="Create Job Posting"
                >
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="portal-label">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Licensed Clinical Psychologist"
                                className="portal-input"
                                required
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="portal-label">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="e.g., Clinical Services"
                                className="portal-input"
                                required
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="portal-label">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., New Delhi, India"
                                className="portal-input"
                                required
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="portal-label">
                                Employment Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as "full-time" | "part-time" | "contract")}
                                className="portal-input"
                            >
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="portal-label">
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
                            <label className="portal-label">
                                Requirements
                            </label>
                            <RichTextEditor
                                content={requirements}
                                onChange={setRequirements}
                                placeholder="List the qualifications and requirements..."
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Optional. List qualifications, experience, and skills required.
                            </p>
                        </div>
                    </div>
                </ContentForm>
            </div>
        </div>
    );
}
