import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import Link from "next/link";

export default async function ClientDashboardPage() {
  const session = await auth();
  
  const profileRows = await sql`SELECT full_name FROM client_profiles WHERE user_id = ${session?.user.id}`;
  const jobRows = await sql`SELECT * FROM jobs WHERE client_id = ${session?.user.id} ORDER BY created_at DESC LIMIT 5`;
  
  const fullName = profileRows[0]?.full_name || "Client";
  const firstName = fullName.split(' ')[0];
  const activeJobs = jobRows.filter((j: any) => j.status === 'active').length;
  const pendingJobs = jobRows.filter((j: any) => j.status === 'pending').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-8 text-white pb-28 md:pb-10">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900/60 border border-white/5 p-8 md:p-12">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-400/8 blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-green-400/5 blur-[60px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-green-400">{greeting}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Marhaba,{" "}
              <span className="text-green-400 italic">{firstName}</span>
              <span className="ml-3 text-4xl">👋</span>
            </h1>
            <p className="text-zinc-500 font-medium text-sm md:text-base max-w-md">
              Manage your active service requests, track progress, and discover top professionals.
            </p>
          </div>

          <Link
            href="/client/search"
            className="group inline-flex items-center gap-3 bg-green-400 hover:bg-green-300 text-black px-8 h-14 rounded-2xl font-black text-sm tracking-tight active:scale-95 transition-all shadow-[0_0_30px_rgba(74,222,128,0.3)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Find a Worker
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Active Jobs",
            value: activeJobs,
            color: "text-green-400",
            icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14",
            iconExtra: <polyline points="22 4 12 14.01 9 11.01" />,
            glow: true,
          },
          {
            label: "Pending",
            value: pendingJobs,
            color: "text-white",
            icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
          },
          {
            label: "Total Spent",
            value: "0",
            suffix: " ETB",
            color: "text-green-400",
            icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`relative bg-zinc-900/60 border ${stat.glow ? "border-green-400/20" : "border-white/5"} rounded-[2rem] p-5 md:p-8 space-y-4 overflow-hidden group hover:border-green-400/30 transition-all duration-500`}
          >
            {stat.glow && <div className="absolute inset-0 bg-green-400/3 pointer-events-none" />}
            <div className="relative z-10">
              <div className="w-10 h-10 bg-zinc-800 border border-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-400/10 group-hover:border-green-400/20 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-green-400 transition-colors">
                  <path d={stat.icon} />
                  {stat.iconExtra}
                </svg>
              </div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-3xl md:text-5xl font-black tracking-tighter mt-1 ${stat.color}`}>
                {stat.value}{stat.suffix || ""}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Action Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/client/search" className="group block bg-zinc-900/60 border border-white/5 hover:border-green-400/30 rounded-[2rem] p-6 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-green-400/10 border border-green-400/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-400 group-hover:border-green-400 transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 group-hover:text-black transition-colors">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white tracking-tight group-hover:text-green-400 transition-colors">Discover Workers</h3>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">Browse verified professionals in your area. Filter by skill, rating, and distance.</p>
            </div>
          </div>
        </Link>
        <Link href="/client/messages" className="group block bg-zinc-900/60 border border-white/5 hover:border-green-400/30 rounded-[2rem] p-6 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-zinc-800 border border-white/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-400/10 group-hover:border-green-400/20 transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-green-400 transition-colors">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white tracking-tight group-hover:text-green-400 transition-colors">Messages</h3>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">Communicate directly with your hired professionals in real-time.</p>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Recent Jobs ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-5">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">Recent Activity</h2>
            <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest mt-0.5">Your latest service requests</p>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
        </div>

        {jobRows.length > 0 ? (
          <div className="space-y-3">
            {jobRows.map((job: any) => (
              <div
                key={job.id}
                className="group bg-zinc-900/60 border border-white/5 hover:border-green-400/20 p-5 md:p-6 rounded-[1.75rem] flex justify-between items-center transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${job.status === 'active' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-zinc-700'}`} />
                  <div className="space-y-0.5">
                    <h3 className="text-sm md:text-base font-bold text-white group-hover:text-green-400 transition-colors">{job.title}</h3>
                    <p className="text-xs text-zinc-600 font-medium capitalize">{job.status} · {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`hidden md:block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    job.status === 'active' ? 'bg-green-400/10 text-green-400' :
                    job.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>
                    {job.status}
                  </span>
                  <a href={`/jobs/${job.id}`} className="w-9 h-9 bg-zinc-800 hover:bg-green-400/10 border border-white/5 hover:border-green-400/20 rounded-xl flex items-center justify-center text-zinc-500 hover:text-green-400 transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden bg-zinc-900/30 border border-dashed border-white/8 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center space-y-6">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/3 to-transparent pointer-events-none" />
            <div className="relative z-10 w-20 h-20 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-700">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="relative z-10 space-y-2">
              <p className="text-white font-black text-lg tracking-tight">No jobs yet</p>
              <p className="text-zinc-500 text-sm font-medium max-w-xs leading-relaxed">Start by searching for a skilled professional in your area.</p>
            </div>
            <Link href="/client/search" className="relative z-10 inline-flex items-center gap-2 bg-green-400 hover:bg-green-300 text-black px-6 h-11 rounded-2xl font-black text-sm tracking-tight transition-all">
              Find Workers
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
