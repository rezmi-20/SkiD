"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCommunityPosts, toggleLikePost, flagPost } from "@/lib/actions/community";
import CreatePostModal from "./CreatePostModal";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = ["All", "Plumbing", "Electrical", "Painting", "DIY", "Gardening"];

export default function CommunityFeedContent({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPosts = async (category: string) => {
    setLoading(true);
    const cat = category === "All" ? undefined : category;
    const data = await getCommunityPosts(cat);
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts(selectedCategory);
  }, [selectedCategory]);

  const handleLike = async (postId: string) => {
    const res = await toggleLikePost(postId);
    if (res.success) {
      setPosts(posts.map((p) => {
        if (p.id === postId) {
          const isLikedNow = !p.is_liked;
          return {
            ...p,
            is_liked: isLikedNow,
            likes_count: isLikedNow ? p.likes_count + 1 : p.likes_count - 1,
          };
        }
        return p;
      }));
    }
  };

  const handleFlag = async (postId: string) => {
    if (confirm("Are you sure you want to flag this post as inappropriate?")) {
      const res = await flagPost(postId, "Inappropriate content");
      if (res.success) alert("Thank you. Our moderators will review this post.");
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-5 pb-24">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Community</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-on-surface">Feed</h1>
          <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
            Share practical tips, job lessons, and local repair knowledge with the DireSkill community.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-on-primary"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Tip
        </button>
      </header>

      <section className="grid gap-4 xl:grid-cols-[280px_1fr] 2xl:grid-cols-[320px_1fr]">
        <aside className="space-y-4 rounded-lg border border-surface-variant bg-surface-container-lowest p-4 xl:sticky xl:top-28 xl:h-fit">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-lg border border-surface-variant bg-surface-container-low pl-10 pr-3 text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Categories</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar xl:flex-col xl:overflow-visible">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-9 shrink-0 rounded-lg px-3 text-left text-xs font-bold uppercase tracking-wide transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center rounded-lg border border-surface-variant bg-surface-container-lowest py-20 gap-4 text-on-surface-variant">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-xs font-bold uppercase tracking-wide">Loading the feed...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-lg border border-surface-variant bg-surface-container-lowest p-4 shadow-sm transition-all hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-variant bg-surface-container-high">
                      {post.author_avatar ? (
                        <img src={post.author_avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{post.author_name?.[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-bold text-on-surface">{post.author_name}</span>
                        {post.is_verified && <span className="material-symbols-outlined text-primary text-[16px]">verified</span>}
                      </div>
                      <p className="mt-0.5 text-xs text-on-surface-variant">
                        {post.role} - {formatDistanceToNow(new Date(post.created_at))} ago
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFlag(post.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-error"
                    aria-label="Flag post"
                  >
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <h2 className="text-base font-bold text-on-surface">{post.title}</h2>
                  <p className="text-sm leading-6 text-on-surface-variant">{post.content}</p>
                  {post.media_url && (
                    <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-surface-variant bg-surface-container-high">
                      <img src={post.media_url} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-surface-variant pt-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.is_liked ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${post.is_liked ? "filled" : ""}`}>thumb_up</span>
                      {post.likes_count}
                    </button>
                    <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                      {post.comments_count}
                    </div>
                  </div>
                  <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                    {post.category}
                  </span>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-surface-variant bg-surface-container-lowest py-20 text-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl">forum</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">No tips found</h3>
                <p className="mt-1 text-xs text-on-surface-variant">Try a different category or search term.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <CreatePostModal
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchPosts(selectedCategory);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
