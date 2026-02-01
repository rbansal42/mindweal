import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import { appConfig } from "@/config";

interface PageProps {
    params: Promise<{ slug: string }>;
}

interface BlogPostData {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    category: string;
    tags: string[];
    status: string;
    metaTitle: string | null;
    metaDescription: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        name: string;
        photoUrl: string | null;
    } | null;
    authorName: string | null;
}

interface RelatedPostData {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    category: string;
}

interface BlogDataResponse {
    post: BlogPostData;
    related: RelatedPostData[];
}

async function getBlogData(slug: string): Promise<BlogDataResponse | null> {
    try {
        const res = await fetch(`${appConfig.url}/api/blog/${slug}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const data = await getBlogData(slug);

    if (!data || !data.post) {
        return {
            title: "Post Not Found | MindWeal by Pihu Suri",
        };
    }

    const { post } = data;

    const stripHtml = (html: string, maxLength: number) => {
        const text = html.replace(/<[^>]*>/g, "");
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    return {
        title: post.metaTitle || `${post.title} | Blog | MindWeal by Pihu Suri`,
        description:
            post.metaDescription ||
            post.excerpt ||
            stripHtml(post.content, 160),
        openGraph: post.coverImage
            ? {
                  images: [post.coverImage],
              }
            : undefined,
    };
}

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

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const data = await getBlogData(slug);

    if (!data || !data.post) {
        notFound();
    }

    const { post, related } = data;

    return (
        <>
            {/* Cover Image */}
            {post.coverImage && (
                <div className="w-full h-[400px] relative">
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {/* Post Content */}
            <article className="section bg-white">
                <div className="container-custom max-w-4xl">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--primary-teal)] mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>

                    <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                            CATEGORY_COLORS[post.category]
                        }`}
                    >
                        {CATEGORY_LABELS[post.category]}
                    </span>

                    <h1 className="text-4xl md:text-5xl font-bold mt-4">{post.title}</h1>

                    <div className="flex items-center gap-6 mt-6 text-gray-600">
                        {(post.author || post.authorName) && (
                            <div className="flex items-center gap-2">
                                {post.author?.photoUrl ? (
                                    <Image
                                        src={post.author.photoUrl}
                                        alt={post.author.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                                <span>{post.author?.name || post.authorName}</span>
                            </div>
                        )}
                        {post.publishedAt && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>
                                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        )}
                    </div>

                    {post.excerpt && (
                        <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}

                    <div
                        className="prose prose-lg prose-teal max-w-none mt-8"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                    />

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t">
                            <h3 className="text-sm font-semibold text-gray-500 mb-3">
                                TAGS
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </article>

            {/* Related Posts */}
            {related.length > 0 && (
                <section className="section section-alt">
                    <div className="container-custom">
                        <h2 className="text-2xl font-bold mb-8">Related Posts</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {related.map((relatedPost: RelatedPostData) => (
                                <Link
                                    key={relatedPost.id}
                                    href={`/blog/${relatedPost.slug}`}
                                    className="card group hover:shadow-lg transition-shadow"
                                >
                                    {relatedPost.coverImage ? (
                                        <div className="aspect-video overflow-hidden">
                                            <Image
                                                src={relatedPost.coverImage}
                                                alt={relatedPost.title}
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
                                                CATEGORY_COLORS[relatedPost.category]
                                            }`}
                                        >
                                            {CATEGORY_LABELS[relatedPost.category]}
                                        </span>
                                        <h3 className="text-lg font-semibold mt-3 group-hover:text-[var(--primary-teal)] transition-colors">
                                            {relatedPost.title}
                                        </h3>
                                        {relatedPost.excerpt && (
                                            <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                                {relatedPost.excerpt}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
