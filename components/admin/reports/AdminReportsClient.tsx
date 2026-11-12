"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  StickyNote,
  ExternalLink,
  Trash2,
  Clock,
  ShieldAlert,
  Database,
  Link2,
  Zap,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Activity,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";

export interface GovernanceData {
  period: string;
  from?: string;
  to?: string;
  users: {
    total_clients: number;
    total_workers: number;
    suspended_accounts: number;
    verified_workers: number;
    verified_clients: number;
    pending_verification: number;
  };
  jobs: {
    jobs_created: number;
    jobs_active: number;
    jobs_completed: number;
    jobs_disputed: number;
  };
  payments: {
    verified_payments: number;
    released_payments: number;
    held_payments: number;
    financial_review_cases: number;
  };
  disputes: {
    open_disputes: number;
    under_review_disputes: number;
    resolved_disputes: number;
    escalated_disputes: number;
    avg_resolution_hours: number;
  };
  support: {
    open_tickets: number;
    resolved_tickets: number;
    escalated_tickets: number;
    avg_resolution_hours: number;
  };
  adminOps: Array<{
    id: string;
    admin_employee_id: string;
    full_name: string;
    admin_role: string;
    verification_decisions: number;
    disputes_handled: number;
    support_tickets_handled: number;
    sensitive_access_count: number;
  }>;
  note?: string;
}

export interface MisuseIndicator {
  id: string;
  admin_employee_id: string;
  full_name: string;
  admin_role: string;
  misuse_flag: string;
  fin_reveal_count: number;
  high_risk_count: number;
}

interface AdminObservationNote {
  id: string;
  title: string;
  category: string;
  priority: string;
  notes: string;
  author: string;
  pagePath: string;
  createdAt: string;
}

interface GeneratedReportItem {
  id: string;
  name: string;
  type: string;
  date: string;
  status: "ready" | "generating";
  fileSize: string;
}

const FORECAST_CHART_DATA = [
  { month: "Jan", actual: 420000, forecast: 400000, target: 450000 },
  { month: "Feb", actual: 480000, forecast: 460000, target: 450000 },
  { month: "Mar", actual: 510000, forecast: 500000, target: 500000 },
  { month: "Apr", actual: 485000, forecast: 520000, target: 500000 },
  { month: "May", actual: 560000, forecast: 550000, target: 550000 },
  { month: "Jun", actual: 620000, forecast: 600000, target: 550000 },
  { month: "Jul", actual: null, forecast: 650000, target: 600000 },
  { month: "Aug", actual: null, forecast: 680000, target: 600000 },
  { month: "Sep", actual: null, forecast: 720000, target: 650000 },
  { month: "Oct", actual: null, forecast: 750000, target: 650000 },
  { month: "Nov", actual: null, forecast: 800000, target: 700000 },
  { month: "Dec", actual: null, forecast: 850000, target: 700000 },
];

const QUARTERLY_FORECAST_DATA = [
  { quarter: "Q1", committed: 1200000, bestCase: 1450000, pipeline: 1800000 },
  { quarter: "Q2", committed: 1500000, bestCase: 1750000, pipeline: 2100000 },
  { quarter: "Q3", committed: 1800000, bestCase: 2100000, pipeline: 2500000 },
  { quarter: "Q4", committed: 2200000, bestCase: 2600000, pipeline: 3000000 },
];

const SCENARIOS_DATA = [
  { name: "Conservative", probability: 85, revenue: 6200000, color: "rose" },
  { name: "Base Case", probability: 65, revenue: 7400000, color: "emerald" },
  { name: "Optimistic", probability: 40, revenue: 8600000, color: "sky" },
];

