import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

if (!process.env.DATABASE_URL) {
  console.error("MISSING database connection environment");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const sql = neon(process.env.DATABASE_URL);
const migration = readFileSync(resolve(process.cwd(), "drizzle/0018_verification_operations.sql"), "utf8");

function splitSqlStatements(source) {
  const statements = [];
  let statement = "";
  let dollarQuote = null;

  for (let index = 0; index < source.length; index += 1) {
    const rest = source.slice(index);

    if (!dollarQuote && rest.startsWith("--")) {
      const newline = source.indexOf("\n", index);
      if (newline === -1) break;
      index = newline;
      statement += "\n";
      continue;
    }

    if (rest.startsWith("$")) {
      const match = rest.match(/^\$[A-Za-z0-9_]*\$/);
      if (match && (!dollarQuote || match[0] === dollarQuote)) {
        dollarQuote = dollarQuote ? null : match[0];
        statement += match[0];
        index += match[0].length - 1;
        continue;
      }
    }

    const char = source[index];
    if (char === ";" && !dollarQuote) {
      const trimmed = statement.trim();
      if (trimmed) statements.push(trimmed);
      statement = "";
      continue;
    }
    statement += char;
  }

  const trimmed = statement.trim();
  if (trimmed) statements.push(trimmed);
  return statements;
}

const statements = splitSqlStatements(migration);

for (const statement of statements) {
  const label = statement.split("\n")[0].slice(0, 100);
  if (dryRun) {
    console.log(`PLAN ${label}`);
    continue;
  }
  await sql.query(statement);
  console.log(`PASS ${label}`);
}

console.log(dryRun ? "Dry-run complete. No schema changed." : "Verification operations migration complete.");
