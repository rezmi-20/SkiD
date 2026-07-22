import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

const args = new Set(process.argv.slice(2));
const failures = [];

function valueOf(name) {
  return String(process.env[name] || "").trim();
}

function fail(message) {
  failures.push(message);
  console.error(`MISSING ${message}`);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function isProduction() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

function requireUrl(name) {
  const value = valueOf(name);
  if (!value) {
    fail(`${name}: not configured`);
    return null;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") fail(`${name}: must use HTTPS`);
    if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) fail(`${name}: localhost is not allowed`);
    return url.toString();
  } catch {
    fail(`${name}: invalid URL`);
    return null;
  }
}

if (isProduction()) {
  fail("sandbox payment test refuses to run in production");
}

if (!args.has("--run")) {
  fail("explicit --run flag is required");
}

if (valueOf("CHAPA_SANDBOX") !== "true") {
  fail("CHAPA_SANDBOX=true is required");
}

if (valueOf("CHAPA_SANDBOX_ALLOW_NETWORK") !== "1") {
  fail("CHAPA_SANDBOX_ALLOW_NETWORK=1 is required before making an external request");
}

const secretKey = valueOf("CHAPA_SECRET_KEY");
if (!secretKey) fail("CHAPA_SECRET_KEY: not configured");

const webhookUrl = requireUrl("CHAPA_WEBHOOK_URL");
const returnUrl = requireUrl("NEXT_PUBLIC_APP_URL");
const amount = Number(valueOf("CHAPA_SANDBOX_LOW_VALUE_AMOUNT") || "1");
if (!Number.isFinite(amount) || amount <= 0 || amount > 10) {
  fail("CHAPA_SANDBOX_LOW_VALUE_AMOUNT: must be a low value between 1 and 10 ETB");
}

if (failures.length > 0) {
  console.error("Sandbox payment test refused to run.");
  process.exit(1);
}

const txRef = `DIRESKILL-SANDBOX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

pass("sandbox guard checks");

const initResponse = await fetch("https://api.chapa.co/v1/transaction/initialize", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: String(amount),
    currency: "ETB",
    email: "sandbox-smoke@example.test",
    first_name: "DireSkill",
    last_name: "Sandbox",
    tx_ref: txRef,
    callback_url: webhookUrl,
    return_url: `${returnUrl.replace(/\/$/, "")}/payment-success?tx_ref=${encodeURIComponent(txRef)}`,
    customization: {
      title: "DireSkill Sandbox",
      description: "Low-value sandbox payment validation",
    },
  }),
});

const initPayload = await initResponse.json().catch(() => null);
if (!initResponse.ok || initPayload?.status !== "success") {
  console.error("MISSING Chapa sandbox initialization failed");
  process.exit(1);
}
pass("Chapa sandbox transaction initialized");

const verifyResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
  headers: {
    Authorization: `Bearer ${secretKey}`,
  },
});

const verifyPayload = await verifyResponse.json().catch(() => null);
if (!verifyResponse.ok || !verifyPayload) {
  console.error("MISSING Chapa server-to-server verification failed");
  process.exit(1);
}

pass("Chapa server-to-server verification returned a response");
console.log("Sandbox payment test completed without modifying local payment state.");
