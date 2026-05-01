"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  contract: any;
  userId: string;
}

export default function ContractDetails({ contract, userId }: Props) {
  const { t } = useLanguage();
  
  const isClient = userId === contract.client_id;
  const isWorker = userId === contract.worker_id;

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStepStatus = () => {
    if (contract.job_status === "pending" && !contract.signed_at) return 1;
    if (contract.signed_at && contract.job_status === "active") return 2;
    if (contract.job_status === "completed") return 3;
    return 1;
  };

  const currentStep = getStepStatus();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={isClient ? "/client/contracts" : "/worker/contracts"} className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-white hover:bg-zinc-800 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-white tracking-tight">{t("contracts.digital_contract")}</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {contract.id.slice(0, 8).toUpperCase()} · {formatDate(contract.created_at)}
            </p>
          </div>
        </div>
        <button className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-zinc-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* ── Profiles ── */}
      <div className="space-y-4">
        {/* Worker Profile */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-4 flex items-center gap-5">
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${contract.worker_verified ? 'border-green-400' : 'border-white/5'} shadow-[0_0_15px_rgba(74,222,128,0.2)]`}>
              {contract.worker_avatar ? (
                <img src={contract.worker_avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xl font-black text-zinc-600">
                  {contract.worker_name?.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">Worker: {contract.worker_name}</span>
              {contract.worker_verified && (
                <span className="bg-green-400/10 text-green-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-green-400/20">
                  Fayda Verified
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-zinc-500 tracking-tight">Phone Number: {contract.worker_phone || "Not provided"}</p>
          </div>
        </div>

        {/* Client Profile */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-4 flex items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/5">
              {contract.client_avatar ? (
                <img src={contract.client_avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xl font-black text-zinc-600">
                  {contract.client_name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-lg flex items-center justify-center shadow-lg border-2 border-zinc-900">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">Client: {contract.client_name}</span>
              <span className="bg-green-400/10 text-green-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-green-400/20">
                Verified Account
              </span>
            </div>
            <p className="text-[10px] font-medium text-zinc-500 tracking-tight">Phone Number: {contract.client_phone || "Not provided"}</p>
          </div>
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="bg-zinc-900 border border-white/5 rounded-[2rem] p-6">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-800" />
          <div className="absolute top-5 left-0 h-0.5 bg-green-400 transition-all duration-1000" style={{ width: `${(currentStep - 1) * 50}%` }} />

          {[
            { id: 1, label: "Set Scope", icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" },
            { id: 2, label: "Define Terms", icon: "M12 20h9" },
            { id: 3, label: "Draft Ready", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14" },
          ].map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${
                  isCompleted || isActive ? 'bg-green-400 border-green-400 text-black shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                }`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={step.icon} />
                    {step.id === 3 && <polyline points="22 4 12 14.01 9 11.01" />}
                    {step.id === 1 && <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />}
                    {step.id === 2 && <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />}
                  </svg>
                  {isActive && step.id === 1 && (
                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-zinc-900 rounded-full flex items-center justify-center text-[8px] font-black text-white">!</div>
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive || isCompleted ? 'text-white' : 'text-zinc-600'}`}>
                  Step {step.id}: {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Details Sections ── */}
      <div className="space-y-2">
        {[
          { icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z", label: "Service Category", value: contract.job_title },
          { icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", label: "Detailed Description", value: contract.job_description || "No description provided", isDetailed: true },
          { icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", label: "Location", value: "Dire Dawa, Ethiopia" },
          { icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", label: "Total Price (ETB)", value: `${contract.budget} ETB` },
          { icon: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18", label: "Proposed Dates", value: `${formatDate(contract.created_at)} - ${formatDate(contract.signed_at || new Date(new Date(contract.created_at).getTime() + 86400000 * 3))}` },
          { icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-2.06 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946 2.06 3.42 3.42 0 0 1 3.139 3.139 3.42 3.42 0 0 0 2.06 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-2.06 1.946 3.42 3.42 0 0 1-3.139 3.139 3.42 3.42 0 0 0-1.946 2.06 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-2.06 3.42 3.42 0 0 1-3.139-3.139 3.42 3.42 0 0 0-2.06-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 2.06-1.946 3.42 3.42 0 0 1 3.139-3.139z", label: "Additional Clauses", value: contract.terms || "Reference standard DireSkill terms and conditions." },
        ].map((item, i) => (
          <div key={i} className="group bg-zinc-900/60 border border-white/5 hover:border-white/10 rounded-[1.75rem] p-4 flex items-center gap-4 transition-all">
            <div className="w-12 h-12 bg-zinc-800 border border-white/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-400/10 group-hover:border-green-400/20 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 group-hover:text-green-400 transition-colors">
                <path d={item.icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">{item.label}</p>
              {item.isDetailed ? (
                 <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-3 mt-1">
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">{item.value}</p>
                 </div>
              ) : (
                <p className="text-sm text-white font-bold truncate">{item.value}</p>
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800 group-hover:text-zinc-600 transition-colors">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ))}
      </div>

      {/* ── Footer Button ── */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none z-50">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          {contract.signed_at ? (
             <button className="w-full h-16 bg-green-400 hover:bg-green-300 text-black rounded-[1.5rem] flex items-center justify-between px-8 transition-all active:scale-[0.98] shadow-[0_10px_40px_rgba(74,222,128,0.2)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest">Download PDF</span>
                </div>
                <div className="italic font-serif text-lg opacity-80 select-none">Digital Signature</div>
             </button>
          ) : (
            <button className="w-full h-16 bg-green-400 hover:bg-green-300 text-black rounded-[1.5rem] flex items-center justify-between px-8 transition-all active:scale-[0.98] shadow-[0_10px_40px_rgba(74,222,128,0.2)]">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                   </svg>
                 </div>
                 <span className="font-black text-sm uppercase tracking-widest">{t("contracts.proceed_to_signing")}</span>
               </div>
               <div className="italic font-serif text-lg opacity-80 select-none">Digital Signature</div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
