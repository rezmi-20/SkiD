const productionRequired = [
  "DATABASE_URL",
  "NEON_AUTH_BASE_URL",
  "NEON_AUTH_COOKIE_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "CORS_ALLOWED_ORIGINS",
  "CHAPA_SECRET_KEY",
] as const;

function isValid32ByteKey(value: string) {
  if (/^[a-f0-9]{64}$/i.test(value)) return true;
  try {
    const decoded = Buffer.from(value, "base64");
    return decoded.length === 32 && decoded.toString("base64").replace(/=+$/, "") === value.replace(/=+$/, "");
  } catch {
    return false;
  }
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isPlaceholder(value: string) {
  const lowered = value.toLowerCase();
  return ["changeme", "change-me", "placeholder", "your_", "your-", "example.", "dummy", "test-only", "replace-with"]
    .some((marker) => lowered.includes(marker));
}

export function validateProductionEnvironment() {
  if (process.env.VERCEL_ENV !== "production") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const missing: string[] = productionRequired.filter((name) => {
    const value = process.env[name]?.trim() || "";
    return !value || isPlaceholder(value);
  });
  const invalid: string[] = [];

  const databaseUrl = process.env.DATABASE_URL || "";
  try {
    const parsed = new URL(databaseUrl);
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") invalid.push("DATABASE_URL");
  } catch {
    invalid.push("DATABASE_URL");
  }

  for (const name of ["NEON_AUTH_BASE_URL", "NEXT_PUBLIC_APP_URL"] as const) {
    const value = process.env[name]?.trim();
    if (value && !isHttpsUrl(value)) invalid.push(name);
  }

  if (process.env.CHAPA_WEBHOOK_URL) {
    const value = process.env.CHAPA_WEBHOOK_URL.trim();
    if (isPlaceholder(value)) missing.push("CHAPA_WEBHOOK_URL");
    else if (!isHttpsUrl(value)) invalid.push("CHAPA_WEBHOOK_URL");
  }

  if ((process.env.NEON_AUTH_COOKIE_SECRET || "").length < 32) {
    invalid.push("NEON_AUTH_COOKIE_SECRET");
  }

  const origins = (process.env.CORS_ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean);
  if (origins.length === 0 || origins.some((origin) => origin.includes("*") || !isHttpsUrl(origin))) {
    invalid.push("CORS_ALLOWED_ORIGINS");
  }

  if (!isValid32ByteKey(process.env.FIN_HMAC_KEY || "")) invalid.push("FIN_HMAC_KEY");
  const ring = process.env.FIN_ENCRYPTION_KEYS || "";
  const encryptionKeysValid = ring
    ? ring.split(",").every((entry) => {
        const splitAt = entry.indexOf(":");
        return splitAt > 0 && isValid32ByteKey(entry.slice(splitAt + 1).trim());
      })
    : isValid32ByteKey(process.env.FIN_ENCRYPTION_KEY || "");
  if (!encryptionKeysValid) invalid.push("FIN_ENCRYPTION_KEYS or FIN_ENCRYPTION_KEY");

  const failures = [...new Set([...missing, ...invalid])];
  const dangerousFlags = [
    "ALLOW_DEV_ADMIN_SEED",
    "ALLOW_DEV_ADMIN_SEED_ACTIVE",
    "ALLOW_DEV_ADMIN_SEED_RESET",
    "ALLOW_LIVE_COMMUNITY_SAMPLE_SEED",
    "ALLOW_OWNER_ADMIN_RESET",
    "ALLOW_OWNER_EMPLOYEE_CONVERSION",
    "OWNER_ADMIN_RESET_EMERGENCY",
    "OWNER_EMPLOYEE_CONVERSION_EMERGENCY",
  ];
  for (const name of dangerousFlags) {
    if (process.env[name]?.trim().toLowerCase() === "true") failures.push(name);
  }
  if (failures.length > 0) {
    throw new Error(`Production environment is incomplete, invalid, or enables an unsafe maintenance flag: ${[...new Set(failures)].join(", ")}.`);
  }
}
