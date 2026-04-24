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
    <div className="max-w-7xl mx-auto space-y-12 text-white pb-24 md:pb-10">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-none">
               {fullName.split(' ')[0]}<span className="text-green-400">.</span>
             </h1>
             {isVerified && (
               <div className="w-10 h-10 md:w-12 md:h-12 bg-green-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
               </div>
             )}
          </div>
          <p className="text-zinc-500 text-sm md:text-lg font-medium max-w-xl leading-relaxed">
            Professional in <span className="text-white underline underline-offset-8 decoration-green-400/30">{worker?.district || "Dire Dawa"}</span>. Indexed for district economy.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
           <a 
             href={isVerified ? "/worker/jobs" : "#"} 
             className={`flex-1 md:flex-none px-8 h-12 flex items-center justify-center rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
               isVerified 
                 ? "bg-green-400 text-black hover:bg-green-300 shadow-xl shadow-green-400/10" 
                 : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5 opacity-50"
             }`}
           >
             Browse Requests
             {!isVerified && (
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-2">
                 <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                 <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
               </svg>
             )}
           </a>
           <a href="/worker/profile" className="px-6 h-12 flex items-center bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
              Profile
           </a>
        </div>
      </header>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 p-8 md:p-12 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] space-y-8 group hover:border-green-400/30 transition-all duration-500">
            <div className="flex justify-between items-start">
               <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Revenue Ledger</div>
               <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-green-400/10 group-hover:border-green-400/20 transition-all">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 group-hover:text-green-400 transition-colors">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
               </div>
            </div>
            <div className="space-y-2">
               <div className="text-6xl md:text-8xl font-black tracking-tighter text-white">
                  0<span className="text-zinc-800">.00</span>
               </div>
               <div className="text-xs font-black text-green-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  Escrowed — ETB
               </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex flex-wrap gap-8">
               <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Available: <span className="text-white">0.00</span></div>
               <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pending Audit: <span className="text-white">0.00</span></div>
            </div>
         </div>

         <div className="p-8 md:p-10 bg-zinc-900 border border-white/5 rounded-[2.5rem] flex flex-col justify-between hover:bg-zinc-800/50 transition-all group">
            <div className="space-y-8">
               <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] text-center">Active Requests</div>
               <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-zinc-800 flex items-center justify-center bg-zinc-950 shadow-[0_0_40px_rgba(0,0,0,0.5)] group-hover:border-green-400/20 transition-all">
                     <span className="text-6xl font-black text-white group-hover:text-green-400 transition-colors">{jobRows.filter((j: any) => j.status === 'active').length}</span>
                  </div>
               </div>
            </div>
            <div className="text-[10px] font-black text-center text-green-400/40 uppercase tracking-[0.2em] pt-8">Synchronization Active</div>
         </div>
      </div>

      {/* Pending Verification Banner */}
      {!isVerified && (
        <section className="bg-green-400/5 border border-green-400/10 p-8 md:p-12 rounded-[2.5rem] flex flex-col lg:flex-row items-center gap-10">
           <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center border border-green-400/20 shadow-2xl shrink-0">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
           </div>
           <div className="flex-1 space-y-4 text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Authentication Pending</h3>
              <p className="text-zinc-500 text-base md:text-lg font-medium leading-relaxed max-w-3xl">
                 Your professional indexing is in the standard queue. Your profile is restricted from district-wide job synchronization until Fayda manual audit is complete.
              </p>
           </div>
           <div className="h-12 px-10 bg-zinc-800 text-zinc-500 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center border border-white/5">
              In Review
           </div>
        </section>
      )}

      {/* District Requests */}
      <section className="space-y-10">
        <div className="flex items-center gap-8">
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">District Requests</h2>
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>

        {!isVerified ? (
          <div className="py-24 bg-zinc-900/30 rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center gap-6 group hover:border-green-400/20 transition-all">
             <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-700">
                   <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                   <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
             </div>
             <p className="text-zinc-600 font-bold uppercase text-[11px] tracking-[0.3em]">Locked — Awaiting Identity Indexing</p>
          </div>
        ) : jobRows.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {jobRows.map((job: any) => (
              <div key={job.id} className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center group hover:bg-zinc-800/50 transition-all duration-500">
                <div className="space-y-2 mb-8 md:mb-0">
                  <h3 className="text-2xl font-black tracking-tighter group-hover:text-green-400 transition-colors">{job.title}</h3>
                  <p className="text-zinc-500 font-medium max-w-2xl">{job.description?.substring(0, 120)}...</p>
                </div>
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Status: <span className="text-green-400">{job.status}</span></div>
                  <a href={`/worker/jobs/${job.id}`} className="w-14 h-14 bg-zinc-800 text-white rounded-2xl flex items-center justify-center group-hover:bg-green-400 group-hover:text-black group-hover:translate-x-2 transition-all shadow-xl">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                     </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 bg-zinc-900/30 rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center gap-6">
             <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-700">
                   <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
             </div>
             <p className="text-zinc-600 font-bold uppercase text-[11px] tracking-[0.3em]">District Archive Empty</p>
          </div>
        )}
      </section>
    </div>
  );
}
