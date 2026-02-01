"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ContentForm } from "@/components/admin/ContentForm";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";

const blogFormSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title too long"),
    slug: z.string().min(1).max(255).optional(),
    category: z.enum(["wellness-tips", "practice-news", "professional-insights", "resources"]),
    excerpt: z.string().max(500, "Excerpt too long").optional(),
    coverImage: z.string().url("Invalid image URL").optional().nullable(),
    tags: z.string().optional(),
    authorId: z.string().uuid().optional().nullable(),
    authorName: z.string().max(255).optional(),
    metaTitle: z.string().max(60, "Meta title should be under 60 characters").optional(),
    metaDescription: z.string().max(160, "Meta description should be under 160 characters").optional(),
    isFeatured: z.boolean().optional(),
    featuredOrder: z.number().int().positive().optional().nullable(),
});

type BlogFormData = z.infer<typeof blogFormSchema>;

interface BlogFormProps {
    initialData?: any;
    mode: "create" | "edit";
}

export default function BlogForm({ initialData, mode }: BlogFormProps) {
    const router = useRouter();
    const [content, setContent] = useState(initialData?.content || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);

    const form = useForm<BlogFormData>({
        resolver: zodResolver(blogFormSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            category: initialData?.category || undefined,
            excerpt: initialData?.excerpt || "",
            tags: initialData?.tags?.join(", ") || "",
            authorId: initialData?.authorId || undefined,
            authorName: initialData?.authorName || "",
            metaTitle: initialData?.metaTitle || "",
            metaDescription: initialData?.metaDescription || "",
            isFeatured: initialData?.isFeatured || false,
            featuredOrder: initialData?.featuredOrder || undefined,
        },
    });

    const isFeatured = form.watch("isFeatured");

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    async function fetchTeamMembers() {
        try {
            const res = await fetch("/api/admin/team-members");
            const data = await res.json();
            if (data.success) {
                setTeamMembers(data.data);
            }
        } catch (error) {
            console.error("Error fetching team members:", error);
        }
    }

    const handleSubmit = async () => {
        const isValid = await form.trigger();
        if (!isValid) return;

        setIsSubmitting(true);
        try {
            const data = form.getValues();
            
            // Parse tags from comma-separated string to array
            const tagsArray = data.tags
                ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
                : null;

            const payload = {
                ...data,
                content,
                coverImage,
                tags: tagsArray,
                status,
                isActive,
            };

            const url =
                mode === "create"
                    ? "/api/admin/blog"
                    : `/api/admin/blog/${initialData.id}`;
            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.error || "Failed to save blog post");
                return;
            }

            router.push("/admin/blog");
            router.refresh();
        } catch (error) {
            console.error("Error saving blog post:", error);
            alert("Failed to save blog post");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push("/admin/blog");
    };

    return (
        <ContentForm
            status={status}
            isActive={isActive}
            onStatusChange={setStatus}
            onActiveChange={setIsActive}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitLabel={mode === "create" ? "Create Post" : "Update Post"}
        >
            <div className="card p-6 space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                    </label>
                    <input
                        type="text"
                        {...form.register("title")}
                        className="input w-full"
                        placeholder="Enter blog post title"
                    />
                    {form.formState.errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.title.message}
                        </p>
                    )}
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug
                    </label>
                    <input
                        type="text"
                        {...form.register("slug")}
                        className="input w-full"
                        placeholder="auto-generated-from-title"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                        Leave blank to auto-generate from title
                    </p>
                    {form.formState.errors.slug && (
                        <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.slug.message}
                        </p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                    </label>
                    <select {...form.register("category")} className="input w-full">
                        <option value="">Select category</option>
                        <option value="wellness-tips">Wellness Tips</option>
                        <option value="practice-news">Practice News</option>
                        <option value="professional-insights">Professional Insights</option>
                        <option value="resources">Resources</option>
                    </select>
                    {form.formState.errors.category && (
                        <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.category.message}
                        </p>
                    )}
                </div>

                {/* Excerpt */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Excerpt
                    </label>
                    <textarea
                        {...form.register("excerpt")}
                        rows={3}
                        className="input w-full"
                        placeholder="Short summary for listings and SEO"
                        maxLength={500}
                    />
                    {form.formState.errors.excerpt && (
                        <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.excerpt.message}
                        </p>
                    )}
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content *
                    </label>
                    <RichTextEditor content={content} onChange={setContent} />
                </div>

                {/* Cover Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Image
                    </label>
                    <ImageUploader
                        value={coverImage || ""}
                        onChange={(url) => setCoverImage(url)}
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                    </label>
                    <input
                        type="text"
                        {...form.register("tags")}
                        className="input w-full"
                        placeholder="anxiety, mindfulness, self-care (comma-separated)"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                        Enter tags separated by commas (max 10)
                    </p>
                    {form.formState.errors.tags && (
                        <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.tags.message}
                        </p>
                    )}
                </div>

                {/* Author */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Author (Team Member)
                        </label>
                        <select {...form.register("authorId")} className="input w-full">
                            <option value="">None</option>
                            {teamMembers.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Or Author Name (Text)
                        </label>
                        <input
                            type="text"
                            {...form.register("authorName")}
                            className="input w-full"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                {/* SEO Section */}
                <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">SEO Settings</h3>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meta Title
                            </label>
                            <input
                                type="text"
                                {...form.register("metaTitle")}
                                className="input w-full"
                                placeholder="Custom SEO title (max 60 chars)"
                                maxLength={60}
                            />
                            {form.formState.errors.metaTitle && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.metaTitle.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meta Description
                            </label>
                            <textarea
                                {...form.register("metaDescription")}
                                rows={2}
                                className="input w-full"
                                placeholder="Custom SEO description (max 160 chars)"
                                maxLength={160}
                            />
                            {form.formState.errors.metaDescription && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.metaDescription.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Featured Section */}
                <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Featured Post</h3>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...form.register("isFeatured")}
                                className="rounded"
                            />
                            <span className="text-sm">Featured Post</span>
                        </label>

                        {isFeatured && (
                            <div>
                                <input
                                    type="number"
                                    {...form.register("featuredOrder", { valueAsNumber: true })}
                                    className="input w-24"
                                    placeholder="Order"
                                    min="1"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ContentForm>
    );
}
