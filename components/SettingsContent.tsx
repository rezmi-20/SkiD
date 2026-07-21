"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { updateProfile } from "@/lib/actions/profile";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  initialData: any;
  role: "client" | "worker";
}

interface ChapaBank {
  id?: number;
  code?: string | number;
  name?: string;
}

export default function SettingsContent({ initialData, role }: Props) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [payoutStatus, setPayoutStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [payoutMessage, setPayoutMessage] = useState("");
  const [banks, setBanks] = useState<ChapaBank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: initialData.full_name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    faydaFanNumber: "",
    bio: initialData.bio || "",
    skills: initialData.skills || [],
    gender: initialData.gender || "",
    dateOfBirth: initialData.date_of_birth ? new Date(initialData.date_of_birth).toISOString().split('T')[0] : "",
    district: initialData.district || "",
    hourlyRate: initialData.hourly_rate || 0,
    avatarUrl: initialData.avatar_url || "",
  });
  const [payoutForm, setPayoutForm] = useState({
    accountName: initialData.full_name || "",
    accountNumber: initialData.bank_account || "",
    bankCode: initialData.bank_code || "",
    bankName: initialData.bank_name || "",
  });

  const [activeSection, setActiveSection] = useState("personal");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const hasChapaSubaccount = Boolean(initialData.chapa_subaccount_id);

  useEffect(() => {
    if (role !== "worker") return;

    let isMounted = true;
    setBanksLoading(true);

    fetch("/api/list-banks")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load banks.");
        return data.banks || [];
      })
      .then((bankList: ChapaBank[]) => {
        if (isMounted) setBanks(bankList);
      })
      .catch((err) => {
        if (isMounted) setPayoutMessage(err instanceof Error ? err.message : "Unable to load banks.");
      })
      .finally(() => {
        if (isMounted) setBanksLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [role]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev: typeof formData) => ({ ...prev, avatarUrl: data.url }));
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Avatar upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError("");
    setSuccess(false);

    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || "Update failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleCreateSubaccount = async () => {
    if (hasChapaSubaccount || payoutStatus === "loading") return;

    setPayoutStatus("loading");
    setPayoutMessage("");

    try {
      const selectedBank = banks.find((bank) => String(bank.code ?? bank.id) === payoutForm.bankCode);
      const res = await fetch("/api/create-subaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: initialData.user_id,
          accountName: payoutForm.accountName,
          accountNumber: payoutForm.accountNumber,
          bankCode: payoutForm.bankCode,
          bankName: selectedBank?.name || payoutForm.bankName,
          splitType: "percentage",
          splitValue: 0.05,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to create Chapa subaccount.");
      }

      setPayoutStatus("success");
      setPayoutMessage(data.message || "Chapa payout account connected.");
      router.refresh();
    } catch (err) {
      setPayoutStatus("error");
      setPayoutMessage(err instanceof Error ? err.message : "Unable to create Chapa subaccount.");
    }
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: "person" },
    ...(role === "worker" ? [{ id: "professional", label: "Professional", icon: "construction" }] : []),
    ...(role === "worker" ? [{ id: "payout", label: "Payout", icon: "account_balance" }] : []),
    { id: "security", label: "Security", icon: "security" },
    { id: "notifications", label: "Preferences", icon: "notifications" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Page Header ── */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full hover:bg-surface-container-high transition-all active:scale-90">
              <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <button 
             form="settings-form"
             disabled={isPending}
             className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${
               success ? "bg-green-500 text-white" : "bg-primary text-on-primary shadow-lg shadow-primary/20"
             }`}
           >
              {isPending ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              ) : success ? (
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              ) : (
                "Save Changes"
              )}
           </button>
        </div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight uppercase">Profile <span className="text-primary italic">Settings</span></h1>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar (Desktop) / Horizontal Tabs (Mobile) */}
        <aside className="lg:w-64 flex lg:flex-col overflow-x-auto no-scrollbar gap-2 lg:sticky lg:top-24 h-fit">
           {sections.map(s => (
             <button 
               key={s.id}
               onClick={() => setActiveSection(s.id)}
               className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                 activeSection === s.id 
                  ? "bg-on-surface text-surface-container-lowest shadow-lg" 
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-surface-container-highest/30"
               }`}
             >
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                {s.label}
             </button>
           ))}
        </aside>

        {/* Content Area */}
        <div className="flex-grow max-w-2xl">
          <form id="settings-form" onSubmit={handleSave} className="space-y-12">
            
            <AnimatePresence mode="wait">
              {activeSection === "personal" && (
                <motion.section 
                  key="personal"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Avatar Upload */}
                  <div className={`flex flex-col items-center gap-4 py-8 rounded-[3rem] border border-dashed transition-all ${
                    initialData.is_verified ? "bg-primary/5 border-primary/20 opacity-90" : "bg-surface-container-low/30 border-surface-container-highest cursor-pointer"
                  }`}>
                    <div 
                      className={`relative group ${initialData.is_verified ? "cursor-default" : "cursor-pointer"}`} 
                      onClick={() => !initialData.is_verified && fileInputRef.current?.click()}
                    >
                       <div className={`w-24 h-24 rounded-[2.5rem] border-4 shadow-xl flex items-center justify-center overflow-hidden transition-all ${
                         initialData.is_verified ? "bg-primary/10 border-primary" : "bg-surface-container-high border-surface"
                       }`}>
                          {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl font-bold text-primary">{formData.fullName.charAt(0) || "U"}</span>
                          )}
                       </div>
                       {!initialData.is_verified && !uploading && (
                         <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="material-symbols-outlined text-white">camera_alt</span>
                         </div>
                       )}
                       {uploading && (
                         <div className="absolute inset-0 bg-black/60 rounded-[2.5rem] flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                         </div>
                       )}
                       {initialData.is_verified && (
                         <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-on-primary rounded-full border-4 border-surface flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-[16px] filled">verified</span>
                         </div>
                       )}
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
                         {initialData.is_verified ? "Official Fayda Identity Photo" : "Tap to update avatar"}
                       </p>
                       {initialData.is_verified && (
                         <p className="text-[9px] text-primary font-bold uppercase tracking-tighter mt-1">Locked after Verification</p>
                       )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Full Name</label>
                       <input 
                         type="text" 
                         value={formData.fullName}
                         onChange={e => setFormData({...formData, fullName: e.target.value})}
                         disabled={initialData.is_verified}
                         className={`w-full h-14 border rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm ${
                           initialData.is_verified 
                            ? "bg-surface-container-low border-primary/20 text-on-surface opacity-80 cursor-not-allowed" 
                            : "bg-surface-container-lowest border-surface-container-highest"
                         }`}
                       />
                       {initialData.is_verified && (
                         <span className="material-symbols-outlined absolute right-4 top-[42px] text-primary text-[18px]">verified</span>
                       )}
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Phone Number</label>
                       <input 
                         type="text" 
                         value={formData.phone}
                         onChange={e => setFormData({...formData, phone: e.target.value})}
                         className="w-full h-14 bg-surface-container-lowest border border-surface-container-highest rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                       />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Fayda FAN Number</label>
                       <input
                         type="text"
                         value={initialData.is_verified ? initialData.masked_fayda_fan_number || "" : formData.faydaFanNumber}
                         onChange={e => setFormData({...formData, faydaFanNumber: e.target.value})}
                         disabled={initialData.is_verified}
                         placeholder={initialData.is_verified ? initialData.masked_fayda_fan_number || "Not recorded" : "Enter your full FAN number"}
                         className={`w-full h-14 border rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm ${
                           initialData.is_verified
                            ? "bg-surface-container-low border-primary/20 text-on-surface opacity-80 cursor-not-allowed"
                            : "bg-surface-container-lowest border-surface-container-highest"
                         }`}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Email Address</label>
                       <input 
                         type="email" 
                         value={formData.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                         className="w-full h-14 bg-surface-container-lowest border border-surface-container-highest rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Gender</label>
                       <select 
                         value={formData.gender}
                         onChange={e => setFormData({...formData, gender: e.target.value})}
                         className="w-full h-14 bg-surface-container-lowest border border-surface-container-highest rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm appearance-none"
                       >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                       </select>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeSection === "professional" && role === "worker" && (
                <motion.section 
                  key="professional"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Professional Bio</label>
                     <textarea 
                       rows={4}
                       value={formData.bio}
                       onChange={e => setFormData({...formData, bio: e.target.value})}
                       className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[2rem] p-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm leading-relaxed"
                       placeholder="Describe your expertise and service quality..."
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Service Skills</label>
                     <div className="flex flex-wrap gap-2">
                        {formData.skills.map((s: string, i: number) => (
                          <span key={i} className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                             {s}
                             <button type="button" onClick={() => setFormData({...formData, skills: formData.skills.filter((_: string, idx: number) => idx !== i)})}>
                                <span className="material-symbols-outlined text-[16px]">close</span>
                             </button>
                          </span>
                        ))}
                        <button type="button" className="px-5 py-2.5 bg-surface-container-high border border-surface-container-highest rounded-2xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2 hover:bg-primary/5 hover:text-primary transition-all">
                           <span className="material-symbols-outlined text-[16px]">add</span>
                           Add Skill
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Hourly Rate (ETB)</label>
                       <input 
                         type="number" 
                         value={formData.hourlyRate}
                         onChange={e => setFormData({...formData, hourlyRate: parseInt(e.target.value) || 0})}
                         className="w-full h-14 bg-surface-container-lowest border border-surface-container-highest rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">District / Area</label>
                       <input 
                         type="text" 
                         value={formData.district}
                         onChange={e => setFormData({...formData, district: e.target.value})}
                         className="w-full h-14 bg-surface-container-lowest border border-surface-container-highest rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                       />
                    </div>
                  </div>
                </motion.section>
              )}

              {activeSection === "payout" && role === "worker" && (
                <motion.section
                  key="payout"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="rounded-[2rem] border border-surface-container-highest bg-surface-container-low/50 p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        hasChapaSubaccount ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"
                      }`}>
                        <span className="material-symbols-outlined">
                          {hasChapaSubaccount ? "verified" : "account_balance"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">
                          Chapa Payout Account
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                          {hasChapaSubaccount
                            ? "Your Chapa subaccount is connected. Client payments can now be split and released to you."
                            : "Connect your bank account so clients can pay completed jobs through Chapa split payments."}
                        </p>
                        {hasChapaSubaccount && (
                          <p className="mt-3 truncate font-mono text-[11px] text-primary">
                            {initialData.chapa_subaccount_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {!hasChapaSubaccount && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                            Account Name
                          </label>
                          <input
                            type="text"
                            value={payoutForm.accountName}
                            onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })}
                            className="h-14 w-full rounded-2xl border border-surface-container-highest bg-surface-container-lowest px-6 text-sm font-bold outline-none transition-all focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                            Account Number
                          </label>
                          <input
                            type="text"
                            value={payoutForm.accountNumber}
                            onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                            className="h-14 w-full rounded-2xl border border-surface-container-highest bg-surface-container-lowest px-6 text-sm font-bold outline-none transition-all focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                          Bank
                        </label>
                        <select
                          value={payoutForm.bankCode}
                          onChange={(e) => {
                            const selectedBank = banks.find((bank) => String(bank.code ?? bank.id) === e.target.value);
                            setPayoutForm({
                              ...payoutForm,
                              bankCode: e.target.value,
                              bankName: selectedBank?.name || "",
                            });
                          }}
                          disabled={banksLoading}
                          className="h-14 w-full appearance-none rounded-2xl border border-surface-container-highest bg-surface-container-lowest px-6 text-sm font-bold outline-none transition-all focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                        >
                          <option value="">{banksLoading ? "Loading banks..." : "Select bank"}</option>
                          {banks.map((bank) => {
                            const code = String(bank.code ?? bank.id ?? "");
                            if (!code) return null;

                            return (
                              <option key={code} value={code}>
                                {bank.name || code}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleCreateSubaccount}
                        disabled={payoutStatus === "loading" || !payoutForm.accountName || !payoutForm.accountNumber || !payoutForm.bankCode}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-xs font-black uppercase tracking-widest text-on-primary transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className={`material-symbols-outlined text-[18px] ${payoutStatus === "loading" ? "animate-spin" : ""}`}>
                          {payoutStatus === "loading" ? "sync" : "add_card"}
                        </span>
                        {payoutStatus === "loading" ? "Connecting..." : "Connect Chapa Payout"}
                      </button>
                    </div>
                  )}

                  {payoutMessage && (
                    <div className={`rounded-2xl border p-4 text-center text-xs font-bold ${
                      payoutStatus === "error"
                        ? "border-error/20 bg-error-container text-on-error-container"
                        : "border-primary/20 bg-primary/10 text-primary"
                    }`}>
                      {payoutMessage}
                    </div>
                  )}
                </motion.section>
              )}

              {activeSection === "security" && (
                <motion.section 
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-8 bg-surface-container-low/50 border border-surface-container-highest rounded-[3rem] space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                           <span className="material-symbols-outlined">lock</span>
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">Account Security</h3>
                           <p className="text-xs text-on-surface-variant opacity-60">Manage your access credentials</p>
                        </div>
                     </div>
                     
                     <div className="flex flex-col gap-3">
                        <button type="button" className="w-full h-14 bg-surface-container-lowest border border-surface-container-highest rounded-2xl flex items-center justify-between px-6 hover:border-primary/30 transition-all group">
                           <span className="text-xs font-bold text-on-surface uppercase tracking-widest">Change PIN Code</span>
                           <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
                        </button>
                        <button type="button" className="w-full h-14 bg-surface-container-lowest border border-surface-container-highest rounded-2xl flex items-center justify-between px-6 hover:border-primary/30 transition-all group">
                           <span className="text-xs font-bold text-on-surface uppercase tracking-widest">Update Password</span>
                           <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
                        </button>
                     </div>
                  </div>

                  <div className="p-8 bg-error-container/10 border border-error/20 rounded-[3rem] flex items-center justify-between">
                     <div className="space-y-1">
                        <h3 className="text-sm font-black text-error uppercase tracking-widest">Danger Zone</h3>
                        <p className="text-xs text-error opacity-60">Permanently delete your account</p>
                     </div>
                     <button type="button" className="px-6 py-3 bg-error text-on-error rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-error/20 active:scale-95 transition-all">
                        Delete Account
                     </button>
                  </div>
                </motion.section>
              )}

              {activeSection === "notifications" && (
                <motion.section 
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="space-y-6">
                     <h3 className="text-label-sm uppercase tracking-[0.2em] text-on-surface-variant ml-4 opacity-60">Platform Language</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <button 
                          type="button"
                          onClick={() => setLanguage('en')}
                          className={`h-20 rounded-[2rem] border transition-all flex flex-col items-center justify-center gap-1 ${
                            language === 'en' ? "bg-primary text-on-primary border-primary shadow-xl" : "bg-surface-container-low border-surface-container-highest text-on-surface-variant"
                          }`}
                        >
                           <span className="text-xl font-black">EN</span>
                           <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">English</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setLanguage('am')}
                          className={`h-20 rounded-[2rem] border transition-all flex flex-col items-center justify-center gap-1 ${
                            language === 'am' ? "bg-primary text-on-primary border-primary shadow-xl" : "bg-surface-container-low border-surface-container-highest text-on-surface-variant"
                          }`}
                        >
                           <span className="text-xl font-black">አማ</span>
                           <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Amharic</span>
                        </button>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h3 className="text-label-sm uppercase tracking-[0.2em] text-on-surface-variant ml-4 opacity-60">Push Notifications</h3>
                     <div className="space-y-3">
                        {[
                          { label: "Job Request Alerts", id: "notify_requests" },
                          { label: "Contract Updates", id: "notify_contracts" },
                          { label: "Messaging Notifications", id: "notify_messages" },
                        ].map(n => (
                          <div key={n.id} className="flex items-center justify-between p-6 bg-surface-container-lowest border border-surface-container-highest rounded-[2rem]">
                             <span className="text-xs font-bold text-on-surface uppercase tracking-widest">{n.label}</span>
                             <div className="w-12 h-6 bg-primary/20 rounded-full relative p-1 cursor-pointer">
                                <div className="w-4 h-4 bg-primary rounded-full translate-x-6" />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-bold text-center border border-error/20">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

    </div>
  );
}
