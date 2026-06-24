require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    const result = await sql`
      UPDATE users 
      SET phone = phone || '_old' 
      WHERE email = 'remedanseid00_old_backup@gmail.com'
      RETURNING phone
    `;
    console.log('✅ Renamed phone on old backup account to:', result[0].phone);
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

main().catch(console.error);
