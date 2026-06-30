"use client";

import { useState } from "react";
import { resolveDispute } from "@/lib/actions/disputes";

interface Dispute {
  id: string;
  job_id: string;
  client_id: string;
  worker_id: string;
  description: string;
  evidence_urls: string[] | null;
  status: string;
  resolution_notes: string | null;
  created_at: string;
  job_title: string;
  client_name: string;
  worker_name: string;
}

interface AdminDisputesContentProps {
  initialDisputes: Dispute[];
}

export default function AdminDisputesContent({ initialDisputes }: AdminDisputesContentProps) {
  const [disputes, setDisputes] = useState<Dispute[]>(initialDisputes);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResolve = async (status: 'resolved' | 'rejected') => {
    if (!selectedDispute) return;
    setIsSubmitting(true);
    try {
      const res = await resolveDispute(selectedDispute.id, notes, status);
      if (res.success) {
        setDisputes(prev => prev.map(d => 
          d.id === selectedDispute.id 
            ? { ...d, status, resolution_notes: notes } 
            : d
        ));
        setSelectedDispute(null);
        setNotes("");
      } else {
        alert("Failed to resolve dispute");
      }
    } catch (err) {
      console.error(err);
      alert("Error resolving dispute");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-white font-inter">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black tracking-tight">Dispute Resolution</h1>
        <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-full">
          {disputes.length} Disputes Total
        </span>
      </div>

      <div className="grid gap-4">
        {disputes.length === 0 ? (
          <div className="p-8 bg-zinc-950 border border-zinc-850 rounded-[2rem] text-center text-zinc-500">
            No active disputes found in the system.
          </div>
        ) : (
          disputes.map((dispute) => (
            <div key={dispute.id} className="p-6 bg-zinc-950 border border-zinc-850 rounded-[2rem] space-y-4 hover:border-zinc-800 transition-all">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-lg text-white">{dispute.job_title}</h3>
                  <p className="text-xs text-zinc-500">
                    Client: <span className="text-zinc-350">{dispute.client_name}</span> &bull; 
                    Worker: <span className="text-zinc-350">{dispute.worker_name}</span>
                  </p>
                </div>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${
                  dispute.status === "open" 
                    ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" 
                    : dispute.status === "resolved"
                    ? "bg-green-400/10 text-green-400 border-green-400/20"
                    : "bg-red-400/10 text-red-400 border-red-400/20"
                }`}>
                  {dispute.status}
                </span>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                {dispute.description}
              </p>

              {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Evidence Scans</span>
                  <div className="flex gap-2">
                    {dispute.evidence_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 hover:underline">
                        View Image #{i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {dispute.resolution_notes && (
                <div className="p-4 bg-green-950/10 border border-green-950/20 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Resolution Note</span>
                  <p className="text-xs text-zinc-450 leading-relaxed">{dispute.resolution_notes}</p>
                </div>
              )}

              {dispute.status === "open" && !selectedDispute && (
                <button 
                  onClick={() => setSelectedDispute(dispute)}
                  className="px-5 h-10 bg-green-400 hover:bg-green-500 text-black font-bold text-xs rounded-full transition-all active:scale-95"
                >
                  Arbitrate
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {selectedDispute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-white">Resolve Dispute</h3>
            <p className="text-xs text-zinc-500">
              Arbritrating case for: <span className="font-bold text-zinc-350">{selectedDispute.job_title}</span>
            </p>

            <textarea
              required
              rows={4}
              placeholder="Provide arbritration notes, findings, and final platform decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl outline-none focus:border-green-400 text-sm text-white transition-all placeholder:text-zinc-650"
            />

            <div className="flex gap-3">
              <button
                disabled={isSubmitting || !notes}
                onClick={() => handleResolve("resolved")}
                className="flex-1 h-11 bg-green-400 hover:bg-green-500 text-black text-xs font-black uppercase tracking-wider rounded-full disabled:opacity-50 transition-all"
              >
                Resolve Case
              </button>
              <button
                disabled={isSubmitting || !notes}
                onClick={() => handleResolve("rejected")}
                className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-black uppercase tracking-wider border border-zinc-800 rounded-full disabled:opacity-50 transition-all"
              >
                Dismiss
              </button>
            </div>
            
            <button
              onClick={() => { setSelectedDispute(null); setNotes(""); }}
              className="w-full h-11 text-zinc-500 hover:text-zinc-400 text-xs font-bold rounded-full transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
