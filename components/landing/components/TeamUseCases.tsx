"use client";
import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, FileText, Bell, Hammer, Wrench, Paintbrush, Scissors, Zap, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface TeamUseCasesProps {
  onFindWorker?: () => void;
  onJoinPro?: () => void;
}

// 30 Tool definitions for 5 rows x 6 keys
interface WatermarkKey {
  id: string;
  iconType: string;
}

const WATERMARK_KEYS: WatermarkKey[] = [
  // Row 1 (6 keys)
  { id: 'screwdriver', iconType: 'screwdriver' },
  { id: 'paintbrush', iconType: 'paintbrush' },
  { id: 'hammer', iconType: 'hammer' },
  { id: 'wrench', iconType: 'wrench' },
  { id: 'drill', iconType: 'drill' },
  { id: 'saw', iconType: 'saw' },

  // Row 2 (6 keys)
  { id: 'pliers', iconType: 'pliers' },
  { id: 'tape', iconType: 'tape' },
  { id: 'level', iconType: 'level' },
  { id: 'hardhat', iconType: 'hardhat' },
  { id: 'roller', iconType: 'roller' },
  { id: 'trowel', iconType: 'trowel' },

  // Row 3 (6 keys)
  { id: 'pipe', iconType: 'pipe' },
  { id: 'stripper', iconType: 'stripper' },
  { id: 'voltage', iconType: 'voltage' },
  { id: 'knife', iconType: 'knife' },
  { id: 'flashlight', iconType: 'flashlight' },
  { id: 'bucket', iconType: 'bucket' },

  // Row 4 (6 keys - additional row)
  { id: 'square', iconType: 'square' },
  { id: 'mallet', iconType: 'mallet' },
  { id: 'ratchet', iconType: 'ratchet' },
  { id: 'plug', iconType: 'plug' },
  { id: 'flathead', iconType: 'flathead' },
  { id: 'compass', iconType: 'compass' },

  // Row 5 (6 keys - additional row)
  { id: 'caulk', iconType: 'caulk' },
  { id: 'circular', iconType: 'circular' },
  { id: 'shield', iconType: 'shield' },
  { id: 'toolbox', iconType: 'toolbox' },
  { id: 'brick', iconType: 'brick' },
  { id: 'spark', iconType: 'spark' },
];

