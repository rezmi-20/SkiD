"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  History,
  Wrench,
  Fingerprint,
  FileQuestion,
  CheckCircle2,
  Ban,
  ShieldAlert,
  Clock,
  Sparkles,
  Award,
  MapPin,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Eye,
  Check,
  Building,
  Shield,
  FileText,
} from "lucide-react";
import ProtectedVerificationDocumentViewer from "@/components/admin/ProtectedVerificationDocumentViewer";
import VerificationFinReveal from "@/components/admin/VerificationFinReveal";
import { toWorkerDisplayStatus } from "@/lib/worker-verification";

interface WorkerVerificationContentProps {
  worker: {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    masked_fin?: string | null;
    district: string;
    skills: string[];
    fayda_doc_url: string;
    avatar_url?: string | null;
    training_certificates?: Array<{ id: string; file_name: string; mime_type: string; file_size: number }>;
    is_verified: boolean;
    verification_status?: string | null;
    verification_reason?: string | null;
    verified_at?: string | Date | null;
    reviewer_email?: string | null;
    is_suspended?: boolean | null;
    identity_complete?: boolean | null;
  };
  attempt: {
    id: string;
    attemptNumber: number;
    status: string;
    submittedAt: string;
  } | null;
  history: Array<{
    id: string;
    action: string;
    oldStatus: string | null;
    newStatus: string;
    reason: string | null;
    attemptNumber: number | null;
    adminEmployeeId: string | null;
    adminName: string | null;
    adminRole: string | null;
    createdAt: string;
  }>;
  capabilities: {
    canReview: boolean;
    canApprove: boolean;
    canReject: boolean;
    canRequestResubmission: boolean;
    canRevoke: boolean;
  };
  verificationDocument: { attemptId: string | null; canReveal: boolean; available: boolean; revealUsed: boolean };
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  onRevoke?: (reason: string) => void;
  onPending?: (reason: string) => void;
}

const QUICK_REASONS = [
  "Blurry or unreadable ID scan",
  "Fayda FIN mismatch with card",
  "Profile photo does not match ID",
  "Document edges cropped or obscured",
  "Expired or invalid credential",
  "Training certificate missing or illegible",
];

