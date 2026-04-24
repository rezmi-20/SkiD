import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export default async function ClientDashboardPage() {
  const session = await auth();
  
  // Fetch client profile and active jobs
  const profileRows = await sql`SELECT full_name FROM client_profiles WHERE user_id = ${session?.user.id}`;
  const jobRows = await sql`SELECT * FROM jobs WHERE client_id = ${session?.user.id} ORDER BY created_at DESC LIMIT 5`;
  
  const fullName = profileRows[0]?.full_name || "Client";

  return (
    <div className="max-w-6xl mx-auto space-y-12 text-white pb-24 md:pb-10">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-green-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
             </div>
             <h1 className="text-3xl md:text-6xl font-black tracking-tighter">
               Marhaba, <span className="text-green-400 italic">{fullName.split(' ')[0]}</span>
             </h1>
          </div>
          <p className="text-zinc-500 text-sm md:text-lg font-medium ml-1">Manage your active service requests and workers.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <a 
            href="/client/search" 
            className="flex-1 md:flex-none bg-green-400 text-black px-8 h-12 flex items-center justify-center rounded-2xl font-bold text-sm tracking-tight active:scale-95 transition-all shadow-xl shadow-green-400/10 hover:bg-green-300"
          >
            Find a Worker
          </a>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 space-y-2 group hover:border-green-400/30 transition-all">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Jobs</p>
          <p className="text-5xl font-black text-white group-hover:text-green-400 transition-colors">
            {jobRows.filter((j: any) => j.status === 'active').length}
          </p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 space-y-2 group hover:border-green-400/30 transition-all">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pending Requests</p>
          <p className="text-5xl font-black text-white group-hover:text-green-400 transition-colors">
            {jobRows.filter((j: any) => j.status === 'pending').length}
          </p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 space-y-2 group hover:border-green-400/30 transition-all">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Spent</p>
          <p className="text-5xl font-black text-green-400 italic">0 ETB</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-6">
          <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white">Recent Activity</h2>
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        
        {jobRows.length > 0 ? (
          <div className="space-y-4">
            {jobRows.map((job: any) => (
              <div key={job.id} className="bg-zinc-900 border border-white/5 p-6 rounded-3xl flex justify-between items-center group hover:bg-zinc-800/50 transition-all">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">{job.title}</h3>
                  <p className="text-sm text-zinc-500 font-medium capitalize">{job.status} • Received {new Date(job.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    job.status === 'active' ? 'bg-green-400/10 text-green-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {job.status}
                  </span>
                  <a href={`/jobs/${job.id}`} className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-green-400 group-hover:bg-green-400/10 transition-all">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                     </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="aspect-[2/1] bg-zinc-900/30 rounded-[2.5rem] border border-dashed border-white/5 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-700">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
               </svg>
            </div>
            <p className="text-zinc-500 font-bold uppercase text-[11px] tracking-widest">No active jobs yet</p>
          </div>
        )}
      </section>
    </div>
  );
}
