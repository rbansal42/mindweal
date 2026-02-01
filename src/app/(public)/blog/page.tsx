import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Tag } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";
import { sanitizeHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Blog",
    description: "Explore our blog for wellness tips, practice news, professional insights, and mental health resources.",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

type SerializedBlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    category: "wellness-tips" | "practice-news" | "professional-insights" | "resources";
    tags: string[] | null;
    isFeatured: boolean;
    authorName: string | null;
    publishedAt: string | null;
    createdAt: string;
};

function serializeBlogPost(post: BlogPost): SerializedBlogPost {
    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        category: post.category,
        tags: post.tags,
        isFeatured: post.isFeatured,
        authorName: post.authorName,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        createdAt: post.createdAt.toISOString(),
    };
}

async function getBlogPosts() {
    const ds = await getDataSource();
    const blogRepo = ds.getRepository(BlogPost);

    const [featured, recent] = await Promise.all([
        blogRepo.find({
            where: {
                status: "published",
                isActive: true,
                isFeatured: true,
            },
            order: { featuredOrder: "ASC", publishedAt: "DESC" },
            take: 3,
        }),
        blogRepo.find({
            where: {
                status: "published",
                isActive: true,
            },
            order: { publishedAt: "DESC" },
            take: 12,
        }),
    ]);

    return {
        featured: featured.map(serializeBlogPost),
        recent: recent.map(serializeBlogPost),
    };
}

function formatDate(dateString: string | null): string {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date(dateString));
}

const categoryConfig = {
    "wellness-tips": {
        label: "Wellness Tips",
        color: "bg-[var(--accent-green)]/10 text-[var(--accent-green)]",
    },
    "practice-news": {
        label: "Practice News",
        color: "bg-[var(--primary-teal)]/10 text-[var(--primary-teal)]",
    },
    "professional-insights": {
        label: "Professional Insights",
        color: "bg-[var(--secondary-green)]/10 text-[var(--secondary-green)]",
    },
    "resources": {
        label: "Resources",
        color: "bg-gray-500/10 text-gray-700",
    },
};

export default async function BlogPage() {
    const { featured, recent } = await getBlogPosts();

    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="text-gradient-mixed">Blog</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Insights, tips, and resources for your mental health journey.
                            Expert perspectives on wellness, therapy, and personal growth.
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Posts */}
            {featured.length > 0 && (
                <section className="section bg-white">
                    <div className="container-custom">
                        <h2 className="text-3xl font-bold mb-8">Featured Posts</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featured.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="card group hover:border-[var(--primary-teal)] border-2 border-transparent transition-all overflow-hidden"
                                >
                                    <div className="aspect-video bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20 flex items-center justify-center overflow-hidden relative">
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <span className="text-5xl">📝</span>
                                        )}
                                    </div>
                                    <div className="card-body p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span
                                                className={`px-3 py-1 text-xs rounded-full font-medium ${
                                                    categoryConfig[post.category].color
                                                }`}
                                            >
                                                {categoryConfig[post.category].label}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                                            {post.authorName && (
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>{post.authorName}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Recent Posts */}
            <section className={`section ${featured.length > 0 ? "bg-gray-50" : "bg-white"}`}>
                <div className="container-custom">
                    <h2 className="text-3xl font-bold mb-8">
                        {featured.length > 0 ? "Recent Posts" : "All Posts"}
                    </h2>
                    {recent.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No blog posts available yet.</p>
                            <p className="text-gray-400 mt-2">Check back soon for new content!</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recent.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="card group hover:border-[var(--primary-teal)] border-2 border-transparent transition-all overflow-hidden"
                                >
                                    <div className="aspect-video bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20 flex items-center justify-center overflow-hidden relative">
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <span className="text-5xl">📝</span>
                                        )}
                                    </div>
                                    <div className="card-body p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span
                                                className={`px-3 py-1 text-xs rounded-full font-medium ${
                                                    categoryConfig[post.category].color
                                                }`}
                                            >
                                                {categoryConfig[post.category].label}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                <Tag className="w-3 h-3 text-gray-400" />
                                                {post.tags.slice(0, 2).map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {post.tags.length > 2 && (
                                                    <span className="text-xs text-gray-400">
                                                        +{post.tags.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                                            {post.authorName && (
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>{post.authorName}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {recent.length > 0 && (
                        <div className="mt-12 text-center text-gray-500">
                            Stay tuned for more insights and updates!
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
