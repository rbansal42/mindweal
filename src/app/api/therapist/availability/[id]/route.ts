import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { TherapistAvailability } from "@/entities/TherapistAvailability";
import { Therapist } from "@/entities/Therapist";
import { auth } from "@/lib/auth";

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
