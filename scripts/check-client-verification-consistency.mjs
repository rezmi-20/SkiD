import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");
dotenv.config({ path: resolve(root, ".env.local") });
dotenv.config();

const clientPage = read("app/(admin)/admin/clients/[id]/verify/page.tsx");
const clientsDirectory = read("components/admin/ClientsManagementClient.tsx");
const reminders = read("lib/client-verification-reminders.ts");
const consistency = read("lib/client-verification-consistency.ts");
const clientLayout = read("app/(client)/layout.tsx");

let failed = false;
function check(label, ok) {
  console.log(`${ok ? "PASS" : "MISSING"} ${label}`);
  if (!ok) failed = true;
}

check("not-started client renders status page, not fake review", clientPage.includes("Client Verification Status") && clientPage.includes("No verification submission has been made"));
check("not-started client has no approval controls", clientPage.includes('displayStatus === "pending"') && clientPage.includes('displayStatus === "approved"'));
check("client directory has Not Verified filter", clientsDirectory.includes('value="not_started"') && clientsDirectory.includes("admin.clients.notVerified"));
check("manual reminders use predefined templates", reminders.includes("reminderTemplate") && !reminders.includes("customBody"));
check("manual reminders require content verification admin", reminders.includes('admin.role !== "content_verification_admin"') && reminders.includes('"verification.review"'));
check("manual reminder cooldown exists", reminders.includes("MANUAL_REMINDER_COOLDOWN_HOURS") && reminders.includes("hasRecentReminder"));
check("manual reminders fail if notification insert fails", reminders.includes("INSERT INTO notifications") && !reminders.includes("createNotification"));
check(
  "reminder templates contain no FIN or document URL",
  !reminders.match(/body:\s*`[^`]*(fin_last4|fayda_doc_url|documentUrl|document URL)[^`]*`/i) &&
    !reminders.match(/body:\s*"[^"]*(fin_last4|fayda_doc_url|documentUrl|document URL)[^"]*"/i),
);
check("reminders link to verification page", reminders.includes('/client/profile/settings?verify=1'));
check("automatic schedule helper is wired from client layout", clientLayout.includes("maybeSendClientVerificationReminder"));
check("invalid approved detector requires document, reviewer, timestamp, and history", consistency.includes("Fayda document") && consistency.includes("reviewer") && consistency.includes("decision timestamp") && consistency.includes("approval history"));
check("reminder eligibility reuses invalid-approved consistency", reminders.includes("evaluateClientApprovedConsistency") && reminders.includes('status = rawStatus === "approved"'));

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
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
    LIMIT 25
  `;

  console.log(`INFO invalid approved client records detected: ${rows.length}`);
  for (const row of rows) {
    const missing = [
      row.fin_last4 ? null : "fin_last4",
      row.fayda_doc_url ? null : "fayda_doc_url",
      row.verified_at ? null : "verified_at",
      row.decided_by ? null : "reviewer",
      row.has_approved_history ? null : "approval_history",
    ].filter(Boolean);
    console.log(`INFO inconsistent client ${row.email || row.user_id}: missing ${missing.join(", ")}`);
  }
  if (rows.length > 0) {
    console.log("INFO safe repair strategy: review listed records, then use an explicit migration to set synthetic invalid approvals to verification_status='not_started', is_verified=false, preserving FIN/document columns and audit history.");
  }
} else {
  console.log("INFO DATABASE_URL not set; skipped live invalid-approved client record scan.");
}

process.exit(failed ? 1 : 0);
