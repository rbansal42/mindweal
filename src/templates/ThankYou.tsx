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

interface ThankYouEmailProps {
    name: string;
    message?: string;
}

export default function ThankYouEmail({ name, message }: ThankYouEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Thank you for reaching out to MindWeal</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={logo}>MindWeal</Heading>
                        <Text style={tagline}>Untangle - Heal - Thrive</Text>
                    </Section>

                    <Section style={content}>
                        <Heading as="h2" style={heading}>
                            Thank you, {name}!
                        </Heading>

                        <Text style={paragraph}>
                            We have received your message and appreciate you taking the time
                            to contact us.
                        </Text>

                        <Text style={paragraph}>
                            Our team will review your inquiry and get back to you as soon as
                            possible, typically within 24-48 hours.
                        </Text>

                        {message && (
                            <Section style={messageBox}>
                                <Text style={messageLabel}>Your Message:</Text>
                                <Text style={messageText}>{message}</Text>
                            </Section>
                        )}

                        <Text style={paragraph}>
                            If you have any urgent concerns in the meantime, please don&apos;t
                            hesitate to call us.
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
                            This email was sent because you submitted a contact form on our
                            website.
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
    color: "#1F2937",
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

const messageBox = {
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    padding: "16px",
    margin: "24px 0",
};

const messageLabel = {
    color: "#6B7280",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 8px",
};

const messageText = {
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
