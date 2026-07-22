import { connectDemoDatabase, resetDemoData } from "./demo-data-fixtures.mjs";

try {
  const sql = connectDemoDatabase();
  await resetDemoData(sql);
  console.log("PASS demo-owned data reset");
} catch (error) {
  console.error("MISSING demo data reset failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
