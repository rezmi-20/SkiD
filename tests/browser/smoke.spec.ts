import { expect, test, type Browser, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import { DEMO_IDS } from "../../scripts/demo-data-fixtures.mjs";

const sessionSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!sessionSecret) throw new Error("NEON_AUTH_COOKIE_SECRET is required for browser smoke tests.");

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const sessionCookieName = "neon-auth.local.session_data";
const adminSessionCookieName = "skid-admin-session";
const fixture = {
  admin: { id: DEMO_IDS.admin, email: "demo.admin@direskill.local", role: "admin", employeeId: "OWN-9001", adminRole: "super_admin" },
  client: { id: DEMO_IDS.client, email: "demo.client@direskill.local", role: "client" },
  worker: { id: DEMO_IDS.worker, email: "demo.worker@direskill.local", role: "worker" },
  unverifiedWorker: { id: DEMO_IDS.unverifiedWorker, email: "demo.unverified@direskill.local", role: "worker" },
  secondClient: { id: DEMO_IDS.secondClient, email: "demo.second-client@direskill.local", role: "client" },
  secondWorker: { id: DEMO_IDS.secondWorker, email: "demo.second-worker@direskill.local", role: "worker" },
  rejectedWorker: { id: DEMO_IDS.rejectedWorker, email: "demo.rejected-worker@direskill.local", role: "worker" },
  suspendedWorker: { id: DEMO_IDS.suspendedWorker, email: "demo.suspended-worker@direskill.local", role: "worker" },
  revokedWorker: { id: DEMO_IDS.revokedWorker, email: "demo.revoked-worker@direskill.local", role: "worker" },
  unverifiedClient: { id: DEMO_IDS.unverifiedClient, email: "demo.unverified-client@direskill.local", role: "client" },
  unrelated: { id: randomUUID(), email: `browser-unrelated-${randomUUID()}@example.test`, role: "client" },
  jobPending: DEMO_IDS.jobPending,
  jobActive: DEMO_IDS.jobActive,
  jobInProgress: DEMO_IDS.jobInProgress,
  jobPayment: DEMO_IDS.jobPaymentPending,
  jobRated: DEMO_IDS.jobPaid,
  contractInProgress: DEMO_IDS.contract,
  contractPayment: DEMO_IDS.contract,
  contractRated: DEMO_IDS.contract,
  paymentReleased: DEMO_IDS.payment,
};

