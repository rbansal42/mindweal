import ical, { ICalCalendarMethod, ICalEventStatus } from "ical-generator";
import { appConfig } from "@/config";

interface CalendarEventOptions {
    title: string;
    description: string;
    start: Date;
    end: Date;
    location?: string;
    url?: string;
    organizer?: {
        name: string;
        email: string;
    };
    attendees?: Array<{
        name: string;
        email: string;
    }>;
    bookingReference: string;
}

export function generateCalendarInvite(options: CalendarEventOptions): string {
    const {
        title,
        description,
        start,
        end,
        location,
        url,
        organizer,
        attendees,
        bookingReference,
    } = options;

    const calendar = ical({
        name: `${appConfig.name} by Pihu Suri`,
        method: ICalCalendarMethod.REQUEST,
        prodId: {
            company: "Mindweal by Pihu Suri",
            product: "Booking System",
            language: "EN",
        },
    });

    const event = calendar.createEvent({
        id: bookingReference,
        start,
        end,
        summary: title,
        description,
        location,
        url,
        status: ICalEventStatus.CONFIRMED,
        busystatus: "BUSY" as any,
    });

    if (organizer) {
        event.organizer({
            name: organizer.name,
            email: organizer.email,
        });
    }

    if (attendees && attendees.length > 0) {
        attendees.forEach(attendee => {
            event.createAttendee({
                name: attendee.name,
                email: attendee.email,
                rsvp: true,
                status: "NEEDS-ACTION" as any,
                role: "REQ-PARTICIPANT" as any,
            });
        });
    }

    // Add reminder 24 hours before
    event.createAlarm({
        type: "display" as any,
        trigger: 24 * 60 * 60, // 24 hours in seconds
        description: `Reminder: ${title} tomorrow`,
    });

    // Add reminder 1 hour before
    event.createAlarm({
        type: "display" as any,
        trigger: 60 * 60, // 1 hour in seconds
        description: `Reminder: ${title} in 1 hour`,
    });

    return calendar.toString();
}

export function generateBookingICS(booking: {
    bookingReference: string;
    clientName: string;
    clientEmail: string;
    therapistName: string;
    therapistEmail: string;
    startDatetime: Date;
    endDatetime: Date;
    sessionTypeName: string;
    meetingType: "in_person" | "video" | "phone";
    meetingLink?: string | null;
    meetingLocation?: string | null;
}): string {
    const {
        bookingReference,
        clientName,
        clientEmail,
        therapistName,
        therapistEmail,
        startDatetime,
        endDatetime,
        sessionTypeName,
        meetingType,
        meetingLink,
        meetingLocation,
    } = booking;

    const meetingTypeLabels = {
        in_person: "In-Person",
        video: "Video Call",
        phone: "Phone Call",
    };

    let location = "";
    if (meetingType === "video" && meetingLink) {
        location = meetingLink;
    } else if (meetingType === "in_person" && meetingLocation) {
        location = meetingLocation;
    } else if (meetingType === "phone") {
        location = "Phone Call";
    }

    const description = `
Therapy Session with ${therapistName}
Session Type: ${sessionTypeName}
Format: ${meetingTypeLabels[meetingType]}
${meetingType === "video" && meetingLink ? `\nMeeting Link: ${meetingLink}` : ""}
${meetingType === "in_person" && meetingLocation ? `\nLocation: ${meetingLocation}` : ""}

Booking Reference: ${bookingReference}

---
Mindweal by Pihu Suri
Untangle - Heal - Thrive
    `.trim();

    return generateCalendarInvite({
        title: `Therapy Session - ${therapistName}`,
        description,
        start: startDatetime,
        end: endDatetime,
        location,
        url: meetingType === "video" && meetingLink ? meetingLink : undefined,
        organizer: {
            name: `Mindweal by Pihu Suri`,
            email: therapistEmail,
        },
        attendees: [
            { name: clientName, email: clientEmail },
            { name: therapistName, email: therapistEmail },
        ],
        bookingReference,
    });
}
