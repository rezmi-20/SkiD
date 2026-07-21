"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import DireSkillLogo from "@/components/shell/DireSkillLogo";

interface AuthWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  artImage: string;
  artTitle: React.ReactNode;
  artDescription: string;
  artIcon: string;
}

export default function AuthWrapper({
  children,
  title,
  subtitle,
  artImage,
  artTitle,
  artDescription,
  artIcon
}: AuthWrapperProps) {
  return (
    <div className="min-h-[100dvh] w-full flex bg-surface text-on-surface font-inter overflow-x-hidden selection:bg-primary/30">
      
      {/* Desktop Art Side (Left) */}
      <div className="hidden lg:flex w-1/2 relative bg-surface border-r border-surface-container-highest overflow-hidden items-center justify-center p-12">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={artImage} 
            alt="Branding Art" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-surface/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/30"></div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] pointer-events-none rounded-full z-0 mix-blend-screen" />
        
        {/* Logo */}
        <div className="absolute top-12 left-12 z-20">
          <DireSkillLogo variant="color" iconSize={44} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-surface-container-highest/10 border border-surface-container-highest flex items-center justify-center rounded-[2rem] backdrop-blur-xl mb-8 shadow-2xl">
             <span className="material-symbols-outlined text-[48px] text-primary filled">{artIcon}</span>
          </div>
          <h2 className="text-5xl font-bold tracking-tight text-on-surface mb-6 leading-tight">
            {artTitle}
          </h2>
          <p className="text-on-surface-variant text-lg max-w-md mx-auto leading-relaxed opacity-70">
            {artDescription}
          </p>
        </div>
        
        <div className="absolute bottom-12 left-12 flex items-center gap-4 text-sm font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <span>&bull;</span>
          <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[100dvh]">
        
        {/* Mobile Ambient Glow */}
        <div className="lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="w-full max-w-[440px] px-6 py-12 z-10 flex flex-col min-h-[100dvh] items-center justify-center relative">
          
          {/* Header Section */}
          <div className="flex flex-col items-center mb-10 space-y-6 w-full">
            <div className="lg:hidden flex items-center gap-3 mb-2">
              <DireSkillLogo variant="color" iconSize={44} />
            </div>
            
            <div className="text-center space-y-2">
              <h1 className="text-[32px] font-bold tracking-tight text-on-surface flex items-center justify-center gap-2 leading-tight">
                {title}
              </h1>
              <p className="text-on-surface-variant text-[15px] font-medium opacity-60">
                {subtitle}
              </p>
            </div>
          </div>

          {children}

        </div>
      </div>
    </div>
  );
}
