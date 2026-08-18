"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import VerificationResubmitForm from "@/components/worker/VerificationResubmitForm";
import { getProfileData } from "@/lib/actions/profile";
import { useLanguage } from "@/context/LanguageContext";

export default function PendingVerificationPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfileData()
      .then((data) => {
        if (!data || data.role !== "worker") {
          router.push("/login");
        } else if (!data.is_suspended && data.verification_status === "approved" && data.is_verified) {
          router.push("/worker/dashboard");
        } else {
          setWorker(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load worker profile:", err);
        router.push("/login");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm font-semibold tracking-wide animate-pulse">{t("verification.loadingProfile")}</p>
        </div>
      </div>
    );
  }

  const accountState = worker?.is_suspended ? "suspended" : String(worker?.verification_status || "pending");
  const isRejected = accountState === "rejected";
  const isSuspended = accountState === "suspended";
  const isRevoked = accountState === "revoked";
  const canReverify = isRejected || isRevoked;
  const isPending = !canReverify && !isSuspended;
  const title = isSuspended
    ? t("verification.suspended.title")
    : isRevoked
    ? t("verification.revoked.title")
    : isRejected
    ? t("verification.rejected.title")
    : t("verification.pending.title");
  const desc = isSuspended
    ? t("verification.suspended.desc")
    : isRevoked
    ? t("verification.revoked.desc")
    : isRejected
    ? t("verification.rejected.desc")
    : t("verification.pending.desc");
  const parts = desc.includes("{name}") ? desc.split("{name}") : [desc];

  return (
    <AppShell role="worker" userEmail={worker?.email}>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-white font-inter">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-48 h-48 ${isRejected || isSuspended || isRevoked ? "bg-red-500/10" : "bg-green-500/10"} blur-[80px] pointer-events-none`} />
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-16 h-16 ${(isRejected || isSuspended || isRevoked) ? "bg-red-400/10 border-red-400/20" : "bg-green-400/10 border-green-400/20"} border flex items-center justify-center rounded-3xl mb-2`}>
              <span className={`material-symbols-outlined text-[36px] ${(isRejected || isSuspended || isRevoked) ? "text-red-400" : "text-green-400 animate-pulse"}`}>
                {(isRejected || isSuspended || isRevoked) ? "gpp_bad" : "pending_actions"}
              </span>
            </div>
            
            <h1 className="text-2xl font-black tracking-tight text-white">
              {title}
            </h1>
            
            <p className="text-sm text-zinc-400 leading-relaxed">
              {parts[1] ? (
                <>
                  {parts[0]}
                  <span className={`font-bold ${(isRejected || isSuspended || isRevoked) ? "text-red-400" : "text-green-400"}`}>
                    {worker?.full_name || "Professional"}
                  </span>
                  {parts[1]}
                </>
              ) : (
                desc
              )}
            </p>
          </div>

          {worker?.verification_reason && canReverify && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-300">{t("verification.reason")}</p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-200">{worker.verification_reason}</p>
            </div>
          )}

          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-zinc-500 uppercase tracking-wider">{t("verification.role")}</span>
              <span className="text-white bg-zinc-800 px-2 py-0.5 rounded-md">{t("common.role.worker")}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-zinc-500 uppercase tracking-wider">{t("verification.fayda_upload")}</span>
              <span className={worker?.has_fayda_doc ? "text-green-400" : "text-red-400"}>
                {worker?.has_fayda_doc ? t("verification.fayda_received") : t("verification.fayda_missing")}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-zinc-500 uppercase tracking-wider">{t("verification.status")}</span>
              <span className={`font-bold uppercase tracking-wide ${
                isRejected || isSuspended || isRevoked ? "text-red-400" : "text-yellow-400"
              }`}>
                {accountState === "rejected"
                  ? t("verification.status.rejected")
                  : accountState === "suspended"
                  ? t("verification.status.suspended")
                  : accountState === "revoked"
                  ? t("verification.status.revoked")
                  : worker?.verification_status === "approved"
                  ? t("verification.status.approved")
                  : t("verification.status.pending")}
              </span>
            </div>
          </div>

          {/* Reverification form for rejected or revoked workers */}
          {canReverify && (
            <VerificationResubmitForm mode={isRevoked ? "reverify" : "resubmit"} />
          )}

          {isPending && (
            <div className="text-xs text-zinc-500 text-center leading-relaxed">
              {t("verification.timeline_desc")}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link 
              href="/api/auth/sign-out" 
              className="w-full h-12 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-full font-bold text-xs flex items-center justify-center transition-all active:scale-[0.98]"
            >
              {t("common.signout")}
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
