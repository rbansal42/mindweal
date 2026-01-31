import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { format } from "date-fns";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import { createBookingSchema } from "@/lib/validation";
import { createGoogleMeetLink } from "@/lib/google-meet";
import { generateBookingICS } from "@/lib/ics";
import { sendEmail } from "@/lib/email";
import { appConfig, bookingConfig } from "@/config";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

export async function POST(request: NextRequest) {
    try {
        // Rate limit: 10 requests per minute
        const rateLimitKey = getRateLimitKey(request, "booking");
        const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 10 });

        if (rateLimit.limited) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
            );
        }

        const body = await request.json();

        // Validate input
        const validationResult = createBookingSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const sessionTypeRepo = ds.getRepository(SessionType);
        const bookingRepo = ds.getRepository(Booking);

        // Get therapist
        const therapist = await therapistRepo.findOne({
            where: { id: data.therapistId, isActive: true },
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist not found" },
                { status: 404 }
            );
        }

        // Get session type
        const sessionType = await sessionTypeRepo.findOne({
            where: { id: data.sessionTypeId, therapistId: data.therapistId, isActive: true },
        });

        if (!sessionType) {
            return NextResponse.json(
                { error: "Session type not found" },
                { status: 404 }
            );
        }

        // Check for session availability (get current user if logged in)
        const headersList = await headers();
        const session = await auth.api.getSession({ headers: headersList });

        // Generate booking reference
        const bookingReference = `MW-${nanoid(8).toUpperCase()}`;

        // Create Google Meet link for video sessions
        let meetingLink: string | null = null;
        if (sessionType.meetingType === "video") {
            meetingLink = await createGoogleMeetLink({
                summary: `Therapy Session - ${therapist.name}`,
                description: `Session with ${data.clientName} (${data.clientEmail})`,
                startTime: new Date(data.startDatetime),
                endTime: new Date(data.endDatetime),
                attendees: [
                    { email: data.clientEmail },
                    { email: therapist.email },
                ],
                requestId: bookingReference,
            });
        }

        // Create booking
        const booking = bookingRepo.create({
            bookingReference,
            therapistId: therapist.id,
            sessionTypeId: sessionType.id,
            clientId: session?.user?.id || null,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            clientPhone: data.clientPhone || null,
            startDatetime: new Date(data.startDatetime),
            endDatetime: new Date(data.endDatetime),
            timezone: data.timezone || bookingConfig.defaultTimezone,
            status: "confirmed",
            meetingType: sessionType.meetingType,
            meetingLink,
            meetingLocation: sessionType.meetingType === "in_person"
                ? "Mindweal Clinic, New Delhi"
                : null,
            clientNotes: data.clientNotes || null,
            createdBy: session?.user?.id || null,
        });

        await bookingRepo.save(booking);

        // Generate ICS file
        const icsContent = generateBookingICS({
            bookingReference: booking.bookingReference,
            clientName: booking.clientName,
            clientEmail: booking.clientEmail,
            therapistName: therapist.name,
            therapistEmail: therapist.email,
            startDatetime: booking.startDatetime,
            endDatetime: booking.endDatetime,
            sessionTypeName: sessionType.name,
            meetingType: booking.meetingType,
            meetingLink: booking.meetingLink,
            meetingLocation: booking.meetingLocation,
        });

        // Send confirmation email to client
        await sendEmail({
            to: data.clientEmail,
            subject: "Your therapy session is confirmed",
            template: "BookingConfirmationClient",
            data: {
                clientName: data.clientName,
                therapistName: therapist.name,
                sessionDate: format(new Date(data.startDatetime), "EEEE, MMMM d, yyyy"),
                sessionTime: format(new Date(data.startDatetime), "h:mm a") + " - " + format(new Date(data.endDatetime), "h:mm a"),
                sessionType: sessionType.name,
                meetingType: sessionType.meetingType,
                meetingLink: booking.meetingLink,
                meetingLocation: booking.meetingLocation,
                bookingReference: booking.bookingReference,
                manageUrl: `${appConfig.url}/booking/${booking.bookingReference}`,
            },
            attachments: [
                {
                    filename: "therapy-session.ics",
                    content: icsContent,
                    contentType: "text/calendar",
                },
            ],
        });

        // Send notification email to therapist
        await sendEmail({
            to: therapist.email,
            subject: "New booking received",
            template: "BookingConfirmationTherapist",
            data: {
                therapistName: therapist.name,
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                clientPhone: data.clientPhone,
                sessionDate: format(new Date(data.startDatetime), "EEEE, MMMM d, yyyy"),
                sessionTime: format(new Date(data.startDatetime), "h:mm a") + " - " + format(new Date(data.endDatetime), "h:mm a"),
                sessionType: sessionType.name,
                meetingType: sessionType.meetingType,
                meetingLink: booking.meetingLink,
                meetingLocation: booking.meetingLocation,
                bookingReference: booking.bookingReference,
                clientNotes: data.clientNotes,
                manageUrl: `${appConfig.url}/therapist/bookings/${booking.id}`,
            },
            attachments: [
                {
                    filename: "therapy-session.ics",
                    content: icsContent,
                    contentType: "text/calendar",
                },
            ],
        });

        return NextResponse.json({
            success: true,
            booking: {
                id: booking.id,
                bookingReference: booking.bookingReference,
                status: booking.status,
                startDatetime: booking.startDatetime,
                endDatetime: booking.endDatetime,
                meetingType: booking.meetingType,
                meetingLink: booking.meetingLink,
            },
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        );
    }
}
