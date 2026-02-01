import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";
import { createBlogPostSchema } from "@/lib/validation";
import type { AuthSession } from "@/types/auth";
import slugify from "slugify";

export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const category = searchParams.get("category");

        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        const where: any = {};
        if (status) where.status = status;
        if (category) where.category = category;

        const posts = await repo.find({
            where,
            relations: ["author"],
            order: { createdAt: "DESC" },
        });

        return NextResponse.json({ success: true, data: posts });
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const validated = createBlogPostSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        // Generate slug from title if not provided
        let slug = validated.data.slug || slugify(validated.data.title, { lower: true, strict: true });

        // Ensure slug uniqueness
        let counter = 1;
        let uniqueSlug = slug;
        while (await repo.findOne({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        const post = repo.create({
            ...validated.data,
            slug: uniqueSlug,
            publishedAt: validated.data.status === "published" ? new Date() : null,
        });

        await repo.save(post);

        return NextResponse.json({ success: true, data: post }, { status: 201 });
    } catch (error) {
        console.error("Error creating blog post:", error);
        return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
    }
}
