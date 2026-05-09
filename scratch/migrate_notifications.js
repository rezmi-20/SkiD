const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function run() {
  try {
    console.log('Creating notifications table...');
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        link_href TEXT,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications (user_id, created_at DESC)`;
    console.log('Notifications table created successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  }
}

run();
