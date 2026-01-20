// frontend/src/app/api/admin/community-programs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { CommunityProgram } from "@/entities/CommunityProgram";
import { updateCommunityProgramSchema } from "@/lib/validation";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(CommunityProgram);

        const program = await repo.findOne({ where: { id } });
        if (!program) {
            return NextResponse.json({ error: "Community program not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, program });
    } catch (error) {
        console.error("Error fetching community program:", error);
        return NextResponse.json({ error: "Failed to fetch community program" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = updateCommunityProgramSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(CommunityProgram);

        const program = await repo.findOne({ where: { id } });
        if (!program) {
            return NextResponse.json({ error: "Community program not found" }, { status: 404 });
        }

        // Update fields (slug is not updatable)
        Object.assign(program, validated.data);
        await repo.save(program);

        return NextResponse.json({ success: true, program });
    } catch (error) {
        console.error("Error updating community program:", error);
        return NextResponse.json({ error: "Failed to update community program" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(CommunityProgram);

        const program = await repo.findOne({ where: { id } });
        if (!program) {
            return NextResponse.json({ error: "Community program not found" }, { status: 404 });
        }

        // Soft delete by setting isActive to false
        program.isActive = false;
        await repo.save(program);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting community program:", error);
        return NextResponse.json({ error: "Failed to delete community program" }, { status: 500 });
    }
}
