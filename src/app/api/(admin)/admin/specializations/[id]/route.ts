// frontend/src/app/api/admin/specializations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { getDataSource } from "@/lib/db";
import { Specialization } from "@/entities/Specialization";
import { Therapist } from "@/entities/Therapist";
import { updateSpecializationSchema } from "@/lib/validation";
import { IsNull } from "typeorm";

interface RouteParams {
    params: Promise<{ id: string }>;
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
        const validated = updateSpecializationSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(Specialization);

        const specialization = await repo.findOne({ where: { id } });
        if (!specialization) {
            return NextResponse.json({ error: "Specialization not found" }, { status: 404 });
        }

        // Check for duplicate name if updating
        if (validated.data.name && validated.data.name !== specialization.name) {
            const existing = await repo.findOne({ where: { name: validated.data.name } });
            if (existing) {
                return NextResponse.json({ error: "Specialization name already exists" }, { status: 409 });
            }
        }

        Object.assign(specialization, validated.data);
        await repo.save(specialization);

        return NextResponse.json({ success: true, specialization });
    } catch (error) {
        console.error("Error updating specialization:", error);
        return NextResponse.json({ error: "Failed to update specialization" }, { status: 500 });
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
        const specRepo = ds.getRepository(Specialization);
        const therapistRepo = ds.getRepository(Therapist);

        const specialization = await specRepo.findOne({ where: { id } });
        if (!specialization) {
            return NextResponse.json({ error: "Specialization not found" }, { status: 404 });
        }

        // Check if in use by any active therapist
        const therapists = await therapistRepo.find({ where: { deletedAt: IsNull() } });
        const inUse = therapists.some(t => t.specializationIds?.includes(id));

        if (inUse) {
            return NextResponse.json({
                error: "Cannot delete specialization that is in use by therapists"
            }, { status: 409 });
        }

        await specRepo.remove(specialization);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting specialization:", error);
        return NextResponse.json({ error: "Failed to delete specialization" }, { status: 500 });
    }
}
