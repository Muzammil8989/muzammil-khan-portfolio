import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { ContactSchema } from "@/core/validation/contact";
import { apiWrapper } from "@/lib/api-utils";
import { AppError } from "@/core/errors/AppError";

export async function POST(req: NextRequest) {
  return apiWrapper(async () => {
    const body = await req.json();
    const validated = ContactSchema.parse(body);

    // Check for required environment variables
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASSWORD,
      SMTP_FROM_EMAIL,
      SMTP_TO_EMAIL,
    } = process.env;

    if (
      !SMTP_HOST ||
      !SMTP_PORT ||
      !SMTP_USER ||
      !SMTP_PASSWORD ||
      !SMTP_FROM_EMAIL ||
      !SMTP_TO_EMAIL
    ) {
      throw new AppError(
        "INTERNAL_SERVER_ERROR",
        "Email configuration is missing. Please contact the administrator.",
        500
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    // Email content for site owner
    const mailOptions = {
      from: SMTP_FROM_EMAIL,
      to: SMTP_TO_EMAIL,
      subject: `Portfolio Contact: ${validated.subject}`,
      replyTo: validated.email,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .field {
                margin-bottom: 20px;
              }
              .label {
                font-weight: bold;
                color: #4b5563;
                display: block;
                margin-bottom: 5px;
              }
              .value {
                background: white;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
              }
              .message-box {
                background: white;
                padding: 20px;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .footer {
                background: #374151;
                color: #9ca3af;
                padding: 15px;
                text-align: center;
                font-size: 12px;
                border-radius: 0 0 8px 8px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">From:</span>
                <div class="value">${validated.name}</div>
              </div>
              <div class="field">
                <span class="label">Email:</span>
                <div class="value"><a href="mailto:${validated.email}">${validated.email}</a></div>
              </div>
              <div class="field">
                <span class="label">Subject:</span>
                <div class="value">${validated.subject}</div>
              </div>
              <div class="field">
                <span class="label">Message:</span>
                <div class="message-box">${validated.message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from your portfolio contact form.</p>
              <p>You can reply directly to this email to respond to ${validated.name}.</p>
            </div>
          </body>
        </html>
      `,
      text: `
New Contact Form Submission

From: ${validated.name}
Email: ${validated.email}
Subject: ${validated.subject}

Message:
${validated.message}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Optional: Send auto-reply to the sender
    const autoReplyOptions = {
      from: SMTP_FROM_EMAIL,
      to: validated.email,
      subject: "Thank you for contacting me",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 8px 8px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">Message Received!</h1>
            </div>
            <div class="content">
              <p>Hi ${validated.name},</p>
              <p>Thank you for reaching out! I've received your message and will get back to you as soon as possible.</p>
              <p><strong>Your message:</strong></p>
              <p style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${validated.message}</p>
              <p>Best regards,<br>Muzammil Khan</p>
            </div>
          </body>
        </html>
      `,
      text: `
Hi ${validated.name},

Thank you for reaching out! I've received your message and will get back to you as soon as possible.

Your message:
${validated.message}

Best regards,
Muzammil Khan
      `,
    };

    // Send auto-reply (optional, won't throw error if it fails)
    try {
      await transporter.sendMail(autoReplyOptions);
    } catch (error) {
      console.error("Failed to send auto-reply:", error);
      // Continue anyway - the main email was sent
    }

    return {
      success: true,
      message: "Email sent successfully",
    };
  });
}
