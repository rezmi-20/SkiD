export default function GigsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 px-6 text-white pb-24 md:pb-10">
      <div className="relative">
        <div className="w-24 h-24 bg-green-400/10 rounded-3xl flex items-center justify-center border border-green-400/20 shadow-[0_0_40px_rgba(74,222,128,0.1)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
             <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-[#09090b] flex items-center justify-center">
           <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">My Gigs</h1>
        <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
          Gig management and task tracking for your current assignments.
        </p>
      </div>

      <div className="w-full max-w-xs p-6 bg-zinc-900 border border-white/5 rounded-3xl space-y-4">
         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-600">
            <span>Active Assignments</span>
            <span className="text-white">0</span>
         </div>
         <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 w-0"></div>
         </div>
      </div>
    </div>
  );
}
