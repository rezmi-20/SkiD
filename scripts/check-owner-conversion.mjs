import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const conversion = read("scripts/convert-owner-to-employee.mjs");
const pkg = JSON.parse(read("package.json"));
const adminActions = read("lib/actions/admin-account.ts");
const adminAuth = read("lib/admin-authorization.ts");
const adminSession = read("lib/admin-session.ts");
const proxy = read("proxy.ts");
const publicLogin = read("app/(auth)/login/page.tsx");
const authCallback = read("app/auth/callback/page.tsx");
const browserSmoke = read("tests/browser/smoke.spec.ts");

let failed = false;
function check(label, ok) {
  if (ok) console.log(`PASS ${label}`);
  else {
    console.log(`MISSING ${label}`);
    failed = true;
  }
}

const passwordLogCount = (conversion.match(/OWNER_TEMPORARY_PASSWORD/g) || []).length;

check("owner conversion npm script wired", pkg.scripts?.["admin:convert-owner"] === "node scripts/convert-owner-to-employee.mjs");
check("owner conversion check npm script wired", pkg.scripts?.["check:owner-conversion"] === "node scripts/check-owner-conversion.mjs");
check("conversion is limited to exact owner email", conversion.includes('OWNER_EMAIL = "remedanseid00@gmail.com"') && conversion.includes("OWNER_SUPER_ADMIN_EMAIL must be"));
check("conversion refuses production by default", conversion.includes("OWNER_EMPLOYEE_CONVERSION_EMERGENCY") && conversion.includes("Refusing to convert the owner in production"));
check("conversion requires explicit allow flag", conversion.includes("ALLOW_OWNER_EMPLOYEE_CONVERSION") && conversion.includes('!== "true"'));
check("conversion supports dry run before writes", conversion.includes("dryRun: argv.includes(\"--dry-run\")") && conversion.includes("if (options.dryRun) return"));
check("dry run reports owner and dependencies", conversion.includes("Owner employee conversion summary") && conversion.includes("Public dependencies") && conversion.includes("Public user hard deletion safe"));
check("conversion enforces exactly one owner employee", conversion.includes("Multiple owner employee rows found") && conversion.includes("finalEmployeeRows.length !== 1"));
check("conversion targets only super_admin owner", conversion.includes('admin_role !== "super_admin"') && conversion.includes("admin_role = 'super_admin'"));
check("conversion chooses or preserves OWN employee id", conversion.includes('OWNER_EMPLOYEE_ID = "OWN-0001"') && conversion.includes("chooseEmployeeId"));
check("conversion creates or normalizes admin employee credential", conversion.includes("INSERT INTO admin_employees") && conversion.includes("UPDATE admin_employees") && conversion.includes("password_hash = ${passwordHash}"));
check("conversion stores only scrypt hashes", conversion.includes("scryptSync") && !conversion.includes("console.log(passwordHash"));
check("conversion makes owner activation-required", conversion.includes("admin_status = 'activation_required'") && conversion.includes("admin_activation_required = true"));
check("conversion invalidates old admin employee sessions", conversion.includes("session_version = session_version + 1") || conversion.includes("session_version,"));
check("conversion revokes Neon public credentials", conversion.includes("DELETE FROM neon_auth.account") && conversion.includes("DELETE FROM neon_auth.session") && conversion.includes("DELETE FROM neon_auth.verification"));
check("conversion disables Neon auth user when public mirror is preserved", conversion.includes("banned = true") && conversion.includes("Converted to dedicated super-admin employee identity"));
check("conversion disables public mirror without deleting historical refs", conversion.includes("role = 'client'") && conversion.includes("is_suspended = true") && conversion.includes("admin_role = NULL"));
check("conversion never deletes admin employee record", !conversion.includes("DELETE FROM admin_employees"));
check("conversion does not delete business history", !/DELETE FROM (jobs|contracts|payments|ratings|conversations|messages)\b/.test(conversion));
check("conversion records audit without secrets", conversion.includes("owner_public_identity_converted_to_employee") && conversion.includes("credentialReset: true") && !conversion.includes("password: temporaryPassword"));
check("temporary password is printed once after success", passwordLogCount === 2 && conversion.indexOf("OWNER_TEMPORARY_PASSWORD") > conversion.indexOf("await sql.transaction"));
check("admin login authenticates employee id only", adminActions.includes("loginAdminEmployee") && adminActions.includes("admin_employee_id") && adminActions.includes("setAdminSession") && !adminActions.includes("authClient.signIn"));
check("admin session remains separate employee cookie", adminSession.includes("skid-admin-session") && adminSession.includes('typ: "admin_employee"'));
check("public session cannot authorize admin routes", adminAuth.includes("getAdminSessionFromCookies") && proxy.includes("getAdminEmployeeState"));
check("legacy public admin compatibility is removed", !publicLogin.includes('role === "admin"') && !authCallback.includes('role === "admin"') && !proxy.includes('dbRole === "admin"'));
check("browser test covers public/admin separation", browserSmoke.includes("admin employee auth is separated from public sessions") && browserSmoke.includes("not.toHaveURL(/\\/admin\\/login/)"));

process.exit(failed ? 1 : 0);
