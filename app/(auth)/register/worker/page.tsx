"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
          district: formData.location, // MAP location to district
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
      <div className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-[#000000] text-black dark:text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[450px] space-y-10"
        >
          <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-xl">
             <span className="material-symbols-outlined text-white dark:text-black text-4xl">inventory</span>
          </div>
          <div className="space-y-4">
             <h2 className="text-4xl font-black tracking-tightest">{t.successTitle}</h2>
             <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
               {t.successMsg}
             </p>
          </div>
          <button 
            onClick={() => router.push("/login")}
            className="w-full h-14 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-600/20"
          >
            Enter Workspace
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-black dark:text-white flex flex-col font-inter transition-colors duration-500">
      
      {/* Precision Navigation */}
      <nav className="p-8 flex justify-between items-center border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#000000] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-black dark:bg-white rounded flex items-center justify-center">
             <span className="material-symbols-outlined text-[14px] text-white dark:text-black font-black">shield_person</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Register Professional</span>
        </div>
        <button 
          onClick={() => setLanguage(language === "en" ? "am" : "en")}
          className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
        >
          {language === "en" ? "አማርኛ" : "English"}
        </button>
      </nav>

      {/* Modern Progress Index */}
      <div className="h-0.5 w-full bg-gray-50 dark:bg-white/5">
        <motion.div 
          initial={{ width: "25%" }}
          animate={{ width: `${(step / 4) * 100}%` }}
          className="h-full bg-blue-600 transition-all duration-700"
        />
      </div>

      <main className="flex-1 max-w-[500px] mx-auto w-full px-8 py-16 md:py-24 space-y-12">
        <header className="space-y-4">
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">
             {t.stepHeader} {step} {t.of} 4
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tightest leading-tight">
            {step === 1 && t.step1Title}
            {step === 2 && t.step2Title}
            {step === 3 && t.step3Title}
            {step === 4 && t.step4Title}
          </h1>
        </header>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            {/* STEP 1: PERSONAL IDENTITY */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-14 px-5 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none font-medium transition-all"
                    placeholder="Surname, First Name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Phone Number</label>
                    <div className="relative">
                       <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/20 font-black text-sm">+251</span>
                       <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                        className="w-full h-14 pl-16 pr-5 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none font-medium transition-all"
                        placeholder="9..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-14 px-5 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none font-medium transition-all"
                      placeholder="name@cloud.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Birth Index</label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full h-14 px-5 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none font-medium transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Gender Group</label>
                    <div className="grid grid-cols-2 gap-4 h-14">
                      {["Male", "Female"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: g })}
                          className={`rounded-xl font-bold transition-all border text-[10px] uppercase tracking-widest ${
                            formData.gender === g 
                              ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg" 
                              : "bg-gray-50 dark:bg-[#111111] border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-6 border-t border-gray-100 dark:border-white/5">
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-600/50 dark:text-blue-500/50 ml-1">Safety Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-14 px-5 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none font-medium transition-all"
                    placeholder="Security Key (Min 6 chars)"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: ID COMPLIANCE */}
            {step === 2 && (
              <div className="space-y-10">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-[16/10] w-full border border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer overflow-hidden group ${
                    formData.faydaDocUrl 
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-600/5" 
                      : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111111] hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  {formData.faydaDocUrl ? (
                    <img src={formData.faydaDocUrl} alt="Fayda Scan" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white dark:bg-black border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-gray-400 dark:text-gray-600 text-3xl">add_photo_alternate</span>
                      </div>
                      <p className="font-bold text-sm text-gray-600 dark:text-gray-300">Scan Fayda National ID</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-[0.2em]">High precision scan required</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-gray-100 dark:bg-white/5 font-black uppercase text-[9px] tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    Camera
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-gray-100 dark:bg-white/5 font-black uppercase text-[9px] tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_upload</span>
                    Files
                  </button>
                </div>

                <div className="p-6 bg-blue-50 dark:bg-blue-600/5 border border-blue-100 dark:border-blue-600/10 rounded-2xl space-y-3">
                   <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                      <span className="material-symbols-outlined text-[14px]">verified_user</span>
                      Secure Indexing
                   </div>
                   <p className="text-xs text-blue-900/60 dark:text-blue-200/40 leading-relaxed font-medium">
                     Your document is processed through local encryption. Human audit typically completes within <span className="text-blue-600 dark:text-blue-400 font-bold">4 hours</span>.
                   </p>
                </div>
              </div>
            )}

            {/* STEP 3: SERVICE PARAMETERS */}
            {step === 3 && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Expertise Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleSkill(cat)}
                        className={`px-6 h-10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                          formData.skills.includes(cat)
                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                            : "bg-gray-50 dark:bg-[#111111] border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-white/20"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Professional Portfolio Summary</label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full h-40 px-6 py-5 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 text-sm font-medium outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/5 leading-relaxed"
                    placeholder="Describe your technical background, certifications, and years of service..."
                  />
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Service Geography</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, location: "Current Location" })}
                      className="flex items-center justify-center gap-2 h-14 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all font-inter"
                    >
                      <span className="material-symbols-outlined text-[16px]">location_searching</span>
                      Detect Location
                    </button>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full h-14 px-5 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 font-bold text-sm outline-none transition-all [color-scheme:dark]"
                    >
                      <option value="">Select District</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW */}
            {step === 4 && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-8 bg-gray-50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-white/5 space-y-4">
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Master Record</div>
                      <div className="space-y-2">
                        <p className="font-bold text-lg leading-tight">{formData.fullName}</p>
                        <p className="text-xs text-blue-600 font-black">+251 {formData.phone}</p>
                        <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">{formData.gender} • {formData.dateOfBirth}</p>
                      </div>
                   </div>
                   <div className="p-8 bg-gray-50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-white/5 space-y-4">
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Reach & Scope</div>
                      <div className="space-y-2">
                        <p className="font-bold text-lg leading-tight">{formData.location}</p>
                        <p className="text-xs font-medium text-gray-400 leading-relaxed">{formData.skills.join(", ")}</p>
                      </div>
                   </div>
                </div>

                <div className="p-2 bg-gray-50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-white/5">
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5 shadow-inner">
                       <img src={formData.faydaDocUrl} alt="Identity Check" className="w-full h-full object-contain" />
                    </div>
                </div>

                <label className="flex items-start gap-5 p-8 bg-blue-50/50 dark:bg-blue-600/5 rounded-2xl border border-blue-100 dark:border-blue-600/10 cursor-pointer group hover:bg-blue-100 dark:hover:bg-blue-600/10 transition-all">
                  <div className="mt-1 relative flex items-center justify-center">
                    <input type="checkbox" required className="peer w-5 h-5 opacity-0 absolute cursor-pointer" />
                    <div className="w-5 h-5 border border-gray-300 dark:border-white/10 rounded-md flex items-center justify-center peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all">
                       <span className="material-symbols-outlined text-white font-black text-[14px] peer-checked:opacity-100 opacity-0">check</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                    Compliance: I certify that the information indexing is accurate. Misrepresentation of identity will result in permanent exclusion from the platform.
                  </span>
                </label>
              </div>
            )}

            {/* ACTION UNIT */}
            <div className="flex gap-4 pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-28 h-14 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  {t.back}
                </button>
              )}
              <button
                type="button"
                onClick={step === 4 ? handleSubmit : nextStep}
                disabled={isLoading}
                className={`h-14 rounded-xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-sm flex items-center justify-center gap-3 ${
                  step === 4 
                    ? "w-full bg-blue-600 text-white shadow-blue-600/20" 
                    : "flex-1 bg-black dark:bg-white text-white dark:text-black"
                } disabled:opacity-50`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 4 ? t.submit : t.next}
                    <span className="material-symbols-outlined text-[18px] font-bold">arrow_right_alt</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Decorative Text Component */}
      <div className="fixed bottom-10 right-10 font-black text-[10vw] text-gray-50 dark:text-white/[0.01] pointer-events-none select-none tracking-tightest leading-none">
        {step > 9 ? step : `0${step}`}
      </div>
    </div>
  );
}
