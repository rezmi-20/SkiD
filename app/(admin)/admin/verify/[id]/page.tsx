import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { toggleWorkerVerification } from "@/lib/actions/admin";

export default async function WorkerVerificationPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch worker details and user email
  const workers = await sql`
    SELECT wp.*, u.email, u.phone 
    FROM worker_profiles wp 
    JOIN users u ON wp.user_id = u.id 
    WHERE wp.user_id = ${id} 
    LIMIT 1
  `;

  const worker = workers[0];

  if (!worker) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <header className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <a href="/admin/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-xs">arrow_back_ios</span>
            Back to Dashboard
          </a>
          <h1 className="text-5xl font-headline font-black text-on-surface tracking-tighter">Review Verification</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Status</p>
          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${worker.is_verified ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-secondary/20 text-secondary border border-secondary/20'}`}>
            {worker.is_verified ? 'Verified' : 'Pending Review'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <aside className="space-y-8">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">Professional Identity</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-on-surface-variant">Full Name</p>
                <p className="font-bold text-on-surface">{worker.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Email Address</p>
                <p className="font-bold text-on-surface">{worker.email}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Phone Number</p>
                <p className="font-bold text-on-surface">{worker.phone}</p>
              </div>
            </div>
          </section>

          <section>
             <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">Location & Skills</h3>
             <div className="space-y-4">
                <div>
                  <p className="text-xs text-on-surface-variant">District</p>
                  <p className="font-bold text-on-surface">{worker.district || "Not provided"}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {worker.skills?.map((skill: string) => (
                    <span key={skill} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-on-surface tracking-wide uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
             </div>
          </section>
        </aside>

        <main className="md:col-span-2 space-y-10">
          <section className="bg-surface-container-high rounded-[2rem] border border-white/5 overflow-hidden">
             <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface">Fayda ID Document</h3>
                <span className="material-symbols-outlined text-on-surface-variant">fingerprint</span>
             </div>
             <div className="p-8 bg-black/40 flex items-center justify-center min-h-[400px]">
                {worker.fayda_doc_url ? (
                  <img 
                    src={worker.fayda_doc_url} 
                    alt="Fayda ID" 
                    className="max-w-full rounded-2xl shadow-2xl border border-white/10 grayscale hover:grayscale-0 transition-all duration-700" 
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl">file_open</span>
                    <p className="text-xs font-medium">No document uploaded.</p>
                  </div>
                )}
             </div>
          </section>

          <div className="flex gap-4">
             <form action={async () => {
                "use server";
                await toggleWorkerVerification(worker.user_id, true);
                redirect("/admin/dashboard");
             }} className="flex-1">
                <button 
                  disabled={worker.is_verified}
                  className="w-full bg-primary text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/80 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                >
                  {worker.is_verified ? 'Successfully Certified' : 'Approve & Verify'}
                </button>
             </form>

             {worker.is_verified && (
               <form action={async () => {
                  "use server";
                  await toggleWorkerVerification(worker.user_id, false);
                  redirect("/admin/dashboard");
               }}>
                  <button className="px-6 h-full bg-surface-container-high border border-white/5 text-secondary py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
                    Reject
                  </button>
               </form>
             )}
          </div>
        </main>
      </div>
    </div>
  );
}
