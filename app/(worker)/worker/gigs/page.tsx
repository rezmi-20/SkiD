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
    <div className="space-y-8 pb-28 md:pb-10 text-on-surface">

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-on-surface">My Gigs</h1>
          <p className="text-on-surface-variant text-sm font-medium opacity-60">Your current assignments &amp; tasks</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", value: "1", color: "text-primary" },
          { label: "Pending", value: "2", color: "text-on-surface" },
          { label: "Done", value: "0", color: "text-on-surface-variant" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-low border border-outline-variant rounded-[2rem] p-5 text-center space-y-2 shadow-sm">
            <span className={`text-3xl md:text-5xl font-black tracking-tighter ${stat.color}`}>{stat.value}</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Active Gig Highlight ── */}
      {MOCK_GIGS.filter(g => g.status === 'active').map((gig) => (
        <div key={gig.id} className="relative overflow-hidden bg-surface-container border border-primary/20 rounded-[2.5rem] p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-60 h-60 bg-primary/5 blur-[80px] pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Active Now</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-on-surface">{gig.title}</h2>
                <p className="text-sm text-on-surface-variant font-medium opacity-60">Client: {gig.client} · {gig.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-black text-primary">{gig.budget}</p>
                <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest mt-0.5 opacity-40">Budget</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Progress</span>
                <span className="text-[10px] font-black text-primary">{gig.progress}%</span>
              </div>
              <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-700"
                  style={{ width: `${gig.progress}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 h-11 bg-primary text-on-primary rounded-xl font-black text-sm tracking-tight transition-all active:scale-95 shadow-lg shadow-primary/20">
                Mark Complete
              </button>
              <button className="px-5 h-11 bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface rounded-xl font-black text-sm transition-all active:scale-95">
                Details
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ── Pending Gigs ── */}
      <div className="space-y-3">
        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-40 ml-1">Upcoming</h2>
        {MOCK_GIGS.filter(g => g.status === 'pending').map((gig) => (
          <div key={gig.id} className="group bg-surface-container-low border border-outline-variant hover:border-primary/20 rounded-[1.75rem] p-5 md:p-6 flex items-center gap-4 transition-all duration-300 shadow-sm">
            <div className="w-12 h-12 bg-surface-container-high border border-outline-variant rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant opacity-40 group-hover:text-primary group-hover:opacity-100 transition-all">
                work
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">{gig.title}</h3>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5 opacity-60">{gig.client} · {gig.date}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-on-surface">{gig.budget}</p>
              <span className="text-[9px] font-black uppercase tracking-widest text-secondary">Pending</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Empty state if no gigs ── */}
      {MOCK_GIGS.length === 0 && (
        <div className="relative overflow-hidden bg-surface-container-low border border-dashed border-outline rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-6 text-center">
          <div className="w-20 h-20 bg-surface-container-high border border-outline-variant rounded-3xl flex items-center justify-center">
             <span className="material-symbols-outlined text-on-surface-variant opacity-20 text-[36px]">construction</span>
          </div>
          <div className="space-y-2">
            <p className="text-on-surface font-black text-lg">No Active Gigs</p>
            <p className="text-on-surface-variant text-sm font-medium max-w-xs leading-relaxed opacity-60">Once you accept job requests from the dashboard, they'll appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
