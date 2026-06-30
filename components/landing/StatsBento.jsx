"use client";
import { motion } from "framer-motion";

export default function StatsBento({ t }) {
  return (
    <section className="py-20 md:py-28 px-4 md:px-12 lg:px-20 bg-[#09090b] relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#4ade80_0%,transparent_50%)]" />
       </div>
       
       <div className="max-w-[95%] mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 h-auto lg:min-h-[500px] xl:min-h-[600px]">
             
             {/* Main Content Card - Sizing and layout optimized for 15-inch desktops */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, borderColor: "rgba(74, 222, 128, 0.3)" }}
                viewport={{ once: true }}
                className="md:col-span-2 lg:col-span-3 lg:row-span-2 p-6 md:p-8 xl:p-10 rounded-[2.5rem] bg-zinc-900/50 border border-white/10 backdrop-blur-3xl flex flex-col justify-center space-y-4 xl:space-y-6 relative overflow-hidden group text-left min-h-[300px] lg:min-h-auto"
             >
                <div className="absolute top-0 left-0 w-full h-full opacity-10 group-hover:opacity-20 transition-opacity">
                   <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Workers working" />
                </div>
                <div className="relative z-10 space-y-4 xl:space-y-6">
                   <h2 className="text-3xl md:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.85]">
                      {t("bento.modernizing").split(" ")[0]} <br/>
                      <span className="text-green-400 italic">{t("bento.modernizing").split(" ").slice(1).join(" ")}</span>
                   </h2>
                   <p className="text-zinc-400 text-sm xl:text-base font-medium leading-relaxed max-w-md">
                      {t("bento.modernizing.desc")}
                   </p>
                   <div className="pt-2">
                      <a href="/register/worker" className="inline-flex items-center gap-4 text-green-400 font-black uppercase tracking-[0.2em] text-[10px] hover:gap-6 transition-all">
                         {t("bento.cta.empower")} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </a>
                   </div>
                </div>
             </motion.div>

             {/* Stat Card 1 */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4, borderColor: "rgba(74, 222, 128, 0.3)" }}
                viewport={{ once: true }}
                className="md:col-span-1 p-6 xl:p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl flex flex-col justify-between hover:border-green-400/30 transition-all group text-left min-h-[160px] md:min-h-auto"
             >
                <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center text-green-400 flex-shrink-0">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="mt-4 xl:mt-8">
                   <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1.5 leading-snug">{t("bento.fayda")}</p>
                   <p className="text-3xl xl:text-4xl font-black text-white mb-0.5">100%</p>
                   <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest leading-none">{t("bento.fayda.desc")}</p>
                </div>
             </motion.div>

             {/* Stat Card 2 */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4, borderColor: "rgba(74, 222, 128, 0.3)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                className="md:col-span-1 lg:col-span-2 p-6 xl:p-8 rounded-[2rem] bg-zinc-900 border border-white/5 flex flex-col justify-between hover:border-green-400/30 transition-all group text-left min-h-[160px] md:min-h-auto"
             >
                <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center text-green-400 flex-shrink-0">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/></svg>
                </div>
                <div className="mt-4 xl:mt-8">
                   <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1.5 leading-snug">{t("bento.satisfaction")}</p>
                   <p className="text-3xl xl:text-4xl font-black text-white mb-0.5">99.9%</p>
                   <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest leading-none">{t("bento.satisfaction.desc")}</p>
                </div>
             </motion.div>

             {/* Image/Quote Card - Grayscale removed, height/layout optimized for 15-inch screen sizes */}
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ y: -4, borderColor: "rgba(74, 222, 128, 0.3)" }}
                viewport={{ once: true }}
                className="md:col-span-2 lg:col-span-3 lg:row-span-1 rounded-[2.5rem] relative overflow-hidden border border-white/10 group text-left min-h-[220px] lg:min-h-auto"
             >
                {/* Grayscale filter removed from background image */}
                <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-all duration-1000" alt="Worker profile highlight" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 xl:bottom-6 xl:left-6 xl:right-6 bg-black/75 backdrop-blur-2xl border border-white/10 p-5 xl:p-6 rounded-[2rem] shadow-lg">
                   <p className="text-base xl:text-xl font-black tracking-tighter text-white mb-1 uppercase">{t("bento.quote")}</p>
                   <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest leading-normal">{t("bento.quote.desc")}</p>
                </div>
             </motion.div>

          </div>
       </div>
    </section>
  );
}
