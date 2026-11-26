"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  CreditCard,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

interface StageshowTrustDemoProps {
  onTrySearch?: () => void;
}

type DemoBeat = 0 | 1 | 2 | 3;

const BEATS = [
  {
    id: 0,
    step: "01",
    label: "Live GPS Match",
    caption: "Filter Fayda-verified pros by Kebele and distance in Dire Dawa.",
  },
  {
    id: 1,
    step: "02",
    label: "PIN Contract",
    caption: "Lock milestone scope and total ETB budget with a 4-digit PIN.",
  },
  {
    id: 2,
    step: "03",
    label: "Chapa Escrow",
    caption: "Client funds the milestone safely before site work begins.",
  },
  {
    id: 3,
    step: "04",
    label: "Verified Release",
    caption: "Approve completed craftwork to settle directly to the artisan.",
  },
] as const;

export const StageshowTrustDemo: React.FC<StageshowTrustDemoProps> = ({
  onTrySearch,
}) => {
  const [beat, setBeat] = useState<DemoBeat>(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = setInterval(() => {
      setBeat((prev) => ((prev + 1) % 4) as DemoBeat);
    }, 3400);
    return () => clearInterval(timer);
  }, [paused]);

  const pinDigits = beat >= 1 ? ["4", "9", "2", "0"] : ["•", "•", "•", "•"];

  return (
    <section
      aria-label="Interactive DireSkill Workflow Walkthrough"
      className="py-16 md:py-24 px-4 md:px-10 max-w-[1728px] mx-auto bg-[#FAF9F5]"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ── Left Column: Concise Editorial Framing + Beat Selector ── */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#007a55] block">
              Product Walkthrough
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1B1B1B] leading-[1.08]">
              From search to signed payout in four steps.
            </h2>
            <p className="text-sm sm:text-base text-[#666666] leading-relaxed max-w-md">
              Every hire follows one verifiable path: national Fayda clearance,
              live Kebele proximity, PIN-signed terms, and protected Chapa
              release.
            </p>
          </div>

          {/* Interactive 4-beat selector (hover or click pauses auto-advance) */}
          <div
            className="space-y-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {BEATS.map((item) => {
              const active = beat === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPaused(true);
                    setBeat(item.id);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    active
                      ? "bg-[#111216] text-white border-[#111216] shadow-md"
                      : "bg-white text-[#1B1B1B] border-[#E2E0D8] hover:border-[#1B1B1B]/30"
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${
                      active
                        ? "bg-[#00E575] text-black"
                        : "bg-[#F0EFEB] text-[#666666]"
                    }`}
                  >
                    {item.step}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold leading-snug">
                      {item.label}
                    </p>
                    <p
                      className={`text-xs mt-0.5 leading-relaxed ${
                        active ? "text-white/75" : "text-[#666666]"
                      }`}
                    >
                      {item.caption}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {onTrySearch && (
            <button
              type="button"
              onClick={onTrySearch}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black hover:bg-[#181818] text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              <span>Try Live Search</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* ── Right Column: Stageshow Stage (Cropped Corner-Bleed Frame + Compact Phone Redesign) ── */}
        <div
          className="lg:col-span-7"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Desktop / Tablet Stage: Corner-bleed product window + straddling satellite */}
          <div className="hidden sm:block relative w-full h-[460px] rounded-[28px] bg-[#0A0B0D] border border-[#E2E0D8]/20 overflow-hidden shadow-2xl">
            {/* Subtle surface grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none" />

            {/* Cropped Product Window (inset top + left, bleeds off right & bottom) */}
            <div className="absolute left-12 top-8 right-[-48px] bottom-[-36px] rounded-tl-[20px] bg-[#14161B] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden">
              {/* Window Chrome */}
              <div className="h-11 px-4 border-b border-white/10 flex items-center justify-between bg-[#0E1014] shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/70">
                  direskill.app/client/search
                </div>
                <div className="w-12" />
              </div>

              {/* Window Body */}
              <div className="p-6 space-y-5 flex-1">
                {/* Search Strip */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-10 px-3.5 rounded-full bg-[#0A0B0D] border border-white/10 flex items-center gap-2 text-xs text-white">
                    <Search size={14} className="text-[#00E575] shrink-0" />
                    <span className="font-medium">Electrician · Kezira</span>
                  </div>
                  <div className="h-10 px-3.5 rounded-full bg-[#00E575]/15 border border-[#00E575]/35 flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#00E575] shrink-0">
                    <MapPin size={12} />
                    <span>0.8 km</span>
                  </div>
                </div>

                {/* Focused Artisan Row + Quiet Filler Rows */}
                <div className="space-y-2.5">
                  {/* Focal Row */}
                  <motion.div
                    animate={{
                      borderColor:
                        beat === 0
                          ? "rgba(0, 229, 117, 0.55)"
                          : "rgba(255, 255, 255, 0.14)",
                    }}
                    className="p-4 rounded-2xl bg-[#1B1E25] border flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#007A55] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        YK
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-white truncate">
                            Yusuf Kedir
                          </p>
                          <ShieldCheck
                            size={14}
                            className="text-[#00E575] shrink-0"
                          />
                        </div>
                        <p className="text-xs text-white/60">
                          Electrical Wiring · Kezira, Dire Dawa
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pr-12">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Star size={12} className="fill-amber-400" />
                        4.9
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-[#00E575] text-black text-[11px] font-bold">
                        {beat === 0 ? "Book Artisan" : "Contract Active"}
                      </span>
                    </div>
                  </motion.div>

                  {/* Quiet contextual filler rows (restraint rule) */}
                  {[62, 48].map((w, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <div className="space-y-1.5">
                          <div
                            className="h-2.5 rounded-full bg-white/15"
                            style={{ width: `${w * 2}px` }}
                          />
                          <div
                            className="h-2 rounded-full bg-white/10"
                            style={{ width: `${w * 1.4}px` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 h-6 rounded-full bg-white/5 mr-12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Straddling Satellite Contract & Escrow Card */}
            <motion.div
              layout
              className="absolute left-6 bottom-6 w-[280px] rounded-2xl bg-[#FAF9F5] text-[#1B1B1B] border border-[#E2E0D8] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.55)] z-20 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#666666]">
                  Contract #241
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={beat}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      beat === 3
                        ? "bg-emerald-100 text-[#007A55]"
                        : beat === 2
                          ? "bg-blue-100 text-blue-700"
                          : "bg-zinc-200 text-[#1B1B1B]"
                    }`}
                  >
                    {beat === 3 ? (
                      <>
                        <Check size={11} />
                        <span>Paid Out</span>
                      </>
                    ) : beat === 2 ? (
                      <>
                        <CreditCard size={11} />
                        <span>Escrow Held</span>
                      </>
                    ) : (
                      <>
                        <Lock size={11} />
                        <span>PIN Ready</span>
                      </>
                    )}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-[#666666]">
                  Milestone Total
                </span>
                <span className="text-lg font-bold tracking-tight tabular-nums text-[#1B1B1B]">
                  ETB 4,500
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E2E0D8]">
                <span className="text-[11px] font-medium text-[#666666]">
                  Approval PIN
                </span>
                <div className="flex items-center gap-1 font-mono text-xs font-bold">
                  {pinDigits.map((d, i) => (
                    <span
                      key={i}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                        beat >= 1
                          ? "bg-[#111216] text-[#00E575] border-[#111216]"
                          : "bg-white text-[#8C8880] border-[#D9D7D0]"
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile Compact Redesign (tailored 358px column card, never a shrunk desktop screenshot) */}
          <div className="sm:hidden w-full rounded-3xl bg-[#0A0B0D] text-white p-5 space-y-4 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#007A55] text-white font-bold text-xs flex items-center justify-center">
                  YK
                </div>
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-1">
                    <span>Yusuf Kedir</span>
                    <ShieldCheck size={14} className="text-[#00E575]" />
                  </p>
                  <p className="text-xs text-white/60">Electrician · Kezira (0.8 km)</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded-full bg-[#00E575]/15 text-[#00E575]">
                {BEATS[beat].step}
              </span>
            </div>

            <div className="rounded-2xl bg-[#FAF9F5] text-[#1B1B1B] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#666666]">
                  {BEATS[beat].label}
                </span>
                <span className="text-sm font-bold tabular-nums">ETB 4,500</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E2E0D8]">
                <span className="text-xs text-[#666666]">4-Digit PIN</span>
                <div className="flex items-center gap-1 font-mono text-xs font-bold">
                  {pinDigits.map((d, i) => (
                    <span
                      key={i}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                        beat >= 1
                          ? "bg-[#111216] text-[#00E575] border-[#111216]"
                          : "bg-white text-[#8C8880] border-[#D9D7D0]"
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
