"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // SIMULATION: In a real app, this would call /api/auth/verify-otp
    setTimeout(() => {
      if (otp === "123456") {
        router.push("/login?verified=true");
      } else {
        setError("Invalid verification code. Try 123456 for testing.");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8 bg-surface-container-high p-10 rounded-3xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">mark_email_unread</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tighter mb-2">Verify Email</h1>
          <p className="text-on-surface-variant">We've sent a 6-digit code to your email</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error-dim p-4 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full max-w-[240px] bg-surface-container-highest border border-white/5 rounded-2xl py-5 px-6 text-center text-4xl font-headline font-black tracking-[0.5em] focus:ring-4 focus:ring-primary/20 text-on-surface outline-none transition-all placeholder:tracking-normal placeholder:text-lg"
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full bg-primary text-on-primary py-4 rounded-2xl font-headline font-black tracking-tight active:scale-95 transition-all text-lg shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="text-center">
          <button className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}
