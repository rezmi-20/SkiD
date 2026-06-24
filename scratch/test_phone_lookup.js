require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function test(phoneInput) {
  const sql = neon(process.env.DATABASE_URL);
  
  // Normalize: strip leading 0, strip +251 prefix if present
  let normalizedInput = phoneInput.trim();
  if (normalizedInput.startsWith("+251")) normalizedInput = normalizedInput.slice(4);
  if (normalizedInput.startsWith("0")) normalizedInput = normalizedInput.slice(1);
  
  console.log(`Searching for input: "${phoneInput}" -> normalized: "${normalizedInput}"`);
  
  // Match using SQL regexp_replace to strip leading '+251' or '0'
  const result = await sql`
    SELECT id, email, phone 
    FROM users 
    WHERE regexp_replace(phone, '^(\\+251|0)', '') = ${normalizedInput}
    LIMIT 1
  `;
  
  console.log('Result:', result);
}

async function main() {
  await test('09112345698');
  await test('9112345698');
  await test('+2519112345698');
  await test('0981565883');
  await test('+251981565883');
}

main().catch(console.error);
