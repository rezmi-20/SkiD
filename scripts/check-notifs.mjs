import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkNotifications() {
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications'`;
  console.log('notifications columns:', cols.map(c => c.column_name));

  const sample = await sql`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5`;
  console.log('notifications sample count:', sample.length);
  console.log(sample);
}

checkNotifications().catch(console.error);
