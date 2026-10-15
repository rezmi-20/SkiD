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
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 pb-32 pt-2 animate-in fade-in duration-300">
      
      {/* ── SCREEN TITLE ────────────────────────────────────────────── */}
      <div className="pt-2 pb-5 text-center md:text-left flex items-center justify-between border-b border-border/40 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight">
            Account Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
            Manage your credentials, electronic signature security, contracts, and payments
          </p>
        </div>

        {/* Desktop Quick Settings Button */}
        <Link
          href={settingsHref}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181d24] text-white hover:bg-[#252b35] transition-all text-xs font-bold shadow-sm"
        >
          <Settings className="h-4 w-4" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* ── RESPONSIVE MAIN GRID (1-col mobile, 12-col desktop) ──────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ── LEFT COLUMN (Identity & Quick Stats) ─────────────────── */}
        <div className="md:col-span-5 lg:col-span-4 space-y-5">
          
          {/* Identity Card */}
          <div className="rounded-[2rem] bg-card border border-border p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Avatar with mint/green badge ring */}
                <div className="relative shrink-0">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#bbf7d0] dark:bg-[#143d22] p-1 flex items-center justify-center">
                    <Avatar className="h-full w-full rounded-full">
                      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                      <AvatarFallback className="bg-[#bbf7d0] text-[#166534] font-black text-lg sm:text-xl">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Status icon badge */}
                  <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-[#8eed5d] border-2 border-background flex items-center justify-center text-[#14532d] shadow-sm">
                    {user.is_verified ? (
                      <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                    )}
                  </div>
                </div>

                {/* Name, Role & Email */}
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-extrabold text-foreground truncate leading-tight">
                    {user.name}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">
                    {user.email}
                  </p>
                  <div className="hidden md:flex items-center gap-1.5 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#a4fe47]/15 text-[#3a6613] dark:text-[#a4fe47] border-[#a4fe47]/30">
                      {isWorker ? "Verified Skilled Pro" : "Verified Client"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Mobile-only Settings Gear Icon */}
              <Link
                href={settingsHref}
                className="md:hidden h-12 w-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform shrink-0"
                title="Settings"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5 stroke-[1.8]" />
              </Link>
            </div>

            {/* Desktop-Only Creative Profile Telemetry (Kept clean on mobile) */}
            <div className="hidden md:block border-t border-border/60 pt-4 space-y-2.5 text-xs">
              {user.phone && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
                  <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><Phone className="h-3.5 w-3.5 text-primary" /> Phone:</span>
                  <span className="font-bold text-foreground">+251 {user.phone}</span>
                </div>
              )}
              {user.district && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
                  <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><MapPin className="h-3.5 w-3.5 text-emerald-500" /> District:</span>
                  <span className="font-bold text-foreground">{user.district}, Addis Ababa</span>
                </div>
              )}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Fayda FIN:</span>
                <span className="font-mono font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded text-[11px] text-primary">{user.maskedFin || "********9654"}</span>
              </div>
            </div>

            {/* Worker Skills Chips */}
            {skills.length > 0 && (
              <div className="border-t border-border/60 pt-3 mt-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
                  Specialized Trades
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-[#4c7a36]/10 text-[#4c7a36] dark:text-[#8eed5d] text-[11px] font-bold border border-[#4c7a36]/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verification Status Banner if pending */}
          {!user.is_verified && (
            <div className="rounded-[1.75rem] border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-foreground">Fayda Verification</p>
                  <p className="text-muted-foreground text-[11px]">Upload ID for fast approval</p>
                </div>
              </div>
              <Link
                href={settingsHref + "?verify=1"}
                className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl shrink-0"
              >
                Upload
              </Link>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (Work & Contracts + General Hub) ─────────── */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          
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
    </div>
  );
}
