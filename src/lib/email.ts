import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { createElement } from "react";
import { emailConfig, appConfig } from "@/config";

import PasswordReset from "@/templates/PasswordReset";
import EmailVerification from "@/templates/EmailVerification";
import BookingConfirmationClient from "@/templates/BookingConfirmationClient";
import BookingConfirmationTherapist from "@/templates/BookingConfirmationTherapist";
import BookingReminder from "@/templates/BookingReminder";
import BookingCancellation from "@/templates/BookingCancellation";

const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
});

type EmailTemplate =
    | "PasswordReset"
    | "EmailVerification"
    | "BookingConfirmationClient"
    | "BookingConfirmationTherapist"
    | "BookingReminder"
    | "BookingCancellation";

interface SendEmailOptions {
    to: string;
    subject: string;
    template: EmailTemplate;
    data: Record<string, unknown>;
    attachments?: Array<{
        filename: string;
        content: string | Buffer;
        contentType?: string;
    }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templates: Record<EmailTemplate, React.ComponentType<any>> = {
    PasswordReset,
    EmailVerification,
    BookingConfirmationClient,
    BookingConfirmationTherapist,
    BookingReminder,
    BookingCancellation,
};

export async function sendEmail({ to, subject, template, data, attachments }: SendEmailOptions): Promise<void> {
    const EmailTemplate = templates[template];

    if (!EmailTemplate) {
        throw new Error(`Email template "${template}" not found`);
    }

    const html = await render(createElement(EmailTemplate, data));

    await transporter.sendMail({
        from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
        to,
        subject: `${subject} | ${appConfig.name} by Pihu Suri`,
        html,
        attachments,
    });
}

export { transporter };
