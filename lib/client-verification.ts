import { sql } from "@/lib/db";
import { maskFinLast4 } from "@/lib/fin-protection";

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
    "user_id",
    "is_verified",
    ...(columns.has("verification_status") ? ["verification_status"] : []),
    ...(columns.has("verification_reason") ? ["verification_reason"] : []),
    ...(columns.has("fin_last4") ? ["fin_last4"] : []),
    ...(columns.has("fayda_doc_url") ? ["fayda_doc_url"] : []),
  ];
  const rows = await sql.query(
    `SELECT ${selected.map((column) => `"${column}"`).join(", ")} FROM client_profiles WHERE user_id = $1 LIMIT 1`,
    [userId],
  );
  const profile = rows[0];

  return {
    exists: Boolean(profile),
    isVerified: Boolean(profile?.is_verified),
    status: toClientDisplayStatus(profile?.verification_status, profile?.is_verified),
    hasFin: Boolean(profile?.fin_last4),
    maskedFin: maskFinLast4(profile?.fin_last4),
    hasDocument: Boolean(profile?.fayda_doc_url),
    reason: profile?.verification_reason || null,
  };
}

