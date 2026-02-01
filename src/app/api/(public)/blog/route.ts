import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";

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

export async function GET() {
    try {
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

        return NextResponse.json({
            featured: featured.map(serializeBlogPost),
            recent: recent.map(serializeBlogPost),
        });
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog posts" },
            { status: 500 }
        );
    }
}
