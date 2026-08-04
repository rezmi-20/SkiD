import { config } from "dotenv";
import { randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

const OWNER_EMAIL = "remedanseid00@gmail.com";
const OWNER_EMPLOYEE_ID = "OWN-0001";
const TEMP_CREDENTIAL_TTL_MS = 24 * 60 * 60 * 1000;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function generateTemporaryPassword() {
  return `Owner-${randomBytes(12).toString("base64url")}-9!`;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${Buffer.from(key).toString("hex")}`;
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run"),
  };
}

function assertEnvironment() {
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  if (isProduction && process.env.OWNER_EMPLOYEE_CONVERSION_EMERGENCY !== "true") {
    fail("Refusing to convert the owner in production without OWNER_EMPLOYEE_CONVERSION_EMERGENCY=true.");
  }

  if (process.env.ALLOW_OWNER_EMPLOYEE_CONVERSION !== "true") {
    fail("Refusing to run. Set ALLOW_OWNER_EMPLOYEE_CONVERSION=true before converting the owner public identity.");
  }

  if (!process.env.DATABASE_URL) fail("DATABASE_URL is not configured.");
}

function totalRefs(refs) {
  return refs.reduce((sum, row) => sum + Number(row.refs || 0), 0);
}

function formatRefs(refs) {
  if (refs.length === 0) return "none";
  return refs.map((row) => `${row.table_name}.${row.column_name}=${row.refs}`).join(", ");
}

async function getOwnerPublicRefs(sql, ownerUserId) {
  if (!ownerUserId) return [];

  return sql`
    SELECT table_name, column_name, count(*)::int AS refs
    FROM (
      SELECT 'admin_employees' AS table_name, 'legacy_user_id' AS column_name, legacy_user_id AS ref_id FROM admin_employees
      UNION ALL SELECT 'worker_profiles', 'verified_by', verified_by FROM worker_profiles
      UNION ALL SELECT 'client_profiles', 'verified_by', verified_by FROM client_profiles
      UNION ALL SELECT 'jobs', 'client_id', client_id FROM jobs
      UNION ALL SELECT 'jobs', 'worker_id', worker_id FROM jobs
      UNION ALL SELECT 'contracts', 'terms_submitted_by', terms_submitted_by FROM contracts
      UNION ALL SELECT 'contracts', 'terms_accepted_by', terms_accepted_by FROM contracts
      UNION ALL SELECT 'contracts', 'terms_rejected_by', terms_rejected_by FROM contracts
      UNION ALL SELECT 'contracts', 'finalized_by', finalized_by FROM contracts
      UNION ALL SELECT 'ratings', 'rater_id', rater_id FROM ratings
      UNION ALL SELECT 'ratings', 'rated_id', rated_id FROM ratings
      UNION ALL SELECT 'conversations', 'client_id', client_id FROM conversations
      UNION ALL SELECT 'conversations', 'worker_id', worker_id FROM conversations
      UNION ALL SELECT 'messages', 'sender_id', sender_id FROM messages
      UNION ALL SELECT 'community_posts', 'user_id', user_id FROM community_posts
      UNION ALL SELECT 'community_likes', 'user_id', user_id FROM community_likes
      UNION ALL SELECT 'community_flags', 'user_id', user_id FROM community_flags
      UNION ALL SELECT 'community_comments', 'user_id', user_id FROM community_comments
      UNION ALL SELECT 'notifications', 'user_id', user_id FROM notifications
      UNION ALL SELECT 'disputes', 'client_id', client_id FROM disputes
      UNION ALL SELECT 'disputes', 'worker_id', worker_id FROM disputes
      UNION ALL SELECT 'disputes', 'admin_id', admin_id FROM disputes
      UNION ALL SELECT 'saved_workers', 'client_id', client_id FROM saved_workers
      UNION ALL SELECT 'saved_workers', 'worker_id', worker_id FROM saved_workers
      UNION ALL SELECT 'contract_setups', 'user_id', user_id FROM contract_setups
      UNION ALL SELECT 'contract_signatures', 'user_id', user_id FROM contract_signatures
      UNION ALL SELECT 'audit_logs', 'user_id', user_id FROM audit_logs
    ) refs
    WHERE ref_id = ${ownerUserId}
    GROUP BY table_name, column_name
    ORDER BY table_name, column_name
  `;
}

function chooseEmployeeId(ownerEmployee, ownEmployees) {
  if (ownerEmployee?.admin_employee_id) return ownerEmployee.admin_employee_id;

  const occupied = new Set(ownEmployees.map((row) => String(row.admin_employee_id || "").toUpperCase()));
  if (!occupied.has(OWNER_EMPLOYEE_ID)) return OWNER_EMPLOYEE_ID;

  for (let n = 2; n < 10000; n += 1) {
    const candidate = `OWN-${String(n).padStart(4, "0")}`;
    if (!occupied.has(candidate)) return candidate;
  }

  fail("No available OWN-* employee ID was found.");
}

function publicMirrorNeedsRevocation(ownerUser) {
  if (!ownerUser) return false;
  return Boolean(
    ownerUser.role === "admin" ||
      ownerUser.is_suspended !== true ||
      ownerUser.admin_role ||
      ownerUser.admin_status ||
      ownerUser.admin_activation_required ||
      ownerUser.admin_username ||
      ownerUser.admin_temp_credential_expires_at,
  );
}

function authIdentityNeedsRevocation({ authUser, authAccounts, authSessions, authVerifications }) {
  return Boolean(
    authUser &&
      (authUser.banned !== true ||
        authAccounts.length > 0 ||
        authSessions.length > 0 ||
        authVerifications.length > 0),
  );
}

function employeeNeedsNormalization(ownerEmployee) {
  if (!ownerEmployee) return true;
  return Boolean(
    ownerEmployee.admin_status !== "activation_required" ||
      ownerEmployee.admin_activation_required !== true ||
      !ownerEmployee.temp_credential_expires_at,
  );
}

function printSummary({
  dryRun,
  ownerUser,
  ownerEmployee,
  chosenEmployeeId,
  ownerPublicRefs,
  hardDeleteSafe,
  authUser,
  authAccounts,
  authSessions,
  authVerifications,
  conversionNeeded,
}) {
  console.log("Owner employee conversion summary");
  console.log(`Mode: ${dryRun ? "DRY_RUN" : "APPLY"}`);
  console.log(`Owner email: ${OWNER_EMAIL}`);
  console.log(`Owner public user: ${ownerUser ? `found id=${ownerUser.id} role=${ownerUser.role} suspended=${ownerUser.is_suspended}` : "missing"}`);
  console.log(`Owner employee: ${ownerEmployee ? `found id=${ownerEmployee.id} employeeId=${ownerEmployee.admin_employee_id} role=${ownerEmployee.admin_role} status=${ownerEmployee.admin_status}` : "missing"}`);
  console.log(`Chosen Employee ID: ${chosenEmployeeId}`);
  console.log(`Neon Auth user: ${authUser ? `found id=${authUser.id} banned=${authUser.banned}` : "missing"}`);
  console.log(`Neon Auth credential accounts: ${authAccounts.length}`);
  console.log(`Neon Auth sessions: ${authSessions.length}`);
  console.log(`Neon Auth verification tokens: ${authVerifications.length}`);
  console.log(`Public dependencies: ${formatRefs(ownerPublicRefs)}`);
  console.log(`Public user hard deletion safe: ${hardDeleteSafe ? "yes" : "no"}`);
  console.log(`Planned public handling: ${hardDeleteSafe ? "hard delete public mirror row" : "disable public mirror row and preserve references"}`);
  console.log(`Planned credential reset: ${conversionNeeded ? "yes" : "no"}`);
  console.log(`Planned admin session invalidation: ${conversionNeeded ? "yes" : "no"}`);
  console.log(`Planned public session invalidation: ${authSessions.length > 0 ? "yes" : "already clear"}`);
  if (dryRun) console.log("Dry-run only. No actual data changes were made.");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  assertEnvironment();

  const ownerEmail = normalizeEmail(process.env.OWNER_SUPER_ADMIN_EMAIL || OWNER_EMAIL);
  if (ownerEmail !== OWNER_EMAIL) {
    fail(`OWNER_SUPER_ADMIN_EMAIL must be ${OWNER_EMAIL} for this one-owner conversion.`);
  }

  const sql = neon(process.env.DATABASE_URL);

  const [ownerUsers, ownerEmployees, ownEmployees, authUsers] = await Promise.all([
    sql`
      SELECT id, email, password_hash, role, is_suspended, admin_role, admin_status, admin_activation_required,
             admin_username, admin_full_name, admin_temp_credential_expires_at
      FROM users
      WHERE lower(email) = lower(${OWNER_EMAIL})
      ORDER BY created_at ASC
    `,
    sql`
      SELECT id, admin_employee_id, work_email, full_name, phone, department, admin_role, admin_status,
             admin_activation_required, temp_credential_expires_at, session_version, legacy_user_id
      FROM admin_employees
      WHERE lower(work_email) = lower(${OWNER_EMAIL})
      ORDER BY created_at ASC
    `,
    sql`
      SELECT id, admin_employee_id, work_email
      FROM admin_employees
      WHERE admin_employee_id ILIKE 'OWN-%'
      ORDER BY admin_employee_id
    `,
    sql`
      SELECT id, email, name, role, banned, "banReason", "banExpires"
      FROM neon_auth."user"
      WHERE lower(email) = lower(${OWNER_EMAIL})
      ORDER BY "createdAt" ASC
    `,
  ]);

  if (ownerUsers.length > 1) fail("Multiple public owner users found. Refusing to choose one.");
  if (ownerEmployees.length > 1) fail("Multiple owner employee rows found. Refusing to choose one.");
  if (authUsers.length > 1) fail("Multiple Neon Auth owner users found. Refusing to choose one.");

  const ownerUser = ownerUsers[0] ?? null;
  const ownerEmployee = ownerEmployees[0] ?? null;
  const authUser = authUsers[0] ?? null;

  if (!ownerUser && !ownerEmployee) fail("Neither the owner public user nor owner employee exists.");
  if (ownerEmployee && ownerEmployee.admin_role !== "super_admin") {
    fail("Configured owner employee is not super_admin. Refusing to convert.");
  }

  const ownerUserId = ownerUser?.id ?? null;
  const authUserId = authUser?.id ?? null;
  const [ownerPublicRefs, authAccounts, authSessions, authVerifications] = await Promise.all([
    getOwnerPublicRefs(sql, ownerUserId),
    authUserId
      ? sql`
          SELECT id, "accountId", "providerId", "userId"
          FROM neon_auth.account
          WHERE "userId" = ${authUserId}
        `
      : [],
    authUserId
      ? sql`
          SELECT id, "userId", "expiresAt"
          FROM neon_auth.session
          WHERE "userId" = ${authUserId}
        `
      : [],
    sql`
      SELECT id, identifier, "expiresAt"
      FROM neon_auth.verification
      WHERE lower(identifier) = lower(${OWNER_EMAIL})
    `,
  ]);

  const chosenEmployeeId = chooseEmployeeId(ownerEmployee, ownEmployees);
  const hardDeleteSafe = Boolean(ownerUser && totalRefs(ownerPublicRefs) === 0);
  const needsPublicMirrorRevocation = publicMirrorNeedsRevocation(ownerUser);
  const needsAuthRevocation = authIdentityNeedsRevocation({ authUser, authAccounts, authSessions, authVerifications });
  const needsEmployeeNormalization = employeeNeedsNormalization(ownerEmployee);
  const conversionNeeded = needsPublicMirrorRevocation || needsAuthRevocation || needsEmployeeNormalization;

  printSummary({
    dryRun: options.dryRun,
    ownerUser,
    ownerEmployee,
    chosenEmployeeId,
    ownerPublicRefs,
    hardDeleteSafe,
    authUser,
    authAccounts,
    authSessions,
    authVerifications,
    conversionNeeded,
  });

  if (options.dryRun) return;

  if (!conversionNeeded) {
    console.log("Owner conversion already complete. No temporary password generated.");
    return;
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = hashPassword(temporaryPassword);
  const revokedPublicPasswordHash = hashPassword(randomBytes(24).toString("base64url"));
  const expiresAt = new Date(Date.now() + TEMP_CREDENTIAL_TTL_MS);
  const ownerFullName = ownerEmployee?.full_name || authUser?.name || ownerUser?.admin_full_name || "Owner Super Admin";

  const queries = [];

  if (authUserId) {
    queries.push(sql`DELETE FROM neon_auth.session WHERE "userId" = ${authUserId}`);
    queries.push(sql`DELETE FROM neon_auth.account WHERE "userId" = ${authUserId}`);
    queries.push(sql`DELETE FROM neon_auth.verification WHERE lower(identifier) = lower(${OWNER_EMAIL})`);
    if (hardDeleteSafe) {
      queries.push(sql`DELETE FROM neon_auth."user" WHERE id = ${authUserId}`);
    } else {
      queries.push(sql`
        UPDATE neon_auth."user"
        SET banned = true,
            "banReason" = 'Converted to dedicated super-admin employee identity.',
            "banExpires" = NULL,
            role = 'user',
            "updatedAt" = NOW()
        WHERE id = ${authUserId}
      `);
    }
  }

  if (ownerUserId) {
    if (hardDeleteSafe) {
      queries.push(sql`DELETE FROM users WHERE id = ${ownerUserId}`);
    } else {
      queries.push(sql`
        UPDATE users
        SET role = 'client',
            is_suspended = true,
            password_hash = ${revokedPublicPasswordHash},
            admin_role = NULL,
            admin_status = NULL,
            admin_activation_required = false,
            admin_username = NULL,
            admin_full_name = NULL,
            admin_temp_credential_expires_at = NULL,
            admin_activation_completed_at = NULL,
            admin_identity_reference = NULL,
            admin_identity_note = NULL,
            admin_created_by = NULL,
            admin_created_at = NULL,
            admin_updated_at = NULL
        WHERE id = ${ownerUserId}
      `);
    }
  }

  if (ownerEmployee) {
    queries.push(sql`
      UPDATE admin_employees
      SET password_hash = ${passwordHash},
          admin_role = 'super_admin',
          admin_status = 'activation_required',
          admin_activation_required = true,
          temp_credential_expires_at = ${expiresAt.toISOString()},
          activation_completed_at = NULL,
          legacy_user_id = COALESCE(legacy_user_id, ${ownerUserId}),
          session_version = session_version + 1,
          updated_at = NOW()
      WHERE id = ${ownerEmployee.id}
        AND admin_role = 'super_admin'
    `);
  } else {
    queries.push(sql`
      INSERT INTO admin_employees (
        admin_employee_id,
        work_email,
        full_name,
        department,
        admin_role,
        admin_status,
        admin_activation_required,
        password_hash,
        temp_credential_expires_at,
        activation_completed_at,
        identity_reference,
        identity_note,
        session_version,
        legacy_user_id,
        created_at,
        updated_at
      )
      VALUES (
        ${chosenEmployeeId},
        ${OWNER_EMAIL},
        ${ownerFullName},
        'Executive',
        'super_admin',
        'activation_required',
        true,
        ${passwordHash},
        ${expiresAt.toISOString()},
        NULL,
        'owner_employee_conversion',
        'Converted from public owner identity; public login revoked.',
        1,
        ${ownerUserId},
        NOW(),
        NOW()
      )
    `);
  }

  await sql.transaction(queries);

  const finalEmployeeRows = await sql`
    SELECT id, admin_employee_id, admin_role, admin_status
    FROM admin_employees
    WHERE lower(work_email) = lower(${OWNER_EMAIL})
  `;
  if (finalEmployeeRows.length !== 1 || finalEmployeeRows[0].admin_role !== "super_admin") {
    fail("Owner conversion did not leave exactly one super_admin employee row. Credentials were not printed.");
  }

  await sql`
    INSERT INTO audit_logs (admin_employee_id, action, details)
    VALUES (
      ${finalEmployeeRows[0].id},
      'owner_public_identity_converted_to_employee',
      ${JSON.stringify({
        ownerEmail: OWNER_EMAIL,
        employeeId: finalEmployeeRows[0].admin_employee_id,
        publicUserId: ownerUserId,
        publicUserHardDeleted: hardDeleteSafe,
        publicDependencyCount: totalRefs(ownerPublicRefs),
        neonAuthUserId: authUserId,
        credentialReset: true,
        timestamp: new Date().toISOString(),
      })}
    )
  `.catch(() => undefined);

  console.log(`OWNER_EMPLOYEE_ID ${finalEmployeeRows[0].admin_employee_id}`);
  console.log(`OWNER_TEMPORARY_PASSWORD ${temporaryPassword}`);
  console.log(`OWNER_TEMPORARY_PASSWORD_EXPIRES_AT ${expiresAt.toISOString()}`);
  console.log("Temporary password is shown once. Sign in at /admin/login and complete /admin/activate.");
  console.log(hardDeleteSafe ? "Public user mirror was hard-deleted." : "Public user mirror was safely disabled and preserved for historical references.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
