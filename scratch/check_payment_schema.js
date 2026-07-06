require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const rows = await sql`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_name IN ('payments', 'worker_profiles')
      AND column_name IN (
        'commission_amount',
        'net_amount',
        'chapa_checkout_url',
        'chapa_status',
        'chapa_response',
        'worker_subaccount_id',
        'updated_at',
        'chapa_subaccount_id',
        'bank_account',
        'bank_name',
        'bank_code',
        'chapa_split_type',
        'chapa_split_value'
      )
    ORDER BY table_name, column_name
  `;

  console.log(JSON.stringify(rows, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
