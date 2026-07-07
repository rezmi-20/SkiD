"use client";

import { useState, useTransition } from "react";
import { Search, Megaphone, Flag, ThumbsUp, Eye, EyeOff } from "lucide-react";
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
}

export function CommunityModerationClient({ initialPosts }: Props) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<PostData[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [filterRemoved, setFilterRemoved] = useState<"all" | "active" | "hidden">("all");
  const [isPending, startTransition] = useTransition();

  const handleToggleRemove = (postId: string, currentRemoved: boolean) => {
    const nextStatus = !currentRemoved;
    startTransition(async () => {
      const res = await removeCommunityPost(postId, nextStatus);
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

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-10">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4 transition-colors duration-300">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
          {t("admin.community.title" as any)}
        </h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">
          {t("admin.community.desc" as any)}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant transition-colors duration-300">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by title, body, or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container pl-9 pr-4 py-2 rounded-lg border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all"
          />
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-surface-container rounded-lg p-1 border border-outline-variant">
          <button
            onClick={() => setFilterRemoved("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterRemoved === "all"
                ? "bg-on-surface text-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t("admin.workers.filterAll" as any)}
          </button>
          <button
            onClick={() => setFilterRemoved("active")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterRemoved === "active"
                ? "bg-on-surface text-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t("contracts.active" as any) ?? "Active"}
          </button>
          <button
            onClick={() => setFilterRemoved("hidden")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
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
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden transition-colors duration-300 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant">
            <Megaphone className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-2" />
            <p className="text-sm font-semibold">{t("admin.community.noPosts" as any)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/50">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.community.table.post" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.community.table.category" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.community.table.likes" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.community.table.flags" as any)}
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.community.table.actions" as any)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-surface-container transition-colors duration-150"
                  >
                    <td className="px-4 py-3 max-w-sm">
                      <div>
                        <p className="font-bold text-on-surface text-sm truncate">{p.title}</p>
                        <p className="text-xs text-on-surface-variant/80 mt-1 line-clamp-2">{p.content}</p>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1.5">
                          By {p.authorName}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-on-surface bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-on-surface flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                        {p.likesCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold flex items-center gap-1 ${
                          p.flagsCount > 0 ? "text-error" : "text-on-surface-variant/60"
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        {p.flagsCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={isPending}
                        onClick={() => handleToggleRemove(p.id, p.isRemoved)}
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded font-bold transition-all disabled:opacity-50 border ${
                          p.isRemoved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
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
