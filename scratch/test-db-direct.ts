import { neon } from "@neondatabase/serverless";

async function test() {
  const url = "postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  const sql = neon(url);
  try {
    const res = await sql`SELECT NOW()`;
    console.log("DB Connection Success:", res);
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
}

test();
