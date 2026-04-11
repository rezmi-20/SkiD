import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export default async function ClientDashboardPage() {
  const session = await auth();
  
  // Fetch client profile and active jobs
  const profileRows = await sql`SELECT full_name FROM client_profiles WHERE user_id = ${session?.user.id}`;
  const jobRows = await sql`SELECT * FROM jobs WHERE client_id = ${session?.user.id} ORDER BY created_at DESC LIMIT 5`;
  
  const fullName = profileRows[0]?.full_name || "Client";

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-on-surface tracking-tighter">
            Marhaba, <span className="text-primary italic">{fullName}</span>
          </h1>
          <p className="text-on-surface-variant text-sm md:text-lg">Manage your active service requests and workers.</p>
        </div>
        <div className="flex items-center gap-4">
          <form action={async () => {
             "use server";
             const { signOut } = await import("@/lib/auth");
             await signOut({ redirectTo: "/login" });
          }}>
            <button className="px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-white/5 transition-all">
               Sign Out
            </button>
          </form>
          <a 
            href="/client/search" 
            className="bg-primary text-on-primary px-8 py-3.5 rounded-2xl font-headline font-bold tracking-tight active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            Find a Worker
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-high p-8 rounded-3xl border border-white/5 space-y-2">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Active Jobs</p>
          <p className="text-4xl font-headline font-black text-on-surface">{jobRows.filter((j: any) => j.status === 'active').length}</p>
        </div>
        <div className="bg-surface-container-high p-8 rounded-3xl border border-white/5 space-y-2">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Pending Requests</p>
          <p className="text-4xl font-headline font-black text-on-surface">{jobRows.filter((j: any) => j.status === 'pending').length}</p>
        </div>
        <div className="bg-surface-container-high p-8 rounded-3xl border border-white/5 space-y-2">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Total Spent</p>
          <p className="text-4xl font-headline font-black text-primary italic">0 ETB</p>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-headline font-black text-on-surface tracking-tight">Recent Activity</h2>
        {jobRows.length > 0 ? (
          <div className="space-y-4">
            {jobRows.map((job: any) => (
              <div key={job.id} className="bg-surface-container p-6 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-surface-container-high transition-all">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{job.title}</h3>
                  <p className="text-sm text-on-surface-variant capitalize">{job.status} • Received {new Date(job.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                    job.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {job.status}
                  </span>
                  <a href={`/jobs/${job.id}`} className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="aspect-[2/1] bg-surface-container-low rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">work_history</span>
            <p className="text-on-surface-variant font-medium">No active jobs yet. Start by finding a worker.</p>
          </div>
        )}
      </section>
    </div>
  );
}
