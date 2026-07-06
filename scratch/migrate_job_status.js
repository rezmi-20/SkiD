const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local!");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log("Starting DB migration for job_status enum...");
  try {
    // Check current type values first if possible, or use ALTER TYPE which throws if value exists (unless we check or ignore errors)
    try {
      await sql`ALTER TYPE job_status ADD VALUE 'accepted'`;
      console.log("Added 'accepted' to job_status enum.");
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log("'accepted' already exists in job_status enum.");
      } else {
        throw e;
      }
    }

    try {
      await sql`ALTER TYPE job_status ADD VALUE 'rejected'`;
      console.log("Added 'rejected' to job_status enum.");
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log("'rejected' already exists in job_status enum.");
      } else {
        throw e;
      }
    }

    try {
      await sql`ALTER TYPE job_status ADD VALUE 'in_progress'`;
      console.log("Added 'in_progress' to job_status enum.");
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log("'in_progress' already exists in job_status enum.");
      } else {
        throw e;
      }
    }

    console.log("Database Migration Completed Successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
