"use client";
import { motion } from "framer-motion";

export default function TrustIndicators({ t }) {
  const badges = [
    {
      tag: "FAYDA ID",
      title: t("trust.badge1.title"),
      desc: t("trust.badge1.desc"),
      bgImg: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=400",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 11 11 13 15 9"/>
        </svg>
      ),
    },
    {
      tag: "CHAPA",
      title: t("trust.badge2.title"),
      desc: t("trust.badge2.desc"),
      bgImg: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=400",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-400">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      tag: "CONTRACTS",
      title: t("trust.badge3.title"),
      desc: t("trust.badge3.desc"),
      bgImg: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=400",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-violet-400">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
        </svg>
      ),
    },
    {
      tag: "REVIEWS",
      title: t("trust.badge4.title"),
      desc: t("trust.badge4.desc"),
      bgImg: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=400",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-400">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
    {
      tag: "LOCATION",
      title: t("trust.badge5.title"),
      desc: t("trust.badge5.desc"),
      bgImg: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rose-400">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="trust" className="py-12 sm:py-20 md:py-32 px-4 md:px-8 lg:px-16 bg-[#090b0e] border-y border-white/[0.03]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-left mb-6 sm:mb-16 space-y-1.5 sm:space-y-3">
          <span className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] text-green-400 uppercase">
            Guaranteed Trust
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
            {t("trust.title").split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-green-400 italic">{t("trust.title").split(" ").slice(-1)[0]}</span>
          </h2>
        </div>

        {/* Premium floating-icon cards (Horizontal snap carousel on mobile, 5-col grid on desktop) */}
        <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-3 sm:pb-4 pt-5 sm:pt-6 snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-5 md:overflow-visible">
          {badges.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="w-[220px] min-w-[220px] max-w-[230px] snap-center sm:w-auto sm:min-w-0 sm:max-w-none relative bg-[#13161c] border border-white/[0.04] rounded-2xl p-4 pt-8 sm:p-6 sm:pt-10 flex flex-col justify-between group hover:border-white/[0.08] transition-all duration-300 shadow-xl flex-shrink-0"
            >
              {/* Server-side rendered vector background asset (never fails or times out) */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0 opacity-15">
                <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
                  <circle cx="200" cy="150" r="120" stroke="#4ade80" strokeWidth="0.75" strokeDasharray="6 4" />
                  <circle cx="200" cy="150" r="80" stroke="#ffffff" strokeWidth="0.5" />
                  <line x1="80" y1="150" x2="320" y2="150" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-[#13161c] via-[#13161c]/80 to-[#13161c]/30" />
              </div>

              {/* Overlapping top-left floating icon container */}
              <div className="absolute -top-4 sm:-top-6 left-4 sm:left-6 w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-[#1b1f28] border border-white/[0.08] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 z-10">
                {b.icon}
              </div>

              {/* Card Body */}
              <div className="space-y-2 sm:space-y-4 flex-1 relative z-10 pt-1">
                <div>
                  <span className="text-[8px] font-black text-zinc-500 tracking-wider uppercase block mb-0.5">
                    {b.tag}
                  </span>
                  <h3 className="text-white text-xs sm:text-sm font-bold tracking-tight leading-snug">
                    {b.title}
                  </h3>
                </div>
                <p className="text-[#8a929a] text-[10px] sm:text-xs font-normal leading-relaxed">
                  {b.desc}
                </p>
              </div>

              {/* Card Footer Link (hidden on mobile to keep card heights ultra compact) */}
              <div className="hidden sm:block pt-4 sm:pt-6 mt-auto relative z-10">
                <a
                  href="/client/search"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                >
                  Explore Now
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="translate-y-[0.5px]">
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
