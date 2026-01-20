"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { ContentForm } from "@/components/admin/ContentForm";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { createProgramSchema } from "@/lib/validation";

interface ProgramFormProps {
    initialData?: {
        id: string;
        title: string;
        description: string;
        duration: string;
        coverImage: string | null;
        benefits: string[] | null;
        status: "draft" | "published";
        isActive: boolean;
    };
    mode: "create" | "edit";
}

export function ProgramForm({ initialData, mode }: ProgramFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"draft" | "published">(
        initialData?.status ?? "draft"
    );
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [coverImage, setCoverImage] = useState<string | null>(
        initialData?.coverImage ?? null
    );
    const [benefits, setBenefits] = useState<string[]>(
        initialData?.benefits ?? []
    );
    const [newBenefit, setNewBenefit] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createProgramSchema),
        defaultValues: {
            title: initialData?.title ?? "",
            description: initialData?.description ?? "",
            duration: initialData?.duration ?? "",
            coverImage: initialData?.coverImage ?? null,
            benefits: initialData?.benefits ?? null,
            status: initialData?.status ?? "draft",
            isActive: initialData?.isActive ?? true,
        },
    });

    const addBenefit = () => {
        const trimmed = newBenefit.trim();
        if (trimmed && !benefits.includes(trimmed)) {
            setBenefits([...benefits, trimmed]);
            setNewBenefit("");
        }
    };

    const removeBenefit = (index: number) => {
        setBenefits(benefits.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addBenefit();
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                description,
                coverImage,
                benefits: benefits.length > 0 ? benefits : null,
                status,
                isActive,
            };

            const url =
                mode === "create"
                    ? "/api/admin/programs"
                    : `/api/admin/programs/${initialData?.id}`;
            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save program");
            }

            router.push("/admin/programs");
            router.refresh();
        } catch (error) {
            console.error("Error saving program:", error);
            alert(error instanceof Error ? error.message : "Failed to save program");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormSubmit = () => {
        handleSubmit(onSubmit)();
    };

    return (
        <ContentForm
            status={status}
            isActive={isActive}
            onStatusChange={setStatus}
            onActiveChange={setIsActive}
            onSubmit={handleFormSubmit}
            onCancel={() => router.push("/admin/programs")}
            isSubmitting={isSubmitting}
            submitLabel={mode === "create" ? "Create Program" : "Save Changes"}
        >
            <div className="space-y-6">
                {/* Title */}
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        {...register("title")}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        placeholder="Enter program title"
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                        content={description}
                        onChange={setDescription}
                        placeholder="Describe the program..."
                    />
                    {!description && (
                        <p className="mt-1 text-sm text-gray-500">
                            Description is required (minimum 10 characters)
                        </p>
                    )}
                </div>

                {/* Duration */}
                <div>
                    <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Duration <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="duration"
                        type="text"
                        {...register("duration")}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        placeholder="e.g., 8 weeks, 3 months"
                    />
                    {errors.duration && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.duration.message}
                        </p>
                    )}
                </div>

                {/* Cover Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Image
                    </label>
                    <ImageUploader value={coverImage} onChange={setCoverImage} />
                </div>

                {/* Benefits */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Benefits
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newBenefit}
                            onChange={(e) => setNewBenefit(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                            placeholder="Add a benefit"
                        />
                        <button
                            type="button"
                            onClick={addBenefit}
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </div>
                    {benefits.length > 0 && (
                        <ul className="space-y-2">
                            {benefits.map((benefit, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                                >
                                    <span className="text-sm text-gray-700">{benefit}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeBenefit(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </ContentForm>
    );
}
