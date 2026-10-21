"use client";

import { useState } from "react";
import { submitRating } from "@/lib/actions/ratings";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Star, ArrowLeft, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react";

interface RatingPageContentProps {
  jobId: string;
  ratedId: string;
  ratedName: string;
  ratedAvatar: string | null;
  ratedVerified: boolean;
  jobTitle: string;
  currentUserRole: string;
  alreadyRated: boolean;
  canRate: boolean;
  dashboardHref: string;
}

const STAR_DETAILS = [
  { label: "Select Rating", desc: "Tap a star to rate your overall experience" },
  { label: "Poor", desc: "Substantial issues encountered" },
  { label: "Fair", desc: "Some issues, needs improvement" },
  { label: "Good", desc: "Satisfactory job completion" },
  { label: "Very Good", desc: "Great work and communication" },
  { label: "Outstanding!", desc: "Exceptional quality & highly recommended" },
];

const WORKER_COMPLIMENT_TAGS = [
  "⚡ Punctual & On Time",
  "🛠️ Expert Craftsmanship",
  "💬 Great Communication",
  "🤝 Respectful & Professional",
  "✨ Clean Worksite",
  "🎯 Fair Pricing",
];

const CLIENT_COMPLIMENT_TAGS = [
  "⚡ Prompt Payment",
  "📋 Clear Requirements",
  "💬 Highly Responsive",
  "🤝 Respectful Host",
  "🌟 Great to Work With",
];

