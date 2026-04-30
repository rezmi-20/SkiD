import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function WorkerDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "worker") {
    redirect("/login");
  }

  const profileRows = await sql`SELECT full_name, is_verified, district, skills FROM worker_profiles WHERE user_id = ${session.user.id} LIMIT 1`;
  const jobRows = await sql`SELECT * FROM jobs WHERE worker_id = ${session.user.id} ORDER BY created_at DESC LIMIT 5`;

  const worker = profileRows[0];
  const fullName = worker?.full_name || "Professional";
  const firstName = fullName.split(' ')[0];
  const isVerified = worker?.is_verified || false;
  const district = worker?.district || "Dire Dawa";
  const skills: string[] = worker?.skills || [];

  const activeJobs = jobRows.filter((j: any) => j.status === 'active').length;
  const completedJobs = jobRows.filter((j: any) => j.status === 'completed').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-8 text-white pb-28 md:pb-10">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900/60 border border-white/5 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-400/8 blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-green-400/4 blur-[60px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-green-400">{greeting}</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
                {firstName}<span className="text-green-400">.</span>
              </h1>
              {isVerified && (
                <div className="w-10 h-10 bg-green-400 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(74,222,128,0.3)] shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>

            <p className="text-zinc-500 font-medium text-sm md:text-base">
              Professional in <span className="text-white font-bold underline underline-offset-4 decoration-green-400/40">{district}</span> · Indexed for district economy
            </p>

            {/* Skills tags */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.slice(0, 4).map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-zinc-800 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={isVerified ? "/worker/gigs" : "#"}
              className={`inline-flex items-center justify-center gap-3 px-8 h-14 rounded-2xl font-black text-sm tracking-tight transition-all ${
                isVerified
                  ? "bg-green-400 hover:bg-green-300 text-black shadow-[0_0_30px_rgba(74,222,128,0.3)] active:scale-95"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
              }`}
            >
              Browse Requests
              {isVerified ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </Link>
            <Link href="/worker/profile" className="inline-flex items-center justify-center px-8 h-11 bg-zinc-800 border border-white/5 hover:bg-zinc-700 rounded-xl text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* ── Revenue & Stats Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-8 md:p-10 group hover:border-green-400/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-60 h-60 bg-green-400/5 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Revenue Ledger</p>
                <p className="text-xs text-zinc-700 font-medium mt-0.5 uppercase tracking-widest">Escrow · ETB</p>
              </div>
              <div className="w-12 h-12 bg-zinc-800 border border-white/5 rounded-2xl flex items-center justify-center group-hover:bg-green-400/10 group-hover:border-green-400/20 transition-all">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 group-hover:text-green-400 transition-colors">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-6xl md:text-8xl font-black tracking-tighter text-white">0</span>
              <span className="text-3xl md:text-5xl font-black text-zinc-800 mb-2">.00</span>
            </div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-black text-green-400 uppercase tracking-widest">Synchronized — Live</span>
            </div>
            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Available</p>
                <p className="text-xl font-black text-white">0.00 ETB</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Pending Audit</p>
                <p className="text-xl font-black text-white">0.00 ETB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Requests Circle */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 group hover:border-green-400/20 transition-all duration-500">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Active Requests</p>
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-zinc-800 flex items-center justify-center bg-zinc-950 group-hover:border-green-400/30 transition-all">
              <span className="text-6xl font-black text-white group-hover:text-green-400 transition-colors">
                {activeJobs}
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center border-2 border-[#09090b]">
              <span className="text-[10px] font-black text-black">{completedJobs}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Sync Active</p>
          </div>
        </div>
      </div>

      {/* ── Verification Banner ── */}
      {!isVerified && (
        <div className="relative overflow-hidden bg-green-400/4 border border-green-400/15 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 w-60 h-60 bg-green-400/8 blur-[80px] pointer-events-none" />
          <div className="relative z-10 w-20 h-20 bg-zinc-900 border border-green-400/20 rounded-3xl flex items-center justify-center shrink-0">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="relative z-10 flex-1 space-y-3 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Pending Verification</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter">Authentication in Queue</h3>
            <p className="text-zinc-500 font-medium leading-relaxed max-w-xl">
              Your profile is restricted from district-wide job synchronization until the Fayda manual audit is complete. This typically takes 1–3 business days.
            </p>
          </div>
          <div className="relative z-10 px-6 h-12 bg-zinc-800 text-zinc-400 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 border border-white/5 shrink-0">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
            In Review
          </div>
        </div>
      )}

      {/* ── District Requests ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-5">
          <div>
            <h2 className="text-xl md:text-3xl font-black tracking-tighter text-white uppercase">District Requests</h2>
            <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest mt-0.5">Incoming jobs from your area</p>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
        </div>

        {!isVerified ? (
          <div className="relative overflow-hidden bg-zinc-900/30 border border-dashed border-white/8 rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-white font-black text-base tracking-tight">Locked — Awaiting Identity Indexing</p>
              <p className="text-zinc-600 text-sm font-medium max-w-xs mx-auto leading-relaxed">
                Job requests will appear here once your profile passes verification.
              </p>
            </div>
          </div>
        ) : jobRows.length > 0 ? (
          <div className="space-y-3">
            {jobRows.map((job: any) => (
              <div key={job.id} className="group bg-zinc-900/60 border border-white/5 hover:border-green-400/20 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300">
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg md:text-xl font-black tracking-tight group-hover:text-green-400 transition-colors">{job.title}</h3>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed">{job.description?.substring(0, 100)}...</p>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      job.status === 'active' ? 'bg-green-400/10 text-green-400' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {job.status}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-medium">{new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <a
                  href={`/worker/jobs/${job.id}`}
                  className="w-14 h-14 bg-zinc-800 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:bg-green-400 group-hover:text-black group-hover:border-green-400 group-hover:translate-x-1 transition-all shrink-0"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden bg-zinc-900/30 border border-dashed border-white/8 rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/3 to-transparent pointer-events-none" />
            <div className="relative z-10 w-20 h-20 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-700">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="relative z-10 space-y-2">
              <p className="text-white font-black text-lg tracking-tight">District Archive Empty</p>
              <p className="text-zinc-600 text-sm font-medium max-w-xs leading-relaxed">No active job requests in your district yet. Check back soon.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
