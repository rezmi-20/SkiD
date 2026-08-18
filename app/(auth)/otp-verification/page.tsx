"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import DireSkillLogo from "@/components/shell/DireSkillLogo";
import { useLanguage } from "@/context/LanguageContext";

export default function OTPVerificationPage() {
  const { t } = useLanguage();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    setMounted(true);
    if (!email) {
      router.push("/login");
      return;
    }

    // Diagnostic: Check if already verified
    const checkStatus = async () => {
      const { authClient } = await import("@/lib/auth/client");
      const { data: session } = await authClient.getSession();
      // Only redirect if they are actually verified AND it's a valid session
      if (session?.user?.emailVerified) {
        router.push("/login?verified=true");
      }
    };
    checkStatus();
  }, [email, router]);

  const otp = digits.join("");

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    setError("");
    if (cleaned && index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...digits];
    pasted.split("").forEach((char, i) => { newDigits[i] = char; });
    setDigits(newDigits);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || !email) return;
    setIsLoading(true);
    setError("");

    try {
      const { authClient } = await import("@/lib/auth/client");
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (verifyError) {
        setError(verifyError.message || t("auth.otp.invalid"));
      } else {
        router.push("/login?verified=true");
      }
    } catch (err: any) {
      console.error("Verification Error:", err);
      setError(err.message || t("auth.otp.unexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResent(true);
    setDigits(["", "", "", "", "", ""]);
    refs[0].current?.focus();
    
    try {
       const { authClient } = await import("@/lib/auth/client");
       await authClient.emailOtp.sendVerificationOtp({
         email,
         type: "email-verification"
       });
    } catch (err) {
       console.error("Failed to resend code", err);
    }
    
    setTimeout(() => setResent(false), 4000);
  };


  return (
    <div className="min-h-[100dvh] w-full flex bg-[#09090b] text-white font-inter overflow-x-hidden selection:bg-green-400/30">

      {/* Desktop Art Side */}
      <div className="hidden lg:flex w-1/2 relative bg-[#09090b] border-r border-zinc-800/50 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"
            alt="Background"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-[#09090b]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/20" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/15 blur-[120px] pointer-events-none rounded-full z-0 mix-blend-screen" />

        <div className="absolute top-12 left-12 z-20">
          <DireSkillLogo variant="light" iconSize={44} />        
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center rounded-3xl backdrop-blur-xl mb-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 4l10 8 10-8" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
            {t("auth.otp.marketingTitle")}
          </h2>
          <p className="text-zinc-400 text-lg max-w-sm mx-auto leading-relaxed">
            {t("auth.otp.marketingDesc")}
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[100dvh]">
        <div className="lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/8 blur-[150px] pointer-events-none rounded-full" />

        <div className="w-full max-w-[420px] px-6 py-12 z-10 flex flex-col min-h-[100dvh] items-center justify-center">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <DireSkillLogo variant="light" iconSize={40} />
          </div>

          {/* Icon */}
          <div className="w-20 h-20 bg-zinc-900 border border-zinc-700/50 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 4l10 8 10-8" />
            </svg>
          </div>

          {/* Heading */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-[28px] font-bold tracking-tight text-white">{t("auth.otp.title")}</h1>
            <p className="text-zinc-500 text-[15px] font-medium">
              {t("auth.otp.subtitle")}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 mb-6 w-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {resent && (
            <div className="bg-green-400/10 border border-green-400/20 text-green-400 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 mb-6 w-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t("auth.otp.resent")}
            </div>
          )}

          {/* OTP Inputs */}
          <form onSubmit={handleSubmit} className="w-full space-y-8">
            <div className="flex items-center justify-center gap-3">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={refs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-black bg-zinc-900 border rounded-2xl outline-none transition-all duration-200 text-white ${
                    digit
                      ? "border-green-400/70 shadow-[0_0_12px_rgba(74,222,128,0.15)]"
                      : "border-zinc-700 focus:border-green-400/60 focus:ring-1 focus:ring-green-400/40"
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full h-[52px] bg-green-400 hover:bg-green-500 text-black rounded-full font-bold text-[15px] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_-5px_rgba(74,222,128,0.4)] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {t("auth.otp.submit")}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={handleResend}
              className="text-[13px] font-bold text-zinc-500 hover:text-green-400 transition-colors"
            >
              {t("auth.otp.resendPrompt")}{" "}
              <span className="text-green-400 font-bold">{t("auth.otp.resend")}</span>
            </button>
            <Link href="/login" className="text-[13px] font-medium text-zinc-600 hover:text-zinc-400 transition-colors">
              ← {t("auth.otp.back")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
