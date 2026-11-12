"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertCircle,
  Clock,
  Loader2,
  Fingerprint,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { toggleWorkerVerification } from "@/lib/actions/admin";

export interface WorkerQueueItem {
  user_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  skills?: string[] | string | null;
  has_document?: boolean;
  avatar_url?: string | null;
  fin_last4?: string | null;
  verification_status?: string | null;
  is_verified?: boolean;
  is_suspended?: boolean;
  created_at?: string;
}

interface WorkerReviewDrawerProps {
  worker: WorkerQueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  canReview?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
  onStatusChanged?: (userId: string, approved: boolean) => void;
}

export function WorkerReviewDrawer({
  worker,
  isOpen,
  onClose,
  canReview = true,
  canApprove = true,
  canReject = true,
  onStatusChanged,
}: WorkerReviewDrawerProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !worker) return null;

  const skillsList = Array.isArray(worker.skills)
    ? worker.skills
    : typeof worker.skills === "string"
    ? worker.skills.split(",").map((s) => s.trim())
    : [];

  const handleDecision = (approve: boolean) => {
    setErrorMsg(null);
    if (!approve && !rejectReason.trim() && showRejectInput) {
      setErrorMsg("Please provide a rejection reason for the artisan.");
      return;
    }

    startTransition(async () => {
      const reason = approve ? undefined : rejectReason.trim() || "Fayda ID document verification incomplete";
      const res = await toggleWorkerVerification(worker.user_id, approve, reason);

      if (res.success) {
        onStatusChanged?.(worker.user_id, approve);
        onClose();
        setShowRejectInput(false);
        setRejectReason("");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Action failed. Please try again.");
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop spanning 100vw/100vh */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Sheet */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col text-foreground animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-border bg-secondary/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0 overflow-hidden border border-border">
                {worker.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={worker.avatar_url}
                    alt={worker.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  worker.full_name?.charAt(0) || "W"
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-foreground truncate">
                  {worker.full_name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Artisan Identity & Fayda Review
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Verification Status Pill */}
            <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Verification Status
                </span>
                <span className="text-xs font-semibold text-warning flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  {worker.verification_status === "approved" ? "Approved" : "Pending Review"}
                </span>
              </div>
              <Link
                href={`/admin/verify/${worker.user_id}`}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <span>Split-View Studio</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Contact Details */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Contact & Communication
              </h4>
              <div className="space-y-2 text-xs p-3 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center gap-2.5 text-foreground">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="font-mono">{worker.phone ? `+251 ${worker.phone}` : "No phone registered"}</span>
                </div>
                {worker.email && (
                  <div className="flex items-center gap-2.5 text-foreground">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{worker.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fayda National ID (FIN) Evidence */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                National Identification (Fayda)
              </h4>
              <div className="p-3.5 rounded-xl bg-secondary/50 border border-border space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Fayda FIN Last 4:</span>
                  </span>
                  <span className="font-mono font-semibold text-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                    {worker.fin_last4 ? `•••• •••• ${worker.fin_last4}` : "Not Entered"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Evidence Document:</span>
                  </span>
                  <span className={`font-semibold ${worker.has_document ? "text-success" : "text-warning"}`}>
                    {worker.has_document ? "Uploaded (Verified Hash)" : "Missing Document"}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills & Specialties */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Trade Specializations
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.length > 0 ? (
                  skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-foreground border border-border"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No trade skills listed</span>
                )}
              </div>
            </div>

            {/* Rejection Form Input */}
            {showRejectInput && (
              <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2 animate-in fade-in duration-150">
                <label className="text-xs font-semibold text-destructive block">
                  Specify Reason for Denial / Re-upload Request:
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Fayda National ID photo is blurry, please re-upload clear front side."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg bg-secondary border border-destructive/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-destructive"
                />
              </div>
            )}
          </div>

          {/* Sticky Action Footer */}
          <div className="p-4 border-t border-border bg-secondary/30 flex-col gap-2">
            {canReview && (
              <div className="flex items-center gap-2 w-full">
                {!showRejectInput ? (
                  <>
                    {canReject && (
                      <button
                        type="button"
                        onClick={() => setShowRejectInput(true)}
                        disabled={isPending}
                        className="flex-1 py-2 px-3 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-medium transition"
                      >
                        Reject / Request
                      </button>
                    )}
                    {canApprove && (
                      <button
                        type="button"
                        onClick={() => handleDecision(true)}
                        disabled={isPending}
                        className="flex-1 py-2 px-3 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Approve Artisan</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(false)}
                      disabled={isPending}
                      className="flex-1 py-2 px-3 rounded-lg border border-border text-muted-foreground text-xs font-medium hover:bg-secondary transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(false)}
                      disabled={isPending}
                      className="flex-1 py-2 px-3 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Confirm Rejection</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
