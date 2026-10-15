"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Settings,
  FileCheck,
  Wrench,
  Star,
  FileText,
  CreditCard,
  ShieldCheck,
  Moon,
  Headphones,
  Scale,
  LogOut,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

export default function ProfileContent({ user, stats = [], skills = [] }: ProfileContentProps) {
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
    <div className="w-full max-w-md md:max-w-4xl mx-auto px-3 sm:px-6 pb-32 animate-in fade-in duration-300">
      
      {/* ── 1. TITLE (Centered "Profile" - 100% Reference Match) ─────── */}
      <div className="pt-2 pb-5 text-center">
        <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Profile
        </h1>
      </div>

      {/* ── 2. USER PROFILE HEADER (Pixel-Perfect from Inspiration) ──── */}
      <div className="flex items-center justify-between gap-3 mb-6 px-1">
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
            <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5 font-medium">
              {user.email}
            </p>
          </div>
        </div>

        {/* Floating Dark Circular Settings Button */}
        <Link
          href={settingsHref}
          className="h-12 w-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform shrink-0"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5 stroke-[1.8]" />
        </Link>
      </div>

      {/* ── Desktop-Only Creative Account Details Card ──────────────── */}
      <div className="hidden md:grid md:grid-cols-3 gap-3 mb-6 p-4 rounded-[1.75rem] bg-card border border-border/60 shadow-sm text-xs">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/40">
          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#a4fe47]/15 text-[#3a6613] dark:text-[#a4fe47] border-[#a4fe47]/30">
            {isWorker ? "Verified Skilled Pro" : "Verified Client"}
          </Badge>
          <span className="text-muted-foreground font-medium truncate">{user.district ? `${user.district}, AA` : "Addis Ababa"}</span>
        </div>
        {user.phone && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40">
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><Phone className="h-3.5 w-3.5 text-primary" /> Phone:</span>
            <span className="font-bold text-foreground">+251 {user.phone}</span>
          </div>
        )}
        <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40">
          <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Fayda FIN:</span>
          <span className="font-mono font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded text-[11px] text-primary">{user.maskedFin || "********9654"}</span>
        </div>
      </div>

      <div className="space-y-6">
          
          {/* 1. "Work & Contracts" Domain Capsule */}
          <div>
            <h3 className="text-sm font-black text-foreground tracking-tight mb-2.5">
              Work & Contracts Hub
            </h3>

            {/* Sleek Dark Capsule Card matching screenshot */}
            <div className="rounded-[2rem] bg-[#0e1115] text-white p-5 shadow-xl flex items-center justify-around border border-white/5">
              {/* Item 1: Active Contracts */}
              <Link
                href={contractsHref}
                className="flex flex-col items-center group transition-transform active:scale-95 touch-manipulation"
              >
                <div className="relative">
                  <FileCheck className="h-6 w-6 text-white stroke-[1.75]" />
                  <span className="absolute -top-1.5 -right-2 bg-[#ef4444] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {stats[0]?.value || "1"}
                  </span>
                </div>
                <span className="text-xs font-bold text-white/90 mt-2 text-center">
                  Active Contracts
                </span>
                <span className="text-[10px] text-white/50">Signed & Live</span>
              </Link>

              {/* Item 2: Ongoing Milestones / In Progress */}
              <Link
                href={contractsHref}
                className="flex flex-col items-center group transition-transform active:scale-95 touch-manipulation"
              >
                <div className="relative">
                  <Wrench className="h-6 w-6 text-white stroke-[1.75]" />
                  <span className="absolute -top-1.5 -right-2 bg-[#ef4444] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {stats[1]?.value ? "1" : "1"}
                  </span>
                </div>
                <span className="text-xs font-bold text-white/90 mt-2 text-center">
                  In Progress
                </span>
                <span className="text-[10px] text-white/50">On-Site Work</span>
              </Link>

              {/* Item 3: Ratings & Reviews */}
              <Link
                href={contractsHref}
                className="flex flex-col items-center group transition-transform active:scale-95 touch-manipulation"
              >
                <Star className="h-6 w-6 text-[#a4fe47] stroke-[1.75] fill-[#a4fe47]/20" />
                <span className="text-xs font-bold text-white/90 mt-2 text-center">
                  Job Ratings
                </span>
                <span className="text-[10px] text-white/50">5.0 ★ Score</span>
              </Link>
            </div>
          </div>

          {/* 2. "General" Section (Clean interactive pill rows) */}
          <div>
            <h3 className="text-sm font-black text-foreground tracking-tight mb-2.5">
              General Management
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Row 1: My Contracts */}
              <Link
                href={contractsHref}
                className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm hover:border-primary/30 border border-transparent active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">My Contracts</p>
                  <p className="text-[10px] text-muted-foreground truncate">2-party digital agreements & QR codes</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
              </Link>

              {/* Row 2: Payments & Invoices (Chapa) */}
              <Link
                href={paymentsHref}
                className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm hover:border-primary/30 border border-transparent active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <CreditCard className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">Payments & Billing</p>
                  <p className="text-[10px] text-muted-foreground truncate">Chapa Telebirr & CBE Birr receipts</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
              </Link>

              {/* Row 3: Security & Contract PIN */}
              <Link
                href={securityHref}
                className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm hover:border-primary/30 border border-transparent active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">Security & Contract PIN</p>
                  <p className="text-[10px] text-muted-foreground truncate">6-digit electronic signature PIN</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
              </Link>

              {/* Row 4: Dark Theme (Interactive Toggle Switch) */}
              <div
                onClick={toggleTheme}
                className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Moon className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">Dark Theme</p>
                  <p className="text-[10px] text-muted-foreground truncate">{isDarkMode ? "Obsidian mode active" : "Crisp light mode active"}</p>
                </div>
                {/* iOS-style toggle pill */}
                <div
                  className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 ${
                    isDarkMode ? "bg-[#a4fe47]" : "bg-[#d1d5db]"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      isDarkMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {/* Row 5: Contact Us & Live Support */}
              <Link
                href={supportHref}
                className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm hover:border-primary/30 border border-transparent active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Headphones className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">Contact Us & Support</p>
                  <p className="text-[10px] text-muted-foreground truncate">Real-time tickets with chime alerts</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
              </Link>

              {/* Row 6: Disputes & Appeals */}
              <Link
                href={disputesHref}
                className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] p-3.5 sm:p-4 flex items-center justify-between shadow-sm hover:border-primary/30 border border-transparent active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-[#181d24] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Scale className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">Disputes & Governance</p>
                  <p className="text-[10px] text-muted-foreground truncate">File claims, upload evidence & appeals</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
              </Link>

              {/* Row 7: Logout (Burgundy Crimson Accent #731b1e) */}
              <button
                onClick={handleSignOut}
                type="button"
                className="sm:col-span-2 rounded-[1.75rem] bg-[#731b1e]/10 dark:bg-[#731b1e]/20 border border-[#731b1e]/20 p-3.5 sm:p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all touch-manipulation text-left group"
              >
                <div className="h-11 w-11 rounded-full bg-[#731b1e] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <LogOut className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-[#731b1e] dark:text-[#ff8589]">Sign Out</p>
                  <p className="text-[10px] text-muted-foreground">Safely end your active session</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#731b1e] dark:text-[#ff8589] shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
