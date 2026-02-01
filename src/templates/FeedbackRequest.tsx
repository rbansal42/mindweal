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

interface FeedbackRequestProps {
    clientName: string;
    therapistName?: string;
    sessionDate?: string;
    programName?: string;
    feedbackLink: string;
    type: "session" | "program" | "workshop";
}

export default function FeedbackRequest({
    clientName,
    therapistName,
    sessionDate,
    programName,
    feedbackLink,
    type,
}: FeedbackRequestProps) {
    const getTypeSpecificContent = () => {
        switch (type) {
            case "session":
                return {
                    title: "How was your session?",
                    description: `We hope your session with ${therapistName} on ${sessionDate} went well.`,
                };
            case "program":
                return {
                    title: "Thank you for completing the program!",
                    description: `We hope you found the "${programName}" program valuable.`,
                };
            case "workshop":
                return {
                    title: "Thank you for attending!",
                    description: `We hope you enjoyed the "${programName}" workshop.`,
                };
        }
    };

    const content = getTypeSpecificContent();

    return (
        <Html>
            <Head />
            <Preview>We&apos;d love to hear your feedback - MindWeal</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={logo}>MindWeal</Heading>
                        <Text style={tagline}>Untangle - Heal - Thrive</Text>
                    </Section>

                    <Section style={contentSection}>
                        <Heading as="h2" style={heading}>
                            {content.title}
                        </Heading>

                        <Text style={paragraph}>Dear {clientName},</Text>

                        <Text style={paragraph}>{content.description}</Text>

                        <Text style={paragraph}>
                            Your feedback is incredibly valuable to us. It helps us improve
                            our services and ensure we&apos;re providing the best possible
                            care.
                        </Text>

                        <Section style={buttonSection}>
                            <Button style={button} href={feedbackLink}>
                                Share Your Feedback
                            </Button>
                        </Section>

                        <Text style={subtext}>
                            This survey takes less than 2 minutes to complete.
                        </Text>

                        <Section style={reassuranceBox}>
                            <Text style={reassuranceText}>
                                Your feedback is completely confidential and will only be
                                used to improve our services.
                            </Text>
                        </Section>

                        <Text style={paragraph}>
                            Thank you for trusting MindWeal with your mental wellness journey.
                        </Text>

                        <Text style={signature}>
                            With gratitude,
                            <br />
                            <strong>The MindWeal Team</strong>
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerText}>
                            If you have any questions or concerns, please don&apos;t hesitate
                            to contact us at hello@mindweal.in
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

const buttonSection = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const button = {
    backgroundColor: "#6B4C9A",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "14px 32px",
};

const subtext = {
    color: "#9CA3AF",
    fontSize: "14px",
    textAlign: "center" as const,
    margin: "0",
};

const reassuranceBox = {
    backgroundColor: "#f5f3ff",
    borderRadius: "8px",
    padding: "16px",
    margin: "24px 0",
    textAlign: "center" as const,
};

const reassuranceText = {
    color: "#6B4C9A",
    fontSize: "14px",
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
