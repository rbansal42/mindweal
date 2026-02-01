import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";
import { updateBlogPostSchema } from "@/lib/validation";
import type { AuthSession } from "@/types/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        }) as AuthSession | null;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        const post = await repo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!post) {
            return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: post });
    } catch (error) {
        console.error("Error fetching blog post:", error);
        return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        }) as AuthSession | null;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = updateBlogPostSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        const post = await repo.findOne({ where: { id } });

        if (!post) {
            return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
        }

        // Check slug uniqueness if slug is being updated
        if (validated.data.slug && validated.data.slug !== post.slug) {
            const existingPost = await repo.findOne({ where: { slug: validated.data.slug } });
            if (existingPost) {
                return NextResponse.json(
                    { error: "Slug already exists", details: { slug: ["This slug is already in use"] } },
                    { status: 409 }
                );
            }
        }

        // Apply validated data to post
        Object.assign(post, validated.data);

        // Set publishedAt if transitioning to published for first time
        if (post.status === "published" && !post.publishedAt) {
            post.publishedAt = new Date();
        }

        await repo.save(post);

        return NextResponse.json({ success: true, data: post });
    } catch (error) {
        console.error("Error updating blog post:", error);
        return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        }) as AuthSession | null;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        const post = await repo.findOne({ where: { id } });

        if (!post) {
            return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
        }

        // Soft delete
        post.isActive = false;
        await repo.save(post);

        return NextResponse.json({ success: true, message: "Blog post deleted" });
    } catch (error) {
        console.error("Error deleting blog post:", error);
        return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
    }
}
