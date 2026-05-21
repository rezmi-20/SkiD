"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

// Modular Components
import RegistrationSidebar from "./components/RegistrationSidebar";
import RegistrationSuccess from "./components/RegistrationSuccess";
import StepIdentity from "./components/StepIdentity";
import StepIdCompliance from "./components/StepIdCompliance";
import StepServiceParameters from "./components/StepServiceParameters";
import StepReview from "./components/StepReview";

export default function WorkerRegisterPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "", phone: "", email: "", dateOfBirth: "", gender: "",
    skills: [] as string[], experience: "", location: "", password: "", faydaDocUrl: "",
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
    if (step === 2 && !formData.faydaDocUrl) {
      setError(t("register.errors.fayda_required"));
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData({ ...formData, faydaDocUrl: reader.result as string });
    reader.readAsDataURL(file);
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

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: formData.email,
          district: formData.location,
          role: "worker",
          bio: formData.experience,
          neonUserId: data?.user?.id
        }),
      });

      const profileData = await res.json();
      if (!res.ok) {
        setError(profileData.error || t("register.errors.submission_failed"));
      } else {
        if (data?.user && !data.user.emailVerified) {
          router.push(`/otp-verification?email=${encodeURIComponent(formData.email)}`);
        } else {
          setIsSuccess(true);
        }
      }
    } catch (err: any) {
      console.error("Worker Registration Error:", err);
      setError(err.message || t("register.errors.network_timeout"));
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
                    onClick={() => setLanguage(language === "en" ? "am" : "en")}
                    className="px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
                  >
                    {language === "en" ? "አማርኛ" : "English"}
                  </button>
              </div>
            </div>
          </div>

          <div className="w-full h-1 bg-zinc-900 rounded-full mb-10 overflow-hidden">
            <motion.div animate={{ width: `${(step / 4) * 100}%` }} className="h-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 mb-6 w-full">
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
                {step === 2 && <StepIdCompliance formData={formData} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} />}
                {step === 3 && <StepServiceParameters formData={formData} setFormData={setFormData} toggleSkill={toggleSkill} categories={categories} locations={locations} />}
                {step === 4 && <StepReview formData={formData} />}

                <div className="flex gap-4 pt-4">
                  {step > 1 && (
                    <button type="button" onClick={prevStep} className="w-24 h-[52px] rounded-full font-bold text-[13px] text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-all">
                      {t("common.back")}
                    </button>
                  )}
                  <button type="button" onClick={step === 4 ? handleSubmit : nextStep} disabled={isLoading} className={`h-[52px] rounded-full font-bold text-[14px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${step === 4 ? "flex-1 bg-green-400 text-black shadow-lg shadow-green-400/20" : "flex-1 bg-zinc-100 text-black"} disabled:opacity-50`}>
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
