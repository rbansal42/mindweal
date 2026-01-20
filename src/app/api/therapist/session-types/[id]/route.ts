import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { SessionType } from "@/entities/SessionType";
import { Therapist } from "@/entities/Therapist";
import { auth } from "@/lib/auth";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

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

        const userRole = (session.user as any).role;
        if (therapist?.email !== session.user.email && userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update fields
        if (body.name !== undefined) sessionType.name = body.name;
        if (body.duration !== undefined) sessionType.duration = body.duration;
        if (body.meetingType !== undefined) sessionType.meetingType = body.meetingType;
        if (body.price !== undefined) sessionType.price = body.price;
        if (body.description !== undefined) sessionType.description = body.description;
        if (body.isActive !== undefined) sessionType.isActive = body.isActive;

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
        const session = await auth.api.getSession({ headers: request.headers });
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

        const userRole = (session.user as any).role;
        if (therapist?.email !== session.user.email && userRole !== "admin") {
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
