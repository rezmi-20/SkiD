import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

if (!process.env.DATABASE_URL) {
  console.error("MISSING database connection environment");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const sql = neon(process.env.DATABASE_URL);
const migration = readFileSync(resolve(process.cwd(), "drizzle/0019_worker_training_certificates.sql"), "utf8");
const statements = migration.split(";").map((statement) => statement.trim()).filter(Boolean);

async function executeStatement(statement) {
  try {
    return await sql.query(statement);
  } catch (err) {
    // If local Windows environment has undici fetch timeout/TLS renegotiation issues,
    // fallback to executing against Neon HTTP endpoint via curl with native Schannel
    const dbUrl = new URL(process.env.DATABASE_URL);
    const endpoint = `https://${dbUrl.hostname}/sql`;
    const payload = JSON.stringify({ query: statement, params: [] });
    const resultRaw = execFileSync("curl.exe", [
      "-s",
      "-X", "POST",
      endpoint,
      "-H", `Neon-Connection-String: ${process.env.DATABASE_URL}`,
      "-H", "Content-Type: application/json",
      "--data-binary", payload,
    ], { encoding: "utf8" });
    const parsed = JSON.parse(resultRaw);
    if (parsed.message) {
      throw new Error(parsed.message);
    }
    return parsed;
  }
}

for (const statement of statements) {
  const label = statement.split("\n")[0].slice(0, 100);
  if (dryRun) {
    console.log(`PLAN ${label}`);
    continue;
  }
  await executeStatement(statement);
  console.log(`PASS ${label}`);
}

console.log(dryRun ? "Dry-run complete. No schema changed." : "Worker certificate migration complete.");
