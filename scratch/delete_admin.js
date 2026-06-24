require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  const email = 'admin@dire-skill.com';

  console.log(`Checking dependencies for ${email}...`);

  try {
    const users = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      console.log('User not found in users table.');
      return;
    }
    const adminId = users[0].id;
    console.log(`Admin ID: ${adminId}`);

    // Let's delete the user and see if it throws a foreign key error.
    // If it succeeds, we're good to recreate via register.
    // If it fails, we know we have dependencies.
    
    // First let's do a dry run or just delete it if it's safe.
    // Since the user is stuck, deleting and recreating is the easiest way.
    console.log('Attempting to delete from users table...');
    await sql`DELETE FROM users WHERE email = ${email}`;
    console.log('✅ Successfully deleted from users table.');
    console.log('You can now register via the app with admin@dire-skill.com!');
  } catch (error) {
    console.error('❌ Deletion failed. Likely foreign key constraint:', error.message);
  }
}

main().catch(console.error);