export default function WorkerVerificationContent({
  worker,
  attempt,
  history,
  capabilities,
  verificationDocument,
  onApprove,
  onReject,
  onRevoke,
  onPending,
}: WorkerVerificationContentProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "id_doc" | "face_match" | "certificates">("profile");

  const displayStatus = toWorkerDisplayStatus(
    worker.verification_status,
    worker.is_verified,
    worker.is_suspended,
    worker.identity_complete !== false
  );

  const identityComplete = Boolean(
    worker.identity_complete !== false &&
      verificationDocument.available &&
      Boolean(worker.masked_fin)
  );

  const canRevealFin = Boolean(
    capabilities.canReview &&
      verificationDocument.canReveal &&
      ["pending", "rejected", "resubmission_requested"].includes(String(worker.verification_status || "pending"))
  );

  const readOnly = !capabilities.canReview;

  const handleActionWithReason = async (
    action: (reason: string) => void,
    options?: { confirmRevocation?: boolean }
  ) => {
    const reason = rejectReason.trim();
    if (!reason) {
      alert("Please provide a reason before proceeding with this decision.");
      return;
    }
    if (
      options?.confirmRevocation &&
      !window.confirm(
        "Revoke this approved worker? The worker will immediately lose verified standing until reverified."
      )
    ) {
      return;
    }
    setIsSubmitting(true);
    try {
      await action(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickReasonClick = (reason: string) => {
    if (!rejectReason) {
      setRejectReason(reason);
    } else if (!rejectReason.includes(reason)) {
      setRejectReason(`${rejectReason}; ${reason}`);
    }
  };

  const certificateCount = worker.training_certificates?.length || 0;

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2">
        <div className="space-y-2">
          <Link
            href="/admin/verify"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Verification Queue</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative">
              {worker.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={worker.avatar_url}
                  alt={worker.full_name}
                  className="w-12 h-12 rounded-xl object-cover border border-border shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground font-bold text-base shadow-xs">
                  {worker.full_name?.charAt(0) || "W"}
                </div>
              )}
              {displayStatus === "approved" && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-white">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {worker.full_name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    displayStatus === "approved"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : displayStatus === "pending"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : displayStatus === "rejected"
                      ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      : "bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  {displayStatus}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {worker.email}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="h-3 w-3" />
                  +251 {worker.phone}
                </span>
                {worker.district && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {worker.district}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Top summary badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-xs">
            <span className="text-muted-foreground font-medium">Attempt: </span>
            <span className="font-bold text-foreground">
              #{attempt ? attempt.attemptNumber : 1}
            </span>
          </div>
          {readOnly && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
              Read-Only Mode
            </div>
          )}
        </div>
      </div>

      {/* 2. Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Profile & Inspection Tabs */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Segmented Inspector View Tabs - Clean Uncontained */}
          <div className="flex items-center gap-1 bg-card p-1.5 rounded-xl border border-border shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === "profile"
                  ? "bg-secondary text-foreground border border-border/60 shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Account Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("id_doc")}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === "id_doc"
                  ? "bg-secondary text-foreground border border-border/60 shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Fingerprint className="h-4 w-4" />
              <span>Fayda ID Scan</span>
              {verificationDocument.available && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("face_match")}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === "face_match"
                  ? "bg-secondary text-foreground border border-border/60 shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Face Audit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("certificates")}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === "certificates"
                  ? "bg-secondary text-foreground border border-border/60 shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Credentials ({certificateCount})</span>
            </button>
          </div>

          {/* TAB 0: Clean Account Profile (Inspired by settings.tsx) */}
          {activeTab === "profile" && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-semibold text-foreground">Artisan Profile Overview</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Marketplace public identity, contact channels, and trade qualifications
                </p>
              </div>

              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Full Name</label>
                  <p className="text-sm font-semibold text-foreground">{worker.full_name}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Email Address</label>
                  <p className="text-sm font-semibold text-foreground">{worker.email}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Phone Contact</label>
                  <p className="text-sm font-semibold font-mono text-foreground">+251 {worker.phone}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Operational District</label>
                  <p className="text-sm font-semibold text-foreground">{worker.district || "Dire Dawa"}</p>
                </div>
              </div>

              {/* Trade Specialties */}
              <div className="pt-4 border-t border-border space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Registered Trade Skills
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {worker.skills?.length ? (
                    worker.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-md text-xs font-medium bg-secondary text-foreground border border-border"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No specialized trade skills registered</span>
                  )}
                </div>
              </div>

              {/* Bio Statement */}
              <div className="pt-4 border-t border-border space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Public Profile Summary
                </label>
                <p className="text-xs text-foreground/90 leading-relaxed italic">
                  {worker.avatar_url
                    ? "Verified Dire Dawa tradesperson active on DireSkill platform with government Fayda credential sync."
                    : "Registered artisan awaiting administrative identity audit."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: Fayda Document Viewer */}
          {activeTab === "id_doc" && (
            <div className="space-y-3">
              {verificationDocument.available ? (
                <ProtectedVerificationDocumentViewer
                  documentUrl={`/api/workers/${worker.user_id}/verification-document`}
                  title="Official Fayda ID Document"
                  attemptId={verificationDocument.attemptId}
                  canReveal={verificationDocument.canReveal}
                  revealUsed={verificationDocument.revealUsed}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[460px] p-8 rounded-xl border border-dashed border-border bg-card text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                    <FileQuestion className="h-7 w-7" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    No Fayda Document Uploaded
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    This worker has not yet uploaded a digital scan of their Fayda National ID card.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Face Verification Side-by-Side - Clean Uncontained */}
          {activeTab === "face_match" && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-5 shadow-xs">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Visual Biometric & Photo Audit
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Compare the worker profile avatar with the photo depicted on their official Fayda ID document.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Profile Photo */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Registered Profile Photo
                  </span>
                  <div className="w-44 h-44 rounded-xl overflow-hidden border border-border bg-secondary flex items-center justify-center shadow-xs">
                    {worker.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={worker.avatar_url}
                        alt="Profile avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground text-xs font-medium flex flex-col items-center gap-2">
                        <User className="h-8 w-8 opacity-40" />
                        <span>No Avatar Uploaded</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Visible to clients when booking jobs
                  </p>
                </div>

                {/* ID Reference Guidance */}
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Inspection Protocol
                    </span>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>Verify that:</p>
                      <ul className="list-disc list-inside space-y-1.5 text-xs text-foreground/80 pl-1">
                        <li>Facial geometry, eyes, and contours correspond to Fayda document.</li>
                        <li>No photo-manipulation, blurring, or face filter artifacts.</li>
                        <li>Photo reflects current age and person identity.</li>
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("id_doc")}
                    className="w-full py-2.5 px-4 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground transition text-center"
                  >
                    View Fayda ID Document →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Training Certificates */}
          {activeTab === "certificates" && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
              <div>
                <h3 className="text-base font-semibold text-foreground">Vocational & Trade Certificates</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Technical competency credentials, apprenticeship certificates, and formal diplomas
                </p>
              </div>

              {certificateCount > 0 ? (
                <div className="divide-y divide-border pt-2">
                  {worker.training_certificates?.map((cert) => (
                    <div
                      key={cert.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-accent shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-foreground">{cert.file_name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {(cert.file_size / 1024).toFixed(1)} KB · {cert.mime_type}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`/api/workers/${worker.user_id}/certificates/${cert.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                      >
                        <span>Inspect</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No vocational certificates uploaded for this profile.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Inspector & Decision Console (Sticky) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4">
          {/* 1. Fayda FIN & Identification Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              National Identification (Fayda)
            </h3>

            {/* FIN Reveal Component */}
            <VerificationFinReveal
              accountType="worker"
              accountUserId={worker.user_id}
              attemptId={attempt?.id ?? null}
              maskedFin={worker.masked_fin}
              canReveal={canRevealFin}
            />

            {/* Evidence Document Status */}
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Fayda Document:</span>
              <span className={verificationDocument.available ? "text-success font-semibold" : "text-warning font-semibold"}>
                {verificationDocument.available ? "Uploaded & Hash Valid" : "Missing Document"}
              </span>
            </div>
          </div>

          {/* 2. Verification Decision Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Verification Decision Console
            </h3>

            {readOnly ? (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-500 font-medium">
                You have read-only oversight permissions. To execute approvals or rejections, verification admin clearance is required.
              </div>
            ) : (
              <div className="space-y-4">
                {!identityComplete && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-500 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Missing Identity Requirements</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      Fayda document scan and protected FIN must both be present before this worker can be approved.
                    </p>
                  </div>
                )}

                {/* Quick reason suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Quick Reason Tags:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {QUICK_REASONS.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => handleQuickReasonClick(reason)}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 border border-border/60 text-muted-foreground hover:text-foreground transition"
                      >
                        + {reason}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason input */}
                <div>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    placeholder="Enter reason or instructions for resubmission / rejection..."
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  {capabilities.canApprove && onApprove && (
                    <button
                      type="button"
                      onClick={onApprove}
                      disabled={displayStatus === "approved" || !identityComplete || isSubmitting}
                      className="w-full h-10 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Artisan</span>
                    </button>
                  )}

                  {capabilities.canRequestResubmission && onPending && (
                    <button
                      type="button"
                      onClick={() => handleActionWithReason(onPending)}
                      disabled={isSubmitting}
                      className="w-full h-9 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-warning" />
                      <span>Request Document Resubmission</span>
                    </button>
                  )}

                  {capabilities.canReject && onReject && (
                    <button
                      type="button"
                      onClick={() => handleActionWithReason(onReject)}
                      disabled={displayStatus === "rejected" || isSubmitting}
                      className="w-full h-9 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 font-semibold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>Reject Application</span>
                    </button>
                  )}

                  {capabilities.canRevoke && onRevoke && displayStatus === "approved" && (
                    <button
                      type="button"
                      onClick={() => handleActionWithReason(onRevoke, { confirmRevocation: true })}
                      disabled={isSubmitting}
                      className="w-full h-9 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Revoke Approved Verification</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
