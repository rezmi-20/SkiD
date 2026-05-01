import { sql } from "../lib/db";
import "dotenv/config";

async function checkRoles() {
  try {
    const res = await sql`SELECT role, count(*) FROM users GROUP BY role`;
    console.log("Roles distribution:", res);
    
    const sample = await sql`SELECT id, role FROM users LIMIT 5`;
    console.log("Sample users:", sample);
  } catch (err) {
    console.error("Error:", err);
  }
}

checkRoles();
