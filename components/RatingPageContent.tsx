"use client";

import { useState } from "react";
import { submitRating } from "@/lib/actions/ratings";
import { useRouter } from "next/navigation";

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

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

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
  const ratedRole = currentUserRole === "client" ? "Worker" : "Client";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStar) {
      setError("Choose a star rating first.");
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
      return;
    }

    setError(res.error ?? "Submission failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-surface-variant bg-surface/95 px-4 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-variant text-on-surface-variant hover:bg-surface-container-high"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-on-surface">Rate & Review</h1>
            <p className="truncate text-xs text-on-surface-variant">{jobTitle}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <section className="rounded-lg border border-surface-variant bg-surface-container-lowest p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-variant bg-surface-container-high">
              {ratedAvatar ? (
                <img src={ratedAvatar} alt={ratedName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-primary">{ratedName?.[0] ?? "U"}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-on-surface">{ratedName}</p>
                {ratedVerified && (
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant">{ratedRole} on this completed job</p>
            </div>
          </div>
        </section>

        {submitted ? (
          <section className="rounded-lg border border-surface-variant bg-surface-container-lowest p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">done</span>
            </div>
            <h2 className="mt-4 text-lg font-bold text-on-surface">
              {alreadyRated ? "Already reviewed" : "Review submitted"}
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-on-surface-variant">
              {alreadyRated
                ? "You have already submitted a review for this job."
                : `Your review for ${ratedName} has been recorded.`}
            </p>
            <button
              onClick={() => router.push(dashboardHref)}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-on-primary"
            >
              Back to Dashboard
            </button>
          </section>
        ) : !canRate ? (
          <section className="rounded-lg border border-surface-variant bg-surface-container-lowest p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <h2 className="mt-4 text-lg font-bold text-on-surface">Review not available yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-on-surface-variant">
              Reviews open after the job is completed and the payment has been released.
            </p>
            <button
              onClick={() => router.push(dashboardHref)}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-surface-variant px-4 text-sm font-bold text-on-surface hover:bg-surface-container-high"
            >
              Back to Dashboard
            </button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <section className="rounded-lg border border-surface-variant bg-surface-container-lowest p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Your rating</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setSelectedStar(star)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl transition hover:bg-surface-container-high"
                      aria-label={`Rate ${star} out of 5`}
                    >
                      <span className={star <= activeStar ? "text-yellow-500" : "text-surface-container-highest"}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <span className="min-w-24 text-right text-sm font-bold text-on-surface">
                  {activeStar ? STAR_LABELS[activeStar] : "Select"}
                </span>
              </div>
            </section>

            <section className="rounded-lg border border-surface-variant bg-surface-container-lowest p-4">
              <label htmlFor="review" className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                Written review
              </label>
              <textarea
                id="review"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                maxLength={1000}
                placeholder="Share what went well and anything the other party should improve."
                className="mt-3 w-full resize-none rounded-lg border border-surface-variant bg-surface-container-low p-3 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
              />
              <p className="mt-2 text-right text-xs text-on-surface-variant">{comment.length}/1000</p>
            </section>

            {error && (
              <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm font-medium text-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedStar}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">star</span>
                  Submit Review
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
