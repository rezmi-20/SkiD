import { sql } from "@/lib/db";

export async function getWorkerIdentityColumns() {
  const rows = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'worker_profiles'
  `;
  return new Set(rows.map((row: any) => row.column_name as string));
}
