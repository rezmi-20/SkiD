"use client";
import { motion } from "framer-motion";

export default function VerificationFlow({ t }) {
  const steps = [
    {
      step: "01",
      title: t("verify.step1.title"),
      desc: t("verify.step1.desc"),
      bgImg: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=300",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
          <rect x="2" y="2" width="20" height="16" rx="2" ry="2"/>
          <circle cx="8" cy="10" r="2"/>
          <path d="M14 8h4M14 12h4"/>
          <path d="M6 18v2M10 18v2M14 18v2M18 18v2"/>
        </svg>
      ),
    },
    {
      step: "02",
      title: t("verify.step2.title"),
      desc: t("verify.step2.desc"),
      bgImg: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <polyline points="9 11 11 13 15 9"/>
        </svg>
      ),
    },
    {
      step: "03",
      title: t("verify.step3.title"),
      desc: t("verify.step3.desc"),
      bgImg: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 11 11 13 15 9"/>
        </svg>
      ),
    },
    {
      step: "04",
      title: t("verify.step4.title"),
      desc: t("verify.step4.desc"),
      bgImg: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=300",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
          <polyline points="16 11 18 13 22 9"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="verification" className="py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-[#090b0e] relative overflow-hidden">
      {/* Subtle radial glow behind the section */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] rounded-full bg-green-400/[0.03] blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-left mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9] max-w-3xl">
            {t("verify.title").split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-green-400 italic">{t("verify.title").split(" ").slice(-1)[0]}</span>
          </h2>
          <p className="text-zinc-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
            {t("verify.subtitle")}
          </p>
        </div>

        {/* Steps Grid using PayCard style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative bg-[#13161c] border border-white/[0.04] rounded-2xl p-6 pt-10 flex flex-col justify-between group transition-all duration-300 shadow-xl"
            >
              {/* Inner wrapper strictly containing background image so parent has no overflow-hidden */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
                <img
                  src={step.bgImg}
                  className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-500"
                  alt=""
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#13161c] via-[#13161c]/80 to-[#13161c]/30" />
              </div>

              {/* Overlapping top-left floating icon container */}
              <div className="absolute -top-6 left-6 w-12 h-12 rounded-xl bg-[#1b1f28] border border-white/[0.08] flex items-center justify-center shadow-lg z-10 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>

              {/* Text content */}
              <div className="space-y-3 flex-1 pt-1 relative z-10">
                <h3 className="text-white text-xs font-bold tracking-tight leading-snug">
                  {step.title}
                </h3>
                <p className="text-[#8a929a] text-[11px] font-normal leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Card Footer Indicator */}
              <div className="pt-4 mt-auto relative z-10">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-wider block">
                  Phase {step.step}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fayda badge callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 p-6 md:p-8 rounded-[2rem] bg-green-400/5 border border-green-400/15"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-400 rounded-2xl flex items-center justify-center font-black text-black text-xs shadow-[0_8px_24px_rgba(74,222,128,0.3)] flex-shrink-0">
              FAYDA
            </div>
            <div className="text-left">
              <p className="text-white font-black text-sm uppercase tracking-tight">Ethiopia National Digital ID</p>
              <p className="text-zinc-500 text-xs font-medium">Proclamation 1156/2019 Compliant</p>
            </div>
          </div>
          <div className="hidden sm:block h-10 w-px bg-white/10" />
          <p className="text-zinc-400 text-sm font-medium text-center sm:text-left max-w-xs leading-relaxed">
            The only skilled-labor platform in Dire Dawa backed by Ethiopia&apos;s national identity infrastructure.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
