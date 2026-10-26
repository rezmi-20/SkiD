"use client";

import React from "react";
import Link from "next/link";
import { Cookie, ArrowLeft, Sliders, CheckCircle2, Shield, Info } from "lucide-react";

export default function CookiePolicyPage() {
  const triggerCookieModal = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("skid-open-cookie-preferences"));
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-zinc-200 selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0d0f14]/85 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to DireSkill</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>&bull;</span>
            <span className="text-emerald-400 font-semibold">Cookies</span>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Cookie className="w-3.5 h-3.5" />
            <span>Transparency &bull; User Privacy Controls</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Cookie & Storage Policy
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
            This policy describes how DireSkill uses cookies, browser local storage, and service worker caches to ensure secure authentication, fast performance, and multilingual accessibility.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={triggerCookieModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-all cursor-pointer shadow-md"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Change Cookie Preferences</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12 leading-relaxed text-sm text-zinc-300">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">1</span>
            What Are Cookies & Browser Storage?
          </h2>
          <p>
            Cookies are small text files stored in your web browser by websites you visit. In addition to HTTP cookies, DireSkill utilizes modern web storage technologies such as <strong className="text-white">localStorage</strong> and <strong className="text-white">IndexedDB / Cache API</strong> to enable offline PWA installation, instant language translation, and resilient session management in Dire Dawa's mobile connectivity environment.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">2</span>
            Categories of Cookies We Use
          </h2>

          <div className="space-y-3">
            {/* Category 1: Essential */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">1. Strictly Necessary (Essential)</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                These cookies are indispensable for the operation of DireSkill. They manage your authenticated user session (<code className="text-zinc-300 font-mono text-[11px] bg-black/40 px-1 py-0.5 rounded">neon_auth</code>), ensure anti-CSRF protection on form submissions, and maintain security tokens for contract signing and dispute resolution. Without these, the platform cannot function securely.
              </p>
            </div>

            {/* Category 2: Functional */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">2. Functional & Preference Storage</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Configurable
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Functional storage remembers your personalized choices:
              </p>
              <ul className="list-disc list-inside text-xs text-zinc-400 pl-2 space-y-1">
                <li>Selected interface language (<code className="text-zinc-300 font-mono text-[11px] bg-black/40 px-1 py-0.5 rounded">skid_lang</code>): English, Amharic (አማርኛ), or Afaan Oromoo.</li>
                <li>Saved geographic search radius and district filters across Dire Dawa (Gende Kore, Sabian, Kebele 01-09).</li>
                <li>Theme preferences and dismissed alert states.</li>
              </ul>
            </div>

            {/* Category 3: PWA & Offline Cache */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">3. Progressive Web App (PWA) Offline Caching</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Local Cache
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                DireSkill's Service Worker (<code className="text-zinc-300 font-mono text-[11px] bg-black/40 px-1 py-0.5 rounded">sw.js</code>) caches application shells, icon assets, and static trade categories locally on your device. This enables artisans and homeowners to access previously viewed contacts and active contracts even during intermittent cellular network drops.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">3</span>
            Managing Your Preferences
          </h2>
          <p>
            You can modify your cookie choices at any time directly through DireSkill:
          </p>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white text-xs">Interactive Preferences Manager</h3>
              <p className="text-xs text-zinc-400">Toggle functional and analytics storage on or off.</p>
            </div>
            <button
              type="button"
              onClick={triggerCookieModal}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
            >
              Open Cookie Settings
            </button>
          </div>
          <p className="text-xs text-zinc-400 pt-2">
            You may also configure your web browser (Chrome, Safari, Firefox, Edge) to reject or delete cookies. Please note that disabling strictly necessary cookies will prevent you from signing in or executing digital contracts.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">4</span>
            Contact & Academic Questions
          </h2>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs space-y-1 text-zinc-400">
            <p><strong className="text-white">Project:</strong> DireSkill Platform &bull; Dire Dawa University</p>
            <p><strong className="text-white">Inquiries:</strong> privacy@direskill.com</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-zinc-500">
        <p>&copy; 2026 DireSkill. All rights reserved. Transparent privacy controls.</p>
      </footer>
    </div>
  );
}
