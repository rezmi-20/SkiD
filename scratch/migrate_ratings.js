const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function run() {
  try {
    console.log('Migrating ratings table...');
    await sql`ALTER TABLE ratings ADD COLUMN IF NOT EXISTS photo_urls TEXT[]`;
    await sql`ALTER TABLE ratings ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN NOT NULL DEFAULT FALSE`;
    // Prevent duplicate reviews: one per job per rater
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS ratings_job_rater_unique ON ratings (job_id, rater_id)`;
    console.log('Ratings migration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  }
}

run();
