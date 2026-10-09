"use client";
import { motion } from "framer-motion";

export default function Process({ t }) {
  const steps = [
    {
      num: "01",
      title: t("howit.step1.title"),
      desc: t("howit.step1.desc"),
      bgImg: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
    },
    {
      num: "02",
      title: t("howit.step2.title"),
      desc: t("howit.step2.desc"),
      bgImg: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      num: "03",
      title: t("howit.step3.title"),
      desc: t("howit.step3.desc"),
      bgImg: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=300",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      num: "04",
      title: t("howit.step4.title"),
      desc: t("howit.step4.desc"),
      bgImg: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=300",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <polyline points="9 11 11 13 15 9"/>
        </svg>
      ),
    },
    {
      num: "05",
      title: t("howit.step5.title"),
      desc: t("howit.step5.desc"),
      isPayment: true,
      bgImg: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=300",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-400">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      num: "06",
      title: t("howit.step6.title"),
      desc: t("howit.step6.desc"),
      bgImg: "https://images.unsplash.com/photo-1503387762-592dec58ef4e?auto=format&fit=crop&q=80&w=300",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
    },
    {
      num: "07",
      title: t("howit.step7.title"),
      desc: t("howit.step7.desc"),
      bgImg: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=300",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="howit" className="py-12 sm:py-20 md:py-32 px-4 md:px-8 lg:px-16 bg-[#090b0e]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-left mb-6 sm:mb-12 space-y-2 sm:space-y-4">
          <h2 className="text-2xl sm:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9] max-w-3xl">
            {t("howit.title").split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-green-400 italic">{t("howit.title").split(" ").slice(-2).join(" ")}</span>
          </h2>
          <p className="text-zinc-500 text-xs sm:text-base md:text-lg font-medium max-w-xl leading-relaxed">
            {t("howit.subtitle")}
          </p>
        </div>

        {/* Steps Grid: Horizontal swipeable snap carousel on mobile, 7-col grid on desktop */}
        <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-3 sm:pb-4 pt-5 sm:pt-6 snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 md:overflow-visible">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className={`w-[200px] min-w-[200px] max-w-[210px] snap-center sm:w-auto sm:min-w-0 sm:max-w-none relative bg-[#13161c] border rounded-2xl p-4 pt-7 sm:p-5 sm:pt-9 flex flex-col justify-between group transition-all duration-300 shadow-xl flex-shrink-0 ${
                step.isPayment
                  ? "border-blue-500/20 hover:border-blue-500/40"
                  : "border-white/[0.04] hover:border-white/[0.08]"
              }`}
            >
              {/* Server-side rendered vector background asset (never fails or times out) */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0 opacity-15">
                <svg viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
                  <circle cx="150" cy="120" r="80" stroke="#4ade80" strokeWidth="0.75" strokeDasharray="4 4" />
                  <line x1="50" y1="120" x2="250" y2="120" stroke="#ffffff" strokeWidth="0.5" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-[#13161c] via-[#13161c]/80 to-[#13161c]/30" />
              </div>

              {/* Overlapping top-left floating icon container */}
              <div className="absolute -top-4 sm:-top-6 left-4 sm:left-6 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#1b1f28] border border-white/[0.08] flex items-center justify-center shadow-lg z-10 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>

              {/* Step number watermark inside card top right */}
              <div className="absolute top-2 right-4 text-[1.2rem] sm:text-[1.5rem] font-black text-white/[0.03] select-none pointer-events-none z-10">
                {step.num}
              </div>

              {/* Text content */}
              <div className="space-y-1.5 sm:space-y-3 flex-1 pt-1 relative z-10">
                <h3 className="text-white text-xs font-bold tracking-tight leading-snug">
                  {step.title}
                </h3>
                <p className="text-[#8a929a] text-[10px] sm:text-[11px] font-normal leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Footer step marker / badge */}
              <div className="pt-2.5 sm:pt-4 mt-auto relative z-10">
                {step.isPayment ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[7px] font-black text-blue-400 uppercase tracking-widest">
                    via Chapa
                  </span>
                ) : (
                  <span className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-wider block">
                    Step {step.num}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
