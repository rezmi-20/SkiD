const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function check() {
  try {
    const rows = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'worker_profiles'
    `;
    console.log('Columns in worker_profiles:');
    rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
  } catch (err) {
    console.error(err);
  }
}

check();
