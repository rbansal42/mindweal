import { NextRequest, NextResponse } from "next/server";
import { generateBookingICS } from "@/lib/ics";

// Dynamic import to avoid circular dependency issues at build time
async function getBookingData(id: string) {
    const { AppDataSource } = await import("@/lib/db");
    const { Booking } = await import("@/entities/Booking");
    const { Therapist } = await import("@/entities/Therapist");
    const { SessionType } = await import("@/entities/SessionType");

    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    const bookingRepo = AppDataSource.getRepository(Booking);
    const therapistRepo = AppDataSource.getRepository(Therapist);
    const sessionTypeRepo = AppDataSource.getRepository(SessionType);

    // Find booking by ID or reference
    let booking = await bookingRepo.findOne({ where: { id } });
    if (!booking) {
        booking = await bookingRepo.findOne({ where: { bookingReference: id } });
    }

    if (!booking) return null;

    const therapist = await therapistRepo.findOne({ where: { id: booking.therapistId } });
    const sessionType = booking.sessionTypeId
        ? await sessionTypeRepo.findOne({ where: { id: booking.sessionTypeId } })
        : null;

    return { booking, therapist, sessionType };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await getBookingData(id);

        if (!data || !data.booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (!data.therapist) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        const { booking, therapist, sessionType } = data;

        const icsContent = generateBookingICS({
            bookingReference: booking.bookingReference,
            clientName: booking.clientName,
            clientEmail: booking.clientEmail,
            therapistName: therapist.name,
            therapistEmail: therapist.email,
            startDatetime: booking.startDatetime,
            endDatetime: booking.endDatetime,
            sessionTypeName: sessionType?.name || "Session",
            meetingType: booking.meetingType,
            meetingLink: booking.meetingLink,
            meetingLocation: booking.meetingLocation,
        });

        return new NextResponse(icsContent, {
            status: 200,
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": `attachment; filename="${booking.bookingReference}.ics"`,
            },
        });
    } catch (error) {
        console.error("Error generating ICS:", error);
        return NextResponse.json({ error: "Failed to generate calendar file" }, { status: 500 });
    }
}
