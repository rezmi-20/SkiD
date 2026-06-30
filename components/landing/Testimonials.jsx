"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function Testimonials() {
  const { t } = useLanguage();

  const testimonials = [
    { name: t("testimonial.1.name"), role: t("testimonial.1.role"), text: t("testimonial.1.text"), avatar: "A" },
    { name: t("testimonial.2.name"), role: t("testimonial.2.role"), text: t("testimonial.2.text"), avatar: "M" },
    { name: t("testimonial.3.name"), role: t("testimonial.3.role"), text: t("testimonial.3.text"), avatar: "D" },
    { name: t("testimonial.4.name"), role: t("testimonial.4.role"), text: t("testimonial.4.text"), avatar: "S" },
    { name: t("testimonial.5.name"), role: t("testimonial.5.role"), text: t("testimonial.5.text"), avatar: "Y" },
    { name: t("testimonial.6.name"), role: t("testimonial.6.role"), text: t("testimonial.6.text"), avatar: "H" }
  ];

  return (
    <section className="py-24 bg-[#09090b] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute top-1/2 left-0 w-full h-px bg-green-400" />
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">
          {t("testimonials.title").split(" ")[0]} <span className="text-green-400 italic">{t("testimonials.title").split(" ").slice(1).join(" ")}</span>
        </h2>
        <p className="text-zinc-500 text-base md:text-lg font-medium mt-4 max-w-2xl mx-auto">
          {t("testimonials.subtitle")}
        </p>
      </div>

      <div className="relative flex overflow-hidden group/marquee">
         <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
               duration: 35, 
               repeat: Infinity, 
               ease: "linear" 
            }}
            className="flex gap-6 whitespace-nowrap py-6"
         >
            {[...testimonials, ...testimonials, ...testimonials].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.01 }}
                className="w-[380px] md:w-[420px] flex-shrink-0 bg-[#0c0c0e] border border-white/5 p-10 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between group/card transition-all duration-500 hover:border-green-400/20 hover:bg-zinc-900/50 backdrop-blur-xl text-left"
              >
                <div className="mb-8 whitespace-normal">
                  <div className="flex gap-1.5 mb-6 opacity-40 group-hover/card:opacity-100 transition-opacity duration-500">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-zinc-400 text-base md:text-lg font-medium leading-relaxed italic tracking-tight">
                    "{item.text}"
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-green-400 flex items-center justify-center font-black text-black text-xl shadow-[0_10px_30px_rgba(74,222,128,0.2)] group-hover/card:scale-105 transition-transform duration-500 flex-shrink-0">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-base font-black text-white uppercase tracking-tight leading-tight">{item.name}</p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
         </motion.div>
         
         {/* Gradient Overlays for smooth edges */}
         <div className="absolute inset-y-0 left-0 w-32 md:w-40 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
         <div className="absolute inset-y-0 right-0 w-32 md:w-40 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
}
