import crypto from "crypto";

export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_OTP_ATTEMPTS = 3;
export const MAX_OTP_SENDS_PER_HOUR = 5;
export const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

/** Cryptographically secure 6-digit OTP */
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/** HMAC-SHA256 hash of OTP using OTP_SECRET as pepper */
export function hashOtp(otp: string): string {
  const secret = process.env.OTP_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("OTP_SECRET or NEXTAUTH_SECRET must be configured");
  return crypto.createHmac("sha256", secret).update(otp).digest("hex");
}

/** Timing-safe OTP verification to prevent timing attacks */
export function verifyOtp(otp: string, storedHash: string): boolean {
  try {
    const expected = Buffer.from(hashOtp(otp), "hex");
    const stored = Buffer.from(storedHash, "hex");
    if (expected.length !== stored.length) return false;
    return crypto.timingSafeEqual(expected, stored);
  } catch {
    return false;
  }
}
