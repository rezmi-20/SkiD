import Link from "next/link";

export default function UnderConstruction({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
         <span className="material-symbols-outlined text-primary text-[64px] animate-pulse">construction</span>
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-on-surface uppercase tracking-tighter">
          {title} <span className="text-primary italic">Module</span>
        </h1>
        <p className="text-on-surface-variant opacity-60 max-w-md mx-auto">
          This section of the DireAdmin Command Center is currently being optimized for peak performance. Check back soon for full access.
        </p>
      </div>
      <Link 
        href="/admin/dashboard"
        className="px-8 py-4 bg-surface-container-high rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all active:scale-95 shadow-xl shadow-black/20"
      >
        Back to Command
      </Link>
    </div>
  );
}
