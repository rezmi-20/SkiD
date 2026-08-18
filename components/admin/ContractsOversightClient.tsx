"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, FileText, Download, CheckCircle2, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";

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
    <FadeContent blur duration={0.4} className="space-y-5 pb-10 max-w-full">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low px-6 py-5 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 dark:text-blue-400">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold text-on-surface tracking-tight">
          {t("admin.contracts.title" as any)}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant opacity-70">
          {t("admin.contracts.desc" as any)}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant transition-colors duration-300">
        {/* Search */}
        <div className="relative flex-grow max-w-md w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-on-surface-variant opacity-60" />
          <input
            type="text"
            placeholder={t("admin.contracts.searchPlaceholder" as any)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>
        
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider shrink-0 bg-surface-container px-3.5 py-1.5 rounded-full border border-outline-variant/40">
          {t("admin.contracts.total" as any)}: {filtered.length}
        </span>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden transition-colors duration-300 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant space-y-3">
            <div className="w-16 h-16 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-blue-500/60" />
            </div>
            <p className="text-sm font-black text-on-surface uppercase tracking-wider">{t("admin.contracts.noContracts" as any)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low/50">
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.contracts.table.job" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.contracts.table.client" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.contracts.table.worker" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.contracts.table.signed" as any)}
                  </th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.contracts.table.pdf" as any)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-surface-container/50 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4 font-bold text-on-surface group-hover:text-blue-500 transition-colors">{c.jobTitle}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-on-surface">{c.clientName}</span>
                        <span className="inline-flex items-center w-fit text-[9px] font-black uppercase tracking-wider">
                          {c.clientSignedAt ? (
                            <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {t("admin.contracts.signed" as any)}
                            </span>
                          ) : (
                            <span className="text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {t("admin.contracts.pending" as any)}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-on-surface">{c.workerName}</span>
                        <span className="inline-flex items-center w-fit text-[9px] font-black uppercase tracking-wider">
                          {c.workerSignedAt ? (
                            <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {t("admin.contracts.signed" as any)}
                            </span>
                          ) : (
                            <span className="text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {t("admin.contracts.pending" as any)}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant font-semibold">
                      {c.signedAt ? formatDate(c.signedAt) : <span className="italic text-xs opacity-40">{t("common.unfinished")}</span>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {c.pdfUrl ? (
                        <Link
                          href={c.pdfUrl}
                          target="_blank"
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface hover:bg-blue-500 hover:text-white hover:border-blue-500 px-3.5 text-xs font-bold transition-all active:scale-95 shadow-sm duration-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                      <span>{t("common.pdf")}</span>
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
    </FadeContent>
  );
}
