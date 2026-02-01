// frontend/src/app/api/admin/community-programs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { getDataSource } from "@/lib/db";
import { CommunityProgram } from "@/entities/CommunityProgram";
import { createCommunityProgramSchema } from "@/lib/validation";
import { generateUniqueSlug } from "@/lib/slug";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as "draft" | "published" | null;

        const ds = await getDataSource();
        const repo = ds.getRepository(CommunityProgram);

        const whereClause: any = {};
        if (status) {
            whereClause.status = status;
        }

        const programs = await repo.find({
            where: whereClause,
            order: { updatedAt: "DESC" },
        });

        return NextResponse.json({ success: true, programs });
    } catch (error) {
        console.error("Error fetching community programs:", error);
        return NextResponse.json({ error: "Failed to fetch community programs" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = createCommunityProgramSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(CommunityProgram);

        // Generate unique slug from name
        const slug = await generateUniqueSlug(validated.data.name, repo);

        const program = repo.create({
            ...validated.data,
            slug,
        });
        await repo.save(program);

        return NextResponse.json({ success: true, program }, { status: 201 });
    } catch (error) {
        console.error("Error creating community program:", error);
        return NextResponse.json({ error: "Failed to create community program" }, { status: 500 });
    }
}