export default function RatingPageContent({
  jobId,
  ratedId,
  ratedName,
  ratedAvatar,
  ratedVerified,
  jobTitle,
  currentUserRole,
  alreadyRated,
  canRate,
  dashboardHref,
}: RatingPageContentProps) {
  const router = useRouter();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyRated);
  const [error, setError] = useState<string | null>(null);

  const activeStar = hoveredStar || selectedStar;
  const isClient = currentUserRole === "client";
  const ratedRole = isClient ? "Verified Worker" : "Hiring Client";
  const complimentTags = isClient ? WORKER_COMPLIMENT_TAGS : CLIENT_COMPLIMENT_TAGS;

  const toggleTag = (tag: string) => {
    // Strip emoji for clean insertion
    const cleanTag = tag.replace(/^[^\w\s]+\s*/, "").trim();
    if (comment.includes(cleanTag)) {
      setComment((prev) =>
        prev
          .replace(new RegExp(`,?\\s*${cleanTag}`, "gi"), "")
          .replace(/^,\s*/, "")
          .trim()
      );
    } else {
      setComment((prev) => (prev ? `${prev}, ${cleanTag}` : cleanTag));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStar) {
      setError("Please select a star rating first.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await submitRating({
      jobId,
      ratedId,
      score: selectedStar,
      comment,
    });

    setLoading(false);

    if (res.success) {
      setSubmitted(true);
      router.refresh();
      return;
    }

    setError(res.error ?? "Submission failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground selection:bg-primary/20">
      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-6">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/50 bg-surface-container-high/40 text-muted-foreground hover:text-foreground hover:bg-surface-container-high transition-all active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center min-w-0 px-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Verified Experience
            </span>
            <h1 className="truncate text-sm sm:text-base font-black tracking-tight text-foreground">
              Rate & Review
            </h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 sm:px-6 py-6 sm:py-8">
        {/* ── Counterparty Summary Card (Mobbin Profile Pill) ── */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface-container-low/60 backdrop-blur-md p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-surface-container shadow-inner">
              {ratedAvatar ? (
                <img src={ratedAvatar} alt={ratedName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-black text-primary">
                  {ratedName?.[0]?.toUpperCase() ?? "U"}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="truncate text-base font-black tracking-tight text-foreground">
                  {ratedName}
                </p>
                {ratedVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {ratedRole} on <span className="text-foreground font-semibold">&ldquo;{jobTitle}&rdquo;</span>
              </p>
            </div>
          </div>
        </section>

        {submitted ? (
          /* ── Submitted Success State (Mobbin Celebratory Modal Style) ── */
          <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-surface-container-low/80 backdrop-blur-md p-8 sm:p-10 text-center space-y-6 shadow-xl">
            <div className="mx-auto relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/30 text-primary shadow-lg shadow-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl -z-10 animate-pulse" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {alreadyRated ? "Review Already Recorded" : "Thank You For Your Review!"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {alreadyRated
                  ? "Your review for this job is securely published and contributes directly to the transparent community trust score."
                  : `Your feedback for ${ratedName} has been cryptographically recorded on the platform profile.`}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => router.push(dashboardHref)}
                className="h-12 px-8 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-black uppercase tracking-wider hover:opacity-90 shadow-lg shadow-primary/25 transition active:scale-95 cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </section>
        ) : !canRate ? (
          /* ── Locked State ── */
          <section className="rounded-3xl border border-border/50 bg-surface-container-low/60 p-8 text-center space-y-4 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high border border-border/40 text-muted-foreground">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h2 className="text-lg font-black text-foreground">Review Locked</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reviews become available once the job completion is accepted and the settlement payment is fully released.
              </p>
            </div>
            <button
              onClick={() => router.push(dashboardHref)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-border/60 bg-surface-container px-6 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-surface-container-high transition active:scale-95 cursor-pointer"
            >
              Back to Dashboard
            </button>
          </section>
        ) : (
          /* ── Interactive Rating Form (Mobbin Clean Modern Card) ── */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Star Rating Card */}
            <section className="rounded-3xl border border-border/50 bg-surface-container-low/70 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm text-center">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Overall Rating
                </p>
                <h3 className="mt-1 text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  How was your experience?
                </h3>
              </div>

              {/* Big Interactive Stars */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeStar;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setSelectedStar(star)}
                      className="group relative p-2 focus:outline-none transition-transform active:scale-90"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        className={`h-9 w-9 sm:h-11 sm:w-11 transition-all duration-200 stroke-[1.5] ${
                          isFilled
                            ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)] scale-110"
                            : "fill-transparent text-border/70 hover:text-amber-300 group-hover:scale-105"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Emotional Feedback Badge */}
              <div className="inline-flex flex-col items-center gap-0.5 rounded-2xl bg-surface-container px-5 py-2.5 border border-border/40">
                <span className="text-sm font-black text-foreground tracking-tight">
                  {STAR_DETAILS[activeStar]?.label}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {STAR_DETAILS[activeStar]?.desc}
                </span>
              </div>
            </section>

            {/* 2. Quick Compliments / Tag Pills */}
            <section className="rounded-3xl border border-border/50 bg-surface-container-low/70 backdrop-blur-md p-5 sm:p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  What stood out? (Optional)
                </p>
                <span className="text-[10px] text-muted-foreground font-medium">Tap to add</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {complimentTags.map((tag) => {
                  const clean = tag.replace(/^[^\w\s]+\s*/, "").trim();
                  const isSelected = comment.includes(clean);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`h-9 px-3.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-surface-container-high/60 border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. Written Review Textarea */}
            <section className="rounded-3xl border border-border/50 bg-surface-container-low/70 backdrop-blur-md p-5 sm:p-6 space-y-3 shadow-sm">
              <label
                htmlFor="review"
                className="text-xs font-black uppercase tracking-wider text-muted-foreground block"
              >
                Detailed Review
              </label>
              <textarea
                id="review"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Share specific details about quality, timeliness, and cooperation to help future clients and workers..."
                className="w-full resize-none rounded-2xl border border-border/50 bg-background/60 p-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/80 focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1">
                <span>Reviews are public and verifiable.</span>
                <span className="font-mono">{comment.length}/1000</span>
              </div>
            </section>

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-xs sm:text-sm font-semibold text-error">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !selectedStar}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm sm:text-base font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Publishing Review…</span>
                  </>
                ) : (
                  <>
                    <Star className="h-5 w-5 fill-current" />
                    <span>Submit Verified Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
