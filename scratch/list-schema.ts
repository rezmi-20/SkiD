import { neon } from "@neondatabase/serverless";

async function test() {
  const url = "postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  const sql = neon(url);
  try {
    const cols = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('users', 'worker_profiles', 'client_profiles')
    `;
    console.log("Database Columns:", cols);
  } catch (err) {
    console.error("DB Query Error:", err);
  }
}

test();
