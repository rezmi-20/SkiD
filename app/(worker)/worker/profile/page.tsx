"use client";

import { useLocation } from "@/context/LocationContext";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";

const MENU_ITEMS = [
  {
    group: "Professional",
    items: [
      {
        label: "Sync My Location",
        subtitle: "Update your district position",
        icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z",
        iconExtra: "M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
        action: "location",
        accent: "green",
      },
      {
        label: "Credentials & Certifications",
        subtitle: "Manage your professional documents",
        icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
        action: "link",
        accent: null,
      },
      {
        label: "Earnings Vault",
        subtitle: "View payment & withdrawal history",
        icon: "M21 12H3m18-4H3m18 8H3",
        action: "link",
        accent: null,
      },
    ],
  },
  {
    group: "Support",
    items: [
      {
        label: "Contact Admin",
        subtitle: "Reach out to DireSkill support team",
        icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
        action: "link",
        accent: null,
      },
      {
        label: "Privacy & Settings",
        subtitle: "Account security and preferences",
        icon: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
        action: "link",
        accent: null,
      },
    ],
  },
];

export default function WorkerProfilePage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const { refreshLocation, loading: locLoading } = useLocation();
  const [justUpdated, setJustUpdated] = useState(false);

  const name = session?.user?.name || "Professional";
  const email = session?.user?.email || "worker@direskilld.com";
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleUpdateLocation = () => {
    refreshLocation();
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 3000);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-32 md:pb-10">

      {/* ── Hero Card ── */}
      <div className="relative overflow-hidden bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 bg-green-400/8 blur-[60px] pointer-events-none" />

        {/* Avatar */}
        <div className="relative z-10 mb-5">
          <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-green-400 via-green-400/30 to-zinc-900 shadow-[0_0_50px_rgba(74,222,128,0.2)]">
            <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center border-[3px] border-zinc-900">
              <span className="text-3xl font-black text-white">{initials}</span>
            </div>
          </div>
          {/* Verified badge */}
          <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-green-400 border-[3px] border-[#09090b] rounded-full flex items-center justify-center shadow-lg z-20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <h1 className="relative z-10 text-2xl font-black tracking-tight text-white mb-1 uppercase">{name}</h1>
        <p className="relative z-10 text-sm text-zinc-500 font-medium mb-3">{email}</p>

        <div className="relative z-10 flex items-center gap-2 flex-wrap justify-center">
          <div className="px-3 py-1 bg-green-400/10 border border-green-400/20 rounded-full">
            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Worker Account</span>
          </div>
          <div className="px-3 py-1 bg-zinc-800 border border-white/5 rounded-full">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Level 1</span>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-5">
        <div className="flex items-center justify-between divide-x divide-white/5">
          {[
            { label: "Gigs", value: "0" },
            { label: "Earned (ETB)", value: "0" },
            { label: "Rating", value: "★ —" },
          ].map((stat, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 px-4">
              <span className="text-2xl font-black text-white">{stat.value}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Skills Tags ── */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-5 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Registered Skills</p>
        <div className="flex flex-wrap gap-2">
          {["Pipe Installation", "Leak Repair", "Solar Water Heaters", "Drain Unclogging"].map((skill) => (
            <span key={skill} className="px-3 py-1.5 bg-zinc-800 border border-white/5 rounded-full text-[11px] font-bold text-zinc-300">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* ── Menu Groups ── */}
      {MENU_ITEMS.map((group) => (
        <div key={group.group} className="space-y-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 ml-3">{group.group}</h2>
          <div className="space-y-2">
            {group.items.map((item) => {
              const isLocation = item.action === "location";

              if (isLocation) {
                return (
                  <button
                    key={item.label}
                    onClick={handleUpdateLocation}
                    disabled={locLoading}
                    className={`w-full group border rounded-[1.75rem] p-4 flex items-center gap-4 text-left transition-all duration-300 ${
                      justUpdated
                        ? "bg-green-400/10 border-green-400/30"
                        : "bg-zinc-900/60 border-white/5 hover:border-green-400/20"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      justUpdated ? "bg-green-400 border-green-400" :
                      locLoading ? "bg-zinc-800 border-white/5" :
                      "bg-zinc-800 border border-white/5 group-hover:bg-green-400 group-hover:border-green-400"
                    }`}>
                      {locLoading ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin text-green-400">
                          <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                        </svg>
                      ) : justUpdated ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-black transition-colors">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold transition-colors ${justUpdated ? "text-green-400" : "text-white group-hover:text-green-400"}`}>
                        {locLoading ? "Locating..." : justUpdated ? "Location Updated!" : item.label}
                      </p>
                      <p className="text-xs text-zinc-600 font-medium mt-0.5">{item.subtitle}</p>
                    </div>
                    {!locLoading && !justUpdated && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-700 shrink-0">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={item.label}
                  className="w-full group bg-zinc-900/60 border border-white/5 hover:border-green-400/20 rounded-[1.75rem] p-4 flex items-center gap-4 text-left transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-zinc-800 border border-white/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-400 group-hover:border-green-400 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-black transition-colors">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{item.label}</p>
                    <p className="text-xs text-zinc-600 font-medium mt-0.5">{item.subtitle}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Logout ── */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full group bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/30 rounded-[1.75rem] p-4 flex items-center gap-4 transition-all duration-300"
      >
        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-red-500">Sign Out</p>
          <p className="text-xs text-red-500/50 font-medium mt-0.5">End your current session</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500/40 shrink-0">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <p className="text-center text-[10px] text-zinc-700 font-medium tracking-widest uppercase pb-2">
        DireSkill v1.0 · Worker Portal
      </p>
    </div>
  );
}
