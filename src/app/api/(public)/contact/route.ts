import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { emailConfig, appConfig } from "@/config";
import { contactFormSchema } from "@/lib/validation";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/html-escape";

export async function POST(request: NextRequest) {
    try {
        // Rate limit: 5 requests per minute
        const rateLimitKey = getRateLimitKey(request, "contact");
        const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 5 });

        if (rateLimit.limited) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
            );
        }

        const body = await request.json();

        // Validate with Zod
        const validated = contactFormSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, phone, subject, message } = validated.data;

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: emailConfig.host,
            port: emailConfig.port,
            secure: emailConfig.secure,
            auth: {
                user: emailConfig.auth.user,
                pass: emailConfig.auth.pass,
            },
        });

        // Email to MindWeal team
        const teamEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A99D;">New Contact Form Submission</h2>
        <hr style="border: 1px solid #eee;" />
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${phone ? escapeHtml(phone) : "Not provided"}</p>
        <p><strong>Subject:</strong> ${subject ? escapeHtml(subject) : "General Inquiry"}</p>
        <hr style="border: 1px solid #eee;" />
        <h3>Message:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${escapeHtml(message)}</p>
      </div>
    `;

        // Send to team
        await transporter.sendMail({
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: "hello@mindweal.in",
            subject: `New Contact: ${subject || "General Inquiry"} - ${name}`,
            html: teamEmailHtml,
        });

        // Acknowledgement email to user
        const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00A99D; margin: 0;">${appConfig.name}</h1>
          <p style="color: #6B4C9A; margin: 5px 0;">${appConfig.tagline}</p>
        </div>
        
        <h2>Thank you for reaching out, ${escapeHtml(name)}!</h2>
        
        <p>We have received your message and appreciate you taking the time to contact us.</p>
        
        <p>Our team will review your inquiry and get back to you as soon as possible, typically within 24-48 hours.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Message:</h3>
          <p style="color: #666;">${escapeHtml(message)}</p>
        </div>
        
        <p>If you have any urgent concerns in the meantime, please don't hesitate to call us.</p>
        
        <p>Warm regards,<br><strong>The ${appConfig.name} Team</strong></p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This email was sent because you submitted a contact form on our website.
        </p>
      </div>
    `;

        await transporter.sendMail({
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: email,
            subject: `Thank you for contacting ${appConfig.name}`,
            html: userEmailHtml,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}
