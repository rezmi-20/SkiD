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
const sharedClientVerification = read("lib/client-verification-shared.ts");
const contractSetup = read("lib/actions/contract-setup.ts");
const clientContractSetupPage = read("app/(client)/client/contract-setup/page.tsx");
const clientContractsPage = read("app/(client)/client/contracts/page.tsx");
const protectedDocumentRoute = read("app/api/clients/[clientId]/verification-document/route.ts");
const adminClientReviewPage = read("app/(admin)/admin/clients/[id]/verify/page.tsx");
const adminActions = read("lib/actions/admin.ts");
const verificationOperations = read("lib/verification-operations.ts");
const superAdminUsers = read("components/admin/SuperAdminUsersClient.tsx");
const schema = read("lib/schema.ts");
const packageJson = JSON.parse(read("package.json"));

report(
  "client registration shows optional Fayda verification",
  clientRegister.includes('useState(false)') &&
    clientRegister.includes("Optional Fayda Section") &&
    clientRegister.includes("setWantsVerification((value) => !value)") &&
    clientRegister.includes('t("auth.register.client.skip")') &&
    clientRegister.includes('wantsVerification ? t("auth.register.client.submitWithVerification")'),
);
report(
  "client registration requires FIN and document together when chosen",
  clientRegister.includes("if (wantsVerification)") &&
    clientRegister.includes("if (!formData.faydaFinNumber || !formData.faydaDocDataUrl)") &&
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
  settings.includes('t("settings.faydaVerification")') &&
    settings.includes('verificationStatus === "pending"') &&
    settings.includes("initialData.verification_reason") &&
    settings.includes("initialData.masked_fin") &&
    settings.includes('t("settings.submitVerification")') &&
    settings.includes("clientCanSubmitVerification"),
);
report(
  "PIN setup uses dedicated verification message and preserves return URL",
  sharedClientVerification.includes("Fayda identity verification is required before setting up your contract PIN.") &&
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
  "protected Fayda route permits only a one-time verification-admin reveal",
  protectedDocumentRoute.includes("export async function POST") &&
    protectedDocumentRoute.includes('admin.role !== "content_verification_admin"') &&
    protectedDocumentRoute.includes('hasAdminPermission(admin, "verification.review")') &&
    protectedDocumentRoute.includes("expectedAttemptId") &&
    protectedDocumentRoute.includes("recordVerificationDocumentView") &&
    protectedDocumentRoute.includes('"Cache-Control": "private, no-store"'),
);
report(
  "Fayda reveal audit records access without FIN contents",
  protectedDocumentRoute.includes("recordVerificationDocumentView") &&
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
  adminActions.includes("decideVerificationCase(\"client\"") &&
    verificationOperations.includes("requireAdminPermission(requiredPermissionForDecision(nextStatus))") &&
    verificationOperations.includes("cleanReason(reason)") &&
    verificationOperations.includes("A clear reason is required for this verification decision.") &&
    verificationOperations.includes("INSERT INTO verification_events") &&
    verificationOperations.includes("hasCompleteWorkerIdentity"),
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
