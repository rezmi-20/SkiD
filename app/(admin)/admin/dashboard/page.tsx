import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export default async function AdminDashboardPage() {
  const session = await auth();
  
  // Aggregate some basic stats
  const userCount = await sql`SELECT COUNT(*) FROM users`;
  const workerCount = await sql`SELECT COUNT(*) FROM worker_profiles`;
  const pendingGigs = await sql`SELECT COUNT(*) FROM jobs WHERE status = 'pending'`;
  const unverifiedWorkers = await sql`SELECT wp.*, u.email 
                                      FROM worker_profiles wp 
                                      JOIN users u ON wp.user_id = u.id 
                                      WHERE wp.is_verified = false 
                                      LIMIT 10`;

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tighter mb-2">Platform Administration</h1>
          <p className="text-on-surface-variant">High-level overview of the Dire Marketplace ecosystem.</p>
        </div>
        <form action={async () => {
             "use server";
             const { signOut } = await import("@/lib/auth");
             await signOut({ redirectTo: "/login" });
        }}>
          <button className="px-6 py-2.5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-white/5 transition-all">
             Sign Out
          </button>
        </form>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-high p-6 rounded-3xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary">groups</span>
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">{userCount[0].count}</p>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Total Users</p>
        </div>
        <div className="bg-surface-container-high p-6 rounded-3xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-secondary">engineering</span>
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">{workerCount[0].count}</p>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Total Professionals</p>
        </div>
        <div className="bg-surface-container-high p-6 rounded-3xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary">request_quote</span>
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">{pendingGigs[0].count}</p>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Pending Job Requests</p>
        </div>
        <div className="bg-surface-container-high p-6 rounded-3xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
          </div>
          <p className="text-3xl font-headline font-black text-primary italic">0 ETB</p>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Platform Volume</p>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
            <h2 className="text-xl font-headline font-black text-on-surface tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">new_releases</span>
                Pending Verifications
            </h2>
            <div className="bg-surface-container-high rounded-3xl border border-white/5 overflow-hidden">
                {unverifiedWorkers.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {unverifiedWorkers.map((w: any) => (
                            <div key={w.user_id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div>
                                    <p className="font-bold text-on-surface">{w.full_name}</p>
                                    <p className="text-xs text-on-surface-variant">{w.email}</p>
                                </div>
                                <a href={`/admin/verify/${w.user_id}`} className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Review Document</a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-10 text-center text-on-surface-variant text-sm font-medium">All workers are verified.</div>
                )}
            </div>
        </div>
        
        <div className="space-y-6">
            <h2 className="text-xl font-headline font-black text-on-surface tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">gavel</span>
                Active Disputes
            </h2>
             <div className="bg-surface-container-low rounded-3xl border border-dashed border-white/10 p-10 text-center">
                <p className="text-on-surface-variant text-sm font-medium">No active disputes to resolve.</p>
            </div>
        </div>
      </section>
    </div>
  );
}
