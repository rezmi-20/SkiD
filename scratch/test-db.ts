import { sql } from "../lib/db";

async function test() {
  try {
    const res = await sql`SELECT NOW()`;
    console.log("DB Connection Success:", res);
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
}

test();
