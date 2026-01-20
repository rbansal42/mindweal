import { google } from "googleapis";
import { googleCalendarConfig } from "@/config";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

function getGoogleAuth() {
    if (!googleCalendarConfig.serviceAccountEmail || !googleCalendarConfig.privateKey) {
        return null;
    }

    return new google.auth.JWT({
        email: googleCalendarConfig.serviceAccountEmail,
        key: googleCalendarConfig.privateKey.replace(/\\n/g, "\n"),
        scopes: SCOPES,
    });
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
        const calendar = google.calendar({ version: "v3", auth });

        const event = await calendar.events.insert({
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
        const calendar = google.calendar({ version: "v3", auth });
        await calendar.events.delete({
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
