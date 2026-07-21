"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DireSkillLogo from "@/components/shell/DireSkillLogo";

export default function Navbar({ userRole, language, setLanguage, t, isMenuOpen, setIsMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAV_LINKS = [
    { name: t("nav.home"),          href: "#home" },
    { name: t("nav.find_workers"),  href: "#services" },
    { name: t("nav.how_it_works"), href: "#howit" },
    { name: t("nav.features"),      href: "#features" },
    { name: t("nav.reviews"),       href: "#reviews" },
    { name: t("nav.faq"),           href: "#faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "bg-[#09090b]/95 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-[68px] flex items-center justify-between gap-6">

        {/* Brand Logo */}
        <DireSkillLogo variant="light" iconSize={36} />

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500 hover:text-white transition-colors duration-200 whitespace-nowrap rounded-lg hover:bg-white/5"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Language Picker */}
          <div className="hidden md:flex items-center gap-0.5 bg-white/5 border border-white/8 rounded-xl p-0.5">
            {[
              { code: "en", label: "EN" },
              { code: "am", label: "አማ" },
              { code: "om", label: "ORO" },
            ].map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                aria-label={`Switch to ${code}`}
                className={`text-[9px] font-black px-2.5 py-1.5 rounded-[10px] transition-all ${
                  language === code
                    ? "bg-green-400 text-black shadow-sm"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          {!userRole ? (
            <div className="hidden md:flex items-center gap-2">
              <a
                href="/login"
                className="h-9 px-4 flex items-center text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                {t("common.login")}
              </a>
              <a
                href="/register/worker"
                className="h-9 px-5 flex items-center justify-center rounded-xl bg-green-400 text-black text-[10px] font-black uppercase tracking-widest hover:bg-green-300 transition-all shadow-[0_4px_16px_rgba(74,222,128,0.25)] active:scale-95"
              >
                {t("nav.get_started")}
              </a>
            </div>
          ) : (
            <a
              href={
                userRole === "admin"
                  ? "/admin/dashboard"
                  : userRole === "worker"
                  ? "/worker/dashboard"
                  : "/client/search"
              }
              className="hidden md:flex h-9 px-5 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all whitespace-nowrap"
            >
              {t("nav.dashboard")}
            </a>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl bg-white/5 border border-white/8"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            <span className={`w-4.5 h-0.5 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-[7px]" : ""}`} style={{ width: "18px" }} />
            <span className={`h-0.5 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? "opacity-0 scale-x-0" : ""}`} style={{ width: "18px" }} />
            <span className={`w-4.5 h-0.5 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} style={{ width: "18px" }} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-[68px] bg-[#09090b]/97 backdrop-blur-2xl border-b border-white/5 z-[90] flex flex-col gap-0 lg:hidden shadow-2xl">
          {/* Nav links */}
          <div className="px-4 pt-4 pb-2 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="mx-4 h-px bg-white/5" />

          {/* Language switcher */}
          <div className="px-4 py-4">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Language</p>
            <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-xl p-1 w-fit">
              {[
                { code: "en", label: "English" },
                { code: "am", label: "አማርኛ" },
                { code: "om", label: "ORO" },
              ].map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => { setLanguage(code); setIsMenuOpen(false); }}
                  className={`text-[9px] font-black px-3 py-1.5 rounded-[10px] transition-all ${
                    language === code ? "bg-green-400 text-black" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-4 h-px bg-white/5" />

          {/* Auth */}
          <div className="p-4 flex flex-col gap-2">
            {!userRole ? (
              <>
                <a
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="h-12 flex items-center justify-center border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                >
                  {t("common.login")}
                </a>
                <a
                  href="/register/worker"
                  onClick={() => setIsMenuOpen(false)}
                  className="h-12 flex items-center justify-center bg-green-400 text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-300 transition-all"
                >
                  {t("nav.get_started")}
                </a>
              </>
            ) : (
              <a
                href={
                  userRole === "admin"
                    ? "/admin/dashboard"
                    : userRole === "worker"
                    ? "/worker/dashboard"
                    : "/client/search"
                }
                onClick={() => setIsMenuOpen(false)}
                className="h-12 flex items-center justify-center bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest"
              >
                {t("nav.dashboard")}
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
