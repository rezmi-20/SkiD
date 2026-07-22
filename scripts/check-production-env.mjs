const required = [
  "DATABASE_URL",
  "NEON_AUTH_BASE_URL",
  "NEON_AUTH_COOKIE_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "CORS_ALLOWED_ORIGINS",
  "CHAPA_SECRET_KEY",
  "CHAPA_WEBHOOK_URL",
];

const optional = [
  "BASE_URL",
  "NEXT_PUBLIC_BASE_URL",
  "WEBHOOK_URL",
  "CHAPA_WEBHOOK_SECRET",
  "NEXT_PUBLIC_CHAPA_PUBLIC_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const sandboxOnly = [
  "CHAPA_SANDBOX",
  "CHAPA_SANDBOX_ALLOW_NETWORK",
  "CHAPA_SANDBOX_LOW_VALUE_AMOUNT",
];

const failures = [];
const warnings = [];

function valueOf(name) {
  return String(process.env[name] || "").trim();
}

function hasValue(name) {
  return valueOf(name).length > 0;
}

function isPlaceholder(value) {
  const lowered = value.toLowerCase();
  return (
    lowered === "changeme" ||
    lowered === "change-me" ||
    lowered === "placeholder" ||
    lowered.includes("your_") ||
    lowered.includes("your-") ||
    lowered.includes("<") ||
    lowered.includes("example.com") ||
    lowered.includes("example.test") ||
    lowered.includes("dummy") ||
    lowered.includes("test-only")
  );
}

function isLocalhostUrl(value) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function report(status, label) {
  console.log(`${status} ${label}`);
}

function fail(label) {
  failures.push(label);
  report("MISSING", label);
}

function pass(label) {
  report("PASS", label);
}

function warn(label) {
  warnings.push(label);
  report("WARNING", label);
}

console.log("Required production variables:");
for (const name of required) {
  const value = valueOf(name);
  if (!value) {
    fail(`${name}: not configured`);
    continue;
  }
  if (isPlaceholder(value)) {
    fail(`${name}: placeholder value`);
    continue;
  }
  pass(name);
}

console.log("Optional variables:");
for (const name of optional) {
  const value = valueOf(name);
  if (!value) {
    warn(`${name}: not configured`);
    continue;
  }
  if (isPlaceholder(value)) {
    fail(`${name}: placeholder value`);
    continue;
  }
  pass(name);
}

console.log("Sandbox-only variables:");
for (const name of sandboxOnly) {
  if (hasValue(name)) {
    warn(`${name}: present; verify this is not a production deployment`);
  } else {
    pass(`${name}: absent`);
  }
}

const appUrls = ["NEXT_PUBLIC_APP_URL", "BASE_URL", "NEXT_PUBLIC_BASE_URL"].filter(hasValue);
for (const name of appUrls) {
  const value = valueOf(name);
  if (isLocalhostUrl(value)) fail(`${name}: localhost is not allowed in production`);
  else if (!isHttpsUrl(value)) fail(`${name}: must be HTTPS in production`);
}

const callbackUrls = ["CHAPA_WEBHOOK_URL", "WEBHOOK_URL"].filter(hasValue);
for (const name of callbackUrls) {
  const value = valueOf(name);
  if (isLocalhostUrl(value)) fail(`${name}: localhost is not allowed in production callbacks`);
  else if (!isHttpsUrl(value)) fail(`${name}: production callbacks must be HTTPS`);
}

const authBaseUrl = valueOf("NEON_AUTH_BASE_URL");
if (authBaseUrl && (isLocalhostUrl(authBaseUrl) || !isHttpsUrl(authBaseUrl))) {
  fail("NEON_AUTH_BASE_URL: must be an HTTPS production auth endpoint");
}

const corsOrigins = valueOf("CORS_ALLOWED_ORIGINS")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

if (corsOrigins.some((origin) => origin === "*" || origin.includes("*"))) {
  fail("CORS_ALLOWED_ORIGINS: wildcard origins are not allowed with credentials");
}

for (const origin of corsOrigins) {
  if (isLocalhostUrl(origin)) fail("CORS_ALLOWED_ORIGINS: localhost origin is not allowed in production");
  else if (!isHttpsUrl(origin)) fail("CORS_ALLOWED_ORIGINS: origins must be HTTPS in production");
}

const chapaSecret = valueOf("CHAPA_SECRET_KEY");
const chapaPublicKey = valueOf("NEXT_PUBLIC_CHAPA_PUBLIC_KEY");
if (/test|sandbox/i.test(chapaSecret)) {
  fail("CHAPA_SECRET_KEY: identifiable sandbox credential in production");
}
if (/test|sandbox/i.test(chapaPublicKey)) {
  fail("NEXT_PUBLIC_CHAPA_PUBLIC_KEY: identifiable sandbox credential in production");
}

if (valueOf("NEON_AUTH_COOKIE_SECRET").length < 32) {
  fail("NEON_AUTH_COOKIE_SECRET: must be at least 32 characters");
}

if (warnings.length > 0) {
  console.log(`Warnings: ${warnings.length}`);
}

if (failures.length > 0) {
  console.error(`Production environment check failed: ${failures.length} unsafe item(s).`);
  process.exit(1);
}

console.log("Production environment check passed.");
