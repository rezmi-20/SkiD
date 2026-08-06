import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const pkg = JSON.parse(read("package.json"));
const queuePage = read("app/(admin)/admin/verify/page.tsx");
const dashboardPage = read("app/(admin)/admin/dashboard/page.tsx");
const workersPage = read("app/(admin)/admin/workers/page.tsx");
const clientVerification = read("lib/client-verification.ts");
const reviewTabs = read("components/admin/VerificationReviewTabs.tsx");
const pendingVerification = read("components/admin/PendingVerification.tsx");
const workersManagement = read("components/admin/WorkersManagementClient.tsx");
const workerReviewPage = read("app/(admin)/admin/verify/[id]/page.tsx");
const workerReviewContent = read("components/WorkerVerificationContent.tsx");
const clientReviewPage = read("app/(admin)/admin/clients/[id]/verify/page.tsx");
const workerDocRoute = read("app/api/workers/[id]/verification-document/route.ts");
const clientDocRoute = read("app/api/clients/[clientId]/verification-document/route.ts");

let failed = false;
function check(label, ok) {
  console.log(`${ok ? "PASS" : "MISSING"} ${label}`);
  if (!ok) failed = true;
}

function hasRawDocumentSelect(source, patterns) {
  return patterns.some((pattern) => pattern.test(source));
}

check(
  "npm script wired",
  pkg.scripts?.["check:verification-query-performance"] === "node scripts/check-verification-query-performance.mjs",
);

check(
  "worker verification queue uses boolean document flag",
  queuePage.includes("END AS has_document") &&
    queuePage.includes("hasDocument: Boolean(w.has_document)") &&
    !hasRawDocumentSelect(queuePage, [/wp\.fayda_doc_url\s*,/, /wp\.fayda_doc_url\s+AS\s+fayda_doc_url/i]),
);

check(
  "client verification queue uses boolean document flag",
  queuePage.includes("END AS has_document") &&
    queuePage.includes("hasDocument: Boolean(client.has_document)") &&
    !hasRawDocumentSelect(queuePage, [/cp\.fayda_doc_url\s*,/, /NULL AS fayda_doc_url/i]),
);

check(
  "admin dashboard pending list omits document payload",
  dashboardPage.includes("END AS has_document") &&
    !hasRawDocumentSelect(dashboardPage, [/wp\.fayda_doc_url\s*,/, /wp\.fayda_doc_url\s+AS/i]),
);

check(
  "workers management list omits document payload",
  workersPage.includes('END AS "hasDocument"') &&
    workersPage.includes("hasDocument: w.hasDocument") &&
    !workersPage.includes('fayda_doc_url AS "faydaDocUrl"'),
);

check(
  "client identity status helper omits document payload",
  clientVerification.includes('END AS "has_document"') &&
    clientVerification.includes("hasDocument: Boolean(profile?.has_document)") &&
    !clientVerification.includes('["fayda_doc_url"]') &&
    !clientVerification.includes("SELECT fayda_doc_url"),
);

check(
  "queue UI receives only hasDocument",
  reviewTabs.includes("hasDocument: boolean") &&
    reviewTabs.includes("worker.hasDocument") &&
    reviewTabs.includes("client.hasDocument") &&
    !reviewTabs.includes("fayda_doc_url"),
);

check(
  "dashboard pending UI receives only has_document",
  pendingVerification.includes("has_document?: boolean") &&
    pendingVerification.includes("worker.has_document") &&
    !pendingVerification.includes("worker.fayda_doc_url"),
);

check(
  "workers management UI receives only hasDocument",
  workersManagement.includes("hasDocument: boolean") &&
    workersManagement.includes("w.hasDocument") &&
    !workersManagement.includes("w.faydaDocUrl"),
);

check(
  "single-case review pages may load document presence for protected viewer",
  workerReviewPage.includes("wp.fayda_doc_url") &&
    clientReviewPage.includes("fayda_doc_url") &&
    workerReviewContent.includes("/api/workers/${worker.user_id}/verification-document") &&
    clientReviewPage.includes("/api/clients/${client.user_id}/verification-document"),
);

check(
  "protected document routes still retrieve document",
  workerDocRoute.includes("SELECT fayda_doc_url") &&
    clientDocRoute.includes("SELECT fayda_doc_url") &&
    workerDocRoute.includes("verification.read") &&
    clientDocRoute.includes("verification.read"),
);

check(
  "list results do not add full FIN or secret material",
  !queuePage.includes("fin_encrypted") &&
    !queuePage.includes("fin_fingerprint") &&
    !dashboardPage.includes("fin_encrypted") &&
    !workersPage.includes("fin_encrypted"),
);

process.exit(failed ? 1 : 0);
