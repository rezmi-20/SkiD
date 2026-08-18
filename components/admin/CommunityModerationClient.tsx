"use client";

import { useState, useTransition } from "react";
import { Search, Megaphone, Flag, ThumbsUp, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { removeCommunityPost } from "@/lib/actions/community";
import FadeContent from "@/components/ui/fade-content";

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
    const reason = window.prompt(nextStatus ? t("admin.community.reasonHide" as any) : t("admin.community.reasonRestore" as any))?.trim();
    if (!reason) {
      alert(t("admin.community.reasonRequired" as any));
      return;
    }
    startTransition(async () => {
      const res = await removeCommunityPost(postId, nextStatus, reason);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isRemoved: nextStatus } : p))
        );
      } else {
        alert(res.error || t("admin.community.updateFailed" as any));
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

  return (
    <FadeContent blur duration={0.4} className="space-y-5 pb-10 max-w-full">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low px-6 py-5 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 dark:text-blue-400">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold text-on-surface tracking-tight">
          {t("admin.community.title" as any)}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant opacity-70">
          {t("admin.community.desc" as any)}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant transition-colors duration-300">
        {/* Search */}
        <div className="relative flex-grow max-w-md w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-on-surface-variant opacity-60" />
          <input
            type="text"
          placeholder={t("admin.community.searchPlaceholder" as any)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-surface-container rounded-xl p-1 border border-outline-variant">
          <button
            onClick={() => setFilterRemoved("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterRemoved === "all"
                ? "bg-on-surface text-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t("admin.workers.filterAll" as any)}
          </button>
          <button
            onClick={() => setFilterRemoved("active")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterRemoved === "active"
                ? "bg-on-surface text-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t("contracts.active" as any) ?? "Active"}
          </button>
          <button
            onClick={() => setFilterRemoved("hidden")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterRemoved === "hidden"
                ? "bg-on-surface text-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Hidden
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden transition-colors duration-300 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant space-y-3">
            <div className="w-16 h-16 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto">
              <Megaphone className="w-8 h-8 text-blue-500/60" />
            </div>
            <p className="text-sm font-black text-on-surface uppercase tracking-wider">{t("admin.community.noPosts" as any)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low/50">
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.community.table.post" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.community.table.category" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.community.table.likes" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.community.table.flags" as any)}
                  </th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.community.table.actions" as any)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-surface-container/50 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4 max-w-sm">
                      <div>
                        <p className="font-bold text-on-surface text-sm truncate group-hover:text-blue-500 transition-colors">{p.title}</p>
                        <p className="text-xs text-on-surface-variant/70 mt-1.5 line-clamp-2">{p.content}</p>
                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-wider mt-2.5">
                          By {p.authorName}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-black uppercase tracking-tight text-on-surface bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                        {p.likesCount}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold flex items-center gap-1.5 ${
                          p.flagsCount > 0 ? "text-rose-500" : "text-on-surface-variant/40"
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        {p.flagsCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        disabled={isPending}
                        onClick={() => handleToggleRemove(p.id, p.isRemoved)}
                        hidden={!canModerate}
                        className={`inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-xl font-bold transition-all disabled:opacity-50 border active:scale-95 duration-200 ${
                          p.isRemoved
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
                        }`}
                      >
                        {p.isRemoved ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            {t("admin.community.action.restore" as any)}
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            {t("admin.community.action.remove" as any)}
                          </>
                        )}
                      </button>
                      {!canModerate && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
                          Read only
                        </span>
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
