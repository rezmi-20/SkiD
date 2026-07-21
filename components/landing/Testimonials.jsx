"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function Testimonials() {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: t("testimonial.1.name"),
      role: t("testimonial.1.role"),
      workerType: "Plumber",
      jobsDone: 12,
      rating: 5,
      text: t("testimonial.1.text"),
      initial: "A",
    },
    {
      name: t("testimonial.2.name"),
      role: t("testimonial.2.role"),
      workerType: "Electrician",
      jobsDone: 7,
      rating: 5,
      text: t("testimonial.2.text"),
      initial: "M",
    },
    {
      name: t("testimonial.3.name"),
      role: t("testimonial.3.role"),
      workerType: "Painter",
      jobsDone: 5,
      rating: 5,
      text: t("testimonial.3.text"),
      initial: "D",
    },
    {
      name: t("testimonial.4.name"),
      role: t("testimonial.4.role"),
      workerType: "Electrician",
      jobsDone: 3,
      rating: 5,
      text: t("testimonial.4.text"),
      initial: "S",
    },
    {
      name: t("testimonial.5.name"),
      role: t("testimonial.5.role"),
      workerType: "House Finishing",
      jobsDone: 4,
      rating: 5,
      text: t("testimonial.5.text"),
      initial: "Y",
    },
    {
      name: t("testimonial.6.name"),
      role: t("testimonial.6.role"),
      workerType: "Maintenance",
      jobsDone: 8,
      rating: 5,
      text: t("testimonial.6.text"),
      initial: "H",
    },
  ];

  return (
    <section id="reviews" className="py-24 md:py-32 bg-[#09090b] relative overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 text-center space-y-4">
        <h2 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">
          {t("testimonials.title").split(" ").slice(0, 3).join(" ")}{" "}
          <span className="text-green-400 italic">{t("testimonials.title").split(" ").slice(3).join(" ")}</span>
        </h2>
        <p className="text-zinc-500 text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
          {t("testimonials.subtitle")}
        </p>
      </div>

      {/* Marquee track */}
      <div className="relative flex overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-5 py-4 whitespace-nowrap"
        >
          {[...testimonials, ...testimonials, ...testimonials].map((item, i) => (
            <div
              key={i}
              className="w-[340px] md:w-[380px] flex-shrink-0 bg-[#0c0c0e] border border-white/5 p-7 rounded-[2.5rem] flex flex-col justify-between hover:border-green-400/20 hover:bg-zinc-900/60 transition-all duration-300 text-left"
              style={{ whiteSpace: "normal" }}
            >
              {/* Stars */}
              <div className="mb-5">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p className="text-zinc-300 text-sm font-medium leading-relaxed italic">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/5">
                <div className="w-11 h-11 rounded-xl bg-green-400 flex items-center justify-center font-black text-black text-base flex-shrink-0">
                  {item.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-black uppercase tracking-tight truncate">{item.name}</p>
                  <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">{item.role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{item.workerType}</p>
                  <p className="text-[9px] font-black text-green-400">{item.jobsDone} jobs</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Edge fades */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
}
