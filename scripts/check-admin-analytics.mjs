import { strict as assert } from "node:assert";
import { buildCsvString, computeContractsSummary, filterContracts, sanitizeCsvCell } from "../lib/admin-analytics.ts";

// Note: run with node --experimental-strip-types scripts/check-admin-analytics.mjs
assert.equal(sanitizeCsvCell("=CMD('calc')"), "'=CMD('calc')");
assert.equal(sanitizeCsvCell("=1+1"), "'=1+1");
assert.equal(sanitizeCsvCell("+SUM(A1:A2)"), "'+SUM(A1:A2)");
assert.equal(sanitizeCsvCell('Hello, "World"'), '"Hello, ""World"""');

const csv = buildCsvString(["ID", "Title"], [["1", "Wiring, Kezira"], ["2", "=HYPERLINK()"]]);
assert.equal(csv, 'ID,Title\r\n1,"Wiring, Kezira"\r\n2,\'=HYPERLINK()');

const sample = [
  { id: "c1", jobTitle: "Wiring", clientName: "A", workerName: "B", signedAt: "2026-01-01", amount: 1500 },
  { id: "c2", jobTitle: "Painting", clientName: "C", workerName: "D", signedAt: null, amount: 800 },
];
const summary = computeContractsSummary(sample);
assert.equal(summary.total, 2);
assert.equal(summary.executed, 1);
assert.equal(summary.pending, 1);
assert.equal(summary.totalValue, 2300);
assert.equal(summary.executionRate, 50);

assert.equal(filterContracts(sample, { filter: "executed", query: "" }).length, 1);
assert.equal(filterContracts(sample, { filter: "pending", query: "paint" }).length, 1);
assert.equal(filterContracts(sample, { filter: "all", query: "missing" }).length, 0);

console.log("PASS admin-analytics unit checks passed");
