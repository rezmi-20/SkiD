"use client";

import Link from "next/link";
import {
  Star,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface ReviewItem {
  id: string;
  score: number;
  comment: string | null;
  created_at: string;
  job_id: string;
  job_title: string;
  client_name: string;
  client_avatar: string | null;
}

interface PendingJobItem {
  job_id: string;
  job_title: string;
  client_name: string;
  client_avatar: string | null;
  budget: number | null;
}

interface RatingStats {
  total_reviews: number;
  avg_score: number;
  star_5: number;
  star_4: number;
  star_3: number;
  star_2: number;
  star_1: number;
}

interface WorkerRatingsIndexContentProps {
  reviews: ReviewItem[];
  pendingRatingJobs: PendingJobItem[];
  stats: RatingStats;
}

export default function WorkerRatingsIndexContent({
  reviews = [],
  pendingRatingJobs = [],
  stats,
}: WorkerRatingsIndexContentProps) {
  const { t } = useLanguage();

  const total = stats.total_reviews || 0;
  const score = total > 0 ? Number(stats.avg_score || 5).toFixed(1) : "5.0";
  const pct5 = total > 0 ? Math.round((stats.star_5 / total) * 100) : 100;
  const pct4 = total > 0 ? Math.round((stats.star_4 / total) * 100) : 0;
  const pct3 = total > 0 ? Math.round((stats.star_3 / total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/worker/dashboard"
              className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              {t("ratings.hub.title")}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("ratings.hub.subtitle")}
          </p>
        </div>

        <Button asChild size="sm" variant="outline" className="rounded-xl border-border h-10 px-4 font-bold">
          <Link href="/worker/profile">
            <Award className="h-4 w-4 mr-1.5 text-amber-500" />
            {t("ratings.hub.viewPublicProfile")}
          </Link>
        </Button>
      </div>

      {/* Rating Score Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Big Score Card */}
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {t("ratings.hub.overallReputation")}
              </span>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-foreground tracking-tight">{score}</span>
              <span className="text-sm font-bold text-muted-foreground">/ 5.0</span>
            </div>

            <div className="flex items-center gap-1 mt-2 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${
                    s <= Math.round(Number(score)) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/60">
            {total > 0
              ? `${total} ${t("ratings.hub.basedOnReviews")}`
              : t("ratings.hub.newWorkerReady")}
          </p>
        </div>

        {/* 5-Star Distribution Bars */}
        <div className="md:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              {t("ratings.hub.starBreakdown")}
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-14 font-semibold text-muted-foreground">5 {t("ratings.hub.stars")}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct5}%` }} />
                </div>
                <span className="w-10 text-right font-bold text-foreground">{pct5}%</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-14 font-semibold text-muted-foreground">4 {t("ratings.hub.stars")}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500/70 rounded-full" style={{ width: `${pct4}%` }} />
                </div>
                <span className="w-10 text-right font-bold text-foreground">{pct4}%</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-14 font-semibold text-muted-foreground">3 {t("ratings.hub.stars")}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500/40 rounded-full" style={{ width: `${pct3}%` }} />
                </div>
                <span className="w-10 text-right font-bold text-foreground">{pct3}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground">{t("ratings.hub.verifiedClientsOnly")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{t("ratings.hub.fraudProof")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reviews To Submit */}
      {pendingRatingJobs.length > 0 && (
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {t("ratings.hub.pendingYourRating")}
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary">
              {pendingRatingJobs.length} {t("ratings.hub.jobsWaiting")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingRatingJobs.map((job) => (
              <div
                key={job.job_id}
                className="p-4 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{job.job_title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{job.client_name}</p>
                </div>
                <Button asChild size="sm" className="rounded-xl h-9 px-3.5 text-xs font-black bg-primary text-on-primary shrink-0">
                  <Link href={`/worker/rate/${job.job_id}`}>
                    {t("ratings.hub.rateClient")} <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Reviews List */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              {t("ratings.hub.clientReviews")}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            {reviews.length} {t("ratings.hub.testimonials")}
          </span>
        </div>

        {reviews.length > 0 ? (
          <div className="divide-y divide-border">
            {reviews.map((rev) => {
              const ci = (rev.client_name || "C").slice(0, 2).toUpperCase();
              return (
                <div key={rev.id} className="py-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        {rev.client_avatar && <AvatarImage src={rev.client_avatar} />}
                        <AvatarFallback className="text-xs font-bold bg-muted">{ci}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-foreground">{rev.client_name}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Briefcase className="h-3 w-3 text-primary" />
                          <span>{rev.job_title}</span>
                          <span>&bull;</span>
                          <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= rev.score ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.comment ? (
                    <p className="text-xs text-muted-foreground leading-relaxed pl-13 pr-4 italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 leading-relaxed pl-13 italic">
                      {t("ratings.hub.noWrittenComment")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{t("ratings.hub.noReviewsYet")}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {t("ratings.hub.noReviewsDesc")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
