import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function report(name, ok) {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "MISSING"} ${name}`);
}

const clientRegister = read("app/(auth)/register/client/page.tsx");
const profileApi = read("app/api/auth/profile/route.ts");
const profileActions = read("lib/actions/profile.ts");
const settings = read("components/SettingsContent.tsx");
const clientVerification = read("lib/client-verification.ts");
const contractSetup = read("lib/actions/contract-setup.ts");
const clientContractSetupPage = read("app/(client)/client/contract-setup/page.tsx");
const clientContractsPage = read("app/(client)/client/contracts/page.tsx");
const protectedDocumentRoute = read("app/api/clients/[clientId]/verification-document/route.ts");
const adminClientReviewPage = read("app/(admin)/admin/clients/[id]/verify/page.tsx");
const adminActions = read("lib/actions/admin.ts");
const superAdminUsers = read("components/admin/SuperAdminUsersClient.tsx");
const schema = read("lib/schema.ts");
const packageJson = JSON.parse(read("package.json"));

report(
  "client registration shows optional Fayda verification",
  clientRegister.includes("Optional Fayda Verification") &&
    clientRegister.includes("Skip for now") &&
    clientRegister.includes("Optional during registration") &&
    clientRegister.includes("Create Account & Submit Verification"),
);
report(
  "client registration requires FIN and document together when chosen",
  clientRegister.includes("Submit both your FIN and Fayda document, or choose Skip for now.") &&
    profileApi.includes("Submit both your 12-digit FIN and Fayda ID image together, or skip verification for now."),
);
report(
  "client FIN validation requires exactly 12 digits",
  clientRegister.includes("/^\\d{12}$/") &&
    profileApi.includes("validateFin(faydaFinNumber)") &&
    profileActions.includes("validateFin(submittedFin)"),
);
report(
  "client document validation accepts only safe image/PDF types and limits size",
  clientVerification.includes("image/png") &&
    clientVerification.includes("image/jpeg") &&
    clientVerification.includes("image/webp") &&
    clientVerification.includes("application/pdf") &&
    clientVerification.includes("5 * 1024 * 1024"),
);
report(
  "skipped client starts not_started and valid submission starts pending",
  schema.includes('default("not_started")') &&
    profileApi.includes("'not_started'") &&
    profileApi.includes("'pending'") &&
    profileApi.includes("false") &&
    !profileApi.includes("'approved'"),
);
report(
  "valid client submission encrypts FIN and records protected metadata",
  profileApi.includes("protectedClientFin = protectFin(normalizedFin, neonUserId, \"profile\")") &&
    profileApi.includes("fin_encrypted") &&
    profileApi.includes("fin_fingerprint") &&
    profileApi.includes("fin_last4"),
);
report(
  "profile API never returns full FIN ciphertext or Fayda document",
  profileActions.includes("fin_encrypted: undefined") &&
    profileActions.includes("fin_fingerprint: undefined") &&
    profileActions.includes("fin_encryption_key_id: undefined") &&
    profileActions.includes("fayda_doc_url: undefined") &&
    profileActions.includes("has_fayda_doc"),
);
report(
  "profile resubmission blocks pending/approved/restricted duplicates",
  profileActions.includes("A verification request is already pending.") &&
    profileActions.includes("Your Fayda identity is already verified.") &&
    profileActions.includes("identity access is restricted"),
);
report(
  "client profile shows status, rejection reason, masked FIN, and Verify Now path",
  settings.includes("Fayda Verification") &&
    settings.includes("Pending Verification") &&
    settings.includes("initialData.verification_reason") &&
    settings.includes("initialData.masked_fin") &&
    settings.includes("Submit Verification"),
);
report(
  "PIN setup uses dedicated verification message and preserves return URL",
  clientVerification.includes("Fayda identity verification is required before setting up your contract PIN.") &&
    contractSetup.includes("CLIENT_PIN_VERIFICATION_MESSAGE") &&
    contractSetup.includes("getClientVerificationHref(") &&
    clientContractSetupPage.includes("redirect(status.setupHref)"),
);
report(
  "PIN create and verify actions require approved client identity plus FIN metadata",
  contractSetup.includes("completeContractSetup") &&
    contractSetup.includes("verifyContractPin") &&
    contractSetup.match(/getClientIdentityVerificationStatus\(session\.user\.id\)/g)?.length >= 2 &&
    clientVerification.includes('profile.status === "approved"') === false &&
    contractSetup.includes('profile.status === "approved" && profile.isVerified && profile.hasFin'),
);
report(
  "contract access remains blocked for unverified clients",
  contractSetup.includes("CLIENT_CONTRACT_VERIFICATION_MESSAGE") &&
    clientContractsPage.includes('getContractSetupStatus(undefined, "/client/contracts")'),
);
report(
  "protected document route authorizes owner or admin and disables caching",
  protectedDocumentRoute.includes("isOwner") &&
    protectedDocumentRoute.includes("isAdmin") &&
    protectedDocumentRoute.includes("Forbidden") &&
    protectedDocumentRoute.includes('"Cache-Control": "no-store, private"'),
);
report(
  "protected document route audits admin reads without document or FIN contents",
  protectedDocumentRoute.includes("client_verification_document_viewed") &&
    protectedDocumentRoute.includes("adminId") &&
    protectedDocumentRoute.includes("clientId") &&
    !protectedDocumentRoute.includes("fin_encrypted") &&
    !protectedDocumentRoute.includes("fin_fingerprint"),
);
report(
  "admin client review uses masked FIN and protected document link",
  adminClientReviewPage.includes("Client Fayda Review") &&
    adminClientReviewPage.includes("maskFinLast4(client.fin_last4)") &&
    adminClientReviewPage.includes("/verification-document") &&
    superAdminUsers.includes("Review Fayda"),
);
report(
  "admin approval/rejection is admin-only, audited, and rejection requires reason",
  adminActions.includes("session?.user?.role !== \"admin\"") &&
    adminActions.includes("client_verification_status_changed") &&
    adminActions.includes("A rejection reason is required.") &&
    adminActions.includes("Client must submit FIN and Fayda document before approval."),
);
report(
  "client verification script is wired",
  packageJson.scripts?.["check:client-verification"] === "node scripts/check-client-verification-workflow.mjs",
);

const failed = results.filter((result) => !result.ok);
if (failed.length > 0) {
  console.error(`\n${failed.length} client verification check(s) failed.`);
  process.exit(1);
}

console.log("\nAll client verification workflow checks passed.");
