"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FaqAccordion({ t }) {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: t("faq.1.q"), a: t("faq.1.a") },
    { q: t("faq.2.q"), a: t("faq.2.a") },
    { q: t("faq.3.q"), a: t("faq.3.a") },
    { q: t("faq.4.q"), a: t("faq.4.a") },
    { q: t("faq.5.q"), a: t("faq.5.a") },
    { q: t("faq.6.q"), a: t("faq.6.a") },
  ];

  return (
    <section id="faq" className="py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-[#09090b]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 xl:gap-20">
          
          {/* Left: heading */}
          <div className="lg:sticky lg:top-28 space-y-4">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-black tracking-tighter text-white uppercase leading-[0.9]">
              {t("faq.title").split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-green-400 italic">{t("faq.title").split(" ").slice(-1)[0]}</span>
            </h2>
            <p className="text-zinc-500 text-sm md:text-base font-medium leading-relaxed">
              {t("faq.subtitle")}
            </p>

            {/* Still have questions? */}
            <div className="pt-4">
              <a
                href="/client/search"
                className="inline-flex items-center gap-2 text-green-400 text-xs font-black uppercase tracking-widest hover:gap-3 transition-all duration-200"
              >
                Start exploring
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Accordion */}
          <div className="lg:col-span-2 space-y-2">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-green-400/20 bg-green-400/5"
                      : "border-white/5 bg-[#0c0c0e] hover:border-white/10"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-sm font-semibold leading-snug transition-colors ${isOpen ? "text-white" : "text-zinc-300"}`}>
                      {faq.q}
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? "bg-green-400 text-black rotate-45" : "bg-white/5 text-zinc-500"}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <p className="px-6 pb-5 text-zinc-400 text-sm font-medium leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
