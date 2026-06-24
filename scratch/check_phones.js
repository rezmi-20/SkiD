require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const users = await sql`SELECT id, email, phone FROM users ORDER BY created_at DESC LIMIT 5`;
  console.log(users);
}
main().catch(console.error);
