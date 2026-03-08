import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyOtp, MAX_OTP_ATTEMPTS } from "@/lib/otp";

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).regex(/^\d{6}$/),
});

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const parsed = otpSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid input");
        }

        const { email, otp } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Find the pending OTP record
        const otpRecord = await prisma.otpCode.findUnique({
          where: { email: normalizedEmail },
        });

        if (!otpRecord) {
          throw new Error("No verification code found. Please request a new one.");
        }

        // 2. Check expiry
        if (new Date(otpRecord.expiresAt) < new Date()) {
          await prisma.otpCode.delete({ where: { email: normalizedEmail } });
          throw new Error("Verification code has expired. Please request a new one.");
        }

        // 3. Check max attempts
        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
          await prisma.otpCode.delete({ where: { email: normalizedEmail } });
          throw new Error("Too many failed attempts. Please request a new code.");
        }

        // 4. Verify OTP (timing-safe)
        if (!verifyOtp(otp, otpRecord.hashedOtp)) {
          // Increment failed attempts
          await prisma.otpCode.update({
            where: { email: normalizedEmail },
            data: { attempts: { increment: 1 } },
          });

          const remaining = MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1);
          throw new Error(
            remaining > 0
              ? `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
              : "Too many failed attempts. Please request a new code.",
          );
        }

        // 5. OTP valid — delete it (single use)
        await prisma.otpCode.delete({ where: { email: normalizedEmail } });

        // 6. Fetch and return the user
        // Support lookup by email OR username (legacy accounts may not have email field)
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: normalizedEmail },
              { username: normalizedEmail },
            ],
          },
        });

        if (!user) {
          throw new Error("User not found.");
        }

        return {
          id: user.id,
          name: user.name || user.username,
          email: user.email ?? normalizedEmail,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