async function createSessionCookie(user: { id: string; email: string; role: string }) {
  return new SignJWT({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: true,
    },
    session: {
      userId: user.id,
      token: `browser-smoke-${user.role}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(sessionSecret));
}

async function createAdminSessionCookie(user: { id: string; employeeId: string; adminRole: string }) {
  return new SignJWT({
    typ: "admin_employee",
    adminId: user.id,
    employeeId: user.employeeId,
    role: user.adminRole,
    sessionVersion: 0,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET || sessionSecret));
}

async function newAuthedPage(browser: Browser, user: { id: string; email: string; role: string; employeeId?: string; adminRole?: string }) {
  const context = await browser.newContext({ baseURL });
  const isAdminEmployee = user.role === "admin" && user.employeeId && user.adminRole;
  await context.addCookies([
    isAdminEmployee
      ? {
          name: adminSessionCookieName,
          value: await createAdminSessionCookie(user as { id: string; employeeId: string; adminRole: string }),
          url: baseURL,
          httpOnly: true,
          sameSite: "Lax",
        }
      : {
          name: sessionCookieName,
          value: await createSessionCookie(user),
          url: baseURL,
          httpOnly: true,
          sameSite: "Lax",
        },
  ]);
  return context.newPage();
}

async function cookieNames(page: Page) {
  return (await page.context().cookies(baseURL)).map((cookie) => cookie.name);
}

async function closeAuthedPage(page: Page) {
  await page.context().close();
}

async function expectHtmlContains(page: Page, text: string | RegExp) {
  await expect.poll(async () => page.content()).toContain(text);
}

async function expectRouteLoads(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response?.status(), `${route} should load`).toBeLessThan(400);
  await expect(page, `${route} should not redirect to login`).not.toHaveURL(/\/login/);
}

test.describe.configure({ mode: "serial" });
test.setTimeout(90_000);

test("authentication and public pages load", async ({ page }) => {
  const loginResponse = await page.goto("/login");
  expect(loginResponse?.status()).toBeLessThan(400);

  for (const route of ["/client/dashboard", "/worker/dashboard", "/admin/dashboard"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
  }

  await page.goto("/");
  await expectHtmlContains(page, "DireSkill");

  const clientRegisterResponse = await page.goto("/register/client");
  expect(clientRegisterResponse?.status()).toBeLessThan(400);

  const workerRegisterResponse = await page.goto("/register/worker");
  expect(workerRegisterResponse?.status()).toBeLessThan(400);

  const otpResponse = await page.goto("/otp-verification?email=browser@example.test");
  expect(otpResponse?.status()).toBeLessThan(400);
});

test("authenticated roles reach their dashboards and wrong roles are denied", async ({ browser }) => {
  let page = await newAuthedPage(browser, fixture.client);
  await expectRouteLoads(page, "/client/dashboard");
  await closeAuthedPage(page);

  page = await newAuthedPage(browser, fixture.worker);
  await expectRouteLoads(page, "/worker/dashboard");
  await closeAuthedPage(page);

  page = await newAuthedPage(browser, fixture.admin);
  await expectRouteLoads(page, "/admin/dashboard");
  await closeAuthedPage(page);

  page = await newAuthedPage(browser, fixture.client);
  await page.goto("/worker/dashboard");
  await expect(page).not.toHaveURL(/\/worker\/dashboard/);
  await closeAuthedPage(page);

  page = await newAuthedPage(browser, fixture.worker);
  await page.goto("/admin/dashboard");
  await expect(page).not.toHaveURL(/\/admin\/dashboard/);
  await closeAuthedPage(page);
});

test("admin employee auth is separated from public sessions and sign-out scopes", async ({ browser }) => {
  const legacyPublicAdminContext = await browser.newContext({ baseURL });
  await legacyPublicAdminContext.addCookies([
    {
      name: sessionCookieName,
      value: await createSessionCookie(fixture.admin),
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const legacyPublicAdminPage = await legacyPublicAdminContext.newPage();
  await legacyPublicAdminPage.goto("/admin/dashboard");
  await expect(legacyPublicAdminPage).toHaveURL(/\/admin\/login/);
  await legacyPublicAdminPage.goto("/login");
  await expect(legacyPublicAdminPage).toHaveURL(/\/login/);
  await expect(legacyPublicAdminPage).not.toHaveURL(/\/admin\/login/);
  await legacyPublicAdminContext.close();

  const adminSignOutContext = await browser.newContext({ baseURL });
  await adminSignOutContext.addCookies([
    {
      name: sessionCookieName,
      value: await createSessionCookie(fixture.client),
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: adminSessionCookieName,
      value: await createAdminSessionCookie(fixture.admin),
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const adminSignOutPage = await adminSignOutContext.newPage();
  await expectRouteLoads(adminSignOutPage, "/admin/dashboard");
  const adminSignOutResponse = await adminSignOutPage.request.post("/api/admin/sign-out");
  expect(adminSignOutResponse.status()).toBe(200);
  await expect.poll(async () => cookieNames(adminSignOutPage)).not.toContain(adminSessionCookieName);
  expect(await cookieNames(adminSignOutPage)).toContain(sessionCookieName);
  await expectRouteLoads(adminSignOutPage, "/client/dashboard");
  await adminSignOutContext.close();

  const publicSignOutContext = await browser.newContext({ baseURL });
  await publicSignOutContext.addCookies([
    {
      name: sessionCookieName,
      value: await createSessionCookie(fixture.client),
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: adminSessionCookieName,
      value: await createAdminSessionCookie(fixture.admin),
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const publicSignOutPage = await publicSignOutContext.newPage();
  const publicSignOutResponse = await publicSignOutPage.request.post("/api/auth/sign-out");
  expect(publicSignOutResponse.status()).toBe(200);
  await expect.poll(async () => cookieNames(publicSignOutPage)).not.toContain(sessionCookieName);
  expect(await cookieNames(publicSignOutPage)).toContain(adminSessionCookieName);
  await expectRouteLoads(publicSignOutPage, "/admin/dashboard");
  await publicSignOutContext.close();
});

test("staff login placement and admin login bootstrap UI stay focused", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('footer a[href="/admin/login"]', { hasText: "Staff Login" })).toBeVisible();
  await expect(page.locator('nav a[href="/admin/login"]', { hasText: "Staff Login" })).toHaveCount(0);

  await page.goto("/admin/login");
  await expect(page.getByText("Authorized employees only")).toBeVisible();
  await expect(page.getByLabel("Employee ID")).toHaveAttribute("autocomplete", "username");
  await expect(page.locator('input[name="password"]')).toHaveAttribute("autocomplete", "current-password");
  await expect(page.locator('a[href^="/register"], a[href*="otp-verification"], a[href*="email-verification"]')).toHaveCount(0);
});

test("super admin create administrator form validates at mobile and desktop sizes", async ({ browser }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    const page = await newAuthedPage(browser, fixture.admin);
    await page.setViewportSize(viewport);
    await expectRouteLoads(page, "/admin/users");

    await page.getByRole("button", { name: /Create Admin Account/i }).click();
    await expect(page.getByRole("heading", { name: /Create Admin Account/i })).toBeVisible();
    await expect(page.getByText("Employee Information")).toBeVisible();
    await expect(page.getByText("Role Assignment")).toBeVisible();
    await expect(page.getByText("Verification Confirmation")).toBeVisible();
    await expect(page.getByText("Masked/reference identifier")).toHaveCount(0);
    await expect(page.getByLabel(/Full Name/)).toBeVisible();
    await expect(page.getByLabel(/Work Email/)).toBeVisible();
    await expect(page.getByLabel(/Phone Number/)).toBeVisible();

    await page.getByLabel(/Full Name/).fill("Browser Test Admin");
    await page.getByLabel(/Work Email/).fill(`browser-admin-${randomUUID()}@example.test`);
    await page.getByLabel(/Phone Number/).fill("+251123");
    await page.getByLabel(/Administrative Note/).fill("FIN entered by mistake");
    await page.getByRole("button", { name: /^Create Admin$/ }).click();

    await expect(page.getByText("Use Ethiopian international format")).toBeVisible();
    await expect(page.getByText("Do not enter passwords, FIN")).toBeVisible();
    await expect(page.getByText("Offline identity and work-email confirmation is required.")).toBeVisible();
    await page.getByRole("button", { name: /Close create administrator dialog/i }).click();
    await closeAuthedPage(page);
  }
});

test("super admin verification oversight stays read-only", async ({ browser }) => {
  const page = await newAuthedPage(browser, fixture.admin);
  await expectRouteLoads(page, "/admin/verify");
  await expect(page.getByText("Fayda Review Queue")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Approve$/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Reject$/ })).toHaveCount(0);
  await expect(page.getByText("View details").first()).toBeVisible();
  await closeAuthedPage(page);
});

test("core workflow pages render with correct role and state gates", async ({ browser }) => {
  const clientPage = await newAuthedPage(browser, fixture.client);

  await expectRouteLoads(clientPage, `/client/contract/new?workerId=${fixture.worker.id}`);

  await expectRouteLoads(clientPage, "/client/search");

  await expectRouteLoads(clientPage, `/client/worker/${fixture.worker.id}`);
  const workerDetailResponse = await clientPage.request.get(`/api/workers/${fixture.worker.id}`);
  expect(workerDetailResponse.status()).toBe(200);
  expect(JSON.stringify(await workerDetailResponse.json())).not.toContain(fixture.worker.email);

  await expectRouteLoads(clientPage, `/client/contracts/${fixture.contractPayment}`);

  await expectRouteLoads(clientPage, `/client/pay/${fixture.jobPayment}`);

  await expectRouteLoads(clientPage, `/client/rate/${fixture.jobRated}`);

  await closeAuthedPage(clientPage);

  const workerPage = await newAuthedPage(browser, fixture.worker);
  await expectRouteLoads(workerPage, "/worker/dashboard");

  await expectRouteLoads(workerPage, "/worker/gigs");
  await closeAuthedPage(workerPage);
});

test("primary journeys render at release viewports", async ({ browser }) => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ];

  for (const viewport of viewports) {
    const clientPage = await newAuthedPage(browser, fixture.client);
    await clientPage.setViewportSize(viewport);
    await expectRouteLoads(clientPage, "/client/dashboard");
    await expectRouteLoads(clientPage, `/client/contract/new?workerId=${fixture.worker.id}`);
    await closeAuthedPage(clientPage);

    const workerPage = await newAuthedPage(browser, fixture.worker);
    await workerPage.setViewportSize(viewport);
    await expectRouteLoads(workerPage, "/worker/gigs");
    await closeAuthedPage(workerPage);

  }
});

test("security smoke checks block removed and unauthorized resources", async ({ browser, page }) => {
  for (const route of ["/api/auth/debug-session", "/api/diag", "/diag", "/test-new-update"]) {
    const response = await page.request.get(route);
    expect(response.status()).toBe(404);
  }

  const unrelatedPage = await newAuthedPage(browser, fixture.secondClient);
  const receiptResponse = await unrelatedPage.request.get(`/api/payments/${fixture.paymentReleased}/receipt`);
  expect([403, 404]).toContain(receiptResponse.status());
  await closeAuthedPage(unrelatedPage);

  const clientPage = await newAuthedPage(browser, fixture.client);
  const hiddenWorkerResponse = await clientPage.request.get(`/api/workers/${fixture.unverifiedWorker.id}`);
  expect(hiddenWorkerResponse.status()).toBe(404);
  await closeAuthedPage(clientPage);
});

test("workflow discovery exposes only approved active workers", async ({ browser }) => {
  const clientPage = await newAuthedPage(browser, fixture.client);
  const response = await clientPage.request.get("/api/workers");
  expect(response.status()).toBe(200);

  const body = await response.json();
  const serialized = JSON.stringify(body);
  const workerIds = body.workers.map((worker: { id: string }) => worker.id);

  expect(workerIds).toContain(fixture.worker.id);
  expect(workerIds).toContain(fixture.secondWorker.id);
  expect(workerIds).not.toContain(fixture.unverifiedWorker.id);
  expect(workerIds).not.toContain(fixture.rejectedWorker.id);
  expect(workerIds).not.toContain(fixture.suspendedWorker.id);
  expect(workerIds).not.toContain(fixture.revokedWorker.id);
  expect(serialized).not.toContain("@direskill.local");

  const approvedDetail = await clientPage.request.get(`/api/workers/${fixture.worker.id}`);
  expect(approvedDetail.status()).toBe(200);
  expect(JSON.stringify(await approvedDetail.json())).not.toContain(fixture.worker.email);

  for (const inactiveWorker of [
    fixture.unverifiedWorker,
    fixture.rejectedWorker,
    fixture.suspendedWorker,
    fixture.revokedWorker,
  ]) {
    const hiddenDetail = await clientPage.request.get(`/api/workers/${inactiveWorker.id}`);
    expect(hiddenDetail.status()).toBe(404);
  }

  await closeAuthedPage(clientPage);
});

test("job invitation gates enforce client identity, worker availability, and duplicate safety", async ({ browser }) => {
  const clientPage = await newAuthedPage(browser, fixture.client);
  const title = `BROWSER-E2E - ${randomUUID()}`;
  const payload = {
    workerId: fixture.secondWorker.id,
    title,
    description: "Browser workflow request",
    budget: 900,
    location: "Kezira, Dire Dawa",
    requestedDate: "2026-08-10",
  };

  const created = await clientPage.request.post("/api/jobs", { data: payload });
  expect(created.status()).toBe(201);

  const duplicate = await clientPage.request.post("/api/jobs", { data: { ...payload, title: `${title} duplicate` } });
  expect(duplicate.status()).toBe(409);
  expect((await duplicate.json()).error).toContain("active hiring workflow");

  const inactiveWorker = await clientPage.request.post("/api/jobs", {
    data: { ...payload, workerId: fixture.revokedWorker.id, title: `BROWSER-E2E - revoked ${randomUUID()}` },
  });
  expect(inactiveWorker.status()).toBe(404);
  await closeAuthedPage(clientPage);

  const unverifiedClientPage = await newAuthedPage(browser, fixture.unverifiedClient);
  const browseResponse = await unverifiedClientPage.request.get("/api/workers");
  expect(browseResponse.status()).toBe(200);
  expect(JSON.stringify(await browseResponse.json())).toContain(fixture.worker.id);

  const blocked = await unverifiedClientPage.request.post("/api/jobs", {
    data: {
      workerId: fixture.worker.id,
      title: `BROWSER-E2E - unverified ${randomUUID()}`,
      description: "Should be blocked before contract workflow",
      budget: 700,
    },
  });
  expect(blocked.status()).toBe(403);
  expect((await blocked.json()).error).toContain("Fayda identity verification is required");
  await closeAuthedPage(unverifiedClientPage);
});

test("job and contract authorization blocks unrelated actors and invalid transitions", async ({ browser }) => {
  const secondWorkerPage = await newAuthedPage(browser, fixture.secondWorker);
  const unrelatedJob = await secondWorkerPage.request.get(`/api/jobs/${fixture.jobPending}`);
  expect(unrelatedJob.status()).toBe(403);

  const unrelatedAccept = await secondWorkerPage.request.patch(`/api/jobs/${fixture.jobPending}`, {
    data: { status: "accepted" },
  });
  expect(unrelatedAccept.status()).toBe(403);
  await closeAuthedPage(secondWorkerPage);

  const workerPage = await newAuthedPage(browser, fixture.worker);
  const invalidTransition = await workerPage.request.patch(`/api/jobs/${fixture.jobActive}`, {
    data: { status: "completion_requested" },
  });
  expect(invalidTransition.status()).toBe(409);
  await closeAuthedPage(workerPage);

  const clientPage = await newAuthedPage(browser, fixture.client);
  const contractList = await clientPage.request.get("/api/contracts");
  expect(contractList.status()).toBe(200);
  const contractListJson = JSON.stringify(await contractList.json());
  expect(contractListJson).toContain(fixture.contractPayment);
  expect(contractListJson).not.toContain("120212");
  await closeAuthedPage(clientPage);

  const unrelatedPage = await newAuthedPage(browser, fixture.secondClient);
  const blockedPdf = await unrelatedPage.request.get(`/api/contracts/${fixture.contractPayment}/pdf`);
  expect(blockedPdf.status()).toBe(403);
  await closeAuthedPage(unrelatedPage);
});

test("payment recovery endpoints require ownership and do not trust return URL query params alone", async ({ browser, page }) => {
  await page.goto(`/payment-success?job_id=${fixture.jobRated}&tx_ref=${encodeURIComponent("DIRESKILL-DEMO-PAID")}`);
  await expectHtmlContains(page, "Login required before verifying a returned payment.");

  const unrelatedPage = await newAuthedPage(browser, fixture.secondClient);
  const unrelatedStatus = await unrelatedPage.request.get(
    `/api/payments/status?txRef=${encodeURIComponent("DIRESKILL-DEMO-PAID")}`,
  );
  expect(unrelatedStatus.status()).toBe(403);
  await closeAuthedPage(unrelatedPage);

  const clientPage = await newAuthedPage(browser, fixture.client);
  const status = await clientPage.request.get(`/api/payments/status?txRef=${encodeURIComponent("DIRESKILL-DEMO-PAID")}`);
  expect(status.status()).toBe(200);
  expect((await status.json()).status).toBe("released");

  const duplicatePayment = await clientPage.request.post("/api/payments/chapa", {
    data: { jobId: fixture.jobRated, method: "telebirr" },
  });
  expect(duplicatePayment.status()).toBe(409);
  expect((await duplicatePayment.json()).error).toMatch(/already has a successful payment|only available after client-confirmed completion/i);
  await closeAuthedPage(clientPage);
});

test("ratings enforce paid participant-only one-rating-per-direction rules", async ({ browser }) => {
  const unrelatedPage = await newAuthedPage(browser, fixture.secondClient);
  const unrelatedRating = await unrelatedPage.request.post("/api/ratings", {
    data: { jobId: fixture.jobRated, ratedId: fixture.worker.id, score: 5, comment: "Not my job" },
  });
  expect(unrelatedRating.status()).toBe(403);
  await closeAuthedPage(unrelatedPage);

  const clientPage = await newAuthedPage(browser, fixture.client);
  const unpaidRating = await clientPage.request.post("/api/ratings", {
    data: { jobId: fixture.jobPayment, ratedId: fixture.worker.id, score: 5, comment: "Too early" },
  });
  expect(unpaidRating.status()).toBe(409);

  const duplicateClientRating = await clientPage.request.post("/api/ratings", {
    data: { jobId: fixture.jobRated, ratedId: fixture.worker.id, score: 4, comment: "Duplicate" },
  });
  expect(duplicateClientRating.status()).toBe(409);
  await closeAuthedPage(clientPage);

  const workerPage = await newAuthedPage(browser, fixture.worker);
  const workerRating = await workerPage.request.post("/api/ratings", {
    data: { jobId: fixture.jobRated, ratedId: fixture.client.id, score: 5, comment: "Good client" },
  });
  expect(workerRating.status()).toBe(201);

  const duplicateWorkerRating = await workerPage.request.post("/api/ratings", {
    data: { jobId: fixture.jobRated, ratedId: fixture.client.id, score: 5, comment: "Duplicate" },
  });
  expect(duplicateWorkerRating.status()).toBe(409);
  await closeAuthedPage(workerPage);
});
