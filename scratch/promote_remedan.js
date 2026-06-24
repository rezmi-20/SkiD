require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  const email = 'remedanseid00@gmail.com';

  try {
    const users = await sql`SELECT id, role FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      console.log('User not found.');
      return;
    }
    
    const userId = users[0].id;
    const currentRole = users[0].role;
    console.log(`Found user: ID ${userId}, current role: ${currentRole}`);

    // Update role in users table
    await sql`UPDATE users SET role = 'admin' WHERE id = ${userId}`;
    console.log('✅ Promoted role to admin.');

    // Update name in client_profiles or worker_profiles depending on their current role
    if (currentRole === 'client') {
      const res = await sql`UPDATE client_profiles SET full_name = 'Admin' WHERE user_id = ${userId} RETURNING *`;
      if (res.length > 0) {
        console.log('✅ Updated name to Admin in client_profiles.');
      }
    } else if (currentRole === 'worker') {
      const res = await sql`UPDATE worker_profiles SET full_name = 'Admin' WHERE user_id = ${userId} RETURNING *`;
      if (res.length > 0) {
        console.log('✅ Updated name to Admin in worker_profiles.');
      }
    }
    
    console.log('\nAll done! You can now log in using remedanseid00@gmail.com and you will be the Admin.');
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

main().catch(console.error);
