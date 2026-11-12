"use client";

import React, { useState, useTransition } from "react";
import { 
  FileCheck, ShieldAlert, Lock, Search, Scale, Printer, Download,
  CheckCircle2, AlertTriangle, MessageSquare, DollarSign, UserCheck, 
  FileText, Clock, ExternalLink, ChevronRight, Loader2, ArrowLeft
} from "lucide-react";
import { searchContractsForEvidence, generateCourtEvidenceDossier } from "@/lib/actions/court-evidence";
import { useLanguage } from "@/context/LanguageContext";
import { triggerUnauthorizedNotice } from "@/components/admin/modals/AdminUnauthorizedNoticeModal";

interface Props {
  adminEmployeeId: string;
  adminFullName: string;
}

export function CourtEvidenceClient({ adminEmployeeId, adminFullName }: Props) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);

  // Form Fields
  const [caseNumber, setCaseNumber] = useState("");
  const [courtName, setCourtName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [isSearching, startSearch] = useTransition();
  const [isGenerating, startGenerating] = useTransition();
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dossier, setDossier] = useState<any | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setError(null);
    startSearch(async () => {
      try {
        const results = await searchContractsForEvidence(searchQuery);
        setSearchResults(results);
        if (results.length === 0) {
          setError("No matching contracts or jobs found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to search contracts.");
      }
    });
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) {
      setError("Please select a contract first.");
      return;
    }
    if (!caseNumber.trim() || !courtName.trim() || !adminPassword) {
      setError("Please complete all required fields including your Master Password.");
      return;
    }

    setError(null);
    startGenerating(async () => {
      try {
        const res = await generateCourtEvidenceDossier({
          contractId: selectedContract.contractId,
          caseNumber,
          courtName,
          purpose,
          adminPassword,
        });

        if (!res.success) {
          setError(res.error || "Failed to generate evidence dossier.");
          return;
        }

        setDossier(res.dossier);
        setAdminPassword(""); // Clear password from memory immediately
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred during evidence disclosure.");
      }
    });
  };

  const handleDownloadPdf = async () => {
    if (!dossier?.pdfDownloadUrl) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch(dossier.pdfDownloadUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        let errorMsg = "You do not have administrative clearance to download this certified court dossier.";
        try {
          const json = await res.json();
          if (json.message) errorMsg = json.message;
          else if (json.error) errorMsg = json.error;
        } catch {}

        triggerUnauthorizedNotice({
          title: "Clearance Restricted · 403",
          message: errorMsg,
          actionName: "Court Evidence PDF Download",
        });
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DireSkill_Court_Evidence_${(dossier.caseNumber || "case").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      triggerUnauthorizedNotice({
        title: "Network or Clearance Error",
        message: err?.message || "Failed to download court evidence file.",
        actionName: "Court Evidence PDF Download",
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-24 w-full">
      {/* Header (Clean deals.tsx style: No dots, no uppercase pill badges) */}
      <div className="pt-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {t("admin.courtEvidence.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.courtEvidence.desc")}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!dossier ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Search & Selection */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Search size={16} className="text-muted-foreground" />
                <span>{t("admin.courtEvidence.step1")}</span>
              </h2>

              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("admin.courtEvidence.searchPlaceholder")}
                  className="flex-1 bg-secondary border border-border rounded-lg px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSearching ? "..." : "Search"}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {searchResults.map((row) => (
                    <div
                      key={row.contractId}
                      onClick={() => setSelectedContract(row)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer text-xs ${
                        selectedContract?.contractId === row.contractId
                          ? "bg-accent/10 border-accent text-foreground"
                          : "bg-secondary/40 border-border hover:border-muted-foreground/30 text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground mb-1">
                        <span>Contract #{row.contractId.slice(0, 8)}...</span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary border border-border uppercase font-semibold text-foreground">
                          {row.contractStatus}
                        </span>
                      </div>
                      <div className="font-bold text-foreground text-sm mb-1">{row.jobTitle}</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                        <div>Client: <strong className="text-foreground">{row.clientName}</strong></div>
                        <div>Worker: <strong className="text-foreground">{row.workerName}</strong></div>
                      </div>
                      <div className="mt-2 text-[10px] text-success font-mono flex items-center justify-between">
                        <span>Amount: ETB {Number(row.paymentAmount || 0).toLocaleString()}</span>
                        <span>Date: {new Date(row.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Court Order Verification & Authentication Form */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Lock size={16} className="text-rose-500" />
                <span>{t("admin.courtEvidence.step2")}</span>
              </h2>

              {selectedContract ? (
                <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Selected Target:</div>
                  <div className="font-bold text-foreground text-sm">{selectedContract.jobTitle}</div>
                  <div className="text-muted-foreground text-[11px] font-mono">UUID: {selectedContract.contractId}</div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-secondary/30 border border-dashed border-border text-center text-xs text-muted-foreground">
                  Select a contract from search results on the left
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    {t("admin.courtEvidence.caseNumber")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="e.g. FDRE-FED-CRT-DD-2026/8941"
                    required
                    className="w-full bg-secondary border border-border rounded-lg px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    {t("admin.courtEvidence.courtName")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    placeholder="e.g. Dire Dawa Federal First Instance Court - Commercial Bench"
                    required
                    className="w-full bg-secondary border border-border rounded-lg px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    {t("admin.courtEvidence.purpose")}
                  </label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={2}
                    placeholder="e.g. Formal evidentiary submission regarding disputed electrical installation scope."
                    className="w-full bg-secondary border border-border rounded-lg px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
                  <label className="block text-xs font-bold text-destructive">
                    {t("admin.courtEvidence.masterPassword")} <span className="text-destructive">*</span>
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Zero-Trust Re-Authentication: Disclosing private user chat records, contracts, and financial receipts requires elevated credential authorization.
                  </p>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter your administrator password"
                    required
                    className="w-full bg-secondary border border-border rounded-lg px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !selectedContract}
                  className="w-full py-3 rounded-lg bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  {isGenerating ? "Verifying Credentials & Compiling..." : t("admin.courtEvidence.compileBtn")}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Rendered Legal Dossier View */
        <div className="space-y-6">
          <div className="flex items-center justify-between no-print">
            <button
              onClick={() => setDossier(null)}
              className="px-3.5 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("admin.courtEvidence.backSearch")}</span>
            </button>
            <div className="flex items-center gap-3">
              {dossier.pdfDownloadUrl && (
                <button
                  type="button"
                  disabled={downloadingPdf}
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-90 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {downloadingPdf ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  <span>{downloadingPdf ? "Verifying Access..." : t("admin.courtEvidence.downloadPdf")}</span>
                </button>
              )}
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-lg bg-secondary text-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-secondary/80 transition cursor-pointer"
              >
                <Printer size={15} />
                <span>{t("admin.courtEvidence.print")}</span>
              </button>
            </div>
          </div>

          {/* Legal Document Container */}
          <div className="bg-white text-black p-8 sm:p-12 md:p-16 rounded-2xl shadow-2xl border border-zinc-300 font-sans print:p-0 print:border-none print:shadow-none">
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-6 mb-8">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                Federal Democratic Republic of Ethiopia
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-black mt-1">
                DireSkill Certified Evidentiary Dossier
              </h1>
              <div className="text-xs text-zinc-600 mt-1 font-serif italic">
                Statutory Evidence Record under Ethiopian Labour Proclamation No. 1156/2019 & Electronic Transactions Proclamation No. 1205/2020
              </div>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-[10px] font-mono">
                <span className="font-bold text-zinc-800">DISCLOSURE ID:</span>
                <span className="text-black font-semibold">{dossier.disclosureId}</span>
              </div>
            </div>

            {/* Case & Subpoena Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 mb-8 text-xs">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Court Case Ref:</span>
                <strong className="text-black font-mono">{dossier.manifest.metadata.caseNumber}</strong>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Requesting Court:</span>
                <strong className="text-black">{dossier.manifest.metadata.courtName}</strong>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Disclosed At:</span>
                <span className="text-black font-mono">{new Date(dossier.manifest.metadata.generatedAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Authorized By:</span>
                <span className="text-black font-semibold">{dossier.manifest.metadata.authorizedBy.name}</span>
                <span className="text-[10px] text-zinc-500 block">({dossier.manifest.metadata.authorizedBy.employeeCode})</span>
              </div>
            </div>

            {/* Section 1: Contract Details */}
            <div className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-wider text-black border-b border-black pb-1 mb-3 flex items-center justify-between">
                <span>1. Original Digital Contract & Specifications</span>
                <span className="text-xs font-mono font-normal">Contract UUID: {dossier.manifest.contract.contractId}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-zinc-500 block text-[10px]">Job Title:</span>
                  <strong className="text-sm">{dossier.manifest.contract.jobTitle || dossier.manifest.contract.originalJobTitle}</strong>
                </div>
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-zinc-500 block text-[10px]">Agreed Consideration:</span>
                  <strong className="text-sm text-emerald-800 font-mono">
                    ETB {Number(dossier.manifest.contract.paymentAmount || 0).toLocaleString()}
                  </strong>
                </div>
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-zinc-500 block text-[10px]">Work Location:</span>
                  <strong className="text-sm">{dossier.manifest.contract.workLocation || dossier.manifest.contract.jobLocation || "Dire Dawa"}</strong>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-xs space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Formally Agreed Terms:</span>
                <p className="whitespace-pre-wrap font-serif text-zinc-800 leading-relaxed">
                  {dossier.manifest.contract.terms || "Standard DireSkill verified trade contract agreement."}
                </p>
                <div className="pt-2 border-t border-zinc-200 grid grid-cols-2 text-[10px] font-mono text-zinc-600">
                  <div>Client Signed: {dossier.manifest.contract.clientSignedAt ? new Date(dossier.manifest.contract.clientSignedAt).toLocaleString() : "PIN Confirmed"}</div>
                  <div>Worker Signed: {dossier.manifest.contract.workerSignedAt ? new Date(dossier.manifest.contract.workerSignedAt).toLocaleString() : "Confirmed"}</div>
                </div>
              </div>
            </div>

            {/* Section 2: Parties & Compliance Status */}
            <div className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-wider text-black border-b border-black pb-1 mb-3">
                2. Parties Identity & Fayda National ID Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Client Box */}
                <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1.5">
                  <div className="font-bold text-sm text-black flex items-center justify-between">
                    <span>Client / Employer</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 font-mono">
                      {dossier.manifest.client?.verificationStatus?.toUpperCase() || "RECORDED"}
                    </span>
                  </div>
                  <div>Name: <strong>{dossier.manifest.client?.fullName || "Not Specified"}</strong></div>
                  <div>Phone: <span className="font-mono">{dossier.manifest.client?.phone || "N/A"}</span></div>
                  <div>Email: <span className="font-mono">{dossier.manifest.client?.email}</span></div>
                  <div>Fayda National ID: <span className="font-mono">{dossier.manifest.client?.finLast4 ? `***-***-${dossier.manifest.client.finLast4}` : "Document On File"}</span></div>
                </div>

                {/* Worker Box */}
                <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1.5">
                  <div className="font-bold text-sm text-black flex items-center justify-between">
                    <span>Artisan / Worker</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                      {dossier.manifest.worker?.verificationStatus?.toUpperCase() || "VERIFIED"}
                    </span>
                  </div>
                  <div>Name: <strong>{dossier.manifest.worker?.fullName || "Not Specified"}</strong></div>
                  <div>Phone: <span className="font-mono">{dossier.manifest.worker?.phone || "N/A"}</span></div>
                  <div>District: <span>{dossier.manifest.worker?.district || "Dire Dawa"}</span></div>
                  <div>Trade Skills: <span>{Array.isArray(dossier.manifest.worker?.skills) ? dossier.manifest.worker.skills.join(", ") : "Artisan"}</span></div>
                  <div>Fayda National ID: <span className="font-mono">{dossier.manifest.worker?.finLast4 ? `***-***-${dossier.manifest.worker.finLast4}` : "Verified via Fayda"}</span></div>
                </div>
              </div>
            </div>

            {/* Section 3: Financial & Escrow Records */}
            <div className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-wider text-black border-b border-black pb-1 mb-3">
                3. Financial & Escrow Ledger (Chapa Gateway Records)
              </h3>
              {dossier.manifest.payments?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-zinc-200">
                    <thead className="bg-zinc-100 border-b border-zinc-200">
                      <tr>
                        <th className="p-2.5 font-bold">Payment ID</th>
                        <th className="p-2.5 font-bold">Total Amount</th>
                        <th className="p-2.5 font-bold">Net Payout</th>
                        <th className="p-2.5 font-bold">Status</th>
                        <th className="p-2.5 font-bold">Chapa Ref</th>
                        <th className="p-2.5 font-bold">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {dossier.manifest.payments.map((p: any) => (
                        <tr key={p.id}>
                          <td className="p-2.5 font-mono text-[11px]">{p.id.slice(0, 8)}...</td>
                          <td className="p-2.5 font-mono font-bold">ETB {Number(p.amount).toLocaleString()}</td>
                          <td className="p-2.5 font-mono text-emerald-700">ETB {Number(p.netAmount || p.amount).toLocaleString()}</td>
                          <td className="p-2.5 uppercase font-bold text-[10px]">{p.status}</td>
                          <td className="p-2.5 font-mono text-[11px]">{p.chapaRef || p.chapaReference || "CHAPA-DIR-ESCROW"}</td>
                          <td className="p-2.5 font-mono text-[11px]">{new Date(p.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 bg-zinc-50 rounded border border-zinc-200 text-xs text-zinc-500 italic">
                  No payment transactions logged for this contract ID.
                </div>
              )}
            </div>

            {/* Section 4: Complete Chat & Messaging Transcript */}
            <div className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-wider text-black border-b border-black pb-1 mb-3 flex items-center justify-between">
                <span>4. Complete Electronic Messaging & Chat Transcript</span>
                <span className="text-xs font-mono font-normal">{dossier.manifest.chatTranscript?.length || 0} messages logged</span>
              </h3>
              {dossier.manifest.chatTranscript?.length > 0 ? (
                <div className="space-y-2 border border-zinc-200 rounded-lg p-4 bg-zinc-50 max-h-[480px] overflow-y-auto">
                  {dossier.manifest.chatTranscript.map((msg: any) => (
                    <div key={msg.id} className="text-xs pb-2 border-b border-zinc-200 last:border-none last:pb-0">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-0.5">
                        <span className="font-bold text-black">
                          {msg.senderName} ({msg.senderRole})
                        </span>
                        <span className="font-mono">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-zinc-800 whitespace-pre-wrap">{msg.body}</p>
                      {msg.imageUrl && (
                        <div className="mt-1 text-[10px] text-blue-600 underline">
                          [Image Attachment: {msg.imageUrl}]
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-zinc-50 rounded border border-zinc-200 text-xs text-zinc-500 italic">
                  No in-app messages exchanged between parties for this job.
                </div>
              )}
            </div>

            {/* Section 5: Cryptographic Tamper-Evident Seal */}
            <div className="p-6 rounded-xl bg-zinc-100 border-2 border-black space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-black">
                  Cryptographic Integrity & Chain of Custody Seal
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-white font-bold">
                  SHA-256 SECURED
                </span>
              </div>
              <div className="font-mono text-xs break-all bg-white p-3 rounded border border-zinc-300 text-zinc-800">
                {dossier.evidenceHash}
              </div>
              <div className="text-[11px] text-zinc-600 leading-relaxed font-serif italic">
                I hereby certify under penalty of perjury that the foregoing dossier is a true, authentic, and tamper-evident electronic record extracted directly from the DireSkill core database ledger in accordance with Ethiopian Labour Proclamation No. 1156/2019 and Evidence Law standards.
              </div>
              <div className="pt-3 border-t border-zinc-300 flex items-center justify-between text-xs">
                <div>
                  <strong>Authorized Signatory:</strong> {dossier.manifest.metadata.authorizedBy.name}<br />
                  <span className="text-zinc-500 text-[10px]">Super Administrator, DireSkill ICT Innovation Lab</span>
                </div>
                <div className="text-right font-mono text-[11px]">
                  Date: {new Date(dossier.manifest.metadata.generatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
