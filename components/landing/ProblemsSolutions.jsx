"use client";
import { motion } from "framer-motion";

export default function ProblemsSolutions({ t }) {
  const items = [
    {
      problem: t("problems.1.problem"),
      solution: t("problems.1.solution"),
      benefit: t("problems.1.benefit"),
      bgImg: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
    {
      problem: t("problems.2.problem"),
      solution: t("problems.2.solution"),
      benefit: t("problems.2.benefit"),
      bgImg: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=400",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
    {
      problem: t("problems.3.problem"),
      solution: t("problems.3.solution"),
      benefit: t("problems.3.benefit"),
      bgImg: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=400",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400">
          <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/>
          <path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4"/>
        </svg>
      ),
    },
    {
      problem: t("problems.4.problem"),
      solution: t("problems.4.solution"),
      benefit: t("problems.4.benefit"),
      bgImg: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=400",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400">
          <line x1="1" y1="1" x2="23" y2="23"/>
          <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="problems" className="py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-[#090b0e]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="mb-12 text-left">
          <h2 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9] max-w-3xl mb-4">
            {t("problems.title").split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-red-400 italic">{t("problems.title").split(" ").slice(-2).join(" ")}</span>
          </h2>
          <p className="text-zinc-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
            {t("problems.subtitle")}
          </p>
        </div>

        {/* Problem → Solution grid using PayCard style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-12">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="relative bg-[#13161c] border border-white/[0.04] rounded-2xl p-6 pt-10 flex flex-col justify-between group hover:border-white/[0.08] transition-all duration-300 shadow-xl"
            >
              {/* Inner wrapper strictly containing background image so parent has no overflow-hidden */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
                <img
                  src={item.bgImg}
                  className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-500"
                  alt=""
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#13161c] via-[#13161c]/80 to-[#13161c]/30" />
              </div>

              {/* Overlapping top-left floating icon container */}
              <div className="absolute -top-6 left-6 w-12 h-12 rounded-xl bg-[#1b1f28] border border-white/[0.08] flex items-center justify-center shadow-lg z-10 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>

              {/* Content body split in two */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 flex-1">
                {/* Left side: Problem */}
                <div className="space-y-2">
                  <span className="text-[8px] font-black text-red-400 tracking-wider uppercase block">
                    {t("problems.label")}
                  </span>
                  <p className="text-[#8a929a] text-xs font-normal leading-relaxed">
                    {item.problem}
                  </p>
                </div>

                {/* Right side: Solution */}
                <div className="space-y-4 md:border-l md:border-white/5 md:pl-6">
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-green-400 tracking-wider uppercase block">
                      {t("problems.arrow_solution")}
                    </span>
                    <p className="text-white text-xs font-bold leading-relaxed">
                      {item.solution}
                    </p>
                  </div>

                  {/* Benefit */}
                  <div className="pt-2 pl-3 border-l-2 border-green-400/30">
                    <p className="text-[8px] font-black uppercase tracking-widest text-green-400/50 mb-0.5">
                      {t("problems.arrow_benefit")}
                    </p>
                    <p className="text-green-400 text-[10px] font-black uppercase tracking-tight">
                      {item.benefit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer action link */}
              <div className="relative z-10 pt-6 border-t border-white/5 mt-6">
                <a
                  href="/client/search"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                >
                  Find Solution
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
