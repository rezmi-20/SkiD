"use client";

import { motion } from "framer-motion";

interface Transaction {
  id: string;
  title: string;
  client: string;
  amount: number;
  date: string;
  status: string;
  type: string;
}

interface WorkerEarningsContentProps {
  transactions: Transaction[];
  totalEarned: number;
  pending: number;
  available: number;
  monthlyGoal: number;
}

export default function WorkerEarningsContent({
  transactions,
  totalEarned,
  pending,
  available,
  monthlyGoal
}: WorkerEarningsContentProps) {
  const goalProgress = Math.round((totalEarned / monthlyGoal) * 100);

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-32">
      
      {/* Header Section */}
      <div className="flex items-end justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface">
            Earnings
          </h1>
          <p className="text-on-surface-variant font-medium opacity-60">
            Financial ledger & payouts
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 h-11 bg-surface-container border border-surface-container-highest rounded-2xl text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all active:scale-95">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export
        </button>
      </div>

      {/* Hero Revenue Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-surface-container border border-surface-container-highest rounded-[2.5rem] p-8 md:p-10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40 mb-2">Total Earned — April</p>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl md:text-8xl font-black tracking-tighter text-on-surface">{totalEarned.toLocaleString()}</span>
                <span className="text-2xl font-black text-on-surface-variant opacity-30">ETB</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl shadow-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Escrow Active</span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Monthly Goal Progress</span>
              <span className="text-[11px] font-black text-primary">{goalProgress}% of {monthlyGoal.toLocaleString()} ETB</span>
            </div>
            <div className="h-2.5 bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="pt-8 border-t border-surface-container-highest/50 grid grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-30 mb-2">Available</p>
              <p className="text-2xl font-black text-on-surface">{available.toLocaleString()} <span className="text-xs opacity-40">ETB</span></p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-30 mb-2">Pending</p>
              <p className="text-2xl font-black text-primary">{pending.toLocaleString()} <span className="text-xs opacity-40">ETB</span></p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-30 mb-2">Withdrawn</p>
              <p className="text-2xl font-black text-on-surface">0 <span className="text-xs opacity-40">ETB</span></p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Insights */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Completion Rate", value: "98%", icon: "check_circle", color: "text-primary" },
          { label: "Avg. Ticket", value: "550 ETB", icon: "payments", color: "text-on-surface" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container border border-surface-container-highest rounded-[2rem] p-6 space-y-4 hover:border-primary/20 transition-all shadow-sm"
          >
            <span className={`material-symbols-outlined text-[24px] opacity-40 ${stat.color}`}>{stat.icon}</span>
            <div>
              <p className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payout Mechanism */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-container border border-surface-container-highest rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm group"
      >
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-black tracking-tight text-on-surface">Withdraw Funds</h3>
          <p className="text-sm text-on-surface-variant font-medium opacity-60">
            Transfer your available balance to verified accounts or mobile wallets instantly.
          </p>
        </div>
        <button
          disabled
          className="w-full md:w-auto px-10 h-14 bg-surface-container-highest text-on-surface-variant/40 rounded-2xl font-black text-sm uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-3 transition-all"
        >
          <span className="material-symbols-outlined">account_balance_wallet</span>
          Withdraw
        </button>
      </motion.div>

      {/* Transaction Feed */}
      <section className="space-y-6 px-1">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-black tracking-tight text-on-surface uppercase whitespace-nowrap">Audit Log</h2>
          <div className="h-px w-full bg-surface-container-highest opacity-50" />
        </div>

        <div className="space-y-4">
          {transactions.map((tx, i) => (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-surface-container-low border border-surface-container-highest/40 hover:border-primary/20 rounded-3xl p-5 flex items-center gap-5 transition-all duration-300 shadow-sm"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                tx.type === 'credit' ? 'bg-primary/5 text-primary' : 'bg-error-container/5 text-error'
              }`}>
                <span className="material-symbols-outlined text-[24px]">
                  {tx.type === 'credit' ? 'trending_up' : 'trending_down'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-md font-bold text-on-surface truncate">{tx.title}</p>
                <p className="text-label-sm text-on-surface-variant opacity-40 font-medium">
                  {tx.client} • {tx.date}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-lg font-black ${tx.type === 'credit' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-[10px] opacity-40">ETB</span>
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'paid' ? 'bg-primary' : 'bg-yellow-500'} shadow-[0_0_4px_currentColor] opacity-60`} />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-variant opacity-40">
                      {tx.status}
                    </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
