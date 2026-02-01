import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { SessionType } from "@/entities/SessionType";
import { Therapist } from "@/entities/Therapist";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { updateSessionTypeSchema } from "@/lib/validation";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Validate input
        const validated = updateSessionTypeSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const ds = await getDataSource();
        const sessionTypeRepo = ds.getRepository(SessionType);
        const therapistRepo = ds.getRepository(Therapist);

        const sessionType = await sessionTypeRepo.findOne({ where: { id } });
        if (!sessionType) {
            return NextResponse.json(
                { error: "Session type not found" },
                { status: 404 }
            );
        }

        // Verify user has access
        const therapist = await therapistRepo.findOne({
            where: { id: sessionType.therapistId },
        });

        if (therapist?.email !== session.user.email && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update fields from validated data
        if (validated.data.name !== undefined) sessionType.name = validated.data.name;
        if (validated.data.duration !== undefined) sessionType.duration = validated.data.duration;
        if (validated.data.meetingType !== undefined) sessionType.meetingType = validated.data.meetingType;
        if (validated.data.price !== undefined) sessionType.price = validated.data.price;
        if (validated.data.description !== undefined) sessionType.description = validated.data.description;
        if (validated.data.isActive !== undefined) sessionType.isActive = validated.data.isActive;
        if (validated.data.color !== undefined) sessionType.color = validated.data.color;

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
        console.error("Error updating session type:", error);
        return NextResponse.json(
            { error: "Failed to update session type" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const ds = await getDataSource();
        const sessionTypeRepo = ds.getRepository(SessionType);
        const therapistRepo = ds.getRepository(Therapist);

        const sessionType = await sessionTypeRepo.findOne({ where: { id } });
        if (!sessionType) {
            return NextResponse.json(
                { error: "Session type not found" },
                { status: 404 }
            );
        }

        // Verify user has access
        const therapist = await therapistRepo.findOne({
            where: { id: sessionType.therapistId },
        });

        if (therapist?.email !== session.user.email && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await sessionTypeRepo.remove(sessionType);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting session type:", error);
        return NextResponse.json(
            { error: "Failed to delete session type" },
            { status: 500 }
        );
    }
}
