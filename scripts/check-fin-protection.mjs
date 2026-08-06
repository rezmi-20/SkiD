import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function pass(name, ok, detail) {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "MISSING"} ${name}${detail ? ` - ${detail}` : ""}`);
}

function includes(file, pattern) {
  return read(file).includes(pattern);
}

const schema = read("lib/schema.ts");
const finProtection = read("lib/fin-protection.ts");
const profile = read("lib/actions/profile.ts");
const contracts = read("lib/actions/contracts.ts");
const contractDocuments = read("lib/contract-documents.ts");
const contractDetails = read("components/ContractDetails.tsx");
const courtCopy = read("app/api/admin/contracts/[id]/court-copy/route.ts");
const workerVerification = read("components/WorkerVerificationContent.tsx");
const finReveal = read("components/admin/VerificationFinReveal.tsx");
const verificationOps = read("lib/verification-operations.ts");
const packageJson = JSON.parse(read("package.json"));

pass("FIN requires exactly 12 digits", finProtection.includes("const FIN_DIGITS = /^\\d{12}$/;"));
pass("Full FIN encrypted with AES-GCM", finProtection.includes("createCipheriv(\"aes-256-gcm\""));
pass("FIN fingerprint uses keyed HMAC", finProtection.includes("createHmac(\"sha256\""));
pass("FIN last-four masker available", finProtection.includes("export function maskFinLast4"));
pass("Worker profile stores encrypted FIN", schema.includes("finEncrypted: text(\"fin_encrypted\")"));
pass("Client profile stores encrypted FIN", schema.includes("export const clientProfiles") && schema.includes("finFingerprint: text(\"fin_fingerprint\")"));
pass("Worker profile schema has no app-facing Fayda FAN field", !schema.includes("faydaFanNumber"));
pass("Client profile schema has verification metadata", schema.includes("verificationProvider") && schema.includes("verificationReference"));
pass("Profile update protects submitted FIN", profile.includes("protectFin(normalizedFin, targetUserId, \"profile\")"));
pass("Profile action does not return FIN ciphertext", profile.includes("fin_encrypted: undefined") && profile.includes("fin_fingerprint: undefined"));
pass("Contract signing requires both parties verified", contracts.includes("Both client and worker must complete identity verification before signing this contract."));
pass("Contract signing requires recorded FIN last4", contracts.includes("contract.client_fin_last4") && contracts.includes("contract.worker_fin_last4"));
pass("Contract page displays masked FIN only", contractDetails.includes("client_masked_fin") && contractDetails.includes("worker_masked_fin"));
pass("Ordinary contract PDF masks FIN", contractDocuments.includes("maskFinLast4(contract.client_fin_last4)") && contractDocuments.includes("maskFinLast4(contract.worker_fin_last4)"));
pass("Contract activation stores immutable identity snapshot", contractDocuments.includes("identityVerificationSnapshot") && contractDocuments.includes("finalized_snapshot"));
pass("Admin verification UI uses masked FIN", workerVerification.includes("masked_fin") && !workerVerification.includes("fayda_fan_number"));
pass("Controlled verification FIN reveal is temporary and audited", finReveal.includes("Reveal FIN for verification") && finReveal.includes("setTimeout") && verificationOps.includes("verification_fin_revealed") && verificationOps.includes('"content_verification_admin"'));
pass("Controlled reveal does not persist or log FIN", !finReveal.includes("localStorage") && !finReveal.includes("sessionStorage") && !finReveal.includes("console."));
pass("Court copy route requires legal export allowlist", courtCopy.includes("LEGAL_DOCUMENT_EXPORT_ADMIN_IDS"));
pass("Court copy route is disabled by default", courtCopy.includes("COURT_COPY_EXPORT_ENABLED") && courtCopy.includes("Court copy export is temporarily disabled."));
pass("Court copy route does not trust forged re-auth headers", !courtCopy.includes("x-legal-reauth-confirmed") && !courtCopy.includes("x-legal-2fa-confirmed"));
pass("Court copy route requires trusted server-side challenge", courtCopy.includes("legal_reauth_challenges") && courtCopy.includes("reauthChallengeId"));
pass("Court copy route audits export", courtCopy.includes("court_copy_exported") && courtCopy.includes("documentHash"));
pass("Court copy route disables caching", courtCopy.includes("\"Cache-Control\": \"no-store, private\""));
pass("FIN migration script is wired", packageJson.scripts?.["db:migrate:fin"] === "node scripts/migrate-fin-protection.mjs");

const failed = checks.filter((check) => !check.ok);
if (failed.length > 0) {
  console.error(`\n${failed.length} FIN protection check(s) failed.`);
  process.exit(1);
}

console.log("\nAll FIN protection checks passed.");
