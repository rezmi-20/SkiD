import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const actions = read("lib/actions/admin-account.ts");
const page = read("app/(admin)/admin/profile/page.tsx");
const form = read("components/admin/AdminProfileForm.tsx");
const sidebar = read("components/admin/Sidebar.tsx");
const topbar = read("components/admin/TopBar.tsx");
const usersClient = read("components/admin/SuperAdminUsersClient.tsx");
const seed = read("scripts/seed-test-admins.mjs");
const superAdminActions = read("lib/actions/super-admin.ts");
const schema = read("lib/schema.ts");
const migration = read("drizzle/0017_admin_identity_reference.sql");
const pkg = JSON.parse(read("package.json"));

let failed = false;
function check(label, ok) {
  if (ok) console.log(`PASS ${label}`);
  else {
    console.log(`MISSING ${label}`);
    failed = true;
  }
}

check("admin profile route exists", page.includes("getAdminProfile") && page.includes("AdminProfileForm"));
check("profile requires active admin", actions.includes("export async function getAdminProfile") && actions.includes("requireAdmin()"));
check("username update action removed", !actions.includes("updateAdminUsername") && !form.includes('name="username"'));
check("employee ID is read-only in profile", form.includes("Employee ID") && !form.includes('name="admin_employee_id"'));
check("password change requires current password", actions.includes("updateAdminPassword") && actions.includes("Current password is incorrect"));
check("password change validates strength and confirmation", actions.includes("validateStrongAdminPassword") && actions.includes("Password confirmation does not match"));
check("password change updates admin employee credential", actions.includes("setCredentialPassword") && actions.includes("admin_employees"));
check("password change clears admin session and redirects", actions.includes("clearAdminSession") && form.includes("router.replace"));
check("profile UI has no role/status mutation fields", !form.includes('name="adminRole"') && !form.includes('name="adminStatus"'));
check("admin profile link exists in sidebar", sidebar.includes('href: "/admin/profile"') && sidebar.includes("UserCircle"));
check("admin profile link exists in top bar", topbar.includes('href="/admin/profile"') && topbar.includes("Profile"));
check("secure admin creation uses operational roles only", actions.includes("OPERATIONAL_ADMIN_ROLES") && actions.includes("super_admin"));
check("secure admin creation requires identity confirmation", actions.includes("identityConfirmed") && actions.includes("Offline identity and work-email confirmation is required"));
check("manual identity reference input removed", !usersClient.includes("Masked/reference identifier") && !usersClient.includes("identityReference: \"\"") && !actions.includes("data.identityReference"));
check("admin IVR reference generated server-side", actions.includes("generateAdminIdentityReference") && actions.includes("nextval('admin_identity_reference_seq')") && actions.includes("admin_identity_reference"));
check("admin IVR reference has unique schema support", schema.includes("adminIdentityReference") && migration.includes("admin_identity_reference_seq") && migration.includes("admin_employees_admin_identity_reference_unique_idx"));
check("admin IVR migration script wired", pkg.scripts?.["db:migrate:admin-identity-reference"] === "node scripts/migrate-admin-identity-reference.mjs");
check("admin creation validates required fields", actions.includes("Full Name is required") && actions.includes("Work Email is required") && actions.includes("Department is required") && actions.includes("fieldErrors"));
check("admin creation rejects sensitive notes", actions.includes("hasObviousSecret") && usersClient.includes("Do not enter passwords, FIN"));
check("duplicate admin work email rejected", actions.includes("An administrator with this work email already exists") && actions.includes("admin_employees_work_email_unique_idx"));
check("secure admin creation creates activation-required accounts", actions.includes("admin_status") && actions.includes("activation_required") && actions.includes("admin_activation_required"));
check("secure admin creation shows temporary password once", usersClient.includes("Save these temporary credentials now") && usersClient.includes("temporaryCredentials") && usersClient.includes("The password will not be shown again"));
check("creation result includes employee id, IVR, role, and expiry", usersClient.includes("Employee ID") && usersClient.includes("Identity Verification Reference") && usersClient.includes("Assigned role") && usersClient.includes("Temporary credential expiry"));
check("plaintext password is never inserted or logged", !/console\.(log|warn|error)\([^)]*(tempPassword|passwordHash|authPasswordHash)/.test(actions) && !actions.includes("${tempPassword},"));
check("seed default requires activation without public email verification", seed.includes("admin_employees") && seed.includes("activation_required") && seed.includes("ALLOW_DEV_ADMIN_SEED_ACTIVE") && !seed.includes("emailVerified"));
check("seed reset mode exists", seed.includes("ALLOW_DEV_ADMIN_SEED_RESET") && seed.includes("resetMode"));
check("public user promotion to admin is disabled", superAdminActions.includes('role === "admin"') && superAdminActions.includes("Public users cannot be promoted directly"));
check("admin profile check npm script wired", pkg.scripts?.["check:admin-profile"] === "node scripts/check-admin-profile.mjs");

process.exit(failed ? 1 : 0);
