"use client";
import { motion } from "framer-motion";

export default function WhyChooseUs({ t }) {
  const BENEFITS = [
    { image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400", tag: "ETB" },
    { image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=400", tag: "ID" },
    { image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400", tag: "DOC" },
    { image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400", tag: "CHAT" }
  ];

  return (
    <section id="about" className="py-20 md:py-28 px-4 md:px-12 lg:px-20 bg-zinc-950">
      <div className="max-w-[95%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">
        
        {/* Left: Portrait Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {BENEFITS.map((benefit, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -6, 
                borderColor: "rgba(74, 222, 128, 0.3)",
                boxShadow: "0_20px_40px_rgba(74, 222, 128, 0.05)"
              }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="relative h-[200px] md:h-[280px] xl:h-[350px] rounded-[2.5rem] overflow-hidden border border-white/5 group text-left cursor-pointer"
            >
               {/* Grayscale filter removed from benefit image */}
               <img src={benefit.image} className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-all duration-1000" alt={t("benefit" + (i + 1) + ".title")} />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
               <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest">{benefit.tag}</div>
               <div className="absolute bottom-6 left-6 right-6">
                  <h4 className="text-sm md:text-base xl:text-lg font-black text-white uppercase tracking-tight mb-1">{t("benefit" + (i + 1) + ".title")}</h4>
                  <p className="text-zinc-400 text-[9px] xl:text-[10px] font-bold uppercase tracking-widest leading-snug">{t("benefit" + (i + 1) + ".desc")}</p>
               </div>
            </motion.div>
          ))}
        </div>

        {/* Right: City-Wide Trust Component - Headline text sizing optimized for 15-inch viewports */}
        <motion.div 
           initial={{ opacity: 0, x: 30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="space-y-6 md:space-y-8 text-left"
        >
           <h2 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.85]">
              {t("benefits.title").split(" ").slice(0, -1).join(" ")} <br/>
              <span className="text-green-400 italic">{t("benefits.title").split(" ").slice(-1)[0]}</span>
           </h2>
           <div className="space-y-6 max-w-lg">
              <p className="text-zinc-500 text-base md:text-lg font-medium leading-relaxed">
                 {t("benefits.desc")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                 {[
                    { title: t("benefit5.title"), desc: t("benefit5.desc"), icon: "STAR" },
                    { title: t("benefit6.title"), desc: t("benefit6.desc"), icon: "MAP" }
                 ].map((item, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                       <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1.5 leading-none">{item.icon}</p>
                       <h5 className="text-white font-black text-sm uppercase tracking-tight mb-1 leading-snug">{item.title}</h5>
                       <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide leading-snug">{item.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </motion.div>

      </div>
    </section>
  );
}
