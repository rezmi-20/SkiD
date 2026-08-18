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

  if (displayStatus === "not_started") {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-20">
        <Link href="/admin/clients" className="text-xs font-bold uppercase tracking-widest text-primary">
          Back to client directory
        </Link>

        <header className="space-y-2 border-b border-outline-variant pb-5">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Client Verification Status</p>
          <h1 className="text-3xl font-black text-on-surface">{client.full_name}</h1>
          <p className="text-sm text-on-surface-variant">{client.email}</p>
        </header>

        <section className="space-y-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-sm">
          <div className="flex justify-between gap-4">
            <span className="font-bold text-on-surface-variant">Status</span>
            <span className="font-black uppercase text-on-surface">Not Verified</span>
          </div>
          <p className="font-semibold text-on-surface-variant">
            No verification submission has been made. Contracts remain unavailable until Fayda verification is completed.
          </p>
          <div className="flex justify-between gap-4">
            <span className="font-bold text-on-surface-variant">Contract access</span>
            <span className="font-black text-error">Blocked until verification</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-bold text-on-surface-variant">Last reminder</span>
            <span className="font-bold text-on-surface">
              {reminderSummary.lastReminderAt ? new Date(reminderSummary.lastReminderAt).toLocaleDateString() : "Never"}
            </span>
          </div>
          {invalidApproved && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 font-bold text-on-surface">
              Invalid legacy approval detected: {approvedConsistency.missing.join(", ")}. Use the consistency report before repair.
            </div>
          )}
        </section>

        {(capabilities.canReview || capabilities.canSuspendAccount || capabilities.canReactivateAccount) && (
          <div className="flex flex-wrap gap-3">
            {capabilities.canReview && (
              <form action={sendReminder}>
                <button
                  type="submit"
                  disabled={reminderCoolingDown}
                  className="h-12 rounded-lg bg-primary px-5 text-xs font-black uppercase tracking-widest text-on-primary disabled:opacity-50"
                >
                  {reminderCoolingDown ? "Reminder Sent Recently" : "Send Verification Reminder"}
                </button>
              </form>
            )}
            {capabilities.canSuspendAccount && !client.is_suspended && (
              <form action={setClientSuspension}>
                <input type="hidden" name="suspended" value="true" />
                <button
                  type="submit"
                  className="h-12 rounded-lg border border-error/20 bg-error/10 px-5 text-xs font-black uppercase tracking-widest text-error"
                >
                  Suspend Account
                </button>
              </form>
            )}
            {capabilities.canReactivateAccount && client.is_suspended && (
              <form action={setClientSuspension}>
                <input type="hidden" name="suspended" value="false" />
                <button
                  type="submit"
                  className="h-12 rounded-lg border border-primary/20 bg-primary/10 px-5 text-xs font-black uppercase tracking-widest text-primary"
                >
                  Unsuspend Account
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <Link href="/admin/verify" className="text-xs font-bold uppercase tracking-widest text-primary">
        Back to verification panel
      </Link>

      <header className="space-y-2 border-b border-outline-variant pb-5">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Client Fayda Review</p>
        <h1 className="text-3xl font-black text-on-surface">{client.full_name}</h1>
        <p className="text-sm text-on-surface-variant">{client.email}</p>
      </header>

      <section className="grid gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-sm">
        {!capabilities.canReview && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 font-bold text-on-surface md:col-span-2">
            Read-only oversight mode. You can inspect this case but cannot make a verification decision.
          </div>
        )}
        {client.is_suspended && (
          <div className="rounded-lg border border-error/20 bg-error-container p-3 font-bold text-on-error-container md:col-span-2">
            This client account is suspended.
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span className="font-bold text-on-surface-variant">Status</span>
          <span className="font-black uppercase text-on-surface">{displayStatus}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="font-bold text-on-surface-variant">Masked FIN</span>
          <div className="max-w-sm text-right">
            <VerificationFinReveal
              accountType="client"
              accountUserId={client.user_id}
              attemptId={attempt?.id ? String(attempt.id) : null}
              maskedFin={maskFinLast4(client.fin_last4)}
              canReveal={canRevealFin}
            />
          </div>
        </div>
        <div className="flex justify-between gap-4">
          <span className="font-bold text-on-surface-variant">Phone</span>
          <span className="font-bold text-on-surface">{client.phone || "Not recorded"}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="font-bold text-on-surface-variant">Reviewer</span>
          <span className="font-bold text-on-surface">{client.reviewer_email || "Not recorded"}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="font-bold text-on-surface-variant">Decision Time</span>
          <span className="font-bold text-on-surface">
            {client.verified_at ? new Date(client.verified_at).toLocaleString() : "Not recorded"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="font-bold text-on-surface-variant">Current Attempt</span>
          <span className="font-bold text-on-surface">
            {attempt ? `Attempt ${Number(attempt.attempt_number || attempt.attemptNumber || 1)}` : "Attempt pending"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="font-bold text-on-surface-variant">Submitted</span>
          <span className="font-bold text-on-surface">
            {attempt?.submitted_at || attempt?.submittedAt ? new Date(attempt.submitted_at || attempt.submittedAt).toLocaleString() : "Not recorded"}
          </span>
        </div>
        {client.verification_reason && (
          <div className="rounded-lg border border-error/20 bg-error-container p-3 text-on-error-container">
            {client.verification_reason}
          </div>
        )}
      </section>

      {client.fayda_doc_url ? (
        <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
          <div className="border-b border-outline-variant px-4 py-3 text-xs font-black uppercase tracking-widest text-on-surface-variant">
            Secure identity-document viewer
          </div>
          <ProtectedVerificationDocumentViewer
            documentUrl={`/api/clients/${client.user_id}/verification-document`}
            title="Protected client Fayda document"
            className="bg-black/50 p-4"
          />
        </section>
      ) : (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-bold text-on-surface">
          No Fayda document is attached.
        </div>
      )}

      <section className="space-y-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-on-surface">Timeline and History</h2>
        {(history || []).length === 0 ? (
          <p className="text-sm font-semibold text-on-surface-variant">No verification history recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {(history || []).map((event: any) => (
              <div key={event.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black uppercase tracking-wider text-on-surface">{String(event.action).replaceAll("_", " ")}</p>
                  <p className="text-xs font-bold text-on-surface-variant">{new Date(event.created_at).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-xs font-bold text-on-surface-variant">
                  Attempt {event.attempt_number || "-"} · {event.old_status || "new"} → {event.new_status}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {event.admin_name || event.admin_employee_id || "System"} {event.admin_role ? `· ${event.admin_role.replaceAll("_", " ")}` : ""}
                </p>
                {event.reason && <p className="mt-2 text-sm text-on-surface">{event.reason}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {capabilities.canReview && displayStatus === "pending" && (
        <div className="grid gap-4 md:grid-cols-2">
          {capabilities.canApprove && (
            <form action={approveClient}>
              <button
                type="submit"
                className="h-12 w-full rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary"
              >
                Approve
              </button>
            </form>
          )}

          <form action={updateClientStatus} className="space-y-3 md:row-span-2">
            <textarea
              name="reason"
              rows={3}
              placeholder="Reason required for rejection, suspension, or revocation"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm"
            />
            <div className="grid gap-3">
              {capabilities.canReject && (
                <button
                  type="submit"
                  name="status"
                  value="rejected"
                  className="h-12 w-full rounded-lg bg-error px-4 text-xs font-black uppercase tracking-widest text-on-error"
                >
                  Reject
                </button>
              )}
              <button
                type="submit"
                name="status"
                value="suspended"
                className="h-12 w-full rounded-lg border border-error/20 bg-error/10 px-4 text-xs font-black uppercase tracking-widest text-error"
              >
                Suspend Verification
              </button>
            </div>
          </form>

          {capabilities.canRequestResubmission && (
            <form action={updateClientStatus}>
              <button
                type="submit"
                name="status"
                value="pending"
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container px-4 text-xs font-black uppercase tracking-widest text-on-surface"
              >
                Request Resubmission
              </button>
            </form>
          )}
        </div>
      )}

      {capabilities.canReview && displayStatus === "approved" && (
        <form action={updateClientStatus} className="space-y-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <textarea
            name="reason"
            rows={3}
            placeholder="Reason required for revocation"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm"
          />
          <label className="flex items-start gap-2 rounded-lg border border-error/20 bg-error/5 p-3 text-xs font-bold text-on-surface">
            <input type="checkbox" name="confirmRevocation" className="mt-0.5" />
            I confirm this approved verification should be revoked.
          </label>
          {capabilities.canRevoke && (
            <button
              type="submit"
              name="status"
              value="revoked"
              className="h-12 w-full rounded-lg border border-error/20 bg-error/10 px-4 text-xs font-black uppercase tracking-widest text-error"
            >
              Revoke Verification
            </button>
          )}
        </form>
      )}

      {capabilities.canReview && (displayStatus === "rejected" || displayStatus === "revoked") && (
        <form action={sendReminder}>
          <button
            type="submit"
            disabled={reminderCoolingDown}
            className="h-12 rounded-lg bg-primary px-5 text-xs font-black uppercase tracking-widest text-on-primary disabled:opacity-50"
          >
            {reminderCoolingDown
              ? "Reminder Sent Recently"
              : displayStatus === "revoked"
                ? "Send Reverification Reminder"
                : "Send Resubmission Reminder"}
          </button>
        </form>
      )}

      {(capabilities.canSuspendAccount || capabilities.canReactivateAccount) && (
        <section className="space-y-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-on-surface">Account Controls</h2>
          <div className="flex flex-wrap gap-3">
            {capabilities.canSuspendAccount && !client.is_suspended && (
              <form action={setClientSuspension}>
                <input type="hidden" name="suspended" value="true" />
                <button
                  type="submit"
                  className="h-12 rounded-lg border border-error/20 bg-error/10 px-5 text-xs font-black uppercase tracking-widest text-error"
                >
                  Suspend Account
                </button>
              </form>
            )}
            {capabilities.canReactivateAccount && client.is_suspended && (
              <form action={setClientSuspension}>
                <input type="hidden" name="suspended" value="false" />
                <button
                  type="submit"
                  className="h-12 rounded-lg border border-primary/20 bg-primary/10 px-5 text-xs font-black uppercase tracking-widest text-primary"
                >
                  Unsuspend Account
                </button>
              </form>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