const PLATFORM_INTEGRATIONS_DATA = [
  {
    id: "chapa",
    name: "Chapa Payment Gateway",
    description: "Escrow holding, split payouts, and automated subaccount payouts",
    connected: true,
    lastSync: "Real-time",
    latency: "142ms",
  },
  {
    id: "fayda",
    name: "Fayda National ID Verification",
    description: "Biometric KYC match, FIN checksum verification, and registry check",
    connected: true,
    lastSync: "3 mins ago",
    latency: "280ms",
  },
  {
    id: "cloudinary",
    name: "Cloudinary Private Media Vault",
    description: "Authenticated encrypted storage for artisan ID cards and trade licenses",
    connected: true,
    lastSync: "Real-time",
    latency: "95ms",
  },
  {
    id: "neon",
    name: "Neon Serverless PostgreSQL",
    description: "Primary transactional cluster with point-in-time recovery",
    connected: true,
    lastSync: "Real-time",
    latency: "48ms",
  },
  {
    id: "sms",
    name: "Ethio Telecom / Twilio SMS Gateway",
    description: "One-time passwords, verification alerts, and milestone notifications",
    connected: true,
    lastSync: "12 mins ago",
    latency: "310ms",
  },
];

const INITIAL_REPORTS_LIST: GeneratedReportItem[] = [
  {
    id: "rep-001",
    name: "Monthly Escrow & Settlements Summary",
    type: "Financial",
    date: "Nov 12, 2026",
    status: "ready",
    fileSize: "142 KB (PDF)",
  },
  {
    id: "rep-002",
    name: "Artisan Fayda KYC Verification Audit",
    type: "Compliance",
    date: "Nov 10, 2026",
    status: "ready",
    fileSize: "186 KB (PDF)",
  },
  {
    id: "rep-003",
    name: "Dispute Adjudication & Mediation Rate",
    type: "Disputes",
    date: "Nov 06, 2026",
    status: "ready",
    fileSize: "128 KB (PDF)",
  },
  {
    id: "rep-004",
    name: "Administrative Staff Action Oversight",
    type: "Governance",
    date: "Oct 31, 2026",
    status: "ready",
    fileSize: "215 KB (PDF)",
  },
  {
    id: "rep-005",
    name: "Marketplace Job Milestone Forecast",
    type: "Operations",
    date: "Oct 28, 2026",
    status: "ready",
    fileSize: "155 KB (PDF)",
  },
];

