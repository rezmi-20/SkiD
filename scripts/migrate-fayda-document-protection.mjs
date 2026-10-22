import { config } from "dotenv";
import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const prefix = "fayda-document:enc:v1:";
const dryRun = process.argv.includes("--dry-run");

function parseKeyMaterial(value, label) {
  const trimmed = value.trim();
  const base64 = Buffer.from(trimmed, "base64");
  if (base64.length === 32) return base64;
  const hex = Buffer.from(trimmed, "hex");
  if (hex.length === 32) return hex;
  throw new Error(`${label} must be a 32-byte base64 or hex encoded secret.`);
}

function getActiveKey() {
  const configured = process.env.FIN_ENCRYPTION_KEYS;
  if (configured) {
    const [entry] = configured.split(",").map((part) => part.trim()).filter(Boolean);
    const separator = entry.indexOf(":");
    if (separator > 0) {
      const id = entry.slice(0, separator);
      return { id, key: parseKeyMaterial(entry.slice(separator + 1), `FIN_ENCRYPTION_KEYS ${id}`) };
    }
    throw new Error("FIN_ENCRYPTION_KEYS must use keyId:secret entries.");
  }
  if (!process.env.FIN_ENCRYPTION_KEY) throw new Error("FIN encryption key is not configured.");
  return {
    id: process.env.FIN_ENCRYPTION_KEY_ID || "v1",
    key: parseKeyMaterial(process.env.FIN_ENCRYPTION_KEY, "FIN_ENCRYPTION_KEY"),
  };
}

function encryptDocument(value, userId, scope, activeKey) {
  if (typeof value !== "string" || !value.trim() || value.startsWith(prefix)) return value;
  const aad = Buffer.from(`fayda-document:${scope}:${userId}`, "utf8");
  const derivedKey = Buffer.from(crypto.hkdfSync(
    "sha256",
    activeKey.key,
    Buffer.from("dire-skill/fayda-document/v1", "utf8"),
    aad,
    32,
  ));
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey, iv);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const payload = {
    alg: "A256GCM",
    keyId: activeKey.id,
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
  };
  return `${prefix}${Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")}`;
}

const activeKey = getActiveKey();
let migrated = 0;
let alreadyProtected = 0;

for (const { table, scope } of [
  { table: "worker_profiles", scope: "worker" },
  { table: "client_profiles", scope: "client" },
]) {
  const rows = await sql.query(
    `SELECT user_id, fayda_doc_url FROM ${table} WHERE fayda_doc_url IS NOT NULL AND fayda_doc_url <> ''`,
  );
  let tableMigrated = 0;
  let tableAlreadyProtected = 0;
  for (const row of rows) {
    if (row.fayda_doc_url.startsWith(prefix)) {
      tableAlreadyProtected += 1;
      continue;
    }
    const protectedValue = encryptDocument(row.fayda_doc_url, row.user_id, scope, activeKey);
    if (!dryRun) {
      await sql.query(
        `UPDATE ${table} SET fayda_doc_url = $1 WHERE user_id = $2 AND fayda_doc_url = $3`,
        [protectedValue, row.user_id, row.fayda_doc_url],
      );
    }
    tableMigrated += 1;
  }
  migrated += tableMigrated;
  alreadyProtected += tableAlreadyProtected;
  console.log(`${dryRun ? "PLAN" : "DONE"} ${table}: encrypt=${tableMigrated}, protected=${tableAlreadyProtected}`);
}

console.log(`${dryRun ? "Dry run" : "Migration"} complete. encrypt=${migrated}, protected=${alreadyProtected}`);
