import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import { rescheduleBookingSchema, cancelBookingSchema } from "@/lib/validation";
import { generateBookingICS } from "@/lib/ics";
import { sendEmail } from "@/lib/email";
import { appConfig } from "@/config";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

// Get booking by ID or reference
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Rate limiting
        const rateLimitKey = getRateLimitKey(request, "booking-lookup");
        const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 20, windowMs: 60000 });
        if (rateLimit.limited) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
            );
        }

        const { id } = await params;

        // Check authentication or email param
        const headersList = await headers();
        const session = await auth.api.getSession({ headers: headersList });
        
        const url = new URL(request.url);
        const emailParam = url.searchParams.get("email");

        if (!session && !emailParam) {
            return NextResponse.json(
                { error: "Authentication required or provide email parameter" },
                { status: 401 }
            );
        }

        const ds = await getDataSource();
        const bookingRepo = ds.getRepository(Booking);
        const therapistRepo = ds.getRepository(Therapist);
        const sessionTypeRepo = ds.getRepository(SessionType);

        // Try to find by ID first, then by reference
        let booking = await bookingRepo.findOne({ where: { id } });

        if (!booking) {
            booking = await bookingRepo.findOne({ where: { bookingReference: id } });
        }

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Verify ownership for unauthenticated requests
        if (!session && emailParam !== booking.clientEmail) {
            return NextResponse.json(
                { error: "Email does not match booking" },
                { status: 403 }
            );
        }

        // Fetch related data
        const therapist = await therapistRepo.findOne({ where: { id: booking.therapistId } });
        const sessionType = booking.sessionTypeId
            ? await sessionTypeRepo.findOne({ where: { id: booking.sessionTypeId } })
            : null;

        return NextResponse.json({
            booking: {
                id: booking.id,
                bookingReference: booking.bookingReference,
                clientName: booking.clientName,
                clientEmail: booking.clientEmail,
                clientPhone: booking.clientPhone,
                startDatetime: booking.startDatetime,
                endDatetime: booking.endDatetime,
                timezone: booking.timezone,
                status: booking.status,
                meetingType: booking.meetingType,
                meetingLink: booking.meetingLink,
                meetingLocation: booking.meetingLocation,
                clientNotes: booking.clientNotes,
                therapist: therapist
                    ? {
                          id: therapist.id,
                          name: therapist.name,
                          slug: therapist.slug,
                          photoUrl: therapist.photoUrl,
                      }
                    : null,
                sessionType: sessionType
                    ? {
                          id: sessionType.id,
                          name: sessionType.name,
                          duration: sessionType.duration,
                      }
                    : null,
                createdAt: booking.createdAt,
            },
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json(
            { error: "Failed to fetch booking" },
            { status: 500 }
        );
    }
}

