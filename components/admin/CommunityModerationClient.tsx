"use client";

import { useState, useTransition } from "react";
import { Search, Megaphone, Flag, ThumbsUp, Eye, EyeOff, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { removeCommunityPost } from "@/lib/actions/community";

interface PostData {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  likesCount: number;
  flagsCount: number;
  isRemoved: boolean;
}

interface Props {
  initialPosts: PostData[];
  canModerate: boolean;
}

export function CommunityModerationClient({ initialPosts, canModerate }: Props) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<PostData[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [filterRemoved, setFilterRemoved] = useState<"all" | "active" | "hidden">("all");
  const [isPending, startTransition] = useTransition();

  const handleToggleRemove = (postId: string, currentRemoved: boolean) => {
    const nextStatus = !currentRemoved;
    const promptText = nextStatus ? "Reason for hiding post:" : "Reason for restoring post:";
    const reason = window.prompt(promptText)?.trim();
    if (!reason) {
      alert("Reason is required to moderate content.");
      return;
    }
    startTransition(async () => {
      const res = await removeCommunityPost(postId, nextStatus, reason);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isRemoved: nextStatus } : p))
        );
      } else {
        alert(res.error || "Failed to update post status.");
      }
    });
  };

  const filtered = posts.filter((p) => {
    const query = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      p.authorName.toLowerCase().includes(query);

    const matchesFilter =
      filterRemoved === "all" ||
      (filterRemoved === "active" && !p.isRemoved) ||
      (filterRemoved === "hidden" && p.isRemoved);

    return matchesSearch && matchesFilter;
  });

  const flaggedCount = posts.filter((p) => p.flagsCount > 0).length;
  const hiddenCount = posts.filter((p) => p.isRemoved).length;

  return (
    <div className="space-y-6 pb-24 w-full">
      {/* 1. Header (Clean deals.tsx style: No dots, no uppercase pill badges) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {t("admin.community.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.community.desc")}
        </p>
      </div>

      {/* 2. KPI Summary Cards (deals.tsx pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("admin.community.kpi.total")}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground font-mono mt-1">{posts.length}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{t("admin.community.kpi.flagged")}</p>
              <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-1">{flaggedCount}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Flag className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{t("admin.community.kpi.hidden")}</p>
              <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono mt-1">{hiddenCount}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <EyeOff className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Floating Search & Filters (OUTSIDE table container - deals.tsx pattern) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("admin.community.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: "all", label: t("admin.community.filter.all"), count: posts.length },
              { id: "active", label: t("admin.community.filter.active"), count: posts.length - hiddenCount },
              { id: "hidden", label: t("admin.community.filter.hidden"), count: hiddenCount },
            ].map((tab) => {
              const isSelected = filterRemoved === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterRemoved(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Standalone Table Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-2">
            <Megaphone className="w-8 h-8 opacity-40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">
              {t("admin.community.noPosts")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  <th className="py-3 px-4">{t("admin.community.table.post")}</th>
                  <th className="py-3 px-4">{t("admin.community.table.category")}</th>
                  <th className="py-3 px-4">{t("admin.community.table.engagement")}</th>
                  <th className="py-3 px-4">{t("admin.community.table.status")}</th>
                  <th className="py-3 px-4 text-right">{t("admin.community.table.action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground text-xs truncate group-hover:text-accent transition">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {p.content}
                        </p>
                        <p className="text-[10px] text-accent font-medium mt-1">
                          By {p.authorName}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-foreground capitalize border border-border">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                          <ThumbsUp className="w-3.5 h-3.5 text-accent" />
                          <span>{p.likesCount}</span>
                        </span>
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 font-mono ${
                            p.flagsCount > 0 ? "text-rose-500" : "text-muted-foreground"
                          }`}
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span>{p.flagsCount}</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          p.isRemoved
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {p.isRemoved ? t("admin.community.status.hidden") : t("admin.community.status.visible")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {canModerate ? (
                        <button
                          disabled={isPending}
                          onClick={() => handleToggleRemove(p.id, p.isRemoved)}
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold transition disabled:opacity-50 border cursor-pointer ${
                            p.isRemoved
                              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
                          }`}
                        >
                          {p.isRemoved ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>{t("admin.community.action.restore")}</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>{t("admin.community.action.hide")}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Read only</span>
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
