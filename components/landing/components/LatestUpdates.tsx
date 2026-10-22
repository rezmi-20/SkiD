"use client";
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface LatestUpdatesProps {
  onFindWorker?: () => void;
  onSelectArticle?: (article: any) => void;
}

export const LatestUpdates: React.FC<LatestUpdatesProps> = ({ onFindWorker }) => {
  const { t } = useLanguage();

  const cardImages = [
    { image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop', fallback: '/images/diredawa_street.jpg' },
    { image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&auto=format&fit=crop', fallback: '/images/user_fayda_card.jpg' },
    { image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop', fallback: '/images/user_contract_card.jpg' },
    { image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop', fallback: '/images/user_chapa_card.jpg' }
  ];

  const cards = t.latestUpdates.cards.map((c, idx) => ({
    num: c.num,
    badge: c.badge,
    problem: c.problem,
    solution: c.solution,
    benefit: c.benefit,
    image: cardImages[idx]?.image || '/images/user_fayda_card.jpg',
    fallback: cardImages[idx]?.fallback || '/images/diredawa_street.jpg'
  }));

  return (
    <section className="py-24 md:py-32 px-4 md:px-10 max-w-[1728px] mx-auto bg-[#FAF9F5] border-t border-[#E8E6DF]">
      {/* Section Header with scroll reveal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15, margin: "-40px" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mb-14 md:mb-18 will-change-transform"
      >
        <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1B1B1B] leading-[1.15] mb-4">
          {t.latestUpdates.title}
        </h2>
        <p className="text-base sm:text-lg text-[#666] leading-relaxed max-w-2xl font-normal">
          {t.latestUpdates.subtitle}
        </p>
      </motion.div>

      {/* 4 Cards Grid - Clean, Cinematic Design matching the reference image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.num}
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.12, margin: "-30px" }}
            transition={{
              duration: 0.85,
              delay: index * 0.09,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="rounded-[24px] sm:rounded-[36px] overflow-hidden relative shadow-xl min-h-[290px] xs:min-h-[330px] sm:min-h-[420px] lg:min-h-[520px] flex flex-col justify-between p-4 xs:p-5 sm:p-8 group transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl border border-white/10 cursor-default transform-gpu will-change-transform"
          >
            {/* Cinematic Background Image */}
            <img
              src={card.image}
              alt={card.solution}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== card.fallback) {
                  target.src = card.fallback;
                }
              }}
            />

            {/* Smooth Cinematic Gradient for Stark Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/45 pointer-events-none" />

            {/* Top Bar: Number + Clean Category Tag */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                {card.num}
              </span>

              <span className="text-[10px] sm:text-[11px] font-mono font-medium text-white/70 tracking-wider">
                {card.badge}
              </span>
            </div>

            {/* Content Body: Problem, Solution, Benefit cleanly integrated inside the card */}
            <div className="relative z-10 my-auto py-2 sm:py-6 space-y-2.5 sm:space-y-4">
              {/* Problem */}
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] text-white/50 block mb-0.5 sm:mb-1 font-bold">
                  Problem
                </span>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-normal line-clamp-2 sm:line-clamp-none">
                  {card.problem}
                </p>
              </div>

              {/* Solution (Main Headline) */}
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] text-[#00E575] block mb-0.5 sm:mb-1 font-bold">
                  Solution
                </span>
                <h3 className="font-sans text-base xs:text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-md">
                  {card.solution}
                </h3>
              </div>

              {/* Benefit */}
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] text-white/50 block mb-0.5 sm:mb-1 font-bold">
                  Benefit
                </span>
                <p className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed drop-shadow-sm line-clamp-1 sm:line-clamp-none">
                  {card.benefit}
                </p>
              </div>
            </div>

            {/* Bottom Bar: Frosted Glass Pill Button matching the attached reference image */}
            <div className="relative z-10 pt-2.5 sm:pt-4 flex items-center justify-between border-t border-white/10 sm:border-t-0">
              <button
                type="button"
                onClick={onFindWorker}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ArrowUpRight size={13} className="text-white" />
                <span>Find Solution</span>
              </button>

              <span className="text-[10px] sm:text-[11px] font-mono text-white/45">
                DireSkill Verified
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

