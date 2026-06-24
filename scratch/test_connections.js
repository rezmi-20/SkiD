require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const DB_URL = process.env.DATABASE_URL;
const AUTH_URL = process.env.NEON_AUTH_BASE_URL;

console.log('--- ENV CHECK ---');
console.log('DATABASE_URL:', DB_URL ? DB_URL.replace(/:([^:@]+)@/, ':***@') : '❌ MISSING');
console.log('NEON_AUTH_BASE_URL:', AUTH_URL || '❌ MISSING');
console.log('-----------------\n');

async function testDB() {
  if (!DB_URL) { console.error('❌ DATABASE_URL not set'); return; }
  try {
    const sql = neon(DB_URL);
    const result = await sql`SELECT current_database() as db, now() as time`;
    console.log('✅ DATABASE OK:', result[0]);
  } catch (e) {
    console.error('❌ DATABASE FAIL:', e.message);
  }
}

async function testAuth() {
  if (!AUTH_URL) { console.error('❌ NEON_AUTH_BASE_URL not set'); return; }
  try {
    const res = await fetch(AUTH_URL, { signal: AbortSignal.timeout(8000) });
    console.log('✅ AUTH URL reachable — HTTP status:', res.status);
  } catch (e) {
    console.error('❌ AUTH URL FAIL:', e.message);
  }
}

testDB().then(testAuth);
