import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Not } from "typeorm";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";
import { sanitizeHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
    const ds = await getDataSource();
    const repo = ds.getRepository(BlogPost);

    const post = await repo.findOne({
        where: { slug, status: "published", isActive: true },
        relations: ["author"],
    });

    return post;
}

async function getRelatedPosts(category: BlogPost["category"], excludeId: string) {
    const ds = await getDataSource();
    const repo = ds.getRepository(BlogPost);

    return repo.find({
        where: {
            category,
            status: "published",
            isActive: true,
            id: Not(excludeId),
        },
        order: { publishedAt: "DESC" },
        take: 3,
    });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        return {
            title: "Post Not Found | MindWeal by Pihu Suri",
        };
    }

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
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = await getRelatedPosts(post.category, post.id);

    const plainRelated = relatedPosts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        coverImage: p.coverImage,
        category: p.category,
    }));

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
            {plainRelated.length > 0 && (
                <section className="section section-alt">
                    <div className="container-custom">
                        <h2 className="text-2xl font-bold mb-8">Related Posts</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {plainRelated.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/blog/${related.slug}`}
                                    className="card group hover:shadow-lg transition-shadow"
                                >
                                    {related.coverImage ? (
                                        <div className="aspect-video overflow-hidden">
                                            <Image
                                                src={related.coverImage}
                                                alt={related.title}
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
                                                CATEGORY_COLORS[related.category]
                                            }`}
                                        >
                                            {CATEGORY_LABELS[related.category]}
                                        </span>
                                        <h3 className="text-lg font-semibold mt-3 group-hover:text-[var(--primary-teal)] transition-colors">
                                            {related.title}
                                        </h3>
                                        {related.excerpt && (
                                            <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                                {related.excerpt}
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
