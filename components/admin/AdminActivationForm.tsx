"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldCheckFill,
  RiLockPasswordLine,
  RiUserLine,
  RiMailLine,
  RiBuildingLine,
  RiAlertLine,
  RiKeyLine,
  RiCheckboxCircleFill,
  RiArrowRightLine,
} from "@remixicon/react";
import { activateAdminAccount } from "@/lib/actions/admin-account";
import { useLanguage } from "@/context/LanguageContext";
import DireSkillLogo from "@/components/shell/DireSkillLogo";

export function AdminActivationForm({
  employeeId,
  fullName,
  email,
  role,
  department,
}: {
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await activateAdminAccount(formData);
      if (result.success) {
        router.replace(result.redirectTo || "/admin/dashboard");
        router.refresh();
      } else {
        setError(result.error || t("admin.activation.failed") || "Failed to activate administrator account.");
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white flex items-center justify-center p-6 relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#45BA50]/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        
        {/* Top Logo Monogram */}
        <div className="flex flex-col items-center">
          <DireSkillLogo variant="light" iconSize={44} showWordmark={true} />
          <span className="mt-2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#134e27]/25 text-[#a4fe47] border border-[#45BA50]/30">
            Account Activation
          </span>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#134e27]/30 text-[#a4fe47] flex items-center justify-center shrink-0 border border-[#45BA50]/30">
              <RiKeyLine className="w-6 h-6 text-[#a4fe47]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#a4fe47]">
                {t("admin.activation.eyebrow") || "First-Time Security Setup"}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t("admin.activation.title") || "Activate Staff Credentials"}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Set a permanent cryptographic security password to unlock your administrative access.
              </p>
            </div>
          </div>

          {/* Employee Dossier Badge */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 text-xs">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                {t("admin.common.employeeId") || "Employee ID"}
              </span>
              <span className="font-mono font-bold text-[#a4fe47] text-sm">{employeeId}</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                {t("admin.common.fullName") || "Full Name"}
              </span>
              <span className="font-bold text-white truncate block">{fullName}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-zinc-700/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  {t("admin.common.workEmail") || "Work Email"}
                </span>
                <span className="font-mono text-zinc-300 text-[11px]">{email}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#134e27]/30 text-[#a4fe47] border border-[#45BA50]/30 capitalize">
                {role.replaceAll("_", " ")}
              </span>
            </div>
          </div>

          {/* Password Policy Banner */}
          <div className="p-3.5 rounded-2xl bg-[#134e27]/20 border border-[#45BA50]/30 text-xs font-semibold text-[#a4fe47] flex items-center gap-2">
            <RiShieldCheckFill className="w-4 h-4 shrink-0 text-[#a4fe47]" />
            <span>{t("admin.activation.passwordPolicy") || "Password must be at least 10 characters with uppercase, lowercase, numbers, and symbols."}</span>
          </div>

          {/* Error Message with AnimatePresence */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm"
              >
                <RiAlertLine className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activation Form */}
          <form action={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                {t("admin.common.newPassword") || "Permanent Security Password"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <RiLockPasswordLine className="w-4 h-4" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  placeholder="Min. 10 characters..."
                  className="w-full rounded-2xl border border-zinc-700/80 bg-zinc-800/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#45BA50] focus:ring-2 focus:ring-[#45BA50]/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                {t("admin.common.confirmPassword") || "Confirm Security Password"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <RiLockPasswordLine className="w-4 h-4" />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  placeholder="Re-enter your password..."
                  className="w-full rounded-2xl border border-zinc-700/80 bg-zinc-800/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#45BA50] focus:ring-2 focus:ring-[#45BA50]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 inline-flex min-h-[46px] py-3 px-5 items-center justify-center gap-2 rounded-2xl bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs sm:text-sm font-black shadow-[0_2px_12px_rgba(69,186,80,0.35)] disabled:opacity-60 transition active:scale-[0.98] cursor-pointer"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>{t("admin.activation.submitting") || "Activating Account..."}</span>
                </>
              ) : (
                <>
                  <RiCheckboxCircleFill className="w-4 h-4 text-[#a4fe47]" />
                  <span>{t("admin.activation.submit") || "Activate Account & Enter Console"}</span>
                  <RiArrowRightLine className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
