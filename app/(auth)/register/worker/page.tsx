"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { explainRegistrationException, readRegistrationResponse } from "@/lib/auth/registration-response";

// Modular Components
import RegistrationSidebar from "./components/RegistrationSidebar";
import RegistrationSuccess from "./components/RegistrationSuccess";
import StepIdentity from "./components/StepIdentity";
import StepIdCompliance from "./components/StepIdCompliance";
import StepServiceParameters from "./components/StepServiceParameters";
import StepReview from "./components/StepReview";

const MAX_REGISTRATION_REQUEST_BYTES = 4_000_000;

export default function WorkerRegisterPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingId, setIsProcessingId] = useState(false);
  const [faydaFileName, setFaydaFileName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [trainingCertificates, setTrainingCertificates] = useState<File[]>([]);
  const [neonUserId, setNeonUserId] = useState("");
  const [authEmailVerified, setAuthEmailVerified] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "", phone: "", email: "", dateOfBirth: "", gender: "",
    skills: [] as string[], experience: "", location: "", password: "", faydaDocUrl: "", faydaFinNumber: "",
  });

  useEffect(() => setMounted(true), []);

  const categories = ["Electrician", "Plumber", "Painter", "Satellite Dish Installer", "House Finishing", "Others"];
  const locations = ["Kezira", "Gende Korem", "Megala", "Shinile", "Legehare", "Addis Ketema"];

  const validateStep = () => {
    setError("");
    if (step === 1 && (!formData.fullName || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.gender || !formData.password)) {
      setError(t("register.errors.fill_all"));
      return false;
    }
    if (step === 1) {
      if (formData.fullName.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        setError("Enter your full name and a valid email address.");
        return false;
      }
      const normalizedPhone = formData.phone.replace(/\D/g, "").replace(/^0(?=\d{9}$)/, "");
      if (!/^\d{9}$/.test(normalizedPhone)) {
        setError("Enter your phone number as 9 digits, without the +251 country code.");
        return false;
      }
      const password = formData.password;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasDigit = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);

      if (password.length < 8 || !hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
        setError(t("register.errors.password_complexity"));
        return false;
      }
    }
    if (step === 2 && !formData.faydaDocUrl) {
      setError(t("register.errors.fayda_required"));
      return false;
    }
    if (step === 2 && !/^\d{12}$/.test(formData.faydaFinNumber)) {
      setError("Enter your 12-digit Fayda FIN. It will be stored securely and only revealed to authorized reviewers during verification.");
      return false;
    }
    if (step === 2 && !profilePhoto) {
      setError("Upload a clear profile photo showing your own face. Admins compare it with your Fayda ID.");
      return false;
    }
    if (step === 2 && trainingCertificates.length === 0) {
      setError("Upload at least one learning or training certificate.");
      return false;
    }
    if (step === 3 && (formData.skills.length === 0 || !formData.location)) {
      setError(t("register.errors.expertise_required"));
      return false;
    }
    return true;
  };

  const nextStep = () => validateStep() && (setStep(s => s + 1), window.scrollTo({ top: 0, behavior: "smooth" }));
  const prevStep = () => (setStep(s => s - 1), window.scrollTo({ top: 0, behavior: "smooth" }));

  const readImage = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(t("register.errors.image_read")));
    };
    image.src = url;
  });

  const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(t("register.errors.image_prepare")));
    reader.readAsDataURL(blob);
  });

  const prepareFaydaDocument = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("register.errors.fayda_image_required"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t("register.errors.fayda_image_size"));
      return;
    }

    setIsProcessingId(true);
    setError("");

    try {
      const image = await readImage(file);
      const maxSide = 1200;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error(t("register.errors.image_preview"));
      }

      context.drawImage(image, 0, 0, width, height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.78));
      if (!blob || blob.size > 1024 * 1024) {
        throw new Error(t("register.errors.image_compress"));
      }

      const dataUrl = await blobToDataUrl(blob);
      setFormData((prev) => ({ ...prev, faydaDocUrl: dataUrl }));
      setFaydaFileName(file.name);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t("register.errors.fayda_attach"));
    } finally {
      setIsProcessingId(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await prepareFaydaDocument(e.target.files?.[0] as File);
    e.target.value = "";
  };

  const handleProfilePhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image for your profile photo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose a profile photo smaller than 10 MB.");
      return;
    }
    try {
      const image = await readImage(file);
      const scale = Math.min(1, 800 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not prepare profile photo.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.74));
      if (!blob || blob.size > 250 * 1024) throw new Error("Choose a smaller or clearer profile photo (maximum 250 KB after compression).");
      const compressed = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
      setProfilePhoto(compressed);
      setProfilePhotoPreview(URL.createObjectURL(compressed));
      setError("");
    } catch (photoError) {
      setError(photoError instanceof Error ? photoError.message : "Could not prepare profile photo.");
    }
  };

  const handleTrainingCertificates = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
    if (selected.some((file) => !allowedTypes.has(file.type))) {
      setError("Certificates must be PDF, JPG, PNG, or WEBP files.");
      return;
    }
    if (selected.some((file) => file.size > 1024 * 1024)) {
      setError("Each certificate must be 1 MB or smaller.");
      return;
    }
    if (selected.length + trainingCertificates.length > 5) {
      setError("Upload up to 5 certificates.");
      return;
    }
    if (selected.reduce((total, file) => total + file.size, 0) + trainingCertificates.reduce((total, file) => total + file.size, 0) > 2 * 1024 * 1024) {
      setError("All certificates together must be 2 MB or smaller.");
      return;
    }
    setTrainingCertificates((current) => [...current, ...selected]);
    setError("");
  };

  const handleRemoveCertificate = (index: number) => {
    setTrainingCertificates((current) => current.filter((_, i) => i !== index));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    const preflightPayload = {
      ...formData,
      phone: formData.phone.replace(/\D/g, "").replace(/^0(?=\d{9}$)/, ""),
      email: formData.email.trim(),
      district: formData.location,
      role: "worker",
      bio: formData.experience,
      neonUserId: neonUserId || "00000000-0000-4000-8000-000000000000",
    };
    const estimatedMultipartBytes =
      new TextEncoder().encode(JSON.stringify(preflightPayload)).byteLength +
      (profilePhoto?.size || 0) +
      trainingCertificates.reduce((total, file) => total + file.size, 0) +
      4096;
    if (estimatedMultipartBytes > MAX_REGISTRATION_REQUEST_BYTES) {
      setError("Your registration files are too large together. Reduce their size and try again.");
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
          console.error("[WORKER_REGISTRATION_OTP_SEND_ERROR]", otpError);
          setError("We couldn't send the email verification code. Please retry registration with the same email address.");
          return;
        }
      }

      const profilePayload = {
        ...formData,
        phone: formData.phone.replace(/\D/g, "").replace(/^0(?=\d{9}$)/, ""),
        email: formData.email.trim(),
        district: formData.location,
        role: "worker",
        bio: formData.experience,
        neonUserId: resolvedUserId,
      };
      const registrationBody = new FormData();
      registrationBody.set("payload", JSON.stringify(profilePayload));
      if (profilePhoto) registrationBody.set("profilePhoto", profilePhoto);
      trainingCertificates.forEach((file) => registrationBody.append("trainingCertificates", file));

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        body: registrationBody,
      });

      const profileData = await readRegistrationResponse(res);
      if (!res.ok) {
        setError(profileData.error || t("register.errors.submission_failed"));
      } else {
        if (!resolvedEmailVerified) {
          window.location.href = `/otp-verification?email=${encodeURIComponent(formData.email.trim())}`;
        } else {
          setIsSuccess(true);
        }
      }
    } catch (err: any) {
      console.error("Worker Registration Error:", err);
      setError(explainRegistrationException(err) || t("register.errors.network_timeout"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;
  if (isSuccess) return <RegistrationSuccess />;

  const stepTitles = [
    t("register.step1.title"), t("register.step2.title"), 
    t("register.step3.title"), t("register.step4.title")
  ];

  return (
    <div className="min-h-[100dvh] w-full flex bg-[#09090b] text-white font-inter overflow-x-hidden selection:bg-green-400/30">
      <RegistrationSidebar />

      <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[100dvh]">
        <div className="lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="w-full max-w-[480px] px-6 py-12 z-10 flex flex-col min-h-[100dvh] items-center justify-center relative">
          <div className="flex flex-col items-center mb-8 space-y-5 w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-white flex items-center justify-center rounded-2xl shadow-lg shadow-white/5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-[#09090b]">
                  <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" /><path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
                </svg>
              </div>
              <span className="text-[28px] font-bold tracking-tight text-white">Dire<span className="text-green-400">Skill</span></span>
            </div>
            
            <div className="text-center space-y-1.5">
              <h1 className="text-[28px] font-bold tracking-tight text-white flex items-center justify-center gap-2">
                {stepTitles[step - 1]} <span>💼</span>
              </h1>
              <div className="flex items-center justify-center gap-3">
                  <div className="text-zinc-500 text-[13px] font-black uppercase tracking-widest">
                    {t("register.steps.phase")} {step} {t("register.steps.of")} 4
                  </div>
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

          <div className="w-full h-1 bg-zinc-900 rounded-full mb-8 overflow-hidden">
            <motion.div animate={{ width: `${(step / 4) * 100}%` }} className="h-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 mb-6 w-full shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                {step === 1 && <StepIdentity formData={formData} setFormData={setFormData} />}
                {step === 2 && (
                  <StepIdCompliance
                    formData={formData}
                    setFormData={setFormData}
                    fileInputRef={fileInputRef}
                    handleFileUpload={handleFileUpload}
                    handleFileDrop={prepareFaydaDocument}
                    isProcessing={isProcessingId}
                    fileName={faydaFileName}
                    profilePhotoPreview={profilePhotoPreview}
                    onProfilePhoto={handleProfilePhoto}
                    trainingCertificates={trainingCertificates}
                    onTrainingCertificates={handleTrainingCertificates}
                    onRemoveCertificate={handleRemoveCertificate}
                  />
                )}
                {step === 3 && <StepServiceParameters formData={formData} setFormData={setFormData} toggleSkill={toggleSkill} categories={categories} locations={locations} />}
                {step === 4 && <StepReview formData={formData} profilePhotoPreview={profilePhotoPreview} trainingCertificates={trainingCertificates} />}

                <div className="flex gap-3 pt-4">
                  {step > 1 && (
                    <button type="button" onClick={prevStep} className="w-24 h-12 rounded-full font-bold text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 active:scale-[0.98] transition-all">
                      {t("common.back")}
                    </button>
                  )}
                  <button type="button" onClick={step === 4 ? handleSubmit : nextStep} disabled={isLoading} className={`h-12 rounded-full font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${step === 4 ? "flex-1 bg-green-400 text-black shadow-lg shadow-green-400/20" : "flex-1 bg-zinc-100 text-black hover:bg-white"} disabled:opacity-50`}>
                    {isLoading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : (
                      <>{step === 4 ? t("register.step4.title") : t("common.next")}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-center text-[13px] text-zinc-400 font-medium mt-auto pt-10 pb-6 w-full">
            Already registered? <Link href="/login" className="text-green-400 font-bold hover:text-green-300 transition-colors">{t("common.login")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
