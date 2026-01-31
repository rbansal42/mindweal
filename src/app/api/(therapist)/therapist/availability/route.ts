import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { TherapistAvailability } from "@/entities/TherapistAvailability";
import { Therapist } from "@/entities/Therapist";
import { auth } from "@/lib/auth";
import { availabilityInputSchema } from "@/lib/validation";

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
        const { therapistId } = body;
        
        // Validate input
        const validated = availabilityInputSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }
        const { dayOfWeek, startTime, endTime } = validated.data;

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const availabilityRepo = ds.getRepository(TherapistAvailability);

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

        // Create availability
        const availability = availabilityRepo.create({
            therapistId,
            dayOfWeek,
            startTime,
            endTime,
            isActive: true,
        });

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
        console.error("Error creating availability:", error);
        return NextResponse.json(
            { error: "Failed to create availability" },
            { status: 500 }
        );
    }
}
