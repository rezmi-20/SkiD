import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import dns from "node:dns";
import { Agent, setGlobalDispatcher } from "undici";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

if (!process.env.DATABASE_URL) {
  console.error("MISSING DATABASE_URL");
  process.exit(1);
}

if (typeof dns?.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

const agent = new Agent({
  connect: {
    lookup: (hostname, options, callback) => {
      dns.resolve4(hostname, (err, addresses) => {
        if (err || !addresses?.length) {
          return dns.lookup(hostname, options, callback);
        }
        const valid = addresses.filter((ip) => !ip.startsWith("100.") && !ip.startsWith("205."));
        const targetIp = valid[0] || addresses[0];
        if (options && options.all) {
          callback(null, [{ address: targetIp, family: 4 }]);
        } else {
          callback(null, targetIp, 4);
        }
      });
    },
    timeout: 30000,
  },
});
setGlobalDispatcher(agent);

const sql = neon(process.env.DATABASE_URL);
const migration = readFileSync(resolve(process.cwd(), "drizzle/0023_audit_ledger_integrity.sql"), "utf8");

function splitStatements(content) {
  // Strip comments
  const lines = content.split("\n").filter((l) => !l.trim().startsWith("--"));
  const joined = lines.join("\n");
  
  // Custom statement splitter that respects PL/pgSQL $$ blocks
  const statements = [];
  let current = "";
  let inDollar = false;

  for (let i = 0; i < joined.length; i++) {
    const char = joined[i];
    const nextChar = joined[i + 1];

    if (char === "$" && nextChar === "$") {
      inDollar = !inDollar;
      current += "$$";
      i++;
      continue;
    }

    if (char === ";" && !inDollar) {
      if (current.trim()) {
        statements.push(current.trim());
      }
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

async function executeStatement(statement) {
  try {
    return await sql.query(statement);
  } catch (err) {
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

async function main() {
  const statements = splitStatements(migration);
  console.log(`Applying ${statements.length} migration statements...`);

  for (const statement of statements) {
    const label = statement.split("\n")[0].slice(0, 80);
    await executeStatement(statement);
    console.log(`PASS: ${label}...`);
  }

  console.log("Migration 0023_audit_ledger_integrity applied successfully!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
