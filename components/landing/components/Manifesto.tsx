"use client";
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export const Manifesto: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.001
  });

  const scrollRotate = useTransform(smoothProgress, [0, 1], [-25, 40]);
  const scrollScale = useTransform(smoothProgress, [0, 0.5, 1], [0.9, 1.05, 0.95]);

  return (
    <section
      ref={sectionRef}
      id="manifesto-section"
      className="py-[100px] sm:py-[140px] md:py-[180px] px-4 md:px-10 max-w-[1728px] mx-auto relative flex flex-col items-center text-center bg-[#FAF9F5] overflow-hidden"
    >
      {/* Exact wireframe globe SVG in sunset gradient with scroll-driven dynamic rotation */}
      <motion.div 
        style={{ rotate: scrollRotate, scale: scrollScale }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.25 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 right-[5%] md:right-[10%] w-[320px] md:w-[400px] h-[320px] md:h-[400px] pointer-events-none select-none"
      >
        <svg className="w-full h-full animate-[spin_80s_linear_infinite]" fill="none" stroke="url(#manifesto-grad)" strokeWidth="0.5" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="manifesto-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF416C" />
              <stop offset="100%" stopColor="#FF4B2B" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" />
          <ellipse cx="50" cy="50" rx="24" ry="48" />
          <ellipse cx="50" cy="50" rx="48" ry="24" />
          <line x1="2" x2="98" y1="50" y2="50" />
          <line x1="50" x2="50" y1="2" y2="98" />
        </svg>
      </motion.div>

      <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#FF416C] mb-4 block relative z-10">
        {t.manifesto.tag}
      </span>

      <motion.h2 
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="font-sans text-[28px] sm:text-[38px] md:text-[46px] leading-[1.2] md:leading-[1.15] text-balance tracking-tight text-[#1B1B1B] relative z-10 max-w-[1000px] font-bold mb-6"
      >
        {t.manifesto.title}
      </motion.h2>

      <p className="font-sans text-sm sm:text-base md:text-lg text-[#666] leading-relaxed max-w-2xl relative z-10 font-normal">
        {t.manifesto.p2}
      </p>
    </section>
  );
};

