import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const reset = read("scripts/reset-owner-admin.mjs");
const migration = read("scripts/migrate-admin-employee-auth.mjs");
const adminSession = read("lib/admin-session.ts");
const adminSignOut = read("app/api/admin/sign-out/route.ts");
const publicSignOut = read("app/api/auth/sign-out/route.ts");
const footer = read("components/landing/Footer.jsx");
const navbar = read("components/landing/Navbar.jsx");
const loginForm = read("components/admin/AdminEmployeeLoginForm.tsx");
const adminActions = read("lib/actions/admin-account.ts");
const publicLogin = read("app/(auth)/login/page.tsx");
const pkg = JSON.parse(read("package.json"));

let failed = false;
function check(label, ok) {
  if (ok) console.log(`PASS ${label}`);
  else {
    console.log(`MISSING ${label}`);
    failed = true;
  }
}

check("owner reset npm script wired", pkg.scripts?.["reset:owner-admin"] === "node scripts/reset-owner-admin.mjs");
check("owner reset refuses production by default", reset.includes("OWNER_ADMIN_RESET_EMERGENCY") && reset.includes("Refusing to reset the owner admin in production"));
check("owner reset requires explicit allow flag", reset.includes("ALLOW_OWNER_ADMIN_RESET") && reset.includes('!== "true"'));
check("owner reset locates configured owner email only", reset.includes("OWNER_SUPER_ADMIN_EMAIL") && reset.includes("WHERE lower(work_email)"));
check("owner reset targets only super_admin", reset.includes('admin_role !== "super_admin"') && reset.includes("AND admin_role = 'super_admin'"));
check("owner reset verifies exactly one updated owner row", reset.includes("RETURNING admin_employee_id") && reset.includes("updatedRows.length !== 1"));
check("owner reset updates only admin_employees", reset.includes("UPDATE admin_employees") && !reset.includes("UPDATE users"));
check("owner reset stores scrypt hash only", reset.includes("scryptSync") && reset.includes("password_hash = ${passwordHash}") && !reset.includes("console.log(passwordHash"));
check("owner reset makes owner activation-required", reset.includes("admin_activation_required = true") && reset.includes("admin_status = 'activation_required'"));
check("owner reset expires temporary credential", reset.includes("temp_credential_expires_at") && reset.includes("OWNER_TEMPORARY_PASSWORD_EXPIRES_AT"));
check("owner reset invalidates sessions", reset.includes("session_version = session_version + 1"));
check("owner reset prints employee id and temporary password once", reset.includes("OWNER_EMPLOYEE_ID") && reset.includes("OWNER_TEMPORARY_PASSWORD"));
check("admin session uses employee cookie marker", adminSession.includes("skid-admin-session") && adminSession.includes('typ: "admin_employee"'));
check("admin login creates only admin session", adminActions.includes("loginAdminEmployee") && adminActions.includes("setAdminSession") && !adminActions.includes("authClient.signIn"));
check("public login has no legacy admin role redirect", !publicLogin.includes('role === "admin"') && !publicLogin.includes('router.replace("/admin/login")'));
check("admin sign-out clears only admin cookie", adminSignOut.includes("clearAdminSession") && !adminSignOut.includes("neon-auth"));
check("public sign-out clears only public auth cookies", publicSignOut.includes("NEON_COOKIE_NAMES") && !publicSignOut.includes("skid-admin-session"));
check("migration message explains public email login no longer grants admin access", migration.includes("public email login no longer grants administrator access"));
check("migration message prints configured owner employee id", migration.includes("OWNER_ADMIN_EMPLOYEE_ID") && migration.includes("ownerEmail"));
check("migration message points owner to reset command", migration.includes("reset:owner-admin"));
check("footer contains lower-priority Staff Login", footer.includes("Staff Login") && footer.includes('/admin/login'));
check("navbar does not expose Staff Login primary link", !navbar.includes("Staff Login"));
check("public admin dashboard link removed from landing nav", !navbar.includes('? "/admin/dashboard"') && navbar.includes('? "/admin/login"'));
check("admin login has employee id and password labels", loginForm.includes("Employee ID") && loginForm.includes("Password"));
check("admin login uses correct autocomplete", loginForm.includes('autoComplete="username"') && loginForm.includes('autoComplete="current-password"'));
check("admin login has no public registration or verification link", !loginForm.includes("/register") && !loginForm.includes("email-verification") && !loginForm.includes("otp-verification"));
check("admin login shows authorized employees only", loginForm.includes("Authorized employees only"));

process.exit(failed ? 1 : 0);
