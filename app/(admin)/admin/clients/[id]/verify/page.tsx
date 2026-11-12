import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { updateClientVerificationStatus } from "@/lib/actions/admin";
import { setSuspendedStatus } from "@/lib/actions/super-admin";
import { maskFinLast4 } from "@/lib/fin-protection";
import { getClientIdentityColumns, toClientDisplayStatus } from "@/lib/client-verification";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { ensureCurrentVerificationAttempt, getVerificationHistory } from "@/lib/verification-operations";
import { evaluateClientApprovedConsistency } from "@/lib/client-verification-consistency";
import { getClientVerificationReminderSummary, sendClientVerificationReminder } from "@/lib/client-verification-reminders";
import ProtectedVerificationDocumentViewer from "@/components/admin/ProtectedVerificationDocumentViewer";
import VerificationFinReveal from "@/components/admin/VerificationFinReveal";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  History,
  Mail,
  Phone,
  FileQuestion,
  Bell,
  Ban,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientVerificationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdminPermission("verification.read");
  const capabilities = {
    canReview: hasAdminPermission(admin, "verification.review"),
    canApprove: hasAdminPermission(admin, "verification.approve"),
    canReject: hasAdminPermission(admin, "verification.reject"),
    canRequestResubmission: hasAdminPermission(admin, "verification.request_resubmission"),
    canRevoke: hasAdminPermission(admin, "verification.revoke"),
    canSuspendAccount: hasAdminPermission(admin, "admin_accounts.suspend"),
    canReactivateAccount: hasAdminPermission(admin, "admin_accounts.reactivate"),
  };

  const { id } = await params;
  const columns = await getClientIdentityColumns();
  const selected = [
    "u.id AS user_id",
    "COALESCE(cp.full_name, u.email, 'Unknown client') AS full_name",
    "COALESCE(cp.is_verified, false) AS is_verified",
    "cp.user_id AS profile_user_id",
    ...(columns.has("verification_status") ? ["cp.verification_status"] : []),
    ...(columns.has("verification_reason") ? ["cp.verification_reason"] : []),
    ...(columns.has("verified_at") ? ["cp.verified_at"] : []),
    ...(columns.has("fin_last4") ? ["cp.fin_last4"] : []),
    ...(columns.has("fayda_doc_url") ? ["cp.fayda_doc_url"] : []),
    "u.email",
    "u.phone",
    "u.is_suspended",
    "va.decided_by",
    "reviewer.work_email AS reviewer_email",
  ];
  const rows = await sql.query(
    `SELECT ${selected.join(", ")}
     FROM users u
     LEFT JOIN client_profiles cp ON cp.user_id = u.id
     LEFT JOIN verification_attempts va
       ON va.account_user_id = u.id
       AND va.account_type = 'client'
       AND va.is_current = true
     LEFT JOIN admin_employees reviewer ON reviewer.id = va.decided_by
     WHERE u.id = $1
       AND u.role = 'client'
     LIMIT 1`,
    [id],
  );
  const client = rows[0];

  if (!client) notFound();
  const rawDisplayStatus = client.verification_status
    ? toClientDisplayStatus(client.verification_status, client.is_verified)
    : client.is_verified
      ? "approved"
      : client.fin_last4 || client.fayda_doc_url
        ? "pending"
        : "not_started";
  const history = await getVerificationHistory("client", client.user_id);
  const approvedConsistency = evaluateClientApprovedConsistency({
    status: rawDisplayStatus,
    finLast4: client.fin_last4,
    documentRef: client.fayda_doc_url,
    verifiedAt: client.verified_at,
    reviewerId: client.decided_by,
    hasApprovedHistory: (history || []).some((event: any) => event.new_status === "approved"),
  });
  const invalidApproved = rawDisplayStatus === "approved" && !approvedConsistency.isValidApproved;
  const displayStatus = client.is_suspended ? "suspended" : invalidApproved ? "not_started" : rawDisplayStatus;
  const shouldEnsureAttempt = Boolean(
    client.profile_user_id &&
      !invalidApproved &&
      (displayStatus !== "not_started" || client.fin_last4 || client.fayda_doc_url),
  );
  const attempt = shouldEnsureAttempt ? await ensureCurrentVerificationAttempt("client", client.user_id) : null;
  const reminderSummary = await getClientVerificationReminderSummary(client.user_id);
  const reminderCoolingDown = reminderSummary.lastReminderAt
    ? Date.now() - new Date(reminderSummary.lastReminderAt).getTime() < 86_400_000
    : false;
  const profileReviewStatus = String(client.verification_status || displayStatus || "pending");
  const activeReviewStatus = String(attempt?.status || "pending") === "pending" || profileReviewStatus === "pending";
  const canRevealFin = Boolean(
    capabilities.canReview &&
      attempt?.id &&
      activeReviewStatus &&
      ["pending", "rejected", "resubmission_requested"].includes(String(client.verification_status || "pending")),
  );
  const canRevealDocument = Boolean(
    capabilities.canReview &&
      admin.role === "content_verification_admin" &&
      attempt?.id &&
      attempt.status === "pending" &&
      activeReviewStatus &&
      displayStatus === "pending" &&
      !client.is_suspended &&
      !client.is_verified &&
      !(history || []).some((event: any) => event.action === "viewed_document" && event.reason === "one-time Fayda document reveal"),
  );

  async function approveClient() {
    "use server";
    const result = await updateClientVerificationStatus(id, "approved", undefined, attempt?.id ?? null);
    if (!result.success) throw new Error(result.error);
    redirect("/admin/verify");
  }

  async function updateClientStatus(formData: FormData) {
    "use server";
    const status = String(formData.get("status") || "").trim();
    const reason = String(formData.get("reason") || "").trim();
    const confirmedRevocation = formData.get("confirmRevocation") === "on";
    if (status === "revoked" && !confirmedRevocation) {
      throw new Error("Confirm revocation before submitting.");
    }
    const result = await updateClientVerificationStatus(id, status, reason, attempt?.id ?? null);
    if (!result.success) throw new Error(result.error);
    redirect("/admin/verify");
  }

  async function sendReminder() {
    "use server";
    const result = await sendClientVerificationReminder(id);
    if (!result.success) throw new Error(result.error || "Failed to send reminder.");
    redirect(`/admin/clients/${id}/verify`);
  }

  async function setClientSuspension(formData: FormData) {
    "use server";
    const suspended = formData.get("suspended") === "true";
    const result = await setSuspendedStatus(id, suspended);
    if (!result.success) throw new Error(result.error || "Failed to update suspension status.");
    redirect(`/admin/clients/${id}/verify`);
  }

  // State: Not Started
  if (displayStatus === "not_started") {
    return (
      <div className="space-y-6 pb-24">
        {/* Flush Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5">
            <Link
              href={`/admin/clients/${id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Client Profile</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {client.full_name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Not Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {client.email} · +251 {client.phone || "No phone recorded"}
            </p>
          </div>
        </div>

        {/* Informational Surface Card */}
        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-6 space-y-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Verification Not Submitted
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This client has not yet initiated their Fayda National ID verification submission.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Escrow Contract Access</span>
              <p className="font-bold text-rose-600 dark:text-rose-400 mt-1">Blocked until verified</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Last Reminder Sent</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {reminderSummary.lastReminderAt ? new Date(reminderSummary.lastReminderAt).toLocaleDateString() : "Never"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Account Standing</span>
              <p className={`font-semibold mt-1 ${client.is_suspended ? "text-rose-500" : "text-emerald-500"}`}>
                {client.is_suspended ? "Suspended" : "Active"}
              </p>
            </div>
          </div>

          {invalidApproved && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-700 dark:text-amber-300">
              Invalid legacy approval detected: {approvedConsistency.missing.join(", ")}.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
            {capabilities.canReview && (
              <form action={sendReminder}>
                <button
                  type="submit"
                  disabled={reminderCoolingDown}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-40 transition"
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>{reminderCoolingDown ? "Reminder Sent Recently" : "Send Fayda Verification Reminder"}</span>
                </button>
              </form>
            )}

            {capabilities.canSuspendAccount && !client.is_suspended && (
              <form action={setClientSuspension}>
                <input type="hidden" name="suspended" value="true" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Suspend Account</span>
                </button>
              </form>
            )}

            {capabilities.canReactivateAccount && client.is_suspended && (
              <form action={setClientSuspension}>
                <input type="hidden" name="suspended" value="false" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Unsuspend Account</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // State: Reviewable Client Verification (Split-screen Studio)
  return (
    <div className="space-y-6 pb-24">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2">
        <div className="space-y-2">
          <Link
            href={`/admin/clients/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Client Profile</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-base shadow-2xs">
              {client.full_name?.charAt(0) || "C"}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {client.full_name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    displayStatus === "approved"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : displayStatus === "pending"
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {displayStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {client.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  +251 {client.phone || "No phone"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400 font-medium">Attempt: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              #{attempt ? Number(attempt.attempt_number || attempt.attemptNumber || 1) : 1}
            </span>
          </div>
          {!capabilities.canReview && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              Read-Only Mode
            </div>
          )}
        </div>
      </div>

      {/* 2. Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Document Inspection Studio */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {client.fayda_doc_url ? (
            <ProtectedVerificationDocumentViewer
              documentUrl={`/api/clients/${client.user_id}/verification-document`}
              title="Client Fayda ID Document"
              attemptId={attempt?.id ? String(attempt.id) : null}
              canReveal={canRevealDocument}
              revealUsed={Boolean(
                (history || []).some(
                  (event: any) =>
                    event.action === "viewed_document" && event.reason === "one-time Fayda document reveal",
                ),
              )}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[460px] p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#141E30] text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <FileQuestion className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Fayda Document Uploaded
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                This client has not uploaded a digital scan of their Fayda ID.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Decision & Credentials Console (Sticky) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4">
          {/* Fayda FIN Card */}
          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-4 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Identity Verification
            </h3>

            <VerificationFinReveal
              accountType="client"
              accountUserId={client.user_id}
              attemptId={attempt?.id ? String(attempt.id) : null}
              maskedFin={maskFinLast4(client.fin_last4)}
              canReveal={canRevealFin}
            />

            <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.05] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Reviewer</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {client.reviewer_email || "Unassigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Decision Time</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {client.verified_at ? new Date(client.verified_at).toLocaleDateString() : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Decision Actions Card */}
          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-4 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Decision Controls
            </h3>

            {!capabilities.canReview ? (
              <div className="rounded-lg border border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 font-medium">
                Read-only oversight mode. You can inspect this case but cannot make a verification decision.
              </div>
            ) : displayStatus === "pending" ? (
              <div className="space-y-3">
                {capabilities.canApprove && (
                  <form action={approveClient}>
                    <button
                      type="submit"
                      className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Client</span>
                    </button>
                  </form>
                )}

                <form action={updateClientStatus} className="space-y-2">
                  <textarea
                    name="reason"
                    rows={2}
                    placeholder="Reason required for rejection or resubmission..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {capabilities.canReject && (
                      <button
                        type="submit"
                        name="status"
                        value="rejected"
                        className="h-9 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1 transition"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    {capabilities.canRequestResubmission && (
                      <button
                        type="submit"
                        name="status"
                        value="pending"
                        className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition"
                      >
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>Resubmit</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            ) : displayStatus === "approved" ? (
              <form action={updateClientStatus} className="space-y-3">
                <textarea
                  name="reason"
                  rows={2}
                  placeholder="Reason required for revocation..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                />
                <label className="flex items-start gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-xs text-rose-700 dark:text-rose-300 cursor-pointer">
                  <input type="checkbox" name="confirmRevocation" className="mt-0.5 rounded" />
                  <span>I confirm this approved verification should be revoked.</span>
                </label>
                {capabilities.canRevoke && (
                  <button
                    type="submit"
                    name="status"
                    value="revoked"
                    className="w-full h-9 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Revoke Verification</span>
                  </button>
                )}
              </form>
            ) : (
              <div className="space-y-2">
                <form action={sendReminder}>
                  <button
                    type="submit"
                    disabled={reminderCoolingDown}
                    className="w-full h-9 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    <span>Send Resubmission Reminder</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Audit History Timeline */}
          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <History className="h-3.5 w-3.5 text-blue-500" />
              <span>Audit Timeline ({(history || []).length})</span>
            </div>

            {(history || []).length > 0 ? (
              <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar pt-1">
                {(history || []).map((event: any) => (
                  <div
                    key={event.id}
                    className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                  >
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {String(event.action).replaceAll("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(event.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <span>{event.old_status || "new"} → </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {event.new_status}
                      </span>
                    </div>
                    {event.reason && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded">
                        "{event.reason}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No verification history recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
