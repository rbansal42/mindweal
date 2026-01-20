import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { BlockedDate } from "@/entities/BlockedDate";
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
        const { therapistId, startDatetime, endDatetime, reason, isAllDay } = body;

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const blockedDateRepo = ds.getRepository(BlockedDate);

        // Verify therapist exists and user has access
        const therapist = await therapistRepo.findOne({
            where: { id: therapistId },
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist not found" },
                { status: 404 }
            );
        }

        // Check if user has access (is the therapist or admin)
        const userRole = (session.user as any).role;
        if (therapist.email !== session.user.email && userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Create blocked date
        const blockedDate = blockedDateRepo.create({
            therapistId,
            startDatetime: new Date(startDatetime),
            endDatetime: new Date(endDatetime),
            reason: reason || null,
            isAllDay: isAllDay || false,
        });

        await blockedDateRepo.save(blockedDate);

        return NextResponse.json({
            success: true,
            blockedDate: {
                id: blockedDate.id,
                startDatetime: blockedDate.startDatetime,
                endDatetime: blockedDate.endDatetime,
                reason: blockedDate.reason,
                isAllDay: blockedDate.isAllDay,
            },
        });
    } catch (error) {
        console.error("Error creating blocked date:", error);
        return NextResponse.json(
            { error: "Failed to create blocked date" },
            { status: 500 }
        );
    }
}
