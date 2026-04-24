export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 px-6 text-white pb-24 md:pb-10">
      <div className="relative">
        <div className="w-24 h-24 bg-green-400/10 rounded-3xl flex items-center justify-center border border-green-400/20 shadow-[0_0_40px_rgba(74,222,128,0.1)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-[#09090b] flex items-center justify-center animate-bounce">
           <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">Messages</h1>
        <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
          Real-time chat with professionals is currently being synchronized with your district nodes.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse delay-75"></div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse delay-150"></div>
      </div>
    </div>
  );
}
