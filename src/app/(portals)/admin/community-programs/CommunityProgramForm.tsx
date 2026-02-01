"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContentForm } from "@/components/admin/ContentForm";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface CommunityProgramData {
    id?: string;
    name: string;
    description: string;
    schedule: string;
    coverImage: string | null;
    status: "draft" | "published";
    isActive: boolean;
}

interface CommunityProgramFormProps {
    initialData?: CommunityProgramData;
}

export default function CommunityProgramForm({ initialData }: CommunityProgramFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [schedule, setSchedule] = useState(initialData?.schedule || "");
    const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
    const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

    const handleSubmit = async () => {
        // Client-side validation
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        if (!description.trim() || description.length < 10) {
            setError("Description must be at least 10 characters");
            return;
        }
        if (!schedule.trim()) {
            setError("Schedule is required");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const url = initialData?.id
                ? `/api/admin/community-programs/${initialData.id}`
                : "/api/admin/community-programs";

            const method = initialData?.id ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    schedule,
                    coverImage,
                    status,
                    isActive,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    typeof data.error === "string"
                        ? data.error
                        : "Failed to save community program"
                );
            }

            router.push("/admin/community-programs");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push("/admin/community-programs");
    };

    return (
        <div className="max-w-3xl">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            <ContentForm
                status={status}
                isActive={isActive}
                onStatusChange={setStatus}
                onActiveChange={setIsActive}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                submitLabel={initialData?.id ? "Update" : "Create"}
            >
                <div className="card p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="e.g., Mindfulness Workshop"
                        />
                    </div>

                    {/* Schedule */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Schedule *
                        </label>
                        <input
                            type="text"
                            value={schedule}
                            onChange={(e) => setSchedule(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="e.g., Every Saturday, 10 AM - 12 PM"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Describe when the program takes place
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <RichTextEditor
                            content={description}
                            onChange={setDescription}
                            placeholder="Describe the community program..."
                        />
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Image
                        </label>
                        <ImageUploader
                            value={coverImage}
                            onChange={setCoverImage}
                        />
                    </div>
                </div>
            </ContentForm>
        </div>
    );
}
