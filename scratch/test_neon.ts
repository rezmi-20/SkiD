import { sql } from "../lib/db";
import "dotenv/config";

async function testQuery() {
  try {
    console.log("Testing sql.query...");
    const res = await sql.query("SELECT 1 as test");
    console.log("Result:", res);
  } catch (err) {
    console.error("sql.query failed:", err);
  }
  
  try {
    console.log("Testing sql as function...");
    const res = await sql("SELECT 1 as test");
    console.log("Result:", res);
  } catch (err) {
    console.error("sql as function failed:", err);
  }
}

testQuery();
