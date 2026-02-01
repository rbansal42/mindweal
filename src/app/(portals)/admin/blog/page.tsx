"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ContentTable } from "@/components/admin/ContentTable";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    status: "draft" | "published";
    isActive: boolean;
    publishedAt: string | null;
    authorName: string | null;
    author?: { name: string } | null;
    updatedAt: string;
}

export default function BlogListPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    useEffect(() => {
        fetchPosts();
    }, [statusFilter, categoryFilter]);

    async function fetchPosts() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (categoryFilter !== "all") params.set("category", categoryFilter);

            const res = await fetch(`/api/admin/blog?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setPosts(data.data);
            }
        } catch (error) {
            console.error("Error fetching blog posts:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleActive(id: string, currentValue: boolean) {
        try {
            const res = await fetch(`/api/admin/blog/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentValue }),
            });

            if (res.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error("Error toggling blog post:", error);
        }
    }

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/admin/blog/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error("Error deleting blog post:", error);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="portal-title">Blog Posts</h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Manage blog posts, articles, and updates
                    </p>
                </div>
                <Link href="/admin/blog/new" className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                </Link>
            </div>

            <div className="flex gap-4 items-center">
                <div>
                    <label className="text-sm text-gray-600 mr-2">Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                        <option value="all">All</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>

                <div>
                    <label className="text-sm text-gray-600 mr-2">Category:</label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                        <option value="all">All Categories</option>
                        <option value="wellness-tips">Wellness Tips</option>
                        <option value="practice-news">Practice News</option>
                        <option value="professional-insights">Professional Insights</option>
                        <option value="resources">Resources</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No blog posts found.</p>
                    <Link href="/admin/blog/new" className="btn btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first blog post
                    </Link>
                </div>
            ) : (
                <ContentTable
                    items={posts}
                    basePath="/admin/blog"
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                    titleField="title"
                />
            )}
        </div>
    );
}
