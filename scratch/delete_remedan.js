require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const email = 'remedanseid00@gmail.com';

  console.log(`Deleting ${email} from users table...`);

  try {
    const result = await sql`DELETE FROM users WHERE email = ${email} RETURNING email`;
    
    if (result.length > 0) {
      console.log(`✅ Successfully deleted ${result[0].email} from users table.`);
    } else {
      console.log('User not found in users table.');
    }
  } catch (error) {
    console.error('❌ Deletion failed:', error.message);
  }
}

main().catch(console.error);
