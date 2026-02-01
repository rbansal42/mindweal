import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { appConfig } from "@/config";

interface PageProps {
    params: Promise<{ category: string }>;
}

const VALID_CATEGORIES = [
    "wellness-tips",
    "practice-news",
    "professional-insights",
    "resources",
];

const CATEGORY_LABELS: Record<string, string> = {
    "wellness-tips": "Wellness Tips",
    "practice-news": "Practice News",
    "professional-insights": "Professional Insights",
    "resources": "Resources",
};

const CATEGORY_COLORS: Record<string, string> = {
    "wellness-tips": "bg-teal-100 text-teal-800",
    "practice-news": "bg-green-100 text-green-800",
    "professional-insights": "bg-violet-100 text-violet-800",
    "resources": "bg-blue-100 text-blue-800",
};

async function getBlogPostsByCategory(category: string) {
    try {
        const res = await fetch(`${appConfig.url}/api/blog/category/${category}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.posts || [];
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category } = await params;

    if (!VALID_CATEGORIES.includes(category)) {
        return {
            title: "Category Not Found | MindWeal by Pihu Suri",
        };
    }

    return {
        title: `${CATEGORY_LABELS[category]} | Blog | MindWeal by Pihu Suri`,
    };
}

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;

    if (!VALID_CATEGORIES.includes(category)) {
        notFound();
    }

    const posts = await getBlogPostsByCategory(category);

    return (
        <>
            <section className="bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff] py-16">
                <div className="container-custom">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--primary-teal)] mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>
                    <h1 className="text-4xl font-bold">
                        <span className="text-gradient-primary">
                            {CATEGORY_LABELS[category]}
                        </span>
                    </h1>
                </div>
            </section>

            <section className="section bg-white">
                <div className="container-custom">
                    {posts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No posts in this category yet.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post: any) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="card group hover:shadow-lg transition-shadow"
                                >
                                    {post.coverImage ? (
                                        <div className="aspect-video overflow-hidden">
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                width={400}
                                                height={225}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20" />
                                    )}
                                    <div className="p-6">
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                                CATEGORY_COLORS[post.category]
                                            }`}
                                        >
                                            {CATEGORY_LABELS[post.category]}
                                        </span>
                                        <h3 className="text-xl font-semibold mt-3 group-hover:text-[var(--primary-teal)] transition-colors">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                            {post.authorName && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {post.authorName}
                                                </div>
                                            )}
                                            {post.publishedAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(
                                                        post.publishedAt
                                                    ).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
