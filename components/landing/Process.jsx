"use client";
import { motion } from "framer-motion";

export default function Process({ t }) {
  const PROCESS_STEPS = [
    { 
      step: "01", 
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      )
    },
    { 
      step: "02", 
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      )
    },
    { 
      step: "03", 
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      )
    },
    { 
      step: "04", 
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/></svg>
      )
    }
  ];

  return (
    <section id="process" className="py-20 md:py-28 px-4 md:px-12 lg:px-20 bg-[#09090b]">
      <div className="max-w-[95%] mx-auto">
        <div className="text-center mb-16 md:mb-24 space-y-4">
           <h2 className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tighter text-white uppercase leading-[0.9]">
              {t("process.title").split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-green-400 italic">{t("process.title").split(" ").slice(-1)[0]}</span>
           </h2>
           <p className="text-zinc-500 text-base md:text-lg lg:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              {t("process.subtitle")}
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {PROCESS_STEPS.map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -6, 
                borderColor: "rgba(74, 222, 128, 0.3)",
                boxShadow: "0_20px_40px_rgba(74, 222, 128, 0.05)"
              }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`relative h-[280px] lg:h-[380px] xl:h-[450px] p-6 xl:p-10 rounded-[2.5rem] xl:rounded-[3rem] bg-[#0c0c0e] border border-white/5 transition-all group overflow-hidden text-left cursor-pointer ${
                i % 2 !== 0 ? 'lg:mt-12 xl:mt-16' : 'lg:mb-12 xl:mb-16'
              }`}
            >
               {/* Grayscale filter removed from process step background image */}
               <img src={item.image} className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-20 group-hover:opacity-35 transition-all duration-700" alt={t("process.step" + (i + 1) + ".title")} />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
               
               <div className="absolute -top-10 -right-10 text-[10rem] xl:text-[15rem] font-black text-white/5 pointer-events-none group-hover:text-green-400/5 transition-colors leading-none">
                  {item.step}
               </div>
               <div className="relative z-10 flex flex-col h-full justify-end">
                  <div className="w-12 h-12 xl:w-14 xl:h-14 bg-green-400/10 rounded-2xl flex items-center justify-center text-green-400 mb-6 xl:mb-8 shadow-[0_0_40px_rgba(74,222,128,0.1)] group-hover:bg-green-400 group-hover:text-black transition-all duration-500 flex-shrink-0">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl xl:text-3xl font-black text-white uppercase tracking-tight mb-2.5 leading-snug">{t("process.step" + (i + 1) + ".title")}</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed text-xs xl:text-sm max-w-[200px]">{t("process.step" + (i + 1) + ".desc")}</p>
               </div>
               <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
