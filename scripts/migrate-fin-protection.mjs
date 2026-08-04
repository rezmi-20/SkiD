import "dotenv/config";
import { config as loadEnv } from "dotenv";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

loadEnv({ path: ".env.local", override: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const sql = neon(databaseUrl);
const migrationSql = fs.readFileSync(path.join(process.cwd(), "drizzle", "0013_fin_protection.sql"), "utf8");

function splitStatements(input) {
  const stripped = input
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  return stripped
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean)
    .filter((statement) => statement.length > 0);
}

async function applySchemaMigration() {
  const statements = splitStatements(migrationSql);
  if (dryRun) {
    console.log(`PLANNED schema statements=${statements.length}`);
    for (const statement of statements) {
      console.log(`PLAN ${statement.split(/\s+/).slice(0, 8).join(" ")}`);
    }
    return;
  }

  for (const statement of statements) {
    await sql.query(statement);
  }
}

function parseKeyMaterial(value, label) {
  const trimmed = value.trim();
  const base64 = Buffer.from(trimmed, "base64");
  if (base64.length === 32) return base64;

  const hex = Buffer.from(trimmed, "hex");
  if (hex.length === 32) return hex;

  throw new Error(`${label} must be a 32-byte base64 or hex encoded secret.`);
}

function validateFin(value) {
  const fin = typeof value === "string" ? value.replace(/\D/g, "") : "";
  return /^\d{12}$/.test(fin) ? fin : null;
}

function activeEncryptionKey() {
  const configured = process.env.FIN_ENCRYPTION_KEYS;
  if (configured) {
    const [entry] = configured.split(",").map((value) => value.trim()).filter(Boolean);
    const [id, key] = entry.split(":");
    if (id && key) return { id, key: parseKeyMaterial(key, `FIN_ENCRYPTION_KEYS ${id}`) };
  }

  if (!process.env.FIN_ENCRYPTION_KEY) throw new Error("FIN encryption key is not configured.");
  return {
    id: process.env.FIN_ENCRYPTION_KEY_ID || "v1",
    key: parseKeyMaterial(process.env.FIN_ENCRYPTION_KEY, "FIN_ENCRYPTION_KEY"),
  };
}

function finFingerprint(fin) {
  if (!process.env.FIN_HMAC_KEY) throw new Error("FIN_HMAC_KEY is not configured.");
  return crypto
    .createHmac("sha256", parseKeyMaterial(process.env.FIN_HMAC_KEY, "FIN_HMAC_KEY"))
    .update(fin)
    .digest("hex");
}

function protectFin(fin, userId) {
  const activeKey = activeEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", activeKey.key, iv);
  cipher.setAAD(Buffer.from(`profile:${userId}`, "utf8"));
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

async function tableHasColumn(table, column) {
  const rows = await sql`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
      AND column_name = ${column}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function migrateTable(table) {
  const hasLegacyColumn = await tableHasColumn(table, "fayda_fan_number");
  if (!hasLegacyColumn) {
    console.log(`SKIP ${table}: no legacy plaintext column`);
    return { migrated: 0, skipped: 0 };
  }

  const rows = await sql(
    `SELECT user_id, fayda_fan_number FROM ${table} WHERE fayda_fan_number IS NOT NULL AND fin_encrypted IS NULL`
  );

  let migrated = 0;
  let skipped = 0;

  for (const row of rows) {
    const fin = validateFin(row.fayda_fan_number);
    if (!fin) {
      skipped += 1;
      console.warn(`SKIP ${table}: invalid legacy FIN for user ${row.user_id}`);
      continue;
    }

    if (dryRun) {
      migrated += 1;
      continue;
    }

    const protectedFin = protectFin(fin, row.user_id);
    await sql(
      `UPDATE ${table}
       SET fin_encrypted = $1,
           fin_encryption_key_id = $2,
           fin_fingerprint = $3,
           fin_last4 = $4
       WHERE user_id = $5`,
      [
        protectedFin.finEncrypted,
        protectedFin.finEncryptionKeyId,
        protectedFin.finFingerprint,
        protectedFin.finLast4,
        row.user_id,
      ],
    );
    migrated += 1;
  }

  if (!dryRun && skipped === 0) {
    await sql(`ALTER TABLE ${table} DROP COLUMN IF EXISTS fayda_fan_number`);
  } else if (!dryRun) {
    console.warn(`KEEP ${table}: legacy plaintext column retained because ${skipped} row(s) need manual review`);
  }

  return { migrated, skipped };
}

console.log(dryRun ? "FIN protection migration dry-run" : "FIN protection migration");
await applySchemaMigration();
const worker = await migrateTable("worker_profiles");
const client = await migrateTable("client_profiles");

console.log(`worker_profiles migrated=${worker.migrated} skipped=${worker.skipped}`);
console.log(`client_profiles migrated=${client.migrated} skipped=${client.skipped}`);
console.log(dryRun ? "Dry-run complete. No data or schema was changed." : "Migration complete. Plaintext FIN columns removed.");
