"use client";

import React, { useState } from "react";
import FirstTimeOnboardingModal from "@/components/onboarding/FirstTimeOnboardingModal";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
  Home,
  Search,
  Briefcase,
  Users,
  MessageSquare,
  User,
  Bell,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  CreditCard,
  Sliders,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

export default function OnboardingDemoPage() {
  const { theme, resolvedTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [isOpen, setIsOpen] = useState(true);
  const [role, setRole] = useState<"client" | "worker">("client");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleReset = () => {
    try {
      localStorage.removeItem("skid_onboarding_completed");
    } catch {}
    setLastSaved(null);
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-on-background transition-colors duration-300 pb-32">
      {/* Top Demo Control Banner */}
      <div className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/60 px-4 sm:px-6 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#84cc16]/20 text-[#84cc16] flex items-center justify-center font-extrabold text-xs">
              TOUR
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span>Interactive Spotlight Tour Playground</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Arrow Spotlight Mode
                </span>
              </h1>
              <p className="text-[11px] text-on-surface-variant">
                Experience the preferences setup followed by the interactive card pointing to actual navigation icons!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Top Bar Simulated Notification Bell for Step 4 of Tour */}
            <div
              id="tour-notifications"
              className="relative p-2 rounded-full bg-surface-container border border-outline-variant/60 hover:bg-surface-container-high cursor-pointer transition-colors"
              title="Simulated Notification Bell for Tour"
            >
              <Bell className="w-4 h-4 text-on-surface" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </div>

            {/* Trilingual Switcher */}
            <div className="flex items-center bg-surface-container border border-outline-variant/60 rounded-xl p-0.5">
              {[
                { id: "en", label: "EN" },
                { id: "am", label: "አማ" },
                { id: "om", label: "ORO" },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLanguage(l.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === l.id
                      ? "bg-[#84cc16] text-[#0d1406] shadow-sm font-black"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Role Switcher */}
            <div className="p-1 rounded-xl bg-surface-container border border-outline-variant/60 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === "client"
                    ? "bg-[#84cc16] text-[#0d1406] shadow-sm font-black"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Client View</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("worker")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === "worker"
                    ? "bg-[#84cc16] text-[#0d1406] shadow-sm font-black"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Worker View</span>
              </button>
            </div>

            {/* Launch Modal */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Tour</span>
            </button>

            {/* Reset State */}
            <button
              type="button"
              onClick={handleReset}
              title="Clears localStorage flag and re-opens onboarding"
              className="px-3 py-1.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface hover:bg-surface-container text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl text-xs text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Exit to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Body Layout with Desktop Sidebar + Main Content */}
      <div className="max-w-7xl mx-auto flex">
        {/* Simulated Desktop Sidebar for Testing Desktop Mode */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 p-4 border-r border-outline-variant/60 min-h-[calc(100vh-65px)] space-y-3 bg-surface/50">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
            Simulated Desktop Sidebar
          </div>

          <div
            id="tour-sidebar-dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#84cc16]/15 text-[#84cc16] font-bold text-xs cursor-pointer border border-[#84cc16]/30 shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </div>

          <div
            id={role === "worker" ? "tour-sidebar-mygigs" : "tour-sidebar-discover"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-semibold text-xs cursor-pointer transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>{role === "worker" ? "Gigs Hub" : "Marketplace"}</span>
          </div>

          <div
            id="tour-sidebar-contracts"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-semibold text-xs cursor-pointer transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            <span>Digital Contracts</span>
          </div>

          <div
            id={role === "worker" ? "tour-sidebar-earnings" : "tour-sidebar-payments"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-semibold text-xs cursor-pointer transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>{role === "worker" ? "My Earnings" : "Escrow & Payments"}</span>
          </div>

          <div
            id="tour-sidebar-chat"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-semibold text-xs cursor-pointer transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages & Chat</span>
          </div>

          <div
            id="tour-sidebar-feed"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-semibold text-xs cursor-pointer transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Community Feed</span>
          </div>

          <div
            id="tour-sidebar-profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-semibold text-xs cursor-pointer transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Profile & Settings</span>
          </div>
        </aside>

        {/* Background Interactive Mock Dashboard Content */}
        <main className="flex-1 px-4 sm:px-8 pt-8 space-y-6 min-w-0">
          {/* Status Callout with Dawit Avatar */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {/* Real Worker Guide Avatar Thumbnail */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#84cc16] via-emerald-400 to-[#84cc16] shadow-sm ring-2 ring-[#84cc16]/30">
                  <img
                    src="/images/worker_guide_avatar.jpg"
                    alt="Dawit"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-surface flex items-center justify-center text-[7px] text-black font-black">
                  ✓
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-on-surface flex items-center gap-2">
                  <span>Dawit (DireSkill Guide)</span>
                  <span className="capitalize px-2 py-0.5 rounded-md bg-surface text-on-surface border border-outline-variant/60 font-mono text-[11px]">
                    Mode: {resolvedTheme || theme}
                  </span>
                  <span className="uppercase px-2 py-0.5 rounded-md bg-[#84cc16]/20 text-[#84cc16] border border-[#84cc16]/30 font-mono text-[11px] font-black">
                    Language: {language}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  {language === "am"
                    ? "ጉብኝቱ አሁን ሙሉ ለሙሉ በአማርኛ፣ በኦሮምኛ ወይም በእንግሊዝኛ ይሰራል።"
                    : language === "om"
                    ? "Daawwannaan amma guutummaatti Afaan Oromoo, Amaariffaa fi Ingiliffaan ni hojjeta."
                    : "The tour updates trilingually in real time and features Dawit's verified artisan badge!"}
                </p>
              </div>
            </div>

            {lastSaved && (
              <div className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lastSaved}</span>
              </div>
            )}
          </div>

          {/* Quick Actions Carousel (Target for mobile Step 1) */}
          <div id="tour-dashboard-actions-mobile" className="p-4 rounded-2xl bg-surface border border-outline-variant/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">Quick Actions & Shortcuts</span>
              <span className="text-[10px] font-mono text-on-surface-variant">Mobile Target #tour-dashboard-actions-mobile</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="px-3 py-1.5 rounded-xl bg-surface-container text-xs font-semibold whitespace-nowrap">🔍 Find Worker</span>
              <span className="px-3 py-1.5 rounded-xl bg-surface-container text-xs font-semibold whitespace-nowrap">📝 Sign Contract PIN</span>
              <span className="px-3 py-1.5 rounded-xl bg-surface-container text-xs font-semibold whitespace-nowrap">💳 Chapa Escrow Pay</span>
            </div>
          </div>

          {/* Mock Dashboard Hero */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-container to-surface-container-high border border-outline-variant/50 relative overflow-hidden shadow-sm">
            <div className="max-w-lg space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#84cc16]">
                {role === "client" ? "Homeowner & Business Hub" : "Verified Artisan Workspace"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
                {role === "client" ? "Find Verified Labor in Dire Dawa" : "Active Work & Milestone Requests"}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {role === "client"
                  ? "Browse skilled informal artisans with verified national IDs, transparent hourly rates, and enforceable digital contracts."
                  : "Manage your client requests, view job locations across Kebele 01-09, and track escrow payments via Chapa."}
              </p>
            </div>
          </div>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-surface border border-outline-variant/60 space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-on-surface">Fayda FIN Verified</h3>
              <p className="text-xs text-on-surface-variant">
                Every worker's identity is authenticated against national registers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-outline-variant/60 space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#84cc16]/10 text-[#84cc16] flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-on-surface">Digital Contracts</h3>
              <p className="text-xs text-on-surface-variant">
                Backed by Ethiopian Labour Proclamation 1156/2019.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-outline-variant/60 space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-on-surface">Escrow Protected</h3>
              <p className="text-xs text-on-surface-variant">
                Funds are safely held until work is inspected and accepted.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Simulated Bottom Navigation Bar with exact IDs for the Spotlight Tour to point at */}
      <nav className="fixed bottom-3 inset-x-2 sm:inset-x-4 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md h-[66px] rounded-full bg-[#181d24]/95 dark:bg-[#13171d]/95 backdrop-blur-xl border border-white/10 px-3 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          {/* Home */}
          <div
            id="tour-home"
            className="flex items-center gap-1.5 bg-[#a4fe47] text-[#0d1406] font-black text-xs px-3.5 py-2 rounded-full cursor-pointer"
          >
            <Home className="h-4 w-4 stroke-[2.5]" />
            <span>Home</span>
          </div>

          {/* Search / Gigs */}
          <div
            id={role === "worker" ? "tour-gigs" : "tour-search"}
            className="flex items-center justify-center h-11 w-11 rounded-full text-[#8a929e] hover:text-white cursor-pointer transition-all"
            title="Search or Gigs"
          >
            {role === "worker" ? <Briefcase className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </div>

          {/* Community */}
          <div
            id="tour-community"
            className="flex items-center justify-center h-11 w-11 rounded-full text-[#8a929e] hover:text-white cursor-pointer transition-all"
            title="Community"
          >
            <Users className="h-5 w-5" />
          </div>

          {/* Chat */}
          <div
            id="tour-chat"
            className="relative flex items-center justify-center h-11 w-11 rounded-full text-[#8a929e] hover:text-white cursor-pointer transition-all"
            title="Chat & Messaging"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>

          {/* Profile */}
          <div
            id="tour-profile"
            className="flex items-center justify-center h-11 w-11 rounded-full text-[#8a929e] hover:text-white cursor-pointer transition-all"
            title="Profile & Settings"
          >
            <User className="h-5 w-5" />
          </div>
        </div>
      </nav>

      {/* The Interactive Spotlight Tour Component */}
      <FirstTimeOnboardingModal
        userRole={role}
        userName={role === "client" ? "Abebe Kebede" : "Almaz Tadesse"}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onComplete={(prefs) => {
          setLastSaved(`Tour finished! Theme: ${prefs.theme}, Lang: ${prefs.language.toUpperCase()}`);
          setIsOpen(false);
        }}
        isDemo={true}
      />
    </div>
  );
}
