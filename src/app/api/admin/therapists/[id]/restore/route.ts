// frontend/src/app/api/admin/therapists/[id]/restore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { Not, IsNull } from "typeorm";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
