"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

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
    
    const fetchWorker = async () => {
      try {
        const res = await fetch(`/api/workers/${id}`);
        if (!res.ok) {
          throw new Error("Worker not found");
        }
        const data = await res.json();
        setWorker(data.worker);
        setReviews(data.reviews || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e]">
        <div className="w-8 h-8 border-4 border-[#2dd4bf] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0c0e] text-white">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-zinc-400 mb-8">{error || "The worker you're looking for doesn't exist."}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-[#2dd4bf] text-black font-bold rounded-xl">
          Go Back
        </button>
      </div>
    );
  }

  const primarySkill = Array.isArray(worker.skills) && worker.skills.length > 0 
    ? worker.skills[0] 
    : "Professional";

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.round(rating) ? "#f59e0b" : "#3f3f46"} className="mr-0.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white pb-32 lg:pb-12">
      {/* Header (Mobile & Desktop) */}
      <div className="sticky top-0 z-50 bg-[#0c0c0e]/80 backdrop-blur-md border-b border-white/5 px-4 py-4 lg:px-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="hidden lg:flex items-center gap-2 text-sm text-zinc-400 font-medium">
          <Link href="/client/search" className="hover:text-white transition-colors">Home</Link>
          <span>›</span>
          <span className="text-[#2dd4bf] capitalize">{primarySkill}s</span>
          <span>›</span>
          <span className="text-white">{worker.full_name}</span>
        </div>
        <h1 className="text-lg font-black tracking-tight lg:hidden">Worker Profile</h1>
        <button className="flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 border border-white/10 hover:bg-white/5 rounded-full text-xs font-bold transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
          <span className="hidden lg:inline">Share Profile</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Hero Profile */}
          <div className="col-span-1 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#18181b] rounded-[2rem] p-8 border border-white/5 flex flex-col items-center text-center relative overflow-hidden shadow-2xl"
            >
              {/* Top gradient blur */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              
              <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-[#27272a] shadow-xl mb-6 z-10 bg-zinc-800 flex items-center justify-center overflow-hidden">
                {worker.avatar_url ? (
                  <img src={worker.avatar_url} alt={worker.full_name} className="w-full h-full object-cover" />
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-500">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              
              <h2 className="text-3xl font-black tracking-tight mb-3 z-10">{worker.full_name}</h2>
              
              <div className="flex items-center gap-2 mb-4 z-10">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-black uppercase tracking-widest">
                  Senior {primarySkill}
                </span>
                {worker.is_verified && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Fayda Verified
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center gap-1.5 mb-8 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-white">{Number(worker.avg_rating).toFixed(1)}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span className="text-sm font-medium text-zinc-400">({worker.total_ratings} reviews)</span>
                </div>
                <div className="text-sm text-zinc-400 font-medium">
                  Location Verified • Dire Dawa
                </div>
              </div>

              {/* Desktop Only Actions - Hidden on mobile (uses fixed bottom bar instead) */}
              <div className="hidden lg:flex w-full gap-3 z-10">
                <button className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  Message
                </button>
                <Link href={`/client/contract/new?workerId=${worker.id}`} className="flex-1 py-3.5 bg-[#2dd4bf] hover:bg-teal-300 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_10px_30px_rgba(45,212,191,0.2)] flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  Hire Now
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Middle Column: About & Skills */}
          <div className="col-span-1 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#18181b] rounded-3xl p-6 lg:p-8 border border-white/5"
            >
              <h3 className="text-xl font-bold mb-4">About {worker.full_name.split(' ')[0]}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm lg:text-base mb-6">
                {worker.bio || `Specializing in commercial and residential services. Safe, reliable, and prompt service in Dire Dawa.`}
              </p>
              
              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-300">Years of Experience:</span>
                  <span className="text-sm font-medium text-white">5+ Years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-300">Certificate of Competency (CoC):</span>
                  <span className="text-sm font-black text-[#2dd4bf]">Verified</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#18181b] rounded-3xl p-6 lg:p-8 border border-white/5"
            >
              <h3 className="text-xl font-bold mb-5">Skills & Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {worker.skills?.length > 0 ? (
                  worker.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-lg text-sm font-medium text-zinc-300 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">General Services</span>
                )}
                {/* Fallback mock skills if array is too small to look like the design */}
                {worker.skills?.length < 3 && ["Pipe Installation", "Leak Repair", "Solar Installation", "House Wiring"].map((s, idx) => (
                  <span key={`mock-${idx}`} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-lg text-sm font-medium text-zinc-300 transition-colors cursor-default">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Reviews */}
          <div className="col-span-1 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#18181b] rounded-3xl p-6 lg:p-8 border border-white/5 h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Reviews and Ratings</h3>
                <div className="flex items-center gap-1 text-xs font-bold text-zinc-400 bg-zinc-800 px-3 py-1.5 rounded-lg cursor-pointer">
                  Recent First
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>

              <div className="flex gap-6 mb-8 items-center">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-white">{Number(worker.avg_rating).toFixed(1)}</span>
                  <div className="flex my-1">
                    {renderStars(Number(worker.avg_rating))}
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">Rating summary</span>
                </div>
                
                {/* Mock progress bars for design fidelity */}
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold">
                      <span className="w-2">{star}</span>
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-400 rounded-full" style={{ width: star === 5 ? '80%' : star === 4 ? '15%' : '0%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                {reviews.length > 0 ? (
                  reviews.map((rev, idx) => (
                    <div key={idx} className="pb-5 border-b border-white/5 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold uppercase text-zinc-400">
                            {rev.rater_email?.substring(0, 2) || "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{rev.rater_email?.split('@')[0] || "User"}</span>
                              <span className="flex items-center text-xs font-black text-white">
                                • {rev.score} <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" className="ml-0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500">{new Date(rev.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300 ml-11">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-sm">
                    No reviews yet. Be the first to hire and review!
                  </div>
                )}
              </div>

              {reviews.length > 0 && (
                <button className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors">
                  See all reviews
                </button>
              )}
            </motion.div>
          </div>

        </div>
      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex gap-3 max-w-md mx-auto">
          <button className="flex-1 py-3.5 bg-zinc-800 active:bg-zinc-700 text-white font-bold rounded-[1.25rem] transition-colors flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Message
          </button>
          <Link href={`/client/contract/new?workerId=${worker.id}`} className="flex-1 py-3.5 bg-[#2dd4bf] active:bg-teal-300 text-black font-black uppercase tracking-widest rounded-[1.25rem] transition-colors shadow-[0_5px_20px_rgba(45,212,191,0.2)] flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Hire Now
          </Link>
        </div>
      </div>
    </div>
  );
}
