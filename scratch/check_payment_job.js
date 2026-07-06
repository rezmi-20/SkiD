require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);
const jobId = process.argv[2];

async function main() {
  if (!jobId) throw new Error("Pass a job id.");

  const rows = await sql`
    SELECT
      j.id,
      j.title,
      j.status,
      j.budget,
      j.client_id,
      j.worker_id,
      u.email as client_email,
      u.phone as client_phone,
      cp.full_name as client_name,
      wp.full_name as worker_name,
      wp.chapa_subaccount_id,
      wp.chapa_split_type,
      wp.chapa_split_value,
      wp.bank_name,
      wp.bank_code,
      length(wp.bank_account) as bank_account_digits
    FROM jobs j
    JOIN users u ON j.client_id = u.id
    LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
    LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
    WHERE j.id = ${jobId}
    LIMIT 1
  `;

  console.log(JSON.stringify(rows, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
