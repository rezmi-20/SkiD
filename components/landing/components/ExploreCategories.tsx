"use client";
import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface CategoryItem {
  id: string;
  num: string;
  name: string;
  fullName: string;
  description: string;
  highlights: string[];
  rate: string;
  workersCount: number;
  image: string;
  fallback: string;
  districts: string;
}

interface ScatteredCard {
  id: string;
  categoryIndex: number;
  top: string;
  left: string;
  rotate: string;
  zIndex: number;
}

interface ExploreCategoriesProps {
  onFindWorker?: () => void;
}

export const ExploreCategories: React.FC<ExploreCategoriesProps> = ({ onFindWorker }) => {
  const { t } = useLanguage();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);

  const categoryImages = [
    { image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop', fallback: '/images/user_review_card.jpg', highlights: ['Circuit diagnostics', 'Solar inverter setup', 'Breaker panel rewiring'] },
    { image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop', fallback: '/images/user_contract_card.jpg', highlights: ['Overhead water tanks', 'PVC leak repairs', 'Hydraulic booster pumps'] },
    { image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop', fallback: '/images/diredawa_city.jpg', highlights: ['Gypsum false ceilings', 'Ceramic tile leveling', 'Stucco plastering'] },
    { image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop', fallback: '/images/diredawa_street.jpg', highlights: ['Weather-shield exterior', 'Interior emulsion', 'Stucco & gloss trim'] },
    { image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop', fallback: '/images/user_location_card.jpg', highlights: ['Nilesat & Yahsat alignment', 'High-gain LNB calibration', 'Multi-room decoders'] },
    { image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop', fallback: '/images/user_fayda_card.jpg', highlights: ['Custom carpentry', 'Security lock fittings', 'Masonry & welding repairs'] }
  ];

  const categories: CategoryItem[] = t.categories.list.map((item, idx) => ({
    id: item.id,
    num: item.num,
    name: item.name,
    fullName: item.fullName,
    description: item.description,
    highlights: categoryImages[idx]?.highlights || [],
    rate: item.rate,
    workersCount: item.workersCount,
    districts: item.districts,
    image: categoryImages[idx]?.image || '/images/user_fayda_card.jpg',
    fallback: categoryImages[idx]?.fallback || '/images/diredawa_city.jpg'
  }));

  const scatteredCards: ScatteredCard[] = [
    { id: 'sc-1', categoryIndex: 0, top: '2%', left: '4%', rotate: '-9deg', zIndex: 11 },
    { id: 'sc-2', categoryIndex: 1, top: '0%', left: '54%', rotate: '12deg', zIndex: 12 },
    { id: 'sc-3', categoryIndex: 2, top: '12%', left: '26%', rotate: '-6deg', zIndex: 13 },
    { id: 'sc-4', categoryIndex: 3, top: '8%', left: '70%', rotate: '15deg', zIndex: 14 },
    { id: 'sc-5', categoryIndex: 4, top: '22%', left: '2%', rotate: '7deg', zIndex: 15 },
    { id: 'sc-6', categoryIndex: 5, top: '25%', left: '48%', rotate: '-13deg', zIndex: 16 },
    { id: 'sc-7', categoryIndex: 0, top: '34%', left: '72%', rotate: '6deg', zIndex: 17 },
    { id: 'sc-8', categoryIndex: 1, top: '42%', left: '14%', rotate: '-8deg', zIndex: 18 },
    { id: 'sc-9', categoryIndex: 2, top: '45%', left: '56%', rotate: '-14deg', zIndex: 19 },
    { id: 'sc-10', categoryIndex: 3, top: '56%', left: '32%', rotate: '10deg', zIndex: 20 },
    { id: 'sc-11', categoryIndex: 4, top: '62%', left: '2%', rotate: '-7deg', zIndex: 21 },
    { id: 'sc-12', categoryIndex: 5, top: '68%', left: '62%', rotate: '13deg', zIndex: 22 },
    { id: 'sc-13', categoryIndex: 0, top: '74%', left: '24%', rotate: '8deg', zIndex: 23 },
    { id: 'sc-14', categoryIndex: 1, top: '76%', left: '48%', rotate: '-12deg', zIndex: 24 },
    { id: 'sc-15', categoryIndex: 2, top: '2%', left: '34%', rotate: '5deg', zIndex: 10 },
    { id: 'sc-16', categoryIndex: 3, top: '28%', left: '18%', rotate: '-15deg', zIndex: 14 },
    { id: 'sc-17', categoryIndex: 4, top: '48%', left: '36%', rotate: '4deg', zIndex: 18 },
    { id: 'sc-18', categoryIndex: 5, top: '78%', left: '6%', rotate: '-6deg', zIndex: 22 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategoryIndex((prev) => (prev + 1) % 6);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const currentCat = categories[activeCategoryIndex];

  return (
    <section id="categories" className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 md:px-10 max-w-[1728px] mx-auto bg-[#FAF9F5] border-t border-[#E8E6DF] relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15, margin: "-40px" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mb-8 sm:mb-12 md:mb-16 will-change-transform"
      >
        <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#00E575] mb-2 sm:mb-3 block">
          {t.categories.tag}
        </span>
        <h2 className="font-sans text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1B1B1B] leading-[1.15] mb-3 sm:mb-4">
          {t.categories.title}
        </h2>
        <p className="text-xs xs:text-sm sm:text-base md:text-lg text-[#666] leading-relaxed max-w-2xl font-normal">
          {t.categories.subtitle}
        </p>
      </motion.div>

      {/* MOBILE ONLY: Clean Shrunk Navigation Card with Background Image */}
      <div className="block lg:hidden w-full mb-6">
        <motion.div
          key={currentCat.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[24px] overflow-hidden min-h-[230px] xs:min-h-[260px] sm:min-h-[290px] flex flex-col justify-between p-4 xs:p-5 sm:p-6 border border-white/20 shadow-xl"
        >
          {/* Background Image */}
          <img
            src={currentCat.image}
            alt={currentCat.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== currentCat.fallback) {
                target.src = currentCat.fallback;
              }
            }}
          />

          {/* Smooth High-Contrast Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/40 pointer-events-none" />

          {/* Card Top: Number, Verified Badge, Rate */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 xs:gap-2">
              <span
                style={{ fontFamily: "'Roboto', sans-serif" }}
                className="text-[11px] xs:text-xs font-black text-white px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25"
              >
                0{currentCat.num} / 06
              </span>
              <span className="text-[9px] xs:text-[10px] font-mono font-bold text-[#00E575] bg-[#00E575]/15 border border-[#00E575]/30 px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            </div>

            <span className="text-[10px] xs:text-[11px] font-mono font-bold text-white bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/15">
              {currentCat.rate}
            </span>
          </div>

          {/* Card Center: Title & Description (Shrunk & crisp) */}
          <div className="relative z-10 my-2 xs:my-3">
            <span className="text-[9px] xs:text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider block mb-0.5">
              {currentCat.fullName}
            </span>
            <h3 className="font-sans text-lg xs:text-xl sm:text-2xl font-black text-white mb-1 leading-tight drop-shadow-sm">
              {currentCat.name}
            </h3>
            <p className="text-[11px] xs:text-xs sm:text-sm text-white/85 line-clamp-2 leading-relaxed drop-shadow-xs">
              {currentCat.description}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] xs:text-[11px] font-mono text-white/70 mt-1.5">
              <MapPin size={11} className="text-[#00E575] shrink-0" />
              <span className="truncate">{currentCat.districts}</span>
            </div>
          </div>

          {/* Card Bottom: Navigation Arrows + Action Button */}
          <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-white/15">
            {/* Prev/Next arrows & count */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategoryIndex(prev => (prev > 0 ? prev - 1 : categories.length - 1))}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer border border-white/25 active:scale-95"
                aria-label="Previous Category"
              >
                <ArrowLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryIndex(prev => (prev < categories.length - 1 ? prev + 1 : 0))}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer border border-white/25 active:scale-95"
                aria-label="Next Category"
              >
                <ArrowRight size={13} />
              </button>
              <span className="text-[10px] xs:text-[11px] font-mono text-white/70 ml-1">
                {currentCat.workersCount} Pros
              </span>
            </div>

            {/* Hire Button */}
            {onFindWorker && (
              <button
                type="button"
                onClick={onFindWorker}
                className="bg-[#00E575] hover:bg-[#00C865] text-black font-extrabold text-[11px] xs:text-xs uppercase tracking-wider px-3.5 py-2 rounded-full inline-flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
              >
                <span>Hire Now</span>
                <ArrowRight size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Clean Mobile Category Switcher Chips (Horizontal Scrollable, avoids cluttered card grid) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5 px-0.5 mt-2">
          {categories.map((cat, idx) => {
            const isSelected = activeCategoryIndex === idx;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryIndex(idx)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono font-medium transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B1B1B] text-[#00E575] border-[#1B1B1B] shadow-xs scale-[1.02]'
                    : 'bg-white text-[#666] border-[#E2E0D8] hover:border-[#1B1B1B]'
                }`}
              >
                0{cat.num} {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* DESKTOP ONLY: 18 Scattered Cards Deck (strictly hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 22 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block lg:col-span-6 relative w-full h-[580px] sm:h-[640px] select-none bg-transparent transform-gpu will-change-transform"
        >
          {scatteredCards.map((sc) => {
            const cat = categories[sc.categoryIndex];
            const isActiveCategory = activeCategoryIndex === sc.categoryIndex;
            const isPrimaryActive = isActiveCategory && scatteredCards.findIndex(c => c.categoryIndex === sc.categoryIndex) === scatteredCards.indexOf(sc);

            if (isActiveCategory && !isPrimaryActive) {
              return (
                <div
                  key={sc.id}
                  style={{
                    position: 'absolute',
                    top: sc.top,
                    left: sc.left,
                    transform: `rotate(${sc.rotate})`,
                    width: '165px',
                    height: '110px',
                    zIndex: sc.zIndex,
                    opacity: 0.35,
                    transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
                  }}
                  className="rounded-[20px] overflow-hidden border border-white/40 shadow-sm pointer-events-none"
                >
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60" />
                </div>
              );
            }

            return (
              <div
                key={sc.id}
                onClick={() => setActiveCategoryIndex(sc.categoryIndex)}
                style={{
                  position: 'absolute',
                  top: isPrimaryActive ? '50%' : sc.top,
                  left: isPrimaryActive ? '50%' : sc.left,
                  transform: isPrimaryActive
                    ? 'translate(-50%, -50%) rotate(0deg)'
                    : `rotate(${sc.rotate})`,
                  width: isPrimaryActive ? 'min(92%, 440px)' : '165px',
                  height: isPrimaryActive ? '310px' : '110px',
                  zIndex: isPrimaryActive ? 50 : sc.zIndex,
                  transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
                className={`rounded-[22px] overflow-hidden cursor-pointer ${
                  isPrimaryActive
                    ? 'border-2 border-white/95 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.55)] ring-1 ring-black/10'
                    : 'border border-white/80 shadow-md hover:shadow-xl hover:scale-110 hover:z-30 hover:border-white'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== cat.fallback) {
                      target.src = cat.fallback;
                    }
                  }}
                />

                <div className={`absolute inset-0 transition-opacity duration-300 ${
                  isPrimaryActive ? 'bg-gradient-to-t from-black via-black/70 to-black/30' : 'bg-gradient-to-t from-black/90 via-black/40 to-transparent'
                }`} />

                {isPrimaryActive ? (
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#00E575] font-bold">
                        {cat.fullName}
                      </span>
                      <span className="text-xs font-mono font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-white">
                        {cat.rate}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mb-3">
                        {cat.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono">
                        <MapPin size={13} className="text-[#00E575]" />
                        <span>{cat.districts}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                      {onFindWorker && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFindWorker();
                          }}
                          className="font-bold text-white hover:text-[#00E575] uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Hire {cat.name}</span>
                          <ArrowRight size={13} />
                        </button>
                      )}

                      <span className="text-[11px] font-mono text-white/50">
                        Category {cat.num} / 6
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 p-2.5 h-full flex flex-col justify-between text-white pointer-events-none">
                    <div className="flex items-center justify-between">
                      <span
                        style={{ fontFamily: "'Roboto', sans-serif" }}
                        className="text-sm font-black text-white drop-shadow-md"
                      >
                        {cat.num}
                      </span>
                      <span className="text-[9px] font-mono text-white/80 bg-black/60 px-1 py-0.2 rounded">
                        {cat.rate}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-sans text-[11px] sm:text-xs font-bold text-white drop-shadow-md leading-tight line-clamp-1">
                        {cat.name}
                      </h4>
                      <span className="text-[9px] text-white/70 block font-mono">
                        {cat.workersCount} Pros
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* DESKTOP ONLY: Categories Selector Grid (hidden on mobile, replaced by shrunk navigation card with bg image) */}
        <div className="hidden lg:grid lg:col-span-6 grid-cols-2 gap-3.5">
          {categories.map((cat, index) => {
            const isActive = activeCategoryIndex === index;
            return (
              <motion.button
                key={cat.id}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1, margin: "-20px" }}
                transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setActiveCategoryIndex(index)}
                className={`p-5 rounded-[22px] border text-left transition-all duration-300 flex flex-col justify-between min-h-[130px] cursor-pointer touch-manipulation transform-gpu ${
                  isActive
                    ? 'bg-[#1B1B1B] text-white border-[#1B1B1B] shadow-md -translate-y-0.5'
                    : 'bg-white hover:bg-[#F4F3EE] text-[#1B1B1B] border-[#E2E0D8] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between w-full mb-2">
                  <span
                    style={{ fontFamily: "'Roboto', sans-serif" }}
                    className={`text-2xl font-black shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-[#8C8880]'
                    }`}
                  >
                    0{cat.num}
                  </span>

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isActive
                        ? 'bg-white text-black translate-x-0.5'
                        : 'bg-[#F0EFEB] text-[#8C8880]'
                    }`}
                  >
                    <ArrowRight size={12} />
                  </div>
                </div>

                <div>
                  <h4 className="font-sans text-lg font-bold leading-snug mb-0.5 line-clamp-1">
                    {cat.name}
                  </h4>
                  <span className={`text-xs block font-mono ${isActive ? 'text-white/60' : 'text-[#8C8880]'}`}>
                    {cat.rate}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

