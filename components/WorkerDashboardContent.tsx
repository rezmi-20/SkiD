"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { acceptJob, rejectJob } from "@/lib/actions/jobs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/context/LanguageContext";
import {
  RiNotification3Line,
  RiCheckLine,
  RiCloseLine,
  RiStarFill,
  RiMapPin2Line,
  RiTimeLine,
  RiShieldCheckFill,
  RiArrowRightLine,
  RiCalendarEventLine,
  RiBriefcaseLine,
  RiWallet3Line,
  RiSparklingLine,
  RiBuildingLine,
  RiPulseLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from "@remixicon/react";

/* ── 1. draw-svg Skill: Topographic Contour Vector Background Texture ──────── */
function TopographicContourSvg({
  className = "absolute inset-0 w-full h-full pointer-events-none opacity-20",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 800 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M-50 150 C 150 90, 260 210, 460 150 C 660 90, 760 190, 900 120"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />
      <path
        d="M-50 180 C 120 120, 230 240, 430 180 C 630 120, 730 220, 900 150"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <path
        d="M-50 210 C 90 150, 200 270, 400 210 C 600 150, 700 250, 900 180"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.3"
      />
      <path
        d="M-50 120 C 180 60, 290 180, 490 120 C 690 60, 790 160, 900 90"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.45"
      />
      <path
        d="M-50 90 C 210 30, 320 150, 520 90 C 720 30, 820 130, 900 60"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.25"
      />
      <circle cx="680" cy="80" r="140" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.2" />
      <circle cx="680" cy="80" r="95" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
      <circle cx="680" cy="80" r="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
    </svg>
  );
}

/* ── 2. draw-svg Skill: Fayda Ethiopian National ID Biometric Seal ─────────── */
function FaydaBiometricSealSvg({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="16" cy="16" r="14" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
      <path
        d="M16 7 C 20.97 7, 25 11.03, 25 16 C 25 20.97, 20.97 25, 16 25"
        stroke="#34d399"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 11 C 18.76 11, 21 13.24, 21 16 C 21 18.76, 18.76 21, 16 21"
        stroke="#6ee7b7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.5" fill="#bef264" />
    </svg>
  );
}

/* ── 3. Props Interface ──────────────────────────────────────────────────── */
interface WorkerDashboardContentProps {
  worker: {
    fullName: string;
    firstName: string;
    avatarUrl?: string | null;
    isVerified: boolean;
    verificationStatus?: string;
    district: string;
    skills: string[];
    hourlyRate?: number | string | null;
    availability?: string;
    unreadNotificationsCount?: number;
    monthlyEarned?: number;
    avgRating?: number;
    reviewCount?: number;
    latestReviews?: any[];
  };
  stats: {
    activeJobs: number;
    pendingJobs: number;
    completedJobs: number;
    revenue: number;
  };
  pendingJobs: any[];
  recentJobs: any[];
  activeContracts?: any[];
  greeting: string;
}

export default function WorkerDashboardContent({
  worker,
  stats,
  pendingJobs,
  recentJobs,
  activeContracts = [],
  greeting,
}: WorkerDashboardContentProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [activeTabJob, setActiveTabJob] = useState<any | null>(null);

  const initials = worker.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAccept = async (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAccepting(jobId);
    try {
      const result = await acceptJob(jobId);
      if (!result.success) alert(result.error);
      else {
        setActiveTabJob(null);
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || "Failed to accept job");
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRejecting(jobId);
    try {
      const result = await rejectJob(jobId);
      if (!result.success) alert(result.error);
      else {
        setActiveTabJob(null);
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || "Failed to decline job");
    } finally {
      setRejecting(null);
    }
  };

  /* ── 4. Synthesize Marketplace Gigs for Live Display (fallback if queue is empty) ── */
  const displayOffers =
    pendingJobs.length > 0
      ? pendingJobs.map((j, idx) => ({
          id: j.id,
          dateLabel: idx === 0 ? "Tomorrow" : idx === 1 ? "22 Apr" : "24-26 Apr",
          timeLabel: j.requested_date ? new Date(j.requested_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "9:00 AM - 5:00 PM",
          budgetDisplay: `${Number(j.budget || 850).toLocaleString()} ETB`,
          tradeLabel: worker.skills[0] || "Artisan Craft",
          location: j.location || "Kebele 02, Dire Dawa",
          clientName: j.client_name || "Dire Dawa Client",
          countdown: idx === 0 ? "4h : 23m" : idx === 1 ? "23h : 35m" : "2 days",
          rawJob: j,
        }))
      : [
          {
            id: "offer-mock-1",
            dateLabel: "Tomorrow",
            timeLabel: "9:00 AM - 5:00 PM",
            budgetDisplay: "850 ETB / hr",
            tradeLabel: worker.skills[0] || "Painter",
            location: "Blainville, Kebele 02",
            clientName: "Venex Construction",
            countdown: "4h : 23m",
            rawJob: null,
          },
          {
            id: "offer-mock-2",
            dateLabel: "22 Apr",
            timeLabel: "11:00 AM - 7:00 PM",
            budgetDisplay: "950 ETB / hr",
            tradeLabel: worker.skills[1] || "Electrical Wiring",
            location: "Laval, Megala District",
            clientName: "Ascent Constructions",
            countdown: "23h : 35m",
            rawJob: null,
          },
          {
            id: "offer-mock-3",
            dateLabel: "24-26 Apr",
            timeLabel: "22 Hours in Total",
            budgetDisplay: "1,200 ETB / hr",
            tradeLabel: worker.skills[2] || "Mason & Tiler",
            location: "Gende Kore, Dire Dawa",
            clientName: "Selam Engineering",
            countdown: "2 days",
            rawJob: null,
          },
        ];

  // Set default selected row to index 1 (as seen in the reference photo)
  const activeOfferId = selectedOfferId || displayOffers[1]?.id || displayOffers[0]?.id;

  /* ── 5. Synthesize Scheduled Upcoming Jobs (Cards 1..5) ──────────────────── */
  const upcomingCards = [
    {
      id: "up-1",
      isHeroDark: true,
      dayLabel: "Tomorrow",
      timeLabel: "8:00 AM - 6:00 PM",
      location: "Kebele 02, Dire Dawa",
      tradeLabel: worker.skills[0] || "Painter",
    },
    {
      id: "up-2",
      isHeroDark: false,
      dayLabel: "Thursday",
      timeLabel: "7:00 AM - 4:00 PM",
      location: "Gende Kore, Dire Dawa",
      tradeLabel: "Construction Worker",
    },
    {
      id: "up-3",
      isHeroDark: false,
      dayLabel: "Friday",
      timeLabel: "8:00 AM - 8:00 PM",
      location: "Megala Commercial",
      tradeLabel: worker.skills[1] || "Painter",
    },
    {
      id: "up-4",
      isHeroDark: false,
      dayLabel: "19 Apr",
      timeLabel: "8:00 AM - 6:00 PM",
      location: "Sabian District, DD",
      tradeLabel: worker.skills[0] || "Painter",
    },
    {
      id: "up-5",
      isHeroDark: false,
      dayLabel: "20 Apr",
      timeLabel: "8:00 AM - 6:00 PM",
      location: "Melka Jebdu, Dire Dawa",
      tradeLabel: worker.skills[2] || "Plumber",
    },
  ];

  /* ── 6. Synthesize Latest Reviews ────────────────────────────────────────── */
  const displayReview = worker.latestReviews && worker.latestReviews.length > 0
    ? worker.latestReviews[0]
    : {
        clientName: "Ascent Construction",
        clientSub: "Devon Lane",
        score: 5,
        comment:
          "Professional execution on all site milestones. Clean finishes, punctual arrival, and verified milestone release without delay.",
      };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 md:space-y-8 font-['Inter',system-ui,sans-serif] text-zinc-900 dark:text-zinc-100">
      
      {/* ───────────────────────────────────────────────────────────────────
          1. TOP ROW: WELCOME HERO + MINI PROFILE & NOTIFICATIONS
          ─────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch gap-4">
        
        {/* Left: Wide Dark Welcome Hero Card */}
        <div className="flex-1 relative rounded-[2rem] bg-[#111216] dark:bg-zinc-950 text-white p-6 sm:p-7 overflow-hidden border border-zinc-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Topographic Contour Texture */}
          <TopographicContourSvg className="absolute inset-0 w-full h-full pointer-events-none opacity-25 text-white" />

          {/* Greeting and Offer Count */}
          <div className="relative z-10 max-w-xl">
            <h1 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold tracking-tight text-white leading-tight">
              Welcome back {worker.firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed font-normal">
              You have <span className="text-emerald-400 font-semibold">{worker.unreadNotificationsCount ?? 2} unread notifications</span> and{" "}
              <span className="text-white font-semibold">{displayOffers.length} new offers</span> matching your criteria
            </p>
          </div>

          {/* Action CTA Button */}
          <div className="relative z-10 shrink-0">
            <a
              href="#gig-offers"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
            >
              See New Offers
            </a>
          </div>

        </div>

        {/* Right: Worker Mini Profile Card & Dark Notification Bell */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Mini Profile Card */}
          <Link
            href="/worker/profile"
            className="flex-1 sm:flex-initial rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 sm:p-3.5 px-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all group cursor-pointer"
          >
            {/* Avatar with Ring */}
            <div className="relative">
              <Avatar className="size-11 sm:size-12 rounded-full border border-slate-200 dark:border-zinc-700">
                {worker.avatarUrl && <AvatarImage src={worker.avatarUrl} alt={worker.fullName} />}
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {worker.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                  <RiShieldCheckFill className="size-3" />
                </div>
              )}
            </div>

            {/* Rating and Monthly Earnings */}
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-white">
                <RiStarFill className="size-3.5 text-amber-500 fill-amber-500" />
                <span>{worker.avgRating || 4.8}</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium leading-none mt-1">
                Earnings This Month
              </p>
              <p className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white leading-tight mt-0.5">
                {Number(worker.monthlyEarned || 9500).toLocaleString()} ETB
              </p>
            </div>
          </Link>

          {/* Dark Circular Notification Bell */}
          <Link
            href="/worker/notifications"
            className="size-12 sm:size-13 rounded-full bg-[#111216] dark:bg-zinc-800 text-white flex items-center justify-center relative hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors shadow-sm cursor-pointer shrink-0"
            aria-label="Notifications"
          >
            <RiNotification3Line className="size-5" />
            {(worker.unreadNotificationsCount ?? 2) > 0 && (
              <span className="absolute -top-1 -right-1 size-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                {worker.unreadNotificationsCount ?? 2}
              </span>
            )}
          </Link>

        </div>

      </div>

      {/* ───────────────────────────────────────────────────────────────────
          2. NEW GIG OFFERS SECTION (Matching the interactive reference rows)
          ─────────────────────────────────────────────────────────────────── */}
      <section id="gig-offers" className="space-y-3.5">
        
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            New Gig Offers
          </h2>
          <span className="text-xs font-medium text-zinc-400">
            {displayOffers.length} available
          </span>
        </div>

        {/* Stacked Container */}
        <div className="rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 sm:p-5 shadow-sm space-y-2.5">
          {displayOffers.map((offer) => {
            const isSelected = activeOfferId === offer.id;

            return (
              <div
                key={offer.id}
                onClick={() => setSelectedOfferId(offer.id)}
                className={`relative rounded-2xl transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#111216] text-white shadow-xl scale-[1.01] border border-zinc-800 p-4 sm:p-5"
                    : "bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100 border border-transparent hover:border-slate-100 dark:hover:border-zinc-800 p-3 sm:p-5"
                }`}
              >
                {/* ── Mobile Collapsed Row (Shown on mobile when NOT selected) ── */}
                {!isSelected && (
                  <div className="flex md:hidden items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {offer.dateLabel} • {offer.tradeLabel}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {offer.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {offer.budgetDisplay}
                      </span>
                      <RiArrowDownSLine className="size-4 text-zinc-400" />
                    </div>
                  </div>
                )}

                {/* ── Full Desktop Row OR Mobile Expanded View ── */}
                <div
                  className={`${
                    isSelected ? "flex" : "hidden md:flex"
                  } flex-col md:flex-row md:items-center justify-between gap-4 w-full`}
                >
                  {/* Column 1: Date & Time */}
                  <div className="min-w-[170px]">
                    <p className={`text-sm sm:text-base font-bold ${isSelected ? "text-white" : "text-zinc-900 dark:text-white"}`}>
                      {offer.dateLabel}
                    </p>
                    <p className={`text-xs ${isSelected ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"} mt-0.5`}>
                      {offer.timeLabel}
                    </p>
                  </div>

                  {/* Column 2: Rate / Budget & Trade */}
                  <div className="min-w-[180px]">
                    <p className={`text-sm sm:text-base font-extrabold ${isSelected ? "text-emerald-400" : "text-zinc-900 dark:text-white"}`}>
                      {offer.budgetDisplay}
                    </p>
                    <p className={`text-xs ${isSelected ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"} font-medium mt-0.5`}>
                      {offer.tradeLabel}
                    </p>
                  </div>

                  {/* Column 3: Location */}
                  <div className="min-w-[190px]">
                    <p className={`text-xs sm:text-sm font-medium ${isSelected ? "text-zinc-200" : "text-zinc-700 dark:text-zinc-300"} flex items-center gap-1.5`}>
                      <RiMapPin2Line className={`size-3.5 shrink-0 ${isSelected ? "text-emerald-400" : "text-zinc-400"}`} />
                      <span className="truncate">{offer.location}</span>
                    </p>
                  </div>

                  {/* Column 4: Client / Company */}
                  <div className="min-w-[160px]">
                    <p className={`text-xs sm:text-sm ${isSelected ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-400"} truncate`}>
                      {offer.clientName}
                    </p>
                  </div>

                  {/* Column 5: Countdown */}
                  <div className="min-w-[90px]">
                    <span className={`text-xs font-mono font-semibold ${isSelected ? "text-zinc-400" : "text-zinc-400 dark:text-zinc-500"}`}>
                      {offer.countdown}
                    </span>
                  </div>

                  {/* Column 6: Action Buttons (Check & Cross) */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
                    {/* Accept Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        if (offer.rawJob) handleAccept(offer.rawJob.id, e);
                        else handleAccept("mock", e);
                      }}
                      disabled={accepting === (offer.rawJob?.id || "mock")}
                      aria-label="Accept Gig Offer"
                      className={`flex-1 md:flex-initial h-10 px-4 sm:px-0 sm:size-10.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#22c55e] hover:bg-[#16a34a] text-zinc-950 shadow-sm"
                          : "bg-emerald-100/80 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/40"
                      }`}
                    >
                      {accepting === (offer.rawJob?.id || "mock") ? (
                        <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <RiCheckLine className="size-4 sm:size-5" />
                          <span className="inline md:hidden">Accept</span>
                        </>
                      )}
                    </button>

                    {/* Decline Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        if (offer.rawJob) handleReject(offer.rawJob.id, e);
                        else handleReject("mock", e);
                      }}
                      disabled={rejecting === (offer.rawJob?.id || "mock")}
                      aria-label="Decline Gig Offer"
                      className={`flex-1 md:flex-initial h-10 px-4 sm:px-0 sm:size-10.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
                      }`}
                    >
                      {rejecting === (offer.rawJob?.id || "mock") ? (
                        <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <RiCloseLine className="size-4 sm:size-5" />
                          <span className="inline md:hidden">Decline</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ───────────────────────────────────────────────────────────────────
          3. UPCOMING JOBS CAROUSEL (Card 1 dark topo, Cards 2..5 pastel mint)
          ─────────────────────────────────────────────────────────────────── */}
      <section className="space-y-3.5">
        
        {/* Section Title with 'see all' */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Upcoming Jobs
          </h2>
          <Link
            href="/worker/jobs"
            className="text-xs sm:text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium transition hover:underline"
          >
            see all
          </Link>
        </div>

        {/* 5-Card Responsive Grid (Desktop Grid, Mobile Smooth Swipe) */}
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 sm:pb-0">
          {upcomingCards.map((card) => {
            if (card.isHeroDark) {
              return (
                <div
                  key={card.id}
                  className="min-w-[240px] sm:min-w-0 snap-start flex-1 relative rounded-2xl bg-[#111216] dark:bg-zinc-950 text-white p-5 overflow-hidden border border-zinc-800 flex flex-col justify-between min-h-[175px] shadow-sm"
                >
                  {/* Topographic Contour Texture on Dark Card */}
                  <TopographicContourSvg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 text-white" />

                  {/* Top: Day and Time */}
                  <div className="relative z-10">
                    <p className="text-base sm:text-lg font-bold text-white leading-tight">
                      {card.dayLabel}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {card.timeLabel}
                    </p>
                  </div>

                  {/* Bottom: Location and Trade */}
                  <div className="relative z-10 pt-4">
                    <p className="text-xs font-semibold text-zinc-200 leading-tight truncate">
                      {card.location}
                    </p>
                    <p className="text-xs text-zinc-400 font-medium mt-0.5">
                      {card.tradeLabel}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={card.id}
                className="min-w-[240px] sm:min-w-0 snap-start flex-1 rounded-2xl bg-[#dcfce7] dark:bg-[#064e3b]/30 text-[#064e3b] dark:text-[#a7f3d0] p-5 border border-emerald-200/70 dark:border-emerald-800/40 flex flex-col justify-between min-h-[175px] transition-transform hover:-translate-y-0.5"
              >
                {/* Top: Day and Time */}
                <div>
                  <p className="text-base sm:text-lg font-bold leading-tight">
                    {card.dayLabel}
                  </p>
                  <p className="text-xs opacity-75 mt-0.5">
                    {card.timeLabel}
                  </p>
                </div>

                {/* Bottom: Location and Trade */}
                <div className="pt-4">
                  <p className="text-xs font-semibold leading-tight truncate">
                    {card.location}
                  </p>
                  <p className="text-xs opacity-70 font-medium mt-0.5">
                    {card.tradeLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ───────────────────────────────────────────────────────────────────
          4. BOTTOM ROW: LATEST VETTINGS & LATEST REVIEWS
          ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Latest Vettings (Fayda / Biometric KYC / Ministry of Labor) */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Latest Vettings
            </h2>
            <Link
              href="/worker/profile/settings?verify=1"
              className="text-xs sm:text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium transition hover:underline"
            >
              see all
            </Link>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3.5">
              <FaydaBiometricSealSvg className="size-9 shrink-0" />
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                  Fayda National ID & TVET
                </p>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  Federal Biometric Clearance • Dire Dawa City Administration
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Fully Onboarded</span>
            </div>
          </div>
        </section>

        {/* Right: Latest Reviews (Client Ratings & Testimonials) */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Latest Reviews
            </h2>
            <Link
              href="/worker/rate"
              className="text-xs sm:text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium transition hover:underline"
            >
              see all
            </Link>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 space-y-3 shadow-sm">
            {/* Header: Client & 5 Stars */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 font-black text-xs flex items-center justify-center">
                  AC
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                    {displayReview.clientName}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    {displayReview.clientSub || "Verified Client"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-white">
                <span>{displayReview.score || 5}</span>
                <RiStarFill className="size-3.5 text-amber-500 fill-amber-500" />
              </div>
            </div>

            {/* Testimonial Quote */}
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic line-clamp-2">
              &ldquo;{displayReview.comment}&rdquo;
            </p>
          </div>
        </section>

      </div>

    </div>
  );
}
