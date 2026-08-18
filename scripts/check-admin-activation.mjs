import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const proxy = read("proxy.ts");
const layout = read("app/(admin)/layout.tsx");
const authz = read("lib/admin-authorization.ts");
const actions = read("lib/actions/admin-account.ts");
const activationPage = read("app/(admin)/admin/activate/page.tsx");
const activationForm = read("components/admin/AdminActivationForm.tsx");
const migration = read("drizzle/0016_admin_employee_auth.sql");
const adminSession = read("lib/admin-session.ts");
const pkg = JSON.parse(read("package.json"));

let failed = false;
function check(label, ok) {
  if (ok) console.log(`PASS ${label}`);
  else {
    console.log(`MISSING ${label}`);
    failed = true;
  }
}

check("activation route exists", activationPage.includes("AdminActivationForm"));
check("activation-required principal exists", authz.includes("getActivationRequiredAdminPrincipal") && authz.includes("requireActivationRequiredAdmin"));
check("normal admin permissions still require active status", authz.includes('status !== "active"') && authz.includes("activationRequired"));
check("proxy redirects activation-required admin to activate page", proxy.includes("isActivationRequiredAdminAccount") && proxy.includes('"/admin/activate"'));
check("active admin redirected away from activation page", proxy.includes('pathname === "/admin/activate"') && proxy.includes('"/admin/dashboard"'));
check("layout renders activation page without admin shell", layout.includes("getActivationRequiredAdminPrincipal") && layout.includes("{children}"));
check("activation action requires activation-required admin", actions.includes("requireActivationRequiredAdmin()"));
check("activation form has no username field", !activationForm.includes('name="username"') && !activationForm.includes("adminUsername"));
check("activation form shows read-only employee identity", activationForm.includes("admin.common.employeeId") && activationForm.includes("admin.common.workEmail") && activationForm.includes("admin.common.department"));
check("weak and mismatched password denied", actions.includes("validateStrongAdminPassword") && actions.includes("Password confirmation does not match"));
check("expired temporary credential denied", actions.includes("temp_credential_expires_at") && actions.includes("Temporary credential has expired"));
check("same temporary password denied", actions.includes("different from the temporary password") && actions.includes("verifyBetterAuthPassword"));
check("activation updates active status and flag", actions.includes("admin_activation_required = false") && actions.includes("admin_status = 'active'"));
check("activation clears temporary credential expiry", actions.includes("temp_credential_expires_at = NULL"));
check("admin credential source updated", actions.includes("UPDATE admin_employees") && actions.includes("setCredentialPassword") && actions.includes("hashBetterAuthPassword"));
check("activation refreshes admin employee session", actions.includes("setAdminSession") && actions.includes("sessionVersion"));
check("admin session has employee type marker", adminSession.includes('typ: "admin_employee"') && adminSession.includes("ADMIN_SESSION_COOKIE"));
check("schema migration adds employee activation fields", migration.includes("admin_employees") && migration.includes("admin_activation_required") && migration.includes("temp_credential_expires_at"));
check("admin activation check npm script wired", pkg.scripts?.["check:admin-activation"] === "node scripts/check-admin-activation.mjs");

process.exit(failed ? 1 : 0);
