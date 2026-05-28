const { neon } = require('@neondatabase/serverless');

const url = 'postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(url);

sql`SELECT 1 as result`
  .then((res) => {
    console.log('Database connected successfully:', res);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
