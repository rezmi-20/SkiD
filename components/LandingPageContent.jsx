"use client";
import React, { useState, useEffect } from "react";
import Lenis from "lenis";
import { CheckCircle2 } from "lucide-react";

import Navbar from "./landing/Navbar";
import { Hero } from "./landing/components/Hero";
import { TrustMarquee } from "./landing/components/TrustMarquee";
import { VisualCollage } from "./landing/components/VisualCollage";
import { Manifesto } from "./landing/components/Manifesto";
import { BrandOS } from "./landing/components/BrandOS";
import { LumioStudio } from "./landing/components/LumioStudio";
import { ExploreCategories } from "./landing/components/ExploreCategories";
import { TeamUseCases } from "./landing/components/TeamUseCases";
import { Testimonial } from "./landing/components/Testimonial";
import { LatestUpdates } from "./landing/components/LatestUpdates";
import { CallToAction } from "./landing/components/CallToAction";
import Footer from "./landing/Footer";

import { FileModal } from "./landing/components/modals/FileModal";
import { ArticleModal } from "./landing/components/modals/ArticleModal";
import { TeamModal } from "./landing/components/modals/TeamModal";
import { WorkerDirectoryModal } from "./landing/components/modals/WorkerDirectoryModal";
import { JoinProModal } from "./landing/components/modals/JoinProModal";
import { DigitalContractModal } from "./landing/components/modals/DigitalContractModal";

import { LanguageProvider, useLanguage } from "./landing/context/LanguageContext";
import { MASTER_WORKER } from "./landing/data/mockData";

function LandingView({ userRole, initialFaqs = [], initialTestimonials = [] }) {
  const { language, setLanguage } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isFindWorkerOpen, setIsFindWorkerOpen] = useState(false);
  const [isJoinProOpen, setIsJoinProOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [activeWorker, setActiveWorker] = useState(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Keep native scrolling on touch devices. Smooth-scroll interception can
    // conflict with browser momentum scrolling, especially on mobile Safari.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    });

    let animationFrameId;

    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4200);
  };

  const handleSearchHero = (query) => {
    setSearchInitialQuery(query || "");
    setIsFindWorkerOpen(true);
  };

  const handleHireWorker = (worker) => {
    setActiveWorker(worker);
    setIsContractOpen(true);
  };

  const handleRegisteredPro = (name, trade) => {
    showToast(`Welcome, ${name}! Your Fayda ID application for ${trade} is being audited.`);
  };

  const handlePaymentReleased = (amount, workerName) => {
    showToast(`ETB ${amount.toLocaleString()} released via Chapa to ${workerName}.`);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1B1B1B] selection:bg-[#181818] selection:text-white relative">
      {/* 1. Floating Nav */}
      <Navbar
        language={language}
        onSelectLanguage={setLanguage}
        onFindWorker={() => setIsFindWorkerOpen(true)}
        onLogin={() => {
          if (userRole) {
            const dest = userRole === "admin" ? "/admin/login" : userRole === "worker" ? "/worker/dashboard" : "/client/search";
            window.location.href = dest;
          } else {
            window.location.href = "/login";
          }
        }}
        onGetStarted={() => {
          if (userRole) {
            const dest = userRole === "admin" ? "/admin/login" : userRole === "worker" ? "/worker/dashboard" : "/client/search";
            window.location.href = dest;
          } else {
            setIsFindWorkerOpen(true);
          }
        }}
        userRole={userRole}
      />

      <main id="main-content">
        {/* 1. Hero */}
        <Hero
          onSearch={handleSearchHero}
          onExploreStudio={() => setIsJoinProOpen(true)}
        />

        {/* 2. Trust Strip marquee */}
        <TrustMarquee />

        {/* 3. Floating Visual Collage (5 Trust Pillars) */}
        <VisualCollage
          onExplore={(code) => {
            if (code === "CONTRACTS" || code === "CHAPA") {
              setIsContractOpen(true);
            } else {
              setIsFindWorkerOpen(true);
            }
          }}
        />

        {/* 4. Manifesto */}
        <Manifesto />

        {/* 5. How It Works (4-Step Process & Direct Chapa Payments) */}
        <BrandOS
          onOpenContract={() => setIsContractOpen(true)}
          onFindWorker={() => setIsFindWorkerOpen(true)}
        />

        {/* 6. Frequently Asked Questions (FAQ) */}
        <LumioStudio customFaqs={initialFaqs} />

        {/* 7. Explore Categories */}
        <ExploreCategories onFindWorker={() => setIsFindWorkerOpen(true)} />

        {/* 8. Features & Toolset */}
        <TeamUseCases
          onFindWorker={() => setIsFindWorkerOpen(true)}
          onJoinPro={() => setIsJoinProOpen(true)}
        />

        {/* 9. Testimonials */}
        <Testimonial customTestimonials={initialTestimonials} />

        {/* 10. Problem, Solution, Benefit Cards */}
        <LatestUpdates
          onFindWorker={() => setIsFindWorkerOpen(true)}
          onSelectArticle={(article) => setSelectedArticle(article)}
        />

        {/* 11. Call to Action */}
        <CallToAction
          onFindWorker={() => setIsFindWorkerOpen(true)}
          onJoinPro={() => setIsJoinProOpen(true)}
        />
      </main>

      {/* 12. Deep Black Rounded Footer */}
      <Footer
        language={language}
        onSelectLanguage={setLanguage}
        onFindWorker={() => setIsFindWorkerOpen(true)}
        onJoinPro={() => setIsJoinProOpen(true)}
      />

      {/* Interactive Modals */}
      <FileModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
      />

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <TeamModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onHire={() => {
          setSelectedCard(null);
          setIsFindWorkerOpen(true);
        }}
      />

      <WorkerDirectoryModal
        isOpen={isFindWorkerOpen}
        initialQuery={searchInitialQuery}
        onClose={() => setIsFindWorkerOpen(false)}
        onHireWorker={handleHireWorker}
      />

      <JoinProModal
        isOpen={isJoinProOpen}
        onClose={() => setIsJoinProOpen(false)}
        onRegistered={handleRegisteredPro}
      />

      <DigitalContractModal
        isOpen={isContractOpen}
        worker={activeWorker || MASTER_WORKER}
        onClose={() => setIsContractOpen(false)}
        onPaymentReleased={handlePaymentReleased}
      />

      {/* Live Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181818] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 text-sm font-bold cursor-pointer"
            aria-label="Dismiss toast"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default function LandingPageContent({ userRole, initialFaqs = [], initialTestimonials = [] }) {
  return (
    <LanguageProvider>
      <LandingView 
        userRole={userRole} 
        initialFaqs={initialFaqs} 
        initialTestimonials={initialTestimonials} 
      />
    </LanguageProvider>
  );
}
