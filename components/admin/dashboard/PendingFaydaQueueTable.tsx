"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { WorkerReviewDrawer, WorkerQueueItem } from "./WorkerReviewDrawer";
import { toggleWorkerVerification } from "@/lib/actions/admin";

interface PendingFaydaQueueTableProps {
  workers: WorkerQueueItem[];
  canReview?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return "Recent";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function PendingFaydaQueueTable({
  workers: initialWorkers,
  canReview = true,
  canApprove = true,
  canReject = true,
}: PendingFaydaQueueTableProps) {
  const router = useRouter();
  const [workers, setWorkers] = useState<WorkerQueueItem[]>(initialWorkers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("All");
  const [selectedWorker, setSelectedWorker] = useState<WorkerQueueItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleQuickAction = (userId: string, approve: boolean) => {
    const reason = approve ? undefined : window.prompt("Enter rejection reason for worker:") || undefined;
    if (!approve && reason === undefined) return;

    startTransition(async () => {
      const result = await toggleWorkerVerification(userId, approve, reason);
      if (result.success) {
        setWorkers((prev) => prev.filter((w) => w.user_id !== userId));
        router.refresh();
      } else {
        alert(result.error || "Action failed.");
      }
    });
  };

  const handleOpenReview = (worker: WorkerQueueItem) => {
    setSelectedWorker(worker);
    setDrawerOpen(true);
  };

  const handleStatusChanged = (userId: string) => {
    setWorkers((prev) => prev.filter((w) => w.user_id !== userId));
  };

  // Filter workers based on search and trade
  const filteredWorkers = workers.filter((worker) => {
    const nameMatch =
      (worker.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (worker.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (worker.email || "").toLowerCase().includes(searchQuery.toLowerCase());

    const skillsString = Array.isArray(worker.skills)
      ? worker.skills.join(" ").toLowerCase()
      : typeof worker.skills === "string"
      ? worker.skills.toLowerCase()
      : "";

    const tradeMatch =
      selectedTrade === "All" ||
      skillsString.includes(selectedTrade.toLowerCase());

    return nameMatch && tradeMatch;
  });

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        {/* Card Header & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                Fayda Identity Queue
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                {workers.length} Pending
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Review Fayda National IDs and skilled artisan certifications
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search artisan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 h-9 pl-9 pr-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
              />
            </div>

            <Link
              href="/admin/verify"
              className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 font-medium transition-colors group shrink-0"
            >
              <span>Full Queue</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Unified Table Content */}
        {filteredWorkers.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              {searchQuery ? "No matching artisans found" : "All Artisans Verified"}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {searchQuery
                ? "Try searching by a different name or phone number."
                : "No pending identity submissions in the Dire Dawa queue."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                  <th className="py-3 px-3">Artisan</th>
                  <th className="py-3 px-3 hidden sm:table-cell">Specialty</th>
                  <th className="py-3 px-3">Fayda National ID</th>
                  <th className="py-3 px-3 hidden md:table-cell">Submitted</th>
                  <th className="py-3 px-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredWorkers.map((worker, index) => {
                  const skills = Array.isArray(worker.skills)
                    ? worker.skills
                    : typeof worker.skills === "string"
                    ? worker.skills.split(",")
                    : [];

                  return (
                    <tr
                      key={worker.user_id}
                      className="hover:bg-secondary/50 transition-colors duration-150 group"
                    >
                      {/* Artisan Identity */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-all duration-200 shrink-0 overflow-hidden">
                            {worker.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={worker.avatar_url}
                                alt={worker.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              worker.full_name?.charAt(0) || "A"
                            )}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleOpenReview(worker)}
                              className="font-medium text-foreground hover:text-accent transition text-left"
                            >
                              {worker.full_name}
                            </button>
                            <p className="text-xs text-muted-foreground">
                              {worker.phone || "No phone"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Trade Specialty */}
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {skills.slice(0, 2).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Fayda National ID */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {worker.has_document ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-warning" />
                          )}
                          <span className="font-mono text-sm text-foreground">
                            {worker.fin_last4 ? `FIN-••••-${worker.fin_last4}` : "Pending FIN"}
                          </span>
                        </div>
                      </td>

                      {/* Submitted Time */}
                      <td className="py-3 px-3 hidden md:table-cell text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{timeAgo(worker.created_at)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenReview(worker)}
                            className="px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>

                          {canApprove && (
                            <button
                              type="button"
                              onClick={() => handleQuickAction(worker.user_id, true)}
                              disabled={isPending}
                              title="Quick Approve"
                              className="p-1 rounded-md text-success hover:bg-success/10 transition"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {canReject && (
                            <button
                              type="button"
                              onClick={() => handleQuickAction(worker.user_id, false)}
                              disabled={isPending}
                              title="Quick Reject"
                              className="p-1 rounded-md text-destructive hover:bg-destructive/10 transition"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-Out Review Drawer */}
      <WorkerReviewDrawer
        worker={selectedWorker}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        canReview={canReview}
        canApprove={canApprove}
        canReject={canReject}
        onStatusChanged={handleStatusChanged}
      />
    </>
  );
}
