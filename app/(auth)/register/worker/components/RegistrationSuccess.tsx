"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function RegistrationSuccess() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#09090b] text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] space-y-10 text-center"
      >
        <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center shadow-xl mx-auto mb-6">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
           </svg>
        </div>
        <div className="space-y-4">
           <h2 className="text-4xl font-bold tracking-tight">{t("register.success.title")}</h2>
           <p className="text-zinc-400 font-medium leading-relaxed">
             {t("register.success.message")}
           </p>
        </div>
        <button 
          onClick={() => router.push("/login")}
          className="w-full h-14 bg-green-400 text-black rounded-full font-bold text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-green-400/20"
        >
          {t("register.success.button")}
        </button>
      </motion.div>
    </div>
  );
}
