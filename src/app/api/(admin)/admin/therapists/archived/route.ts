// frontend/src/app/api/admin/therapists/archived/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { getDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { Not, IsNull } from "typeorm";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);

        const therapists = await therapistRepo.find({
            where: { deletedAt: Not(IsNull()) },
            order: { deletedAt: "DESC" },
        });

        return NextResponse.json({ success: true, therapists });
    } catch (error) {
        console.error("Error fetching archived therapists:", error);
        return NextResponse.json({ error: "Failed to fetch archived therapists" }, { status: 500 });
    }
}
