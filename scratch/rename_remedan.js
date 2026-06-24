require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const oldEmail = 'remedanseid00@gmail.com';
  const newEmail = 'remedanseid00_old_backup@gmail.com';

  console.log(`Renaming ${oldEmail} to ${newEmail} to free up the email...`);

  try {
    const result = await sql`
      UPDATE users 
      SET email = ${newEmail} 
      WHERE email = ${oldEmail} 
      RETURNING id, email
    `;
    
    if (result.length > 0) {
      console.log(`✅ Successfully renamed to ${result[0].email}`);
    } else {
      console.log('User not found.');
    }
  } catch (error) {
    console.error('❌ Rename failed:', error.message);
  }
}

main().catch(console.error);
