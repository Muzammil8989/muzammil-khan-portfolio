"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  RotateCcw,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return email;
  const visible = Math.min(2, Math.floor(local.length / 3));
  return `${local.slice(0, visible)}${"*".repeat(local.length - visible)}@${domain}`;
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

// ─── Component ──────────────────────────────────────────
export default function SignInPage() {
  const router = useRouter();

  // Step 1 state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 state
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);

  // Shared
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // Countdown ticks
  const [, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown ticker when on OTP step
  useEffect(() => {
    if (step !== "otp") return;
    timerRef.current = setInterval(() => setTick((t) => t + 1), 500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const expiresInMs = otpSentAt ? OTP_EXPIRY_MS - (Date.now() - otpSentAt) : 0;
  const resendInMs = resendAt ? RESEND_COOLDOWN_MS - (Date.now() - resendAt) : 0;
  const isExpired = expiresInMs <= 0 && otpSentAt !== null;
  const canResend = resendInMs <= 0;

  // ── Step 1: send OTP ──────────────────────────────────
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Email is required.");
    if (!password.trim()) return setError("Password is required.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      const now = Date.now();
      setOtpSentAt(now);
      setResendAt(now);
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) return setError("Please enter the full 6-digit code.");
    if (isExpired) return setError("Code has expired. Please request a new one.");

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        otp,
      });

      if (result?.error) {
        setError(result.error);
        setOtp("");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────
  const handleResend = useCallback(async () => {
    if (!canResend || resendLoading) return;
    setError("");
    setResendMessage("");
    setResendLoading(true);
    setOtp("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend.");
        return;
      }

      const now = Date.now();
      setOtpSentAt(now);
      setResendAt(now);
      setResendMessage("New code sent!");
      setTimeout(() => setResendMessage(""), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }, [canResend, resendLoading, email, password]);

  // ─── UI ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#00001a' }}>

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Background glow blobs matching project theme */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[20%] left-[20%] w-80 h-80 rounded-full blur-[120px]" style={{ background: 'rgba(37,99,235,0.12)' }} />
        <div className="absolute bottom-[20%] right-[20%] w-64 h-64 rounded-full blur-[100px]" style={{ background: 'rgba(255,185,2,0.07)' }} />
      </div>

      <div className="relative w-full max-w-[420px]">

        {/* Glow accent — gold */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,185,2,0.10)' }} />

        {/* Card */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(20px)' }}>

          {/* Top bar — gold */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #FFB902, #f0c030, #FFB902)' }} />

          <div className="p-8">

            {/* ── Step indicators ── */}
            <div className="flex items-center gap-2 mb-8">
              {(["credentials", "otp"] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold transition-all duration-300",
                      step === s
                        ? "shadow-lg"
                        : i < (step === "otp" ? 1 : 0)
                        ? "text-[#FFB902]"
                        : "text-slate-500"
                    )}
                    style={
                      step === s
                        ? { background: '#FFB902', color: '#04061a', boxShadow: '0 0 12px rgba(255,185,2,0.4)' }
                        : i < (step === "otp" ? 1 : 0)
                        ? { background: 'rgba(255,185,2,0.15)' }
                        : { background: 'rgba(255,255,255,0.08)' }
                    }
                  >
                    {i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium transition-colors",
                      step === s ? "text-slate-200" : "text-slate-500"
                    )}
                  >
                    {s === "credentials" ? "Credentials" : "Verify OTP"}
                  </span>
                  {i === 0 && (
                    <div
                      className={cn(
                        "flex-1 h-px w-8 transition-colors",
                        step === "otp" ? "" : ""
                      )}
                      style={{ background: step === "otp" ? 'rgba(255,185,2,0.4)' : 'rgba(255,255,255,0.08)' }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* ══════════════════════════════════
                STEP 1 — Credentials
            ══════════════════════════════════ */}
            {step === "credentials" && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Lock className="h-4 w-4 shrink-0" style={{ color: '#FFB902' }} />
                    <h1 className="text-lg font-bold text-slate-100">Admin Sign In</h1>
                  </div>
                  <p className="text-[13px] text-slate-400 leading-relaxed pl-[26px]">
                    Enter your credentials to receive a verification code.
                  </p>
                </div>

                {error && (
                  <Alert className="border-red-500/30 bg-red-500/10 text-red-400 py-2.5">
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 h-10 placeholder:text-slate-600 text-slate-100 focus:border-[#FFB902] focus:ring-[#FFB902]/20"
                        style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 pr-10 h-10 placeholder:text-slate-600 text-slate-100 focus:border-[#FFB902] focus:ring-[#FFB902]/20"
                        style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#FFB902', color: '#04061a', boxShadow: '0 4px 20px rgba(255,185,2,0.25)' }}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending code…</>
                  ) : (
                    "Continue →"
                  )}
                </Button>
              </form>
            )}

            {/* ══════════════════════════════════
                STEP 2 — OTP Verification
            ══════════════════════════════════ */}
            {step === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: '#FFB902' }} />
                    <h1 className="text-lg font-bold text-slate-100">Verify Identity</h1>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed pl-[26px]">
                    We sent a 6-digit code to{" "}
                    <span className="text-slate-300 font-medium">{maskEmail(email)}</span>
                  </p>
                </div>

                {error && (
                  <Alert className="border-red-500/30 bg-red-500/10 text-red-400 py-2.5">
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}

                {resendMessage && (
                  <Alert className="border-green-500/30 bg-green-500/10 text-green-400 py-2.5">
                    <AlertDescription className="text-xs">{resendMessage}</AlertDescription>
                  </Alert>
                )}

                {/* OTP input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={cn(
                      "text-center text-2xl font-bold tracking-[0.5em] h-14",
                      "text-slate-100 placeholder:text-slate-600",
                      "focus:border-[#FFB902] focus:ring-[#FFB902]/20",
                      "font-mono transition-all"
                    )}
                    style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}
                    autoFocus
                    disabled={isExpired}
                  />
                </div>

                {/* Countdown timer */}
                <div className="flex items-center justify-between text-xs">
                  <span className={cn(
                    "font-medium",
                    isExpired ? "text-red-400" : expiresInMs < 60_000 ? "text-orange-400" : "text-slate-500"
                  )}>
                    {isExpired
                      ? "Code expired"
                      : `Expires in ${formatCountdown(expiresInMs)}`}
                  </span>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="flex items-center gap-1 font-medium transition-colors hover:opacity-80"
                      style={{ color: '#FFB902' }}
                    >
                      {resendLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      Resend code
                    </button>
                  ) : (
                    <span className="text-slate-600">
                      Resend in {formatCountdown(resendInMs)}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || isExpired || otp.length !== 6}
                  className="w-full h-10 font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                  style={{ background: '#FFB902', color: '#04061a', boxShadow: '0 4px 20px rgba(255,185,2,0.25)' }}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying…</>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setError("");
                    setOtp("");
                    setOtpSentAt(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors w-full justify-center mt-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to sign in
                </button>
              </form>
            )}

          </div>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-[11px] text-slate-500">
              Secured with SMTP-based two-factor authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
