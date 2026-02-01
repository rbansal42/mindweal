import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Hr,
    Button,
    Link,
} from "@react-email/components";
import * as React from "react";

interface BookingReminderProps {
    clientName: string;
    therapistName: string;
    sessionDate: string;
    sessionTime: string;
    sessionType: string;
    meetingType: "in_person" | "video" | "phone";
    meetingLink?: string;
    meetingLocation?: string;
    bookingReference: string;
    hoursUntil: number;
    manageUrl: string;
}

export default function BookingReminder({
    clientName,
    therapistName,
    sessionDate,
    sessionTime,
    sessionType,
    meetingType,
    meetingLink,
    meetingLocation,
    bookingReference,
    hoursUntil,
    manageUrl,
}: BookingReminderProps) {
    const meetingTypeLabels = {
        in_person: "In-Person",
        video: "Video Call",
        phone: "Phone Call",
    };

    const reminderText = hoursUntil === 1
        ? "Your session starts in 1 hour"
        : `Your session is tomorrow`;

    return (
        <Html>
            <Head />
            <Preview>{reminderText} - Mindweal by Pihu Suri</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={logo}>Mindweal</Heading>
                        <Text style={tagline}>by Pihu Suri</Text>
                        <Text style={motto}>Untangle - Heal - Thrive</Text>
                    </Section>

                    <Section style={content}>
                        <Heading as="h2" style={heading}>
                            Session Reminder
                        </Heading>

                        <Text style={paragraph}>Hi {clientName},</Text>

                        <Text style={highlightText}>
                            {reminderText}!
                        </Text>

                        <Section style={detailsBox}>
                            <table style={detailsTable}>
                                <tbody>
                                    <tr>
                                        <td style={detailLabel}>Reference:</td>
                                        <td style={detailValue}>{bookingReference}</td>
                                    </tr>
                                    <tr>
                                        <td style={detailLabel}>Therapist:</td>
                                        <td style={detailValue}>{therapistName}</td>
                                    </tr>
                                    <tr>
                                        <td style={detailLabel}>Date:</td>
                                        <td style={detailValue}>{sessionDate}</td>
                                    </tr>
                                    <tr>
                                        <td style={detailLabel}>Time:</td>
                                        <td style={detailValue}>{sessionTime}</td>
                                    </tr>
                                    <tr>
                                        <td style={detailLabel}>Session Type:</td>
                                        <td style={detailValue}>{sessionType}</td>
                                    </tr>
                                    <tr>
                                        <td style={detailLabel}>Format:</td>
                                        <td style={detailValue}>{meetingTypeLabels[meetingType]}</td>
                                    </tr>
                                    {meetingType === "video" && meetingLink && (
                                        <tr>
                                            <td style={detailLabel}>Meeting Link:</td>
                                            <td style={detailValue}>
                                                <Link href={meetingLink} style={linkStyle}>
                                                    Join Google Meet
                                                </Link>
                                            </td>
                                        </tr>
                                    )}
                                    {meetingType === "in_person" && meetingLocation && (
                                        <tr>
                                            <td style={detailLabel}>Location:</td>
                                            <td style={detailValue}>{meetingLocation}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </Section>

                        {meetingType === "video" && meetingLink && (
                            <Section style={buttonSection}>
                                <Button style={button} href={meetingLink}>
                                    Join Meeting
                                </Button>
                            </Section>
                        )}

                        <Section style={reminderBox}>
                            <Text style={reminderTitle}>Quick Checklist:</Text>
                            <Text style={reminderTextStyle}>
                                {meetingType === "video" ? (
                                    <>
                                        • Find a quiet, private space
                                        <br />
                                        • Check your internet connection
                                        <br />
                                        • Test camera & microphone
                                        <br />
                                        • Have water nearby
                                        <br />• Join 5 minutes early
                                    </>
                                ) : meetingType === "phone" ? (
                                    <>
                                        • Find a quiet, private space
                                        <br />
                                        • Ensure your phone is charged
                                        <br />
                                        • Have water nearby
                                        <br />• Be ready at the scheduled time
                                    </>
                                ) : (
                                    <>
                                        • Plan your route to the location
                                        <br />
                                        • Allow extra time for travel
                                        <br />
                                        • Have water with you
                                        <br />• Arrive 5-10 minutes early
                                    </>
                                )}
                            </Text>
                        </Section>

                        <Text style={paragraph}>
                            Need to reschedule? <Link href={manageUrl} style={linkStyle}>Manage your booking</Link>
                        </Text>

                        <Text style={signature}>
                            See you soon,
                            <br />
                            <strong>The Mindweal Team</strong>
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerText}>
                            Questions? Contact us at hello@mindweal.in
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    maxWidth: "600px",
};

const header = {
    padding: "32px 48px",
    textAlign: "center" as const,
    backgroundColor: "#f0fdf9",
};

const logo = {
    color: "#00A99D",
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0",
};

const tagline = {
    color: "#4A9E6B",
    fontSize: "14px",
    fontWeight: "500",
    margin: "4px 0 0",
};

const motto = {
    color: "#6B7280",
    fontSize: "12px",
    margin: "8px 0 0",
};

const content = {
    padding: "32px 48px",
};

const heading = {
    color: "#00A99D",
    fontSize: "24px",
    fontWeight: "600",
    margin: "0 0 24px",
};

const paragraph = {
    color: "#4B5563",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "16px 0",
};

const highlightText = {
    color: "#00A99D",
    fontSize: "20px",
    fontWeight: "600",
    lineHeight: "28px",
    margin: "16px 0",
};

const detailsBox = {
    backgroundColor: "#f0fdf9",
    borderRadius: "8px",
    padding: "24px",
    margin: "24px 0",
    borderLeft: "4px solid #00A99D",
};

const detailsTable = {
    width: "100%",
};

const detailLabel = {
    color: "#6B7280",
    fontSize: "14px",
    padding: "8px 0",
    verticalAlign: "top" as const,
    width: "120px",
};

const detailValue = {
    color: "#1F2937",
    fontSize: "14px",
    fontWeight: "600",
    padding: "8px 0",
    verticalAlign: "top" as const,
};

const linkStyle = {
    color: "#00A99D",
    textDecoration: "underline",
};

const buttonSection = {
    textAlign: "center" as const,
    margin: "24px 0",
};

const button = {
    backgroundColor: "#00A99D",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "12px 24px",
};

const reminderBox = {
    backgroundColor: "#ecfdf5",
    borderRadius: "8px",
    padding: "16px",
    margin: "24px 0",
    borderLeft: "4px solid #4A9E6B",
};

const reminderTitle = {
    color: "#166534",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 8px",
};

const reminderTextStyle = {
    color: "#166534",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0",
};

const signature = {
    color: "#4B5563",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "32px 0 0",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "0",
};

const footer = {
    padding: "24px 48px",
};

const footerText = {
    color: "#9CA3AF",
    fontSize: "12px",
    lineHeight: "18px",
    textAlign: "center" as const,
    margin: "0",
};
