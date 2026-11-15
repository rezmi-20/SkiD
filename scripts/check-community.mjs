import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const posts = await sql`SELECT id, title, category, created_at FROM community_posts LIMIT 20`;
  console.log('Posts count:', posts.length);
  console.log(posts);
  
  const users = await sql`
    SELECT u.id, u.role, u.email, wp.full_name as worker_name, clp.full_name as client_name
    FROM users u
    LEFT JOIN worker_profiles wp ON u.id = wp.user_id
    LEFT JOIN client_profiles clp ON u.id = clp.user_id
    LIMIT 10
  `;
  console.log('Users found:', users);
}

main().catch(console.error);
