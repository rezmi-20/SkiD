"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sparkles,
  Sun,
  Moon,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  SlidersHorizontal,
  Search,
  MessageSquare,
  Users,
  Bell,
  User,
  Briefcase,
  FileCheck,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  HardHat,
  Monitor,
  Smartphone,
} from "lucide-react";

export interface OnboardingProps {
  userRole?: "client" | "worker";
  userName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: (preferences: { theme: string; language: string }) => void;
  /**
   * If true, enables preview controls for demo playground
   */
  isDemo?: boolean;
}

const STORAGE_KEY = "skid_onboarding_completed";

interface StepContent {
  badge: string;
  title: string;
  description: string;
  guideQuote: string;
}

interface TourStep {
  desktopTargetId: string;
  mobileTargetId: string;
  icon: React.ReactNode;
  content: {
    en: StepContent;
    am: StepContent;
    om: StepContent;
  };
}

export default function FirstTimeOnboardingModal({
  userRole = "client",
  userName = "",
  isOpen = false,
  onClose,
  onComplete,
  isDemo = false,
}: OnboardingProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(isOpen);

  // Phase: "setup" (preferences) or "tour" (guided walkthrough)
  const [phase, setPhase] = useState<"setup" | "tour">("setup");
  const [tourIndex, setTourIndex] = useState(0);

  // Local preferences
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("dark");
  const [selectedLang, setSelectedLang] = useState<"en" | "am" | "om">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("direskill-lang");
      if (saved === "am" || saved === "om" || saved === "en") return saved;
    }
    return (language as "en" | "am" | "om") || "en";
  });

  // Viewport detection: mobile vs desktop
  const [isDesktop, setIsDesktop] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isDemo) {
      try {
        const completed = localStorage.getItem(STORAGE_KEY);
        if (!completed) {
          setModalOpen(true);
        }
      } catch {}
    } else {
      setModalOpen(isOpen);
    }
  }, [isOpen, isDemo]);

  useEffect(() => {
    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      setSelectedTheme(resolvedTheme);
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (language === "en" || language === "am" || language === "om") {
      setSelectedLang(language);
    }
  }, [language]);

  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // 8 Comprehensive steps covering the complete platform lifecycle
  const tourSteps: TourStep[] = [
    {
      desktopTargetId: "tour-sidebar-dashboard",
      mobileTargetId: "tour-dashboard-actions-mobile",
      icon: <LayoutDashboard className="w-4 h-4" />,
      content: {
        en: {
          badge: "Command Center",
          title: "1. Your Dashboard & Quick Actions",
          description:
            "This is your primary launchpad. Track live stats (spent/earned, active hires, and completed jobs) and tap quick shortcuts for searches, contract PIN setup, and payments.",
          guideQuote: "Welcome! I'm Dawit, your DireSkill guide. Use these quick launch buttons for fast daily actions.",
        },
        am: {
          badge: "ዋና ዳሽቦርድ",
          title: "1. የእርስዎ ዳሽቦርድ እና ፈጣን አቋራጮች",
          description:
            "ይህ የእርስዎ ዋና የስራ ማዕከል ነው። የወጣ ወጪን፣ ገቢዎችን እና ንቁ ፕሮጀክቶችን በቅጽበት ይከታተሉ፤ ፈጣን አቋራጮችን በመጠቀም ባለሙያ ይፈልጉ ወይም ክፍያዎችን ያረጋግጡ።",
          guideQuote: "እንኳን ደህና መጡ! እኔ ዳዊት ነኝ፣ የዲሬስኪል መመሪያዎ። እነዚህን አቋራጮች ለዕለታዊ ፈጣን ስራ ይጠቀሙባቸው።",
        },
        om: {
          badge: "Wiirtuu Hojii",
          title: "1. Daashboordii fi Kallattiiwwan Saffisaa",
          description:
            "Kuni wiirtuu hojii keessaniiti. Baasii, galii fi hojiiwwan jiran hordofaa; kallattiiwwan saffisaan ogeessa barbaadaa yookiin kaffaltii raawwadhaa.",
          guideQuote: "Baga nagaan dhuftan! Ani Daawwit, qajeelchaa keessani. Kallattiiwwan kanneen hojii saffisaaf fayyadamaa.",
        },
      },
    },
    {
      desktopTargetId: userRole === "worker" ? "tour-sidebar-mygigs" : "tour-sidebar-discover",
      mobileTargetId: userRole === "worker" ? "tour-gigs" : "tour-search",
      icon: userRole === "worker" ? <Briefcase className="w-4 h-4" /> : <Search className="w-4 h-4" />,
      content: {
        en: {
          badge: userRole === "worker" ? "Gigs Hub" : "Marketplace",
          title: userRole === "worker" ? "2. Gigs & Incoming Work" : "2. Finding Fayda-Verified Artisans",
          description:
            userRole === "worker"
              ? "Browse incoming project requests from clients across Dire Dawa. Filter by trade and nearby Kebele to accept jobs that fit your availability."
              : "Discover certified electricians, plumbers, and mechanics across Kebele 01-09. Check national ID authenticity badges and real customer ratings before hiring.",
          guideQuote: "Every artisan has their government Fayda ID verified by our team for total household safety.",
        },
        am: {
          badge: userRole === "worker" ? "የስራ ጥሪዎች" : "የገበያ ቦታ",
          title: userRole === "worker" ? "2. የስራ ጥሪዎች እና ማስታወቂያዎች" : "2. በፋይዳ የተረጋገጡ ባለሙያዎችን መፈለግ",
          description:
            userRole === "worker"
              ? "በዲሬዳዋ ዙሪያ ካሉ ደንበኞች የሚመጡ የስራ ጥያቄዎችን ይመልከቱ። በሚመችዎት ቀበሌ እና ሰዓት ስራዎችን በቀላሉ ይቀበሉ።"
              : "በቀበሌ 01-09 ያሉ ኤሌክትሪሻኖችን፣ ቧንቧ ሰራተኞችን እና መካኒኮችን ይፈልጉ። ከመቅጠርዎ በፊት የመንግስት የፋይዳ ማረጋገጫ ባጁን እና ግምገማዎችን ይመልከቱ።",
          guideQuote: "እያንዳንዱ ባለሙያ ለቤተሰብዎ ደህንነት ሲባል ህጋዊ የፋይዳ ብሄራዊ መታወቂያው የተረጋገጠ ነው።",
        },
        om: {
          badge: userRole === "worker" ? "Hojiiwwan" : "Gabaa Ogeeyyii",
          title: userRole === "worker" ? "2. Gaaffii Hojii fi Beeksisa" : "2. Ogeeyyii Faydaan Mirkanaa'an Barbaaduu",
          description:
            userRole === "worker"
              ? "Gaaffiiwwan hojii maamiltoota Dirree Dhawaa irraa dhufe ilaalaa. Bakkaafi yeroo isiniif mijatutti hojii simadhaa."
              : "Ogeeyyii elektiriikii, bishaanii fi makaanikaa ganda 01-09 keessa jiran barbaadaa. Waraqaa eenyummaa Faydaa fi yaada maamiltootaa ilaalaa.",
          guideQuote: "Ogeessi hundi nageenya keessaniif jecha waraqaan eenyummaa Faydaa isaanii kan mirkanaa'edha.",
        },
      },
    },
    {
      desktopTargetId: "tour-sidebar-contracts",
      mobileTargetId: "tour-home",
      icon: <FileCheck className="w-4 h-4" />,
      content: {
        en: {
          badge: "Legal Protection",
          title: "3. Enforceable Digital Contracts Hub",
          description:
            "Every job generates a binding contract compliant with Ethiopian Labour Proclamation 1156/2019. Review agreed terms, milestones, and apply your 4-digit cryptographic signature PIN.",
          guideQuote: "Each contract generates a tamper-proof SHA-256 hash and QR code recognized as court evidence.",
        },
        am: {
          badge: "ህጋዊ ውል",
          title: "3. ህጋዊ የዲጂታል ውል ማዕከል",
          description:
            "እያንዳንዱ ስራ በኢትዮጵያ የስራ አዋጅ ቁጥር 1156/2019 መሰረት ህጋዊ ተፈጻሚነት ያለው ውል ያመነጫል። ውሉን መርምረው በ4 አሃዝ ሚስጥር ቁጥርዎ (PIN) በዲጂታል ይፈርሙ።",
          guideQuote: "እያንዳንዱ ውል በፍርድ ቤት ህጋዊ ማስረጃ ሆኖ የሚያገለግል የSHA-256 ማረጋገጫ ኮድ እና QR ኮድ ይዟል።",
        },
        om: {
          badge: "Waliigaltee Seeraa",
          title: "3. Wiirtuu Waliigaltee Dijitaalaa Seera Qabeessaa",
          description:
            "Hojiin hundi Labsii Hojjataa fi Hojjechiisaa Itoophiyaa Lakk. 1156/2019 tiin waliigaltee seera qabeessa uuma. Lakkoofsa icciitii (PIN) keessaniin mallatteessaa.",
          guideQuote: "Waliigalteen hundi koodii SHA-256 fi QR mana murtiitti fudhatama qabu qaba.",
        },
      },
    },
    {
      desktopTargetId: userRole === "worker" ? "tour-sidebar-earnings" : "tour-sidebar-payments",
      mobileTargetId: "tour-home",
      icon: <CreditCard className="w-4 h-4" />,
      content: {
        en: {
          badge: "Chapa Escrow",
          title: "4. Escrow Protected Payments",
          description:
            "Never pay cash blindly. Funds are safely held in digital escrow via Chapa and mobile money (Telebirr/CBE). Funds release only after you inspect and approve the job.",
          guideQuote: "If work isn't completed to standard, funds remain safely protected in escrow.",
        },
        am: {
          badge: "የቻፓ ዋስትና",
          title: "4. በእስክሮው (Escrow) የተጠበቁ ክፍያዎች",
          description:
            "በጭፍን በጥሬ ገንዘብ አይክፈሉ። ገንዘብዎ በቻፓ እና በቴሌብር ዋስትና ተይዞ ይቆያል። ገንዘቡ የሚለቀቀው ስራውን አይተው ሲያጸድቁ ብቻ ነው።",
          guideQuote: "ስራው በሚፈለገው ደረጃ ካልተሰራ፣ ገንዘብዎ በዋስትና ተጠብቆ ይቆያል።",
        },
        om: {
          badge: "Wabiin Kaffaltii",
          title: "4. Kaffaltii Wabii Dijitaalaatiin Eegame",
          description:
            "Garaa laafinaan harkaan kaffaltii hin raawwatinaa. Qarshiin keessan karaa Chapa fi Telebirr qabamee tura. Hojiin sirriitti xumuramee yoo mirkanaa'e qofa kaffalama.",
          guideQuote: "Hojiin qulqullinaan yoo xumuramuu baate, qarshiin keessan wabiidhaan eegamee tura.",
        },
      },
    },
    {
      desktopTargetId: "tour-sidebar-chat",
      mobileTargetId: "tour-chat",
      icon: <MessageSquare className="w-4 h-4" />,
      content: {
        en: {
          badge: "Private Messaging",
          title: "5. Real-Time Chat & Contact Masking",
          description:
            "Message workers directly to negotiate price and share work photos. Personal phone numbers are masked automatically to keep you safe from off-platform harassment.",
          guideQuote: "All evidence and project photos shared in chat are preserved for contract and dispute records.",
        },
        am: {
          badge: "የግል መልእክት",
          title: "5. ደህንነቱ የተጠበቀ የውስጥ መልእክት",
          description:
            "ስለ ዋጋ ለመነጋገር እና የስራ ፎቶዎችን ለመላክ ከባለሙያው ጋር በቀጥታ ይወያዩ። የግል ስልክ ቁጥርዎ እንዳይባክን በራስ-ሰር ተደብቆ ይቆያል።",
          guideQuote: "በውይይት ውስጥ የሚላኩ ፎቶዎች እና ማስረጃዎች ለውል እና ለሙግት ጊዜ በህጋዊነት ይቀመጣሉ።",
        },
        om: {
          badge: "Ergaa Dhuunfaa",
          title: "5. Ergaa Nageenyi Isaa Eegame",
          description:
            "Gatii walii galuu fi suuraa hojii erguuf ogeessa waliin kallattiin haasa'aa. Lakkoofsi bilbilaa keessan nageenyaaf jecha dhokfamee tura.",
          guideQuote: "Suuraaleen ergaa keessatti ergaman ragaa waliigaltee fi falmiif ni qabamu.",
        },
      },
    },
    {
      desktopTargetId: "tour-sidebar-feed",
      mobileTargetId: "tour-community",
      icon: <Users className="w-4 h-4" />,
      content: {
        en: {
          badge: "Local Community",
          title: "6. Dire Dawa Trade Community & Tips",
          description:
            "Ask home repair questions, get seasonal maintenance tips from fellow residents, and see real before/after project photos from Dire Dawa artisans.",
          guideQuote: "A great place to discover reliable tips for painting, electrical repairs, and plumbing.",
        },
        am: {
          badge: "የአካባቢ ማህበረሰብ",
          title: "6. የዲሬዳዋ የሙያ ማህበረሰብ እና ምክሮች",
          description:
            "የቤት ጥገና ጥያቄዎችን ይጠይቁ፣ ከአካባቢው ነዋሪዎች ወቅታዊ ምክሮችን ያግኙ፣ እና የዲሬዳዋ ባለሙያዎችን የስራ ውጤቶች ይመልከቱ።",
          guideQuote: "ስለ ቀለም፣ ኤሌክትሪክ እና ቧንቧ ስራዎች ጠቃሚ ምክሮችን እዚህ ያገኛሉ።",
        },
        om: {
          badge: "Hawaasa Naannoo",
          title: "6. Hawaasa Hojii fi Gorsa Dirree Dhawaa",
          description:
            "Gaaffii suphaa mana keessanii gaafadhaa, gorsa gaarii argadhaa, fi hojiiwwan ogeeyyii Dirree Dhawaa ilaalaa.",
          guideQuote: "Waa'ee halluu, elektiriikii fi bishaanii ilaalchisee bakka gorsi gaariin itti argamudha.",
        },
      },
    },
    {
      desktopTargetId: "tour-notifications",
      mobileTargetId: "tour-notifications",
      icon: <Bell className="w-4 h-4" />,
      content: {
        en: {
          badge: "Alerts & Arbitration",
          title: "7. Live Alerts & Fair Dispute Center",
          description:
            "Your notification bell alerts you on job acceptance, contract progress, and payment approvals. If an issue arises, open a dispute to freeze escrow for fair admin arbitration.",
          guideQuote: "Our institutional support staff arbitrates disputes with real uploaded photographic evidence.",
        },
        am: {
          badge: "ማሳወቂያ እና ሙግት",
          title: "7. ፈጣን ማሳወቂያዎች እና የሙግት ማዕከል",
          description:
            "የስራ መቀበል፣ የውል መፈረም እና የክፍያ ሁኔታዎችን በማሳወቂያ ደወሉ ይከታተሉ። ችግር ከተፈጠረ ሙግት በመክፈት ገንዘብዎን በማገድ በአስተዳዳሪ እንዲታይ ማድረግ ይችላሉ።",
          guideQuote: "የድጋፍ ቡድናችን የቀረበውን የፎቶ ማስረጃ እና ውል አይቶ ፍትሃዊ ውሳኔ ይሰጣል።",
        },
        om: {
          badge: "Beeksisa fi Falmii",
          title: "7. Beeksisa Yeroo fi Wiirtuu Falmii",
          description:
            "Hojiin simatamuusaa, waliigaltee fi kaffaltii beeksisaan hordofaa. Rakkoon yoo uumame falmii banuun qarshii ugguruun qaama dhimmi laallatuun akka ilaalamu gochuu dandeessu.",
          guideQuote: "Gareen deeggarsaa ragaalee suuraa fi waliigaltee ilaaluun murtii haqa qabeessa kenna.",
        },
      },
    },
    {
      desktopTargetId: "tour-sidebar-profile",
      mobileTargetId: "tour-profile",
      icon: <User className="w-4 h-4" />,
      content: {
        en: {
          badge: "Security Vault",
          title: "8. Profile, Security PIN & Settings",
          description:
            "Your Profile is where you manage: Fayda national ID verification status, personal 4-digit contract signing PIN, bank/Telebirr accounts, and Dark/Light mode preferences.",
          guideQuote: "You're all set! Enjoy DireSkill's verified marketplace in Dire Dawa.",
        },
        am: {
          badge: "የግል ማዕከል",
          title: "8. የግል ፕሮፋይል፣ የደህንነት ፒን እና ቅንብሮች",
          description:
            "በፕሮፋይልዎ ውስጥ፡ የፋይዳ ብሄራዊ መታወቂያ ሁኔታን፣ የዲጂታል ፊርማ 4 አሃዝ ፒን (PIN)፣ የባንክ/ቴሌብር አካውንትዎን እና የገጽታ/ቋንቋ ምርጫዎችን ያገኛሉ።",
          guideQuote: "ዝግጅትዎን አጠናቀዋል! በዲሬዳዋ አስተማማኝ የሙያ ገበያን በነፃነት ይጠቀሙ።",
        },
        om: {
          badge: "Iccitiifi Qindaa'ina",
          title: "8. Piroofaayilii, PIN Nageenyaa fi Qindaa'ina",
          description:
            "Piroofaayilii keessatti: Eenyummaa Faydaa mirkaneessuu, PIN mallattoo dijitaalaa, herrega baankii/Telebirr fi qindaa'ina ifaa/dukkanaa argattu.",
          guideQuote: "Qophiin xumurameera! Gabaa ogeeyyii mirkanaa'e Dirree Dhawaa keessatti gammachuun fayyadamaa.",
        },
      },
    },
  ];

  // Recalculate target element rect for spotlight
  useEffect(() => {
    if (phase !== "tour" || !modalOpen) {
      setSpotlightRect(null);
      return;
    }

    const currentTourStep = tourSteps[tourIndex];
    if (!currentTourStep) return;

    const targetId = isDesktop
      ? currentTourStep.desktopTargetId
      : currentTourStep.mobileTargetId;

    const updateTarget = () => {
      let el = document.getElementById(targetId);
      if (!el && isDesktop) {
        if (targetId.includes("discover") || targetId.includes("mygigs")) {
          el = document.getElementById("tour-sidebar-discover") || document.getElementById("tour-sidebar-mygigs");
        } else if (targetId.includes("payments") || targetId.includes("earnings")) {
          el = document.getElementById("tour-sidebar-payments") || document.getElementById("tour-sidebar-earnings");
        }
      }
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlightRect(rect);
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      } else {
        setSpotlightRect(null);
      }
    };

    updateTarget();
    const handleResize = () => updateTarget();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [phase, tourIndex, isDesktop, modalOpen]);

  if (!mounted || !modalOpen) return null;

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  const handleLanguageChange = (newLang: "en" | "am" | "om") => {
    setSelectedLang(newLang);
    setLanguage(newLang);
  };

  const handleFinish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    if (onComplete) {
      onComplete({ theme: selectedTheme, language: currentLang });
    }
    setModalOpen(false);
    if (onClose) onClose();
  };

  const handleSkip = () => {
    handleFinish();
  };

  // Always derive active language reactively from LanguageContext, falling back to selectedLang or 'en'
  const currentLang: "en" | "am" | "om" =
    language === "am" || language === "om" || language === "en"
      ? language
      : selectedLang === "am" || selectedLang === "om"
      ? selectedLang
      : "en";

  const currentTourStep = tourSteps[tourIndex];
  const currentContent = currentTourStep.content[currentLang] || currentTourStep.content.en;

  // Dynamic arrow vertical offset for desktop sidebar
  const getSidebarArrowTop = () => {
    if (!spotlightRect) return 24;
    const cardTop = parseInt(getCardStyle().top as string, 10) || 96;
    const targetCenter = spotlightRect.top + spotlightRect.height / 2;
    const idealArrowTop = targetCenter - cardTop - 8;
    return Math.max(16, Math.min(220, idealArrowTop));
  };

  // Calculate dynamic card positioning and arrow alignment
  const getCardStyle = () => {
    if (!spotlightRect) {
      return {
        top: "55%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const targetCenterX = spotlightRect.left + spotlightRect.width / 2;

    if (isDesktop && (currentTourStep.desktopTargetId.startsWith("tour-sidebar") || isSidebarTarget)) {
      // Desktop: place card to the right of the sidebar item
      const left = spotlightRect.right + 20;
      // Track each sidebar step smoothly down
      const targetCenter = spotlightRect.top + spotlightRect.height / 2;
      const calculatedTop = targetCenter - 24;
      const minTop = 130;
      const maxTop = Math.max(minTop, window.innerHeight - 440);
      const top = Math.max(minTop, Math.min(maxTop, calculatedTop));
      return {
        left: `${left}px`,
        top: `${top}px`,
      };
    }

    // Top elements like notifications
    if (currentTourStep.desktopTargetId === "tour-notifications" || spotlightRect.top < 150) {
      return {
        top: `${spotlightRect.bottom + 140}px`,
        left: `${Math.max(16, Math.min(window.innerWidth - 370, targetCenterX - 180))}px`,
      };
    }

    // Mobile bottom navigation elements
    return {
      bottom: `${window.innerHeight - spotlightRect.top + 16}px`,
      left: `${Math.max(16, Math.min(window.innerWidth - 370, targetCenterX - 180))}px`,
    };
  };

  // Determine which side the arrow should be on
  const isSidebarTarget = isDesktop && currentTourStep.desktopTargetId.startsWith("tour-sidebar");
  const isTopTarget =
    currentTourStep.desktopTargetId === "tour-notifications" || (spotlightRect && spotlightRect.top < 150);

  return (
    <>
      {/* ==================================================================== */}
      {/* PHASE 1: PREFERENCES & WELCOME SETUP SCREEN                          */}
      {/* ==================================================================== */}
      {phase === "setup" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="min-h-full w-full flex flex-col items-center justify-center p-3 sm:p-4 pt-36 sm:pt-40 pb-4 sm:pb-6">
            <div className="relative w-full max-w-lg my-auto">
              {/* Cutout Worker Avatar Standing Behind & Gripping Only the Top Rim (Zero text overlap) */}
              <div className="absolute -top-[120px] sm:-top-[128px] left-1/2 -translate-x-1/2 w-[135px] sm:w-[145px] pointer-events-none z-20 flex justify-center select-none">
                <img
                  src="/images/worker_holding_card.png"
                  alt="Dawit, DireSkill Guide"
                  className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* The Modal Card - Wrapped in rounded-3xl with overflow-hidden for 100% smooth wrapped corners */}
              <div className="relative z-10 w-full rounded-3xl bg-[#0f141c] text-white border border-[#84cc16]/50 shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
                {/* Ambient Top Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-[#84cc16]/20 blur-[60px] pointer-events-none rounded-full" />

                {/* Header with Greeting with generous top padding to guarantee zero overlap */}
                <div className="relative px-5 sm:px-6 pt-6 sm:pt-7 pb-3 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#84cc16]">
                        {currentLang === "am" ? "የእንኳን ደህና መጡ ዝግጅት" : currentLang === "om" ? "Qophii Simannaa" : "Welcome Setup"}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {isDesktop ? "Desktop Mode" : "Mobile View"}
                      </span>
                    </div>
                    <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5">
                      {currentLang === "am"
                        ? "ዲሬስኪልን ለእርስዎ ምቹ ያድርጉ"
                        : currentLang === "om"
                        ? "DireSkill Isiniif Mijeessaa"
                        : "Personalize Your Experience"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {currentLang === "am" ? "ዝለል" : currentLang === "om" ? "Darbi" : "Skip"}
                  </button>
                </div>

                {/* Scrollable Setup Content */}
                <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto space-y-4 sm:space-y-5 max-h-[58vh]">
              {/* Avatar Speech Bubble */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  👋
                </div>
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-white">
                    {currentLang === "am"
                      ? "ሰላም! እኔ ዳዊት ነኝ፣ የዲሬስኪል መመሪያዎ።"
                      : currentLang === "om"
                      ? "Akkam! Ani Daawwit, qajeelchaa DireSkill ti."
                      : "Hi! I'm Dawit, your verified DireSkill guide."}
                  </p>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {currentLang === "am"
                      ? "ከመጀመራችን በፊት የሚመርጡትን ቋንቋ እና የገጽታ ሁነታ ይምረጡ።"
                      : currentLang === "om"
                      ? "Giddugala keenya fayyadamuun dura afaan fi bifa barbaaddan filadhaa."
                      : "Choose your primary language and appearance mode before we take a full tour."}
                  </p>
                </div>
              </div>

              {/* 1. Language Radio Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 block">
                  {currentLang === "am" ? "ቋንቋ ይምረጡ" : currentLang === "om" ? "Afaan Filadhaa" : "Select Language"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "en", label: "English", sub: "International" },
                    { id: "am", label: "አማርኛ", sub: "የዲሬዳዋ ቋንቋ" },
                    { id: "om", label: "Oromoo", sub: "Dirree Dhawaa" },
                  ].map((langItem) => (
                    <button
                      key={langItem.id}
                      type="button"
                      onClick={() => handleLanguageChange(langItem.id as any)}
                      className={`p-3 rounded-2xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        currentLang === langItem.id
                          ? "bg-[#161d27] border-[#84cc16] text-white ring-1 ring-[#84cc16] shadow-sm"
                          : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="text-xs font-extrabold">{langItem.label}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{langItem.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Appearance Radio Boxes (Visual Preview) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 block">
                  {currentLang === "am" ? "የገጽታ ሁነታ (Appearance)" : currentLang === "om" ? "Bifa Mul'ataa" : "Choose Appearance Mode"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* DARK MODE BOX */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedTheme === "dark"
                        ? "bg-[#161d27] border-[#84cc16] ring-1 ring-[#84cc16] shadow-[0_0_20px_rgba(132,204,22,0.18)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                            selectedTheme === "dark"
                              ? "bg-[#84cc16] text-[#0d1406]"
                              : "bg-white/10 text-zinc-400"
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedTheme === "dark"
                              ? "border-[#84cc16] bg-[#84cc16] text-[#0d1406]"
                              : "border-white/30"
                          }`}
                        >
                          {selectedTheme === "dark" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {currentLang === "am" ? "ጥቁር ሁነታ" : currentLang === "om" ? "Dukkana" : "Dark Mode"}
                        </h4>
                        <p className="text-[10px] text-zinc-400">
                          {currentLang === "am" ? "ባትሪ ቆጣቢ" : currentLang === "om" ? "Baatrii qusata" : "OLED battery saving"}
                        </p>
                      </div>

                      <div className="p-2 rounded-lg bg-[#0b0e14] border border-white/10 space-y-1">
                        <div className="h-1.5 w-8 rounded-full bg-white/20" />
                        <div className="h-2.5 rounded bg-[#84cc16]/80" />
                      </div>
                    </div>
                  </button>

                  {/* LIGHT MODE BOX */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedTheme === "light"
                        ? "bg-[#f8fafc] text-zinc-900 border-[#84cc16] ring-1 ring-[#84cc16] shadow-[0_0_20px_rgba(132,204,22,0.22)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                            selectedTheme === "light"
                              ? "bg-amber-500 text-white"
                              : "bg-white/10 text-zinc-400"
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedTheme === "light"
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-white/30"
                          }`}
                        >
                          {selectedTheme === "light" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <h4
                          className={`text-xs font-bold ${
                            selectedTheme === "light" ? "text-zinc-900" : "text-white"
                          }`}
                        >
                          {currentLang === "am" ? "ነጭ ሁነታ" : currentLang === "om" ? "Ifaa" : "Light Mode"}
                        </h4>
                        <p
                          className={`text-[10px] ${
                            selectedTheme === "light" ? "text-zinc-600" : "text-zinc-400"
                          }`}
                        >
                          {currentLang === "am" ? "ለቀን ብርሃን" : currentLang === "om" ? "Ifa guyyaaf" : "High daylight clarity"}
                        </p>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-1 shadow-sm">
                        <div className="h-1.5 w-8 rounded-full bg-slate-300" />
                        <div className="h-2.5 rounded bg-emerald-600" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-white/10 bg-[#0c1017] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {currentLang === "am" ? "ዝለል" : currentLang === "om" ? "Darbi" : "Skip Setup"}
              </button>

              <button
                type="button"
                onClick={() => setPhase("tour")}
                className="px-5 py-2.5 rounded-full bg-[#84cc16] hover:bg-[#a3e635] text-[#0d1406] font-extrabold text-xs transition-all shadow-[0_4px_16px_rgba(132,204,22,0.3)] flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{currentLang === "am" ? "ጉብኝቱን ጀምር" : currentLang === "om" ? "Daawwannaa Jalqabi" : "Start Guided Tour"}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* ==================================================================== */}
      {/* PHASE 2: SPOTLIGHT WALKTHROUGH WITH AVATAR & DIRECTIONAL ARROWS     */}
      {/* ==================================================================== */}
      {phase === "tour" && (
        <div className="fixed inset-0 z-50 pointer-events-auto">
          {/* Dark Backdrop Overlay */}
          <div
            onClick={handleSkip}
            className="fixed inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300"
          />

          {/* Target Element Glow Ring Spotlight */}
          {spotlightRect && (
            <div
              style={{
                top: `${spotlightRect.top - 6}px`,
                left: `${spotlightRect.left - 6}px`,
                width: `${spotlightRect.width + 12}px`,
                height: `${spotlightRect.height + 12}px`,
              }}
              className="fixed rounded-2xl border-2 border-[#84cc16] shadow-[0_0_35px_rgba(132,204,22,0.7)] pointer-events-none animate-pulse transition-all duration-300"
            />
          )}

          {/* Floating Tour Card with Avatar and Pointer Arrow */}
          <div
            style={getCardStyle()}
            className="fixed z-50 w-[330px] sm:w-[370px] transition-all duration-300 animate-in fade-in zoom-in-95"
          >
            <div className="relative pt-7 pb-5 px-5 sm:pt-8 sm:px-6 rounded-3xl bg-[#12161f] text-white border border-[#84cc16]/50 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl space-y-3.5">
              {/* Large Cutout Worker Mascot Standing Behind and Gripping Only Card Top Edge (Zero text overlap) */}
              <div className="absolute -top-[116px] sm:-top-[122px] left-1/2 -translate-x-1/2 w-[130px] sm:w-[140px] pointer-events-none z-20 flex justify-center select-none">
                <img
                  src="/images/worker_holding_card.png"
                  alt="Dawit, DireSkill Guide"
                  className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
                />
              </div>

              {/* Card Top: Tour Progress & Live Trilingual Controls with clear clearance */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 gap-2 mt-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#84cc16] uppercase tracking-wider">
                      {currentLang === "am" ? "ዳዊት • መመሪያ" : currentLang === "om" ? "Daawwit • Qajeelchaa" : "Dawit • Guide"}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold shrink-0">
                      VERIFIED
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono block truncate">
                    {currentLang === "am"
                      ? `ደረጃ ${tourIndex + 1} ከ ${tourSteps.length}`
                      : currentLang === "om"
                      ? `Tarkaanfii ${tourIndex + 1}/${tourSteps.length}`
                      : `Step ${tourIndex + 1} of ${tourSteps.length}`}{" "}
                    &bull; {currentContent.badge}
                  </span>
                </div>

                {/* Right Header: Trilingual Switcher & Skip Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center bg-black/60 rounded-full p-0.5 border border-white/10">
                    {[
                      { id: "en", label: "EN" },
                      { id: "am", label: "አማ" },
                      { id: "om", label: "ORO" },
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => handleLanguageChange(l.id as "en" | "am" | "om")}
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-black transition-all cursor-pointer ${
                          currentLang === l.id
                            ? "bg-[#84cc16] text-[#0d1406] shadow-xs"
                            : "text-zinc-400 hover:text-white"
                        }`}
                        title={`Switch language to ${l.label}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label="Skip Tour"
                  >
                    {currentLang === "am" ? "ዝለል" : currentLang === "om" ? "Darbi" : "Skip"}
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span className="text-[#84cc16] shrink-0">{currentTourStep.icon}</span>
                  <span className="leading-snug">{currentContent.title}</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {currentContent.description}
                </p>
              </div>

              {/* Guide Speech Bubble */}
              <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-[#84cc16]/25 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#84cc16]/15 border border-[#84cc16]/30 text-[#84cc16] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  💡
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#84cc16]">
                    {currentLang === "am" ? "የዳዊት ጠቃሚ ምክር" : currentLang === "om" ? "Gorsa Daawwit" : "Dawit's Tip"}
                  </div>
                  <p className="text-[11px] text-zinc-200 leading-snug italic">
                    &ldquo;{currentContent.guideQuote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                {tourIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => setTourIndex((i) => i - 1)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>{currentLang === "am" ? "ወደኋላ" : currentLang === "om" ? "Duubatti" : "Back"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPhase("setup")}
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {currentLang === "am" ? "ምርጫዎች" : currentLang === "om" ? "Qindaa'ina" : "Preferences"}
                  </button>
                )}

                <div className="flex items-center gap-2">
                  {tourIndex < tourSteps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setTourIndex((i) => i + 1)}
                      className="px-4 py-2 rounded-full bg-[#84cc16] hover:bg-[#a3e635] text-[#0d1406] font-extrabold text-xs transition-all shadow-[0_4px_16px_rgba(132,204,22,0.3)] flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>{currentLang === "am" ? "ቀጣይ" : currentLang === "om" ? "Itti Fufi" : "Next"}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="px-4 py-2 rounded-full bg-[#84cc16] hover:bg-[#a3e635] text-[#0d1406] font-extrabold text-xs transition-all shadow-[0_4px_20px_rgba(132,204,22,0.4)] flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{currentLang === "am" ? "ጉብኝቱን ጨርስ" : currentLang === "om" ? "Daawwannaa Xumuri" : "Finish Tour"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Directional Pointer Arrow */}
              {isSidebarTarget ? (
                /* Left-pointing arrow targeting desktop sidebar with dynamic vertical tracking */
                <div
                  style={{ top: `${getSidebarArrowTop()}px` }}
                  className="absolute -left-2 w-4 h-4 bg-[#12161f] border-l border-b border-[#84cc16]/50 rotate-45 transform transition-all duration-200"
                />
              ) : isTopTarget ? (
                /* Upward-pointing arrow targeting top navigation bar items */
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#12161f] border-l border-t border-[#84cc16]/50 rotate-45 transform" />
              ) : (
                /* Downward-pointing arrow targeting mobile bottom capsule items */
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#12161f] border-r border-b border-[#84cc16]/50 rotate-45 transform" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
