"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createFAQSchema } from "@/lib/validation";

interface FAQFormProps {
    initialData?: {
        id: string;
        question: string;
        answer: string;
        category: "therapy" | "booking" | "programs" | "general";
        displayOrder: number;
        isActive: boolean;
    };
    mode: "create" | "edit";
}

export function FAQForm({ initialData, mode }: FAQFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [answer, setAnswer] = useState(initialData?.answer ?? "");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createFAQSchema),
        defaultValues: {
            question: initialData?.question ?? "",
            answer: initialData?.answer ?? "",
            category: initialData?.category ?? "general",
            displayOrder: initialData?.displayOrder ?? 0,
            isActive: initialData?.isActive ?? true,
        },
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                answer,
                isActive,
            };

            const url = mode === "create"
                ? "/api/admin/faqs"
                : `/api/admin/faqs/${initialData?.id}`;
            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save FAQ");
            }

            router.push("/admin/faqs");
            router.refresh();
        } catch (error) {
            console.error("Error saving FAQ:", error);
            alert(error instanceof Error ? error.message : "Failed to save FAQ");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Question */}
            <div>
                <label htmlFor="question" className="portal-label">
                    Question <span className="text-red-500">*</span>
                </label>
                <input
                    id="question"
                    type="text"
                    {...register("question")}
                    className="portal-input"
                    placeholder="e.g., What therapeutic services do you offer?"
                />
                {errors.question && (
                    <p className="mt-1 text-sm text-red-600">{errors.question.message as string}</p>
                )}
            </div>

            {/* Answer */}
            <div>
                <label className="portal-label">
                    Answer <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                    content={answer}
                    onChange={setAnswer}
                    placeholder="Write the answer here..."
                />
                {!answer && (
                    <p className="mt-1 text-sm text-gray-500">
                        Answer is required (minimum 10 characters)
                    </p>
                )}
            </div>

            {/* Category and Display Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label htmlFor="category" className="portal-label">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="category"
                        {...register("category")}
                        className="portal-input"
                    >
                        <option value="therapy">Therapy Services</option>
                        <option value="booking">Booking & Sessions</option>
                        <option value="programs">Programs & Training</option>
                        <option value="general">General</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="displayOrder" className="portal-label">
                        Display Order
                    </label>
                    <input
                        id="displayOrder"
                        type="number"
                        {...register("displayOrder", { valueAsNumber: true })}
                        className="portal-input"
                        placeholder="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">Lower numbers appear first within the same category</p>
                </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
                <h3 className="portal-label">Status</h3>
                
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                            isActive ? "bg-teal-600" : "bg-gray-200"
                        }`}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isActive ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                    </button>
                    <span className="text-sm text-gray-700">
                        {isActive ? "Active (visible on FAQ page)" : "Inactive (hidden from FAQ page)"}
                    </span>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={() => router.push("/admin/faqs")}
                    className="portal-btn portal-btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="portal-btn portal-btn-primary"
                >
                    {isSubmitting
                        ? "Saving..."
                        : mode === "create"
                        ? "Create FAQ"
                        : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
