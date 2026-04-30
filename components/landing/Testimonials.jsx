"use client";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Ahmed Tesfaye", role: "Property Manager", text: "DireSkill has completely changed how I manage my buildings. Finding a verified plumber in minutes is a lifesaver.", avatar: "A" },
  { name: "Muna Ibrahim", role: "Home Owner", text: "I used to worry about safety when hiring workers. Now with the digital contract and identity verification, I feel 100% secure.", avatar: "M" },
  { name: "Dawit Berhanu", role: "Business Owner", text: "The quality of professionals on this platform is unmatched. Efficient, verified, and professional every time.", avatar: "D" },
  { name: "Selamawit G.", role: "Store Manager", text: "Fastest way to get an electrician in Kezira. The rating system really helps in choosing the right person.", avatar: "S" },
  { name: "Yonas B.", role: "Restaurant Owner", text: "The house finishing work I got through DireSkill was exceptional. Clean, professional, and on time.", avatar: "Y" },
  { name: "Hana T.", role: "School Director", text: "Finally, a marketplace where workers are verified. It gives me peace of mind for all our school maintenance.", avatar: "H" }
];

export default function Testimonials() {
  return (
    <section className="py-40 bg-[#09090b] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute top-1/2 left-0 w-full h-px bg-green-400" />
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-24 text-center">
        <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.9]">
          WHAT OUR <span className="text-green-400 italic">CLIENTS</span> SAY
        </h2>
        <p className="text-zinc-500 text-lg md:text-xl font-medium mt-6">
          Building trust across Dire Dawa, one successful job at a time.
        </p>
      </div>

      <div className="relative flex overflow-hidden group/marquee">
         <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
               duration: 40, 
               repeat: Infinity, 
               ease: "linear" 
            }}
            className="flex gap-8 whitespace-nowrap py-10"
         >
            {[...testimonials, ...testimonials, ...testimonials].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10, scale: 1.02 }}
                className="w-[450px] flex-shrink-0 bg-[#0c0c0e] border border-white/5 p-12 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between group/card transition-all duration-500 hover:border-green-400/20 hover:bg-zinc-900/50 backdrop-blur-xl"
              >
                <div className="mb-12">
                  <div className="flex gap-1.5 mb-8 opacity-40 group-hover/card:opacity-100 transition-opacity duration-500">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-zinc-400 text-xl font-medium leading-relaxed italic whitespace-normal tracking-tight">
                    "{item.text}"
                  </p>
                </div>
                <div className="flex items-center gap-6 pt-10 border-t border-white/5">
                  <div className="w-16 h-16 rounded-2xl bg-green-400 flex items-center justify-center font-black text-black text-2xl shadow-[0_10px_30px_rgba(74,222,128,0.2)] group-hover/card:scale-110 transition-transform duration-500">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-lg font-black text-white uppercase tracking-tight">{item.name}</p>
                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.2em]">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
         </motion.div>
         
         {/* Gradient Overlays for smooth edges */}
         <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
         <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
}