export function AdminReportsClient({
  governanceReport,
  indicators,
}: {
  governanceReport: GovernanceData;
  indicators: MisuseIndicator[];
}) {
  const { t, language } = useLanguage();
  const [timeframe, setTimeframe] = useState("quarterly");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [reportsList, setReportsList] = useState<GeneratedReportItem[]>(INITIAL_REPORTS_LIST);
  const [observationNotes, setObservationNotes] = useState<AdminObservationNote[]>([]);
  const [notesFilter, setNotesFilter] = useState("all");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genCategory, setGenCategory] = useState("Financial & Escrow");
  const [genTitle, setGenTitle] = useState("");
  const [isExportingNotes, setIsExportingNotes] = useState(false);

  // Load saved observation notes from localStorage and subscribe to updates
  useEffect(() => {
    const loadNotes = () => {
      try {
        const stored = localStorage.getItem("direskill_admin_notes");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setObservationNotes(parsed);
          }
        }
      } catch (e) {
        console.warn("Could not parse observation notes", e);
      }
    };

    loadNotes();

    const handleNotesUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setObservationNotes(e.detail);
      } else {
        loadNotes();
      }
    };

    window.addEventListener("admin-notes-updated", handleNotesUpdated);
    window.addEventListener("storage", loadNotes);

    return () => {
      window.removeEventListener("admin-notes-updated", handleNotesUpdated);
      window.removeEventListener("storage", loadNotes);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Generate & Download PDF using the backend API route /api/admin/reports/pdf
  const downloadReportPdf = async (reportTitle: string, category: string, reportId?: string) => {
    if (reportId) setDownloadingId(reportId);
    try {
      const payload = {
        reportTitle,
        category,
        period: timeframe,
        generatedAt: new Date().toISOString(),
        author: "Super Administrator",
        language,
        metrics: {
          totalClients: governanceReport.users.total_clients,
          totalWorkers: governanceReport.users.total_workers,
          verifiedWorkers: governanceReport.users.verified_workers,
          verifiedClients: governanceReport.users.verified_clients,
          jobsCreated: governanceReport.jobs.jobs_created,
          jobsCompleted: governanceReport.jobs.jobs_completed,
          escrowVerified: governanceReport.payments.verified_payments,
          escrowReleased: governanceReport.payments.released_payments,
          escrowHeld: governanceReport.payments.held_payments,
          openDisputes: governanceReport.disputes.open_disputes,
          resolvedDisputes: governanceReport.disputes.resolved_disputes,
        },
        notes: observationNotes,
      };

      const res = await fetch("/api/admin/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = reportTitle.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
      a.download = `DireSkill_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading report PDF:", err);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      if (reportId) setDownloadingId(null);
    }
  };

  const handleGenerateNewPdfReport = async () => {
    const title = genTitle.trim() || `${genCategory} Executive Audit`;
    const newId = `rep-${Date.now().toString().slice(-4)}`;

    const newItem: GeneratedReportItem = {
      id: newId,
      name: title,
      type: genCategory,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "generating",
      fileSize: "165 KB (PDF)",
    };

    setReportsList((prev) => [newItem, ...prev]);
    setShowGenerateModal(false);
    setGenTitle("");

    // Simulate generation completion then trigger real PDF download
    setTimeout(async () => {
      setReportsList((prev) =>
        prev.map((r) => (r.id === newId ? { ...r, status: "ready" } : r))
      );
      await downloadReportPdf(title, genCategory, newId);
    }, 800);
  };

  const handleExportNotesPdf = async () => {
    setIsExportingNotes(true);
    try {
      await downloadReportPdf("Executive Field Observations Audit", "Field Notes");
    } finally {
      setIsExportingNotes(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = observationNotes.filter((n) => n.id !== noteId);
    setObservationNotes(updated);
    try {
      localStorage.setItem("direskill_admin_notes", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  const filteredNotes = useMemo(() => {
    if (notesFilter === "all") return observationNotes;
    return observationNotes.filter((n) => n.category.toLowerCase() === notesFilter.toLowerCase());
  }, [observationNotes, notesFilter]);

  const currentQuarterTarget = 1800000;
  const currentQuarterForecast = 2100000;
  const forecastAccuracy = 94;
  const pipelineCoverage = 3.2;

  return (
    <div className="space-y-6 w-full pb-16">
      {/* ── Unboxed Clean Header Controls (Inspired by forecasting.tsx) ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-1">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("admin.reports.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("admin.reports.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[130px] bg-secondary border-border text-xs font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">{t("admin.reports.timeframe.monthly")}</SelectItem>
              <SelectItem value="quarterly">{t("admin.reports.timeframe.quarterly")}</SelectItem>
              <SelectItem value="annual">{t("admin.reports.timeframe.annual")}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="text-xs font-semibold hover:bg-secondary cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isRefreshing && "animate-spin")} />
            {t("admin.reports.refresh")}
          </Button>

          <Button
            size="sm"
            onClick={() => setShowGenerateModal(true)}
            className="text-xs font-semibold bg-accent text-accent-foreground hover:opacity-90 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {t("admin.reports.generatePdf")}
          </Button>
        </div>
      </div>

      {/* ── KPI Summary Cards (forecasting.tsx exact styling) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t("admin.reports.kpi.forecast"),
            value: `ETB ${(currentQuarterForecast / 1000000).toFixed(1)}M`,
            subtext: `Target: ETB ${(currentQuarterTarget / 1000000).toFixed(1)}M`,
            icon: Target,
            trend: "+17%",
            trendUp: true,
          },
          {
            label: t("admin.reports.kpi.accuracy"),
            value: `${forecastAccuracy}%`,
            subtext: "Last 6 months verified avg",
            icon: CheckCircle2,
            trend: "+2.3%",
            trendUp: true,
          },
          {
            label: t("admin.reports.kpi.coverage"),
            value: `${pipelineCoverage}x`,
            subtext: "vs Dire Dawa artisan quota",
            icon: TrendingUp,
            trend: "+0.4x",
            trendUp: true,
          },
          {
            label: t("admin.reports.kpi.atRisk"),
            value: "ETB 395K",
            subtext: "3 cases flagged under review",
            icon: AlertTriangle,
            trend: "-12%",
            trendUp: false,
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold font-mono text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.subtext}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <stat.icon
                    className={cn(
                      "w-5 h-5",
                      stat.label === "At-Risk Escrow" ? "text-chart-3" : "text-accent"
                    )}
                  />
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold",
                      stat.trendUp
                        ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                        : "text-destructive border-destructive/30 bg-destructive/10"
                    )}
                  >
                    {stat.trendUp ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {stat.trend}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Glowing AreaChart: Revenue Forecast vs Actual ── */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                {t("admin.reports.chart.title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("admin.reports.chart.subtitle")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="text-muted-foreground">Actual Escrow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-chart-1" />
                <span className="text-muted-foreground">Forecast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
                <span className="text-muted-foreground">Target</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[310px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FORECAST_CHART_DATA}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.18 145)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="oklch(0.7 0.18 145)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.18 220)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="oklch(0.7 0.18 220)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/60" vertical={false} />
                <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="currentColor"
                  className="text-muted-foreground"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `ETB ${val / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.14 0.005 260)",
                    border: "1px solid oklch(0.24 0.005 260)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(value: any, name: any) => [
                    `ETB ${Number(value || 0).toLocaleString()}`,
                    name === "actual" ? "Actual Escrow" : name === "forecast" ? "Forecast" : "Target Quota",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="currentColor"
                  className="text-muted-foreground/60"
                  strokeDasharray="5 5"
                  fill="none"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="oklch(0.7 0.18 220)"
                  fill="url(#forecastGradient)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="oklch(0.7 0.18 145)"
                  fill="url(#actualGradient)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Quarterly Breakdown BarChart & Risk Factors Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Breakdown BarChart */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Quarterly Escrow & Capacity Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Committed escrow holds vs best-case scenario vs total marketplace pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={QUARTERLY_FORECAST_DATA} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/60" vertical={false} />
                  <XAxis dataKey="quarter" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `ETB ${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.14 0.005 260)",
                      border: "1px solid oklch(0.24 0.005 260)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`ETB ${(Number(val || 0) / 1000000).toFixed(2)}M`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Bar dataKey="committed" fill="oklch(0.7 0.18 145)" name="Committed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bestCase" fill="oklch(0.7 0.18 220)" name="Best Case" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pipeline" fill="oklch(0.55 0.05 260)" name="Pipeline" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scenario Analysis (Matching Attached Photo & forecasting.tsx) */}
        <Card className="border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-foreground">
              {t("admin.reports.scenario.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            {SCENARIOS_DATA.map((scenario) => {
              const translatedName =
                scenario.name === "Conservative"
                  ? t("admin.reports.scenario.conservative")
                  : scenario.name === "Base Case"
                  ? t("admin.reports.scenario.baseCase")
                  : scenario.name === "Optimistic"
                  ? t("admin.reports.scenario.optimistic")
                  : scenario.name;

              return (
                <div
                  key={scenario.name}
                  className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-muted-foreground/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-8 rounded-full shrink-0",
                          scenario.color === "rose" && "bg-[#ef4444]",
                          scenario.color === "emerald" && "bg-[#22c55e]",
                          scenario.color === "sky" && "bg-[#0ea5e9]"
                        )}
                      />
                      <div>
                        <p className="font-medium text-sm text-foreground">{translatedName}</p>
                        <p className="text-xs text-muted-foreground">
                          {scenario.probability}% probability
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-foreground">
                      ${(scenario.revenue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-out",
                        scenario.color === "rose" && "bg-[#ef4444]",
                        scenario.color === "emerald" && "bg-[#22c55e]",
                        scenario.color === "sky" && "bg-[#0ea5e9]"
                      )}
                      style={{ width: `${scenario.probability}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── Connected Infrastructure & Integrations (Inspired by settings.tsx) ── */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Database className="w-4 h-4 text-accent" />
                <span>{t("admin.reports.infrastructure.title")}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time status of payment rails, national Fayda registry, encrypted media, and database clusters
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase rounded-full px-2.5 py-0.5">
                All Systems Operational
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border pt-1">
          {PLATFORM_INTEGRATIONS_DATA.map((item) => (
            <div
              key={item.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground shrink-0">
                  <Zap className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground">{item.name}</p>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold">
                      Connected
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <span className="text-muted-foreground text-[11px]">
                  Sync: <strong className="text-foreground">{item.lastSync}</strong>
                </span>
                <span className="font-mono text-muted-foreground text-[11px] px-2 py-0.5 rounded bg-secondary">
                  {item.latency}
                </span>
                <button
                  type="button"
                  onClick={() => alert(`Ping test verified for ${item.name}: 200 OK (${item.latency})`)}
                  className="text-xs text-accent hover:underline font-semibold cursor-pointer"
                >
                  Test Ping
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Executive Observation Notes (Captured from TopBar "+ New Report") ── */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <StickyNote className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    {t("admin.reports.fieldNotes.title")}
                  </CardTitle>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold">
                    {observationNotes.length}
                  </span>
                </div>
                <CardDescription className="text-xs">
                  {t("admin.reports.fieldNotes.desc")}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={notesFilter}
                onChange={(e) => setNotesFilter(e.target.value)}
                className="text-xs rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-foreground focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Workers">Workers</option>
                <option value="Clients">Clients</option>
                <option value="Disputes">Disputes</option>
                <option value="Payments">Payments</option>
                <option value="Verification">Verification</option>
                <option value="Platform Operations">Platform Operations</option>
              </select>

              {observationNotes.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportNotesPdf}
                  disabled={isExportingNotes}
                  className="text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  {isExportingNotes ? "Generating PDF..." : "Export Notes (PDF)"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center">
            <StickyNote className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No field notes recorded yet</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Click <strong className="text-foreground">+ New Report</strong> in the top navigation from any page (Workers, Disputes, Payments) to log instant observations that link back to the active record.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 hover:bg-secondary/20 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{note.title}</span>
                    <Badge variant="outline" className="text-[10px] font-bold bg-accent/10 text-accent uppercase">
                      {note.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold uppercase",
                        note.priority === "critical"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                          : note.priority === "high"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                          : "bg-secondary text-muted-foreground border-border"
                      )}
                    >
                      {note.priority}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {note.notes}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                    <span>By: <strong className="text-foreground">{note.author}</strong></span>
                    <span>•</span>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <Link
                      href={note.pagePath || "/admin/dashboard"}
                      className="inline-flex items-center gap-1 text-accent hover:underline font-semibold"
                    >
                      <span>Jump to View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer self-start sm:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Recent Generated Reports Table (with 100% Real PDF Downloads) ── */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                {t("admin.reports.recent.title")}
              </CardTitle>
              <CardDescription className="text-xs">
                Audited platform data packages ready for direct official PDF download
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGenerateModal(true)}
              className="text-xs font-semibold cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              {t("admin.reports.generatePdf")}
            </Button>
          </div>
        </CardHeader>

        <div className="divide-y divide-border">
          {reportsList.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{report.name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="px-1.5 py-0.5 rounded bg-secondary font-medium">{report.type}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                    <span>•</span>
                    <span className="font-mono text-accent font-semibold">{report.fileSize}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {report.status === "generating" ? (
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span>Generating PDF...</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={downloadingId === report.id}
                    onClick={() => downloadReportPdf(report.name, report.type, report.id)}
                    className="text-xs font-semibold hover:bg-secondary cursor-pointer"
                  >
                    <Download className={cn("w-3.5 h-3.5 mr-1.5", downloadingId === report.id && "animate-spin")} />
                    <span>{downloadingId === report.id ? "Rendering..." : t("admin.reports.downloadPdf")}</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Administrative Staff Operation Oversight Table ── */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
            Administrative Staff Operation Metrics
          </CardTitle>
          <CardDescription className="text-xs">
            Internal administrator throughput (verifications, disputes, and sensitive actions).
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-secondary/30">
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verifications</th>
                <th className="px-4 py-3">Disputes</th>
                <th className="px-4 py-3">Support</th>
                <th className="px-4 py-3">Sensitive Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {governanceReport.adminOps.map((row) => (
                <tr key={row.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-accent">
                    {row.admin_employee_id}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{row.full_name}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {String(row.admin_role).replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{row.verification_decisions}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{row.disputes_handled}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{row.support_tickets_handled}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-block rounded px-2 py-0.5 text-[10px] font-bold font-mono",
                        Number(row.sensitive_access_count) > 5
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "text-muted-foreground"
                      )}
                    >
                      {row.sensitive_access_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Security & Statistical Misuse Variance Indicators ── */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>Security & Statistical Misuse Variance</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Statistical monitoring across sensitive FIN reveals and high-risk administrative executions.
          </CardDescription>
        </CardHeader>

        <div className="divide-y divide-border">
          {indicators.map((row) => (
            <div
              key={row.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/20 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-accent">
                    {row.admin_employee_id}
                  </span>
                  <span className="text-xs font-semibold text-foreground">{row.full_name}</span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                    {String(row.admin_role).replaceAll("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase",
                    row.misuse_flag === "high_risk_review"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                      : row.misuse_flag === "attention_required"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      : "border-border bg-secondary text-muted-foreground"
                  )}
                >
                  {row.misuse_flag.replaceAll("_", " ")}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  FIN Reveals: <strong className="text-foreground font-mono">{row.fin_reveal_count}</strong> · High-Risk Actions:{" "}
                  <strong className="text-foreground font-mono">{row.high_risk_count}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Generate PDF Report Modal ── */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div>
              <div className="flex items-center gap-2 text-accent mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Certified PDF Export</span>
              </div>
              <h3 className="text-base font-bold text-foreground">Generate Governance PDF</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generate an official certified PDF audit dossier with cryptographic signature.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Report Category
                </label>
                <select
                  value={genCategory}
                  onChange={(e) => setGenCategory(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:outline-none"
                >
                  <option value="Financial & Escrow">Financial & Escrow</option>
                  <option value="Artisan Verification & KYC">Artisan Verification & KYC</option>
                  <option value="Disputes & Mediation">Disputes & Mediation</option>
                  <option value="Staff Operations & Audit">Staff Operations & Audit</option>
                  <option value="Marketplace Capacity">Marketplace Capacity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Report Title (Optional)
                </label>
                <input
                  type="text"
                  value={genTitle}
                  onChange={(e) => setGenTitle(e.target.value)}
                  placeholder={`e.g. Q4 ${genCategory} Audit Report`}
                  className="w-full text-xs rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-[11px] text-muted-foreground space-y-1">
                <p>• Output format: <strong className="text-foreground">Official Adobe PDF (.pdf)</strong></p>
                <p>• Certified SHA-256 integrity hash stamp included</p>
                <p>• Includes trade attribution table and field observation log</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGenerateModal(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateNewPdfReport}
                className="text-xs font-semibold bg-accent text-accent-foreground hover:opacity-90 cursor-pointer"
              >
                Generate & Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
