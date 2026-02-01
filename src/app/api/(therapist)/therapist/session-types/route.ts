import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { SessionType } from "@/entities/SessionType";
import { Therapist } from "@/entities/Therapist";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { sessionTypeSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        
        // Validate input
        const validated = sessionTypeSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const { therapistId, name, duration, meetingType, price, description } = validated.data;

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const sessionTypeRepo = ds.getRepository(SessionType);

        const therapist = await therapistRepo.findOne({
            where: { id: therapistId },
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist not found" },
                { status: 404 }
            );
        }

        // Verify user has access
        if (therapist.email !== session.user.email && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const sessionType = sessionTypeRepo.create({
            therapistId,
            name,
            duration,
            meetingType,
            price: price ?? null,
            description: description ?? null,
            isActive: true,
            color: validated.data.color,
        });

        await sessionTypeRepo.save(sessionType);

        return NextResponse.json({
            success: true,
            sessionType: {
                id: sessionType.id,
                name: sessionType.name,
                duration: sessionType.duration,
                meetingType: sessionType.meetingType,
                price: sessionType.price,
                description: sessionType.description,
                isActive: sessionType.isActive,
            },
        });
    } catch (error) {
        console.error("Error creating session type:", error);
        return NextResponse.json(
            { error: "Failed to create session type" },
            { status: 500 }
        );
    }
}
