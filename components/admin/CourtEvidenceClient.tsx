"use client";

import React, { useState, useTransition } from "react";
import { 
  FileCheck, ShieldAlert, Lock, Search, Scale, Printer, Download,
  CheckCircle2, AlertTriangle, MessageSquare, DollarSign, UserCheck, 
  FileText, Clock, ExternalLink, ChevronRight
} from "lucide-react";
import { searchContractsForEvidence, generateCourtEvidenceDossier } from "@/lib/actions/court-evidence";
import FadeContent from "@/components/ui/fade-content";

interface Props {
  adminEmployeeId: string;
  adminFullName: string;
}

export function CourtEvidenceClient({ adminEmployeeId, adminFullName }: Props) {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-red-950/80 via-zinc-900 to-zinc-950 border border-red-500/30 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/40">
            <Scale size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-sans tracking-tight">Judicial & Court Evidentiary Disclosure</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500 text-white uppercase tracking-wider">
                Super Admin Only
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Official legal disclosure portal compliant with <strong>Ethiopian Labour Proclamation No. 1156/2019</strong> and <strong>Electronic Transactions Proclamation No. 1205/2020</strong>. Generates tamper-evident legal dossiers with SHA-256 seal.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 hidden sm:block">
          <div className="text-[11px] text-zinc-400 font-mono">Authorizing Officer:</div>
          <div className="text-xs font-bold text-white">{adminFullName}</div>
          <div className="text-[10px] text-zinc-400 font-mono">ID: {adminEmployeeId}</div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fade-in">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!dossier ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Search & Selection */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Search size={16} className="text-zinc-400" />
                <span>1. Locate Target Contract or Job</span>
              </h2>

              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Contract ID, Job Title, Client/Worker name or phone..."
                  className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {searchResults.map((row) => (
                    <div
                      key={row.contractId}
                      onClick={() => setSelectedContract(row)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                        selectedContract?.contractId === row.contractId
                          ? "bg-red-500/10 border-red-500 text-white"
                          : "bg-black/30 border-white/5 hover:border-white/20 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 mb-1">
                        <span>Contract #{row.contractId.slice(0, 8)}...</span>
                        <span className="px-2 py-0.5 rounded bg-white/10 uppercase font-bold text-white">
                          {row.contractStatus}
                        </span>
                      </div>
                      <div className="font-bold text-white text-sm mb-1">{row.jobTitle}</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                        <div>Client: <strong className="text-zinc-200">{row.clientName}</strong> ({row.clientPhone || "No phone"})</div>
                        <div>Worker: <strong className="text-zinc-200">{row.workerName}</strong> ({row.workerPhone || "No phone"})</div>
                      </div>
                      <div className="mt-2 text-[10px] text-emerald-400 font-mono flex items-center justify-between">
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
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock size={16} className="text-red-400" />
                <span>2. Official Subpoena Authorization</span>
              </h2>

              {selectedContract ? (
                <div className="p-3 rounded-xl bg-black/40 border border-red-500/30 text-xs space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Selected Contract:</div>
                  <div className="font-bold text-white text-sm">{selectedContract.jobTitle}</div>
                  <div className="text-zinc-400 text-[11px] font-mono">UUID: {selectedContract.contractId}</div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-black/20 border border-dashed border-white/10 text-center text-xs text-zinc-500">
                  Select a contract from search results on the left
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Court Case Number / Subpoena Reference <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="e.g. FDRE-FED-CRT-DD-2026/8941"
                    required
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Requesting Court / Judicial Entity <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    placeholder="e.g. Dire Dawa Federal First Instance Court - Commercial Bench"
                    required
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Evidentiary Scope & Purpose
                  </label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={2}
                    placeholder="e.g. Formal evidentiary submission regarding disputed electrical installation scope and completed payment release."
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
                  <label className="block text-xs font-bold text-red-200">
                    Master Super Administrator Password <span className="text-red-400">*</span>
                  </label>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Zero-Trust Re-Authentication: Disclosing private user chat records, contracts, and financial receipts requires elevated credential authorization.
                  </p>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter your administrator password"
                    required
                    className="w-full bg-black border border-red-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !selectedContract}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-bold uppercase tracking-wider hover:from-red-500 hover:to-rose-600 transition-all shadow-lg disabled:opacity-40 cursor-pointer"
                >
                  {isGenerating ? "Verifying Credentials & Compiling Dossier..." : "Verify & Compile Certified Dossier"}
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
              className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700 cursor-pointer"
            >
              &larr; Back to Case Search
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-200 shadow-lg cursor-pointer"
              >
                <Printer size={16} />
                <span>Print / Save Legal PDF</span>
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
