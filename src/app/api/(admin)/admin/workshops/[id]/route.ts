import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Workshop } from "@/entities/Workshop";
import { z } from "zod";

interface RouteParams {
    params: Promise<{ id: string }>;
}

const updateWorkshopSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date").optional(),
    duration: z.string().min(1, "Duration is required").optional(),
    capacity: z.number().min(1, "Capacity must be at least 1").optional(),
    coverImage: z.string().url().nullable().optional(),
    status: z.enum(["draft", "published"]).optional(),
    isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as { role?: string }).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(Workshop);

        const workshop = await repo.findOne({ where: { id } });
        if (!workshop) {
            return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, workshop });
    } catch (error) {
        console.error("Error fetching workshop:", error);
        return NextResponse.json({ error: "Failed to fetch workshop" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as { role?: string }).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = updateWorkshopSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(Workshop);

        const workshop = await repo.findOne({ where: { id } });
        if (!workshop) {
            return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
        }

        // Update fields (slug is not updatable)
        if (validated.data.title !== undefined) workshop.title = validated.data.title;
        if (validated.data.description !== undefined) workshop.description = validated.data.description;
        if (validated.data.date !== undefined) workshop.date = new Date(validated.data.date);
        if (validated.data.duration !== undefined) workshop.duration = validated.data.duration;
        if (validated.data.capacity !== undefined) workshop.capacity = validated.data.capacity;
        if (validated.data.coverImage !== undefined) workshop.coverImage = validated.data.coverImage;
        if (validated.data.status !== undefined) workshop.status = validated.data.status;
        if (validated.data.isActive !== undefined) workshop.isActive = validated.data.isActive;

        await repo.save(workshop);

        return NextResponse.json({ success: true, workshop });
    } catch (error) {
        console.error("Error updating workshop:", error);
        return NextResponse.json({ error: "Failed to update workshop" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as { role?: string }).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(Workshop);

        const workshop = await repo.findOne({ where: { id } });
        if (!workshop) {
            return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
        }

        // Soft delete: set isActive to false
        workshop.isActive = false;
        await repo.save(workshop);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting workshop:", error);
        return NextResponse.json({ error: "Failed to delete workshop" }, { status: 500 });
    }
}
