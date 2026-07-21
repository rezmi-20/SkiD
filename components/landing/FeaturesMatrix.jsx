"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-400 flex-shrink-0">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function FeaturesMatrix({ t }) {
  const [activeTab, setActiveTab] = useState("homeowners");

  const tabs = [
    { id: "homeowners", label: t("features.tab.homeowners") },
    { id: "workers",    label: t("features.tab.workers") },
    { id: "shared",    label: t("features.tab.shared") },
  ];

  const features = {
    homeowners: [
      t("features.homeowners.1"),
      t("features.homeowners.2"),
      t("features.homeowners.3"),
      t("features.homeowners.4"),
      t("features.homeowners.5"),
      t("features.homeowners.6"),
      t("features.homeowners.7"),
      t("features.homeowners.8"),
    ],
    workers: [
      t("features.workers.1"),
      t("features.workers.2"),
      t("features.workers.3"),
      t("features.workers.4"),
      t("features.workers.5"),
      t("features.workers.6"),
      t("features.workers.7"),
      t("features.workers.8"),
    ],
    shared: [
      t("features.shared.1"),
      t("features.shared.2"),
      t("features.shared.3"),
      t("features.shared.4"),
      t("features.shared.5"),
      t("features.shared.6"),
    ],
  };

  // Visual right-side panel content per tab
  const panelContent = {
    homeowners: {
      badge: "For Homeowners",
      headline: "Hire with confidence.",
      cta: { label: t("hero.cta.find"), href: "/client/search" },
      accent: "text-green-400",
      accentBg: "bg-green-400",
      preview: (
        <div className="space-y-3">
          {/* Simulated worker card */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-400/20 flex items-center justify-center font-black text-green-400 text-sm flex-shrink-0">S</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-white text-xs font-black uppercase tracking-tight truncate">Samuel T.</p>
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-400/15 border border-green-400/20">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-400"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-[7px] font-black text-green-400 uppercase tracking-widest">Fayda</span>
                </span>
              </div>
              <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Electrician • Kezira</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white text-xs font-black">4.9 ★</p>
              <p className="text-zinc-500 text-[9px]">42 jobs</p>
            </div>
          </div>
          {/* Simulated digital contract badge */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400 flex-shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <polyline points="9 11 11 13 15 9"/>
            </svg>
            <p className="text-zinc-400 text-[10px] font-semibold">Digital contract signed by both parties</p>
            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
          </div>
        </div>
      ),
    },
    workers: {
      badge: "For Workers",
      headline: "Build your reputation.",
      cta: { label: t("hero.cta.join"), href: "/register/worker" },
      accent: "text-blue-400",
      accentBg: "bg-blue-400",
      preview: (
        <div className="space-y-3">
          {/* Simulated profile stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Jobs Done", value: "38" },
              { label: "Rating", value: "4.8★" },
              { label: "Response", value: "< 1h" },
            ].map((stat, i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
                <p className="text-white text-sm font-black">{stat.value}</p>
                <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
          {/* Fayda verified badge */}
          <div className="p-3 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center font-black text-black text-[8px] flex-shrink-0">✓</div>
            <div>
              <p className="text-green-400 text-xs font-black uppercase tracking-tight">Fayda Verified</p>
              <p className="text-zinc-500 text-[9px]">Identity confirmed by national ID</p>
            </div>
          </div>
        </div>
      ),
    },
    shared: {
      badge: "For Everyone",
      headline: "One platform. Two sides.",
      cta: { label: "Get Started", href: "/register/worker" },
      accent: "text-zinc-300",
      accentBg: "bg-white",
      preview: (
        <div className="space-y-3">
          {/* Simulated message */}
          <div className="space-y-2">
            <div className="ml-auto max-w-[75%] p-3 rounded-2xl rounded-tr-sm bg-green-400/20 border border-green-400/20">
              <p className="text-green-400 text-[10px] font-semibold">I can start the wiring tomorrow morning.</p>
            </div>
            <div className="max-w-[75%] p-3 rounded-2xl rounded-tl-sm bg-zinc-900/80 border border-white/5">
              <p className="text-zinc-300 text-[10px] font-semibold">That works for me. Sending contract now.</p>
            </div>
          </div>
          {/* Notification */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-400"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <p className="text-zinc-400 text-[10px] font-semibold">Contract signed — job is now active</p>
          </div>
        </div>
      ),
    },
  };

  return (
    <section id="features" className="py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9] max-w-3xl mx-auto">
            {t("features.title").split(" ").slice(0, 3).join(" ")}{" "}
            <span className="text-green-400 italic">{t("features.title").split(" ").slice(3).join(" ")}</span>
          </h2>
          <p className="text-zinc-500 text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
            {t("features.subtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-1 p-1 bg-zinc-900/80 border border-white/5 rounded-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-green-400 text-black shadow-[0_4px_16px_rgba(74,222,128,0.25)]"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
          >
            {/* Feature list */}
            <div className="p-6 xl:p-8 rounded-[2rem] bg-[#0c0c0e] border border-white/5">
              <ul className="space-y-3">
                {features[activeTab].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="text-zinc-300 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-white/5">
                <a
                  href={panelContent[activeTab].cta.href}
                  className="inline-flex items-center gap-2 bg-green-400 text-black px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-300 transition-all"
                >
                  {panelContent[activeTab].cta.label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>

            {/* Visual preview */}
            <div className="p-6 xl:p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 space-y-5">
              <div>
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{panelContent[activeTab].badge}</span>
                <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${panelContent[activeTab].accent} mt-1`}>
                  {panelContent[activeTab].headline}
                </h3>
              </div>
              {panelContent[activeTab].preview}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
