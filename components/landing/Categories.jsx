"use client";
import { motion } from "framer-motion";

const categories = [
  { id: 'electrician', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { id: 'plumber', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { id: 'painter', image: 'https://images.unsplash.com/photo-1589939705384-5185138a04b9?auto=format&fit=crop&q=80&w=800', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg> },
  { id: 'satellite_dish', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  { id: 'house_finishing', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'other', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> }
];

export default function Categories({ t }) {
  return (
    <section id="services" className="py-32 px-6 md:px-12 lg:px-20 bg-[#09090b]">
      <div className="max-w-[95%] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase mb-6 leading-[0.9]">
              EXPLORE <span className="text-green-400 italic">CATEGORIES</span>
            </h2>
            <p className="text-zinc-500 text-lg md:text-xl font-medium">
              The city's most trusted professionals, sorted by expertise.
            </p>
          </div>
          <a href="/client/search" className="bg-white/5 border border-white/10 text-white px-8 h-14 flex items-center justify-center rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-xl">
            View All Services →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[220px]">
          {categories.map((cat, i) => {
            // Define specific spans for a "Bento" look
            let spans = "col-span-1 row-span-1";
            if (i === 0) spans = "md:col-span-2 md:row-span-2"; // Featured
            if (i === 1) spans = "md:col-span-2 md:row-span-1"; // Wide
            if (i === 4) spans = "md:col-span-2 md:row-span-1"; // Wide bottom

            return (
              <motion.a
                key={cat.id}
                href={`/client/search?category=${cat.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
                className={`relative group rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0c0c0e] shadow-2xl ${spans}`}
              >
                <img 
                  src={cat.image} 
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out" 
                  alt={cat.id} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                   <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                   <span className="text-[8px] font-black text-white uppercase tracking-widest">Active Pros</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                   <div className={`flex items-end justify-between ${i === 0 ? 'mb-4' : 'mb-2'}`}>
                      <div className="space-y-1">
                         <h3 className={`${i === 0 ? 'text-3xl' : 'text-xl'} font-black text-white uppercase tracking-tighter leading-none`}>
                            {t(`categories.${cat.id}`)}
                         </h3>
                         <p className="text-[9px] font-black text-green-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500">
                            Discover Experts →
                         </p>
                      </div>
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white group-hover:bg-green-400 group-hover:text-black transition-all duration-500">
                         {cat.icon}
                      </div>
                   </div>
                </div>

                {/* Interactive Overlay */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-400/20 rounded-[2.5rem] transition-all duration-700 pointer-events-none" />
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
