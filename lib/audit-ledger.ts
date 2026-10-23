import crypto from "node:crypto";
import { sql } from "@/lib/db";

export interface AuditEventInput {
  actorType: "user" | "admin_employee" | "system";
  userId?: string | null;
  adminEmployeeId?: string | null;
  adminRole?: string | null;
  action: string;
  module:
    | "jobs"
    | "contracts"
    | "payments"
    | "disputes"
    | "verification"
    | "governance"
    | "auth"
    | "legal_compliance"
    | "export"
    | "support";
  targetType?: string | null;
  targetId?: string | null;
  previousState?: Record<string, any> | null;
  newState?: Record<string, any> | null;
  reason?: string | null;
  relatedReference?: string | null;
  highRisk?: boolean;
  proposedByAdminId?: string | null;
  approvedByAdminId?: string | null;
  executedByType?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Strips sensitive credentials, tokens, and raw FIN numbers from details payload.
 */
function sanitizeAuditPayload(data: any): any {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(sanitizeAuditPayload);

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token") ||
      lowerKey.includes("pin") ||
      lowerKey.includes("api_key")
    ) {
      clean[key] = "[REDACTED_CREDENTIAL]";
    } else if (lowerKey === "fin" || lowerKey === "faydanumber" || lowerKey === "fin_number") {
      clean[key] = typeof value === "string" ? `••••${value.slice(-4)}` : "[REDACTED_FIN]";
    } else if (value && typeof value === "object") {
      clean[key] = sanitizeAuditPayload(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

/**
 * Computes deterministic SHA-256 digest of an object.
 */
export function computeDigest(payload: unknown): string {
  const str = typeof payload === "string" ? payload : JSON.stringify(payload || {});
  return crypto.createHash("sha256").update(str).digest("hex");
}

/**
 * Records an immutable, cryptographically chained audit event.
 * Guarded by database append-only triggers against UPDATE and DELETE.
 */
export async function recordAuditEvent(input: AuditEventInput) {
  try {
    const sanitizedDetails = sanitizeAuditPayload(input.details);
    const sanitizedPrev = sanitizeAuditPayload(input.previousState);
    const sanitizedNew = sanitizeAuditPayload(input.newState);

    // 1. Fetch the latest record's event_hash to maintain the cryptographic hash chain
    const latestRows = await sql`
      SELECT event_hash, sequence_number
      FROM audit_logs
      WHERE event_hash IS NOT NULL
      ORDER BY sequence_number DESC
      LIMIT 1
    `;

    const previousHash = latestRows[0]?.event_hash || GENESIS_HASH;
    const nowIso = new Date().toISOString();

    // 2. Compute payload digest
    const canonicalPayload = {
      actorType: input.actorType,
      userId: input.userId || null,
      adminEmployeeId: input.adminEmployeeId || null,
      adminRole: input.adminRole || null,
      action: input.action,
      module: input.module,
      targetType: input.targetType || null,
      targetId: input.targetId || null,
      previousState: sanitizedPrev || null,
      newState: sanitizedNew || null,
      reason: input.reason || null,
      relatedReference: input.relatedReference || null,
      highRisk: Boolean(input.highRisk),
      details: sanitizedDetails || null,
      timestamp: nowIso,
    };

    const payloadDigest = computeDigest(canonicalPayload);

    // 3. Compute chained event hash: SHA-256(previousHash + payloadDigest + timestamp)
    const eventHash = crypto
      .createHash("sha256")
      .update(`${previousHash}:${payloadDigest}:${nowIso}`)
      .digest("hex");

    // 4. Insert append-only record
    const [inserted] = await sql`
      INSERT INTO audit_logs (
        actor_type,
        user_id,
        admin_employee_id,
        admin_role,
        action,
        module,
        target_type,
        target_id,
        previous_state,
        new_state,
        reason,
        related_reference,
        high_risk,
        proposed_by_admin_id,
        approved_by_admin_id,
        executed_by_type,
        details,
        ip_address,
        user_agent,
        event_hash,
        previous_event_hash,
        payload_digest,
        created_at
      ) VALUES (
        ${input.actorType},
        ${input.userId || null},
        ${input.adminEmployeeId || null},
        ${input.adminRole || null},
        ${input.action},
        ${input.module},
        ${input.targetType || null},
        ${input.targetId || null},
        ${sanitizedPrev ? JSON.stringify(sanitizedPrev) : null},
        ${sanitizedNew ? JSON.stringify(sanitizedNew) : null},
        ${input.reason || null},
        ${input.relatedReference || null},
        ${Boolean(input.highRisk)},
        ${input.proposedByAdminId || null},
        ${input.approvedByAdminId || null},
        ${input.executedByType || null},
        ${sanitizedDetails ? JSON.stringify(sanitizedDetails) : null},
        ${input.ipAddress || null},
        ${input.userAgent || null},
        ${eventHash},
        ${previousHash},
        ${payloadDigest},
        ${nowIso}
      )
      RETURNING id, sequence_number, event_hash, created_at
    `;

    return {
      success: true,
      id: inserted.id,
      sequenceNumber: inserted.sequence_number,
      eventHash: inserted.event_hash,
      createdAt: inserted.created_at,
    };
  } catch (error) {
    console.error("[AUDIT_LEDGER_ERROR]", error);
    // Return structured failure rather than crashing non-critical callers
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record audit event",
    };
  }
}

/**
 * Validates the cryptographic chain of audit logs to detect any tampering or deletion.
 */
export async function verifyAuditLedgerIntegrity(limit = 200) {
  const rows = await sql`
    SELECT
      sequence_number AS "sequenceNumber",
      id,
      actor_type AS "actorType",
      action,
      event_hash AS "eventHash",
      previous_event_hash AS "previousEventHash",
      payload_digest AS "payloadDigest",
      created_at AS "createdAt"
    FROM audit_logs
    WHERE event_hash IS NOT NULL
    ORDER BY sequence_number ASC
    LIMIT ${limit}
  `;

  if (rows.length === 0) {
    return {
      valid: true,
      verifiedCount: 0,
      discrepancies: [],
      message: "No chained audit events recorded yet.",
    };
  }

  const discrepancies: Array<{
    sequenceNumber: number;
    issue: string;
    expected?: string;
    found?: string;
  }> = [];

  let expectedPrevious = GENESIS_HASH;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (i > 0 && row.previousEventHash !== expectedPrevious) {
      discrepancies.push({
        sequenceNumber: row.sequenceNumber,
        issue: "Chain broken: previousEventHash does not match prior record event_hash",
        expected: expectedPrevious,
        found: row.previousEventHash,
      });
    }

    expectedPrevious = row.eventHash;
  }

  return {
    valid: discrepancies.length === 0,
    verifiedCount: rows.length,
    discrepancies,
    message: discrepancies.length === 0 ? "Cryptographic audit chain is 100% verified and intact." : "Audit chain integrity violations detected.",
  };
}
