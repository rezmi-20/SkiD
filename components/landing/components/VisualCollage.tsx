"use client";
import React from 'react';
import { ShieldCheck, CreditCard, FileCheck, Star, MapPin, ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface VisualCollageProps {
  onExplore?: (code: string) => void;
}

export const VisualCollage: React.FC<VisualCollageProps> = ({ onExplore }) => {
  const { t } = useLanguage();

  const trustCards = [
    {
      code: 'FAYDA ID',
      title: t.trustCollage.cards.fayda.title,
      desc: t.trustCollage.cards.fayda.desc,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQIQdo3UzHSi3p4vcS88ZFpwEyVWatJA5oPoj_oqOG1Q&s=10',
      fallback: '/images/user_fayda_card.jpg',
      badge: t.trustCollage.cards.fayda.badge,
      tagColor: 'text-blue-300 bg-blue-950/80 border-blue-400/50',
      icon: <ShieldCheck size={16} className="text-blue-400" />
    },
    {
      code: 'CHAPA',
      title: t.trustCollage.cards.chapa.title,
      desc: t.trustCollage.cards.chapa.desc,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaukVC76TqnKuvpMbYJb4EoWhm6Vill9uT_idSQ1kUbg&s=10',
      fallback: '/images/user_chapa_card.jpg',
      badge: t.trustCollage.cards.chapa.badge,
      tagColor: 'text-emerald-300 bg-emerald-950/80 border-emerald-400/50',
      icon: <CreditCard size={16} className="text-emerald-400" />
    },
    {
      code: 'CONTRACTS',
      title: t.trustCollage.cards.contracts.title,
      desc: t.trustCollage.cards.contracts.desc,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4SlQN6JXWJVlQC2mmWu_qvy2-QWQOXRnLvQpgry-XDw&s=10',
      fallback: '/images/user_contract_card.jpg',
      badge: t.trustCollage.cards.contracts.badge,
      tagColor: 'text-purple-300 bg-purple-950/80 border-purple-400/50',
      icon: <FileCheck size={16} className="text-purple-400" />
    },
    {
      code: 'REVIEWS',
      title: t.trustCollage.cards.reviews.title,
      desc: t.trustCollage.cards.reviews.desc,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe1TIwJe09geCA2JnPIChRh7vfyYcDAFiLaaZ3yQS0qw&s=10',
      fallback: '/images/user_review_card.jpg',
      badge: t.trustCollage.cards.reviews.badge,
      tagColor: 'text-amber-300 bg-amber-950/80 border-amber-400/50',
      icon: <Star size={16} className="text-amber-400 fill-amber-400" />
    },
    {
      code: 'LOCATION',
      title: t.trustCollage.cards.location.title,
      desc: t.trustCollage.cards.location.desc,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyCMUUsCVn0iP3IpEC0Uyqrrz1kCetYocyS5tkXJE7cg&s=10',
      fallback: '/images/user_location_card.jpg',
      badge: t.trustCollage.cards.location.badge,
      tagColor: 'text-rose-300 bg-rose-950/80 border-rose-400/50',
      icon: <MapPin size={16} className="text-rose-400" />
    }
  ];

  const handleCardClick = (code: string) => {
    if (onExplore) {
      onExplore(code);
    }
  };

  return (
    <section className="min-h-0 lg:min-h-[1360px] w-full max-w-[1728px] mx-auto relative overflow-hidden bg-[#FAF9F5] py-12 sm:py-18 md:py-24">
      {/* DESKTOP Central Anchor Title matching floating collage design */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 25 }}
        whileInView={{ opacity: 0.92, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15, margin: "-40px" }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex absolute inset-0 flex-col justify-center items-center pointer-events-none z-0 mt-6 sm:mt-12 px-4 will-change-transform"
      >
        <span className="text-xs sm:text-sm font-bold text-[#FF416C] uppercase tracking-[0.25em] mb-4 font-mono">
          {t.trustCollage.tag}
        </span>
        <h2 className="font-sans text-[44px] sm:text-[68px] md:text-[88px] lg:text-[104px] font-bold text-[#1B1B1B] tracking-tight leading-[1.0] text-center select-none max-w-4xl text-balance">
          {t.trustCollage.title}
        </h2>
      </motion.div>

      {/* MOBILE Clean Section Header */}
      <div className="block lg:hidden px-4 mb-6 sm:mb-8 text-center max-w-xl mx-auto">
        <span className="text-[11px] font-mono font-bold text-[#FF416C] uppercase tracking-[0.2em] mb-1.5 block">
          {t.trustCollage.tag}
        </span>
        <h2 className="font-sans text-2xl xs:text-3xl sm:text-4xl font-bold text-[#1B1B1B] tracking-tight leading-tight">
          {t.trustCollage.title}
        </h2>
      </div>

      {/* DESKTOP 5-CARD FLOATING COLLAGE (lg & xl screens) */}
      <div className="hidden lg:block relative w-full h-[1200px]">
        {/* Card 1: FAYDA ID (Top-Left) */}
        <motion.div
          initial={{ opacity: 0, y: 28, x: -16, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => handleCardClick('FAYDA ID')}
          className="absolute rounded-[32px] overflow-hidden bg-slate-900 border border-white/20 shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group transform-gpu will-change-transform"
          style={{ left: '5%', top: '5%', width: '370px', height: '290px', zIndex: 10 }}
        >
          <img
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            alt="Fayda ID Verified"
            src={trustCards[0].image}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== trustCards[0].fallback) {
                target.src = trustCards[0].fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 pointer-events-none"></div>

          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${trustCards[0].tagColor}`}>
                {trustCards[0].icon}
                <span>{trustCards[0].code}</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-black/60 text-white/90 border border-white/20 backdrop-blur-md">
                {trustCards[0].badge}
              </span>
            </div>

            <div>
              <h3 className="font-sans text-xl font-bold text-white mb-1.5 drop-shadow-sm">
                {trustCards[0].title}
              </h3>
              <p className="text-xs text-white/90 leading-relaxed font-normal mb-3 line-clamp-2">
                {trustCards[0].desc}
              </p>
              <span className="text-xs font-bold text-white uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-[#FF416C] transition-colors">
                <span>Explore Now</span>
                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: CHAPA (Top-Right) */}
        <motion.div
          initial={{ opacity: 0, y: 28, x: 16, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          transition={{ duration: 0.9, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => handleCardClick('CHAPA')}
          className="absolute rounded-[32px] overflow-hidden bg-[#031b13] border-2 border-emerald-500/40 shadow-[0_20px_50px_rgba(0,230,118,0.2)] transition-all duration-300 hover:scale-[1.02] cursor-pointer group transform-gpu will-change-transform"
          style={{ right: '5%', top: '5%', width: '390px', height: '290px', zIndex: 10 }}
        >
          <img
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            alt="Secure Chapa Payments Gateway"
            src={trustCards[1].image}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== trustCards[1].fallback) {
                target.src = trustCards[1].fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"></div>

          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${trustCards[1].tagColor}`}>
                {trustCards[1].icon}
                <span>{trustCards[1].code}</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md font-semibold">
                {trustCards[1].badge}
              </span>
            </div>

            <div>
              <h3 className="font-sans text-xl font-bold text-white mb-1 drop-shadow-sm flex items-center gap-2">
                <span>{trustCards[1].title}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h3>
              <p className="text-xs text-white/90 leading-relaxed font-normal mb-3 line-clamp-2">
                {trustCards[1].desc}
              </p>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-emerald-200 transition-colors">
                <span>Explore Now</span>
                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: CONTRACTS (Mid-Left) */}
        <motion.div
          initial={{ opacity: 0, y: 28, x: -16, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => handleCardClick('CONTRACTS')}
          className="absolute rounded-[32px] overflow-hidden bg-[#120B24] border border-purple-500/40 shadow-[0_20px_50px_rgba(139,92,246,0.18)] transition-all duration-300 hover:scale-[1.02] cursor-pointer group transform-gpu will-change-transform"
          style={{ left: '4%', top: '47%', width: '380px', height: '290px', zIndex: 15 }}
        >
          <img
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            alt="Digital Contracts Document"
            src={trustCards[2].image}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== trustCards[2].fallback) {
                target.src = trustCards[2].fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"></div>

          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${trustCards[2].tagColor}`}>
                {trustCards[2].icon}
                <span>{trustCards[2].code}</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 backdrop-blur-md font-semibold">
                {trustCards[2].badge}
              </span>
            </div>

            <div>
              <h3 className="font-sans text-xl font-bold text-white mb-1.5 drop-shadow-sm">
                {trustCards[2].title}
              </h3>
              <p className="text-xs text-white/90 leading-relaxed font-normal mb-3 line-clamp-2">
                {trustCards[2].desc}
              </p>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-purple-200 transition-colors">
                <span>Explore Now</span>
                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Card 4: REVIEWS (Mid-Right) */}
        <motion.div
          initial={{ opacity: 0, y: 28, x: 16, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          transition={{ duration: 0.9, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => handleCardClick('REVIEWS')}
          className="absolute rounded-[32px] overflow-hidden bg-black/60 border border-amber-500/30 shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group transform-gpu will-change-transform"
          style={{ right: '4%', top: '47%', width: '370px', height: '290px', zIndex: 15 }}
        >
          <img
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            alt="Verified Reviews"
            src={trustCards[3].image}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== trustCards[3].fallback) {
                target.src = trustCards[3].fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 pointer-events-none"></div>

          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${trustCards[3].tagColor}`}>
                {trustCards[3].icon}
                <span>{trustCards[3].code}</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 backdrop-blur-md font-semibold">
                {trustCards[3].badge}
              </span>
            </div>

            <div>
              <h3 className="font-sans text-xl font-bold text-white mb-1.5 drop-shadow-sm">
                {trustCards[3].title}
              </h3>
              <p className="text-xs text-white/90 leading-relaxed font-normal mb-3 line-clamp-2">
                {trustCards[3].desc}
              </p>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-amber-200 transition-colors">
                <span>Explore Now</span>
                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Card 5: LOCATION (Bottom-Center) */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          transition={{ duration: 0.95, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => handleCardClick('LOCATION')}
          className="absolute rounded-[32px] overflow-hidden bg-black/60 border border-rose-500/30 shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group transform-gpu will-change-transform"
          style={{ left: '50%', transform: 'translateX(-50%)', bottom: '3%', width: '450px', height: '280px', zIndex: 20 }}
        >
          <img
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            alt="Location-Based Search Dire Dawa"
            src={trustCards[4].image}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== trustCards[4].fallback) {
                target.src = trustCards[4].fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 pointer-events-none"></div>

          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${trustCards[4].tagColor}`}>
                {trustCards[4].icon}
                <span>{trustCards[4].code}</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 backdrop-blur-md font-semibold">
                {trustCards[4].badge}
              </span>
            </div>

            <div>
              <h3 className="font-sans text-xl font-bold text-white mb-1.5 drop-shadow-sm">
                {trustCards[4].title}
              </h3>
              <p className="text-xs text-white/90 leading-relaxed font-normal mb-3 line-clamp-2">
                {trustCards[4].desc}
              </p>
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-rose-200 transition-colors">
                <span>Explore Now</span>
                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RESPONSIVE GRID FOR TABLET & MOBILE (below lg screens) */}
      <div className="block lg:hidden relative z-10 max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
          {trustCards.map((card, idx) => (
            <motion.div
              key={card.code}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15, margin: "-30px" }}
              transition={{ duration: 0.75, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleCardClick(card.code)}
              className={`relative rounded-[22px] sm:rounded-[28px] overflow-hidden shadow-xl border border-white/20 p-4 xs:p-5 sm:p-6 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:scale-[1.01] transform-gpu ${
                idx === 4 ? 'md:col-span-2 min-h-[175px] xs:min-h-[195px] sm:min-h-[230px]' : 'min-h-[170px] xs:min-h-[190px] sm:min-h-[220px]'
              }`}
            >
              <img
                src={card.image}
                alt={card.title}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== card.fallback) {
                    target.src = card.fallback;
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-between">
                <span className={`text-[9px] xs:text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md uppercase tracking-wider inline-flex items-center gap-1.5 ${card.tagColor}`}>
                  {card.icon}
                  <span>{card.code}</span>
                </span>
                <span className="text-[9px] xs:text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-white/90 border border-white/20 backdrop-blur-md">
                  {card.badge}
                </span>
              </div>

              <div className="relative z-10 pt-2">
                <h4 className="font-sans text-base xs:text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <span>{card.title}</span>
                  {card.code === 'CHAPA' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                </h4>
                <p className="text-[11px] xs:text-xs text-white/90 line-clamp-2 mb-2 sm:mb-3 font-normal leading-relaxed">
                  {card.desc}
                </p>
                <span className="text-[11px] xs:text-xs font-bold text-white uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-[#FF416C] transition-colors">
                  <span>Explore Now</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

