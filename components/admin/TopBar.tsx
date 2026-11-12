"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Plus,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  X,
  FileText,
  ShieldCheck,
  Scale,
  Users,
  DollarSign,
  Briefcase,
  AlertTriangle,
  LifeBuoy,
  Download,
  CheckCircle2,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/lib/translations";
import type { AdminRole } from "@/lib/admin-authorization";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TopBarProps {
  adminName: string;
  adminRole: AdminRole;
}

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "am", label: "አማ" },
  { code: "om", label: "OM" },
];

interface SearchResultItem {
  id: string;
  title: string;
  category: string;
  href: string;
  keywords: string[];
}

const SEARCH_DATABASE: SearchResultItem[] = [
  { id: "disputes", title: "Disputes & Mediation Studio", category: "Legal & Escrow", href: "/admin/disputes", keywords: ["disp", "dispute", "claim", "arbitration", "mediation", "refund"] },
  { id: "workers", title: "Workers & Skilled Artisans", category: "Directory", href: "/admin/workers", keywords: ["work", "worker", "artisan", "plumber", "electrician", "painter", "mason"] },
  { id: "clients", title: "Employer Clients Directory", category: "Directory", href: "/admin/clients", keywords: ["cli", "client", "employer", "customer", "hirer"] },
  { id: "verify", title: "KYC Verification Queue", category: "Identity", href: "/admin/verify", keywords: ["veri", "verify", "kyc", "fayda", "national id", "fin", "approval"] },
  { id: "photos", title: "Photo & Avatar Requests", category: "Identity", href: "/admin/worker-avatar-requests", keywords: ["photo", "avatar", "picture", "headshot"] },
  { id: "payments", title: "Payment Cases & Settlement Logs", category: "Finance", href: "/admin/payments", keywords: ["pay", "payment", "chapa", "cbe", "telebirr", "escrow", "fee"] },
  { id: "contracts", title: "Contracts Oversight Registry", category: "Operations", href: "/admin/contracts", keywords: ["cont", "contract", "agreement", "milestone", "pin", "signature"] },
  { id: "jobs", title: "Marketplace Jobs Oversight", category: "Operations", href: "/admin/jobs", keywords: ["job", "gig", "task", "post", "listing"] },
  { id: "reports", title: "Analytics & Executive Reports", category: "System", href: "/admin/reports", keywords: ["repo", "report", "analytics", "stats", "volume", "metrics"] },
  { id: "settings", title: "Platform Settings & Gateways", category: "System", href: "/admin/settings", keywords: ["sett", "settings", "simulator", "gateway", "commission", "sandbox"] },
  { id: "support", title: "User Support Tickets", category: "Operations", href: "/admin/support", keywords: ["supp", "support", "ticket", "help", "customer care"] },
  { id: "audit", title: "System Audit Logs", category: "Security", href: "/admin/audit", keywords: ["audi", "audit", "logs", "security", "activity", "event"] },
  { id: "users", title: "Staff & Role Clearances", category: "Governance", href: "/admin/users", keywords: ["user", "staff", "role", "clearance", "employee", "admin"] },
  { id: "profile", title: "Admin Profile & Credentials", category: "Account", href: "/admin/profile", keywords: ["prof", "profile", "password", "2fa", "security", "credentials"] },
  { id: "appeals", title: "Appeals Adjudication", category: "Legal", href: "/admin/appeals", keywords: ["appe", "appeal", "overturn", "reconsider"] },
  { id: "evidence", title: "Court Evidence Vault", category: "Legal", href: "/admin/court-evidence", keywords: ["court", "evidence", "legal", "vault", "r2"] },
  { id: "community", title: "Community Feed Moderation", category: "Operations", href: "/admin/community", keywords: ["comm", "community", "post", "moderation", "forum"] },
];

