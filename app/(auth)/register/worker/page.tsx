"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function WorkerRegisterPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    skills: [] as string[],
    experience: "",
    location: "",
    password: "",
    faydaDocUrl: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["Electrician", "Plumber", "Painter", "Satellite Dish Installer", "House Finishing", "Others"];
  const locations = ["Kezira", "Gende Korem", "Megala", "Shinile", "Legehare", "Addis Ketema"];

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.fullName || !formData.phone || !formData.dateOfBirth || !formData.gender || !formData.password) {
        setError(language === "en" ? "Fill all required identity fields." : "እባክዎን ሁሉንም አስፈላጊ ቦታዎች ይሙሉ");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.faydaDocUrl) {
        setError(language === "en" ? "Official Fayda ID document is required." : "የፋይዳ መታወቂያ መጫን ያስፈልጋል");
        return false;
      }
    }
    if (step === 3) {
      if (formData.skills.length === 0 || !formData.location) {
        setError(language === "en" ? "Select at least one expertise and location." : "እባክዎን ሙያ እና አካባቢ ይምረጡ");
        return false;
      }
    }
    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, faydaDocUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          district: formData.location,
          role: "worker",
          bio: formData.experience,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed. Please check field formats.");
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError("Network timeout. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const t = {
    en: {
      stepHeader: "Phase",
      of: "of",
      step1Title: "Identity Details",
      step2Title: "ID Compliance",
      step3Title: "Service Parameters",
      step4Title: "Review & Sign",
      next: "Continue",
      back: "Return",
      submit: "Submit Credentials",
      successTitle: "System Registered",
      successMsg: "Your credentials have been indexed. Access to the job marketplace is currently pending ID manual audit.",
    },
    am: {
      stepHeader: "ደረጃ",
      of: "ከ",
      step1Title: "የግል መረጃ",
      step2Title: "ማንነት ማረጋገጫ",
      step3Title: "ሙያ እና አካባቢ",
      step4Title: "ክለሳ",
      next: "ቀጥል",
      back: "ተመለስ",
      submit: "ማመልከቻ አስገባ",
      successTitle: "ተመዝግበዋል",
      successMsg: "መረጃዎ ገብቷል። አስተዳዳሪ እስኪያረጋግጥ ድረስ ስራዎች ዝግ ይሆናሉ።",
    },
  }[language];

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#09090b] text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[450px] space-y-10 text-center"
        >
          <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center shadow-xl mx-auto mb-6">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
             </svg>
          </div>
          <div className="space-y-4">
             <h2 className="text-4xl font-bold tracking-tight">{t.successTitle}</h2>
             <p className="text-zinc-400 font-medium leading-relaxed">
               {t.successMsg}
             </p>
          </div>
          <button 
            onClick={() => router.push("/login")}
            className="w-full h-14 bg-green-400 text-black rounded-full font-bold text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-green-400/20"
          >
            Enter Workspace
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex bg-[#09090b] text-white font-inter overflow-x-hidden selection:bg-green-400/30">
      
      {/* Desktop Art / Branding Side (Left) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#09090b] border-r border-zinc-800/50 overflow-hidden items-center justify-center p-12">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop" 
            alt="Professional Workspace" 
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
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2 className="text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Professional <br/><span className="text-green-400">Onboarding</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
            Join our elite network of verified professionals and access high-value opportunities.
          </p>
        </div>
        
        <div className="absolute bottom-12 left-12 flex items-center gap-4 text-sm font-medium text-zinc-500">
          <Link href="#" className="hover:text-green-400 transition-colors">Privacy Policy</Link>
          <span>&bull;</span>
          <Link href="#" className="hover:text-green-400 transition-colors">Terms of Service</Link>
        </div>
      </div>

      {/* Form Side (Right on Desktop, Full on Mobile) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[100dvh]">
        
        {/* Mobile Ambient Glow */}
        <div className="lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="w-full max-w-[480px] px-6 py-12 z-10 flex flex-col min-h-[100dvh] items-center justify-center relative">
          
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
                {t.step1Title} <span>💼</span>
              </h1>
              <div className="flex items-center justify-center gap-3">
                  <div className="text-zinc-500 text-[13px] font-black uppercase tracking-widest">
                    Phase {step} {t.of} 4
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

          {/* Progress Bar */}
          <div className="w-full h-1 bg-zinc-900 rounded-full mb-10 overflow-hidden">
            <motion.div 
              initial={{ width: "25%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              className="h-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
            />
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

          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-zinc-300 ml-1">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
                        placeholder="Surname, First Name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-zinc-300 ml-1">Phone (+251)</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                          className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
                          placeholder="9..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-zinc-300 ml-1">Date of Birth</label>
                        <input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all font-medium text-[14px] text-white [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-zinc-300 ml-1">Gender</label>
                        <div className="grid grid-cols-2 gap-4">
                        {["Male", "Female"].map((g) => (
                            <button
                            key={g}
                            type="button"
                            onClick={() => setFormData({ ...formData, gender: g })}
                            className={`h-[52px] rounded-2xl font-bold transition-all border text-[13px] ${
                                formData.gender === g 
                                ? "bg-green-400 text-black border-green-400 shadow-lg shadow-green-400/10" 
                                : "bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500"
                            }`}
                            >
                            {g}
                            </button>
                        ))}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-zinc-300 ml-1">Account Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
                        placeholder="Security Key (Min 6 chars)"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`aspect-[16/10] w-full border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-8 transition-all cursor-pointer overflow-hidden group ${
                        formData.faydaDocUrl 
                          ? "border-green-400 bg-green-400/5" 
                          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
                      }`}
                    >
                      {formData.faydaDocUrl ? (
                        <img src={formData.faydaDocUrl} alt="Fayda Scan" className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                             </svg>
                          </div>
                          <p className="font-bold text-base text-zinc-300">Scan Fayda National ID</p>
                          <p className="text-[11px] text-zinc-500 mt-2 font-black uppercase tracking-widest">High precision scan required</p>
                        </>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                    <div className="p-5 bg-green-400/5 border border-green-400/10 rounded-2xl space-y-2">
                       <div className="flex items-center gap-2 text-green-400 font-black text-[10px] uppercase tracking-widest">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                          Secure Indexing
                       </div>
                       <p className="text-[12px] text-zinc-400 leading-relaxed font-medium">
                         Your document is encrypted. Human audit typically completes within <span className="text-green-400 font-bold">4 hours</span>.
                       </p>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[13px] font-medium text-zinc-300 ml-1">Expertise Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => toggleSkill(cat)}
                            className={`px-5 h-[42px] rounded-full text-[11px] font-bold transition-all border ${
                              formData.skills.includes(cat)
                                ? "bg-green-400 text-black border-green-400 shadow-md shadow-green-400/20"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-zinc-300 ml-1">Professional Portfolio Summary</label>
                      <textarea
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full h-32 px-4 py-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 text-[14px] font-medium outline-none transition-all placeholder:text-zinc-600 leading-relaxed no-scrollbar"
                        placeholder="Describe your technical background..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-zinc-300 ml-1">Service Geography (District)</label>
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 font-bold text-[14px] outline-none transition-all [color-scheme:dark]"
                      >
                        <option value="">Select District</option>
                        {locations.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-[24px] space-y-4">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-bold text-lg text-white">{formData.fullName}</p>
                            <p className="text-[13px] text-green-400 font-bold">+251 {formData.phone}</p>
                          </div>
                          <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                             {formData.location}
                          </div>
                       </div>
                       <div className="flex flex-wrap gap-1.5">
                          {formData.skills.map(s => (
                             <span key={s} className="text-[11px] font-medium text-zinc-500">• {s}</span>
                          ))}
                       </div>
                    </div>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800">
                       {formData.faydaDocUrl ? (
                         <img src={formData.faydaDocUrl} alt="ID Check" className="w-full h-full object-contain" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-bold">No ID Scan Attached</div>
                       )}
                    </div>
                    <label className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl cursor-pointer group hover:bg-zinc-800/50 transition-all">
                        <input type="checkbox" required className="mt-1 accent-green-400 w-4 h-4" />
                        <span className="text-[12px] font-medium text-zinc-400 leading-relaxed">
                            I certify that the information is accurate. Misrepresentation will result in permanent exclusion.
                        </span>
                    </label>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="w-24 h-[52px] rounded-full font-bold text-[13px] text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-all"
                    >
                      {t.back}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={step === 4 ? handleSubmit : nextStep}
                    disabled={isLoading}
                    className={`h-[52px] rounded-full font-bold text-[14px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                      step === 4 
                        ? "flex-1 bg-green-400 text-black shadow-lg shadow-green-400/20" 
                        : "flex-1 bg-zinc-100 text-black"
                    } disabled:opacity-50`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        {step === 4 ? t.submit : t.next}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-center text-[13px] text-zinc-400 font-medium mt-auto pt-10 pb-6 w-full">
            Already registered?{" "}
            <Link href="/login" className="text-green-400 font-bold hover:text-green-300 transition-colors">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
