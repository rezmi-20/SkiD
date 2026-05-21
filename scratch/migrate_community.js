const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function run() {
  try {
    console.log('Adding is_verified to client_profiles...');
    await sql`ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE`;

    console.log('Creating community_posts...');
    await sql`
      CREATE TABLE IF NOT EXISTS community_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        media_url TEXT,
        category TEXT NOT NULL,
        likes_count INTEGER NOT NULL DEFAULT 0,
        flags_count INTEGER NOT NULL DEFAULT 0,
        is_removed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('Creating community_likes...');
    await sql`
      CREATE TABLE IF NOT EXISTS community_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        post_id UUID NOT NULL REFERENCES community_posts(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('Creating community_flags...');
    await sql`
      CREATE TABLE IF NOT EXISTS community_flags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        post_id UUID NOT NULL REFERENCES community_posts(id),
        reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('Creating community_comments...');
    await sql`
      CREATE TABLE IF NOT EXISTS community_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        post_id UUID NOT NULL REFERENCES community_posts(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('Tables created successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

run();