export function TopBar({ adminName, adminRole }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [activeRange, setActiveRange] = useState("This month");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Profile Dropdown state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Report Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportCategory, setReportCategory] = useState("Platform Operations");
  const [reportPriority, setReportPriority] = useState("Routine");
  const [reportNotes, setReportNotes] = useState("");
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const r = url.searchParams.get("range");
      if (r) setActiveRange(r);
    }
    setCurrentTime(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    );

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter search database
  const searchResults = searchQuery.trim()
    ? SEARCH_DATABASE.filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.includes(q))
        );
      })
    : [];

  const handleRangeSelect = (range: string) => {
    setActiveRange(range);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("range", range);
      window.history.replaceState({}, "", url.toString());
      window.dispatchEvent(new CustomEvent("admin-range-change", { detail: range }));
    }
  };

  const getPageInfo = () => {
    if (!pathname) return { title: t("admin.sidebar.overview"), category: "Platform Operations" };
    if (pathname.includes("/admin/workers")) return { title: t("admin.sidebar.workers"), category: "Artisan Operations" };
    if (pathname.includes("/admin/clients")) return { title: t("admin.sidebar.clients"), category: "Client Accounts" };
    if (pathname.includes("/admin/verify")) return { title: t("admin.sidebar.verifyQueue"), category: "Identity & Verification" };
    if (pathname.includes("/admin/worker-avatar-requests")) return { title: t("admin.sidebar.photoRequests"), category: "Identity & Verification" };
    if (pathname.includes("/admin/jobs")) return { title: t("admin.sidebar.jobs"), category: "Jobs Oversight" };
    if (pathname.includes("/admin/contracts")) return { title: t("admin.sidebar.contracts"), category: "Contracts Registry" };
    if (pathname.includes("/admin/payments")) return { title: t("admin.sidebar.payments"), category: "Escrow & Settlements" };
    if (pathname.includes("/admin/disputes")) return { title: t("admin.sidebar.disputes"), category: "Dispute Adjudication" };
    if (pathname.includes("/admin/community")) return { title: t("admin.sidebar.community"), category: "Community Operations" };
    if (pathname.includes("/admin/support")) return { title: t("admin.sidebar.support"), category: "User Support" };
    if (pathname.includes("/admin/appeals")) return { title: t("admin.sidebar.appeals"), category: "Legal Governance" };
    if (pathname.includes("/admin/misconduct")) return { title: t("admin.sidebar.misconduct"), category: "Governance & Ethics" };
    if (pathname.includes("/admin/court-evidence")) return { title: t("admin.sidebar.courtEvidence"), category: "Legal Vault" };
    if (pathname.includes("/admin/audit")) return { title: t("admin.sidebar.audit"), category: "System Security" };
    if (pathname.includes("/admin/reports")) return { title: t("admin.sidebar.reports"), category: "System Telemetry" };
    if (pathname.includes("/admin/settings")) return { title: t("admin.sidebar.settings"), category: "Platform Governance" };
    if (pathname.includes("/admin/users")) return { title: t("admin.sidebar.users"), category: "Access Roles" };
    if (pathname.includes("/admin/profile")) return { title: t("admin.sidebar.profile"), category: "Account Security" };
    return { title: t("admin.sidebar.overview"), category: "Platform Operations" };
  };

  const pageInfo = getPageInfo();

  const handleOpenReportModal = () => {
    setReportTitle(`Observation: ${pageInfo.title}`);
    setReportCategory(pageInfo.category);
    setReportPriority("Routine");
    setReportNotes("");
    setNoteSavedFeedback(false);
    setIsReportModalOpen(true);
  };

  const handleSaveObservationNote = () => {
    if (!reportNotes.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      title: reportTitle.trim() || `Observation on ${pageInfo.title}`,
      category: reportCategory,
      priority: reportPriority,
      notes: reportNotes.trim(),
      author: adminName || "Super Administrator",
      pagePath: pathname,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("direskill_admin_notes") || "[]");
      const updated = [newNote, ...existing];
      localStorage.setItem("direskill_admin_notes", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("admin-notes-updated", { detail: updated }));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }

    setNoteSavedFeedback(true);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setNoteSavedFeedback(false);
    }, 1200);
  };

  const handleDownloadCategoryReport = async () => {
    try {
      const payload = {
        reportTitle: reportTitle.trim() || `Field Report: ${pageInfo.title}`,
        category: reportCategory,
        period: activeRange,
        generatedAt: new Date().toISOString(),
        author: adminName || "Super Administrator",
        metrics: {
          totalClients: 12,
          totalWorkers: 8,
          verifiedWorkers: 6,
          verifiedClients: 10,
          jobsCreated: 14,
          jobsCompleted: 11,
          escrowVerified: 14,
          escrowReleased: 11,
          escrowHeld: 3,
          openDisputes: 1,
          resolvedDisputes: 4,
        },
        notes: [
          {
            title: reportTitle.trim() || `Observation on ${pageInfo.title}`,
            category: reportCategory,
            priority: reportPriority,
            notes: reportNotes.trim() || "No ad-hoc notes attached.",
            author: adminName || "Super Administrator",
            pagePath: pathname,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      const res = await fetch("/api/admin/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("PDF export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `direskill_${pageInfo.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/admin/sign-out", { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  };

  const getInitials = (str: string) => {
    if (!str) return "AD";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-card/90 backdrop-blur-sm border-b border-border px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 transition-colors duration-200">
      {/* ── Left: Dynamic Page Title + Segmented Time Control ── */}
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-foreground truncate">
          {pageInfo.title}
        </h1>

        <div className="hidden md:flex items-center bg-secondary p-0.5 rounded-lg text-xs font-medium text-muted-foreground border border-border/40">
          {[
            { id: "This month", label: t("admin.topbar.thisMonth") },
            { id: "Last month", label: t("admin.topbar.lastMonth") },
            { id: "Custom", label: t("admin.topbar.custom") },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleRangeSelect(id)}
              className={`px-3 py-1 rounded-md transition-all duration-150 cursor-pointer ${
                activeRange === id
                  ? "bg-card text-foreground font-semibold shadow-xs"
                  : "hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Center / Right: Global Omni-Search ── */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-xs hidden sm:block">
        <div
          className={`relative flex items-center transition-all duration-200 ${
            searchFocused ? "w-full" : "w-64"
          }`}
        >
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => {
              setSearchFocused(true);
              setIsSearchOpen(true);
            }}
            onBlur={() => setSearchFocused(false)}
            placeholder={t("admin.topbar.searchPlaceholder")}
            className="w-full h-8.5 pl-9 pr-3 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Recommendations Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute left-0 top-10 w-80 bg-popover border border-border rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground border-b border-border/50 flex items-center justify-between">
              <span>{t("admin.topbar.matchingSections")}</span>
              <span>{searchResults.length} {t("admin.topbar.sectionsFound")}</span>
            </div>

            <div className="max-h-64 overflow-y-auto no-scrollbar py-1 space-y-0.5">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      router.push(item.href);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-secondary transition group cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-accent">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{item.category}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {t("admin.topbar.jump")} →
                    </Badge>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  {t("admin.topbar.noMatches")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Right Actions: Language, + New Report (Note Taker), Profile ── */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {mounted && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/80 text-muted-foreground text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{currentTime}</span>
          </div>
        )}

        {/* Language Switcher Segmented Control */}
        <div className="flex items-center bg-secondary rounded-lg p-0.5 border border-border/40">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all duration-150 cursor-pointer ${
                language === code
                  ? "bg-card text-accent shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Contextual + New Report (Observation Note) Button ── */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpenReportModal}
          className="h-8.5 gap-1.5 text-xs font-semibold border-border bg-card hover:bg-secondary shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-accent" />
          <span>{t("admin.topbar.newReport")}</span>
        </Button>

        {/* ── Profile Dropdown Button (Replaces Verification Button) ── */}
        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 h-8.5 pl-1.5 pr-2 rounded-lg bg-secondary/80 hover:bg-secondary border border-border transition-all duration-150 group"
          >
            <div className="size-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-[10px] shadow-xs">
              {getInitials(adminName)}
            </div>
            <span className="text-xs font-semibold text-foreground hidden md:inline truncate max-w-[90px]">
              {adminName}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                isProfileMenuOpen ? "rotate-180 text-foreground" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-10 w-52 bg-popover border border-border rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
              <div className="px-2.5 py-2 border-b border-border/60 mb-1">
                <p className="font-bold text-foreground truncate">{adminName}</p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {adminRole.replaceAll("_", " ")}
                </p>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/admin/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t("admin.sidebar.profile")}</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{t("admin.sidebar.settings")}</span>
                </Link>

                <div className="border-t border-border/50 my-1" />

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t("admin.topbar.signOut")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Observation Report & Note Taker Dialog ── */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle>{t("admin.topbar.reportModal.title")}</DialogTitle>
                <DialogDescription>
                  {t("admin.topbar.reportModal.desc")} ({pageInfo.title})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {noteSavedFeedback && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t("admin.topbar.reportModal.saved")}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="reportHeadline">{t("admin.topbar.reportModal.headline")}</Label>
              <Input
                id="reportHeadline"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Enter report headline"
                className="bg-secondary border-border text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="categorySelect">{t("admin.topbar.reportModal.category")}</Label>
                <Select value={reportCategory} onValueChange={setReportCategory}>
                  <SelectTrigger className="bg-secondary border-border text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Identity & Verification">Identity & Verification</SelectItem>
                    <SelectItem value="Artisan Operations">Artisan Operations</SelectItem>
                    <SelectItem value="Client Accounts">Client Accounts</SelectItem>
                    <SelectItem value="Dispute Adjudication">Dispute Adjudication</SelectItem>
                    <SelectItem value="Escrow & Settlements">Escrow & Settlements</SelectItem>
                    <SelectItem value="User Support">User Support</SelectItem>
                    <SelectItem value="Platform Governance">Platform Governance</SelectItem>
                    <SelectItem value="Platform Operations">Platform Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prioritySelect">{t("admin.topbar.reportModal.priority")}</Label>
                <Select value={reportPriority} onValueChange={setReportPriority}>
                  <SelectTrigger className="bg-secondary border-border text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine Observation</SelectItem>
                    <SelectItem value="Flagged">Flagged for Follow-up</SelectItem>
                    <SelectItem value="Urgent">Urgent Action Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reportNotesArea">{t("admin.topbar.reportModal.notes")}</Label>
              <textarea
                id="reportNotesArea"
                rows={4}
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder={t("admin.topbar.reportModal.notesPlaceholder")}
                className="w-full p-2.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border text-[11px] text-muted-foreground">
              <span>{t("admin.topbar.reportModal.origin")}</span>
              <code className="font-mono text-accent">{pathname}</code>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadCategoryReport}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t("admin.topbar.reportModal.downloadPdf")}</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReportModalOpen(false)}
                className="cursor-pointer"
              >
                {t("admin.topbar.reportModal.close")}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveObservationNote}
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-semibold cursor-pointer"
              >
                {t("admin.topbar.reportModal.save")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
