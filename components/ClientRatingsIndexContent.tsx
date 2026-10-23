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
  worker_name: string;
  worker_avatar: string | null;
}

interface PendingJobItem {
  job_id: string;
  job_title: string;
  worker_name: string;
  worker_avatar: string | null;
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

interface ClientRatingsIndexContentProps {
  reviews: ReviewItem[];
  pendingRatingJobs: PendingJobItem[];
  stats: RatingStats;
}

export default function ClientRatingsIndexContent({
  reviews = [],
  pendingRatingJobs = [],
  stats,
}: ClientRatingsIndexContentProps) {
  const { t } = useLanguage();

  const total = stats.total_reviews || 0;
  const score = total > 0 ? Number(stats.avg_score || 5).toFixed(1) : "5.0";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/client/dashboard"
              className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              {t("ratings.client.title")}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("ratings.client.subtitle")}
          </p>
        </div>

        <Button asChild size="sm" variant="outline" className="rounded-xl border-border h-10 px-4 font-bold">
          <Link href="/client/contracts">
            <Briefcase className="h-4 w-4 mr-1.5 text-primary" />
            {t("ratings.client.viewContracts")}
          </Link>
        </Button>
      </div>

      {/* Pending Reviews To Submit (Top Priority for Clients) */}
      {pendingRatingJobs.length > 0 ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {t("ratings.client.pendingYourFeedback")}
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-500">
              {pendingRatingJobs.length} {t("ratings.client.workersWaiting")}
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
                  <p className="text-[11px] text-muted-foreground mt-0.5">{job.worker_name}</p>
                </div>
                <Button asChild size="sm" className="rounded-xl h-9 px-3.5 text-xs font-black bg-primary text-on-primary shrink-0">
                  <Link href={`/client/rate/${job.job_id}`}>
                    {t("ratings.client.ratePro")} <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl border border-border bg-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{t("ratings.client.allRated")}</p>
              <p className="text-[11px] text-muted-foreground">{t("ratings.client.allRatedDesc")}</p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold">
            <Link href="/client/search">{t("ratings.client.hireAnother")}</Link>
          </Button>
        </div>
      )}

      {/* Ratings Given to Workers */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              {t("ratings.client.reviewsGiven")}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            {reviews.length} {t("ratings.client.reviewsCount")}
          </span>
        </div>

        {reviews.length > 0 ? (
          <div className="divide-y divide-border">
            {reviews.map((rev) => {
              const wi = (rev.worker_name || "W").slice(0, 2).toUpperCase();
              return (
                <div key={rev.id} className="py-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        {rev.worker_avatar && <AvatarImage src={rev.worker_avatar} />}
                        <AvatarFallback className="text-xs font-bold bg-muted">{wi}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-foreground">{rev.worker_name}</p>
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
              <p className="text-sm font-bold text-foreground">{t("ratings.client.noGivenYet")}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {t("ratings.client.noGivenDesc")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
