import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { TherapistAvailability } from "@/entities/TherapistAvailability";
import { Therapist } from "@/entities/Therapist";
import { auth } from "@/lib/auth";
import { updateAvailabilitySchema } from "@/lib/validation";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
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
        const availabilityRepo = ds.getRepository(TherapistAvailability);
        const therapistRepo = ds.getRepository(Therapist);

        const availability = await availabilityRepo.findOne({
            where: { id },
        });

        if (!availability) {
            return NextResponse.json(
                { error: "Availability not found" },
                { status: 404 }
            );
        }

        // Verify user has access
        const therapist = await therapistRepo.findOne({
            where: { id: availability.therapistId },
        });

        const userRole = (session.user as any).role;
        if (therapist?.email !== session.user.email && userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await availabilityRepo.remove(availability);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting availability:", error);
        return NextResponse.json(
            { error: "Failed to delete availability" },
            { status: 500 }
        );
    }
}

export async function PUT(
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

        // Validate input (without therapistId - it comes from existing record)
        const validated = updateAvailabilitySchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const ds = await getDataSource();
        const availabilityRepo = ds.getRepository(TherapistAvailability);
        const therapistRepo = ds.getRepository(Therapist);

        const availability = await availabilityRepo.findOne({
            where: { id },
        });

        if (!availability) {
            return NextResponse.json(
                { error: "Availability not found" },
                { status: 404 }
            );
        }

        // Verify user has access
        const therapist = await therapistRepo.findOne({
            where: { id: availability.therapistId },
        });

        const userRole = (session.user as any).role;
        if (therapist?.email !== session.user.email && userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update availability
        availability.dayOfWeek = validated.data.dayOfWeek;
        availability.startTime = validated.data.startTime;
        availability.endTime = validated.data.endTime;

        await availabilityRepo.save(availability);

        return NextResponse.json({
            success: true,
            availability: {
                id: availability.id,
                dayOfWeek: availability.dayOfWeek,
                startTime: availability.startTime,
                endTime: availability.endTime,
                isActive: availability.isActive,
            },
        });
    } catch (error) {
        console.error("Error updating availability:", error);
        return NextResponse.json(
            { error: "Failed to update availability" },
            { status: 500 }
        );
    }
}
