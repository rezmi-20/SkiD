"use client";
import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  AlertCircle, 
  Star,
  Check,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface FAQItem {
  id: string;
  num: string;
  topic: string;
  icon: React.ReactNode;
  question: string;
  answer: string;
  takeaway: string;
  image: string;
  fallback: string;
  badge: string;
}

export const LumioStudio: React.FC = () => {
  const { t } = useLanguage();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const icons = [
    <ShieldCheck key="1" size={18} className="text-blue-400" />,
    <FileText key="2" size={18} className="text-amber-400" />,
    <CreditCard key="3" size={18} className="text-emerald-400" />,
    <MessageSquare key="4" size={18} className="text-purple-400" />,
    <AlertCircle key="5" size={18} className="text-rose-400" />,
    <Star key="6" size={18} className="text-amber-400 fill-amber-400" />
  ];

  const images = [
    { image: '/images/user_fayda_card.jpg', fallback: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQIQdo3UzHSi3p4vcS88ZFpwEyVWatJA5oPoj_oqOG1Q&s=10' },
    { image: '/images/user_contract_card.jpg', fallback: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4SlQN6JXWJVlQC2mmWu_qvy2-QWQOXRnLvQpgry-XDw&s=10' },
    { image: '/images/user_chapa_card.jpg', fallback: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaukVC76TqnKuvpMbYJb4EoWhm6Vill9uT_idSQ1kUbg&s=10' },
    { image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop', fallback: '/images/diredawa_street.jpg' },
    { image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop', fallback: '/images/user_location_card.jpg' },
    { image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop', fallback: '/images/user_review_card.jpg' }
  ];

  const faqs: FAQItem[] = t.faq.items.map((item, idx) => ({
    id: item.id,
    num: item.num,
    topic: item.topic,
    icon: icons[idx] || <ShieldCheck size={18} className="text-blue-400" />,
    question: item.question,
    answer: item.answer,
    takeaway: item.takeaway,
    image: images[idx]?.image || '/images/user_fayda_card.jpg',
    fallback: images[idx]?.fallback || '/images/diredawa_city.jpg',
    badge: item.badge
  }));

  const currentFaq = faqs[Math.max(0, activeQuestionIndex)];

  const handleNext = () => {
    setActiveQuestionIndex((prev) => (prev < faqs.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setActiveQuestionIndex((prev) => (prev > 0 ? prev - 1 : faqs.length - 1));
  };

  const handleQuestionClick = (index: number) => {
    // On mobile, toggle accordion if already open; on desktop set active index
    setActiveQuestionIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <section id="faq" className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 md:px-10 max-w-[1728px] mx-auto bg-[#FAF9F5] border-t border-[#E8E6DF]">
      {/* Section Header with scroll reveal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15, margin: "-40px" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mb-8 sm:mb-12 md:mb-16 will-change-transform"
      >
        <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#00E575] mb-2 sm:mb-3 block">
          {t.faq.tag}
        </span>
        <h2 className="font-sans text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1B1B1B] leading-[1.15] mb-3 sm:mb-4">
          {t.faq.title}
        </h2>
        <p className="text-xs xs:text-sm sm:text-base md:text-lg text-[#666] leading-relaxed max-w-2xl font-normal">
          {t.faq.subtitle}
        </p>
      </motion.div>

      {/* Two Column on Desktop / Single Accordion on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        {/* Questions List (On Mobile: accordion dropdown that drops own answer) */}
        <div className="lg:col-span-6 space-y-2.5 sm:space-y-3">
          {faqs.map((faq, index) => {
            const isActive = activeQuestionIndex === index;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1, margin: "-20px" }}
                transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-[20px] sm:rounded-[22px] border transition-all duration-300 overflow-hidden ${
                  isActive
                    ? 'bg-[#1B1B1B] text-white border-[#1B1B1B] shadow-md'
                    : 'bg-white hover:bg-[#F4F3EE] text-[#1B1B1B] border-[#E2E0D8] shadow-xs'
                }`}
              >
                {/* Question Header Button */}
                <button
                  type="button"
                  onClick={() => handleQuestionClick(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center gap-3 sm:gap-4 pr-2">
                    <span
                      style={{ fontFamily: "'Roboto', sans-serif" }}
                      className={`text-base sm:text-xl font-black shrink-0 transition-colors w-5 text-center ${
                        isActive ? 'text-white' : 'text-[#8C8880]'
                      }`}
                    >
                      {faq.num}
                    </span>

                    <span className="font-sans text-sm sm:text-base md:text-lg font-bold leading-snug">
                      {faq.question}
                    </span>
                  </div>

                  {/* Icon indicator: on mobile rotates down, on desktop right arrow */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isActive
                        ? 'bg-white text-black rotate-90 lg:rotate-0'
                        : 'bg-[#F0EFEB] text-[#8C8880]'
                    }`}
                  >
                    <ChevronDown size={14} className="block lg:hidden" />
                    <ArrowRight size={14} className="hidden lg:block" />
                  </div>
                </button>

                {/* Mobile Dropdown: Question drops its own answer directly inline */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="block lg:hidden overflow-hidden border-t border-white/10"
                    >
                      <div className="px-4 pb-4 pt-2.5 sm:px-5 sm:pb-5 space-y-2.5">
                        {/* Direct Answer Text */}
                        <p className="text-xs xs:text-sm text-zinc-300 leading-relaxed font-normal">
                          {faq.answer}
                        </p>

                        {/* Clean Inline Key Takeaway (No nested card) */}
                        <div className="pt-2 flex items-start gap-2 text-[11px] xs:text-xs text-emerald-400 font-medium">
                          <Check size={13} strokeWidth={2.5} className="shrink-0 mt-0.5 text-[#00E575]" />
                          <span className="leading-snug">{faq.takeaway}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column: Dynamic Answer Card (VISIBLE ON DESKTOP ONLY, HIDDEN ON MOBILE) */}
        {currentFaq && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15, margin: "-30px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block lg:col-span-6 sticky top-28 transform-gpu will-change-transform"
          >
            <div className="rounded-[32px] overflow-hidden shadow-2xl relative border border-white/20 min-h-[490px] flex flex-col justify-between group">
              {/* Background Image matching clean card aesthetic from image */}
              <img
                src={currentFaq.image}
                alt={currentFaq.topic}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== currentFaq.fallback) {
                    target.src = currentFaq.fallback;
                  }
                }}
              />

              {/* Gradient Overlay for High-Contrast Clean Typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50 pointer-events-none" />

              {/* Answer Card Top Header */}
              <div className="relative z-10 p-7 sm:p-9 pb-0">
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/15 text-white backdrop-blur-md border border-white/20">
                      {currentFaq.icon}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-white/60 uppercase tracking-widest block">
                        Topic
                      </span>
                      <span className="text-xs font-bold text-white">
                        {currentFaq.topic}
                      </span>
                    </div>
                  </div>

                  {/* Question index in clean Roboto font */}
                  <span 
                    style={{ fontFamily: "'Roboto', sans-serif" }}
                    className="text-sm font-black text-white/70 tracking-wider"
                  >
                    {currentFaq.num} / 6
                  </span>
                </div>

                {/* Active Question Title */}
                <h3 className="font-sans text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight drop-shadow-md">
                  {currentFaq.question}
                </h3>

                {/* Authoritative Answer Text */}
                <p className="text-base sm:text-lg text-white/95 leading-relaxed font-normal drop-shadow-sm mb-6">
                  {currentFaq.answer}
                </p>
              </div>

              {/* Card Bottom: Key Takeaway + Frosted Glass Corner Badge + Controls */}
              <div className="relative z-10 p-7 sm:p-9 pt-0">
                {/* Key Takeaway Box */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 mb-6">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-400/30">
                      <Check size={12} />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 block mb-0.5 font-bold">
                        Key Takeaway
                      </span>
                      <p className="text-xs sm:text-sm text-white/90 leading-normal">
                        {currentFaq.takeaway}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Frosted Glass Corner Badge + Next/Prev Switcher */}
                <div className="flex items-center justify-between pt-2">
                  {/* Clean Frosted Glass Pill Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-medium text-white shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{currentFaq.badge}</span>
                  </div>

                  {/* Switcher Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Previous Question"
                      className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 backdrop-blur-sm"
                    >
                      <ArrowLeft size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next Question"
                      className="w-9 h-9 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center transition-colors cursor-pointer font-bold shadow-sm"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

