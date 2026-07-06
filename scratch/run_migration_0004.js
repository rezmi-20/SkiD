require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Running migration 0004_add_chapa_reference.sql...");
  await sql`
    ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS chapa_reference text
  `;
  console.log("Migration finished successfully.");

  // Check columns of payments table
  const columns = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'payments'
  `;
  console.log("Payments table columns:", columns.map(c => `${c.column_name} (${c.data_type})`));
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
