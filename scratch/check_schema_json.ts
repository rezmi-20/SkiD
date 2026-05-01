import { sql } from "../lib/db";
import "dotenv/config";

async function checkSchema() {
  const tables = ['jobs', 'contracts'];
  for (const table of tables) {
    const res = await sql.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    console.log(`DATA_FOR_${table}:`, JSON.stringify(res));
  }
}

checkSchema();
