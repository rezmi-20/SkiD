export interface ContractAnalyticsRow {
  id: string;
  jobTitle: string;
  clientName: string;
  workerName: string;
  signedAt: string | null;
  amount?: number;
  status?: string | null;
  termsStatus?: string | null;
  workLocation?: string | null;
  createdAt?: string | null;
}

const CSV_FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function sanitizeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? "" : String(value);
  const safe = CSV_FORMULA_PREFIX.test(raw) ? `'${raw}` : raw;
  const escaped = safe.replace(/"/g, '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function buildCsvString(headers: string[], rows: Array<Array<unknown>>): string {
  const headerLine = headers.map((h) => sanitizeCsvCell(h)).join(",");
  const bodyLines = rows.map((row) => row.map((cell) => sanitizeCsvCell(cell)).join(","));
  return [headerLine, ...bodyLines].join("\r\n");
}

export function triggerCsvDownload(filename: string, headers: string[], rows: Array<Array<unknown>>) {
  const csv = buildCsvString(headers, rows);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function filterContracts<T extends ContractAnalyticsRow>(
  contracts: T[],
  options: { filter: "all" | "executed" | "pending"; query: string },
): T[] {
  const q = options.query.toLowerCase().trim();
  return contracts.filter((c) => {
    const isExecuted = Boolean(c.signedAt);
    const matchesFilter =
      options.filter === "all" ||
      (options.filter === "executed" && isExecuted) ||
      (options.filter === "pending" && !isExecuted);

    const matchesSearch =
      !q ||
      c.jobTitle.toLowerCase().includes(q) ||
      c.clientName.toLowerCase().includes(q) ||
      c.workerName.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });
}

export function computeContractsSummary(contracts: ContractAnalyticsRow[]) {
  const total = contracts.length;
  const executed = contracts.filter((c) => Boolean(c.signedAt)).length;
  const pending = total - executed;
  const totalValue = contracts.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const executionRate = total > 0 ? Math.round((executed / total) * 100) : 0;
  return { total, executed, pending, totalValue, executionRate };
}
