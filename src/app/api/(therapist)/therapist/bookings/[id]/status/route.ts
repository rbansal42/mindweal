import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";

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
        const { status } = body;

        if (!["confirmed", "completed", "no_show", "cancelled"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        const ds = await getDataSource();
        const bookingRepo = ds.getRepository(Booking);
        const therapistRepo = ds.getRepository(Therapist);

        const booking = await bookingRepo.findOne({ where: { id } });
        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Verify user has access
        const therapist = await therapistRepo.findOne({
            where: { id: booking.therapistId },
        });

        if (therapist?.email !== session.user.email && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        booking.status = status;
        await bookingRepo.save(booking);

        return NextResponse.json({
            success: true,
            booking: {
                id: booking.id,
                status: booking.status,
            },
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        return NextResponse.json(
            { error: "Failed to update status" },
            { status: 500 }
        );
    }
}
