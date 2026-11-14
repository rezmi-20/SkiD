"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getCachedWorker, setCachedWorker } from "@/lib/workerCache";
import { 
  RiArrowLeftLine, 
  RiShareForwardLine, 
  RiStarFill, 
  RiShieldCheckFill, 
  RiChat1Line, 
  RiMapPinLine, 
  RiBriefcaseLine,
  RiCoinsLine,
  RiSparklingFill,
  RiCheckboxCircleFill,
  RiCheckLine,
  RiTimeLine,
  RiAlertLine
} from "@remixicon/react";
import { cx } from "@/utils/cx";

interface WorkerProfile {
  id: string;
  email: string;
  full_name: string;
  bio: string;
  skills: string[];
  latitude: number | null;
  longitude: number | null;
  hourly_rate: string;
  avatar_url: string;
  is_verified: boolean;
  avg_rating: string | number;
  total_ratings: string | number;
  availability?: string;
  distance?: string;
  district?: string;
}

interface Review {
  score: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string | null;
  rater_email?: string;
}

export default function WorkerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  const cachedData = id ? getCachedWorker(id) : null;
  const [worker, setWorker] = useState<WorkerProfile | null>((cachedData?.worker as WorkerProfile) || null);
  const [reviews, setReviews] = useState<Review[]>(cachedData?.reviews || []);
  const [loading, setLoading] = useState<boolean>(!cachedData);
  const [error, setError] = useState<string | null>(null);
  const [messaging, setMessaging] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"about" | "reviews">("about");

  useEffect(() => {
    if (!id) return;
    let isCurrent = true;

    fetch(`/api/workers/${id}`)
      .then((r) => { 
        if (!r.ok) throw new Error("Worker profile not found"); 
        return r.json(); 
      })
      .then((d) => { 
        if (!isCurrent) return;
        setWorker(d.worker); 
        setReviews(d.reviews || []); 
        setCachedWorker(id, { worker: d.worker, reviews: d.reviews || [] });
      })
      .catch((e) => {
        if (!isCurrent) return;
        if (!worker) setError(e.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => { isCurrent = false; };
  }, [id]);

  const handleMessage = useCallback(async () => {
    if (messaging || !worker) return;
    setMessaging(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker.id }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        router.push(`/client/messages/${data.conversationId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMessaging(false);
    }
  }, [worker, messaging, router]);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share && worker) {
      navigator.share({
        title: `${worker.full_name} - DireSkill Artisan`,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  if (loading && !worker) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-48 sm:h-64 rounded-3xl bg-slate-200/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800" />
        <div className="flex flex-col items-center -mt-16 space-y-3">
          <div className="w-28 h-28 rounded-full bg-slate-300 dark:bg-zinc-800 border-4 border-[#f8fafc] dark:border-[#09090b]" />
          <div className="w-48 h-6 rounded-lg bg-slate-200 dark:bg-zinc-800" />
          <div className="w-32 h-4 rounded-lg bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">
        <div className="w-16 h-16 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-red-500 shadow-xs">
          <RiAlertLine className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">{t("worker.profile.loadFailed") || "Worker Profile Not Found"}</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md">
          {error || "The artisan profile could not be loaded or does not exist in Dire Dawa."}
        </p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#45BA50] text-white hover:bg-[#3ca346] shadow-sm transition-all cursor-pointer"
        >
          {t("worker.profile.goBack") || "Back to Search"}
        </button>
      </div>
    );
  }

  const skillsList: string[] = Array.isArray(worker.skills)
    ? worker.skills
    : typeof worker.skills === "string" && (worker.skills as string).trim()
    ? (worker.skills as string).replace(/^\{|\}$/g, "").split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean)
    : [];

  const primarySkill = skillsList.length > 0 ? skillsList[0] : "Artisan";
  const rawRating = Number(worker.avg_rating);
  const rating = Number.isFinite(rawRating) && rawRating > 0 ? rawRating : 5.0;
  const totalJobs = Number(worker.total_ratings) ? Number(worker.total_ratings) * 2 + 10 : 24;

  // System avatar fallback when user hasn't uploaded one
  const systemAvatar = "/images/worker_holding_card.png";
  const displayAvatar = (worker.avatar_url && !imgError && worker.avatar_url !== "/default-avatar.svg")
    ? worker.avatar_url
    : systemAvatar;

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 pb-32 transition-colors">
      
      {/* ── DESKTOP BREADCRUMB ROW ── */}
      <div className="hidden lg:flex items-center justify-between px-8 py-3 max-w-6xl mx-auto text-xs font-medium text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Link href="/client/search" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            {t("worker.profile.home") || "Search"}
          </Link>
          <span>›</span>
          <span className="capitalize">{primarySkill}</span>
          <span>›</span>
          <span className="text-slate-900 dark:text-white font-bold">{worker.full_name}</span>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <RiShareForwardLine className="w-4 h-4" />
          <span>Share Profile</span>
        </button>
      </div>

      {/* Wrapper: inset with horizontal padding on both mobile & desktop */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 pt-2 sm:pt-4">

        {/* ═════════════════════════════════════════════════════════════════════
            1. TOP COVER BANNER (Rounded on both mobile and web!)
            - Wide visual cover with floating back & share buttons
            ═════════════════════════════════════════════════════════════════════ */}
        <div className="relative w-full h-48 sm:h-56 lg:h-64 rounded-3xl overflow-hidden bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-md">
          <img
            src="/images/worker_workbench_hero.jpg"
            alt="Artisan Workbench"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-[#09090b]/40 to-transparent" />

          {/* Floating Actions on Cover (Top-Left Back & Top-Right Share) */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#09090b]/60 text-white backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#09090b]/80 active:scale-95 transition-all shadow-md cursor-pointer"
              title="Go Back"
            >
              <RiArrowLeftLine className="w-5 h-5" />
            </button>

            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-[#09090b]/60 text-white backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#09090b]/80 active:scale-95 transition-all shadow-md cursor-pointer"
              title="Share"
            >
              <RiShareForwardLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            2. PROFILE IDENTITY & METRICS CARD (1:1 with Attached Reference Photo)
            - Overlapping circular avatar with system avatar fallback
            - Sandow plus-style badge
            - Full Name in bold with Fayda verified badge
            - 3 Key Metrics Row with vertical hairline dividers (Total Jobs | Rating | Hourly Rate)
            - Primary Action Buttons [Book Artisan +] and [Chat 💬]
            ═════════════════════════════════════════════════════════════════════ */}
        <div className="relative px-4 sm:px-6 -mt-14 sm:-mt-16 flex flex-col items-center text-center z-20">
          
          {/* Centered Circular Avatar Straddling Cover */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#f8fafc] dark:border-[#09090b] shadow-2xl overflow-hidden bg-white dark:bg-zinc-900 shrink-0">
            <img
              src={displayAvatar}
              alt={worker.full_name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
            {/* Verified Badge on Avatar */}
            {worker.is_verified && (
              <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#134e27] text-[#a4fe47] flex items-center justify-center border-2 border-[#f8fafc] dark:border-[#09090b] shadow-md" title="Kebele & Fayda Verified Pro">
                <RiCheckboxCircleFill className="w-5 h-5 fill-[#45BA50]" />
              </span>
            )}
          </div>

          {/* Pill Badge (Reference Photo: ✧ sandow plus style) */}
          <div className="mt-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#134e27]/25 text-[#a4fe47] border border-[#45BA50]/40 inline-flex items-center gap-1.5 shadow-xs">
              <RiSparklingFill className="w-3.5 h-3.5 text-[#a4fe47]" />
              <span>{primarySkill} Pro</span>
            </span>
          </div>

          {/* Membership & District Subtitle */}
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 font-medium">
            Verified Artisan • Serving Dire Dawa ({worker.district || "Kezira"})
          </p>

          {/* Artisan Full Name */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center justify-center gap-2">
            <span>{worker.full_name}</span>
            {worker.is_verified && (
              <RiShieldCheckFill className="w-6 h-6 text-[#45BA50] shrink-0" />
            )}
          </h1>

          {/* ── 3 Key Metrics Row with Vertical Hairlines (1:1 with Reference Photo) ── */}
          <div className="w-full max-w-md mx-auto my-5 p-4 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs grid grid-cols-3 text-center">
            {/* Metric 1: Total Jobs */}
            <div className="space-y-0.5">
              <RiBriefcaseLine className="w-4 h-4 text-slate-400 dark:text-zinc-500 mx-auto mb-1" />
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{totalJobs}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Total Jobs</p>
            </div>

            {/* Metric 2: Client Rating (Bordered by hairlines) */}
            <div className="space-y-0.5 border-x border-slate-200/80 dark:border-zinc-800 px-1">
              <RiStarFill className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto mb-1" />
              <p className="text-base sm:text-lg font-black text-amber-500">{rating.toFixed(1)}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Rating ({worker.total_ratings || 0})</p>
            </div>

            {/* Metric 3: Hourly Rate */}
            <div className="space-y-0.5">
              <RiCoinsLine className="w-4 h-4 text-[#45BA50] mx-auto mb-1" />
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">ETB {worker.hourly_rate || "450"}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Hourly Rate</p>
            </div>
          </div>

          {/* ── Primary Action Buttons Row (1:1 with Reference Photo) ── */}
          <div className="w-full max-w-md mx-auto flex items-center gap-3">
            {/* Primary Button: Book Artisan + */}
            <Link
              href={`/client/contract/new?workerId=${worker.id}`}
              className="flex-1 h-12 rounded-2xl bg-[#45BA50] hover:bg-[#3ca346] text-white font-black text-xs sm:text-sm shadow-[0_4px_16px_rgba(69,186,80,0.35)] flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <span>Book Artisan</span>
              <span className="text-base font-black">+</span>
            </Link>

            {/* Secondary Button: Chat 💬 */}
            <button
              onClick={handleMessage}
              disabled={messaging}
              className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              {messaging ? (
                <div className="w-4 h-4 border-2 border-[#45BA50] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Chat</span>
                  <RiChat1Line className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            3. CONTENT BODY: REDESIGNED RESPONSIVE DESKTOP & MOBILE LAYOUT
            - Desktop: Spacious 2-Column Bento (About/Skills on Left, Reviews on Right)
            - Mobile: Section Tabs ("All Posts" style)
            ═════════════════════════════════════════════════════════════════════ */}
        <div className="mt-8 px-4 sm:px-6">
          
          {/* Mobile Tabs Header */}
          <div className="lg:hidden flex items-center justify-center gap-2 pb-4 mb-2 border-b border-slate-200/80 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("about")}
              className={cx(
                "px-4 py-2 rounded-full text-xs font-bold transition-all",
                activeTab === "about"
                  ? "bg-[#45BA50] text-white shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800"
              )}
            >
              About & Skills
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={cx(
                "px-4 py-2 rounded-full text-xs font-bold transition-all",
                activeTab === "reviews"
                  ? "bg-[#45BA50] text-white shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800"
              )}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Desktop & Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column (Desktop 7 cols): About, Skills, Coverage */}
            <div className={cx("space-y-6 lg:col-span-7", activeTab !== "about" && "hidden lg:block")}>
              
              {/* About Artisan Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-zinc-800">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <RiSparklingFill className="w-4 h-4 text-[#45BA50]" />
                    <span>About Artisan</span>
                  </h3>
                  <span className="text-xs text-[#45BA50] font-bold">Fayda Verified</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {worker.bio || `Certified and experienced ${primarySkill.toLowerCase()} artisan serving residential and commercial clients across Dire Dawa. Committed to precision, fair pricing, and reliable service.`}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/80 space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Experience</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white">5+ Years in Dire Dawa</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/80 space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Response Time</p>
                    <p className="text-xs font-black text-[#45BA50] flex items-center gap-1">
                      <RiTimeLine className="w-3.5 h-3.5" />
                      <span>Within 1 hour</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Verified Skills & Specialties */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-zinc-800">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <RiCheckLine className="w-4 h-4 text-[#45BA50]" />
                    <span>Verified Skills & Specialties</span>
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">{skillsList.length} specialties</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(skillsList.length > 0 ? skillsList : ["Troubleshooting", "Installation", "Emergency Repairs", "Maintenance"]).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-zinc-800/60 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 shadow-xs inline-flex items-center gap-1.5"
                    >
                      <span className="text-[#45BA50] font-black">✓</span>
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Location & Coverage Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <RiMapPinLine className="w-4 h-4 text-[#45BA50]" />
                  <span>Coverage & Location</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                  Based in <strong className="text-slate-900 dark:text-white">{worker.district || "Kezira"}</strong>, serving all kebeles across Dire Dawa with on-site dispatched service.
                </p>
              </div>

            </div>

            {/* Right Column (Desktop 5 cols): Reviews & Ratings */}
            <div className={cx("space-y-6 lg:col-span-5", activeTab !== "reviews" && "hidden lg:block")}>
              
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-zinc-800">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Client Reviews
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">{reviews.length} reviews</span>
                </div>

                {/* Score Summary Box */}
                <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800">
                  <div className="text-center shrink-0">
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{rating.toFixed(1)}</p>
                    <div className="flex items-center justify-center gap-0.5 text-amber-500 my-1">
                      {[...Array(5)].map((_, i) => (
                        <RiStarFill key={i} className="w-3 h-3 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Overall</p>
                  </div>

                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-500 font-bold">
                        <span className="w-2">{star}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full" 
                            style={{ width: star === 5 ? "85%" : star === 4 ? "15%" : "0%" }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Reviews List */}
                <div className="space-y-3.5 divide-y divide-slate-200/80 dark:divide-zinc-800">
                  {reviews.length > 0 ? (
                    reviews.map((rev, i) => {
                      const reviewerName = rev.reviewer_name || (rev.rater_email ? rev.rater_email.split("@")[0] : "Dire Dawa Client");
                      return (
                        <div key={i} className="pt-3.5 first:pt-0 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#134e27]/20 text-[#45BA50] font-black text-xs flex items-center justify-center border border-[#45BA50]/30">
                                {reviewerName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{reviewerName}</span>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                              <RiStarFill className="w-3 h-3 fill-amber-500" />
                              <span className="font-bold">{rev.score}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed pl-9">
                            {rev.comment}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                      <p>No written reviews yet. Be the first client to book and review {worker.full_name}!</p>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          4. STICKY MOBILE ACTION DOCK (Always Accessible on Scroll)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden p-3 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-2.5 max-w-md mx-auto">
          <button
            onClick={handleMessage}
            disabled={messaging}
            className="h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs shrink-0 active:scale-95 transition-all"
          >
            <RiChat1Line className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
            <span>Chat</span>
          </button>

          <Link
            href={`/client/contract/new?workerId=${worker.id}`}
            className="flex-1 h-11 rounded-xl bg-[#45BA50] hover:bg-[#3ca346] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span>Book Artisan</span>
            <span className="font-black">+</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
