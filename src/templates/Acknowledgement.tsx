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
} from "@react-email/components";
import * as React from "react";

interface AcknowledgementProps {
    recipientName: string;
    subject: string;
    submissionType: "application" | "inquiry" | "registration";
    additionalInfo?: string;
}

export default function Acknowledgement({
    recipientName,
    subject,
    submissionType,
    additionalInfo,
}: AcknowledgementProps) {
    const getTypeContent = () => {
        switch (submissionType) {
            case "application":
                return {
                    title: "Application Received",
                    message:
                        "We have received your application and our team will review it carefully.",
                    nextSteps:
                        "If your qualifications match our current needs, we will reach out within 5-7 business days.",
                };
            case "inquiry":
                return {
                    title: "Inquiry Received",
                    message:
                        "We have received your inquiry and appreciate you reaching out.",
                    nextSteps: "Our team will respond within 24-48 hours.",
                };
            case "registration":
                return {
                    title: "Registration Confirmed",
                    message: "Your registration has been successfully processed.",
                    nextSteps:
                        "You will receive further details about the event/program shortly.",
                };
        }
    };

    const content = getTypeContent();

    return (
        <Html>
            <Head />
            <Preview>
                {content.title} - {subject}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={logo}>MindWeal</Heading>
                        <Text style={tagline}>Untangle - Heal - Thrive</Text>
                    </Section>

                    <Section style={contentSection}>
                        <Heading as="h2" style={heading}>
                            {content.title} ✓
                        </Heading>

                        <Text style={paragraph}>Dear {recipientName},</Text>

                        <Text style={paragraph}>{content.message}</Text>

                        <Section style={infoBox}>
                            <Text style={infoLabel}>Regarding:</Text>
                            <Text style={infoValue}>{subject}</Text>
                        </Section>

                        {additionalInfo && (
                            <Text style={paragraph}>{additionalInfo}</Text>
                        )}

                        <Section style={nextStepsBox}>
                            <Text style={nextStepsTitle}>What happens next?</Text>
                            <Text style={nextStepsText}>{content.nextSteps}</Text>
                        </Section>

                        <Text style={paragraph}>
                            Thank you for your interest in MindWeal!
                        </Text>

                        <Text style={signature}>
                            Warm regards,
                            <br />
                            <strong>The MindWeal Team</strong>
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerText}>
                            If you have any questions, please contact us at hello@mindweal.in
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

const contentSection = {
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

const infoBox = {
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    padding: "16px",
    margin: "24px 0",
};

const infoLabel = {
    color: "#6B7280",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    margin: "0 0 4px",
};

const infoValue = {
    color: "#1F2937",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0",
};

const nextStepsBox = {
    backgroundColor: "#f0fdf9",
    borderRadius: "8px",
    padding: "16px",
    margin: "24px 0",
    borderLeft: "4px solid #00A99D",
};

const nextStepsTitle = {
    color: "#00A99D",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 8px",
};

const nextStepsText = {
    color: "#374151",
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
