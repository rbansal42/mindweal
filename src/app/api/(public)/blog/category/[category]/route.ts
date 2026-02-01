import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";

type BlogCategory = "wellness-tips" | "practice-news" | "professional-insights" | "resources";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    try {
        const { category } = await params;
        
        const validCategories: BlogCategory[] = ["wellness-tips", "practice-news", "professional-insights", "resources"];
        if (!validCategories.includes(category as BlogCategory)) {
            return NextResponse.json({ error: "Invalid category" }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        const posts = await repo.find({
            where: {
                category: category as BlogCategory,
                status: "published",
                isActive: true,
            },
            order: { publishedAt: "DESC" },
        });

        return NextResponse.json({
            success: true,
            posts: posts.map(serializePost),
            category,
        });
    } catch (error) {
        console.error("Error fetching blog posts by category:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

function serializePost(post: BlogPost) {
    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        category: post.category,
        tags: post.tags,
        authorName: post.authorName,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        createdAt: post.createdAt.toISOString(),
    };
}
