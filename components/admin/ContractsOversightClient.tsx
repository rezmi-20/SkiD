"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, FileText, Download, CheckCircle2, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ContractData {
  id: string;
  jobTitle: string;
  clientName: string;
  workerName: string;
  clientSignedAt: string | null;
  workerSignedAt: string | null;
  signedAt: string | null;
  pdfUrl: string | null;
}

interface Props {
  initialContracts: ContractData[];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ContractsOversightClient({ initialContracts }: Props) {
  const { t } = useLanguage();
  const [contracts] = useState<ContractData[]>(initialContracts);
  const [search, setSearch] = useState("");

  const filtered = contracts.filter((c) => {
    const query = search.toLowerCase();
    return (
      c.jobTitle.toLowerCase().includes(query) ||
      c.clientName.toLowerCase().includes(query) ||
      c.workerName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-10">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4 transition-colors duration-300">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
          {t("admin.contracts.title" as any)}
        </h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">
          {t("admin.contracts.desc" as any)}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant transition-colors duration-300">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={t("admin.contracts.searchPlaceholder" as any)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container pl-9 pr-4 py-2 rounded-lg border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all"
          />
        </div>
        
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider shrink-0">
          {t("admin.contracts.total" as any)}: {filtered.length}
        </span>
      </div>

      {/* Table Card */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden transition-colors duration-300 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant">
            <FileText className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-2" />
            <p className="text-sm font-semibold">{t("admin.contracts.noContracts" as any)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/50">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.contracts.table.job" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.contracts.table.client" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.contracts.table.worker" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.contracts.table.signed" as any)}
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.contracts.table.pdf" as any)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-surface-container transition-colors duration-150"
                  >
                    <td className="px-4 py-3 font-bold text-on-surface">{c.jobTitle}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{c.clientName}</span>
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                          {c.clientSignedAt ? (
                            <span className="text-green-700 bg-green-50 border border-green-150 rounded-full px-2 py-0.5 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> {t("admin.contracts.signed" as any)}
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 border border-amber-150 rounded-full px-2 py-0.5 flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {t("admin.contracts.pending" as any)}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{c.workerName}</span>
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                          {c.workerSignedAt ? (
                            <span className="text-green-700 bg-green-50 border border-green-150 rounded-full px-2 py-0.5 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> {t("admin.contracts.signed" as any)}
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 border border-amber-150 rounded-full px-2 py-0.5 flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {t("admin.contracts.pending" as any)}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant font-medium">
                      {c.signedAt ? formatDate(c.signedAt) : <span className="italic text-xs">Unfinished</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.pdfUrl ? (
                        <Link
                          href={c.pdfUrl}
                          target="_blank"
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high px-3 text-xs font-bold transition-all active:scale-95 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </Link>
                      ) : (
                        <span className="text-xs text-on-surface-variant/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
