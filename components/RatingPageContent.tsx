"use client";

import { useState } from "react";
import { submitRating } from "@/lib/actions/ratings";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RiArrowLeftSLine,
  RiStarFill,
  RiStarLine,
  RiShieldCheckFill,
  RiCheckDoubleLine,
  RiSparklingFill,
  RiThumbUpLine,
  RiChat1Line,
  RiArrowRightLine
} from "@remixicon/react";

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
  isDemoMode?: boolean;
}

const STAR_DETAILS = [
  { label: "Select Rating", desc: "Tap a star to rate your overall experience" },
  { label: "Poor", desc: "Substantial quality issues or unpunctual delivery" },
  { label: "Fair", desc: "Some issues, needs improvement" },
  { label: "Good", desc: "Satisfactory completion & verified work" },
  { label: "Very Good", desc: "Great trade quality and smooth communication" },
  { label: "Outstanding!", desc: "Exceptional mastery & highly recommended in Dire Dawa" },
];

const WORKER_COMPLIMENT_TAGS = [
  "Punctual & On Time",
  "Expert Craftsmanship",
  "Great Communication",
  "Respectful & Professional",
  "Clean Worksite",
  "Fair Pricing",
];

const CLIENT_COMPLIMENT_TAGS = [
  "Prompt Milestone Release",
  "Clear Specifications",
  "Highly Responsive",
  "Respectful Host",
  "Great Collaboration",
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
  isDemoMode = false,
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
  const ratedRole = isClient ? "Verified Artisan" : "Hiring Client";
  const complimentTags = isClient ? WORKER_COMPLIMENT_TAGS : CLIENT_COMPLIMENT_TAGS;

  const toggleTag = (tag: string) => {
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

    if (isDemoMode) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
      }, 500);
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
    <div className="min-h-screen bg-background-primary-default pb-10 sm:pb-14 text-text-primary font-['Inter',system-ui,sans-serif]">
      {/* ── Demo / Preview Interactive Mode Banner ── */}
      {isDemoMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-700 dark:text-amber-400 font-bold">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <RiSparklingFill className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Inspection Preview Mode — Test the Rating & Review Composer interactively</span>
            </div>
            {submitted && (
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[11px] font-bold"
              >
                Reset Review
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-30 border-b border-border-button-default bg-background-primary-default/95 backdrop-blur-md px-4 sm:px-6">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-button-default bg-background-secondary-default hover:bg-background-secondary-hover text-text-primary transition-all active:scale-95 cursor-pointer shadow-xs"
            aria-label="Go back"
          >
            <RiArrowLeftSLine className="h-6 w-6" />
          </button>
          <div className="text-center min-w-0 px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Verified Experience
            </span>
            <h1 className="truncate text-base font-black tracking-tight text-text-primary">
              Rate & Review
            </h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 sm:px-6 py-6 sm:py-8">
        {/* ── Counterparty Summary Card ── */}
        <section className="relative overflow-hidden rounded-[2rem] border border-border-button-default bg-background-secondary-default p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border-button-default bg-background-primary-default shadow-xs">
              {ratedAvatar ? (
                <img src={ratedAvatar} alt={ratedName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-black text-text-primary">
                  {ratedName?.[0]?.toUpperCase() ?? "U"}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="truncate text-base font-black tracking-tight text-text-primary">
                  {ratedName}
                </p>
                {ratedVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <RiShieldCheckFill className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-text-tertiary font-medium">
                {ratedRole} on <span className="text-text-primary font-bold">&ldquo;{jobTitle}&rdquo;</span>
              </p>
            </div>
          </div>
        </section>

        {submitted ? (
          /* ── Submitted Success State (Celebratory Card) ── */
          <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md p-8 sm:p-10 text-center space-y-6 shadow-xl">
            <div className="mx-auto relative flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 shadow-xl">
              <RiCheckDoubleLine className="h-10 w-10 text-emerald-500" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-black text-text-primary tracking-tight">
                Thank You for Your Feedback!
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Your verified rating directly builds mutual trust on DireSkill. It has been recorded on{" "}
                <strong className="text-text-primary">{ratedName}&apos;s</strong> public profile.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-sm mx-auto">
              <Link
                href={dashboardHref}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-zinc-950 dark:bg-zinc-100 text-xs sm:text-sm font-black uppercase tracking-wider text-white dark:text-zinc-950 shadow-md hover:opacity-90 transition active:scale-95"
              >
                Return to Dashboard
              </Link>
            </div>
          </section>
        ) : (
          /* ── Interactive Review Form ── */
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[2.5rem] border border-border-button-default bg-background-primary-default p-6 sm:p-8 shadow-sm"
          >
            {/* Star Rating Section */}
            <div className="space-y-3 text-center">
              <p className="text-[11px] font-black uppercase tracking-wider text-text-tertiary">
                Overall Work Quality & Experience
              </p>

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
                      className="p-1 rounded-2xl hover:scale-115 active:scale-95 transition-all cursor-pointer focus:outline-none"
                      aria-label={`Rate ${star} star`}
                    >
                      {isFilled ? (
                        <RiStarFill className="w-9 h-9 sm:w-11 sm:h-11 text-amber-400 drop-shadow-md" />
                      ) : (
                        <RiStarLine className="w-9 h-9 sm:w-11 sm:h-11 text-zinc-300 dark:text-zinc-700 hover:text-amber-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="h-10 flex flex-col items-center justify-center">
                <p className="text-sm font-extrabold text-text-primary transition-all">
                  {STAR_DETAILS[activeStar]?.label}
                </p>
                <p className="text-xs text-text-tertiary font-medium">
                  {STAR_DETAILS[activeStar]?.desc}
                </p>
              </div>
            </div>

            {/* Compliment Quick Badges */}
            <div className="space-y-2 border-t border-border-button-default/70 pt-5">
              <label className="text-[11px] font-black uppercase tracking-wider text-text-tertiary block">
                Quick Praise & Performance Badges
              </label>
              <div className="flex flex-wrap gap-2">
                {complimentTags.map((tag) => {
                  const cleanTag = tag.replace(/^[^\w\s]+\s*/, "").trim();
                  const isSelected = comment.includes(cleanTag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer border ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs"
                          : "bg-background-secondary-default hover:bg-background-secondary-hover border-border-button-default text-text-secondary"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Testimonial Textarea */}
            <div className="space-y-2 border-t border-border-button-default/70 pt-5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="review-comment"
                  className="text-[11px] font-black uppercase tracking-wider text-text-tertiary"
                >
                  Written Feedback & Testimonial
                </label>
                <span className="text-[10px] text-text-tertiary font-mono">
                  {comment.length}/1000
                </span>
              </div>
              <textarea
                id="review-comment"
                rows={4}
                maxLength={1000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isClient
                    ? "Share details about the craft quality, timeliness, and precision of the artisan's work in Dire Dawa..."
                    : "Describe your experience working with this client, milestone approval speed, and site readiness..."
                }
                className="w-full rounded-2xl border border-border-button-default bg-background-secondary-default p-4 text-xs sm:text-sm font-medium text-text-primary placeholder:text-text-placeholder outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="border-t border-border-button-default/70 pt-5">
              <button
                type="submit"
                disabled={loading || selectedStar === 0}
                className="flex h-13 sm:h-14 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs sm:text-sm font-black uppercase tracking-wider shadow-xl hover:opacity-90 disabled:opacity-50 transition active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-950 border-t-transparent animate-spin" />
                ) : (
                  <RiStarFill className="w-4 h-4 text-amber-400" />
                )}
                <span>{loading ? "Submitting Rating…" : "Submit Verified Review"}</span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
