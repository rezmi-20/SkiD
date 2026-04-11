export default function EarningsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
        <span className="material-symbols-outlined text-green-500 text-4xl">payments</span>
      </div>
      <h1 className="text-3xl font-headline font-black text-on-surface tracking-tighter uppercase">Earnings Index</h1>
      <p className="text-on-surface-variant max-w-xs">Financial ledger and payment synchronization for your completed tasks.</p>
    </div>
  );
}
