"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export const TrustMarquee: React.FC = () => {
  const { t } = useLanguage();

  const marqueeItems = [
    t.trustStrip.fayda,
    t.trustStrip.chapa,
    t.trustStrip.contract,
    t.trustStrip.reviews,
    t.trustStrip.districts,
    t.trustStrip.tagline
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "-40px" }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="py-12 md:py-16 px-4 md:px-10 border-t border-[#D9D7D0]/40 max-w-[1728px] mx-auto flex flex-col items-center bg-[#FAF9F5] relative z-0 pt-[40px] will-change-transform"
    >
      <p className="text-[11px] font-semibold text-[#8C8880] mb-8 uppercase tracking-widest text-center">
        {t.trustStrip.tagline}
      </p>

      <div className="flex justify-center items-center opacity-100 text-[#8C8880] w-full">
        <div className="marquee-container touch-pan-y">
          <div className="marquee-content animate-marquee flex gap-[70px] md:gap-[100px] items-center text-[#8C8880] touch-pan-y">
            {marqueeItems.map((item, i) => (
              <span
                key={`item-1-${i}`}
                className="text-2xl md:text-3xl font-semibold tracking-tight hover:text-[#1B1B1B] hover:opacity-100 transition-all duration-300 cursor-default whitespace-nowrap"
              >
                {item}
              </span>
            ))}

            {/* Seamless duplicate loop */}
            {marqueeItems.map((item, i) => (
              <span
                key={`item-2-${i}`}
                className="text-2xl md:text-3xl font-semibold tracking-tight hover:text-[#1B1B1B] hover:opacity-100 transition-all duration-300 cursor-default whitespace-nowrap"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

