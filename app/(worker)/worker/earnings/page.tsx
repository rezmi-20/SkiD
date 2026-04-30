export default function EarningsPage() {
  const TRANSACTIONS = [
    { id: "1", title: "Pipe Repair – Sabian", client: "Fatuma H.", amount: 800, date: "Apr 25, 2026", status: "paid", type: "credit" },
    { id: "2", title: "Valve Replacement – Kezira", client: "Solomon T.", amount: 500, date: "Apr 18, 2026", status: "pending", type: "credit" },
    { id: "3", title: "Emergency Drain Unclog", client: "Hana D.", amount: 350, date: "Apr 10, 2026", status: "paid", type: "credit" },
    { id: "4", title: "Platform Fee", client: "DireSkill", amount: -80, date: "Apr 25, 2026", status: "deducted", type: "debit" },
  ];

  const totalEarned = 1650;
  const pending = 500;
  const available = 1070;
  const monthlyGoal = 5000;
  const goalProgress = Math.round((totalEarned / monthlyGoal) * 100);

  return (
    <div className="space-y-8 pb-28 md:pb-10 text-white">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">Earnings</h1>
          <p className="text-zinc-500 text-sm font-medium">Financial ledger &amp; payment tracking</p>
        </div>
        <button className="flex items-center gap-2 px-4 h-10 bg-zinc-900 border border-white/5 hover:border-green-400/30 rounded-xl text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-green-400 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
      </div>

      {/* ── Hero Revenue Card ── */}
      <div className="relative overflow-hidden bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-8 md:p-12">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-400/8 blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Total Earned — April 2026</p>
              <div className="flex items-end gap-2">
                <span className="text-6xl md:text-8xl font-black tracking-tighter">{totalEarned.toLocaleString()}</span>
                <span className="text-2xl font-black text-zinc-600 mb-2">ETB</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 px-4 py-2 rounded-xl">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Escrow Active</span>
            </div>
          </div>

          {/* Monthly Goal Progress */}
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Monthly Goal Progress</span>
              <span className="text-[10px] font-black text-green-400">{goalProgress}% of {monthlyGoal.toLocaleString()} ETB</span>
            </div>
            <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-300 transition-all duration-700"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 grid grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Available</p>
              <p className="text-xl font-black text-white">{available.toLocaleString()} ETB</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Pending</p>
              <p className="text-xl font-black text-yellow-400">{pending.toLocaleString()} ETB</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Withdrawn</p>
              <p className="text-xl font-black text-white">0 ETB</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Jobs Done", value: "3", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14", color: "text-green-400" },
          { label: "Avg. Per Job", value: "550 ETB", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", color: "text-white" },
          { label: "Rating", value: "4.8 ★", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", color: "text-yellow-400" },
          { label: "Platform Fee", value: "5%", icon: "M4.5 12.5l3 3 7-7", color: "text-zinc-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900/60 border border-white/5 rounded-[1.75rem] p-5 space-y-3 hover:border-green-400/20 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
              <path d={stat.icon} />
            </svg>
            <div>
              <p className={`text-xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Withdraw Button ── */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-1">
          <h3 className="text-base font-black tracking-tight text-white">Withdraw Funds</h3>
          <p className="text-sm text-zinc-500 font-medium">Transfer your available balance to your bank or mobile wallet.</p>
        </div>
        <button
          disabled
          className="px-8 h-12 bg-zinc-800 border border-white/5 text-zinc-500 rounded-2xl font-black text-sm uppercase tracking-widest cursor-not-allowed flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Withdraw
        </button>
      </div>

      {/* ── Transaction History ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-5">
          <div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-white uppercase">Transaction History</h2>
            <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest mt-0.5">All earnings &amp; deductions</p>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
        </div>

        <div className="space-y-3">
          {TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="group bg-zinc-900/60 border border-white/5 hover:border-green-400/15 rounded-[1.75rem] p-5 flex items-center gap-4 transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                tx.type === 'credit' ? 'bg-green-400/10 border border-green-400/20' : 'bg-red-500/10 border border-red-500/20'
              }`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}>
                  {tx.type === 'credit'
                    ? <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>
                    : <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>
                  }
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{tx.title}</p>
                <p className="text-xs text-zinc-600 font-medium">{tx.client} · {tx.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-base font-black ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'credit' ? '+' : ''}{tx.amount.toLocaleString()} ETB
                </p>
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  tx.status === 'paid' ? 'text-zinc-500' :
                  tx.status === 'pending' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
