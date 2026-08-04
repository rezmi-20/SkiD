import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ||= ".ms-playwright";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const parsedBaseUrl = new URL(baseURL);
const webServerHost = parsedBaseUrl.hostname;
const webServerPort = parsedBaseUrl.port || (parsedBaseUrl.protocol === "https:" ? "443" : "80");
const chromiumExecutable = resolve(
  process.cwd(),
  ".ms-playwright",
  "chromium-1228",
  "chrome-win64",
  "chrome.exe",
);

if (!existsSync(chromiumExecutable)) {
  throw new Error(
    `Playwright Chromium not found at ${chromiumExecutable}. The browser cache must contain chrome.exe in .ms-playwright/chromium-1228/chrome-win64/.`,
  );
}

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL,
    launchOptions: {
      executablePath: chromiumExecutable,
    },
    trace: "on-first-retry",
  },
  webServer: {
    command: `npx next dev --hostname ${webServerHost} --port ${webServerPort}`,
    url: baseURL,
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "true",
    timeout: 120000,
  },
});
