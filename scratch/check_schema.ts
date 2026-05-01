import { sql } from "../lib/db";
import "dotenv/config";

async function checkSchema() {
  const tables = ['jobs', 'contracts', 'ratings'];
  for (const table of tables) {
    console.log(`--- Columns for ${table} ---`);
    const res = await sql.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    console.table(res);
  }
}

checkSchema();
