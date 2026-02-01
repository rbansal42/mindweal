// frontend/src/app/api/admin/programs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { getDataSource } from "@/lib/db";
import { Program } from "@/entities/Program";
import { updateProgramSchema } from "@/lib/validation";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(Program);

        const program = await repo.findOne({ where: { id } });
        if (!program) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, program });
    } catch (error) {
        console.error("Error fetching program:", error);
        return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = updateProgramSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(Program);

        const program = await repo.findOne({ where: { id } });
        if (!program) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        // Note: Slug is not updatable
        const { ...updateData } = validated.data;
        Object.assign(program, updateData);
        await repo.save(program);

        return NextResponse.json({ success: true, program });
    } catch (error) {
        console.error("Error updating program:", error);
        return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(Program);

        const program = await repo.findOne({ where: { id } });
        if (!program) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        // Soft delete: set isActive to false
        program.isActive = false;
        await repo.save(program);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting program:", error);
        return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
    }
}
