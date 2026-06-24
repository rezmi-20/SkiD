require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('=== users table ===');
  const users = await sql`SELECT id, email, phone, role, created_at FROM users ORDER BY created_at DESC LIMIT 20`;
  if (users.length === 0) {
    console.log('No users found in users table.');
  } else {
    users.forEach(u => console.log(`  [${u.role}] ID: ${u.id} | Email: "${u.email}" | Phone: "${u.phone}"`));
  }
}

main().catch(console.error);
