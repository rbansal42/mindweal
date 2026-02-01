"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { ContentForm } from "@/components/admin/ContentForm";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";

const workshopSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    date: z.string().min(1, "Date is required"),
    duration: z.string().min(1, "Duration is required"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    coverImage: z.string().nullable().optional(),
    status: z.enum(["draft", "published"]),
    isActive: z.boolean(),
});

type WorkshopFormData = z.infer<typeof workshopSchema>;

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
}

interface WorkshopFormProps {
    workshop?: Workshop;
}

export default function WorkshopForm({ workshop }: WorkshopFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [description, setDescription] = useState(workshop?.description || "");
    const [coverImage, setCoverImage] = useState<string | null>(workshop?.coverImage || null);
    const [status, setStatus] = useState<"draft" | "published">(workshop?.status || "draft");
    const [isActive, setIsActive] = useState(workshop?.isActive ?? true);

    const isEditing = !!workshop;

    // Format date for datetime-local input
    const formatDateForInput = (dateStr?: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        // Format as YYYY-MM-DDTHH:mm
        return date.toISOString().slice(0, 16);
    };

    const form = useForm<WorkshopFormData>({
        resolver: zodResolver(workshopSchema),
        defaultValues: {
            title: workshop?.title || "",
            description: workshop?.description || "",
            date: formatDateForInput(workshop?.date),
            duration: workshop?.duration || "",
            capacity: workshop?.capacity || 20,
            coverImage: workshop?.coverImage || null,
            status: workshop?.status || "draft",
            isActive: workshop?.isActive ?? true,
        },
    });

    const handleSubmit = async () => {
        // Validate form
        const isValid = await form.trigger();
        if (!isValid) return;

        const data = form.getValues();
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                title: data.title,
                description,
                date: new Date(data.date).toISOString(),
                duration: data.duration,
                capacity: data.capacity,
                coverImage,
                status,
                isActive,
            };

            const url = isEditing
                ? `/api/admin/workshops/${workshop.id}`
                : "/api/admin/workshops";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(
                    typeof result.error === "string"
                        ? result.error
                        : "Failed to save workshop"
                );
            }

            router.push("/admin/workshops");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push("/admin/workshops");
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
                submitLabel={isEditing ? "Save Changes" : "Create Workshop"}
            >
                <div className="card p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Title *
                        </label>
                        <input
                            {...form.register("title")}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Workshop title"
                        />
                        {form.formState.errors.title && (
                            <p className="text-red-500 text-xs mt-1">
                                {form.formState.errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Description *
                        </label>
                        <RichTextEditor
                            content={description}
                            onChange={setDescription}
                            placeholder="Describe the workshop..."
                        />
                        {form.formState.errors.description && (
                            <p className="text-red-500 text-xs mt-1">
                                {form.formState.errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Date & Time */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                {...form.register("date")}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                            {form.formState.errors.date && (
                                <p className="text-red-500 text-xs mt-1">
                                    {form.formState.errors.date.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Duration *
                            </label>
                            <input
                                {...form.register("duration")}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                placeholder="e.g., 2 hours"
                            />
                            {form.formState.errors.duration && (
                                <p className="text-red-500 text-xs mt-1">
                                    {form.formState.errors.duration.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Capacity */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Capacity
                        </label>
                        <input
                            type="number"
                            {...form.register("capacity", { valueAsNumber: true })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Maximum attendees"
                            min={1}
                        />
                        {form.formState.errors.capacity && (
                            <p className="text-red-500 text-xs mt-1">
                                {form.formState.errors.capacity.message}
                            </p>
                        )}
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
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
