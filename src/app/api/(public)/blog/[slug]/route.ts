import { NextRequest, NextResponse } from "next/server";
import { Not } from "typeorm";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        // Get the blog post with author
        const post = await repo.findOne({
            where: { slug, status: "published", isActive: true },
            relations: ["author"],
        });

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            );
        }

        // Get related posts (same category, exclude current)
        const related = await repo.find({
            where: {
                category: post.category,
                status: "published",
                isActive: true,
                id: Not(post.id),
            },
            order: { publishedAt: "DESC" },
            take: 3,
        });

        // Serialize post data (convert dates to strings)
        const serializedPost = {
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            category: post.category,
            tags: post.tags,
            status: post.status,
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            publishedAt: post.publishedAt?.toISOString() || null,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
            author: post.author
                ? {
                      id: post.author.id,
                      name: post.author.name,
                      photoUrl: post.author.photoUrl,
                  }
                : null,
            authorName: post.authorName,
        };

        // Serialize related posts (minimal fields)
        const serializedRelated = related.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            coverImage: p.coverImage,
            category: p.category,
        }));

        return NextResponse.json({
            post: serializedPost,
            related: serializedRelated,
        });
    } catch (error) {
        console.error("Error fetching blog post:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog post" },
            { status: 500 }
        );
    }
}
