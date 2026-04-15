import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function WorkerDashboardPage() {
  const session = await auth();
  
  if (!session || session.user.role !== "worker") {
    redirect("/login");
  }

  const profileRows = await sql`SELECT full_name, is_verified, district, skills FROM worker_profiles WHERE user_id = ${session.user.id} LIMIT 1`;
  const jobRows = await sql`SELECT * FROM jobs WHERE worker_id = ${session.user.id} ORDER BY created_at DESC LIMIT 5`;
  
  const worker = profileRows[0];
  const fullName = worker?.full_name || "Professional";
  const isVerified = worker?.is_verified || false;

  return (
    <div className="min-h-screen bg-background text-text-high font-body selection:bg-primary/30 transition-colors duration-500">

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 space-y-10 relative">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-7xl font-headline font-black tracking-tighter leading-none text-text-high">
                {fullName.split(' ')[0]}<span className="text-primary">.</span>
              </h1>
              {isVerified && (
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-[16px] md:text-[20px]">verified</span>
                </div>
              )}
            </div>
            <p className="text-text-med text-sm md:text-lg font-medium max-w-xl leading-relaxed">
              Professional in <span className="text-text-high underline underline-offset-4 decoration-border">{worker?.district || "Dire Dawa"}</span>. Indexed for district economy.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
             <form action={async () => {
               "use server";
               const { signOut } = await import("@/lib/auth");
               await signOut({ redirectTo: "/login" });
             }}>
               <button className="px-6 h-11 flex items-center bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 transition-all">
                  Sign Out
               </button>
             </form>
             <a href="/worker/profile" className="px-6 h-11 flex items-center bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-med hover:text-text-high hover:bg-black/5 transition-all">
                Profile
             </a>
             <a 
               href={isVerified ? "/worker/jobs" : "#"} 
               className={`px-8 h-11 flex items-center rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                 isVerified 
                   ? "bg-primary text-black hover:bg-primary/80 shadow-lg" 
                   : "bg-surface text-text-med cursor-not-allowed border border-border opacity-50"
               }`}
             >
               Browse Requests
               {!isVerified && <span className="material-symbols-outlined ml-2 text-[16px]">lock</span>}
             </a>
          </div>
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="col-span-1 md:col-span-2 p-8 md:p-12 bg-surface border border-border rounded-3xl space-y-8 group hover:border-primary/20 transition-all duration-500">
              <div className="flex justify-between items-start">
                 <div className="text-[10px] font-black text-text-med uppercase tracking-[0.3em]">Revenue Ledger</div>
                 <span className="material-symbols-outlined text-border text-5xl group-hover:text-primary/20 transition-colors">account_balance</span>
              </div>
              <div className="space-y-2">
                 <div className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-text-high">
                    0<span className="text-border">.00</span>
                 </div>
                 <div className="text-xs font-black text-primary uppercase tracking-widest">Escrowed — ETB</div>
              </div>
              <div className="pt-6 border-t border-border flex gap-8">
                 <div className="text-[9px] font-black uppercase tracking-widest text-text-med">Ready: 0.00</div>
                 <div className="text-[9px] font-black uppercase tracking-widest text-text-med">Pending Audit: 0.00</div>
              </div>
           </div>

           <div className="p-8 bg-surface border border-border rounded-3xl flex flex-col justify-between hover:bg-black/5 transition-all">
              <div className="space-y-6">
                 <div className="text-[10px] font-black text-text-med uppercase tracking-[0.3em] text-center">Active Requests</div>
                 <div className="flex justify-center">
                    <div className="w-28 h-28 rounded-full border border-border flex items-center justify-center bg-background">
                       <span className="text-5xl font-headline font-black text-text-high">{jobRows.filter((j: any) => j.status === 'active').length}</span>
                    </div>
                 </div>
              </div>
              <div className="text-[10px] font-black text-center text-primary uppercase tracking-[0.2em] pt-6">Synchronization Active</div>
           </div>
        </div>

        {/* Pending Verification Banner */}
        {!isVerified && (
          <section className="bg-primary/5 border border-primary/10 p-8 md:p-12 rounded-3xl flex flex-col lg:flex-row items-center gap-8">
             <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center border border-primary/20 shadow-xl shrink-0">
                <span className="material-symbols-outlined text-primary text-3xl">pending_actions</span>
             </div>
             <div className="flex-1 space-y-3 text-center lg:text-left">
                <h3 className="text-2xl font-headline font-black tracking-tighter uppercase text-text-high">Profile Authentication Pending</h3>
                <p className="text-text-med text-base font-medium leading-relaxed max-w-3xl">
                   Your professional indexing is in the standard queue. Your profile is restricted from district-wide job synchronization until Fayda manual audit is complete.
                </p>
             </div>
             <button className="h-11 px-8 bg-primary text-black rounded-xl font-black text-[10px] uppercase tracking-widest opacity-50 pointer-events-none">
                In Review
             </button>
          </section>
        )}

        {/* District Requests */}
        <section className="space-y-8">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl md:text-3xl font-headline font-black tracking-tighter uppercase text-text-high">District Requests</h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          {!isVerified ? (
            <div className="py-20 bg-surface rounded-3xl border border-dashed border-border flex flex-col items-center justify-center gap-6 group">
               <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center border border-border">
                  <span className="material-symbols-outlined text-text-med text-2xl group-hover:text-primary/40 transition-colors">lock</span>
               </div>
               <p className="text-text-med font-medium text-center uppercase text-[10px] tracking-[0.2em]">Locked — Awaiting Identity Indexing</p>
            </div>
          ) : jobRows.length > 0 ? (
            <div className="space-y-4">
              {jobRows.map((job: any) => (
                <div key={job.id} className="p-8 bg-surface rounded-3xl border border-border flex flex-col md:flex-row justify-between items-center group hover:border-primary/20 transition-all duration-500">
                  <div className="space-y-2 mb-6 md:mb-0">
                    <h3 className="text-2xl font-headline font-black tracking-tighter group-hover:text-primary transition-colors">{job.title}</h3>
                    <p className="text-text-med font-medium">{job.description?.substring(0, 100)}...</p>
                  </div>
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="text-[9px] font-black uppercase tracking-widest text-text-med">Status: {job.status}</div>
                    <a href={`/worker/jobs/${job.id}`} className="w-12 h-12 bg-primary text-black rounded-xl flex items-center justify-center group-hover:translate-x-2 transition-all">
                       <span className="material-symbols-outlined font-black text-sm">arrow_forward_ios</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 bg-surface rounded-3xl border border-dashed border-border flex flex-col items-center justify-center gap-4">
               <span className="material-symbols-outlined text-5xl text-border">inventory_2</span>
               <p className="text-text-med font-black uppercase text-[10px] tracking-[0.2em]">District Archive Empty</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
