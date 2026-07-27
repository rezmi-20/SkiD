import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { updateClientVerificationStatus } from "@/lib/actions/admin";
import { maskFinLast4 } from "@/lib/fin-protection";
import { getClientIdentityColumns, toClientDisplayStatus } from "@/lib/client-verification";

export const dynamic = "force-dynamic";

export default async function ClientVerificationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/login");
  }

  const { id } = await params;
  const columns = await getClientIdentityColumns();
  const selected = [
    "cp.user_id",
    "cp.full_name",
    "cp.is_verified",
    ...(columns.has("verification_status") ? ["cp.verification_status"] : []),
    ...(columns.has("verification_reason") ? ["cp.verification_reason"] : []),
    ...(columns.has("fin_last4") ? ["cp.fin_last4"] : []),
    ...(columns.has("fayda_doc_url") ? ["cp.fayda_doc_url"] : []),
    "u.email",
    "u.phone",
  ];
  const rows = await sql.query(
    `SELECT ${selected.join(", ")}
     FROM client_profiles cp
     JOIN users u ON u.id = cp.user_id
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

  async function approveClient() {
    "use server";
    const result = await updateClientVerificationStatus(id, "approved");
    if (!result.success) throw new Error(result.error);
    redirect("/admin/verify");
  }

  async function updateClientStatus(formData: FormData) {
    "use server";
    const status = String(formData.get("status") || "").trim();
    const reason = String(formData.get("reason") || "").trim();
    const result = await updateClientVerificationStatus(id, status, reason);
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
        {client.verification_reason && (
          <div className="rounded-lg border border-error/20 bg-error-container p-3 text-on-error-container">
            {client.verification_reason}
          </div>
        )}
      </section>

      {client.fayda_doc_url ? (
        <a
          href={`/api/clients/${client.user_id}/verification-document`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-black text-on-primary"
        >
          Open Protected Fayda Document
        </a>
      ) : (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-bold text-on-surface">
          No Fayda document is attached.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <form action={approveClient}>
          <button
            type="submit"
            className="h-12 w-full rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary"
          >
            Approve
          </button>
        </form>

        <form action={updateClientStatus} className="space-y-3 md:row-span-2">
          <textarea
            name="reason"
            rows={3}
            placeholder="Reason required for rejection, suspension, or revocation"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm"
          />
          <div className="grid gap-3">
            <button
              type="submit"
              name="status"
              value="rejected"
              className="h-12 w-full rounded-lg bg-error px-4 text-xs font-black uppercase tracking-widest text-on-error"
            >
              Reject
            </button>
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

        <form action={updateClientStatus}>
          <button
            type="submit"
            name="status"
            value="pending"
            className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container px-4 text-xs font-black uppercase tracking-widest text-on-surface"
          >
            Mark Pending
          </button>
        </form>
      </div>
    </div>
  );
}
