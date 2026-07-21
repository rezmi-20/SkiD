"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

interface WorkerVerificationContentProps {
  worker: {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    fayda_fan_number?: string | null;
    district: string;
    skills: string[];
    fayda_doc_url: string;
    is_verified: boolean;
  };
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export default function WorkerVerificationContent({
  worker,
  onApprove,
  onReject
}: WorkerVerificationContentProps) {
  const [rejectReason, setRejectReason] = useState("");

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-4">
          <Link 
            href="/admin/dashboard" 
            className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:opacity-70 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to Command
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-tight">
              Review <span className="text-primary">Identity</span>
            </h1>
            <p className="text-on-surface-variant font-medium opacity-60">
              Auditing professional credentials for platform security.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">System Status</p>
          <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-sm border ${
            worker.is_verified 
              ? 'bg-primary/10 text-primary border-primary/20' 
              : 'bg-secondary/10 text-secondary border-secondary/20'
          }`}>
            {worker.is_verified ? 'Verified Asset' : 'Pending Audit'}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left Sidebar: Data */}
        <aside className="space-y-10 order-2 md:order-1">
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">person</span>
              Profile Metadata
            </h3>
            <div className="space-y-5 bg-surface-container-low p-6 rounded-[2rem] border border-surface-container-highest/50">
              {[
                { label: "Legal Name", value: worker.full_name },
                { label: "Email Index", value: worker.email },
                { label: "Phone Node", value: `+251 ${worker.phone}` },
                { label: "Fayda FAN", value: worker.fayda_fan_number || "Not recorded" },
                { label: "District", value: worker.district || "Unspecified" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-30 mb-1">{item.label}</p>
                  <p className="font-bold text-on-surface leading-tight break-all">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">construction</span>
                Service Taxonomy
             </h3>
             <div className="flex flex-wrap gap-2 pt-1">
                {worker.skills?.map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 bg-surface-container-high border border-surface-container-highest rounded-xl text-[10px] font-black text-on-surface-variant tracking-wider uppercase">
                    {skill}
                  </span>
                ))}
             </div>
          </section>
        </aside>

        {/* Right Content: Document */}
        <main className="md:col-span-2 space-y-10 order-1 md:order-2">
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container border border-surface-container-highest rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
             <div className="p-6 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-high">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface opacity-60">Fayda National ID Scan</h3>
                <span className="material-symbols-outlined text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">fingerprint</span>
             </div>
             <div className="p-10 bg-black/50 flex items-center justify-center min-h-[500px] relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none z-10" />
                {worker.fayda_doc_url ? (
                  <img 
                    src={worker.fayda_doc_url} 
                    alt="Fayda ID" 
                    className="max-w-full rounded-2xl shadow-2xl border border-white/5 grayscale hover:grayscale-0 transition-all duration-1000 ease-out cursor-zoom-in relative z-0" 
                  />
                ) : (
                  <div className="flex flex-col items-center gap-6 text-on-surface-variant opacity-20">
                    <span className="material-symbols-outlined text-[80px]">file_open</span>
                    <p className="text-body-md font-bold uppercase tracking-widest">No Document Attached</p>
                  </div>
                )}
             </div>
          </motion.section>

          {/* Action Bar */}
          <textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={3}
            placeholder="Rejection reason, shown to the worker if rejected"
            className="w-full rounded-2xl border border-surface-container-highest bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface outline-none focus:border-secondary"
          />
          <div className="flex flex-col sm:flex-row gap-4">
             <button 
                onClick={onApprove}
                disabled={worker.is_verified}
                className="flex-1 h-16 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:scale-100 disabled:grayscale shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
             >
                <span className="material-symbols-outlined">verified</span>
                {worker.is_verified ? 'Access Granted' : 'Authorize Asset'}
             </button>

             <button 
                onClick={() => onReject(rejectReason)}
                className="px-10 h-16 bg-surface-container-high border border-surface-container-highest text-secondary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-surface-container-highest active:scale-[0.98] transition-all flex items-center justify-center gap-3"
             >
                <span className="material-symbols-outlined">block</span>
                Reject
             </button>
          </div>
        </main>
      </div>
    </div>
  );
}
