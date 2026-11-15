"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import VerificationResubmitForm from "@/components/worker/VerificationResubmitForm";
import { getProfileData } from "@/lib/actions/profile";
import { useLanguage } from "@/context/LanguageContext";
import { handleAppSignOut } from "@/lib/auth/sign-out-client";
import {
  RiShieldCheckFill,
  RiTimeLine,
  RiAlertLine,
  RiFingerprintLine,
  RiIdCardLine,
  RiCheckDoubleLine,
  RiLogoutBoxRLine,
  RiInformationLine,
  RiFolderShield2Line,
} from "@remixicon/react";
import { cx } from "@/utils/cx";

/* ── draw-svg Skill: Ethiopian Fayda Biometric Identity Seal ──────────────── */
function FaydaBiometricSeal({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <rect width="36" height="36" rx="12" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M18 7C12.48 7 8 11.48 8 17C8 22.52 12.48 27 18 27C23.52 27 28 22.52 28 17C28 11.48 23.52 7 18 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18 11C14.69 11 12 13.69 12 17C12 20.31 14.69 23 18 23C21.31 23 24 20.31 24 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M18 15C16.9 15 16 15.9 16 17C16 18.1 16.9 19 18 19"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M18 27V30M13 29L11 31M23 29L25 31" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function PendingVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "1" || searchParams.get("preview") === "1";
  const { t } = useLanguage();

  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(!isDemo);
  const [simulatedStatus, setSimulatedStatus] = useState<string>("pending");

  useEffect(() => {
    if (isDemo) {
      setWorker({
        id: "demo-worker",
        email: "worker.demo@direskill.com",
        full_name: "Tadesse Hailu",
        verification_status: "pending",
        has_fayda_doc: true,
        verification_reason: "Fayda National ID verification in progress with automated OCR check.",
      });
      setLoading(false);
      return;
    }

    getProfileData()
      .then((data) => {
        if (!data || data.role !== "worker") {
          router.push("/login");
        } else if (
          !data.is_suspended &&
          data.verification_status === "approved" &&
          data.is_verified &&
          data.identity_complete !== false
        ) {
          // If approved and not in explicit preview, load dashboard
          router.push("/worker/dashboard");
        } else {
          setWorker(data);
          setSimulatedStatus(data.is_suspended ? "suspended" : data.verification_status || "pending");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load worker profile:", err);
        router.push("/login");
      });
  }, [router, isDemo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-full flex items-center justify-center text-text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-caption-1-semibold text-text-secondary animate-pulse">
            Verifying Fayda credentials...
          </p>
        </div>
      </div>
    );
  }

  const accountState = isDemo ? simulatedStatus : worker?.is_suspended ? "suspended" : String(worker?.verification_status || "pending");
  const isRejected = accountState === "rejected";
  const isSuspended = accountState === "suspended";
  const isRevoked = accountState === "revoked";
  const isIncomplete = accountState === "incomplete";
  const isApproved = accountState === "approved";
  const canReverify = isRejected || isRevoked || isIncomplete;
  const isPending = !canReverify && !isSuspended && !isApproved;

  return (
    <AppShell role="worker" userEmail={worker?.email}>
      <div className="mx-auto max-w-2xl space-y-6 pb-20 pt-4 px-2">
        {/* ── stageshow Skill: Verification State Switcher Bar ── */}
        <div className="rounded-3xl border border-accent-500/30 bg-accent-500/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-accent-500 animate-ping" />
              <span className="text-caption-1-semibold font-bold uppercase tracking-wider text-accent-700 dark:text-accent-300">
                stageshow Verification Inspector
              </span>
            </div>
            <span className="text-caption-2 text-text-tertiary">
              Toggle account states without DB locks
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "pending", label: "Pending Audit" },
              { id: "rejected", label: "Resubmit Doc" },
              { id: "suspended", label: "Suspended" },
              { id: "approved", label: "Approved (Active)" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSimulatedStatus(st.id)}
                className={cx(
                  "rounded-2xl border px-3 py-2 text-caption-1-semibold font-bold transition text-center",
                  accountState === st.id
                    ? "border-accent-500 bg-background-primary-default text-text-primary shadow-2xs"
                    : "border-border-button-default bg-background-secondary-default text-text-tertiary hover:text-text-primary"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Verification Card ── */}
        <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-7 sm:p-9 shadow-xs space-y-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div
              className={cx(
                "size-18 rounded-3xl border flex items-center justify-center shadow-xs transition-colors",
                isApproved
                  ? "border-accent-500/30 bg-accent-500/10 text-accent-600"
                  : isRejected || isSuspended || isRevoked
                  ? "border-chart-5/30 bg-chart-5/10 text-chart-5"
                  : "border-chart-4/30 bg-chart-4/10 text-chart-4"
              )}
            >
              {isApproved ? (
                <RiCheckDoubleLine className="size-9" />
              ) : isRejected || isSuspended || isRevoked ? (
                <RiAlertLine className="size-9" />
              ) : (
                <RiTimeLine className="size-9 animate-pulse" />
              )}
            </div>

            <div className="space-y-1.5 max-w-md">
              <h1 className="text-title-1-medium text-text-primary tracking-tight">
                {isApproved
                  ? "Identity Verified & Active"
                  : isSuspended
                  ? "Account Under Compliance Review"
                  : isRejected
                  ? "Document Resubmission Required"
                  : "Fayda Verification In Progress"}
              </h1>

              <p className="text-body-medium text-text-secondary leading-relaxed">
                {isApproved
                  ? `Welcome aboard ${worker?.full_name || "Professional"}! Your Ethiopian Fayda biometric identity and trade certification are certified on DireSkill.`
                  : isSuspended
                  ? "Your trade profile is temporarily paused pending dispute investigation."
                  : isRejected
                  ? "The uploaded National ID document was blurry or unreadable. Please capture a clear photo of your ID card."
                  : `Greetings ${worker?.full_name || "Professional"}. Your Ethiopian Fayda National ID and trade credentials are currently undergoing secure cryptographic verification.`}
              </p>
            </div>
          </div>

          {/* Verification Reason / Flag */}
          {(isRejected || isSuspended) && (
            <div className="rounded-2xl border border-chart-5/30 bg-chart-5/10 p-4 text-start space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-chart-5">
                Audit Feedback
              </p>
              <p className="text-caption-1-semibold text-text-primary">
                {worker?.verification_reason ||
                  "Document image resolution below 300 DPI or Fayda barcode unreadable."}
              </p>
            </div>
          )}

          {/* Credentials Breakdown Table */}
          <div className="rounded-2xl border border-border-button-default bg-background-secondary-default p-4 space-y-3 text-caption-1-semibold">
            <div className="flex justify-between items-center">
              <span className="text-text-tertiary uppercase tracking-wider text-[10px] font-bold">
                Platform Role
              </span>
              <span className="text-text-primary font-bold">Certified Trade Professional</span>
            </div>

            <div className="flex justify-between items-center border-t border-separator-border pt-2.5">
              <span className="text-text-tertiary uppercase tracking-wider text-[10px] font-bold">
                Fayda Biometric Document
              </span>
              <span
                className={cx(
                  "font-bold",
                  worker?.has_fayda_doc ? "text-accent-600" : "text-chart-5"
                )}
              >
                {worker?.has_fayda_doc ? "Uploaded & Cryptographically Hashed" : "Missing / Unverified"}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-separator-border pt-2.5">
              <span className="text-text-tertiary uppercase tracking-wider text-[10px] font-bold">
                Audit Status
              </span>
              <span
                className={cx(
                  "uppercase tracking-wider font-bold",
                  isApproved
                    ? "text-accent-600"
                    : isRejected || isSuspended
                    ? "text-chart-5"
                    : "text-chart-4"
                )}
              >
                {accountState.replaceAll("_", " ")}
              </span>
            </div>
          </div>

          {/* Form when resubmission is needed */}
          {canReverify && (
            <div className="pt-2 text-start">
              <VerificationResubmitForm mode={isIncomplete ? "complete" : isRevoked ? "reverify" : "resubmit"} />
            </div>
          )}

          {isApproved && (
            <div className="pt-2">
              <Link
                href="/worker/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-600 py-4 text-caption-1-semibold font-bold uppercase tracking-wider text-white hover:bg-accent-700 transition"
              >
                <span>Enter Worker Dashboard</span>
                <RiCheckDoubleLine className="size-4" />
              </Link>
            </div>
          )}

          {/* Sign Out Button */}
          <div className="pt-2 border-t border-separator-border">
            <Link
              href="/api/auth/sign-out"
              onClick={(e) => {
                e.preventDefault();
                handleAppSignOut();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border-button-default bg-background-secondary-default py-3.5 text-caption-1-semibold font-bold text-text-secondary hover:text-text-primary hover:bg-background-tertiary-default transition"
            >
              <RiLogoutBoxRLine className="size-4" />
              <span>Sign Out of Account</span>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
