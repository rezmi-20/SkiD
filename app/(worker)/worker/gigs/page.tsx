export default function GigsPage() {
  const MOCK_GIGS = [
    {
      id: "1",
      title: "Pipe Repair – Sabian District",
      client: "Fatuma H.",
      date: "Today, 10:00 AM",
      budget: "800 ETB",
      status: "active",
      progress: 60,
    },
    {
      id: "2",
      title: "Valve Replacement – Kezira",
      client: "Solomon T.",
      date: "Tomorrow, 2:00 PM",
      budget: "500 ETB",
      status: "pending",
      progress: 0,
    },
    {
      id: "3",
      title: "Water Heater Install – Megala",
      client: "Hana D.",
      date: "Apr 30, 9:00 AM",
      budget: "1,200 ETB",
      status: "pending",
      progress: 0,
    },
  ];

  return (
    <div className="space-y-8 pb-28 md:pb-10 text-white">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">My Gigs</h1>
          <p className="text-zinc-500 text-sm font-medium">Your current assignments &amp; tasks</p>
        </div>
        <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 px-3 py-2 rounded-xl">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", value: "1", color: "text-green-400" },
          { label: "Pending", value: "2", color: "text-white" },
          { label: "Done", value: "0", color: "text-zinc-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-5 text-center space-y-2">
            <span className={`text-3xl md:text-5xl font-black tracking-tighter ${stat.color}`}>{stat.value}</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Active Gig Highlight ── */}
      {MOCK_GIGS.filter(g => g.status === 'active').map((gig) => (
        <div key={gig.id} className="relative overflow-hidden bg-zinc-900/60 border border-green-400/20 rounded-[2.5rem] p-8">
          <div className="absolute top-0 right-0 w-60 h-60 bg-green-400/6 blur-[80px] pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Active Now</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight">{gig.title}</h2>
                <p className="text-sm text-zinc-500 font-medium">Client: {gig.client} · {gig.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-black text-green-400">{gig.budget}</p>
                <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest mt-0.5">Budget</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Progress</span>
                <span className="text-[10px] font-black text-green-400">{gig.progress}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-300 rounded-full transition-all duration-700"
                  style={{ width: `${gig.progress}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 h-11 bg-green-400 hover:bg-green-300 text-black rounded-xl font-black text-sm tracking-tight transition-all active:scale-95">
                Mark Complete
              </button>
              <button className="px-5 h-11 bg-zinc-800 border border-white/5 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl font-black text-sm transition-all">
                Details
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ── Pending Gigs ── */}
      <div className="space-y-3">
        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 ml-1">Upcoming</h2>
        {MOCK_GIGS.filter(g => g.status === 'pending').map((gig) => (
          <div key={gig.id} className="group bg-zinc-900/60 border border-white/5 hover:border-green-400/20 rounded-[1.75rem] p-5 md:p-6 flex items-center gap-4 transition-all duration-300">
            <div className="w-12 h-12 bg-zinc-800 border border-white/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-400/10 group-hover:border-green-400/20 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 group-hover:text-green-400 transition-colors">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors truncate">{gig.title}</h3>
              <p className="text-xs text-zinc-600 font-medium mt-0.5">{gig.client} · {gig.date}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-white">{gig.budget}</p>
              <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500">Pending</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Empty state if no gigs ── */}
      {MOCK_GIGS.length === 0 && (
        <div className="relative overflow-hidden bg-zinc-900/30 border border-dashed border-white/8 rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-6 text-center">
          <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-700">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-white font-black text-lg">No Active Gigs</p>
            <p className="text-zinc-600 text-sm font-medium max-w-xs leading-relaxed">Once you accept job requests from the dashboard, they'll appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
