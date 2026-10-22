"use client";
import React from 'react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface BrandOSProps {
  onOpenContract?: () => void;
  onFindWorker?: () => void;
}

export const BrandOS: React.FC<BrandOSProps> = ({ onOpenContract, onFindWorker }) => {
  const { t } = useLanguage();

  const processSteps = [
    {
      num: '01',
      tag: t.howItWorks.steps.step1.tag,
      title: t.howItWorks.steps.step1.title,
      desc: t.howItWorks.steps.step1.desc,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyCMUUsCVn0iP3IpEC0Uyqrrz1kCetYocyS5tkXJE7cg&s=10',
      fallback: '/images/user_location_card.jpg',
      footerAction: t.howItWorks.steps.step1.action,
      actionType: 'find'
    },
    {
      num: '02',
      tag: t.howItWorks.steps.step2.tag,
      title: t.howItWorks.steps.step2.title,
      desc: t.howItWorks.steps.step2.desc,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4SlQN6JXWJVlQC2mmWu_qvy2-QWQOXRnLvQpgry-XDw&s=10',
      fallback: '/images/user_contract_card.jpg',
      footerAction: t.howItWorks.steps.step2.action,
      actionType: 'contract'
    },
    {
      num: '03',
      tag: t.howItWorks.steps.step3.tag,
      title: t.howItWorks.steps.step3.title,
      desc: t.howItWorks.steps.step3.desc,
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
      fallback: '/images/diredawa_street.jpg',
      footerAction: t.howItWorks.steps.step3.action,
      actionType: 'info'
    },
    {
      num: '04',
      tag: t.howItWorks.steps.step4.tag,
      title: t.howItWorks.steps.step4.title,
      desc: t.howItWorks.steps.step4.desc,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaukVC76TqnKuvpMbYJb4EoWhm6Vill9uT_idSQ1kUbg&s=10',
      fallback: '/images/user_chapa_card.jpg',
      footerAction: t.howItWorks.steps.step4.action,
      actionType: 'info'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 md:px-10 max-w-[1728px] mx-auto bg-[#FAF9F5] relative">
      <span id="contracts-payments" className="absolute -top-28 pointer-events-none" />

      {/* Clean Section Header with scroll reveal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15, margin: "-40px" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mb-12 sm:mb-16 will-change-transform"
      >
        <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#00E575] mb-2 sm:mb-3 block">
          {t.howItWorks.tag}
        </span>
        <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1B1B1B] leading-[1.1] mb-4">
          {t.howItWorks.title}
        </h2>
        <p className="text-base sm:text-lg text-[#666] leading-relaxed max-w-2xl font-normal">
          {t.howItWorks.subtitle}
        </p>
      </motion.div>

      {/* Process Cards Grid with Staggered Scroll Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {processSteps.map((step, index) => {
          return (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 26, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.12, margin: "-30px" }}
              transition={{
                duration: 0.85,
                delay: index * 0.09,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="group relative rounded-[24px] sm:rounded-[32px] overflow-hidden bg-[#111] border border-black/10 shadow-lg min-h-[250px] xs:min-h-[280px] sm:min-h-[360px] lg:min-h-[440px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl transform-gpu will-change-transform"
            >
              {/* Background Image */}
              <img
                src={step.image}
                alt={step.title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== step.fallback) {
                    target.src = step.fallback;
                  }
                }}
              />

              {/* High-Contrast Gradient Backdrop ensuring text is very visible */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/45 pointer-events-none" />

              {/* Card Top: Number and Stage Tag */}
              <div className="relative z-10 p-4 xs:p-5 sm:p-7 flex items-center justify-between">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {step.num}
                </span>
                <span className="font-mono text-[10px] sm:text-xs font-bold text-white/90 uppercase tracking-widest bg-black/60 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md border border-white/20 backdrop-blur-sm">
                  {step.tag}
                </span>
              </div>

              {/* Card Bottom: Visible Content */}
              <div className="relative z-10 p-4 xs:p-5 sm:p-7 pt-0">
                <h3 className="font-sans text-lg xs:text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 leading-tight drop-shadow-md">
                  {step.title}
                </h3>

                <p className="text-xs xs:text-sm text-white/90 leading-relaxed font-normal mb-3 sm:mb-5 line-clamp-3 sm:line-clamp-none drop-shadow-sm">
                  {step.desc}
                </p>

                {/* Bottom Action / Indicator */}
                <div className="pt-3 sm:pt-4 border-t border-white/20 flex items-center justify-between">
                  {step.actionType === 'find' && onFindWorker && (
                    <button
                      type="button"
                      onClick={onFindWorker}
                      className="text-[11px] sm:text-xs font-bold text-white hover:text-[#FF416C] uppercase tracking-wider inline-flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{step.footerAction}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}

                  {step.actionType === 'contract' && onOpenContract && (
                    <button
                      type="button"
                      onClick={onOpenContract}
                      className="text-[11px] sm:text-xs font-bold text-white hover:text-[#FF416C] uppercase tracking-wider inline-flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{step.footerAction}</span>
                      <ArrowUpRight size={13} />
                    </button>
                  )}

                  {step.actionType === 'info' && (
                    <div className="text-[11px] sm:text-xs font-semibold text-white/80 flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500/80 text-white flex items-center justify-center text-[9px] sm:text-[10px]">
                        <Check size={9} />
                      </span>
                      <span>{step.footerAction}</span>
                    </div>
                  )}

                  <span className="font-mono text-[10px] sm:text-xs text-white/50">
                    Step {step.num}/04
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