export const TeamUseCases: React.FC<TeamUseCasesProps> = ({ onFindWorker, onJoinPro }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'HOMEOWNERS' | 'WORKERS' | 'SHARED'>('WORKERS');
  
  // Turn-by-turn glowing index: all keys glow blurry, then turn by turn each key glows MORE
  const [activeGlowIndex, setActiveGlowIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveGlowIndex((prev) => (prev + 1) % WATERMARK_KEYS.length);
    }, 850);
    return () => clearInterval(timer);
  }, []);

  const renderToolIcon = (type: string, isSuperGlowing: boolean) => {
    // Blurry glow by default on ALL keys; crystal sharp intense super-glow when it's that key's turn
    const iconClass = `w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 transition-all duration-700 ${
      isSuperGlowing
        ? 'text-[#00E575] filter-none drop-shadow-[0_0_24px_#00E575] drop-shadow-[0_0_36px_rgba(0,229,117,0.95)] scale-115'
        : 'text-[#00E575]/60 filter blur-[1.1px] drop-shadow-[0_0_10px_rgba(0,229,117,0.5)] scale-100'
    }`;

    switch (type) {
      case 'screwdriver':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14 10 4-4a2.8 2.8 0 0 1 4 4l-4 4" />
            <path d="M10 14 3 21" />
            <path d="M7 17l-4 4" />
            <path d="M13 11l-3 3" />
            <rect x="12" y="3" width="7" height="4" rx="1" transform="rotate(45 15.5 5)" />
          </svg>
        );
      case 'paintbrush':
        return <Paintbrush className={iconClass} strokeWidth={2.2} />;
      case 'hammer':
        return <Hammer className={iconClass} strokeWidth={2.2} />;
      case 'wrench':
        return <Wrench className={iconClass} strokeWidth={2.2} />;
      case 'drill':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="10" height="7" rx="1" />
            <path d="M12 9.5h5l3-1.5v3l-3-1.5" />
            <path d="M5 13v7a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-7" />
            <circle cx="7" cy="10" r="1.3" fill="currentColor" />
          </svg>
        );
      case 'saw':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17V7l15-3 3 3v2l-1 1-1-1-1 1-1-1-1 1-1-1-1 1-1-1-1 1-1-1-1 1-1-1-1 1-1-1-1 1-1-1-2 2z" />
            <path d="M3 17a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3v-3H3v3z" />
            <circle cx="6" cy="17" r="1" fill="currentColor" />
          </svg>
        );
      case 'pliers':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 19 6-6" />
            <path d="m20 19-6-6" />
            <circle cx="12" cy="11" r="2" />
            <path d="M10 9 7 3h3l2 4" />
            <path d="M14 9 17 3h-3l-2 4" />
          </svg>
        );
      case 'tape':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="12" height="14" rx="4" />
            <circle cx="9" cy="12" r="3" />
            <path d="M15 15h6v4h-6" />
            <path d="M17 15v2" />
            <path d="M19 15v2" />
          </svg>
        );
      case 'level':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="8" width="20" height="8" rx="2" />
            <rect x="8" y="10" width="8" height="4" rx="1" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <line x1="6" y1="9" x2="6" y2="15" />
            <line x1="18" y1="9" x2="18" y2="15" />
          </svg>
        );
      case 'hardhat':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18h20" />
            <path d="M4 18v-2a8 8 0 0 1 16 0v2" />
            <path d="M10 6a2 2 0 0 1 4 0v10h-4z" />
          </svg>
        );
      case 'roller':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="14" height="6" rx="2" />
            <path d="M18 6h3v5a2 2 0 0 1-2 2h-7v8" />
            <circle cx="12" cy="21" r="1" fill="currentColor" />
          </svg>
        );
      case 'trowel':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 4 12h16L12 2z" />
            <path d="M12 12v3a2 2 0 0 0 2 2h2v4" />
          </svg>
        );
      case 'pipe':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 3h9v4H7z" />
            <path d="M11 7v14" />
            <path d="M8 7v4h6V7" />
            <rect x="9" y="11" width="4" height="3" rx="0.5" fill="currentColor" />
          </svg>
        );
      case 'stripper':
        return <Scissors className={iconClass} strokeWidth={2.2} />;
      case 'voltage':
        return <Zap className={iconClass} strokeWidth={2.2} />;
      case 'knife':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14 10-9 9a2 2 0 0 0 3 3l9-9" />
            <path d="M15 7l2-2 4 4-2 2" />
            <path d="m9 15 2 2" />
          </svg>
        );
      case 'flashlight':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m9 3 12 12" />
            <path d="m11 5 2 2" />
            <path d="m5 11 8 8-2 2-8-8 2-2z" />
          </svg>
        );
      case 'bucket':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 11-1.5 9h-11L5 11" />
            <path d="M4 11h16" />
            <path d="M12 3a7 7 0 0 0-7 8" />
          </svg>
        );
      case 'square':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20h16v-4H8V4H4z" />
            <line x1="8" y1="8" x2="11" y2="8" />
            <line x1="8" y1="12" x2="11" y2="12" />
            <line x1="12" y1="16" x2="12" y2="19" />
            <line x1="16" y1="16" x2="16" y2="19" />
          </svg>
        );
      case 'mallet':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="7" y="2" width="10" height="7" rx="1" transform="rotate(45 12 5.5)" />
            <path d="m14 10-9 9" />
            <path d="m8 16-3 3" />
          </svg>
        );
      case 'ratchet':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="4" />
            <path d="M10 10l10 10" />
            <circle cx="7" cy="7" r="1.5" fill="currentColor" />
          </svg>
        );
      case 'plug':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22v-5" />
            <path d="M9 8V2" />
            <path d="M15 8V2" />
            <path d="M18 8v5a6 6 0 0 1-12 0V8z" />
          </svg>
        );
      case 'flathead':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 4l6 6" />
            <path d="M4 20l8-8" />
            <rect x="13" y="3" width="8" height="3" rx="1" transform="rotate(45 17 4.5)" />
          </svg>
        );
      case 'compass':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="2" />
            <path d="m9 7-5 14" />
            <path d="m15 7 5 14" />
            <path d="M6 15h12" />
          </svg>
        );
      case 'caulk':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 15l10-10 4 4-10 10z" />
            <path d="M17 9l4-4" />
            <path d="M21 5l-2-2" />
            <path d="M5 17l-3 3" />
          </svg>
        );
      case 'circular':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        );
      case 'shield':
        return <Shield className={iconClass} strokeWidth={2.2} />;
      case 'toolbox':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
        );
      case 'brick':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="1" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="12" y1="5" x2="12" y2="12" />
            <line x1="7" y1="12" x2="7" y2="19" />
            <line x1="17" y1="12" x2="17" y2="19" />
          </svg>
        );
      case 'spark':
        return <Sparkles className={iconClass} strokeWidth={2.2} />;
      default:
        return <Hammer className={iconClass} strokeWidth={2.2} />;
    }
  };

  return (
    <section
      id="features"
      className="py-14 sm:py-20 md:py-28 px-4 sm:px-8 md:px-14 max-w-[1728px] mx-auto bg-[#0A0B0D] text-white rounded-[28px] sm:rounded-[40px] md:rounded-[56px] my-4 sm:my-6 border border-white/5 relative overflow-hidden shadow-2xl"
    >
      {/* Background Watermark: 5 rows x 6 keys, inclined at -30deg with responsive scaling for mobile */}
      <div className="absolute -bottom-4 xs:bottom-0 sm:bottom-6 md:bottom-8 lg:bottom-10 -right-8 xs:-right-4 sm:right-0 md:right-4 lg:right-8 pointer-events-none select-none z-0 overflow-visible opacity-70 xs:opacity-80 md:opacity-90">
        {/* Tilted mechanical keyboard array (scaled adaptively for small mobile viewports) */}
        <div className="transform -rotate-[30deg] skew-y-[3deg] origin-bottom-right sm:origin-center scale-[0.7] xs:scale-[0.8] sm:scale-[0.9] md:scale-100 p-2.5 xs:p-3.5 sm:p-5 bg-gradient-to-br from-[#0c1410]/80 via-[#070b09]/90 to-transparent rounded-[28px] sm:rounded-[36px] border border-emerald-500/15 shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-[1px]">
          {/* 5-Row x 6-Column Keyboard Matrix (No text, no numbers, strictly icons) */}
          <div className="flex flex-col gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
            {/* Row 1: Keys 0 to 5 */}
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
              {WATERMARK_KEYS.slice(0, 6).map((key, idx) => {
                const isSuperGlowing = activeGlowIndex === idx;
                return (
                  <div
                    key={key.id}
                    className={`relative w-10 h-10 xs:w-11 xs:h-11 sm:w-13 sm:h-13 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-xl xs:rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-700 ease-out select-none ${
                      isSuperGlowing
                        ? 'bg-[#00E575]/25 border-2 border-[#00E575] shadow-[0_0_40px_rgba(0,229,117,0.7),inset_0_0_18px_rgba(0,229,117,0.35),0_6px_0_#050807] scale-110 z-20'
                        : 'bg-[#0d1c16]/30 border border-emerald-500/20 shadow-[0_4px_0_#050807,0_8px_16px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    {renderToolIcon(key.iconType, isSuperGlowing)}
                  </div>
                );
              })}
            </div>

            {/* Row 2: Keys 6 to 11 (staggered slightly like a real mechanical keyboard) */}
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 ml-2 xs:ml-2.5 sm:ml-3 md:ml-3.5">
              {WATERMARK_KEYS.slice(6, 12).map((key, idx) => {
                const actualIndex = idx + 6;
                const isSuperGlowing = activeGlowIndex === actualIndex;
                return (
                  <div
                    key={key.id}
                    className={`relative w-10 h-10 xs:w-11 xs:h-11 sm:w-13 sm:h-13 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-xl xs:rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-700 ease-out select-none ${
                      isSuperGlowing
                        ? 'bg-[#00E575]/25 border-2 border-[#00E575] shadow-[0_0_40px_rgba(0,229,117,0.7),inset_0_0_18px_rgba(0,229,117,0.35),0_6px_0_#050807] scale-110 z-20'
                        : 'bg-[#0d1c16]/30 border border-emerald-500/20 shadow-[0_4px_0_#050807,0_8px_16px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    {renderToolIcon(key.iconType, isSuperGlowing)}
                  </div>
                );
              })}
            </div>

            {/* Row 3: Keys 12 to 17 */}
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 ml-4 xs:ml-5 sm:ml-6 md:ml-7">
              {WATERMARK_KEYS.slice(12, 18).map((key, idx) => {
                const actualIndex = idx + 12;
                const isSuperGlowing = activeGlowIndex === actualIndex;
                return (
                  <div
                    key={key.id}
                    className={`relative w-10 h-10 xs:w-11 xs:h-11 sm:w-13 sm:h-13 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-xl xs:rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-700 ease-out select-none ${
                      isSuperGlowing
                        ? 'bg-[#00E575]/25 border-2 border-[#00E575] shadow-[0_0_40px_rgba(0,229,117,0.7),inset_0_0_18px_rgba(0,229,117,0.35),0_6px_0_#050807] scale-110 z-20'
                        : 'bg-[#0d1c16]/30 border border-emerald-500/20 shadow-[0_4px_0_#050807,0_8px_16px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    {renderToolIcon(key.iconType, isSuperGlowing)}
                  </div>
                );
              })}
            </div>

            {/* Row 4: Keys 18 to 23 (added row) */}
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 ml-2 xs:ml-2.5 sm:ml-3 md:ml-3.5">
              {WATERMARK_KEYS.slice(18, 24).map((key, idx) => {
                const actualIndex = idx + 18;
                const isSuperGlowing = activeGlowIndex === actualIndex;
                return (
                  <div
                    key={key.id}
                    className={`relative w-10 h-10 xs:w-11 xs:h-11 sm:w-13 sm:h-13 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-xl xs:rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-700 ease-out select-none ${
                      isSuperGlowing
                        ? 'bg-[#00E575]/25 border-2 border-[#00E575] shadow-[0_0_40px_rgba(0,229,117,0.7),inset_0_0_18px_rgba(0,229,117,0.35),0_6px_0_#050807] scale-110 z-20'
                        : 'bg-[#0d1c16]/30 border border-emerald-500/20 shadow-[0_4px_0_#050807,0_8px_16px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    {renderToolIcon(key.iconType, isSuperGlowing)}
                  </div>
                );
              })}
            </div>

            {/* Row 5: Keys 24 to 29 (added row) */}
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
              {WATERMARK_KEYS.slice(24, 30).map((key, idx) => {
                const actualIndex = idx + 24;
                const isSuperGlowing = activeGlowIndex === actualIndex;
                return (
                  <div
                    key={key.id}
                    className={`relative w-10 h-10 xs:w-11 xs:h-11 sm:w-13 sm:h-13 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-xl xs:rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-700 ease-out select-none ${
                      isSuperGlowing
                        ? 'bg-[#00E575]/25 border-2 border-[#00E575] shadow-[0_0_40px_rgba(0,229,117,0.7),inset_0_0_18px_rgba(0,229,117,0.35),0_6px_0_#050807] scale-110 z-20'
                        : 'bg-[#0d1c16]/30 border border-emerald-500/20 shadow-[0_4px_0_#050807,0_8px_16px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    {renderToolIcon(key.iconType, isSuperGlowing)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Foreground Content (relative z-10, clean layout without the 2 card boxes) */}
      <div className="relative z-10">
        {/* Section Header with scroll reveal */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mb-8 sm:mb-12 md:mb-14"
        >
          <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#00E575] mb-2 sm:mb-3 block">
            {t.features.tag}
          </span>
          <h2 className="font-sans text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-3 sm:mb-4">
            {t.features.title}
          </h2>
          <p className="text-xs xs:text-sm sm:text-base md:text-lg text-[#8C8880] leading-relaxed max-w-2xl font-normal">
            {t.features.subtitle}
          </p>
        </motion.div>

        {/* Floating Center Pill Tabs (Responsive with no-scrollbar and ergonomic touch targets) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-8 sm:mb-12 md:mb-16 w-full overflow-x-auto no-scrollbar py-1"
        >
          <div className="bg-[#141518]/90 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-white/10 inline-flex items-center gap-1 shadow-lg max-w-full shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('HOMEOWNERS')}
              className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer touch-manipulation shrink-0 ${
                activeTab === 'HOMEOWNERS'
                  ? 'bg-[#00E575] text-black shadow-[0_0_20px_rgba(0,229,117,0.35)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {t.features.tabs.homeowners}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('WORKERS')}
              className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer touch-manipulation shrink-0 ${
                activeTab === 'WORKERS'
                  ? 'bg-[#00E575] text-black shadow-[0_0_20px_rgba(0,229,117,0.35)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {t.features.tabs.workers}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SHARED')}
              className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer touch-manipulation shrink-0 ${
                activeTab === 'SHARED'
                  ? 'bg-[#00E575] text-black shadow-[0_0_20px_rgba(0,229,117,0.35)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {t.features.tabs.shared}
            </button>
          </div>
        </motion.div>

        {/* Content Container: 2-column layout WITHOUT the 2 enclosing card boxes */}
        <AnimatePresence mode="wait">
          {/* TAB 1: FOR HOMEOWNERS */}
          {activeTab === 'HOMEOWNERS' && (
            <motion.div
              key="tab-homeowners"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start"
            >
              {/* Left Column: Checklist (No enclosing box) */}
              <div className="lg:col-span-5 flex flex-col justify-between py-1 sm:py-2">
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {t.features.homeownerChecklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 sm:gap-3">
                      <Check size={16} className="text-[#00E575] shrink-0 stroke-[2.5]" />
                      <span className="font-sans text-xs xs:text-sm sm:text-base text-white/90 font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={onFindWorker}
                    className="w-full sm:w-auto bg-[#00E575] hover:bg-[#00C865] text-black font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 sm:py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,229,117,0.25)] hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
                  >
                    <span>{t.features.findWorkerBtn}</span>
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Right Column: HIRE WITH CONFIDENCE + Samuel T. (No enclosing box) */}
              <div className="lg:col-span-7 flex flex-col justify-center py-1 sm:py-2 max-w-xl">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-[#00E575] block mb-2 sm:mb-3">
                  {t.features.forHomeownersHeading}
                </span>

                <h3 className="font-sans text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-6 sm:mb-8">
                  {t.features.hireWithConfidence}
                </h3>

                {/* Samuel T. Pro Card */}
                <div className="bg-[#14161B]/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 flex items-center justify-between mb-3.5 sm:mb-4 shadow-lg">
                  <div className="flex items-center gap-3 sm:gap-3.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#113B26] text-[#00E575] font-black text-sm sm:text-base flex items-center justify-center border border-[#00E575]/30 shadow-[0_0_12px_rgba(0,229,117,0.2)] shrink-0">
                      S
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-sans text-sm sm:text-base font-bold text-white">
                          {t.features.proCard.name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#0E3524] text-[#00E575] border border-[#00E575]/40">
                          {t.features.proCard.faydaBadge}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-mono uppercase text-white/50 tracking-wider block mt-0.5">
                        {t.features.proCard.trade}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-xs sm:text-sm text-white block">
                      {t.features.proCard.ratingValue}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-white/40">
                      {t.features.proCard.jobsCount}
                    </span>
                  </div>
                </div>

                {/* Contract Signed Indicator Pill */}
                <div className="bg-[#14161B]/80 backdrop-blur-sm rounded-xl p-3.5 sm:p-4 border border-white/10 flex items-center justify-between text-xs text-white/80 shadow-md">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <FileText size={15} className="text-white/60 shrink-0" />
                    <span className="font-medium text-xs sm:text-sm">{t.features.proCard.signedPill}</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E575] shadow-[0_0_8px_#00E575] shrink-0 ml-2" />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: FOR WORKERS */}
          {activeTab === 'WORKERS' && (
            <motion.div
              key="tab-workers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start"
            >
              {/* Left Column: Checklist (No enclosing box) */}
              <div className="lg:col-span-5 flex flex-col justify-between py-1 sm:py-2">
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {t.features.workerChecklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 sm:gap-3">
                      <Check size={16} className="text-[#00E575] shrink-0 stroke-[2.5]" />
                      <span className="font-sans text-xs xs:text-sm sm:text-base text-white/90 font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={onJoinPro}
                    className="w-full sm:w-auto bg-[#00E575] hover:bg-[#00C865] text-black font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 sm:py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,229,117,0.25)] hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
                  >
                    <span>{t.features.joinProBtn}</span>
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Right Column: BUILD YOUR REPUTATION (No enclosing box) */}
              <div className="lg:col-span-7 flex flex-col justify-center py-1 sm:py-2 max-w-xl">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-[#00E575] block mb-2 sm:mb-3">
                  {t.features.forWorkersHeading}
                </span>

                <h3 className="font-sans text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-6 sm:mb-8">
                  {t.features.buildReputation}
                </h3>

                {/* 3 Stats Boxes (Responsive on all screen sizes) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
                  <div className="bg-[#14161B]/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 xs:p-3 sm:p-4 md:p-5 text-center border border-white/10 shadow-md">
                    <span className="font-mono text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold text-white block">
                      38
                    </span>
                    <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-mono text-white/50 tracking-wide sm:tracking-wider uppercase block mt-1">
                      {t.features.proCard.jobsDoneLabel}
                    </span>
                  </div>

                  <div className="bg-[#14161B]/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 xs:p-3 sm:p-4 md:p-5 text-center border border-white/10 shadow-md">
                    <span className="font-mono text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold text-white block">
                      {t.features.proCard.ratingValue}
                    </span>
                    <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-mono text-white/50 tracking-wide sm:tracking-wider uppercase block mt-1">
                      {t.features.proCard.ratingLabel}
                    </span>
                  </div>

                  <div className="bg-[#14161B]/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 xs:p-3 sm:p-4 md:p-5 text-center border border-white/10 shadow-md">
                    <span className="font-mono text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold text-white block">
                      {t.features.proCard.responseValue}
                    </span>
                    <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-mono text-white/50 tracking-wide sm:tracking-wider uppercase block mt-1">
                      {t.features.proCard.responseLabel}
                    </span>
                  </div>
                </div>

                {/* Fayda Verified Banner */}
                <div className="bg-[#0E281C]/90 backdrop-blur-sm border border-[#00E575]/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex items-center gap-3 sm:gap-3.5 shadow-md">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#00E575] text-black flex items-center justify-center font-bold shrink-0 shadow-[0_0_12px_#00E575]">
                    <Check size={18} className="stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-mono text-xs sm:text-sm font-black text-[#00E575] uppercase tracking-wider block">
                      {t.features.proCard.faydaVerifiedTitle}
                    </span>
                    <span className="text-[11px] sm:text-xs text-emerald-200/80 block mt-0.5 font-medium">
                      {t.features.proCard.faydaVerifiedSubtitle}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SHARED */}
          {activeTab === 'SHARED' && (
            <motion.div
              key="tab-shared"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start"
            >
              {/* Left Column: Checklist (No enclosing box) */}
              <div className="lg:col-span-5 flex flex-col justify-between py-1 sm:py-2">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-[#00E575] block mb-3 sm:mb-4">
                    {t.features.tabs.shared}
                  </span>
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {t.features.checklist.map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 sm:gap-3">
                        <Check size={16} className="text-[#00E575] shrink-0 stroke-[2.5]" />
                        <span className="font-sans text-xs xs:text-sm sm:text-base text-white/90 font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={onFindWorker}
                    className="w-full sm:w-auto bg-[#00E575] hover:bg-[#00C865] text-black font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 sm:py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,229,117,0.25)] hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
                  >
                    <span>{t.features.getStarted}</span>
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Right Column: ONE PLATFORM. TWO SIDES. + Dialogue (No enclosing box) */}
              <div className="lg:col-span-7 flex flex-col justify-center py-1 sm:py-2 max-w-xl">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-1.5 sm:mb-2">
                  {t.features.forEveryone}
                </span>

                <h3 className="font-sans text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-6 sm:mb-8">
                  {t.features.twoSides}
                </h3>

                {/* Clean dialogue with background boxes REMOVED */}
                <div className="space-y-4 sm:space-y-5">
                  {/* Worker Dialogue line */}
                  <div className="flex items-start gap-3 sm:gap-3.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E575] mt-1.5 shrink-0 shadow-[0_0_10px_#00E575]" />
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#00E575] font-bold block mb-0.5">
                        {t.features.proSpeakerLabel}
                      </span>
                      <p className="text-sm xs:text-base sm:text-lg text-white font-medium tracking-tight">
                        &ldquo;{t.features.dialogue.msg1}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Homeowner Dialogue line */}
                  <div className="flex items-start gap-3 sm:gap-3.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-white/40 font-bold block mb-0.5">
                        {t.features.homeownerSpeakerLabel}
                      </span>
                      <p className="text-sm xs:text-base sm:text-lg text-white/90 font-medium tracking-tight">
                        &ldquo;{t.features.dialogue.msg2}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* System Status line */}
                  <div className="flex items-center gap-2.5 sm:gap-3 pt-2.5 sm:pt-3 border-t border-white/10 text-xs sm:text-sm text-emerald-400 font-mono">
                    <Bell size={14} className="text-[#00E575] shrink-0" />
                    <span className="tracking-tight font-medium text-[11px] sm:text-xs md:text-sm">
                      {t.features.dialogue.msg3}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

