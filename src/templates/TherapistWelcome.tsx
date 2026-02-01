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

interface TherapistWelcomeProps {
    therapistName: string;
    email: string;
    temporaryPassword: string;
    loginUrl: string;
}

export default function TherapistWelcome({
    therapistName,
    email,
    temporaryPassword,
    loginUrl,
}: TherapistWelcomeProps) {
    return (
        <Html>
            <Head />
            <Preview>Welcome to Mindweal by Pihu Suri - Your account is ready</Preview>
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

                        <Text style={paragraph}>Hi {therapistName},</Text>

                        <Text style={paragraph}>
                            Your therapist account has been created. You can now log in to access
                            your portal and manage your availability.
                        </Text>

                        <Section style={credentialsBox}>
                            <Text style={credentialsTitle}>Your login credentials:</Text>
                            <Text style={credentialsText}>
                                <strong>Email:</strong> {email}
                            </Text>
                            <Text style={credentialsText}>
                                <strong>Temporary Password:</strong> {temporaryPassword}
                            </Text>
                        </Section>

                        <Text style={warningText}>
                            Please change your password after your first login for security.
                        </Text>

                        <Section style={buttonSection}>
                            <Button style={button} href={loginUrl}>
                                Log In to Your Portal
                            </Button>
                        </Section>

                        <Section style={infoBox}>
                            <Text style={infoTitle}>What you can do in your portal:</Text>
                            <Text style={infoText}>
                                • Set your weekly availability
                                <br />
                                • Block specific dates for time off
                                <br />
                                • Manage your session types and duration
                                <br />
                                • View and manage your bookings
                                <br />• Update your profile information
                            </Text>
                        </Section>

                        <Text style={signature}>
                            Welcome aboard,
                            <br />
                            <strong>The Mindweal Team</strong>
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerText}>
                            If you have any questions, please contact the admin team.
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

const credentialsBox = {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
    border: "1px solid #e5e7eb",
};

const credentialsTitle = {
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 12px",
};

const credentialsText = {
    color: "#1f2937",
    fontSize: "14px",
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    margin: "8px 0",
    lineHeight: "20px",
};

const warningText = {
    color: "#b45309",
    fontSize: "14px",
    fontWeight: "500",
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
