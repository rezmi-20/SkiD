"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Shield, Check, X, Sliders, ChevronRight } from "lucide-react";

interface CookieConsent {
  essential: true;
  functional: boolean;
  analytics: boolean;
  timestamp: number;
}

const STORAGE_KEY = "skid_cookie_consent";

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Preference state
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Small delay for clean entrance after initial render
        const timer = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(saved) as CookieConsent;
        setFunctional(Boolean(parsed.functional));
        setAnalytics(Boolean(parsed.analytics));
      }
    } catch {
      setVisible(true);
    }
  }, []);

  // Listen for global custom event to reopen preferences modal from Footer or elsewhere
  useEffect(() => {
    const handleOpen = () => {
      setShowModal(true);
      setVisible(false);
    };
    window.addEventListener("skid-open-cookie-preferences", handleOpen);
    return () => window.removeEventListener("skid-open-cookie-preferences", handleOpen);
  }, []);

  const savePreferences = (f: boolean, a: boolean) => {
    const consent: CookieConsent = {
      essential: true,
      functional: f,
      analytics: a,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {}
    setFunctional(f);
    setAnalytics(a);
    setVisible(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => savePreferences(true, true);
  const handleEssentialOnly = () => savePreferences(false, false);

  if (!mounted) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      {visible && !showModal && (
        <aside
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="bg-[#111317]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 text-white">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                  Privacy & Cookie Choices
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  DireSkill uses essential cookies to secure your sessions and digital contracts, and optional cookies to remember your language and district preferences.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-white/50">
                  <Link href="/cookies" className="hover:text-emerald-400 underline underline-offset-2 transition-colors">
                    Cookie Policy
                  </Link>
                  <span>&bull;</span>
                  <Link href="/privacy" className="hover:text-emerald-400 underline underline-offset-2 transition-colors">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs py-2 px-3.5 rounded-xl transition-all cursor-pointer shadow-sm text-center"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-medium py-2 px-3.5 rounded-xl transition-all cursor-pointer"
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-xs text-white/60 hover:text-white px-2 py-2 transition-colors flex items-center gap-1 cursor-pointer"
                aria-label="Customize cookie settings"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Preferences Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-[#13151b] border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="cookie-settings-title" className="text-base font-semibold text-white tracking-tight">
                    Cookie Preferences
                  </h2>
                  <p className="text-xs text-white/50">Manage how DireSkill stores data in your browser</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options List */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Essential */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">Strictly Necessary Cookies</span>
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Vital for authentication sessions, dispute evidence access, national ID verification states, and anti-tamper security. Cannot be switched off.
                  </p>
                </div>
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Functional */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <span className="text-sm font-medium text-white">Functional & Preferences</span>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Remembers your preferred language (English, Amharic, Afaan Oromoo), district location filter in Dire Dawa, and offline PWA settings.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={functional}
                    onChange={(e) => setFunctional(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Analytics */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <span className="text-sm font-medium text-white">Performance & Optimization</span>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Aggregated metrics that help us diagnose latency on mobile networks and ensure fast load times across Ethiopian telecom carriers.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="pt-2 text-xs text-white/40 flex items-center justify-between">
                <span>Compliant with Ethiopian Labour & Data Frameworks</span>
                <Link href="/cookies" className="text-emerald-400 hover:underline flex items-center gap-0.5">
                  Read full policy <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-white/10 bg-white/[0.01] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Accept All
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => savePreferences(functional, analytics)}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Save Choices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
