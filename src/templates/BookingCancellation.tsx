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

interface BookingCancellationProps {
    recipientName: string;
    isTherapist: boolean;
    clientName: string;
    therapistName: string;
    sessionDate: string;
    sessionTime: string;
    sessionType: string;
    bookingReference: string;
    cancellationReason?: string;
    rebookUrl: string;
}

export default function BookingCancellation({
    recipientName,
    isTherapist,
    clientName,
    therapistName,
    sessionDate,
    sessionTime,
    sessionType,
    bookingReference,
    cancellationReason,
    rebookUrl,
}: BookingCancellationProps) {
    return (
        <Html>
            <Head />
            <Preview>Session cancelled: {sessionDate} - Mindweal by Pihu Suri</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={logo}>Mindweal</Heading>
                        <Text style={tagline}>by Pihu Suri</Text>
                        <Text style={motto}>Untangle - Heal - Thrive</Text>
                    </Section>

                    <Section style={content}>
                        <Heading as="h2" style={heading}>
                            Session Cancelled
                        </Heading>

                        <Text style={paragraph}>Hi {recipientName},</Text>

                        <Text style={paragraph}>
                            {isTherapist
                                ? `The following session with ${clientName} has been cancelled.`
                                : `Your therapy session with ${therapistName} has been cancelled.`}
                        </Text>

                        <Section style={detailsBox}>
                            <table style={detailsTable}>
                                <tbody>
                                    <tr>
                                        <td style={detailLabel}>Reference:</td>
                                        <td style={detailValue}>{bookingReference}</td>
                                    </tr>
                                    {isTherapist ? (
                                        <tr>
                                            <td style={detailLabel}>Client:</td>
                                            <td style={detailValue}>{clientName}</td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td style={detailLabel}>Therapist:</td>
                                            <td style={detailValue}>{therapistName}</td>
                                        </tr>
                                    )}
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

                        {cancellationReason && (
                            <Section style={reasonBox}>
                                <Text style={reasonTitle}>Reason for cancellation:</Text>
                                <Text style={reasonText}>{cancellationReason}</Text>
                            </Section>
                        )}

                        {!isTherapist && (
                            <>
                                <Text style={paragraph}>
                                    We understand that plans change. If you&apos;d like to book another
                                    session, you can do so using the link below.
                                </Text>

                                <Section style={buttonSection}>
                                    <Button style={button} href={rebookUrl}>
                                        Book Another Session
                                    </Button>
                                </Section>
                            </>
                        )}

                        <Text style={signature}>
                            Best regards,
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
    color: "#EF4444",
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
    backgroundColor: "#fef2f2",
    borderRadius: "8px",
    padding: "24px",
    margin: "24px 0",
    borderLeft: "4px solid #EF4444",
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

const reasonBox = {
    backgroundColor: "#fef9e7",
    borderRadius: "8px",
    padding: "16px",
    margin: "24px 0",
};

const reasonTitle = {
    color: "#92400e",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 8px",
};

const reasonText = {
    color: "#78350f",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0",
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
