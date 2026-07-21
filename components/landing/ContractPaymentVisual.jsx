"use client";
import { motion } from "framer-motion";

export default function ContractPaymentVisual({ t }) {
  const steps = [
    {
      step: "01",
      title: t("contract.step1.title"),
      desc: t("contract.step1.desc"),
      color: "blue",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      step: "02",
      title: t("contract.step2.title"),
      desc: t("contract.step2.desc"),
      color: "zinc",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      ),
    },
    {
      step: "03",
      title: t("contract.step3.title"),
      desc: t("contract.step3.desc"),
      color: "green",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
    },
    {
      step: "04",
      title: t("contract.step4.title"),
      desc: t("contract.step4.desc"),
      color: "zinc",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      step: "05",
      title: t("contract.step5.title"),
      desc: t("contract.step5.desc"),
      color: "blue",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      step: "06",
      title: t("contract.step6.title"),
      desc: t("contract.step6.desc"),
      color: "green",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
    },
  ];

  const colorMap = {
    blue: {
      iconBg: "bg-blue-500/10 border-blue-500/20",
      iconText: "text-blue-400",
      dot: "bg-blue-400",
    },
    green: {
      iconBg: "bg-green-400/10 border-green-400/20",
      iconText: "text-green-400",
      dot: "bg-green-400",
    },
    zinc: {
      iconBg: "bg-white/5 border-white/10",
      iconText: "text-zinc-400",
      dot: "bg-zinc-500",
    },
  };

  return (
    <section id="contracts" className="py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-zinc-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">
          
          {/* Left: Text */}
          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t("contract.section_label")}</span>
            </div>
            <h2 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.85]">
              {t("contract.title").split(". ").map((part, i, arr) => (
                <span key={i}>
                  {i === 2 ? <span className="text-green-400 italic">{part}</span> : part}
                  {i < arr.length - 1 ? ". " : ""}
                </span>
              ))}
            </h2>
            <p className="text-zinc-500 text-base md:text-lg font-medium leading-relaxed max-w-md">
              {t("contract.subtitle")}
            </p>

            {/* Chapa badge */}
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-[9px] flex-shrink-0 shadow-[0_4px_16px_rgba(59,130,246,0.3)]">
                CHAPA
              </div>
              <p className="text-blue-300 text-xs font-semibold leading-snug max-w-[200px]">
                {t("contract.chapa_note")}
              </p>
            </div>
          </div>

          {/* Right: Timeline steps */}
          <div className="relative space-y-0">
            {/* Vertical connector line */}
            <div className="absolute left-[19px] top-10 bottom-10 w-px bg-white/5" />

            {steps.map((step, i) => {
              const colors = colorMap[step.color];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.45 }}
                  className="relative flex gap-5 pb-8 last:pb-0"
                >
                  {/* Dot on the timeline */}
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    <div className={`w-10 h-10 rounded-2xl border ${colors.iconBg} ${colors.iconText} flex items-center justify-center`}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{step.step}</span>
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">{step.title}</h3>
                    <p className="text-zinc-500 text-xs font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
