"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCallback } from "react";

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
}

interface Review {
  score: number;
  comment: string;
  created_at: string;
  rater_email: string;
}

export default function WorkerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/workers/${id}`)
      .then((r) => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then((d) => { setWorker(d.worker); setReviews(d.reviews || []); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const [messaging, setMessaging] = useState(false);

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e]">
      <div className="w-8 h-8 border-4 border-[#2dd4bf] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !worker) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0c0e] text-white p-10 gap-6">
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Profile Load Failed</h1>
        <p className="text-zinc-500 max-w-md mx-auto">{error || "The worker profile could not be found or the database connection timed out."}</p>
      </div>
      <div className="flex gap-4">
        <button onClick={() => router.back()} className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors">Go Back</button>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#2dd4bf] text-black font-bold rounded-xl hover:bg-teal-400 transition-colors">Try Again</button>
      </div>
      {error && (
        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10 w-full max-w-2xl overflow-auto">
          <p className="text-[10px] font-mono text-zinc-600 uppercase mb-2">Technical Details:</p>
          <code className="text-xs text-red-400">{error}</code>
        </div>
      )}
    </div>
  );

  const primarySkill = Array.isArray(worker.skills) && worker.skills.length > 0 ? worker.skills[0] : "Professional";
  const rating = Number(worker.avg_rating);

  const StarRow = ({ score, size = 16 }: { score: number; size?: number }) => (
    <span className="flex">
      {Array(5).fill(0).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < Math.round(score) ? "#f59e0b" : "#3f3f46"}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white">

      {/* ── TOP NAV ── */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0c0c0e]/90 backdrop-blur-md border-b border-white/5">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        {/* Desktop breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/client/search" className="hover:text-white">Home</Link>
          <span>›</span>
          <span className="text-[#2dd4bf] capitalize">{primarySkill}s</span>
          <span>›</span>
          <span className="text-white">{worker.full_name}</span>
        </div>
        <h1 className="text-base font-bold lg:hidden">Worker Profile</h1>
        <button className="p-2 rounded-full hover:bg-white/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
        </button>
      </div>

      {/* ════════════════════════════════════════
          MOBILE LAYOUT  (hidden on lg+)
      ════════════════════════════════════════ */}
      <div className="lg:hidden pb-32">

        {/* Hero — no card, just dark bg */}
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#27272a] shadow-xl bg-zinc-800 mb-5 flex items-center justify-center">
            {worker.avatar_url
              ? <img src={worker.avatar_url} alt={worker.full_name} className="w-full h-full object-cover" />
              : <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-500"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            }
          </div>

          {/* Name */}
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-2xl font-black tracking-tight">{worker.full_name}</h2>
            {worker.is_verified && (
               <span className="material-symbols-outlined text-primary text-[20px] filled" title="Verified Official Identity">verified</span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded-full text-xs font-bold">
              Senior {primarySkill}
            </span>
            {worker.is_verified && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[9px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px]">shield_person</span>
                Official Identity
              </span>
            )}
          </div>

          {/* Rating row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-white text-base">{rating.toFixed(1)}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            <span className="text-zinc-400 text-sm">({worker.total_ratings} reviews)</span>
          </div>
          <p className="text-zinc-400 text-sm">1.2 km away • Kezira</p>
        </div>

        {/* ─── About Section ─── */}
        <div className="px-4 mb-2">
          <div className="bg-[#18181b] rounded-2xl p-5 border border-white/5">
            <h3 className="text-base font-bold mb-3">About {worker.full_name.split(" ")[0]}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-5">
              {worker.bio || "Specializing in commercial and residential services. Safe, reliable, and prompt service in Dire Dawa. Fast repairs, solar installation, and maintenance."}
            </p>
            <div className="space-y-2 pt-4 border-t border-white/5">
              <p className="text-sm text-zinc-300"><span className="font-semibold">Years of Experience:</span> 15+</p>
              <p className="text-sm text-zinc-300"><span className="font-semibold">Certificate of Competency (CoC):</span> <span className="text-[#2dd4bf] font-bold">Verified</span></p>
            </div>
          </div>
        </div>

        {/* ─── Skills Section ─── */}
        <div className="px-4 mb-2">
          <div className="bg-[#18181b] rounded-2xl p-5 border border-white/5">
            <h3 className="text-base font-bold mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(worker.skills?.length > 0 ? worker.skills : ["Pipe Installation", "Leak Repair", "Solar Installation", "House Wiring", "Generator Set Maintenance", "CCTV Installation", "General Repairs"]).map((s, i) => (
                <span key={i} className="px-3 py-1.5 bg-transparent border border-zinc-600 rounded-lg text-xs font-medium text-zinc-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Reviews Section ─── */}
        <div className="px-4 mb-2">
          <div className="bg-[#18181b] rounded-2xl p-5 border border-white/5">
            <h3 className="text-base font-bold mb-4">Reviews and Ratings</h3>

            {/* Summary row */}
            <div className="flex items-center gap-5 mb-5">
              <div className="flex flex-col items-center">
                <StarRow score={rating} size={18} />
                <span className="text-[11px] text-zinc-500 mt-1">Rating summary</span>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 w-2">{s}</span>
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-400 rounded-full" style={{ width: s === 5 ? "75%" : s === 4 ? "18%" : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review items */}
            <div className="space-y-4">
              {reviews.length > 0 ? reviews.map((rev, i) => (
                <div key={i} className="pb-4 border-b border-white/5 last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 uppercase shrink-0">
                        {rev.rater_email?.substring(0, 2) || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{rev.rater_email?.split("@")[0] || "User"}</span>
                          <span className="flex items-center gap-0.5 text-xs font-black">
                            • {rev.score} <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0">{new Date(rev.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                  <p className="text-sm text-zinc-400 ml-10">{rev.comment}</p>
                </div>
              )) : (
                <p className="text-sm text-zinc-500 text-center py-4">No reviews yet.</p>
              )}
            </div>

            {reviews.length > 0 && (
              <button className="w-full mt-4 py-2.5 text-center text-sm font-bold text-zinc-300 hover:text-white border border-white/5 rounded-xl transition-colors">
                See all reviews
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY BOTTOM BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3 bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex gap-3">
          <button onClick={handleMessage} disabled={messaging}
            className="flex-1 py-4 bg-[#1c1c1f] border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60">
            {messaging
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
            Message
          </button>
          <Link href={`/client/contract/new?workerId=${worker.id}`}
            className="flex-1 py-4 bg-[#2dd4bf] text-black font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_4px_20px_rgba(45,212,191,0.3)] no-underline">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
            Hire Now
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════
          DESKTOP LAYOUT  (hidden below lg)
      ════════════════════════════════════════ */}
      <div className="hidden lg:block max-w-7xl mx-auto px-8 py-8 pb-12">
        <div className="grid grid-cols-3 gap-6">

          {/* Left: Hero card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="col-span-1 bg-[#18181b] rounded-[2rem] p-8 border border-white/5 flex flex-col items-center text-center relative overflow-hidden shadow-2xl self-start sticky top-24">
            <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#27272a] shadow-xl mb-5 z-10 bg-zinc-800 flex items-center justify-center">
              {worker.avatar_url
                ? <img src={worker.avatar_url} alt={worker.full_name} className="w-full h-full object-cover" />
                : <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-500"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              }
            </div>
            <div className="flex items-center gap-3 mb-3 z-10">
              <h2 className="text-2xl font-black tracking-tight leading-none">{worker.full_name}</h2>
              {worker.is_verified && (
                 <span className="material-symbols-outlined text-primary text-[24px] filled">verified</span>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-4 z-10">
              <span className="px-3 py-1 bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded-full text-xs font-bold">Senior {primarySkill}</span>
              {worker.is_verified && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[9px] font-black uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[14px]">shield_person</span>
                  Official Identity
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-1 z-10">
              <span className="font-black text-lg">{rating.toFixed(1)}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <span className="text-zinc-400 text-sm">({worker.total_ratings} reviews)</span>
            </div>
            <p className="text-zinc-400 text-sm mb-8 z-10">1.2 km away • Dire Dawa</p>
            <div className="w-full flex gap-3 z-10">
              <button onClick={handleMessage} disabled={messaging}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                {messaging
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                Message
              </button>
              <Link href={`/client/contract/new?workerId=${worker.id}`}
                className="flex-1 py-3 bg-[#2dd4bf] hover:bg-teal-300 text-black font-black rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_8px_25px_rgba(45,212,191,0.25)] no-underline">
                Hire Now
              </Link>
            </div>
          </motion.div>

          {/* Middle: About + Skills */}
          <div className="col-span-1 flex flex-col gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-[#18181b] rounded-3xl p-7 border border-white/5">
              <h3 className="text-lg font-bold mb-3">About {worker.full_name.split(" ")[0]}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-5">
                {worker.bio || "Specializing in commercial and residential services. Safe, reliable, and prompt service in Dire Dawa. Fast repairs, solar installation, and maintenance."}
              </p>
              <div className="space-y-2 pt-5 border-t border-white/5">
                <p className="text-sm text-zinc-300"><span className="font-semibold">Years of Experience:</span> 15+</p>
                <p className="text-sm text-zinc-300"><span className="font-semibold">Certificate of Competency (CoC):</span> <span className="text-[#2dd4bf] font-bold">Verified</span></p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-[#18181b] rounded-3xl p-7 border border-white/5">
              <h3 className="text-lg font-bold mb-4">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {(worker.skills?.length > 0 ? worker.skills : ["Pipe Installation", "Leak Repair", "Solar Installation", "House Wiring", "Generator", "Set Maintenance", "Fault Finding", "CCTV Installation", "General Repairs"]).map((s, i) => (
                  <span key={i} className="px-3 py-1.5 border border-zinc-600 rounded-lg text-xs font-medium text-zinc-300">{s}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Reviews */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="col-span-1 bg-[#18181b] rounded-3xl p-7 border border-white/5 self-start">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Client Reviews</h3>
              <div className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800 px-3 py-1.5 rounded-lg cursor-pointer">
                Recent First
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            <div className="flex gap-4 mb-6 items-center">
              <div className="flex flex-col items-center shrink-0">
                <span className="text-3xl font-black">{rating.toFixed(1)}</span>
                <StarRow score={rating} size={14} />
                <span className="text-[10px] text-zinc-500 mt-1">Rating summary</span>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 w-2">{s}</span>
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-400 rounded-full" style={{ width: s === 5 ? "75%" : s === 4 ? "18%" : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {reviews.length > 0 ? reviews.map((rev, i) => (
                <div key={i} className="pb-4 border-b border-white/5 last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 uppercase shrink-0">
                        {rev.rater_email?.substring(0, 2) || "U"}
                      </div>
                      <span className="text-sm font-bold">{rev.rater_email?.split("@")[0]}</span>
                      <span className="flex items-center gap-0.5 text-xs font-black">• {rev.score}
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0">{new Date(rev.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                  <p className="text-xs text-zinc-400 ml-9">{rev.comment}</p>
                </div>
              )) : <p className="text-sm text-zinc-500 text-center py-4">No reviews yet.</p>}
            </div>
            {reviews.length > 0 && (
              <button className="w-full mt-4 py-2.5 text-sm font-bold text-zinc-300 hover:text-white border border-white/5 rounded-xl transition-colors">
                See all reviews
              </button>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
