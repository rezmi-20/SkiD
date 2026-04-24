export default function EarningsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 px-6 text-white pb-24 md:pb-10">
      <div className="relative">
        <div className="w-24 h-24 bg-green-400/10 rounded-3xl flex items-center justify-center border border-green-400/20 shadow-[0_0_40px_rgba(74,222,128,0.1)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-[#09090b] flex items-center justify-center">
           <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">Earnings Index</h1>
        <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
          Financial ledger and payment synchronization for your completed tasks.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
         <div className="bg-zinc-900 border border-white/5 p-4 rounded-2xl text-center">
            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Total</div>
            <div className="text-xl font-black text-white">0.00</div>
         </div>
         <div className="bg-zinc-900 border border-white/5 p-4 rounded-2xl text-center">
            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Pending</div>
            <div className="text-xl font-black text-green-400">0.00</div>
         </div>
      </div>
    </div>
  );
}
