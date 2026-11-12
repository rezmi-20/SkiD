"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Award,
  User,
  X,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Phone,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
  Eye,
  Briefcase,
  Trophy,
  TrendingUp,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";
import { toWorkerDisplayStatus } from "@/lib/worker-verification";
import { WorkerReviewDrawer, WorkerQueueItem } from "./dashboard/WorkerReviewDrawer";

export interface WorkerData {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  skills: string[] | null;
  district: string | null;
  experienceYears: number | null;
  verificationStatus?: string | null;
  isVerified: boolean;
  isSuspended?: boolean | null;
  identityComplete?: boolean | null;
  hasDocument: boolean;
  createdAt: string;
}

export interface TopPerformerArtisan {
  id: string;
  name: string;
  specialty: string;
  district: string;
  avatar_url?: string | null;
  jobs: number;
  revenue: number;
  rating: number;
  rank: number;
}

interface Props {
  initialWorkers: WorkerData[];
  topPerformers?: TopPerformerArtisan[];
  verificationCapabilities: {
    canReview: boolean;
    canApprove: boolean;
    canReject: boolean;
  };
}

export function WorkersManagementClient({
  initialWorkers,
  topPerformers = [],
  verificationCapabilities,
}: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [drawerWorker, setDrawerWorker] = useState<WorkerQueueItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const displayStatus = (worker: WorkerData) =>
    toWorkerDisplayStatus(
      worker.verificationStatus,
      worker.isVerified,
      worker.isSuspended,
      worker.identityComplete !== false
    );

  const counts = useMemo(() => {
    return {
      all: initialWorkers.length,
      approved: initialWorkers.filter((w) => displayStatus(w) === "approved").length,
      pending: initialWorkers.filter((w) => displayStatus(w) !== "approved").length,
    };
  }, [initialWorkers]);

  // Aggregate all unique skills
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    for (const w of initialWorkers) {
      if (Array.isArray(w.skills)) {
        for (const s of w.skills) {
          if (s) set.add(s);
        }
      }
    }
    return Array.from(set);
  }, [initialWorkers]);

  // Performance chart data from topPerformers
  const chartData = useMemo(() => {
    return topPerformers.map((p) => ({
      name: p.name.split(" ")[0],
      fullName: p.name,
      revenue: Math.round(p.revenue / 1000), // in thousands ETB
      jobs: p.jobs,
    }));
  }, [topPerformers]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return initialWorkers.filter((w) => {
      const status = displayStatus(w);
      const matchesSearch =
        !query ||
        w.fullName.toLowerCase().includes(query) ||
        w.email.toLowerCase().includes(query) ||
        (w.phone && w.phone.includes(query)) ||
        (w.district && w.district.toLowerCase().includes(query)) ||
        (w.skills && w.skills.some((s) => s.toLowerCase().includes(query)));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && status === "approved") ||
        (statusFilter === "pending" && status !== "approved");

      const matchesSkill =
        skillFilter === "all" ||
        (w.skills && w.skills.some((s) => s.toLowerCase() === skillFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesSkill;
    });
  }, [initialWorkers, search, statusFilter, skillFilter]);

  const handleOpenDrawer = (w: WorkerData) => {
    setDrawerWorker({
      user_id: w.userId,
      full_name: w.fullName,
      email: w.email,
      phone: w.phone || undefined,
      skills: w.skills,
      has_document: w.hasDocument,
      verification_status: displayStatus(w),
      is_verified: w.isVerified,
      is_suspended: Boolean(w.isSuspended),
      created_at: w.createdAt,
    });
    setIsDrawerOpen(true);
  };

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("admin.workers.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("admin.workers.desc")}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === "grid"
                ? "bg-secondary text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t("admin.workers.view.grid")}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === "table"
                ? "bg-secondary text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{t("admin.workers.view.table")}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Performing Artisans Performance Chart (Full-width, clean design) */}
      {topPerformers.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">{t("admin.workers.chart.title")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("admin.workers.chart.desc")}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="text-muted-foreground font-medium">{t("admin.workers.chart.earnings")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                <span className="text-muted-foreground font-medium">{t("admin.workers.chart.completedJobs")}</span>
              </div>
            </div>
          </div>

          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 260)" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
                  dy={5}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
                  tickFormatter={(value) => `${value}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.12 0.005 260)",
                    border: "1px solid oklch(0.22 0.005 260)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "oklch(0.95 0 0)", fontWeight: 600 }}
                  formatter={(value: any, name: any) => [
                    name === "revenue" ? `ETB ${(Number(value || 0) * 1000).toLocaleString()}` : `${value} gigs`,
                    name === "revenue" ? t("admin.workers.chart.earnings") : t("admin.workers.chart.completedJobs"),
                  ]}
                />
                <Bar dataKey="jobs" fill="oklch(0.65 0 0 / 0.25)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="oklch(0.7 0.18 145)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. Search & Filter Bar (Uncontained) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.workers.searchPlaceholder")}
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Skill / Trade Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSkillFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
              skillFilter === "all"
                ? "bg-accent text-accent-foreground shadow-xs font-bold"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All Trades ({counts.all})
          </button>
          {allSkills.slice(0, 5).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => setSkillFilter(skill)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                skillFilter === skill
                  ? "bg-accent text-accent-foreground shadow-xs font-bold"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Artisans Presentation: 3-Column Portfolio Cards or Table */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((worker) => {
            const status = displayStatus(worker);
            const isApproved = status === "approved";

            return (
              <div
                key={worker.userId}
                className="rounded-xl border border-border bg-card p-5 space-y-4 hover:border-accent/40 transition-all duration-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Avatar, Name & Status Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center font-bold text-foreground text-sm shadow-xs shrink-0">
                        {worker.fullName?.charAt(0) || <User className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-foreground truncate">{worker.fullName}</h3>
                        <p className="text-xs text-muted-foreground truncate">{worker.email}</p>
                        {worker.district && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3 text-accent" />
                            <span>{worker.district}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                        isApproved
                          ? "bg-success/10 text-success border-success/20"
                          : worker.isSuspended
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isApproved ? "bg-success" : worker.isSuspended ? "bg-destructive" : "bg-warning"
                        }`}
                      />
                      <span className="capitalize">{worker.isSuspended ? "Suspended" : status}</span>
                    </span>
                  </div>

                  {/* Trade Skills Chips */}
                  <div className="mt-3.5 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Trade Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(worker.skills) && worker.skills.length > 0 ? (
                        worker.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No specialized trade listed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenDrawer(worker)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold border border-border transition cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span>{t("admin.workers.quickInspect")}</span>
                    </button>

                    <Link
                      href={`/admin/workers/${worker.userId}`}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-semibold border border-accent/20 transition"
                    >
                      <User className="w-3 h-3" />
                      <span>Profile</span>
                    </Link>
                  </div>

                  {worker.phone && (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      +251 {worker.phone}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-muted-foreground bg-card border border-border rounded-xl">
              No artisans found matching the current search criteria.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-secondary/50">
                  <th className="py-3 px-4">Artisan</th>
                  <th className="py-3 px-4">Trade Specialization</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filtered.map((worker) => {
                  const status = displayStatus(worker);
                  const isApproved = status === "approved";

                  return (
                    <tr key={worker.userId} className="hover:bg-secondary/40 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs text-muted-foreground">
                            {worker.fullName?.charAt(0) || <User className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-xs">{worker.fullName}</p>
                            <p className="text-[11px] text-muted-foreground">{worker.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs">
                        <span className="font-medium text-foreground">
                          {Array.isArray(worker.skills) && worker.skills.length > 0
                            ? worker.skills.slice(0, 2).join(", ")
                            : "General Crafts"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {worker.district || "Dire Dawa"}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            isApproved
                              ? "bg-success/10 text-success border-success/20"
                              : worker.isSuspended
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved ? "bg-success" : worker.isSuspended ? "bg-destructive" : "bg-warning"
                            }`}
                          />
                          <span className="capitalize">{worker.isSuspended ? "Suspended" : status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                        {new Date(worker.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(worker)}
                            className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Review</span>
                          </button>

                          <Link
                            href={`/admin/workers/${worker.userId}`}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-medium transition"
                          >
                            <User className="h-3 w-3" />
                            <span>Profile</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-out Review Sheet Drawer */}
      <WorkerReviewDrawer
        worker={drawerWorker}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        canReview={verificationCapabilities.canReview}
        canApprove={verificationCapabilities.canApprove}
        canReject={verificationCapabilities.canReject}
        onStatusChanged={() => {
          setIsDrawerOpen(false);
        }}
      />
    </FadeContent>
  );
}
