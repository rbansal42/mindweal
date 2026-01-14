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
} from "@react-email/components";
import * as React from "react";

interface BookingConfirmationProps {
    clientName: string;
    therapistName: string;
    sessionDate: string;
    sessionTime: string;
    sessionType: string;
    calendarLink?: string;
}

export default function BookingConfirmation({
    clientName,
    therapistName,
    sessionDate,
    sessionTime,
    sessionType,
    calendarLink,
}: BookingConfirmationProps) {
    return (
        <Html>
            <Head />
            <Preview>Your therapy session is confirmed - MindWeal</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={logo}>MindWeal</Heading>
                        <Text style={tagline}>Untangle - Heal - Thrive</Text>
                    </Section>

                    <Section style={content}>
                        <Heading as="h2" style={heading}>
                            Session Confirmed! ✓
                        </Heading>

                        <Text style={paragraph}>Dear {clientName},</Text>

                        <Text style={paragraph}>
                            Your therapy session has been successfully booked. Here are the
                            details:
                        </Text>

                        <Section style={detailsBox}>
                            <table style={detailsTable}>
                                <tbody>
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
                                </tbody>
                            </table>
                        </Section>

                        {calendarLink && (
                            <Section style={buttonSection}>
                                <Button style={button} href={calendarLink}>
                                    Add to Calendar
                                </Button>
                            </Section>
                        )}

                        <Section style={reminderBox}>
                            <Text style={reminderTitle}>Before Your Session:</Text>
                            <Text style={reminderText}>
                                • Find a quiet, private space
                                <br />
                                • Ensure stable internet connection (for online sessions)
                                <br />
                                • Have water nearby
                                <br />• Arrive 5 minutes early
                            </Text>
                        </Section>

                        <Text style={paragraph}>
                            Need to reschedule? Please do so at least 24 hours before your
                            appointment.
                        </Text>

                        <Text style={signature}>
                            Looking forward to seeing you,
                            <br />
                            <strong>The MindWeal Team</strong>
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerText}>
                            If you need to cancel or reschedule, please contact us at
                            hello@mindweal.in
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
    color: "#6B4C9A",
    fontSize: "14px",
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
    backgroundColor: "#fef3c7",
    borderRadius: "8px",
    padding: "16px",
    margin: "24px 0",
};

const reminderTitle = {
    color: "#92400e",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 8px",
};

const reminderText = {
    color: "#92400e",
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
