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

import { LanguageProvider, useLanguage } from "./landing/context/LanguageContext";

function LandingView({ userRole, initialFaqs = [], initialTestimonials = [] }) {
  const { language, setLanguage } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Only run smooth momentum scrolling on desktop non-touch devices.
    // Immediately bail out on any mobile, tablet, or touch-capable screen.
    if (typeof window === "undefined") return;

    const isTouchOrMobile =
      window.innerWidth < 1024 ||
      "ontouchstart" in window ||
      (navigator && navigator.maxTouchPoints > 0) ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(hover: none)").matches;

    if (isTouchOrMobile) {
      document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-stopped");
      return;
    }

    let lenis;
    let animationFrameId;

    try {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 0,
        syncTouch: false,
      });

      function raf(time) {
        lenis?.raf(time);
        animationFrameId = requestAnimationFrame(raf);
      }

      animationFrameId = requestAnimationFrame(raf);
    } catch {
      // Clean fallback to native scrolling
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (lenis) lenis.destroy();
      document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-stopped");
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4200);
  };

  const handleFindWorker = (queryOrTrade = "") => {
    if (userRole) {
      const dest =
        userRole === "admin"
          ? "/admin/login"
          : userRole === "worker"
          ? "/worker/dashboard"
          : queryOrTrade
          ? `/client/search?trade=${encodeURIComponent(queryOrTrade)}`
          : "/client/search";
      window.location.href = dest;
    } else {
      window.location.href = "/register/client";
    }
  };

  const handleJoinPro = () => {
    if (userRole === "worker") {
      window.location.href = "/worker/dashboard";
    } else if (userRole === "admin") {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/register/worker";
    }
  };

  const handleLogin = () => {
    if (userRole) {
      const dest =
        userRole === "admin"
          ? "/admin/login"
          : userRole === "worker"
          ? "/worker/dashboard"
          : "/client/search";
      window.location.href = dest;
    } else {
      window.location.href = "/login";
    }
  };

  const handleGetStarted = () => {
    if (userRole) {
      const dest =
        userRole === "admin"
          ? "/admin/login"
          : userRole === "worker"
          ? "/worker/dashboard"
          : "/client/search";
      window.location.href = dest;
    } else {
      window.location.href = "/register/client";
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#FAF9F5] text-[#1B1B1B] selection:bg-[#181818] selection:text-white relative">
      {/* 1. Floating Nav */}
      <Navbar
        language={language}
        onSelectLanguage={setLanguage}
        onFindWorker={() => handleFindWorker()}
        onLogin={handleLogin}
        onGetStarted={handleGetStarted}
        userRole={userRole}
      />

      <main id="main-content">
        {/* 1. Hero */}
        <Hero
          onSearch={(query) => handleFindWorker(query)}
          onExploreStudio={handleJoinPro}
        />

        {/* 2. Trust Strip marquee */}
        <TrustMarquee />

        {/* 3. Floating Visual Collage (5 Trust Pillars) */}
        <VisualCollage
          onExplore={() => handleFindWorker()}
        />

        {/* 4. Manifesto */}
        <Manifesto />

        {/* 5. How It Works (4-Step Process & Direct Chapa Payments) */}
        <BrandOS
          onOpenContract={() => handleFindWorker()}
          onFindWorker={() => handleFindWorker()}
        />

        {/* 6. Frequently Asked Questions (FAQ) */}
        <LumioStudio customFaqs={initialFaqs} />

        {/* 7. Explore Categories */}
        <ExploreCategories onFindWorker={(catName) => handleFindWorker(catName)} />

        {/* 8. Features & Toolset */}
        <TeamUseCases
          onFindWorker={() => handleFindWorker()}
          onJoinPro={handleJoinPro}
        />

        {/* 9. Testimonials */}
        <Testimonial customTestimonials={initialTestimonials} />

        {/* 10. Problem, Solution, Benefit Cards */}
        <LatestUpdates
          onFindWorker={() => handleFindWorker()}
          onSelectArticle={(article) => setSelectedArticle(article)}
        />

        {/* 11. Call to Action */}
        <CallToAction
          onFindWorker={() => handleFindWorker()}
          onJoinPro={handleJoinPro}
        />
      </main>

      {/* 12. Deep Black Rounded Footer */}
      <Footer
        language={language}
        onSelectLanguage={setLanguage}
        onFindWorker={() => handleFindWorker()}
        onJoinPro={handleJoinPro}
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
          handleFindWorker(selectedCard?.trade || "");
        }}
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
