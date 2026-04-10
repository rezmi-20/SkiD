require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

// Corrected Mock
const dummy = () => {};
const sql = new Proxy(dummy, {
  get(target, prop) {
    if (!process.env.DATABASE_URL) return undefined;
    const connection = neon(process.env.DATABASE_URL);
    return (connection as any)[prop];
  },
  apply(target, thisArg, argumentsList) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
    const connection = neon(process.env.DATABASE_URL);
    return (connection as any)(...argumentsList);
  }
});

async function test() {
  try {
    console.log('Testing tagged template again...');
    const res = await sql`SELECT NOW()`;
    console.log('Result:', res);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
