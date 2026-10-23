"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { updateProfile } from "@/lib/actions/profile";
import { requestWorkerAvatarChange } from "@/lib/actions/worker-avatar";
import { changeContractPin } from "@/lib/actions/contract-setup";
import { authClient } from "@/lib/auth/client";
import { useLanguage } from "@/context/LanguageContext";
import {
  User,
  Wrench,
  Landmark,
  Shield,
  Bell,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Camera,
  Eye,
  EyeOff,
  X,
  Plus,
  CreditCard,
  Lock,
  ChevronRight,
  ChevronDown,
  KeyRound,
  AlertCircle,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

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
  const searchParams = useSearchParams();
  const { t, language, setLanguage } = useLanguage();
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [showFin, setShowFin] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [payoutMessage, setPayoutMessage] = useState("");
  const [banks, setBanks] = useState<ChapaBank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: initialData.full_name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    faydaFinNumber: "",
    faydaDocDataUrl: "",
    faydaDocName: "",
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
  const [avatarRequestStatus, setAvatarRequestStatus] = useState<string | null>(initialData.avatar_change_request_status || null);
  const [avatarRequestReason, setAvatarRequestReason] = useState<string>(initialData.avatar_change_request_reason || "");
  const hasChapaSubaccount = Boolean(initialData.chapa_subaccount_id);
  const verificationReason = searchParams.get("reason");
  const verificationStatus = initialData.verification_status || (initialData.is_verified ? "approved" : "not_started");
  const clientCanSubmitVerification = role === "client" && verificationStatus !== "approved" && verificationStatus !== "pending";

  // Security modals / panels
  const [activeSecurityPanel, setActiveSecurityPanel] = useState<"none" | "pin" | "password">("none");
  
  // PIN change state
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);
    if (!/^\d{4}$/.test(newPin)) {
      setPinError("New Contract PIN must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("New PIN and confirmation do not match.");
      return;
    }
    setPinLoading(true);
    try {
      const res = await changeContractPin(currentPin, newPin, confirmPin);
      if (res.success) {
        setPinSuccess(res.message || "Contract PIN updated successfully!");
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
      } else {
        setPinError(res.error || "Failed to update Contract PIN.");
      }
    } catch {
      setPinError("Unexpected error while updating PIN.");
    } finally {
      setPinLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Password confirmation does not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (error) {
        setPasswordError(error.message || "Failed to update password. Please check your current password.");
      } else {
        setPasswordSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (role !== "worker") return;

    let isMounted = true;
    setBanksLoading(true);

    fetch("/api/list-banks")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t("settings.errLoadBanks"));
        return data.banks || [];
      })
      .then((bankList: ChapaBank[]) => {
        if (isMounted) setBanks(bankList);
      })
      .catch((err) => {
        if (isMounted) setPayoutMessage(err instanceof Error ? err.message : t("settings.errLoadBanks"));
      })
      .finally(() => {
        if (isMounted) setBanksLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [role]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError(t("settings.errAvatarType"));
      input.value = "";
      return;
    }
    const maxAvatarSize = role === "worker" ? 250 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxAvatarSize) {
      setError(role === "worker" ? "Worker profile photos must be 250 KB or smaller." : t("settings.errAvatarSize"));
      input.value = "";
      return;
    }

    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (res.ok && data.url) {
        if (role === "worker") {
          const request = await requestWorkerAvatarChange(data.url);
          if (!request.success) {
            setError(request.error || "Could not request a photo change.");
          } else {
            setAvatarRequestStatus("pending");
            setAvatarRequestReason("");
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3500);
          }
        } else {
          setFormData((prev: typeof formData) => ({ ...prev, avatarUrl: data.url }));
        }
      } else {
        setError(data.error || t("settings.errUploadFailed"));
      }
    } catch {
      setError(t("settings.errAvatarUploadFailed"));
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  const handleFaydaDocumentUpload = (file: File | null) => {
    if (!file) return;
    setVerificationError("");
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError(t("settings.errFaydaDocType"));
      setVerificationError(t("settings.errFaydaDocType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t("settings.errFaydaDocSize"));
      setVerificationError(t("settings.errFaydaDocSize"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev: typeof formData) => ({
        ...prev,
        faydaDocDataUrl: String(reader.result || ""),
        faydaDocName: file.name,
      }));
    };
    reader.onerror = () => setError(t("settings.errFaydaDocRead"));
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError("");
    setVerificationError("");
    setSuccess(false);

    try {
      const submitter = (e.nativeEvent as SubmitEvent).submitter;
      const isVerificationSubmit =
        submitter instanceof HTMLButtonElement &&
        submitter.name === "intent" &&
        submitter.value === "client-verification";
      const wantsClientVerification =
        role === "client" && (isVerificationSubmit || formData.faydaFinNumber || formData.faydaDocDataUrl);

      if (wantsClientVerification) {
        const showVerificationError = (message: string) => {
          setError(message);
          setVerificationError(message);
        };

        if (!clientCanSubmitVerification) {
          showVerificationError(t("settings.errVerificationBlocked"));
          return;
        }
        if (!formData.faydaFinNumber || !formData.faydaDocDataUrl) {
          showVerificationError(t("settings.errVerificationBoth"));
          return;
        }
        if (!/^\d{12}$/.test(formData.faydaFinNumber)) {
          showVerificationError(t("settings.errFinDigits"));
          return;
        }
      }

      const res = await updateProfile(formData);
      if (res.success) {
        setSuccess(true);
        const returnTo = searchParams.get("returnTo");
        if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
          router.push(returnTo);
          return;
        }
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || t("settings.errUpdateFailed"));
        if (wantsClientVerification) {
          setVerificationError(res.error || t("settings.errVerificationSubmit"));
        }
      }
    } catch (err) {
      setError(t("settings.errUnexpected"));
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
        throw new Error(data.error || t("settings.errCreateSubaccount"));
      }

      setPayoutStatus("success");
      setPayoutMessage(data.message || t("settings.payoutConnected"));
      router.refresh();
    } catch (err) {
      setPayoutStatus("error");
      setPayoutMessage(err instanceof Error ? err.message : t("settings.errCreateSubaccount"));
    }
  };

  const sections = [
    { id: "personal", label: t("settings.section.personalInfo"), icon: "person" },
    ...(role === "worker" ? [{ id: "professional", label: t("settings.section.professional"), icon: "construction" }] : []),
    ...(role === "worker" ? [{ id: "payout", label: t("settings.section.payout"), icon: "account_balance" }] : []),
    { id: "security", label: t("settings.section.security"), icon: "security" },
    { id: "notifications", label: t("settings.section.preferences"), icon: "notifications" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Page Header ── */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full hover:bg-surface-container-high transition-all active:scale-90">
              <ArrowLeft className="h-4 w-4" />
           </button>
           <button 
             form="settings-form"
             disabled={isPending}
             className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${
               success ? "bg-green-500 text-white" : "bg-primary text-on-primary shadow-lg shadow-primary/20"
             }`}
           >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                t("settings.saveChanges")
              )}
           </button>
        </div>
        <h1 className="hidden sm:block text-2xl sm:text-3xl font-black text-on-surface tracking-tight uppercase">{t("settings.titleProfile")} <span className="text-primary italic">{t("settings.titleSettings")}</span></h1>
        {verificationReason && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-on-surface">
            {verificationReason}
          </div>
        )}
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
                 {s.id === "personal" ? <User className="h-4 w-4" /> : s.id === "professional" ? <Wrench className="h-4 w-4" /> : s.id === "payout" ? <Landmark className="h-4 w-4" /> : s.id === "security" ? <Shield className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
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
                  {/* Avatar Upload & Verification Request Card */}
                  <div className="p-6 sm:p-8 rounded-[3rem] border border-surface-container-highest bg-surface-container-low/40 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div 
                        className={`relative group shrink-0 ${role === "worker" || !initialData.is_verified ? "cursor-pointer" : "cursor-default"}`} 
                        onClick={() => !(role === "worker" && avatarRequestStatus === "pending") && (role === "worker" || !initialData.is_verified) && !uploading && fileInputRef.current?.click()}
                      >
                         <div className={`w-28 h-28 rounded-[2.5rem] border-4 shadow-xl flex items-center justify-center overflow-hidden transition-all ${
                           initialData.is_verified ? "bg-primary/10 border-primary" : "bg-surface-container-high border-surface"
                         }`}>
                            {formData.avatarUrl ? (
                              <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-4xl font-bold text-primary">{formData.fullName.charAt(0) || "U"}</span>
                            )}
                         </div>
                         {(role === "worker" || !initialData.is_verified) && avatarRequestStatus !== "pending" && !uploading && (
                           <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Camera className="h-6 w-6 text-white" />
                           </div>
                         )}
                         {uploading && (
                           <div className="absolute inset-0 bg-black/60 rounded-[2.5rem] flex items-center justify-center">
                              <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                           </div>
                         )}
                         {initialData.is_verified && (
                           <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-on-primary rounded-full border-4 border-surface flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="h-4 w-4 text-on-primary" />
                           </div>
                         )}
                         <input
                           type="file"
                           ref={fileInputRef}
                           className="hidden"
                           accept="image/png,image/jpeg,image/webp"
                           disabled={role === "worker" && avatarRequestStatus === "pending"}
                           onClick={(event) => event.stopPropagation()}
                           onChange={handleAvatarUpload}
                         />
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left space-y-3">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">
                            {role === "worker" ? "Verified Worker Photo" : "Profile Photo"}
                          </h3>
                          {avatarRequestStatus === "pending" && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              Review Pending
                            </span>
                          )}
                          {avatarRequestStatus === "approved" && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Approved & Verified
                            </span>
                          )}
                          {avatarRequestStatus === "rejected" && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
                              Photo Rejected
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-on-surface-variant leading-relaxed opacity-75">
                          {role === "worker"
                            ? "Your photo is validated against your Fayda National ID for trust and fraud prevention. To replace your profile photo, upload a new image for administrator review."
                            : "Upload a clear headshot photo to help skilled artisans identify you during on-site milestone visits."}
                        </p>

                        {avatarRequestStatus === "rejected" && (
                          <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                            Rejection Reason: {avatarRequestReason || "Photo did not match the Fayda ID document. Please upload a clear, front-facing portrait."}
                          </div>
                        )}

                        <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                          <button
                            type="button"
                            disabled={uploading || (role === "worker" && avatarRequestStatus === "pending")}
                            onClick={() => fileInputRef.current?.click()}
                            className="h-10 px-5 rounded-2xl bg-surface-container-highest hover:bg-surface-container text-on-surface text-xs font-black uppercase tracking-wider border border-surface-container-highest transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                          >
                            <Camera className="h-3.5 w-3.5 text-primary" />
                            <span>{avatarRequestStatus === "pending" ? "Request Pending" : "Request New Photo"}</span>
                          </button>
                          <span className="text-[10px] text-on-surface-variant opacity-60">
                            JPG, PNG or WebP &bull; Max 250 KB
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">{t("settings.fullName")}</label>
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
                         <CheckCircle2 className="absolute right-4 top-[42px] text-primary h-4 w-4" />
                       )}
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">{t("settings.phoneNumber")}</label>
                       <input 
                         type="text" 
                         value={formData.phone}
                         onChange={e => setFormData({...formData, phone: e.target.value})}
                         className="w-full h-14 bg-surface-container-lowest border border-surface-container-highest rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                       />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">{t("settings.faydaFin")}</label>
                       <div className="relative">
                         <input
                           type={initialData.is_verified || showFin ? "text" : "password"}
                           inputMode="numeric"
                           autoComplete="off"
                           maxLength={12}
                           value={initialData.is_verified ? initialData.masked_fin || "" : formData.faydaFinNumber}
                           onChange={e => {
                             setVerificationError("");
                             setFormData({...formData, faydaFinNumber: e.target.value.replace(/\D/g, "").slice(0, 12)});
                           }}
                           disabled={initialData.is_verified || (role === "client" && !clientCanSubmitVerification)}
                           placeholder={initialData.is_verified ? initialData.masked_fin || t("settings.notRecorded") : t("verification.resubmit.fin_placeholder")}
                           className={`w-full h-14 border rounded-2xl pl-6 pr-14 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm ${
                             initialData.is_verified
                              ? "bg-surface-container-low border-primary/20 text-on-surface opacity-80 cursor-not-allowed"
                              : "bg-surface-container-lowest border-surface-container-highest"
                           }`}
                         />
                         {!initialData.is_verified && clientCanSubmitVerification && (
                           <button
                             type="button"
                             onClick={() => setShowFin((value) => !value)}
                             aria-label={showFin ? t("settings.hideFin") : t("settings.showFin")}
                             title={showFin ? t("settings.hideFin") : t("settings.showFin")}
                             className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                           >
                             {showFin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                         )}
                       </div>
                    </div>
                    {role === "client" && (
                      <div className="space-y-3 md:col-span-2 rounded-2xl border border-surface-container-highest bg-surface-container-low/60 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-on-surface">{t("settings.faydaVerification")}</p>
                            <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                              {t("settings.faydaVerificationDesc")}
                            </p>
                            {verificationStatus === "pending" && (
                              <p className="mt-2 text-xs font-bold text-amber-500">{t("settings.pendingVerification")}</p>
                            )}
                            {verificationStatus === "rejected" && (
                              <p className="mt-2 text-xs font-bold text-error">
                                {t("settings.rejected")}{initialData.verification_reason ? `: ${initialData.verification_reason}` : ""}
                              </p>
                            )}
                            {verificationStatus === "revoked" && (
                              <p className="mt-2 text-xs font-bold text-error">
                                {t("settings.revoked")}{initialData.verification_reason ? `: ${initialData.verification_reason}` : ""}
                              </p>
                            )}
                            {verificationStatus === "approved" && (
                              <p className="mt-2 text-xs font-bold text-primary">{t("settings.approvedMaskedFin")} {initialData.masked_fin || t("settings.recorded")}</p>
                            )}
                          </div>
                          <span className="rounded-full border border-surface-container-highest px-3 py-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                            {verificationStatus === "incomplete" || verificationStatus === "not_started"
                              ? t("settings.notStarted")
                              : t(`verification.status.${verificationStatus}` as any)}
                          </span>
                        </div>

                        {clientCanSubmitVerification && (
                          <div className="space-y-3">
                            <label className="flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-surface-container-highest bg-surface-container-lowest px-4 text-xs font-bold text-on-surface-variant hover:border-primary/50">
                              <input
                                type="file"
                                className="hidden"
                                accept="image/png,image/jpeg,image/webp,application/pdf"
                                onChange={(event) => handleFaydaDocumentUpload(event.target.files?.[0] || null)}
                              />
                              {formData.faydaDocName || t("settings.uploadFaydaDoc")}
                            </label>
                            <button
                              type="submit"
                              name="intent"
                              value="client-verification"
                              disabled={isPending}
                              className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isPending ? t("verification.resubmit.submitting") : t("settings.submitVerification")}
                            </button>
                            {verificationError && (
                              <p className="rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-xs font-bold text-on-error-container">
                                {verificationError}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">{t("settings.emailAddress")}</label>
                       <input 
                         type="email" 
                         value={formData.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                         className="w-full h-14 bg-surface-container-lowest border border-surface-container-highest rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">{t("settings.gender")}</label>
                       <select 
                         value={formData.gender}
                         onChange={e => setFormData({...formData, gender: e.target.value})}
                         className="w-full h-14 bg-surface-container-lowest border border-surface-container-highest rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm appearance-none"
                       >
                          <option value="">{t("settings.selectGender")}</option>
                          <option value="male">{t("settings.genderMale")}</option>
                          <option value="female">{t("settings.genderFemale")}</option>
                          <option value="other">{t("settings.genderOther")}</option>
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
                     <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">{t("settings.professionalBio")}</label>
                     <textarea 
                       rows={4}
                       value={formData.bio}
                       onChange={e => setFormData({...formData, bio: e.target.value})}
                       className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[2rem] p-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm leading-relaxed"
                       placeholder={t("settings.professionalBioPlaceholder")}
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">{t("settings.serviceSkills")}</label>
                     <div className="flex flex-wrap gap-2">
                        {formData.skills.map((s: string, i: number) => (
                          <span key={i} className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                             {s}
                             <button type="button" onClick={() => setFormData({...formData, skills: formData.skills.filter((_: string, idx: number) => idx !== i)})}>
                                <X className="h-3.5 w-3.5" />
                             </button>
                          </span>
                        ))}
                        <button type="button" className="px-5 py-2.5 bg-surface-container-high border border-surface-container-highest rounded-2xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2 hover:bg-primary/5 hover:text-primary transition-all">
                           <Plus className="h-3.5 w-3.5" />
                           {t("settings.addSkill")}
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">{t("settings.hourlyRate")}</label>
                       <input 
                         type="number" 
                         value={formData.hourlyRate}
                         onChange={e => setFormData({...formData, hourlyRate: parseInt(e.target.value) || 0})}
                         className="w-full h-14 bg-surface-container-lowest border border-surface-container-highest rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">{t("settings.districtArea")}</label>
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
                        {hasChapaSubaccount ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Landmark className="h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">
                          {t("settings.chapaPayoutAccount")}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                          {hasChapaSubaccount
                            ? t("settings.chapaConnectedDesc")
                            : t("settings.chapaConnectDesc")}
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
                            {t("settings.accountName")}
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
                            {t("settings.accountNumber")}
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
                          {t("settings.bank")}
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
                          <option value="">{banksLoading ? t("settings.loadingBanks") : t("settings.selectBank")}</option>
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
                        {payoutStatus === "loading" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        {payoutStatus === "loading" ? t("settings.connecting") : t("settings.connectChapaPayout")}
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
                           <Lock className="h-5 w-5" />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">{t("settings.accountSecurity")}</h3>
                           <p className="text-xs text-on-surface-variant opacity-60">{t("settings.manageCredentials")}</p>
                        </div>
                     </div>
                     
                     <div className="flex flex-col gap-4">
                        {/* Change Contract PIN */}
                        <div className="rounded-2xl border border-surface-container-highest bg-surface-container-lowest overflow-hidden transition-all">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSecurityPanel(activeSecurityPanel === "pin" ? "none" : "pin");
                              setPinError(null);
                              setPinSuccess(null);
                            }}
                            className="w-full h-16 flex items-center justify-between px-6 hover:bg-surface-container/30 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <KeyRound className="h-4 w-4 text-amber-500" />
                              <div className="text-left">
                                <span className="text-xs font-bold text-on-surface uppercase tracking-widest block">{t("settings.changePin")}</span>
                                <span className="text-[10px] text-on-surface-variant opacity-60">Digital contract signing PIN</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-amber-500/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">4 digits</span>
                              {activeSecurityPanel === "pin" ? (
                                <ChevronDown className="h-4 w-4 text-primary transition-transform" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-transform" />
                              )}
                            </div>
                          </button>

                          {activeSecurityPanel === "pin" && (
                            <form onSubmit={handlePinSubmit} className="p-6 border-t border-surface-container-highest/60 bg-surface-container-low/20 space-y-4 animate-in fade-in duration-200">
                              <p className="text-xs text-on-surface-variant leading-relaxed">
                                Your 4-digit PIN secures your electronic contract signatures and agreements.
                              </p>

                              {pinError && (
                                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 shrink-0" />
                                  <span>{pinError}</span>
                                </div>
                              )}

                              {pinSuccess && (
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                                  <span>{pinSuccess}</span>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block mb-1.5 opacity-70">Current PIN (if set)</label>
                                  <input
                                    type="password"
                                    maxLength={4}
                                    placeholder="••••"
                                    value={currentPin}
                                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                    className="w-full h-11 px-4 text-center font-mono text-base tracking-widest rounded-xl border border-surface-container-highest bg-surface-container-lowest text-on-surface outline-none focus:border-primary transition"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block mb-1.5 opacity-70">New PIN (4 digits)</label>
                                  <input
                                    type="password"
                                    required
                                    maxLength={4}
                                    placeholder="••••"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                    className="w-full h-11 px-4 text-center font-mono text-base tracking-widest rounded-xl border border-surface-container-highest bg-surface-container-lowest text-on-surface outline-none focus:border-primary transition"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block mb-1.5 opacity-70">Confirm New PIN</label>
                                  <input
                                    type="password"
                                    required
                                    maxLength={4}
                                    placeholder="••••"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                    className="w-full h-11 px-4 text-center font-mono text-base tracking-widest rounded-xl border border-surface-container-highest bg-surface-container-lowest text-on-surface outline-none focus:border-primary transition"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-3 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveSecurityPanel("none")}
                                  className="h-10 px-4 rounded-xl border border-surface-container-highest text-xs font-bold text-on-surface hover:bg-surface-container transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={pinLoading || newPin.length !== 4 || confirmPin.length !== 4}
                                  className="h-10 px-5 rounded-xl bg-primary text-on-primary text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                  {pinLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                  <span>Update Contract PIN</span>
                                </button>
                              </div>
                            </form>
                          )}
                        </div>

                        {/* Update Account Password */}
                        <div className="rounded-2xl border border-surface-container-highest bg-surface-container-lowest overflow-hidden transition-all">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSecurityPanel(activeSecurityPanel === "password" ? "none" : "password");
                              setPasswordError(null);
                              setPasswordSuccess(null);
                            }}
                            className="w-full h-16 flex items-center justify-between px-6 hover:bg-surface-container/30 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <Lock className="h-4 w-4 text-primary" />
                              <div className="text-left">
                                <span className="text-xs font-bold text-on-surface uppercase tracking-widest block">{t("settings.updatePassword")}</span>
                                <span className="text-[10px] text-on-surface-variant opacity-60">Account login credentials</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-primary/80 bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">Better Auth</span>
                              {activeSecurityPanel === "password" ? (
                                <ChevronDown className="h-4 w-4 text-primary transition-transform" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-transform" />
                              )}
                            </div>
                          </button>

                          {activeSecurityPanel === "password" && (
                            <form onSubmit={handlePasswordSubmit} className="p-6 border-t border-surface-container-highest/60 bg-surface-container-low/20 space-y-4 animate-in fade-in duration-200">
                              <p className="text-xs text-on-surface-variant leading-relaxed">
                                Enter your current password and choose a secure new password (minimum 8 characters).
                              </p>

                              {passwordError && (
                                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 shrink-0" />
                                  <span>{passwordError}</span>
                                </div>
                              )}

                              {passwordSuccess && (
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                                  <span>{passwordSuccess}</span>
                                </div>
                              )}

                              <div className="space-y-3">
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block mb-1.5 opacity-70">Current Password</label>
                                  <input
                                    type="password"
                                    required
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full h-11 px-4 text-xs font-medium rounded-xl border border-surface-container-highest bg-surface-container-lowest text-on-surface outline-none focus:border-primary transition"
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block mb-1.5 opacity-70">New Password (min 8)</label>
                                    <input
                                      type="password"
                                      required
                                      minLength={8}
                                      placeholder="••••••••"
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      className="w-full h-11 px-4 text-xs font-medium rounded-xl border border-surface-container-highest bg-surface-container-lowest text-on-surface outline-none focus:border-primary transition"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block mb-1.5 opacity-70">Confirm New Password</label>
                                    <input
                                      type="password"
                                      required
                                      minLength={8}
                                      placeholder="••••••••"
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      className="w-full h-11 px-4 text-xs font-medium rounded-xl border border-surface-container-highest bg-surface-container-lowest text-on-surface outline-none focus:border-primary transition"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-3 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveSecurityPanel("none")}
                                  className="h-10 px-4 rounded-xl border border-surface-container-highest text-xs font-bold text-on-surface hover:bg-surface-container transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={passwordLoading || newPassword.length < 8 || confirmPassword.length < 8}
                                  className="h-10 px-5 rounded-xl bg-primary text-on-primary text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                  {passwordLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                  <span>Update Password</span>
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-error-container/10 border border-error/20 rounded-[3rem] flex items-center justify-between">
                     <div className="space-y-1">
                        <h3 className="text-sm font-black text-error uppercase tracking-widest">{t("settings.dangerZone")}</h3>
                        <p className="text-xs text-error opacity-60">{t("settings.deleteAccountDesc")}</p>
                     </div>
                     <button type="button" className="px-6 py-3 bg-error text-on-error rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-error/20 active:scale-95 transition-all">
                        {t("settings.deleteAccount")}
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
                     <h3 className="text-label-sm uppercase tracking-[0.2em] text-on-surface-variant ml-4 opacity-60">{t("footer.language")}</h3>
                     <div className="grid grid-cols-3 gap-4">
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
                        <button
                          type="button"
                          onClick={() => setLanguage('om')}
                          className={`h-20 rounded-[2rem] border transition-all flex flex-col items-center justify-center gap-1 ${
                            language === 'om' ? "bg-primary text-on-primary border-primary shadow-xl" : "bg-surface-container-low border-surface-container-highest text-on-surface-variant"
                          }`}
                        >
                           <span className="text-xl font-black">OM</span>
                           <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Afaan Oromo</span>
                        </button>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h3 className="text-label-sm uppercase tracking-[0.2em] text-on-surface-variant ml-4 opacity-60">{t("settings.pushNotifications")}</h3>
                     <div className="space-y-3">
                        {[
                          { label: t("settings.notifyJobRequests"), id: "notify_requests" },
                          { label: t("settings.notifyContractUpdates"), id: "notify_contracts" },
                          { label: t("settings.notifyMessages"), id: "notify_messages" },
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
