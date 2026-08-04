import { randomBytes } from "node:crypto";
import { scryptSync } from "node:crypto";

const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,31}$/;

export function normalizeAdminUsername(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validateAdminUsername(value: unknown) {
  const username = normalizeAdminUsername(value);
  if (!username) return { ok: false as const, error: "Username is required." };
  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false as const,
      error: "Username must start with a letter and use 3-32 lowercase letters, numbers, or underscores.",
    };
  }
  return { ok: true as const, username };
}

export function validateStrongAdminPassword(value: unknown) {
  const password = typeof value === "string" ? value : "";
  if (password.length < 10) return { ok: false as const, error: "Password must be at least 10 characters." };
  if (!/[a-z]/.test(password)) return { ok: false as const, error: "Password must include a lowercase letter." };
  if (!/[A-Z]/.test(password)) return { ok: false as const, error: "Password must include an uppercase letter." };
  if (!/[0-9]/.test(password)) return { ok: false as const, error: "Password must include a number." };
  if (!/[^A-Za-z0-9]/.test(password)) return { ok: false as const, error: "Password must include a symbol." };
  return { ok: true as const, password };
}

export function generateTemporaryAdminPassword() {
  return `SkD-${randomBytes(12).toString("base64url")}-9!`;
}

export function generateTemporaryAdminUsername(email: string) {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^[^a-z]+/, "a")
    .slice(0, 20)
    || "admin";
  return `${base}_${randomBytes(3).toString("hex")}`.slice(0, 32);
}

export async function hashBetterAuthPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${Buffer.from(key).toString("hex")}`;
}

export async function verifyBetterAuthPassword(hash: string | null | undefined, password: string) {
  if (!hash) return false;
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const candidate = scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return Buffer.from(candidate).equals(Buffer.from(key, "hex"));
}
