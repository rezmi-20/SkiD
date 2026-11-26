"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Flag,
  MessageSquareWarning,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import FadeContent from "@/components/ui/fade-content";
import { useFeedback } from "@/components/ui/feedback";
import { moderateReviewAction, type AdminReviewRow } from "@/lib/actions/reviews";

interface Props {
  initialReviews: AdminReviewRow[];
  canModerate: boolean;
}

export function AdminReviewsModerationClient({ initialReviews, canModerate }: Props) {
  const router = useRouter();
  const { promptDialog, toast } = useFeedback();
  const [reviews, setReviews] = useState<AdminReviewRow[]>(initialReviews);
  const [filter, setFilter] = useState<"all" | "flagged" | "hidden" | "visible">("all");
  const [direction, setDirection] = useState<"all" | "to_worker" | "to_client">("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      all: reviews.length,
      flagged: reviews.filter((r) => r.isFlagged).length,
      hidden: reviews.filter((r) => r.isHidden).length,
      visible: reviews.filter((r) => !r.isHidden).length,
    }),
    [reviews],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      const matchesStatus =
        filter === "all" ||
        (filter === "flagged" && r.isFlagged) ||
        (filter === "hidden" && r.isHidden) ||
        (filter === "visible" && !r.isHidden);

      const matchesDirection =
        direction === "all" ||
        (direction === "to_worker" && r.ratedRole === "worker") ||
        (direction === "to_client" && r.ratedRole === "client");

      const matchesSearch =
        !q ||
        [r.jobTitle, r.raterName, r.ratedName, r.comment, r.flagReason, r.moderationReason, r.ratedDistrict]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));

      return matchesStatus && matchesDirection && matchesSearch;
    });
  }, [reviews, filter, direction, search]);

  const handleModerate = async (review: AdminReviewRow, hide: boolean) => {
    const reason = await promptDialog({
      title: hide ? "Hide Abusive or Retaliatory Review" : "Restore Review Visibility",
      description: hide
        ? `Hiding this ${review.score}-star review will exclude it from ${review.ratedName}'s public profile and average rating.`
        : `Restoring this review will include it again in ${review.ratedName}'s average rating.`,
      placeholder: hide
        ? "e.g. Contains personal phone number / retaliatory harassment unrelated to job scope."
        : "e.g. Verified against contract evidence; review complies with marketplace policy.",
      confirmLabel: hide ? "Hide Review" : "Restore Review",
      required: true,
      requiredError: "A moderation reason is required for the audit log.",
      variant: hide ? "danger" : "primary",
    });

    if (!reason) return;

    startTransition(async () => {
      const res = await moderateReviewAction({
        ratingId: review.id,
        hide,
        reason,
      });

      if (!res.success) {
        toast.error(res.error || "Moderation failed.");
        return;
      }

      const nowIso = new Date().toISOString();
      setReviews((prev) =>
        prev.map((item) => {
          if (item.id === review.id) {
            return {
              ...item,
              isHidden: hide,
              moderationReason: reason,
              moderatedAt: nowIso,
              targetAvgRating: res.recalculated?.avgRating ?? item.targetAvgRating,
              targetVisibleCount: res.recalculated?.visibleCount ?? item.targetVisibleCount,
            };
          }
          if (item.ratedId === review.ratedId && res.recalculated) {
            return {
              ...item,
              targetAvgRating: res.recalculated.avgRating,
              targetVisibleCount: res.recalculated.visibleCount,
            };
          }
          return item;
        }),
      );

      toast.success(
        hide
          ? `Review hidden. Updated rating for ${review.ratedName}: ${res.recalculated?.avgRating ?? 0} ★ (${res.recalculated?.visibleCount ?? 0}).`
          : `Review restored. Updated rating for ${review.ratedName}: ${res.recalculated?.avgRating ?? 0} ★ (${res.recalculated?.visibleCount ?? 0}).`,
      );
      router.refresh();
    });
  };

  return (
    <FadeContent blur duration={0.25} className="space-y-6 w-full pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Bidirectional Reviews & Reputation Moderation
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inspect client-to-worker and worker-to-client ratings. Hidden reviews are automatically excluded from public scores and logged.
          </p>
        </div>

        {!canModerate && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Read-only oversight (Content Verification Admin moderates)</span>
          </div>
        )}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { key: "all", label: "Total Reviews", val: counts.all },
          { key: "flagged", label: "Flagged / Reported", val: counts.flagged },
          { key: "hidden", label: "Hidden Reviews", val: counts.hidden },
          { key: "visible", label: "Active Public Reviews", val: counts.visible },
        ].map((card) => (
          <div key={card.key} className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {card.label}
            </p>
            <p className="text-2xl font-bold font-mono text-foreground mt-1">{card.val}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job title, reviewer, target, or comment..."
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "all", label: `All (${counts.all})` },
              { id: "flagged", label: `Flagged (${counts.flagged})` },
              { id: "hidden", label: `Hidden (${counts.hidden})` },
              { id: "visible", label: `Visible (${counts.visible})` },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === chip.id
                  ? "bg-accent text-accent-foreground font-bold shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {chip.label}
            </button>
          ))}

          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as any)}
            className="h-8 px-2.5 rounded-lg bg-secondary border border-border text-xs font-medium text-foreground"
          >
            <option value="all">Both Directions</option>
            <option value="to_worker">Client → Worker</option>
            <option value="to_client">Worker → Client</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className={`rounded-xl border p-4 bg-card shadow-xs space-y-3 ${
              r.isHidden
                ? "border-destructive/30 bg-destructive/5"
                : r.isFlagged
                  ? "border-warning/40"
                  : "border-border"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{r.score}.0</span>
                  </span>

                  <span className="text-xs font-bold text-foreground">
                    {r.raterName} ({r.raterRole}) → {r.ratedName} ({r.ratedRole})
                  </span>

                  {r.ratedDistrict && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                      {r.ratedDistrict}
                    </span>
                  )}

                  {r.isFlagged && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">
                      <Flag className="w-3 h-3" />
                      <span>Flagged</span>
                    </span>
                  )}

                  {r.isHidden && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
                      <EyeOff className="w-3 h-3" />
                      <span>Hidden from public</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Job: <span className="font-semibold text-foreground">{r.jobTitle}</span> · Posted{" "}
                  {new Date(r.createdAt).toLocaleDateString()} · Target current score:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {r.targetAvgRating.toFixed(1)} ★ ({r.targetVisibleCount})
                  </span>
                </p>
              </div>

              {canModerate && (
                <div className="flex items-center gap-2 shrink-0">
                  {!r.isHidden ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleModerate(r, true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold transition disabled:opacity-40"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide / Invalidate</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleModerate(r, false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-success/30 bg-success/10 hover:bg-success/20 text-success text-xs font-semibold transition disabled:opacity-40"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Review</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {r.comment ? (
              <p className="text-sm text-foreground bg-secondary/40 rounded-lg p-3 border border-border">
                {r.comment}
              </p>
            ) : (
              <p className="text-xs italic text-muted-foreground">Rating submitted without written comment.</p>
            )}

            {r.flagReason && (
              <div className="flex items-start gap-2 text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg p-2.5">
                <MessageSquareWarning className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Participant Flag Reason: </span>
                  <span>{r.flagReason}</span>
                </div>
              </div>
            )}

            {r.moderationReason && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 border border-border rounded-lg p-2.5">
                <Eye className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                <div>
                  <span className="font-bold text-foreground">Moderation Decision: </span>
                  <span>{r.moderationReason}</span>
                  {r.moderatorEmployeeId && (
                    <span className="ml-2 font-mono text-[11px]">
                      ({r.moderatorEmployeeId}
                      {r.moderatedAt ? ` · ${new Date(r.moderatedAt).toLocaleString()}` : ""})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card py-12 text-center text-xs text-muted-foreground">
            No reviews matched your current filter.
          </div>
        )}
      </div>
    </FadeContent>
  );
}
