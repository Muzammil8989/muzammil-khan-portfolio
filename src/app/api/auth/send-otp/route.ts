import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";
import nodemailer from "nodemailer";
import {
  generateOtp,
  hashOtp,
  OTP_EXPIRY_MS,
  MAX_OTP_SENDS_PER_HOUR,
  RESEND_COOLDOWN_MS,
} from "@/lib/otp";

const schema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

// Dummy hash for timing-attack-safe comparison when user not found
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    // This is whatever the user typed — used as the OTP key so auth.ts can look it up
    const normalizedInput = email.toLowerCase().trim();

    // 1. Find user by email OR username (legacy accounts may only have username)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedInput },
          { username: normalizedInput },
        ],
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[send-otp] lookup:", {
        input: normalizedInput,
        found: !!user,
        hasPassword: !!user?.password,
        hasEmail: !!user?.email,
        username: user?.username,
      });
    }

    const passwordValid = await compare(password, user?.password ?? DUMMY_HASH);

    if (!user || !passwordValid) {
      if (process.env.NODE_ENV === "development") {
        console.log("[send-otp] auth failed:", { userFound: !!user, passwordValid });
      }
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Determine where to actually send the OTP email
    const sendToEmail = user.email ?? normalizedInput;
    if (!sendToEmail.includes("@")) {
      return NextResponse.json(
        { error: "No email address linked to this account. Please contact the administrator." },
        { status: 400 },
      );
    }

    // 2. Rate limit: max 5 sends per hour (keyed by normalizedInput so it works for both email & username)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSendCount = await prisma.otpCode.count({
      where: {
        email: normalizedInput,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentSendCount >= MAX_OTP_SENDS_PER_HOUR) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in an hour." },
        { status: 429 },
      );
    }

    // 3. Resend cooldown: prevent spamming within 60 seconds
    const lastOtp = await prisma.otpCode.findFirst({
      where: { email: normalizedInput },
      orderBy: { createdAt: "desc" },
    });

    if (lastOtp) {
      const elapsed = Date.now() - new Date(lastOtp.createdAt).getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const waitSecs = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSecs}s before requesting a new code.` },
          { status: 429 },
        );
      }
    }

    // 4. Delete all previous OTPs for this identifier
    await prisma.otpCode.deleteMany({ where: { email: normalizedInput } });

    // 5. Generate, hash and store new OTP (keyed by normalizedInput)
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await prisma.otpCode.create({
      data: { email: normalizedInput, hashedOtp, expiresAt, attempts: 0 },
    });

    // 6. Send OTP via SMTP to the user's actual email address
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Admin CMS"}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: sendToEmail,
      subject: "Your Sign-In Verification Code",
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:40px 32px;text-align:center;border-radius:12px 12px 0 0;">
            <div style="width:60px;height:60px;background:rgba(255,255,255,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:28px;">🔐</div>
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Verify Your Identity</h1>
            <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Admin CMS — Portfolio Manager</p>
          </div>
          <div style="padding:40px 32px;background:#f8fafc;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
            <p style="color:#475569;font-size:15px;margin:0 0 28px;line-height:1.6;">
              Use the code below to complete your sign-in. This code expires in
              <strong style="color:#1e40af;">10 minutes</strong>.
            </p>
            <div style="background:#fff;border:2px solid #e2e8f0;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
              <p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">Verification Code</p>
              <p style="font-size:44px;font-weight:800;letter-spacing:12px;color:#1e40af;margin:0;font-family:'Courier New',monospace;">${otp}</p>
            </div>
            <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;">
              <p style="color:#92400e;font-size:13px;margin:0;line-height:1.5;">
                ⚠️ Never share this code. We will never ask you for your OTP.
              </p>
            </div>
            <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;text-align:center;">
              If you did not attempt to sign in, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      expiresIn: OTP_EXPIRY_MS / 1000,
    });
  } catch (error) {
    console.error("[send-otp]", error);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 },
    );
  }
}
