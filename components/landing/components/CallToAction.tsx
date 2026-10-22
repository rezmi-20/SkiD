"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface CallToActionProps {
  onFindWorker: () => void;
  onJoinPro: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({ onFindWorker, onJoinPro }) => {
  const { t } = useLanguage();

  return (
    <section className="py-[120px] md:py-[160px] px-4 md:px-10 bg-[#FAF9F5] overflow-hidden">
      <div className="max-w-screen-xl mx-auto flex flex-col items-center text-center">
        <div className="relative z-10 flex flex-col items-center">
          {/* Monogram circle with scroll entrance animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -25 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.15, margin: "-40px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-12 h-12 rounded-full border border-[#1B1B1B] flex items-center justify-center mb-12 hover:scale-105 transition-transform will-change-transform"
          >
            <span className="text-[#1B1B1B] font-bold text-xl leading-none font-sans">D</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15, margin: "-40px" }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-[44px] sm:text-[60px] md:text-[80px] font-bold text-[#1B1B1B] tracking-tighter leading-[1.05] mb-12 max-w-4xl text-balance will-change-transform"
          >
            {t.cta.title}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15, margin: "-40px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-5 will-change-transform"
          >
            <button
              onClick={onFindWorker}
              className="bg-black text-white font-sans rounded-full hover:bg-[#181818] transition-all duration-300 shrink-0 flex items-center justify-center px-7 text-[10px] h-[42px] font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              {t.cta.findWorker}
            </button>
            <button
              onClick={onJoinPro}
              className="bg-transparent border border-[#1B1B1B]/30 text-[#1B1B1B] font-sans rounded-full hover:bg-[#1B1B1B] hover:text-white transition-all duration-300 shrink-0 flex items-center justify-center px-7 text-[10px] h-[42px] font-bold uppercase tracking-wider hover:scale-105 active:scale-95 cursor-pointer"
            >
              {t.cta.joinPro}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