// Reschedule booking
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Rate limiting
        const rateLimitKey = getRateLimitKey(request, "booking-reschedule");
        const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 10, windowMs: 60000 });
        if (rateLimit.limited) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
            );
        }

        const { id } = await params;
        const body = await request.json();

        const validationResult = rescheduleBookingSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Check authentication or email in body
        const headersList = await headers();
        const session = await auth.api.getSession({ headers: headersList });

        if (!session && !data.bookingEmail) {
            return NextResponse.json(
                { error: "Authentication required or provide bookingEmail" },
                { status: 401 }
            );
        }

        const ds = await getDataSource();
        const bookingRepo = ds.getRepository(Booking);
        const therapistRepo = ds.getRepository(Therapist);
        const sessionTypeRepo = ds.getRepository(SessionType);

        // Find booking
        let booking = await bookingRepo.findOne({
            where: { id },
        });

        if (!booking) {
            booking = await bookingRepo.findOne({
                where: { bookingReference: id },
            });
        }

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Verify ownership for unauthenticated requests
        if (!session && data.bookingEmail !== booking.clientEmail) {
            return NextResponse.json(
                { error: "Email does not match booking" },
                { status: 403 }
            );
        }

        if (booking.status === "cancelled") {
            return NextResponse.json(
                { error: "Cannot reschedule a cancelled booking" },
                { status: 400 }
            );
        }

        // Get therapist and session type for email
        const therapist = await therapistRepo.findOne({
            where: { id: booking.therapistId },
        });

        const sessionType = await sessionTypeRepo.findOne({
            where: { id: booking.sessionTypeId || undefined },
        });

        const oldStartDatetime = booking.startDatetime;

        // Update booking
        booking.startDatetime = new Date(data.startDatetime);
        booking.endDatetime = new Date(data.endDatetime);
        if (data.timezone) {
            booking.timezone = data.timezone;
        }

        await bookingRepo.save(booking);

        // Generate new ICS file
        const icsContent = generateBookingICS({
            bookingReference: booking.bookingReference,
            clientName: booking.clientName,
            clientEmail: booking.clientEmail,
            therapistName: therapist?.name || "Therapist",
            therapistEmail: therapist?.email || "",
            startDatetime: booking.startDatetime,
            endDatetime: booking.endDatetime,
            sessionTypeName: sessionType?.name || "Session",
            meetingType: booking.meetingType,
            meetingLink: booking.meetingLink,
            meetingLocation: booking.meetingLocation,
        });

        // Send update emails
        if (therapist) {
            // Email to client
            await sendEmail({
                to: booking.clientEmail,
                subject: "Your therapy session has been rescheduled",
                template: "BookingConfirmationClient",
                data: {
                    clientName: booking.clientName,
                    therapistName: therapist.name,
                    sessionDate: format(booking.startDatetime, "EEEE, MMMM d, yyyy"),
                    sessionTime: format(booking.startDatetime, "h:mm a") + " - " + format(booking.endDatetime, "h:mm a"),
                    sessionType: sessionType?.name || "Session",
                    meetingType: booking.meetingType,
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

            // Email to therapist
            await sendEmail({
                to: therapist.email,
                subject: "Session rescheduled",
                template: "BookingConfirmationTherapist",
                data: {
                    therapistName: therapist.name,
                    clientName: booking.clientName,
                    clientEmail: booking.clientEmail,
                    clientPhone: booking.clientPhone,
                    sessionDate: format(booking.startDatetime, "EEEE, MMMM d, yyyy"),
                    sessionTime: format(booking.startDatetime, "h:mm a") + " - " + format(booking.endDatetime, "h:mm a"),
                    sessionType: sessionType?.name || "Session",
                    meetingType: booking.meetingType,
                    meetingLink: booking.meetingLink,
                    meetingLocation: booking.meetingLocation,
                    bookingReference: booking.bookingReference,
                    clientNotes: booking.clientNotes,
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
        }

        return NextResponse.json({
            success: true,
            booking: {
                id: booking.id,
                bookingReference: booking.bookingReference,
                startDatetime: booking.startDatetime,
                endDatetime: booking.endDatetime,
                status: booking.status,
            },
        });
    } catch (error) {
        console.error("Error rescheduling booking:", error);
        return NextResponse.json(
            { error: "Failed to reschedule booking" },
            { status: 500 }
        );
    }
}

// Cancel booking
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));

        const validationResult = cancelBookingSchema.safeParse(body);
        const reason = validationResult.success
            ? validationResult.data.reason
            : "No reason provided";
        const bookingEmail = validationResult.success
            ? validationResult.data.bookingEmail
            : undefined;

        // Get current user first for auth check
        const headersList = await headers();
        const session = await auth.api.getSession({ headers: headersList });

        if (!session && !bookingEmail) {
            return NextResponse.json(
                { error: "Authentication required or provide bookingEmail" },
                { status: 401 }
            );
        }

        const ds = await getDataSource();
        const bookingRepo = ds.getRepository(Booking);
        const therapistRepo = ds.getRepository(Therapist);
        const sessionTypeRepo = ds.getRepository(SessionType);

        // Find booking
        let booking = await bookingRepo.findOne({
            where: { id },
        });

        if (!booking) {
            booking = await bookingRepo.findOne({
                where: { bookingReference: id },
            });
        }

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Verify ownership for unauthenticated requests
        if (!session && bookingEmail !== booking.clientEmail) {
            return NextResponse.json(
                { error: "Email does not match booking" },
                { status: 403 }
            );
        }

        if (booking.status === "cancelled") {
            return NextResponse.json(
                { error: "Booking is already cancelled" },
                { status: 400 }
            );
        }

        // Get therapist and session type for email
        const therapist = await therapistRepo.findOne({
            where: { id: booking.therapistId },
        });

        const sessionType = await sessionTypeRepo.findOne({
            where: { id: booking.sessionTypeId || undefined },
        });

        // Update booking
        booking.status = "cancelled";
        booking.cancellationReason = reason;
        booking.cancelledBy = session?.user?.id || booking.clientEmail;
        booking.cancelledAt = new Date();

        await bookingRepo.save(booking);

        // Send cancellation emails
        if (therapist) {
            // Email to client
            await sendEmail({
                to: booking.clientEmail,
                subject: "Your therapy session has been cancelled",
                template: "BookingCancellation",
                data: {
                    recipientName: booking.clientName,
                    therapistName: therapist.name,
                    sessionDate: format(booking.startDatetime, "EEEE, MMMM d, yyyy"),
                    sessionTime: format(booking.startDatetime, "h:mm a") + " - " + format(booking.endDatetime, "h:mm a"),
                    sessionType: sessionType?.name || "Session",
                    bookingReference: booking.bookingReference,
                    cancellationReason: reason,
                    rebookUrl: `${appConfig.url}/book/${therapist.slug}`,
                },
            });

            // Email to therapist
            await sendEmail({
                to: therapist.email,
                subject: "Session cancelled",
                template: "BookingCancellation",
                data: {
                    recipientName: therapist.name,
                    therapistName: therapist.name,
                    clientName: booking.clientName,
                    sessionDate: format(booking.startDatetime, "EEEE, MMMM d, yyyy"),
                    sessionTime: format(booking.startDatetime, "h:mm a") + " - " + format(booking.endDatetime, "h:mm a"),
                    sessionType: sessionType?.name || "Session",
                    bookingReference: booking.bookingReference,
                    cancellationReason: reason,
                },
            });
        }

        return NextResponse.json({
            success: true,
            booking: {
                id: booking.id,
                bookingReference: booking.bookingReference,
                status: booking.status,
            },
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return NextResponse.json(
            { error: "Failed to cancel booking" },
            { status: 500 }
        );
    }
}
