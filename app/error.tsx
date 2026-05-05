"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to your analytics or diagnostic service
    console.error("[DIREDAWA-CRASH]", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b] flex flex-col items-center justify-center p-10 text-center gap-10">
      <div className="space-y-6">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-red-500 mx-auto">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        
        <div className="space-y-3">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none">
                Something <span className="text-red-500 italic">Went Wrong</span>
            </h2>
            <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                The application encountered an unexpected error. This usually happens due to connection instability.
            </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="bg-white text-black h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-zinc-900 border border-white/10 text-white h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
        >
          Return to Home
        </button>
      </div>

      {/* Diagnostic Info (Hidden by default, can be toggled if needed) */}
      <div className="mt-8 opacity-20 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
        Error ID: {error.digest || "N/A"}
      </div>
    </div>
  );
}
