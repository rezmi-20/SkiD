"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Settings,
  Package,
  Truck,
  Star,
  Heart,
  ShieldCheck,
  Moon,
  MessageCircle,
  LogOut,
  ArrowRight,
  UserCheck,
  CreditCard,
  Scale,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileContentProps {
  user: {
    name: string;
    email: string;
    role: "client" | "worker";
    initials: string;
    avatarUrl?: string | null;
    is_verified?: boolean;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    district?: string;
    verificationStatus?: string;
    maskedFin?: string | null;
  };
  stats?: {
    label: string;
    value: string;
  }[];
  menuGroups?: any[];
  skills?: string[];
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = theme === "dark";
  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const isWorker = user.role === "worker";
  const contractsHref = isWorker ? "/worker/contracts" : "/client/contracts";
  const paymentsHref = isWorker ? "/worker/earnings" : "/client/payments";
  const settingsHref = isWorker ? "/worker/profile/settings" : "/client/profile/settings";
  const securityHref = isWorker ? "/worker/contract-setup" : "/client/contract-setup";
  const supportHref = isWorker ? "/worker/support" : "/client/support";
  const disputesHref = isWorker ? "/worker/disputes" : "/client/disputes";

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-2 sm:px-4 pb-32 animate-in fade-in duration-300">
      {/* ── 1. TITLE (Centered "Profile") ────────────────────────────── */}
      <div className="pt-2 pb-5 text-center">
        <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Profile
        </h1>
      </div>

      {/* ── 2. USER PROFILE HEADER ───────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar with mint/green badge container */}
          <div className="relative shrink-0">
            <div className="h-16 w-16 rounded-full bg-[#bbf7d0] dark:bg-[#143d22] p-0.5 flex items-center justify-center">
              <Avatar className="h-full w-full rounded-full">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback className="bg-[#bbf7d0] text-[#166534] font-black text-lg">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Status icon badge pinned to bottom right */}
            <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-[#86efac] border-2 border-background flex items-center justify-center text-[#14532d] shadow-sm">
              <UserCheck className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
          </div>

          {/* Name & Email */}
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-extrabold text-foreground truncate leading-tight">
              {user.name}
            </h2>
            <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">
              {user.email}
            </p>
          </div>
        </div>

        {/* Circular Settings Gear Button */}
        <Link
          href={settingsHref}
          className="h-12 w-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform shrink-0"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5 stroke-[1.8]" />
        </Link>
      </div>

      {/* ── 3. "MY ORDERS" / WORK & CONTRACTS BANNER ─────────────────── */}
      <div className="mb-6">
        <h3 className="text-sm font-black text-foreground tracking-tight mb-2.5">
          {isWorker ? "My Work & Orders" : "My Orders"}
        </h3>

        {/* Sleek Dark Capsule Container (Pixel-perfect from screenshot) */}
        <div className="rounded-[2rem] bg-[#0e1115] text-white p-5 shadow-xl flex items-center justify-around">
          {/* Item 1: Packed / Active Contracts */}
          <Link
            href={contractsHref}
            className="flex flex-col items-center group transition-transform active:scale-95 touch-manipulation"
          >
            <div className="relative">
              <Package className="h-6 w-6 text-white stroke-[1.75]" />
              <span className="absolute -top-1.5 -right-2 bg-[#ef4444] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                1
              </span>
            </div>
            <span className="text-xs font-semibold text-white/90 mt-2">
              {isWorker ? "Active Jobs" : "Packed"}
            </span>
          </Link>

          {/* Item 2: Delivery / In Progress */}
          <Link
            href={contractsHref}
            className="flex flex-col items-center group transition-transform active:scale-95 touch-manipulation"
          >
            <div className="relative">
              <Truck className="h-6 w-6 text-white stroke-[1.75]" />
              <span className="absolute -top-1.5 -right-2 bg-[#ef4444] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                1
              </span>
            </div>
            <span className="text-xs font-semibold text-white/90 mt-2">
              {isWorker ? "In Progress" : "Delivery"}
            </span>
          </Link>

          {/* Item 3: Give a Rating / Feedback */}
          <Link
            href={isWorker ? "/worker/jobs" : "/client/search"}
            className="flex flex-col items-center group transition-transform active:scale-95 touch-manipulation"
          >
            <Star className="h-6 w-6 text-white stroke-[1.75]" />
            <span className="text-xs font-semibold text-white/90 mt-2">
              Give a Rating
            </span>
          </Link>
        </div>
      </div>

      {/* ── 4. "GENERAL" SECTION ─────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-black text-foreground tracking-tight mb-2.5">
          General
        </h3>

        <div className="space-y-2.5">
          {/* Row 1: Wishlist / Saved / My Contracts */}
          <Link
            href={contractsHref}
            className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all touch-manipulation"
          >
            <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0">
              <Heart className="h-4 w-4 stroke-[2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground flex-1 ml-3.5">
              Wishlist & Saved Pros
            </span>
            <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
          </Link>

          {/* Row 2: Security & Contract PIN */}
          <Link
            href={securityHref}
            className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all touch-manipulation"
          >
            <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 stroke-[2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground flex-1 ml-3.5">
              Security
            </span>
            <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
          </Link>

          {/* Row 3: Dark Theme (Interactive Toggle Switch) */}
          <div
            onClick={toggleTheme}
            className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.99] transition-all touch-manipulation"
          >
            <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0">
              <Moon className="h-4 w-4 stroke-[2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground flex-1 ml-3.5">
              Dark Theme
            </span>
            {/* iOS-style toggle pill */}
            <div
              className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                isDarkMode ? "bg-[#b5f23d]" : "bg-[#d1d5db]"
              }`}
            >
              <div
                className={`h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  isDarkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </div>

          {/* Row 4: Payments & Invoices (Chapa) */}
          <Link
            href={paymentsHref}
            className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all touch-manipulation"
          >
            <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0">
              <CreditCard className="h-4 w-4 stroke-[2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground flex-1 ml-3.5">
              Payments & Billing (Chapa)
            </span>
            <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
          </Link>

          {/* Row 5: Contact Us & Live Support */}
          <Link
            href={supportHref}
            className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all touch-manipulation"
          >
            <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0">
              <MessageCircle className="h-4 w-4 stroke-[2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground flex-1 ml-3.5">
              Contact Us
            </span>
            <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
          </Link>

          {/* Row 6: Disputes & Governance */}
          <Link
            href={disputesHref}
            className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all touch-manipulation"
          >
            <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0">
              <Scale className="h-4 w-4 stroke-[2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground flex-1 ml-3.5">
              Disputes & Appeals
            </span>
            <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
          </Link>

          {/* Row 7: Logout (Red accent) */}
          <button
            onClick={handleSignOut}
            type="button"
            className="w-full rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all touch-manipulation text-left"
          >
            <div className="h-11 w-11 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
              <LogOut className="h-4 w-4 stroke-[2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 flex-1 ml-3.5">
              Logout
            </span>
            <ArrowRight className="h-4 w-4 text-red-500 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
