"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getCachedWorker, setCachedWorker } from "@/lib/workerCache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Share2, 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  MapPin, 
  Award,
  AlertCircle,
  FileText,
  Check,
  Clock,
  Sparkles
} from "lucide-react";
import FadeContent from "@/components/ui/fade-content";

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
}

interface Review {
  score: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string | null;
  rater_email?: string;
}

function TradeWatermarkIcon({ skill }: { skill: string }) {
  const s = skill.toLowerCase();
  if (s.includes("satellite") || s.includes("dish") || s.includes("antenna") || s.includes("tv")) {
    return (
      <svg className="w-56 h-56 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10a7.33 7.33 0 0 0 10.37 0"/>
        <path d="M1.5 6a11.39 11.39 0 0 0 15.37 0"/>
        <path d="M7 14a3.3 3.3 0 0 0 4.37 0"/>
        <path d="M9 17v4"/>
        <path d="M6 21h6"/>
        <path d="m19 5 2 2-6.5 6.5"/>
        <path d="m20.5 3.5 1.5 1.5"/>
      </svg>
    );
  }
  if (s.includes("electr") || s.includes("power") || s.includes("solar")) {
    return (
      <svg className="w-56 h-56 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    );
  }
  if (s.includes("plumb") || s.includes("pipe") || s.includes("water") || s.includes("leak")) {
    return (
      <svg className="w-56 h-56 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
      </svg>
    );
  }
  if (s.includes("paint") || s.includes("finish")) {
    return (
      <svg className="w-56 h-56 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14 12 4-4 3 3-4 4"/>
        <path d="m18 8-8 8H6v-4l8-8"/>
        <path d="M6 16v4a2 2 0 0 0 2 2h4"/>
      </svg>
    );
  }
  if (s.includes("carpent") || s.includes("wood")) {
    return (
      <svg className="w-56 h-56 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/>
        <path d="M17.64 15 22 10.64"/>
        <path d="m20.91 3.26-6.36 6.36a3.53 3.53 0 0 0 0 5l1.41 1.41a3.53 3.53 0 0 0 5 0l6.36-6.36a1 1 0 0 0 0-1.41l-5-5a1 1 0 0 0-1.41 0z"/>
      </svg>
    );
  }
  return (
    <svg className="w-56 h-56 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}

export default function WorkerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  // Instant cache retrieval: if present, loading starts as false for 0ms transition
  const cachedData = id ? getCachedWorker(id) : null;
  const [worker, setWorker] = useState<WorkerProfile | null>((cachedData?.worker as WorkerProfile) || null);
  const [reviews, setReviews] = useState<Review[]>(cachedData?.reviews || []);
  const [loading, setLoading] = useState<boolean>(!cachedData);
  const [error, setError] = useState<string | null>(null);
  const [messaging, setMessaging] = useState<boolean>(false);

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
        // Only set error if we don't already have cached worker data
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

  // Instant Bento Skeleton for first-time direct URL loads (zero spinner flash)
  if (loading && !worker) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-28 animate-pulse p-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="w-10 h-10 rounded-full bg-muted/60" />
          <div className="w-32 h-5 rounded-lg bg-muted/60" />
          <div className="w-10 h-10 rounded-full bg-muted/60" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 rounded-[28px] bg-muted/50 border border-border/40" />
          <div className="space-y-4">
            <div className="h-44 rounded-[28px] bg-muted/40 border border-border/40" />
            <div className="h-44 rounded-[28px] bg-muted/40 border border-border/40" />
          </div>
          <div className="h-96 rounded-[28px] bg-muted/50 border border-border/40" />
        </div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 gap-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive border border-destructive/20 shadow-sm">
          <AlertCircle size={28} />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("worker.profile.loadFailed")}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {error || "The worker profile could not be found."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.back()} variant="outline" className="rounded-xl">
            {t("worker.profile.goBack")}
          </Button>
          <Button onClick={() => window.location.reload()} className="rounded-xl">
            {t("worker.profile.tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  const skillsList: string[] = Array.isArray(worker.skills)
    ? worker.skills
    : typeof worker.skills === "string" && (worker.skills as string).trim()
    ? (worker.skills as string).replace(/^\{|\}$/g, "").split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean)
    : [];

  const primarySkill = skillsList.length > 0 ? skillsList[0] : "Professional";
  const firstName = worker.full_name?.trim() ? worker.full_name.trim().split(/\s+/)[0] : "Worker";
  const rawRating = Number(worker.avg_rating);
  const rating = Number.isFinite(rawRating) && rawRating > 0 ? rawRating : 5.0;
  const initials = worker.full_name ? worker.full_name.slice(0, 2).toUpperCase() : "WP";
  const isOnline = worker.availability !== "offline";

  const StarRow = ({ score, size = 14 }: { score: number; size?: number }) => (
    <span className="flex gap-0.5">
      {Array(5).fill(0).map((_, i) => (
        <Star 
          key={i} 
          size={size} 
          className={i < Math.round(score) ? "fill-amber-500 stroke-none" : "fill-muted stroke-none"} 
        />
      ))}
    </span>
  );

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-100">
      {/* ── TOP NAV / BREADCRUMB ── */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="rounded-full hover:bg-muted/60">
          <ArrowLeft size={18} />
        </Button>
        
        {/* Desktop breadcrumb */}
        <nav className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Link href="/client/search" className="hover:text-foreground transition-colors">
            {t("worker.profile.home")}
          </Link>
          <span>›</span>
          <span className="capitalize">{primarySkill}</span>
          <span>›</span>
          <span className="text-foreground font-bold">{worker.full_name}</span>
        </nav>
        
        <h1 className="text-sm font-black lg:hidden">{t("worker.profile.title")}</h1>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-muted/60"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: worker.full_name, url: window.location.href });
            }
          }}
        >
          <Share2 size={18} />
        </Button>
      </div>

      {/* ════════════════════════════════════════
          MOBILE & DESKTOP RESPONSIVE BENTO GRID
      ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── HERO PROFILE CARD (Left Column on Desktop) ── */}
        <div className="col-span-1">
          <div className="group relative overflow-hidden rounded-[28px] bg-card dark:bg-[#181d24]/90 border border-outline-variant/60 shadow-sm p-6 flex flex-col items-center text-center space-y-5">
            
            {/* Ambient Watermark Trade Icon */}
            <div className="absolute -right-10 -bottom-10 text-foreground/[0.04] dark:text-white/[0.05] pointer-events-none select-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
              <TradeWatermarkIcon skill={primarySkill} />
            </div>

            {/* Avatar & Verification Badge */}
            <div className="relative z-10">
              <Avatar className="w-28 h-28 rounded-full border-4 border-card dark:border-[#181d24] shadow-xl">
                {worker.avatar_url && (
                  <AvatarImage src={worker.avatar_url} alt={worker.full_name} className="object-cover" />
                )}
                <AvatarFallback className="bg-muted text-muted-foreground font-black text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {worker.is_verified && (
                <div 
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#22c55e] text-white flex items-center justify-center shadow-md border-2 border-card dark:border-[#181d24]"
                  title={t("search.verifiedProfessional")}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                </div>
              )}
            </div>

            {/* Name, Role & Online Pill */}
            <div className="relative z-10 space-y-2 w-full">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-foreground">{worker.full_name}</h2>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <Badge variant="secondary" className="bg-[#a3e635]/15 text-foreground dark:text-[#a3e635] border-none font-black uppercase tracking-wider text-[10px] px-3 py-1 rounded-full">
                  {t("worker.profile.senior")} {primarySkill}
                </Badge>
                {worker.is_verified && (
                  <Badge variant="outline" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border-outline-variant/60">
                    <Award size={11} className="text-[#a3e635]" />
                    {t("worker.profile.officialId")}
                  </Badge>
                )}
              </div>

              {/* Rating and Distance */}
              <div className="flex items-center justify-center gap-2.5 text-xs pt-1">
                <Badge variant="secondary" className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border-none py-0.5 px-2.5 rounded-full font-black">
                  <Star size={11} className="fill-amber-500 stroke-none" />
                  <span>{rating.toFixed(1)}</span>
                </Badge>
                <span className="text-muted-foreground font-semibold">({worker.total_ratings || 0} {t("worker.profile.reviewsCount")})</span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <MapPin size={11} className="text-muted-foreground" />
                  <span>{worker.distance ? `${worker.distance} km ${t("worker.profile.away")}` : t("worker.profile.diredawa")}</span>
                </span>
              </div>

              {/* Live Availability Status */}
              <div className="pt-2 flex items-center justify-center">
                {isOnline ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping inline-block" />
                    <span>{t("worker.profile.available")}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-outline-variant/60">
                    <Clock size={12} />
                    <span>{t("worker.profile.offline")}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Hourly Rate Banner */}
            <div className="relative z-10 w-full pt-2">
              <div className="p-3.5 rounded-2xl bg-muted/40 dark:bg-black/30 border border-outline-variant/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{t("worker.profile.ratePerHour")}</span>
                <span className="text-base font-black text-foreground">
                  ETB {worker.hourly_rate || "450"}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── MIDDLE COLUMN: ABOUT & SKILLS ── */}
        <div className="col-span-1 space-y-4">
          
          {/* About Card */}
          <Card className="border border-outline-variant/60 bg-card dark:bg-[#181d24]/90 rounded-[28px] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black tracking-tight flex items-center gap-2">
                <Sparkles size={16} className="text-[#a3e635]" />
                <span>{t("worker.profile.about")} {firstName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {worker.bio || `Specializing in professional ${primarySkill.toLowerCase()} services in Dire Dawa. Prompt, reliable, and verified with authentic local experience.`}
              </p>
              <Separator className="bg-outline-variant/40" />
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">{t("worker.profile.experience")}</span>
                  <p className="font-black text-foreground">{t("worker.profile.yearsExperience")}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">{t("worker.profile.cocVerified")}</span>
                  <p className="font-black text-[#22c55e] flex items-center gap-1">
                    <ShieldCheck size={14} /> {t("worker.profile.verified")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Specializations Card */}
          <Card className="border border-outline-variant/60 bg-card dark:bg-[#181d24]/90 rounded-[28px] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black tracking-tight">
                {t("worker.profile.specializations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(skillsList.length > 0 ? skillsList : ["Troubleshooting", "Installation", "Emergency Repairs", "Wiring & Safety", "Maintenance"]).map((s, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-outline-variant/60 bg-muted/30 rounded-xl"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT COLUMN: REVIEWS & RATINGS ── */}
        <div className="col-span-1">
          <Card className="border border-outline-variant/60 bg-card dark:bg-[#181d24]/90 rounded-[28px] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black tracking-tight">
                {t("worker.profile.reviews")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Summary Score */}
              <div className="flex items-center gap-6 p-3 rounded-2xl bg-muted/30 border border-outline-variant/40">
                <div className="flex flex-col items-center shrink-0 space-y-1">
                  <span className="text-3xl font-black">{rating.toFixed(1)}</span>
                  <StarRow score={rating} size={12} />
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                    {t("worker.profile.summary")}
                  </span>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-bold w-2">{s}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: s === 5 ? "85%" : s === 4 ? "15%" : "0%" }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Items */}
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((rev, i) => {
                  const reviewerName = rev.reviewer_name || (rev.rater_email ? rev.rater_email.split("@")[0] : t("worker.profile.verifiedClient"));
                  const revInitials = reviewerName.slice(0, 2).toUpperCase() || "VC";
                  return (
                    <div key={i} className="space-y-2 pb-4 border-b border-outline-variant/40 last:border-none last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border border-border">
                            {rev.reviewer_avatar && <AvatarImage src={rev.reviewer_avatar} alt={reviewerName} />}
                            <AvatarFallback className="text-[10px] font-black bg-muted text-muted-foreground">
                              {revInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground">{reviewerName}</span>
                              <Badge variant="secondary" className="flex items-center gap-0.5 bg-amber-500/10 text-amber-500 border-none py-0 px-1.5 rounded-full font-black text-[9px]">
                                <Star size={8} className="fill-amber-500 stroke-none" />
                                <span>{rev.score}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] text-muted-foreground font-semibold">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : t("worker.profile.recent")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-9">{rev.comment}</p>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-muted-foreground text-center py-6 italic font-medium">
                    {t("worker.profile.noReviews")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ════════════════════════════════════════
          PERSISTENT STICKY BOTTOM ACTION BAR (Both Mobile & Desktop)
      ════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3 bg-card/95 dark:bg-[#12161c]/95 backdrop-blur-xl border-t border-outline-variant/60 shadow-2xl">
        <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
          {/* Message Worker Button */}
          <Button 
            onClick={handleMessage} 
            disabled={messaging} 
            variant="outline" 
            className="w-full h-12 rounded-full border border-outline-variant/80 bg-background dark:bg-[#181d24] flex items-center justify-center gap-2 text-xs sm:text-sm font-black active:scale-[0.98] transition-all shadow-sm"
          >
            {messaging ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MessageSquare size={17} className="text-foreground shrink-0" />
                <span className="truncate">{t("worker.profile.message")}</span>
              </>
            )}
          </Button>

          {/* Start Hiring / Send Contract Pill Button */}
          <Link 
            href={`/client/contract/new?workerId=${worker.id}`}
            prefetch={true}
            className="w-full h-12 rounded-full bg-[#a3e635] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(163,230,53,0.35)] hover:opacity-95 active:scale-[0.98] transition-all touch-manipulation uppercase tracking-wider"
          >
            <FileText size={17} className="stroke-[2.5] shrink-0" />
            <span className="truncate">{t("worker.profile.startHiring")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
