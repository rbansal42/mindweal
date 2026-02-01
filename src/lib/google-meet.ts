import { calendar_v3, calendar } from "@googleapis/calendar";
import { JWT } from "google-auth-library";
import { googleCalendarConfig } from "@/config";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

function getGoogleAuth(): JWT | null {
    if (!googleCalendarConfig.serviceAccountEmail || !googleCalendarConfig.privateKey) {
        return null;
    }

    return new JWT({
        email: googleCalendarConfig.serviceAccountEmail,
        key: googleCalendarConfig.privateKey.replace(/\\n/g, "\n"),
        scopes: SCOPES,
    });
}

function getCalendarClient(auth: JWT): calendar_v3.Calendar {
    return calendar({ version: "v3", auth });
}

interface MeetLinkOptions {
    summary: string;
    description: string;
    startTime: Date;
    endTime: Date;
    attendees: Array<{ email: string }>;
    requestId: string;
}

export async function createGoogleMeetLink(
    options: MeetLinkOptions
): Promise<string | null> {
    const auth = getGoogleAuth();

    if (!auth) {
        console.warn("Google Calendar API not configured. Skipping Meet link generation.");
        return null;
    }

    try {
        const calendarClient = getCalendarClient(auth);

        const event = await calendarClient.events.insert({
            calendarId: "primary",
            requestBody: {
                summary: options.summary,
                description: options.description,
                start: {
                    dateTime: options.startTime.toISOString(),
                    timeZone: "Asia/Kolkata",
                },
                end: {
                    dateTime: options.endTime.toISOString(),
                    timeZone: "Asia/Kolkata",
                },
                attendees: options.attendees,
                conferenceData: {
                    createRequest: {
                        requestId: options.requestId,
                        conferenceSolutionKey: {
                            type: "hangoutsMeet",
                        },
                    },
                },
            },
            conferenceDataVersion: 1,
            sendUpdates: "none",
        });

        return event.data.hangoutLink || null;
    } catch (error) {
        console.error("Failed to create Google Meet link:", error);
        return null;
    }
}

export async function deleteGoogleCalendarEvent(
    eventId: string
): Promise<boolean> {
    const auth = getGoogleAuth();

    if (!auth) {
        return false;
    }

    try {
        const calendarClient = getCalendarClient(auth);
        await calendarClient.events.delete({
            calendarId: "primary",
            eventId,
            sendUpdates: "all",
        });
        return true;
    } catch (error) {
        console.error("Failed to delete Google Calendar event:", error);
        return false;
    }
}
