import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { ContactSchema } from "@/core/validation/contact";
import { apiWrapper } from "@/lib/api-utils";
import { AppError } from "@/core/errors/AppError";

/**
 * Basic HTML escaping to prevent user input from breaking your email HTML.
 * (Very important when inserting user text into HTML templates.)
 */
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeTrim(s?: string) {
  return (s ?? "").trim();
}

export async function POST(req: NextRequest) {
  return apiWrapper(async () => {
    const body = await req.json();
    const validated = ContactSchema.parse(body);

    const name = safeTrim(validated.name);
    const email = safeTrim(validated.email);
    const subject = safeTrim(validated.subject);
    const message = safeTrim(validated.message);

    // Optional: quick sanity checks (Zod already validates, but this helps avoid empty strings)
    if (!name || !email || !subject || !message) {
      throw new AppError(
        "BAD_REQUEST",
        "All fields are required.",
        400
      );
    }

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASSWORD,
      SMTP_FROM_EMAIL,
      SMTP_TO_EMAIL,
      SMTP_FROM_NAME, // optional env
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

    const port = Number(SMTP_PORT);
    if (!Number.isFinite(port)) {
      throw new AppError(
        "INTERNAL_SERVER_ERROR",
        "SMTP port is invalid. Please contact the administrator.",
        500
      );
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    // Optional but recommended: verify SMTP connection in production
    // await transporter.verify();

    const fromName = safeTrim(SMTP_FROM_NAME) || "Portfolio";
    const from = `"${fromName}" <${SMTP_FROM_EMAIL}>`;

    // Escape user input for HTML
    const eName = escapeHtml(name);
    const eEmail = escapeHtml(email);
    const eSubject = escapeHtml(subject);
    const eMessage = escapeHtml(message);

    // EMAIL TO YOU (site owner)
    const ownerMail = {
      from,
      to: SMTP_TO_EMAIL,
      replyTo: email, // allows you to hit reply and respond directly
      subject: `New website enquiry: ${subject}`,
      text: [
        "New Contact Form Submission",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        "",
        "Message:",
        message,
      ].join("\n"),
      html: `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body style="margin:0;padding:0;background:#f3f4f6;">
            <div style="max-width:640px;margin:0 auto;padding:24px;">
              <div style="background:#111827;color:#fff;padding:18px 20px;border-radius:12px 12px 0 0;">
                <div style="font-family:Arial,Helvetica,sans-serif;">
                  <div style="font-size:16px;opacity:0.9;">New contact form submission</div>
                  <div style="font-size:22px;font-weight:700;margin-top:6px;">${eSubject}</div>
                </div>
              </div>

              <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:22px;">
                <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;">
                  
                  <div style="margin-bottom:14px;">
                    <div style="font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">From</div>
                    <div style="font-size:15px;margin-top:4px;">${eName}</div>
                  </div>

                  <div style="margin-bottom:14px;">
                    <div style="font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Email</div>
                    <div style="font-size:15px;margin-top:4px;">
                      <a href="mailto:${eEmail}" style="color:#2563eb;text-decoration:none;">${eEmail}</a>
                    </div>
                  </div>

                  <div style="margin-bottom:14px;">
                    <div style="font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Message</div>
                    <div style="margin-top:6px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;white-space:pre-wrap;word-break:break-word;">
                      ${eMessage}
                    </div>
                  </div>

                  <div style="margin-top:18px;font-size:12px;color:#6b7280;">
                    Reply directly to this email to respond to <strong style="color:#374151;">${eName}</strong>.
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(ownerMail);

    // AUTO-REPLY TO USER
    const autoReply = {
      from,
      to: email,
      subject: "Thanks for reaching out",
      text: [
        `Hi ${name},`,
        "",
        "Thanks for reaching out. I’ve received your message and will reply as soon as possible.",
        "",
        "Your message:",
        message,
        "",
        "Best regards,",
        "Muzammil Khan",
      ].join("\n"),
      html: `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body style="margin:0;padding:0;background:#f3f4f6;">
            <div style="max-width:640px;margin:0 auto;padding:24px;">
              <div style="background:#111827;color:#fff;padding:18px 20px;border-radius:12px 12px 0 0;">
                <div style="font-family:Arial,Helvetica,sans-serif;">
                  <div style="font-size:18px;font-weight:700;">Message received</div>
                  <div style="font-size:13px;opacity:0.9;margin-top:4px;">I’ll get back to you shortly.</div>
                </div>
              </div>

              <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:22px;">
                <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;">
                  <p style="margin:0 0 12px 0;">Hi ${eName},</p>
                  <p style="margin:0 0 12px 0;">
                    Thanks for reaching out. I’ve received your message and will reply as soon as possible.
                  </p>

                  <div style="margin-top:14px;">
                    <div style="font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Your message</div>
                    <div style="margin-top:6px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;white-space:pre-wrap;word-break:break-word;">
                      ${eMessage}
                    </div>
                  </div>

                  <p style="margin:16px 0 0 0;">Best regards,<br/>Muzammil Khan</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Don't fail the whole request if auto-reply fails
    try {
      await transporter.sendMail(autoReply);
    } catch (err) {
      console.error("Auto-reply failed:", err);
    }

    return { success: true, message: "Email sent successfully" };
  });
}
