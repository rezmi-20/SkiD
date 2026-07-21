import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: resolve(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const migration = readFileSync(resolve(process.cwd(), "drizzle/0006_add_contract_status.sql"), "utf8")
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

try {
  for (const statement of migration) {
    await sql.query(statement);
  }

  const columns = await sql.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'contracts'
      AND column_name = 'status'
  `);

  console.log(JSON.stringify(columns, null, 2));
} catch (error) {
  console.error(error);
  process.exit(1);
}
