export default function GigsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
        <span className="material-symbols-outlined text-blue-500 text-4xl">handyman</span>
      </div>
      <h1 className="text-3xl font-headline font-black text-on-surface tracking-tighter uppercase">My Gigs</h1>
      <p className="text-on-surface-variant max-w-xs">Gig management and task tracking for your current assignments.</p>
    </div>
  );
}
