"use client";

import WorkerEarningsContent from "@/components/WorkerEarningsContent";

export default function EarningsPage() {
  const TRANSACTIONS = [
    { id: "1", title: "Pipe Repair – Sabian", client: "Fatuma H.", amount: 800, date: "Apr 25, 2026", status: "paid", type: "credit" },
    { id: "2", title: "Valve Replacement – Kezira", client: "Solomon T.", amount: 500, date: "Apr 18, 2026", status: "pending", type: "credit" },
    { id: "3", title: "Emergency Drain Unclog", client: "Hana D.", amount: 350, date: "Apr 10, 2026", status: "paid", type: "credit" },
    { id: "4", title: "Platform Fee", client: "DireSkill", amount: -80, date: "Apr 25, 2026", status: "deducted", type: "debit" },
  ];

  const stats = {
    totalEarned: 1650,
    pending: 500,
    available: 1070,
    monthlyGoal: 5000
  };

  return (
    <WorkerEarningsContent 
      transactions={TRANSACTIONS}
      totalEarned={stats.totalEarned}
      pending={stats.pending}
      available={stats.available}
      monthlyGoal={stats.monthlyGoal}
    />
  );
}
