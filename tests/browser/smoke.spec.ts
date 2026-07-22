import { expect, test, type Browser, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import { DEMO_IDS } from "../../scripts/demo-data-fixtures.mjs";

const sessionSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!sessionSecret) throw new Error("NEON_AUTH_COOKIE_SECRET is required for browser smoke tests.");

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const sessionCookieName = "neon-auth.local.session_data";
const fixture = {
  admin: { id: DEMO_IDS.admin, email: "demo.admin@direskill.local", role: "admin" },
  client: { id: DEMO_IDS.client, email: "demo.client@direskill.local", role: "client" },
  worker: { id: DEMO_IDS.worker, email: "demo.worker@direskill.local", role: "worker" },
  unverifiedWorker: { id: DEMO_IDS.unverifiedWorker, email: "demo.unverified@direskill.local", role: "worker" },
  unrelated: { id: randomUUID(), email: `browser-unrelated-${randomUUID()}@example.test`, role: "client" },
  jobPending: DEMO_IDS.jobPending,
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

async function newAuthedPage(browser: Browser, user: { id: string; email: string; role: string }) {
  const context = await browser.newContext({ baseURL });
  await context.addCookies([
    {
      name: sessionCookieName,
      value: await createSessionCookie(user),
      url: baseURL,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  return context.newPage();
}

async function closeAuthedPage(page: Page) {
  await page.context().close();
}

test.describe.configure({ mode: "serial" });

test("authentication and public pages load", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Sign In", exact: true })).toBeVisible();

  for (const route of ["/client/dashboard", "/worker/dashboard", "/admin/dashboard"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
  }

  await page.goto("/");
  await expect(page.locator("body")).toContainText("DireSkill");

  await page.goto("/register/client");
  await expect(page.getByRole("button", { name: "Create Client Account" })).toBeVisible();

  await page.goto("/register/worker");
  await expect(page.getByRole("heading", { name: "Identity Details" })).toBeVisible();

  await page.goto("/otp-verification?email=browser@example.test");
  await expect(page.getByRole("heading", { name: "Verify Your Email" })).toBeVisible();
});

test("authenticated roles reach their dashboards and wrong roles are denied", async ({ browser }) => {
  let page = await newAuthedPage(browser, fixture.client);
  await page.goto("/client/dashboard");
  await expect(page.locator("body")).toContainText("Hire Verified");
  await closeAuthedPage(page);

  page = await newAuthedPage(browser, fixture.worker);
  await page.goto("/worker/dashboard");
  await expect(page.locator("body")).toContainText("Professional Workbench");
  await closeAuthedPage(page);

  page = await newAuthedPage(browser, fixture.admin);
  await page.goto("/admin/dashboard");
  await expect(page.locator("body")).toContainText("Admin Command Center");
  await closeAuthedPage(page);

  page = await newAuthedPage(browser, fixture.client);
  await page.goto("/worker/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await closeAuthedPage(page);

  page = await newAuthedPage(browser, fixture.worker);
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await closeAuthedPage(page);
});

test("core workflow pages render with correct role and state gates", async ({ browser }) => {
  const clientPage = await newAuthedPage(browser, fixture.client);

  await clientPage.goto(`/client/contract/new?workerId=${fixture.worker.id}`);
  await expect(clientPage.getByRole("heading", { name: "Start Hiring" })).toBeVisible();
  await expect(clientPage.getByRole("button", { name: "Send Hiring Invitation" })).toBeVisible();

  await clientPage.goto("/client/search");
  await expect(clientPage.locator("body")).toContainText("DEMO - Yusuf Electrician");
  await expect(clientPage.locator("body")).not.toContainText("DEMO - Pending Worker");

  await clientPage.goto(`/client/worker/${fixture.worker.id}`);
  await expect(clientPage.locator("body")).toContainText("DEMO - Yusuf Electrician");
  await expect(clientPage.locator("body")).not.toContainText(fixture.worker.email);
  const workerDetailResponse = await clientPage.request.get(`/api/workers/${fixture.worker.id}`);
  expect(workerDetailResponse.status()).toBe(200);
  expect(JSON.stringify(await workerDetailResponse.json())).not.toContain(fixture.worker.email);

  await clientPage.goto(`/client/contracts/${fixture.contractPayment}`);
  await expect(clientPage.locator("body")).toContainText("Service Agreement");

  await clientPage.goto(`/client/pay/${fixture.jobPayment}`);
  await expect(clientPage.getByRole("button", { name: /Pay/ })).toBeVisible();

  await clientPage.goto(`/client/rate/${fixture.jobRated}`);
  await expect(clientPage.getByRole("button", { name: "Submit Review" })).toBeVisible();

  await closeAuthedPage(clientPage);

  const workerPage = await newAuthedPage(browser, fixture.worker);
  await workerPage.goto("/worker/dashboard");
  await expect(workerPage.locator("body")).toContainText("DEMO - Pending outlet repair");

  await workerPage.goto("/worker/gigs");
  await expect(workerPage.locator("body")).toContainText("DEMO - In-progress breaker replacement");
  await expect(workerPage.getByRole("button", { name: /Mark Complete/ })).toBeVisible();
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
    await clientPage.goto("/client/dashboard");
    await expect(clientPage.locator("body")).toContainText("Hire Verified");
    await clientPage.goto(`/client/contract/new?workerId=${fixture.worker.id}`);
    await expect(clientPage.getByRole("heading", { name: "Start Hiring" })).toBeVisible();
    await closeAuthedPage(clientPage);

    const workerPage = await newAuthedPage(browser, fixture.worker);
    await workerPage.setViewportSize(viewport);
    await workerPage.goto("/worker/gigs");
    await expect(workerPage.locator("body")).toContainText("DEMO - In-progress breaker replacement");
    await closeAuthedPage(workerPage);

    const adminPage = await newAuthedPage(browser, fixture.admin);
    await adminPage.setViewportSize(viewport);
    await adminPage.goto("/admin/verify");
    await expect(adminPage.locator("body")).toContainText("DEMO - Pending Worker");
    await closeAuthedPage(adminPage);
  }
});

test("security smoke checks block removed and unauthorized resources", async ({ browser, page }) => {
  for (const route of ["/api/auth/debug-session", "/api/diag", "/diag", "/test-new-update"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
  }

  const unrelatedPage = await newAuthedPage(browser, fixture.unrelated);
  const contractResponse = await unrelatedPage.goto(`/contracts/${fixture.contractPayment}`);
  expect([403, 404]).toContain(contractResponse?.status());

  const receiptResponse = await unrelatedPage.request.get(`/api/payments/${fixture.paymentReleased}/receipt`);
  expect(receiptResponse.status()).toBe(403);
  await closeAuthedPage(unrelatedPage);

  const clientPage = await newAuthedPage(browser, fixture.client);
  const hiddenWorkerResponse = await clientPage.request.get(`/api/workers/${fixture.unverifiedWorker.id}`);
  expect(hiddenWorkerResponse.status()).toBe(404);
  await closeAuthedPage(clientPage);
});
