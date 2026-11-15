"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldCheckFill,
  RiEyeLine,
  RiEyeOffLine,
  RiAlertLine,
  RiShieldUserLine,
  RiScales3Line,
  RiCustomerService2Line,
} from "@remixicon/react";
import { loginAdminEmployee } from "@/lib/actions/admin-account";
import DireSkillLogo from "@/components/shell/DireSkillLogo";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

/* ── Quick Autofill Profiles for Stress-Free Administrative Verification ── */
const ADMIN_TEST_PROFILES = [
  {
    roleKey: "super_admin",
    badgeLabel: "Super Admin",
    employeeId: "OWN-0001",
    email: "remedanseid00@gmail.com",
    title: "Sole System Super Admin",
    icon: RiShieldCheckFill,
  },
  {
    roleKey: "content_verification_admin",
    badgeLabel: "Verification",
    employeeId: "VER-0558",
    email: "remedanseid558@gmail.com",
    title: "KYC & Identity Clearance",
    icon: RiShieldUserLine,
  },
  {
    roleKey: "dispute_payment_admin",
    badgeLabel: "Disputes Desk",
    employeeId: "DSP-0002",
    email: "seidremedan2@gmail.com",
    title: "Arbitration & Payments",
    icon: RiScales3Line,
  },
  {
    roleKey: "user_support_admin",
    badgeLabel: "User Support",
    employeeId: "SUP-0004",
    email: "seidremedan624@gmail.com",
    title: "Inquiries & Client Care",
    icon: RiCustomerService2Line,
  },
];

export function AdminEmployeeLoginForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleQuickFill = (profile: (typeof ADMIN_TEST_PROFILES)[number]) => {
    setEmployeeId(profile.employeeId);
    setPassword("Admin@12345678");
    setError(null);
  };

  const submit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await loginAdminEmployee(formData);
      if (result.success) {
        router.replace(result.redirectTo || "/admin/dashboard");
        router.refresh();
      } else {
        setError(result.error || t("admin.login.invalid") || "Invalid Employee ID / Work Email or password.");
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f6f8] dark:bg-[#090d16] text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 font-['Inter',system-ui,sans-serif]">
      
      {/* ── Main Container: Floating Grand Enterprise Card (Enlarged max-w-[1240px]) ── */}
      <div className="w-full max-w-[1240px] min-h-[720px] lg:min-h-[780px] bg-white dark:bg-zinc-900 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-200/90 dark:border-zinc-800 shadow-2xl p-4 sm:p-6 lg:p-7 flex flex-col lg:flex-row gap-8 lg:gap-10 items-stretch overflow-hidden transition-all duration-300">
        
        {/* ── Left Side: Custom DireSkill Admin Hero with Background Image ── */}
        <div className="w-full lg:w-[50%] xl:w-[52%] relative rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden text-white shadow-inner min-h-[480px] lg:min-h-[720px]">
          
          {/* Custom DireSkill Site Administrator Photo as Background Image */}
          <Image
            src="/images/admin-login-hero.jpg"
            alt="DireSkill Site Administrator at Workplace"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover object-center filter brightness-[0.9] contrast-[1.08] transition-transform duration-700 hover:scale-105"
          />

          {/* Emerald Vignette and Dark Protective Gradients for Flawless Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061b0c] via-[#082210]/55 to-[#061b0c]/65 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#061b0c]/75 via-transparent to-[#061b0c]/35 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#86efac]/20 blur-3xl pointer-events-none" />

          {/* Top-Left Header: Brand Logo & Wordmark */}
          <div className="relative z-10 flex items-center">
            <DireSkillLogo variant="light" iconSize={36} showWordmark={true} />
          </div>

          {/* Bottom Headline: Bold Dual-Tone Typography matching the Reference Photo */}
          <div className="relative z-10 pt-12">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-white leading-[1.15]">
              Securing Dire Dawa&apos;s
            </h1>
            <p className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-[#bef264] leading-[1.15] mt-1">
              Digital Work Marketplace
            </p>
          </div>

        </div>

        {/* ── Right Side: Clean Authentication Form ───────────────────────── */}
        <div className="w-full lg:w-[50%] xl:w-[48%] flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
          
          {/* Title and Subtitle */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Login to your account
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-2.5 leading-relaxed">
              Manage operational workflows, dispute settlements, and staff identity clearances from anywhere.
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3"
              >
                <RiAlertLine className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span className="flex-1 font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Login Form */}
          <form action={submit} className="space-y-5">
            
            {/* Input 1: Email / Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Work Email or Employee ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="employeeId"
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. OWN-0001 or remedanseid00@gmail.com"
                  autoComplete="username"
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-800/60 px-4 py-3.5 text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Input 2: Password with Eye Toggle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter Password"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-800/60 px-4 py-3.5 pr-12 text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg transition"
                >
                  {showPassword ? (
                    <RiEyeOffLine className="w-5 h-5" />
                  ) : (
                    <RiEyeLine className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Forget Password Link */}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError("Administrative password resets must be requested directly from the Super Admin (OWN-0001).");
                  }}
                  className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition"
                >
                  Forget Password?
                </button>
              </div>
            </div>

            {/* Solid Dark Pill Submit Button (Matches photo: black pill with Login text) */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold py-4 text-base shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-3 cursor-pointer"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Divider: OR (Matches reference photo) */}
          <div className="relative my-7 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative bg-white dark:bg-zinc-900 px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              OR QUICK TEST LOGIN
            </div>
          </div>

          {/* Operational Role Quick Fill Chips */}
          <div className="grid grid-cols-2 gap-3">
            {ADMIN_TEST_PROFILES.map((profile) => {
              const Icon = profile.icon;
              const isCurrent = employeeId === profile.employeeId;
              return (
                <button
                  key={profile.employeeId}
                  type="button"
                  onClick={() => handleQuickFill(profile)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                    isCurrent
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/50"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-zinc-200/70 dark:bg-zinc-700/70 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold leading-tight truncate">
                      {profile.badgeLabel}
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
                      {profile.employeeId}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Footer Note */}
          <div className="text-center mt-7 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            <span>Don&apos;t have an administrative account? </span>
            <Link
              href="/support"
              className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Contact Super Admin
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
