/**
 * Run this script once to apply the is_suspended migration to your Neon database.
 * Usage: npx tsx scripts/run-migration.ts
 */
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log("🔄 Running migration: add is_suspended to users...");
  try {
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE
    `;
    console.log("✅ Migration complete! Column 'is_suspended' added to users table.");

    // Verify
    const result = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'is_suspended'
    `;
    if (result.length > 0) {
      console.log("✅ Verified:", result[0]);
    } else {
      console.log("⚠️  Column check returned empty — but ALTER ran without error.");
    }
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
