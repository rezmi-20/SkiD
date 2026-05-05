export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b] flex flex-col items-center justify-center p-10 text-center gap-8">
      {/* Premium Loader Component */}
      <div className="relative">
        <div className="w-16 h-16 border-2 border-green-400/10 border-t-green-400 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-b-green-400/30 rounded-full animate-[spin_2s_linear_infinite]"></div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 justify-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                    <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                    <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
                </svg>
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase">
                DIRE<span className="text-green-400">SKILL</span>
            </span>
        </div>
        <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Interface...</p>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-green-400 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-white rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
