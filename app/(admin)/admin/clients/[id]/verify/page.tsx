import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { updateClientVerificationStatus } from "@/lib/actions/admin";
import { maskFinLast4 } from "@/lib/fin-protection";
import { getClientIdentityColumns, toClientDisplayStatus } from "@/lib/client-verification";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { ensureCurrentVerificationAttempt, getVerificationHistory } from "@/lib/verification-operations";

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
  };

  const { id } = await params;
  const columns = await getClientIdentityColumns();
  const selected = [
    "cp.user_id",
    "cp.full_name",
    "cp.is_verified",
    ...(columns.has("verification_status") ? ["cp.verification_status"] : []),
    ...(columns.has("verification_reason") ? ["cp.verification_reason"] : []),
    ...(columns.has("verified_at") ? ["cp.verified_at"] : []),
    ...(columns.has("fin_last4") ? ["cp.fin_last4"] : []),
    ...(columns.has("fayda_doc_url") ? ["cp.fayda_doc_url"] : []),
    "u.email",
    "u.phone",
    "reviewer.work_email AS reviewer_email",
  ];
  const rows = await sql.query(
    `SELECT ${selected.join(", ")}
     FROM client_profiles cp
     JOIN users u ON u.id = cp.user_id
     LEFT JOIN verification_attempts va
       ON va.account_user_id = cp.user_id
       AND va.account_type = 'client'
       AND va.is_current = true
     LEFT JOIN admin_employees reviewer ON reviewer.id = va.decided_by
     WHERE cp.user_id = $1
     LIMIT 1`,
    [id],
  );
  const client = rows[0];

  if (!client) notFound();
  const displayStatus = client.verification_status
    ? toClientDisplayStatus(client.verification_status, client.is_verified)
    : client.is_verified
      ? "approved"
      : client.fin_last4 || client.fayda_doc_url
        ? "pending"
      : "not_started";
  const attempt = await ensureCurrentVerificationAttempt("client", client.user_id);
  const history = await getVerificationHistory("client", client.user_id);

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
    const result = await updateClientVerificationStatus(id, status, reason, attempt?.id ?? null);
    if (!result.success) throw new Error(result.error);
    redirect("/admin/verify");
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
        <div className="flex justify-between gap-4">
          <span className="font-bold text-on-surface-variant">Status</span>
          <span className="font-black uppercase text-on-surface">{displayStatus}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="font-bold text-on-surface-variant">Masked FIN</span>
          <span className="font-mono font-bold text-on-surface">{maskFinLast4(client.fin_last4) || "Not recorded"}</span>
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
          <iframe
            src={`/api/clients/${client.user_id}/verification-document`}
            title="Protected client Fayda document"
            className="h-[560px] w-full bg-white"
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

      {capabilities.canReview && (
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
                value="revoked"
                className="h-12 w-full rounded-lg border border-error/20 bg-error/10 px-4 text-xs font-black uppercase tracking-widest text-error"
              >
                Revoke Verification
              </button>
              <button
                type="submit"
                name="status"
                value="suspended"
                className="h-12 w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 text-xs font-black uppercase tracking-widest text-on-surface"
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
    </div>
  );
}
