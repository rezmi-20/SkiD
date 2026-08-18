import { sql } from "@/lib/db";
import { maskFinLast4 } from "@/lib/fin-protection";
import { evaluateClientApprovedConsistency } from "@/lib/client-verification-consistency";

export const CLIENT_PIN_VERIFICATION_MESSAGE =
  "Fayda identity verification is required before setting up your contract PIN.";

export const CLIENT_CONTRACT_VERIFICATION_MESSAGE =
  "Fayda identity verification is required before accessing contracts.";

export const CLIENT_VERIFICATION_STATES = [
  "not_started",
  "pending",
  "approved",
  "rejected",
  "suspended",
  "revoked",
] as const;

export const MAX_CLIENT_ID_DOCUMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_CLIENT_ID_DOCUMENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);

export function getClientVerificationHref(returnTo?: string | null, reason = CLIENT_CONTRACT_VERIFICATION_MESSAGE) {
  const params = new URLSearchParams({ verify: "1", reason });
  if (returnTo) params.set("returnTo", returnTo);
  return `/client/profile/settings?${params.toString()}`;
}

export function toClientDisplayStatus(status?: string | null, isVerified?: boolean | null) {
  if (status === "incomplete" || !status) return isVerified ? "approved" : "not_started";
  return status;
}

export function resolveClientConsistentVerification(input: {
  status?: string | null;
  isVerified?: boolean | null;
  finLast4?: string | null;
  documentRef?: string | null;
  verifiedAt?: string | Date | null;
  reviewerId?: string | null;
  hasApprovedHistory?: boolean | null;
}) {
  const rawStatus = toClientDisplayStatus(input.status, input.isVerified);
  const consistency = evaluateClientApprovedConsistency({
    status: rawStatus,
    finLast4: input.finLast4,
    documentRef: input.documentRef,
    verifiedAt: input.verifiedAt,
    reviewerId: input.reviewerId,
    hasApprovedHistory: input.hasApprovedHistory,
  });
  const invalidApproved = rawStatus === "approved" && !consistency.isValidApproved;
  return {
    status: invalidApproved ? "not_started" : rawStatus,
    isVerified: Boolean(input.isVerified) && rawStatus === "approved" && !invalidApproved,
    invalidApproved,
    missing: consistency.missing,
  };
}

export function validateClientIdentityDocument(value: unknown) {
  if (typeof value !== "string") {
    return { ok: false as const, error: "Fayda document is required." };
  }

  const match = value.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!match) {
    return { ok: false as const, error: "Fayda document must be an uploaded image or PDF." };
  }

  const mimeType = match[1].toLowerCase();
  if (!ALLOWED_CLIENT_ID_DOCUMENT_TYPES.has(mimeType)) {
    return { ok: false as const, error: "Unsupported Fayda document type." };
  }

  const base64 = match[2].replace(/\s/g, "");
  const bytes = Buffer.byteLength(base64, "base64");
  if (bytes <= 0 || bytes > MAX_CLIENT_ID_DOCUMENT_BYTES) {
    return { ok: false as const, error: "Fayda document must be 5 MB or smaller." };
  }

  return { ok: true as const, mimeType, bytes };
}

export function decodeClientIdentityDocument(value: unknown) {
  const validation = validateClientIdentityDocument(value);
  if (!validation.ok) return validation;

  const [, mimeType, base64] = String(value).match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\r\n]+)$/) || [];
  return {
    ok: true as const,
    mimeType: mimeType.toLowerCase(),
    bytes: Buffer.from(base64.replace(/\s/g, ""), "base64"),
  };
}

export async function getClientIdentityColumns() {
  const rows = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'client_profiles'
  `;
  return new Set(rows.map((row: any) => row.column_name as string));
}

export async function getClientIdentityStatus(userId: string) {
  const columns = await getClientIdentityColumns();
  const selected = [
    `cp."user_id"`,
    `cp."is_verified"`,
    ...(columns.has("verification_status") ? [`cp."verification_status"`] : [`NULL AS "verification_status"`]),
    ...(columns.has("verification_reason") ? [`cp."verification_reason"`] : [`NULL AS "verification_reason"`]),
    ...(columns.has("fin_last4") ? [`cp."fin_last4"`] : [`NULL AS "fin_last4"`]),
    ...(columns.has("verified_at") ? [`cp."verified_at"`] : [`NULL AS "verified_at"`]),
    ...(columns.has("fayda_doc_url") ? [`cp."fayda_doc_url"`] : [`NULL AS "fayda_doc_url"`]),
    ...(columns.has("fayda_doc_url")
      ? [`CASE
          WHEN cp.fayda_doc_url IS NOT NULL
           AND length(cp.fayda_doc_url) > 0
          THEN true
          ELSE false
        END AS "has_document"`]
      : [`false AS "has_document"`]),
    `va.decided_by AS "reviewer_id"`,
    `EXISTS (
      SELECT 1
      FROM verification_events ve
      WHERE ve.account_user_id = cp.user_id
        AND ve.account_type = 'client'
        AND ve.new_status = 'approved'
    ) AS "has_approved_history"`,
  ];
  const rows = await sql.query(
    `SELECT ${selected.join(", ")}
     FROM client_profiles cp
     LEFT JOIN verification_attempts va
       ON va.account_user_id = cp.user_id
       AND va.account_type = 'client'
       AND va.is_current = true
     WHERE cp.user_id = $1
     LIMIT 1`,
    [userId],
  );
  const profile = rows[0];
  const consistent = resolveClientConsistentVerification({
    status: profile?.verification_status,
    isVerified: profile?.is_verified,
    finLast4: profile?.fin_last4,
    documentRef: profile?.fayda_doc_url,
    verifiedAt: profile?.verified_at,
    reviewerId: profile?.reviewer_id,
    hasApprovedHistory: profile?.has_approved_history,
  });

  return {
    exists: Boolean(profile),
    isVerified: consistent.isVerified,
    status: profile ? consistent.status : "not_started",
    hasFin: Boolean(profile?.fin_last4),
    maskedFin: maskFinLast4(profile?.fin_last4),
    hasDocument: Boolean(profile?.has_document),
    reason: profile?.verification_reason || null,
    invalidApproved: consistent.invalidApproved,
    invalidApprovedReasons: consistent.missing,
  };
}
