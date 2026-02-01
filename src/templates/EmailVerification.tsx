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

interface EmailVerificationProps {
    name: string;
    verificationUrl: string;
}

export default function EmailVerification({ name, verificationUrl }: EmailVerificationProps) {
    return (
        <Html>
            <Head />
            <Preview>Verify your email - Mindweal by Pihu Suri</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={logo}>Mindweal</Heading>
                        <Text style={tagline}>by Pihu Suri</Text>
                        <Text style={motto}>Untangle - Heal - Thrive</Text>
                    </Section>

                    <Section style={content}>
                        <Heading as="h2" style={heading}>
                            Welcome to Mindweal!
                        </Heading>

                        <Text style={paragraph}>Hi {name},</Text>

                        <Text style={paragraph}>
                            Thank you for creating an account with Mindweal. To complete your
                            registration and start booking therapy sessions, please verify your
                            email address.
                        </Text>

                        <Section style={buttonSection}>
                            <Button style={button} href={verificationUrl}>
                                Verify Email Address
                            </Button>
                        </Section>

                        <Text style={paragraph}>
                            This link will expire in 24 hours.
                        </Text>

                        <Section style={infoBox}>
                            <Text style={infoTitle}>What you can do with your account:</Text>
                            <Text style={infoText}>
                                • Book therapy sessions with our therapists
                                <br />
                                • View and manage your appointments
                                <br />
                                • Reschedule or cancel bookings
                                <br />• Access your session history
                            </Text>
                        </Section>

                        <Text style={signature}>
                            We&apos;re here to support you,
                            <br />
                            <strong>The Mindweal Team</strong>
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerText}>
                            If you didn&apos;t create an account with Mindweal, you can safely
                            ignore this email.
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

const buttonSection = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const button = {
    backgroundColor: "#00A99D",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "14px 32px",
};

const infoBox = {
    backgroundColor: "#f0fdf9",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
    borderLeft: "4px solid #00A99D",
};

const infoTitle = {
    color: "#00A99D",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 12px",
};

const infoText = {
    color: "#4B5563",
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
