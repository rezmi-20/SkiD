const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function test() {
  try {
    const rows = await sql`
      SELECT 
        COALESCE(wp.is_verified, clp.is_verified, false) as is_verified
      FROM users u
      LEFT JOIN worker_profiles wp ON u.id = wp.user_id
      LEFT JOIN client_profiles clp ON u.id = clp.user_id
      LIMIT 1
    `;
    console.log('Query successful:', rows);
  } catch (err) {
    console.error('Query failed:', err.message);
  }
}

test();
