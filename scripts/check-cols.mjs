import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkColumns() {
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'community_posts'`;
  console.log('community_posts columns:', cols.map(c => c.column_name));
}

checkColumns().catch(console.error);
