"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import PinVerificationModal from "./ui/PinVerificationModal";
import { signContract } from "@/lib/actions/contracts";
import { useRouter } from "next/navigation";

interface Props {
  contract: any;
  userId: string;
}

export default function ContractDetails({ contract, userId }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  
  const isClient = userId === contract.client_id;
  const hasClientSigned = !!contract.client_signed_at;
  const hasWorkerSigned = !!contract.worker_signed_at;
  const isFullySigned = hasClientSigned && hasWorkerSigned;
  const userHasSigned = isClient ? hasClientSigned : hasWorkerSigned;

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Pending";
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusUI = () => {
    if (contract.job_status === "completed") return { label: "Completed", color: "bg-blue-400/10 text-blue-400 border-blue-400/20", icon: "done_all" };
    if (isFullySigned) return { label: "Fully Signed", color: "bg-primary-accent/10 text-primary-accent border-primary-accent/20", icon: "verified" };
    if (hasClientSigned || hasWorkerSigned) return { label: "Partially Signed", color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20", icon: "pending" };
    return { label: "Awaiting Signatures", color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20", icon: "schedule" };
  };

  const status = getStatusUI();

  const handleSign = async (pin: string) => {
    if (pin !== "1234") {
      alert("Invalid PIN. Use 1234 for testing.");
      return;
    }

    setIsSigning(true);
    setIsPinModalOpen(false);
    
    try {
      const result = await signContract(contract.id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("An error occurred during signing.");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-40">
      
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href={isClient ? "/client/contracts" : "/worker/contracts"} className="w-12 h-12 bg-surface border border-border rounded-full flex items-center justify-center text-text-high hover:bg-surface-container transition-all shadow-sm">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-text-high tracking-tight">Contract Overview</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-med">
              REF: {contract.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-full ${status.color} border flex items-center gap-2 font-black text-[9px] uppercase tracking-wider shadow-sm`}>
          <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
          {status.label}
        </div>
      </div>

      {/* ── Progress Card ── */}
      <div className="mx-4 bg-surface-container/30 border border-border rounded-[2.5rem] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-med">Execution Status</span>
          <span className="text-xs font-black text-primary-accent">{isFullySigned ? "100%" : hasClientSigned || hasWorkerSigned ? "50%" : "0%"}</span>
        </div>
        <div className="h-3 bg-surface border border-border rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: isFullySigned ? "100%" : hasClientSigned || hasWorkerSigned ? "50%" : "0%" }}
            className="h-full bg-primary-accent shadow-[0_0_20px_rgba(var(--primary-accent-rgb),0.3)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
           {[
             { label: "Client Signed", signed: hasClientSigned },
             { label: "Worker Signed", signed: hasWorkerSigned }
           ].map((party, i) => (
             <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${party.signed ? 'bg-primary-accent/5 border-primary-accent/20' : 'bg-surface border-border'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${party.signed ? 'bg-primary-accent text-background' : 'bg-surface-container text-text-med'}`}>
                  <span className="material-symbols-outlined text-[18px] font-bold">{party.signed ? 'check' : 'close'}</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${party.signed ? 'text-text-high' : 'text-text-med'}`}>{party.label}</span>
             </div>
           ))}
        </div>
      </div>

      {/* ── Parties Info ── */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Service Provider", name: contract.worker_name, avatar: contract.worker_avatar, verified: contract.worker_verified, role: "Worker", signedAt: contract.worker_signed_at },
          { label: "Employer", name: contract.client_name, avatar: contract.client_avatar, verified: true, role: "Client", signedAt: contract.client_signed_at }
        ].map((p, i) => (
          <div key={i} className="bg-surface border border-border rounded-[2rem] p-6 space-y-4 shadow-sm hover:border-primary-accent/20 transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-med">{p.label}</p>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${p.verified ? 'border-primary-accent/30' : 'border-border'}`}>
                {p.avatar ? (
                  <img src={p.avatar} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface-container flex items-center justify-center text-xl font-black text-text-med">
                    {p.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-text-high leading-tight">{p.name}</h3>
                <div className="flex gap-1.5">
                  {p.verified && <span className="bg-primary-accent/10 text-primary-accent text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary-accent/10">Verified</span>}
                  <span className="bg-surface-container text-text-med text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">{p.role}</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-border/50">
              <p className="text-[9px] font-black text-text-med uppercase tracking-widest mb-1">Status</p>
              <p className={`text-[10px] font-black uppercase ${p.signedAt ? 'text-primary-accent' : 'text-yellow-400/70'}`}>
                {p.signedAt ? `Signed: ${formatDate(p.signedAt)}` : "Awaiting Signature"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Contract Agreement ── */}
      <div className="mx-4 bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 space-y-10 relative overflow-hidden shadow-sm">
        {isFullySigned && (
           <div className="absolute top-12 right-12 -rotate-12 pointer-events-none opacity-10">
              <div className="border-8 border-primary-accent rounded-3xl px-8 py-4 text-primary-accent text-6xl font-black uppercase tracking-[0.2em]">SIGNED</div>
           </div>
        )}

        <div className="space-y-8">
          <div>
            <h2 className="text-[10px] font-black text-primary-accent uppercase tracking-[0.4em] mb-4">Master Service Agreement</h2>
            <h1 className="text-3xl md:text-5xl font-black text-text-high tracking-tighter leading-[0.9]">{contract.job_title}</h1>
          </div>

          <div className="bg-surface-container/20 rounded-3xl p-6 border border-border/50 italic">
            <p className="text-text-med text-sm leading-relaxed whitespace-pre-wrap font-medium">{contract.job_description || "No specific description provided"}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 py-8 border-y border-border/50">
             <div className="space-y-1">
                <p className="text-[9px] font-black text-text-med uppercase tracking-widest">Agreed Budget</p>
                <p className="text-3xl font-black text-text-high tracking-tight">{contract.budget.toLocaleString()} <span className="text-primary-accent text-lg">ETB</span></p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-text-med uppercase tracking-widest">Performance Region</p>
                <p className="text-xl font-black text-text-high tracking-tight">Dire Dawa, ET</p>
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-[10px] font-black text-text-high uppercase tracking-widest">Governing Terms</h3>
             <p className="text-text-med text-xs leading-relaxed font-medium">This agreement is legally binding once signed by both parties. All payments must be processed through the DireSkill escrow system. Any disputes will be subject to local labor laws and platform arbitration.</p>
          </div>
        </div>
      </div>

      {/* ── Actions Overlay ── */}
      <div className="fixed bottom-24 left-0 right-0 p-6 z-[60] flex justify-center pointer-events-none">
        <div className="w-full max-w-xl flex gap-3 pointer-events-auto">
          {!userHasSigned ? (
            <>
              <button 
                onClick={() => setIsPinModalOpen(true)}
                disabled={isSigning}
                className="flex-[2] h-16 bg-primary-accent text-background rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(var(--primary-accent-rgb),0.3)] transition-all active:scale-95 disabled:opacity-50"
              >
                {isSigning ? "Processing..." : "Electronically Sign"}
                <span className="material-symbols-outlined text-[20px]">draw</span>
              </button>
              <button className="flex-1 h-16 bg-surface border border-border text-red-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-surface-container transition-all active:scale-95 shadow-sm">
                Decline
              </button>
            </>
          ) : isFullySigned ? (
            <button className="flex-1 h-16 bg-text-high text-background rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl">
               <span className="material-symbols-outlined text-[20px]">download</span>
               Download PDF Evidence
            </button>
          ) : (
            <div className="flex-1 h-16 bg-surface-container border border-border text-text-med rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 italic px-6 text-center">
              Awaiting Counter-Signature to Finalize
            </div>
          )}
        </div>
      </div>

      <PinVerificationModal 
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerify={handleSign}
        title="Secure Signature"
        description={`Confirm your agreement to the terms of "${contract.job_title}" by entering your 4-digit PIN.`}
      />
    </div>
  );
}
