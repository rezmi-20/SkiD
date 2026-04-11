import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function WorkerDashboardPage() {
  const session = await auth();
  
  if (!session || session.user.role !== "worker") {
    redirect("/login");
  }

  // Fetch worker profile and assigned jobs
  const profileRows = await sql`SELECT full_name, is_verified, district, skills FROM worker_profiles WHERE user_id = ${session.user.id} LIMIT 1`;
  const jobRows = await sql`SELECT * FROM jobs WHERE worker_id = ${session.user.id} ORDER BY created_at DESC LIMIT 5`;
  
  const worker = profileRows[0];
  const fullName = worker?.full_name || "Professional";
  const isVerified = worker?.is_verified || false;

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-black dark:text-white font-inter selection:bg-blue-500/30 transition-colors duration-500">
      
      {/* Precision Frame Overlay */}
      <div className="fixed inset-0 pointer-events-none border-[12px] border-white dark:border-[#000000] z-[100] hidden md:block" />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-20 space-y-12 md:space-y-20 relative">
        
        {/* Dynamic Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 border-b border-gray-100 dark:border-white/5 pb-10 md:pb-16">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-8xl font-black tracking-tightest leading-none">
                {fullName.split(' ')[0]}<span className="text-blue-600">.</span>
              </h1>
              {isVerified && (
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-600/20 rounded-xl flex items-center justify-center">
                   <span className="material-symbols-outlined text-blue-600 text-[16px] md:text-[20px] font-black">verified</span>
                </div>
              )}
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm md:text-xl font-medium max-w-xl leading-relaxed">
              Professional identity status in <span className="text-black dark:text-white underline underline-offset-8 decoration-gray-200 dark:decoration-white/10">{worker?.district || "Dire Dawa"}</span>. Indexed for district economy.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
             <form action={async () => {
               "use server";
               const { signOut } = await import("@/lib/auth");
               await signOut({ redirectTo: "/login" });
             }}>
               <button className="px-8 h-14 flex items-center bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 transition-all">
                  Terminate Session
               </button>
             </form>
             <a href="/worker/profile" className="px-8 h-14 flex items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                Profile Index
             </a>
             <a 
               href={isVerified ? "/worker/jobs" : "#"} 
               className={`px-10 h-14 flex items-center rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                 isVerified 
                   ? "bg-black dark:bg-white text-white dark:text-black shadow-lg" 
                   : "bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-700 cursor-not-allowed border border-gray-200 dark:border-white/5"
               }`}
             >
               Browse Requests
               {!isVerified && <span className="material-symbols-outlined ml-3 text-[16px]">lock</span>}
             </a>
          </div>
        </header>

        {/* Global Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="col-span-1 md:col-span-2 p-12 bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-white/5 rounded-[2.5rem] space-y-12 group hover:border-blue-600/20 transition-all duration-700">
              <div className="flex justify-between items-start">
                 <div className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]">Revenue Ledger</div>
                 <span className="material-symbols-outlined text-gray-200 dark:text-white/5 text-6xl group-hover:text-blue-600/10 transition-colors">account_balance</span>
              </div>
              <div className="space-y-2">
                 <div className="text-6xl md:text-8xl font-black tracking-tightest text-black dark:text-white">
                    0<span className="text-gray-200 dark:text-white/10">.00</span>
                 </div>
                 <div className="text-xs font-black text-blue-600 uppercase tracking-widest">Escrowed — ETB</div>
              </div>
              <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex gap-8">
                 <div className="text-[9px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-700">Ready: 0.00</div>
                 <div className="text-[9px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-700">Pending audit: 0.00</div>
              </div>
           </div>

           <div className="p-12 bg-white dark:bg-[#000000] border border-gray-100 dark:border-white/5 rounded-[2.5rem] flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-[#070707] transition-all">
              <div className="space-y-8">
                 <div className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] text-center">Active Requests</div>
                 <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center relative bg-white dark:bg-[#000000] shadow-sm">
                       <span className="text-5xl font-black">{jobRows.filter((j: any) => j.status === 'active').length}</span>
                    </div>
                 </div>
              </div>
              <div className="text-[10px] font-black text-center text-blue-600 uppercase tracking-[0.2em] pt-8">Synchronization Active</div>
           </div>
        </div>

        {/* COMPLIANCE STATUS */}
        {!isVerified && (
          <section className="bg-blue-50 dark:bg-blue-600/5 border border-blue-100 dark:border-blue-600/10 p-12 rounded-[2.5rem] flex flex-col lg:flex-row items-center gap-12">
             <div className="w-20 h-20 bg-white dark:bg-black rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-600/20 shadow-xl shadow-blue-600/5 shrink-0">
                <span className="material-symbols-outlined text-blue-600 text-4xl font-black">pending_actions</span>
             </div>
             <div className="flex-1 space-y-4 text-center lg:text-left">
                <h3 className="text-3xl font-black tracking-tightest uppercase text-blue-900 dark:text-blue-100">Profile Authentication Pending</h3>
                <p className="text-blue-900/40 dark:text-blue-200/20 text-lg font-medium leading-relaxed max-w-3xl">
                   Your professional indexing is in standard queue. Until the Fayda manual audit is complete, your footprint is restricted from district-wide job synchronization.
                </p>
             </div>
             <button className="h-14 px-10 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-600/20 pointer-events-none opacity-50">
                In Review
             </button>
          </section>
        )}

        {/* Activity Log */}
        <section className="space-y-12">
          <div className="flex items-center gap-8">
            <h2 className="text-3xl font-black tracking-tightest uppercase">District Requests</h2>
            <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
          </div>

          {!isVerified ? (
            <div className="aspect-[3/1] bg-gray-50/50 dark:bg-[#020202] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/5 flex flex-col items-center justify-center gap-6 group">
               <div className="w-16 h-16 bg-white dark:bg-black rounded-full flex items-center justify-center transition-colors border border-gray-100 dark:border-white/5">
                  <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-3xl group-hover:text-blue-600/40 transition-colors">lock</span>
               </div>
               <p className="text-gray-400 dark:text-gray-600 font-medium text-center uppercase text-[10px] tracking-[0.2em]">Locked — Awaiting Identity Indexing</p>
            </div>
          ) : jobRows.length > 0 ? (
            <div className="space-y-4">
              {jobRows.map((job: any) => (
                <div key={job.id} className="p-10 bg-gray-50 dark:bg-[#050505] rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center group hover:border-black dark:hover:border-white transition-all duration-500">
                  <div className="space-y-3 mb-8 md:mb-0">
                    <h3 className="text-3xl font-black tracking-tightest group-hover:text-blue-600 transition-colors">{job.title}</h3>
                    <p className="text-gray-400 dark:text-gray-500 font-medium text-lg">{job.description?.substring(0, 100)}...</p>
                  </div>
                  <div className="flex items-center gap-8 w-full md:w-auto">
                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-700">Status: {job.status}</div>
                    <a href={`/worker/jobs/${job.id}`} className="w-14 h-14 bg-black dark:bg-white rounded-xl flex items-center justify-center group-hover:translate-x-2 transition-all">
                       <span className="material-symbols-outlined text-white dark:text-black font-black">arrow_forward_ios</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-[3/1] bg-gray-50/50 dark:bg-[#020202] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/5 flex flex-col items-center justify-center gap-4">
               <span className="material-symbols-outlined text-5xl text-gray-100 dark:text-white/5">inventory_2</span>
               <p className="text-gray-300 dark:text-gray-700 font-black uppercase text-[10px] tracking-[0.2em]">District Archive Empty</p>
            </div>
          )}
        </section>
      </main>

      {/* Persistent Decorative Element */}
      <div className="fixed top-1/2 -right-20 -translate-y-1/2 rotate-90 font-black text-[12vw] text-gray-50 dark:text-white/[0.01] pointer-events-none select-none tracking-tightest uppercase hidden lg:block">
        Worker
      </div>
    </div>
  );
}
