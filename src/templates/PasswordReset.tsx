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

interface PasswordResetProps {
    name: string;
    resetUrl: string;
}

export default function PasswordReset({ name, resetUrl }: PasswordResetProps) {
    return (
        <Html>
            <Head />
            <Preview>Reset your password - Mindweal by Pihu Suri</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={logo}>Mindweal</Heading>
                        <Text style={tagline}>by Pihu Suri</Text>
                        <Text style={motto}>Untangle - Heal - Thrive</Text>
                    </Section>

                    <Section style={content}>
                        <Heading as="h2" style={heading}>
                            Reset Your Password
                        </Heading>

                        <Text style={paragraph}>Hi {name},</Text>

                        <Text style={paragraph}>
                            We received a request to reset your password for your Mindweal account.
                            Click the button below to create a new password.
                        </Text>

                        <Section style={buttonSection}>
                            <Button style={button} href={resetUrl}>
                                Reset Password
                            </Button>
                        </Section>

                        <Text style={paragraph}>
                            This link will expire in 1 hour for security reasons.
                        </Text>

                        <Text style={paragraph}>
                            If you didn&apos;t request a password reset, you can safely ignore this
                            email. Your password will remain unchanged.
                        </Text>

                        <Text style={signature}>
                            Best regards,
                            <br />
                            <strong>The Mindweal Team</strong>
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerText}>
                            If you&apos;re having trouble clicking the button, copy and paste this URL
                            into your browser: {resetUrl}
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
    wordBreak: "break-all" as const,
};
