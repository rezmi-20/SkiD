import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const seed = readFileSync(resolve(root, "scripts/seed-test-admins.mjs"), "utf8");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

let failed = false;
function check(label, ok) {
  if (ok) {
    console.log(`PASS ${label}`);
  } else {
    console.log(`MISSING ${label}`);
    failed = true;
  }
}

check("production execution is rejected", seed.includes('NODE_ENV === "production"'));
check("explicit allow flag is required", seed.includes("ALLOW_DEV_ADMIN_SEED") && seed.includes('!== "true"'));
check("three configured email env vars are used", [
  "TEST_CONTENT_VERIFICATION_ADMIN_EMAIL",
  "TEST_DISPUTE_PAYMENT_ADMIN_EMAIL",
  "TEST_USER_SUPPORT_ADMIN_EMAIL",
].every((name) => seed.includes(name)));
check("configured owner super admin is protected", seed.includes("OWNER_SUPER_ADMIN_EMAIL") && seed.includes("must not be the configured owner"));
check("emails are normalized and duplicate-protected", seed.includes("normalizeEmail") && seed.includes("new Set") && seed.includes("must be unique after normalization"));
check("existing test employee accounts are updated safely", seed.includes("UPDATE admin_employees") && seed.includes("WHERE id = ${existing.id}"));
check("new accounts use admin employee password hash", seed.includes("hashPassword") && seed.includes("password_hash"));
check("admin credential uses project scrypt format", seed.includes("scryptSync") && seed.includes("N: 16384") && !seed.includes("neon_auth.account"));
check("plaintext password is not inserted", !seed.includes("${password},") && !seed.includes("${password})"));
check("password hashes are not logged", !/console\.(log|warn|error)\([^)]*(passwordHash|password_hash)/.test(seed));
check("temporary passwords are printed only for credential creation or reset", seed.includes("TEMPORARY_PASSWORD") && seed.includes("const shouldRotate = !existing || resetMode"));
check("new accounts default activation required", seed.includes("activation_required") && seed.includes("ALLOW_DEV_ADMIN_SEED_ACTIVE"));
check("public email verification is not used", !seed.includes("emailVerified") && !seed.includes("neon_auth.verification"));
check("inactive seeded admins remain activation-blocked", seed.includes("admin_activation_required = ${!activeMode}") && seed.includes("const status = activeMode ?"));
check("active mode marks employee account active", seed.includes("activation_completed_at") && seed.includes("COALESCE(activation_completed_at, NOW())"));
check("only configured seed emails are processed", seed.includes("normalizedTargets") && seed.includes("WHERE id = ${existing.id}"));
check("active mode warning is explicit", seed.includes("bypasses first-login activation"));
check("reset mode rotates temporary credential", seed.includes("ALLOW_DEV_ADMIN_SEED_RESET") && seed.includes("resetMode"));
check("public users are not inserted or modified", !seed.includes("INSERT INTO users") && !seed.includes("UPDATE users"));
check("owner employee account is protected", seed.includes("ownerEmail") && seed.includes("configured owner super-admin account"));
check("seeded accounts are audit-distinguished", seed.includes("development_test_admin_seed"));
check("seed npm script is wired", packageJson.scripts?.["seed:test-admins"] === "node scripts/seed-test-admins.mjs");
check("check npm script is wired", packageJson.scripts?.["check:test-admin-seed"] === "node scripts/check-test-admin-seed.mjs");

process.exit(failed ? 1 : 0);
