import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { emailConfig, appConfig } from "@/config";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const position = formData.get("position") as string;
        const coverLetter = formData.get("coverLetter") as string;
        const resume = formData.get("resume") as File | null;

        // Validate required fields
        if (!name || !email) {
            return NextResponse.json(
                { error: "Name and email are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Handle resume upload
        let resumeFilename = "";
        if (resume) {
            const bytes = await resume.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(process.cwd(), "uploads", "resumes");
            await mkdir(uploadsDir, { recursive: true });

            // Generate unique filename
            const timestamp = Date.now();
            const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, "_");
            const extension = resume.name.split(".").pop();
            resumeFilename = `${sanitizedName}_${timestamp}.${extension}`;

            // Save file
            const filePath = path.join(uploadsDir, resumeFilename);
            await writeFile(filePath, buffer);
        }

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

        // Email to HR/Team
        const teamEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A99D;">New Job Application</h2>
        <hr style="border: 1px solid #eee;" />
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Position:</strong> ${position || "General Application"}</p>
        <p><strong>Resume:</strong> ${resumeFilename || "Not uploaded"}</p>
        <hr style="border: 1px solid #eee;" />
        <h3>Cover Letter / Message:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${coverLetter || "No cover letter provided"}
        </p>
      </div>
    `;

        // Prepare attachments if resume exists
        const attachments = [];
        if (resume && resumeFilename) {
            const bytes = await resume.arrayBuffer();
            attachments.push({
                filename: resume.name,
                content: Buffer.from(bytes),
            });
        }

        // Send to HR
        await transporter.sendMail({
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: "careers@mindweal.in",
            subject: `Job Application: ${position || "General"} - ${name}`,
            html: teamEmailHtml,
            attachments,
        });

        // Acknowledgement to applicant
        const applicantEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00A99D; margin: 0;">${appConfig.name}</h1>
          <p style="color: #6B4C9A; margin: 5px 0;">${appConfig.tagline}</p>
        </div>
        
        <h2>Thank you for your application, ${name}!</h2>
        
        <p>We're excited that you're interested in joining the ${appConfig.name} team!</p>
        
        <p>We have received your application${position ? ` for the <strong>${position}</strong> position` : ""} and our team will carefully review it.</p>
        
        <p>If your qualifications match our current needs, we will reach out to you for the next steps in our recruitment process.</p>
        
        <div style="background: #f0fdf9; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #00A99D;">
          <p style="margin: 0; color: #00A99D;"><strong>What happens next?</strong></p>
          <p style="margin: 10px 0 0; color: #666;">Our team typically reviews applications within 5-7 business days. You will hear from us if we'd like to move forward.</p>
        </div>
        
        <p>Thank you for your interest in making a difference in mental health care!</p>
        
        <p>Warm regards,<br><strong>The ${appConfig.name} Team</strong></p>
      </div>
    `;

        await transporter.sendMail({
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: email,
            subject: `Application Received - ${appConfig.name}`,
            html: applicantEmailHtml,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Application form error:", error);
        return NextResponse.json(
            { error: "Failed to submit application" },
            { status: 500 }
        );
    }
}
