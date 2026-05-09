const { neon } = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

async function run() {
  try {
    const rows = await sql`SELECT email, role FROM users WHERE role = 'admin'`;
    console.log(JSON.stringify(rows));
  } catch (err) {
    console.error(err);
  }
}
run();
