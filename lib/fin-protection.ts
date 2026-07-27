import crypto from "node:crypto";

export type ProtectedFin = {
  finEncrypted: string;
  finEncryptionKeyId: string;
  finFingerprint: string;
  finLast4: string;
};

type FinKey = {
  id: string;
  key: Buffer;
};

const FIN_DIGITS = /^\d{12}$/;
const FIN_MASK_PREFIX = "********";

function parseKeyMaterial(value: string, label: string) {
  const trimmed = value.trim();
  const base64 = Buffer.from(trimmed, "base64");
  if (base64.length === 32) return base64;

  const hex = Buffer.from(trimmed, "hex");
  if (hex.length === 32) return hex;

  throw new Error(`${label} must be a 32-byte base64 or hex encoded secret.`);
}

function getEncryptionKeys(): FinKey[] {
  const configured = process.env.FIN_ENCRYPTION_KEYS;
  if (configured) {
    const keys = configured
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [id, value] = entry.split(":");
        if (!id || !value) {
          throw new Error("FIN_ENCRYPTION_KEYS entries must use keyId:secret format.");
        }
        return { id, key: parseKeyMaterial(value, `FIN_ENCRYPTION_KEYS ${id}`) };
      });

    if (keys.length > 0) return keys;
  }

  const fallback = process.env.FIN_ENCRYPTION_KEY;
  if (!fallback) {
    throw new Error("FIN encryption key is not configured.");
  }

  return [{
    id: process.env.FIN_ENCRYPTION_KEY_ID || "v1",
    key: parseKeyMaterial(fallback, "FIN_ENCRYPTION_KEY"),
  }];
}

function getActiveEncryptionKey() {
  return getEncryptionKeys()[0];
}

function getEncryptionKeyById(keyId: string) {
  const key = getEncryptionKeys().find((candidate) => candidate.id === keyId);
  if (!key) {
    throw new Error("FIN encryption key version is not configured.");
  }
  return key;
}

function getHmacKey() {
  const configured = process.env.FIN_HMAC_KEY;
  if (!configured) {
    throw new Error("FIN_HMAC_KEY is not configured.");
  }
  return parseKeyMaterial(configured, "FIN_HMAC_KEY");
}

export function normalizeFin(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

export function validateFin(value: unknown) {
  const normalized = normalizeFin(value);
  return FIN_DIGITS.test(normalized) ? normalized : null;
}

export function maskFin(value: unknown) {
  const normalized = normalizeFin(value);
  if (!FIN_DIGITS.test(normalized)) return null;
  return `${FIN_MASK_PREFIX}${normalized.slice(-4)}`;
}

export function maskFinLast4(last4: unknown) {
  const digits = typeof last4 === "string" ? last4.replace(/\D/g, "") : "";
  if (!/^\d{4}$/.test(digits)) return null;
  return `${FIN_MASK_PREFIX}${digits}`;
}

function associatedData(userId: string, scope: string) {
  return Buffer.from(`${scope}:${userId}`, "utf8");
}

export function finFingerprint(fin: string) {
  return crypto.createHmac("sha256", getHmacKey()).update(fin).digest("hex");
}

export function protectFin(value: unknown, userId: string, scope = "profile"): ProtectedFin {
  const fin = validateFin(value);
  if (!fin) {
    throw new Error("FIN must be exactly 12 digits.");
  }

  const activeKey = getActiveEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", activeKey.key, iv);
  cipher.setAAD(associatedData(userId, scope));

  const encrypted = Buffer.concat([cipher.update(fin, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    finEncrypted: JSON.stringify({
      alg: "A256GCM",
      iv: iv.toString("base64url"),
      tag: tag.toString("base64url"),
      ciphertext: encrypted.toString("base64url"),
    }),
    finEncryptionKeyId: activeKey.id,
    finFingerprint: finFingerprint(fin),
    finLast4: fin.slice(-4),
  };
}

export function decryptFin(input: {
  finEncrypted: string;
  finEncryptionKeyId: string;
  userId: string;
  scope?: string;
}) {
  const parsed = JSON.parse(input.finEncrypted);
  if (parsed?.alg !== "A256GCM") {
    throw new Error("Unsupported FIN ciphertext format.");
  }

  const key = getEncryptionKeyById(input.finEncryptionKeyId);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key.key,
    Buffer.from(parsed.iv, "base64url"),
  );
  decipher.setAAD(associatedData(input.userId, input.scope || "profile"));
  decipher.setAuthTag(Buffer.from(parsed.tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(parsed.ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
