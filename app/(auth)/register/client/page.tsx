"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { explainRegistrationException, readRegistrationResponse } from "@/lib/auth/registration-response";

const MAX_REGISTRATION_REQUEST_BYTES = 4_000_000;

export default function ClientRegisterPage() {
  const { t, language, setLanguage } = useLanguage();
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
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [avatarFileName, setAvatarFileName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [neonUserId, setNeonUserId] = useState("");
  const [authEmailVerified, setAuthEmailVerified] = useState(false);
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
    // Base64 Fayda data is sent with the registration request; keep the raw
    // upload small enough for serverless request-body limits.
    if (file.size > 3 * 1024 * 1024) {
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

  const handleAvatarFile = async (file: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WEBP profile photo.");
      return;
    }
    if (file.size === 0 || file.size > 10 * 1024 * 1024) {
      setError("Choose a profile photo smaller than 10 MB.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Could not read the profile photo. Please try another image."));
        image.src = objectUrl;
      });
      const scale = Math.min(1, 800 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not prepare the profile photo.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.74));
      if (!blob || blob.size > 250 * 1024) throw new Error("Choose a smaller or clearer photo (maximum 250 KB after compression).");
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Could not read the profile photo. Please try another image."));
        reader.readAsDataURL(blob);
      });
      setAvatarDataUrl(dataUrl);
      setAvatarFileName(file.name);
      setError("");
    } catch (photoError) {
      setError(photoError instanceof Error ? photoError.message : "Could not prepare the profile photo.");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const phoneDigits = formData.phone.replace(/\D/g, "");
    const normalizedPhone = phoneDigits.length === 10 && phoneDigits.startsWith("0") ? phoneDigits.slice(1) : phoneDigits;
    if (formData.fullName.trim().length < 2) {
      setError("Enter your full name.");
      setIsLoading(false);
      return;
    }
    if (!avatarDataUrl) {
      setError("Upload a clear profile photo so workers can recognize you after accepting your job.");
      setIsLoading(false);
      return;
    }
    if (!/^\d{9}$/.test(normalizedPhone)) {
      setError("Enter your phone number as 9 digits, without the +251 country code.");
      setIsLoading(false);
      return;
    }

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

    const preflightPayload = {
      ...formData,
      email: formData.email.trim(),
      phone: normalizedPhone,
      faydaFinNumber: wantsVerification ? formData.faydaFinNumber : "",
      faydaDocDataUrl: wantsVerification ? formData.faydaDocDataUrl : "",
      avatarDataUrl,
      role: "client",
      neonUserId: neonUserId || "00000000-0000-4000-8000-000000000000",
    };
    if (new TextEncoder().encode(JSON.stringify(preflightPayload)).byteLength > MAX_REGISTRATION_REQUEST_BYTES) {
      setError("Your Fayda document and profile photo are too large together. Choose a smaller document and try again.");
      setIsLoading(false);
      return;
    }

    try {
      let resolvedUserId = neonUserId;
      let resolvedEmailVerified = authEmailVerified;
      if (!resolvedUserId) {
        const { authClient } = await import("@/lib/auth/client");
        const { data, error: signUpError } = await authClient.signUp.email({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.fullName.trim(),
        });

        if (signUpError || !data?.user?.id) {
          setError(signUpError?.message || "Could not create your login account.");
          setIsLoading(false);
          return;
        }
        resolvedUserId = data.user.id;
        resolvedEmailVerified = Boolean(data.user.emailVerified);
        setNeonUserId(resolvedUserId);
        setAuthEmailVerified(resolvedEmailVerified);
      }

      if (!resolvedEmailVerified) {
        const { authClient } = await import("@/lib/auth/client");
        const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
          email: formData.email.trim(),
          type: "email-verification",
        });
        if (otpError) {
          console.error("[CLIENT_REGISTRATION_OTP_SEND_ERROR]", otpError);
          setError("We couldn't send the email verification code. Please retry registration with the same email address.");
          return;
        }
      }

      // Create profile in our database
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: formData.email.trim(),
          phone: normalizedPhone,
          faydaFinNumber: wantsVerification ? formData.faydaFinNumber : "",
          faydaDocDataUrl: wantsVerification ? formData.faydaDocDataUrl : "",
          avatarDataUrl,
          role: "client",
          neonUserId: resolvedUserId,
        }),
      });

      const profileData = await readRegistrationResponse(res);

      if (!res.ok) {
        setError(profileData.error || "Profile creation failed.");
      } else {
        // If email verification is enabled, data.user.emailVerified will be false
        if (!resolvedEmailVerified) {
          window.location.href = `/otp-verification?email=${encodeURIComponent(formData.email.trim())}`;
        } else {
          window.location.href = "/login?registered=true";
        }
      }
    } catch (err: any) {
      console.error("Registration Error:", err);
      setError(explainRegistrationException(err));
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
          <Link href="/privacy" className="hover:text-green-400 transition-colors">{t("auth.privacy")}</Link>
          <span>&bull;</span>
          <Link href="/terms" className="hover:text-green-400 transition-colors">{t("auth.terms")}</Link>
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
            
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white flex items-center justify-center gap-2">
                {t("auth.register.client.title")} <span>✨</span>
              </h1>
              <p className="text-zinc-400 text-sm font-medium">
                {t("auth.register.client.subtitle")}
              </p>
              <div className="flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setLanguage(language === "en" ? "am" : language === "am" ? "om" : "en")}
                  className="px-3 py-1 rounded-full border border-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                >
                  {language === "en" ? "አማርኛ" : language === "am" ? "Afaan Oromoo" : "English"}
                </button>
              </div>
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
            {/* Profile Photo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[13px] font-medium text-zinc-300">Profile photo <span className="text-red-400">*</span></label>
                {avatarDataUrl && (
                  <button
                    type="button"
                    onClick={() => { setAvatarDataUrl(""); setAvatarFileName(""); }}
                    className="text-[11px] text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <label className={`flex min-h-14 cursor-pointer items-center gap-3.5 rounded-xl border border-dashed px-4 py-3 text-sm transition-all ${
                avatarDataUrl
                  ? "border-green-400/60 bg-green-400/5 text-zinc-200"
                  : "border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700"
              }`}>
                {avatarDataUrl ? (
                  <img src={avatarDataUrl} alt="Profile photo preview" className="h-11 w-11 rounded-full object-cover border border-green-400/40 shrink-0" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 font-bold text-lg shrink-0">+</span>
                )}
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-xs text-white">
                    {avatarFileName || "Add a clear photo of yourself (max 250 KB)"}
                  </span>
                  <span className="block text-[11px] text-zinc-500">
                    {avatarDataUrl ? "Click to change photo" : "JPG, PNG, or WebP"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => handleAvatarFile(event.target.files?.[0] ?? null)}
                />
              </label>
              <p className="ml-1 text-[11px] leading-4 text-zinc-500">Only workers who are verified and have accepted your job can see your photo.</p>
            </div>

            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("auth.register.client.displayName")}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-12 px-4 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition-all placeholder:text-zinc-500 font-medium text-sm text-white shadow-inner"
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
                  className="w-full h-12 px-4 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition-all placeholder:text-zinc-500 font-medium text-sm text-white shadow-inner"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            {/* Phone Input with Unified Group Styling */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("auth.register.client.phone")}</label>
              <div className="relative flex rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400 transition-all shadow-inner">
                <div className="h-12 px-3.5 bg-zinc-800/80 border-r border-zinc-800 flex items-center justify-center text-zinc-400 font-semibold text-sm select-none">
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
                  className="w-full h-12 px-4 bg-transparent outline-none placeholder:text-zinc-500 font-medium text-sm text-white"
                  placeholder="9XX XXX XXX"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("admin.common.password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-12 pl-4 pr-12 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition-all placeholder:text-zinc-500 font-medium text-sm text-white shadow-inner"
                  placeholder={t("auth.register.client.passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors text-zinc-500 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Optional Fayda Section */}
            <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-bold text-zinc-100">{t("auth.register.client.optionalFayda")}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                    {t("auth.register.client.optionalFaydaDesc")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWantsVerification((value) => !value);
                    setError("");
                  }}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold active:scale-95 transition-all ${
                    wantsVerification ? "bg-green-400 text-black shadow-sm" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {wantsVerification ? t("auth.register.client.enabled") : t("auth.register.client.verify")}
                </button>
              </div>

              {wantsVerification && (
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={formData.faydaFinNumber}
                    onChange={(e) => setFormData({ ...formData, faydaFinNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })}
                    className="w-full h-11 px-4 bg-zinc-950/80 border border-zinc-800 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition-all placeholder:text-zinc-500 font-medium text-sm text-white"
                    placeholder={t("auth.register.client.finPlaceholder")}
                  />
                  <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/80 px-4 text-xs font-semibold text-zinc-300 hover:border-green-400/60 transition-colors">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      onChange={(e) => handleFaydaFile(e.target.files?.[0] || null)}
                    />
                    {formData.faydaDocName || t("auth.register.client.uploadFayda")}
                  </label>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setWantsVerification(false);
                        setFormData({ ...formData, faydaFinNumber: "", faydaDocDataUrl: "", faydaDocName: "" });
                      }}
                      className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {t("auth.register.client.skip")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-green-400 hover:bg-green-500 text-black rounded-full font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-60 shadow-[0_0_20px_-5px_rgba(74,222,128,0.4)] flex items-center justify-center gap-2"
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
