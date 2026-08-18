import { sql } from "@/lib/db";

export type ClientApprovedConsistency = {
  isValidApproved: boolean;
  missing: string[];
};

export function evaluateClientApprovedConsistency(input: {
  status: string;
  finLast4?: string | null;
  documentRef?: string | null;
  verifiedAt?: string | Date | null;
  reviewerId?: string | null;
  hasApprovedHistory?: boolean | null;
}): ClientApprovedConsistency {
  if (input.status !== "approved") return { isValidApproved: false, missing: [] };
  const missing: string[] = [];
  if (!input.finLast4) missing.push("protected FIN metadata");
  if (!input.documentRef) missing.push("Fayda document");
  if (!input.verifiedAt) missing.push("decision timestamp");
  if (!input.reviewerId) missing.push("reviewer");
  if (!input.hasApprovedHistory) missing.push("approval history");
  return { isValidApproved: missing.length === 0, missing };
}

export async function getInvalidApprovedClientVerifications() {
  return sql`
    SELECT
      u.id AS user_id,
      u.email,
      cp.full_name,
      cp.fin_last4,
      cp.fayda_doc_url,
      cp.verified_at,
      va.decided_by,
      EXISTS (
        SELECT 1
        FROM verification_events ve
        WHERE ve.account_user_id = u.id
          AND ve.account_type = 'client'
          AND ve.new_status = 'approved'
      ) AS has_approved_history
    FROM users u
    JOIN client_profiles cp ON cp.user_id = u.id
    LEFT JOIN verification_attempts va
      ON va.account_user_id = u.id
      AND va.account_type = 'client'
      AND va.is_current = true
    WHERE u.role = 'client'
      AND (
        cp.verification_status = 'approved'
        OR cp.is_verified = true
      )
      AND (
        cp.fin_last4 IS NULL
        OR cp.fayda_doc_url IS NULL
        OR length(cp.fayda_doc_url) = 0
        OR cp.verified_at IS NULL
        OR va.decided_by IS NULL
        OR NOT EXISTS (
          SELECT 1
          FROM verification_events ve
          WHERE ve.account_user_id = u.id
            AND ve.account_type = 'client'
            AND ve.new_status = 'approved'
        )
      )
    ORDER BY cp.verified_at DESC NULLS LAST, u.created_at DESC
  `;
}
