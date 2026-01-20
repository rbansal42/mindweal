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

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { therapistId, name, duration, meetingType, price, description } = body;

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
        const userRole = (session.user as any).role;
        if (therapist.email !== session.user.email && userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const sessionType = sessionTypeRepo.create({
            therapistId,
            name,
            duration,
            meetingType,
            price: price || null,
            description: description || null,
            isActive: true,
            color: "#00A99D",
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
