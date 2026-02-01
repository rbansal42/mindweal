// frontend/src/app/api/admin/therapists/[id]/restore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { getDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { Not, IsNull } from "typeorm";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
        const therapistRepo = ds.getRepository(Therapist);

        const therapist = await therapistRepo.findOne({ where: { id, deletedAt: Not(IsNull()) } });
        if (!therapist) {
            return NextResponse.json({ error: "Archived therapist not found" }, { status: 404 });
        }

        therapist.deletedAt = null;
        await therapistRepo.save(therapist);

        return NextResponse.json({ success: true, therapist });
    } catch (error) {
        console.error("Error restoring therapist:", error);
        return NextResponse.json({ error: "Failed to restore therapist" }, { status: 500 });
    }
}
