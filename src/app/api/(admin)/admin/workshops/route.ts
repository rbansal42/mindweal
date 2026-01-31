import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Workshop } from "@/entities/Workshop";
import { createWorkshopSchema } from "@/lib/validation";
import { generateUniqueSlug } from "@/lib/slug";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as { role?: string }).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as "draft" | "published" | null;

        const ds = await getDataSource();
        const repo = ds.getRepository(Workshop);

        const queryBuilder = repo.createQueryBuilder("workshop");

        if (status) {
            queryBuilder.where("workshop.status = :status", { status });
        }

        // Order by date desc (upcoming first)
        queryBuilder.orderBy("workshop.date", "DESC");

        const workshops = await queryBuilder.getMany();

        return NextResponse.json({ success: true, workshops });
    } catch (error) {
        console.error("Error fetching workshops:", error);
        return NextResponse.json({ error: "Failed to fetch workshops" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as { role?: string }).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = createWorkshopSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(Workshop);

        const slug = await generateUniqueSlug(validated.data.title, repo);

        const workshop = repo.create({
            ...validated.data,
            slug,
            date: new Date(validated.data.date),
            coverImage: validated.data.coverImage || null,
        });
        await repo.save(workshop);

        return NextResponse.json({ success: true, workshop }, { status: 201 });
    } catch (error) {
        console.error("Error creating workshop:", error);
        return NextResponse.json({ error: "Failed to create workshop" }, { status: 500 });
    }
}
