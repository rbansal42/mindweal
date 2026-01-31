// frontend/src/app/api/admin/specializations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Specialization } from "@/entities/Specialization";
import { createSpecializationSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(Specialization);
        const specializations = await repo.find({
            where: { isActive: true },
            order: { name: "ASC" },
        });

        return NextResponse.json({ success: true, specializations });
    } catch (error) {
        console.error("Error fetching specializations:", error);
        return NextResponse.json({ error: "Failed to fetch specializations" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = createSpecializationSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(Specialization);

        // Check for duplicate
        const existing = await repo.findOne({ where: { name: validated.data.name } });
        if (existing) {
            return NextResponse.json({ error: "Specialization already exists" }, { status: 409 });
        }

        const specialization = repo.create(validated.data);
        await repo.save(specialization);

        return NextResponse.json({ success: true, specialization }, { status: 201 });
    } catch (error) {
        console.error("Error creating specialization:", error);
        return NextResponse.json({ error: "Failed to create specialization" }, { status: 500 });
    }
}
