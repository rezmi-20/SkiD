"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ClientRegisterPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    faydaFinNumber: "",
    faydaDocDataUrl: "",
    faydaDocName: "",
  });
  const [wantsVerification, setWantsVerification] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFaydaFile = (file: File | null) => {
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError(t("auth.register.client.errDocType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t("auth.register.client.errDocSize"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        faydaDocDataUrl: String(reader.result || ""),
        faydaDocName: file.name,
      }));
    };
    reader.onerror = () => setError(t("auth.register.client.errDocRead"));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const password = formData.password;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (password.length < 8 || !hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
      setError(t("auth.register.client.errPassword"));
      setIsLoading(false);
      return;
    }

    if (wantsVerification) {
      if (!formData.faydaFinNumber || !formData.faydaDocDataUrl) {
        setError(t("auth.register.client.errBothRequired"));
        setIsLoading(false);
        return;
      }
      if (!/^\d{12}$/.test(formData.faydaFinNumber)) {
        setError(t("auth.register.client.errFinDigits"));
        setIsLoading(false);
        return;
      }
      if (!formData.faydaDocDataUrl) {
        setError(t("auth.register.client.errDocRequired"));
        setIsLoading(false);
        return;
      }
    }

    try {
      const { authClient } = await import("@/lib/auth/client");

      const { data, error: signUpError } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
      });

      if (signUpError) {
        setError(signUpError.message || "Registration failed.");
        setIsLoading(false);
        return;
      }

      // Create profile in our database
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          faydaFinNumber: wantsVerification ? formData.faydaFinNumber : "",
          faydaDocDataUrl: wantsVerification ? formData.faydaDocDataUrl : "",
          email: formData.email,
          role: "client",
          neonUserId: data?.user?.id,
        }),
      });

      const profileData = await res.json();

      if (!res.ok) {
        setError(profileData.error || "Profile creation failed.");
      } else {
        // If email verification is enabled, data.user.emailVerified will be false
        if (data?.user && !data.user.emailVerified) {
          router.push(`/otp-verification?email=${encodeURIComponent(formData.email)}`);
        } else {
          router.push("/login?registered=true");
        }
      }
    } catch (err: any) {
      console.error("Registration Error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[100dvh] w-full flex bg-[#09090b] text-white font-inter overflow-x-hidden selection:bg-green-400/30">
      
      {/* Desktop Art / Branding Side (Left) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#09090b] border-r border-zinc-800/50 overflow-hidden items-center justify-center p-12">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop" 
            alt="Office Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[#09090b]/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/30"></div>
        </div>

        {/* Subtle Ambient Green Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/15 blur-[120px] pointer-events-none rounded-full z-0 mix-blend-screen" />
        
        <div className="absolute top-12 left-12 flex items-center gap-3 z-20">
          <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl shadow-lg shadow-white/5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#09090b]">
              <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
              <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Dire<span className="text-green-400">Skill</span></span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center rounded-3xl backdrop-blur-xl mb-8 shadow-2xl">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
              <path d="M 17 21 l -5 -4 l -5 4 V 5 a 2 2 0 0 1 2 -2 h 6 a 2 2 0 0 1 2 2 z" />
            </svg>
          </div>
          <h2 className="text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            {t("auth.marketing.clientTitle")}
          </h2>
          <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
            {t("auth.marketing.clientDesc")}
          </p>
        </div>
        
        <div className="absolute bottom-12 left-12 flex items-center gap-4 text-sm font-medium text-zinc-500">
          <Link href="#" className="hover:text-green-400 transition-colors">{t("auth.privacy")}</Link>
          <span>&bull;</span>
          <Link href="#" className="hover:text-green-400 transition-colors">{t("auth.terms")}</Link>
        </div>
      </div>

      {/* Form Side (Right on Desktop, Full on Mobile) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[100dvh]">
        
        {/* Mobile Ambient Glow */}
        <div className="lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="w-full max-w-[420px] px-6 py-12 z-10 flex flex-col min-h-[100dvh] items-center justify-center relative">
          
          {/* Header Section */}
          <div className="flex flex-col items-center mb-8 space-y-5 w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-white flex items-center justify-center rounded-2xl shadow-lg shadow-white/5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-[#09090b]">
                  <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                  <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
                </svg>
              </div>
              <span className="text-[28px] font-bold tracking-tight text-white">Dire<span className="text-green-400">Skill</span></span>
            </div>
            
            <div className="text-center space-y-1.5">
              <h1 className="text-[28px] font-bold tracking-tight text-white flex items-center justify-center gap-2">
                {t("auth.register.client.title")} <span>✨</span>
              </h1>
              <p className="text-zinc-500 text-[15px] font-medium">
                {t("auth.register.client.subtitle")}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 mb-6 w-full"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("auth.register.client.displayName")}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
                  placeholder={t("auth.register.client.displayNamePlaceholder")}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("auth.register.client.email")}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("auth.register.client.phone")}</label>
              <div className="relative flex">
                <div className="h-[52px] px-4 bg-zinc-800 border border-zinc-700 border-r-0 rounded-l-2xl flex items-center justify-center text-zinc-400 font-medium text-[14px]">
                  +251
                </div>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length > 10) val = val.substring(0, 10);
                    setFormData({ ...formData, phone: val });
                  }}
                  onBlur={(e) => {
                    let val = e.target.value;
                    if (val.startsWith("0") && val.length === 10) {
                      val = val.substring(1);
                      setFormData({ ...formData, phone: val });
                    }
                  }}
                  className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-r-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
                  placeholder="9XX XXX XXX"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("admin.common.password")}</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
                  placeholder={t("auth.register.client.passwordPlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-bold text-zinc-100">{t("auth.register.client.optionalFayda")}</p>
                  <p className="mt-1 text-[12px] leading-5 text-zinc-500">
                    {t("auth.register.client.optionalFaydaDesc")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWantsVerification((value) => !value);
                    setError("");
                  }}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                    wantsVerification ? "bg-green-400 text-black" : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {wantsVerification ? t("auth.register.client.enabled") : t("auth.register.client.verify")}
                </button>
              </div>

              {wantsVerification && (
                <div className="space-y-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={formData.faydaFinNumber}
                    onChange={(e) => setFormData({ ...formData, faydaFinNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })}
                    className="w-full h-[48px] px-4 bg-zinc-950 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white"
                    placeholder={t("auth.register.client.finPlaceholder")}
                  />
                  <label className="flex h-[48px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-4 text-[12px] font-bold text-zinc-300 hover:border-green-400/60">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      onChange={(e) => handleFaydaFile(e.target.files?.[0] || null)}
                    />
                    {formData.faydaDocName || t("auth.register.client.uploadFayda")}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setWantsVerification(false);
                      setFormData({ ...formData, faydaFinNumber: "", faydaDocDataUrl: "", faydaDocName: "" });
                    }}
                    className="text-[12px] font-bold text-zinc-500 hover:text-zinc-300"
                  >
                    {t("auth.register.client.skip")}
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-green-400 hover:bg-green-500 text-black rounded-full font-bold text-[15px] active:scale-[0.98] transition-all disabled:opacity-70 shadow-[0_0_20px_-5px_rgba(74,222,128,0.4)] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  wantsVerification ? t("auth.register.client.submitWithVerification") : t("auth.register.client.submit")
                )}
              </button>
            </div>
          </form>

          {/* Switch to Worker */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80 w-full text-center">
            <Link href="/register/worker" className="text-[13px] font-bold text-green-400 hover:text-green-300 transition-colors tracking-wide">
              {t("auth.register.client.switchWorker")} &rarr;
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-[13px] text-zinc-400 font-medium mt-auto pt-10 pb-6 w-full">
            {t("auth.register.client.haveAccount")}{" "}
            <Link href="/login" className="text-green-400 font-bold hover:text-green-300 transition-colors">
              {t("auth.register.client.signIn")}
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
