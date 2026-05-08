"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  dashboardHref: string;
}

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function RatingPageContent({
  jobId, ratedId, ratedName, ratedAvatar, ratedVerified,
  jobTitle, currentUserRole, alreadyRated, dashboardHref,
}: RatingPageContentProps) {
  const router = useRouter();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyRated);
  const [error, setError] = useState<string | null>(null);

  const activeStar = hoveredStar || selectedStar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStar) { setError("Please select a star rating."); return; }

    setLoading(true);
    setError(null);
    const res = await submitRating({ jobId, ratedId, score: selectedStar, comment });
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error ?? "Submission failed. Please try again.");
    }
  };

  // ─── Success / Already Rated State ────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.7 }}
          className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6"
        >
          <span className="material-symbols-outlined text-primary text-5xl filled">verified</span>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <h1 className="text-2xl font-black text-on-surface mb-2">
            {alreadyRated && !loading ? "Already Reviewed" : "Thank You!"}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-xs">
            {alreadyRated && !loading
              ? "You've already submitted your review for this job."
              : `Your review for ${ratedName} has been submitted successfully.`}
          </p>
          <button
            onClick={() => router.push(dashboardHref)}
            className="mt-8 px-8 py-4 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-surface-variant px-6 h-16 flex items-center gap-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-base font-black text-on-surface tracking-tight">Rate & Review</h1>
          <p className="text-[10px] text-on-surface-variant font-medium truncate max-w-[220px]">{jobTitle}</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-8 space-y-8">
        {/* Reviewed Party Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-[2rem] p-6 border border-surface-variant flex items-center gap-5 shadow-sm"
        >
          <div className="w-16 h-16 rounded-[1.4rem] overflow-hidden bg-surface-container-high border-2 border-surface-container-highest flex items-center justify-center shrink-0">
            {ratedAvatar ? (
              <img src={ratedAvatar} alt={ratedName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-primary">{ratedName?.[0]}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-on-surface text-lg">{ratedName}</span>
              {ratedVerified && (
                <span className="material-symbols-outlined text-primary text-[18px] filled">verified</span>
              )}
            </div>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
              currentUserRole === 'client' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {currentUserRole === 'client' ? 'Worker' : 'Client'}
            </span>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest rounded-[2rem] p-8 border border-surface-variant shadow-sm text-center space-y-6"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Your Rating</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeStar}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="text-3xl font-black text-on-surface h-10 flex items-center justify-center"
                >
                  {activeStar ? STAR_LABELS[activeStar] : "Tap a star"}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileTap={{ scale: 1.3 }}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setSelectedStar(star)}
                  className="focus:outline-none"
                >
                  <span className={`text-5xl transition-all duration-150 ${
                    star <= activeStar
                      ? "text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]"
                      : "text-surface-container-highest"
                  }`}>
                    ★
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Sub-label */}
            <div className="flex justify-between px-2">
              {["1", "2", "3", "4", "5"].map((n, i) => (
                <span key={n} className="text-[9px] font-bold text-on-surface-variant opacity-40 w-10 text-center">{n}</span>
              ))}
            </div>
          </motion.div>

          {/* Comment */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-surface-container-lowest rounded-[2rem] p-6 border border-surface-variant shadow-sm space-y-4"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Written Review</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder={`What was done well?\nWhat could be improved?`}
              className="w-full bg-surface-container-low border-none rounded-2xl p-5 font-medium text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
            />
            <p className="text-[10px] text-on-surface-variant opacity-50 text-right">{comment.length} chars</p>
          </motion.div>

          {/* Photo Upload placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-lowest rounded-[2rem] p-6 border border-surface-variant shadow-sm space-y-4"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Photos (Optional)</p>
            <button
              type="button"
              className="w-full py-8 border-2 border-dashed border-surface-container-highest rounded-2xl flex flex-col items-center gap-2 hover:bg-surface-container-low transition-colors group"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-3xl">add_photo_alternate</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Upload Before / After Photos</span>
              <span className="text-[9px] text-on-surface-variant opacity-40">Supports JPG, PNG up to 5MB each</span>
            </button>
          </motion.div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 text-error rounded-2xl text-xs font-bold flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || !selectedStar}
            whileTap={{ scale: 0.97 }}
            className="w-full h-16 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 disabled:opacity-40 transition-all"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined filled">star</span>
                Submit Review
              </>
            )}
          </motion.button>
        </form>
      </main>
    </div>
  );
}
