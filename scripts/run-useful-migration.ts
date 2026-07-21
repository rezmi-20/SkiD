import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run() {
  console.log("🔄 Running migration: add useful/not_useful columns to community_posts...");
  try {
    await sql`
      ALTER TABLE community_posts 
      ADD COLUMN IF NOT EXISTS useful_count INTEGER NOT NULL DEFAULT 0
    `;
    await sql`
      ALTER TABLE community_posts 
      ADD COLUMN IF NOT EXISTS not_useful_count INTEGER NOT NULL DEFAULT 0
    `;
    console.log("✅ Migration complete! Columns 'useful_count' and 'not_useful_count' added successfully.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

run();
