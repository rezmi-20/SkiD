"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Calendar, 
  ArrowRight, 
  Download, 
  Star, 
  CreditCard, 
  AlertTriangle,
  FolderOpen,
  ArrowUpRight,
  User,
  Hash,
  Plus
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import FadeContent from "@/components/ui/fade-content";

interface Props {
  contracts: any[];
  role: "client" | "worker";
}

export default function ContractsPageContent({ contracts = [], role }: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "disputed", label: "Disputed" },
  ];

  const filteredContracts = contracts.filter((c) => {
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "active" && (c.contract_status === "ACTIVE" || c.job_status === "active")) ||
      (activeTab === "pending" && ["DRAFT", "READY_FOR_SIGNATURE", "CLIENT_SIGNED", "WORKER_SIGNED"].includes(c.contract_status)) ||
      (activeTab === "completed" && ["completed", "payment_pending", "paid", "closed"].includes(c.job_status)) ||
      (activeTab === "disputed" && c.job_status === "disputed");

    const matchesSearch = 
      c.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partner_name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <FadeContent blur duration={0.4} className="space-y-6 pb-24 max-w-full">
      
      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Service Repository
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-0.5">
            My Contracts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor and manage your active and past service agreements.
          </p>
        </div>
        
        {role === "client" && (
          <Button asChild className="rounded-xl font-semibold shadow-sm shadow-primary/20 shrink-0">
            <Link href="/client/search">
              <Plus className="mr-1.5 h-4 w-4" /> New Contract
            </Link>
          </Button>
        )}
      </header>

      {/* ── Tabs Navigation & Search ── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/60 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
          <TabsList className="bg-surface-container p-1 rounded-xl h-11 border border-outline-variant/40 w-full lg:w-auto flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-lg text-xs font-bold px-4.5 py-2 uppercase tracking-wider h-9 flex-1 lg:flex-none text-center"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative flex-grow max-w-md group w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60" size={16} />
          <Input 
            type="text"
            placeholder="Search by name, title, or service type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-surface-container border-outline-variant/40 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* ── Contracts List/Grid ── */}
      {filteredContracts.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredContracts.map((contract, index) => {
              const status = contract.contract_status || contract.job_status;
              const isCompleted = ["paid", "closed"].includes(contract.job_status);
              const isDisputed = contract.job_status === 'disputed';
              const isDraft = status === "DRAFT";
              const isPending = !contract.signed_at;
              const partnerInitials = (contract.partner_name || "P").slice(0, 2).toUpperCase();
              const displayId = contract.contract_id ? `#${contract.contract_id.slice(0, 8).toUpperCase()}` : "N/A";

              return (
                <motion.div 
                  key={contract.contract_id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                  className="w-full flex"
                >
                  {/* Premium details-list card */}
                  <Card className="border border-outline-variant/80 bg-surface-container-lowest shadow-sm hover:shadow-md hover:border-primary/40 hover:scale-[1.01] transition-all duration-200 rounded-2xl overflow-hidden flex flex-col justify-between w-full group">
                    <div className="p-5 flex flex-col gap-4 flex-1">
                      
                      {/* Header block with avatar */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border border-outline-variant/60 shrink-0">
                          {contract.partner_avatar && <AvatarImage src={contract.partner_avatar} />}
                          <AvatarFallback className="text-xs font-bold bg-surface-container text-on-surface-variant">
                            {partnerInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                            {contract.partner_name}
                          </h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 mt-0.5">
                            {role === "client" ? "Verified Contractor" : "Client Account"}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`rounded-full text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 border ${getStatusStyles(status)}`}
                        >
                          {getStatusLabel(status, contract.signed_at)}
                        </Badge>
                      </div>

                      <Separator className="bg-outline-variant/30" />

                      {/* Detail row key-value pairs */}
                      <div className="space-y-2 text-xs">
                        {/* Service Title */}
                        <div className="flex justify-between items-start py-1 gap-4">
                          <span className="text-on-surface-variant opacity-60 font-semibold shrink-0">Service Job:</span>
                          <span className="font-bold text-on-surface text-right truncate max-w-[180px]">{contract.job_title}</span>
                        </div>

                        {/* Contract ID */}
                        <div className="flex justify-between items-center py-1">
                          <span className="text-on-surface-variant opacity-60 font-semibold flex items-center gap-1"><Hash size={12} /> Contract ID:</span>
                          <span className="font-mono font-bold text-[10px] text-on-surface">{displayId}</span>
                        </div>

                        {/* Date Created */}
                        <div className="flex justify-between items-center py-1">
                          <span className="text-on-surface-variant opacity-60 font-semibold flex items-center gap-1"><Calendar size={12} /> Date Created:</span>
                          <span className="font-bold text-on-surface">
                            {new Date(contract.contract_created_at).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric' 
                            })}
                          </span>
                        </div>

                        {/* Agreed Budget */}
                        <div className="flex justify-between items-center py-1">
                          <span className="text-on-surface-variant opacity-60 font-semibold flex items-center gap-1"><CreditCard size={12} /> Budget:</span>
                          <span className="font-extrabold text-on-surface">
                            {contract.budget ? `${contract.budget.toLocaleString()} ETB` : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action buttons */}
                    <div className="p-5 pt-0 border-t border-outline-variant/30 flex flex-col gap-2">
                      <div className="flex gap-2 w-full pt-4">
                        <Button asChild className="flex-1 rounded-xl text-xs font-bold uppercase tracking-wider h-10 shadow-sm active:scale-95 duration-150" variant="default">
                          <Link href={`/contracts/${contract.contract_id}`}>
                            <span>{isDraft ? (role === "client" ? "Open Draft" : "Review Draft") : isPending ? "Review & Sign" : "Manage"}</span>
                            <ArrowRight size={13} className="ml-1.5" />
                          </Link>
                        </Button>
                        
                        {(contract.signed_at || contract.pdf_url) && (
                          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shrink-0 border-outline-variant hover:text-primary hover:border-primary active:scale-95 duration-150" title="Download Agreement">
                            <Download size={14} />
                          </Button>
                        )}
                      </div>

                      {isCompleted && (
                        <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold uppercase tracking-wider h-10 text-primary border-primary/20 hover:bg-primary/5 active:scale-95 duration-150" asChild>
                          <Link href={role === 'client' ? `/client/rate/${contract.job_id}` : `/worker/rate/${contract.job_id}`}>
                            <Star size={12} className="mr-1.5 fill-primary stroke-none" />
                            Rate Partner
                          </Link>
                        </Button>
                      )}

                      {role === 'client' && ["completed", "payment_pending"].includes(contract.job_status) && (
                        <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold uppercase tracking-wider h-10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-400/20 active:scale-95 duration-150" asChild>
                          <Link href={`/client/pay/${contract.job_id}`}>
                            <CreditCard size={12} className="mr-1.5" />
                            Complete Payment
                          </Link>
                        </Button>
                      )}

                      {isDisputed && (
                        <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold uppercase tracking-wider h-10 text-rose-500 border-rose-500/20 hover:bg-rose-500/5 active:scale-95 duration-150">
                          <AlertTriangle size={12} className="mr-1.5" />
                          Open Resolution
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </section>
      ) : (
        /* Empty State */
        <Card className="border border-dashed border-outline-variant p-16 text-center bg-surface-container-lowest shadow-sm rounded-2xl">
          <CardContent className="space-y-4 pt-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mx-auto text-on-surface-variant/60">
              <FolderOpen size={24} />
            </div>
            <div className="max-w-xs mx-auto space-y-1">
              <p className="font-black text-sm uppercase tracking-wide text-on-surface">Repository Empty</p>
              <p className="text-xs text-on-surface-variant opacity-60 leading-relaxed">
                No service agreements were found matching your selection.
              </p>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl border-outline-variant font-bold uppercase tracking-wider text-xs px-4" asChild>
              <Link href={role === "client" ? "/client/search" : "/worker/dashboard"}>
                {role === "client" ? "Explore Professionals" : "Visit Dashboard"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </FadeContent>
  );
}

function getStatusLabel(status: string, signedAt: string | null) {
  switch (status) {
    case "DRAFT": return "Draft";
    case "READY_FOR_SIGNATURE": return "Ready to Sign";
    case "CLIENT_SIGNED": return "Client Signed";
    case "WORKER_SIGNED": return "Worker Signed";
    case "FULLY_SIGNED": return "Fully Signed";
    case "ACTIVE": return "Active";
  }
  if (!signedAt) return "Pending Signature";
  switch (status) {
    case "active": return "In Progress";
    case "completion_requested": return "Completion Review";
    case "completed": return "Finalized";
    case "payment_pending": return "Payment Pending";
    case "paid": return "Paid";
    case "closed": return "Closed";
    case "disputed": return "In Dispute";
    case "cancelled": return "Terminated";
    default: return status;
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "DRAFT": return "bg-surface-container text-on-surface-variant border-outline-variant/40";
    case "READY_FOR_SIGNATURE": return "bg-primary/10 text-primary border-primary/20";
    case "CLIENT_SIGNED":
    case "WORKER_SIGNED":
    case "FULLY_SIGNED":
    case "ACTIVE":
    case "active": return "bg-primary/10 text-primary border-primary/20";
    case "completion_requested":
    case "completed":
    case "payment_pending":
    case "paid":
    case "closed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "disputed": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    case "cancelled": return "bg-surface-container text-on-surface-variant border-outline-variant/40";
    default: return "bg-surface-container text-on-surface-variant border-outline-variant/40";
  }
}
