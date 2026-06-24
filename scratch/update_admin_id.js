require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  const oldId = '6fc763a4-03d5-4abe-912d-f71dab96abef';
  const newId = 'ab3e0074-da49-44ff-b6ed-29301e8b8b56';
  const email = 'admin@dire-skill.com';

  console.log(`Updating user ${email} ID from ${oldId} to ${newId}...`);

  try {
    // 1. Update the users table
    const result = await sql`
      UPDATE users 
      SET id = ${newId}
      WHERE email = ${email}
      RETURNING id, email, role;
    `;
    
    if (result.length > 0) {
      console.log('✅ Update successful:', result[0]);
    } else {
      console.log('❌ User not found with that email.');
    }
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

main().catch(console.error);
