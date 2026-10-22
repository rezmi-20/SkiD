"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { createCommunityComment, getCommunityComments, toggleLikePost, votePostUseful, flagPost } from "@/lib/actions/community";
import CreatePostModal from "./CreatePostModal";
import { formatDistanceToNow } from "date-fns";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2,
  Send,
  Flag,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  Award,
  ThumbsDown,
  X,
  ImageOff,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CommunityComment = {
  id: string;
  content: string;
  created_at: string | Date;
  author_name: string;
  author_avatar: string | null;
  role: string;
};

function CommunityAttachment({ src, title }: { src: string; title: string }) {
  const [unavailable, setUnavailable] = useState(false);

  if (unavailable) {
    return (
      <div role="img" aria-label={`Photo unavailable for ${title}`} className="flex min-h-36 flex-col items-center justify-center gap-2 bg-muted px-4 py-8 text-center text-muted-foreground">
        <ImageOff size={22} aria-hidden="true" />
        <span className="text-xs font-medium">This photo is unavailable. Re-upload it to restore the attachment.</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Photo attached to ${title}`}
      loading="lazy"
      decoding="async"
      onError={() => setUnavailable(true)}
      className="block h-auto max-h-[32rem] w-full object-contain"
    />
  );
}

export default function CommunityFeedContent({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, CommunityComment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/community/posts", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || `Community request failed (${response.status}).`);
      }
      setPosts(Array.isArray(payload.posts) ? payload.posts : []);
    } catch (error) {
      console.error("[COMMUNITY_FEED_LOAD_ERROR]", error);
      setFeedback("The community feed could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    if (pendingAction === `like:${postId}`) return;
    setPendingAction(`like:${postId}`);
    const res = await toggleLikePost(postId);
    if (res.success) {
      setPosts((current) => current.map((p) => {
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
    } else {
      setFeedback(res.error || "Could not update your like.");
    }
    setPendingAction(null);
  };

  const handleVote = async (postId: string, type: 'useful' | 'not_useful' | null) => {
    if (pendingAction === `vote:${postId}`) return;
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    setPendingAction(`vote:${postId}`);
    const res = await votePostUseful(postId, type);
    if (res.success) {
      setPosts((current) => current.map((p) => p.id === postId ? {
        ...p,
        useful_count: res.usefulCount,
        not_useful_count: res.notUsefulCount,
        current_user_vote: res.vote,
      } : p));
    } else {
      setFeedback(res.error || "Could not save your vote.");
    }
    setPendingAction(null);
  };

  const toggleComments = async (postId: string) => {
    const opening = !expandedComments[postId];
    setExpandedComments((current) => ({ ...current, [postId]: opening }));
    if (opening && !commentsByPost[postId]) {
      const comments = await getCommunityComments(postId);
      setCommentsByPost((current) => ({ ...current, [postId]: comments as CommunityComment[] }));
    }
  };

  const handleComment = async (event: React.FormEvent<HTMLFormElement>, postId: string) => {
    event.preventDefault();
    const content = commentDrafts[postId] || "";
    if (!content.trim() || pendingAction === `comment:${postId}`) return;
    setPendingAction(`comment:${postId}`);
    const result = await createCommunityComment(postId, content);
    if (result.success) {
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      const comments = await getCommunityComments(postId);
      setCommentsByPost((current) => ({ ...current, [postId]: comments as CommunityComment[] }));
      setPosts((current) => current.map((p) => p.id === postId ? { ...p, comments_count: Number(p.comments_count || 0) + 1 } : p));
      setExpandedComments((current) => ({ ...current, [postId]: true }));
    } else {
      setFeedback(result.error || "Could not add your comment.");
    }
    setPendingAction(null);
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/community/feed#post-${postId}`;
    try {
      if (navigator.share) await navigator.share({ title: "DireSkill community post", url });
      else {
        await navigator.clipboard.writeText(url);
        setFeedback("Post link copied.");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") setFeedback("Could not share this post.");
    }
  };

  const handleFlag = async (postId: string) => {
    if (confirm("Report this post to the moderators?")) {
      const res = await flagPost(postId, "Inappropriate content");
      setFeedback(res.success ? "Report sent. A moderator will review this post." : "Could not send the report. Please try again.");
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.author_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-24">
      
      {/* ── Page Header ── */}
      <header className="flex items-start justify-between gap-4 py-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">DireSkill Community</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-0.5">Community</h1>
          <p className="text-sm text-muted-foreground mt-1">Local knowledge, trade tips, and lessons from the work.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen((open) => {
              if (open) setSearchQuery("");
              return !open;
            })}
            aria-label={isSearchOpen ? "Close community search" : "Search community"}
            aria-expanded={isSearchOpen}
            title={isSearchOpen ? "Close search" : "Search"}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all duration-200 hover:bg-muted active:scale-95 ${isSearchOpen ? "ring-2 ring-primary/25" : ""}`}
          >
            {isSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label="Create a community post"
            title="New post"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-95 active:scale-95"
          >
            <Plus size={19} />
          </button>
        </div>
      </header>

      {/* ── Search expands from the compact header action ── */}
      {feedback && <div role="status" className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">{feedback}<button className="ml-3 font-semibold underline" onClick={() => setFeedback("")}>Dismiss</button></div>}

      <AnimatePresence initial={false}>
        {isSearchOpen && (
          <motion.div
            key="community-search"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -10, scaleY: 0.92 }}
            animate={{ opacity: 1, height: "auto", y: 0, scaleY: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -8, scaleY: 0.96 }}
            transition={prefersReducedMotion ? { duration: 0.12 } : { type: "spring", stiffness: 340, damping: 28 }}
            style={{ transformOrigin: "top" }}
            className="overflow-hidden"
          >
            <div className="relative flex items-center rounded-full border border-border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/25">
              <Search aria-hidden="true" className="ml-3 shrink-0 text-muted-foreground" size={17} />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search posts, people, or trades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }
                }}
                aria-label="Search community posts"
                className="h-10 border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0"
              />
              {searchQuery && (
                <span className="mr-2 shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground" aria-live="polite">
                  {filteredPosts.length} {filteredPosts.length === 1 ? "result" : "results"}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Feed (Single column list) ── */}
      <div className="space-y-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-xl shadow-sm">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Loading community feed...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post, idx) => {
            const authorInitials = (post.author_name || "DS").slice(0, 2).toUpperCase();
            return (
              <motion.article
                key={post.id}
                id={`post-${post.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="scroll-mt-24 border-b border-border px-4 py-5 sm:px-5"
              >
                {/* Header info */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-border">
                        <AvatarImage src={post.author_avatar || "/default-avatar.svg"} alt={post.author_name} />
                        <AvatarFallback className="text-xs font-bold bg-muted">{authorInitials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-sm font-bold text-foreground">{post.author_name || "Community member"}</span>
                          {post.is_verified && (
                            <Badge aria-label="Verified" className="bg-blue-500 text-white rounded-full p-0.5 scale-90">
                              <CheckCircle2 size={10} className="fill-white text-blue-500" />
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">· {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {post.role === "admin" ? "DireSkill" : post.role === "worker" ? "Skilled worker" : "Client"} · {post.category}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFlag(post.id)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                      title="Report post"
                      aria-label="Report post"
                    >
                      <Flag size={16} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="mt-3 space-y-2">
                    <h2 className="text-base font-bold text-foreground tracking-tight">{post.title}</h2>
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">{post.content}</p>
                    
                    {post.media_url && (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-muted">
                        <CommunityAttachment src={post.media_url} title={post.title} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Counters row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-xs text-muted-foreground">
                  <span>{post.likes_count} likes · {post.comments_count || 0} comments</span>
                  <span>{post.useful_count || 0} found this useful</span>
                </div>

                {/* Bottom Actions */}
                <div className="mt-2 grid grid-cols-2 gap-1 border-y border-border/70 py-1 sm:grid-cols-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    disabled={pendingAction === `like:${post.id}`}
                    className={`flex min-h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition-colors hover:bg-muted disabled:opacity-50 ${
                      post.is_liked ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ThumbsUp size={14} className={post.is_liked ? "fill-primary" : ""} />
                    {post.is_liked ? "Liked" : "Like"}
                  </button>

                  <button
                    onClick={() => handleVote(post.id, post.current_user_vote === "useful" ? null : "useful")}
                    disabled={pendingAction === `vote:${post.id}`}
                    aria-pressed={post.current_user_vote === "useful"}
                    className={`flex min-h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition-colors hover:bg-muted disabled:opacity-50 ${
                      post.current_user_vote === "useful" ? "text-emerald-600 bg-emerald-500/10" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sparkles size={14} /> Useful · {post.useful_count || 0}
                  </button>

                  <button
                    onClick={() => handleVote(post.id, post.current_user_vote === "not_useful" ? null : "not_useful")}
                    disabled={pendingAction === `vote:${post.id}`}
                    aria-pressed={post.current_user_vote === "not_useful"}
                    className={`flex min-h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition-colors hover:bg-muted disabled:opacity-50 ${
                      post.current_user_vote === "not_useful" ? "text-rose-600 bg-rose-500/10" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ThumbsDown size={14} /> Not useful · {post.not_useful_count || 0}
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex min-h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-expanded={Boolean(expandedComments[post.id])}
                  >
                    <MessageSquare size={14} /> Comment
                  </button>

                  <button
                    onClick={() => void handleShare(post.id)}
                    className="col-span-2 flex min-h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:col-span-4"
                  >
                    <Share2 size={14} /> Share post
                  </button>
                </div>

                {expandedComments[post.id] && (
                  <div className="space-y-3 pt-3">
                    <div className="space-y-3">
                      {(commentsByPost[post.id] || []).map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2.5">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={comment.author_avatar || undefined} alt={comment.author_name} />
                            <AvatarFallback className="text-[10px] font-bold">{(comment.author_name || "Member").slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1 rounded-2xl bg-muted/60 px-3.5 py-2.5">
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <span className="text-xs font-bold">{comment.author_name}</span>
                              <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                            </div>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      {commentsByPost[post.id]?.length === 0 && <p className="pl-10 text-xs text-muted-foreground">No comments yet. Start the conversation.</p>}
                    </div>
                    <form onSubmit={(event) => handleComment(event, post.id)} className="flex items-center gap-2">
                      <Input
                        value={commentDrafts[post.id] || ""}
                        onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                        placeholder="Write a comment…"
                        maxLength={1000}
                        aria-label="Write a comment"
                        className="h-11 min-w-0 rounded-full bg-muted/40"
                      />
                      <Button type="submit" disabled={!commentDrafts[post.id]?.trim() || pendingAction === `comment:${post.id}`} className="h-11 w-11 shrink-0 rounded-full p-0" aria-label="Send comment">
                        <Send size={16} />
                      </Button>
                    </form>
                  </div>
                )}

              </motion.article>
            );
          })
        ) : (
          <Card className="border border-dashed border-border p-16 text-center bg-card shadow-sm rounded-xl">
            <CardContent className="space-y-4 pt-6">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <MessageSquare size={22} />
              </div>
              <div className="max-w-xs mx-auto space-y-1">
                <p className="font-semibold text-sm">No discussions found</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Try searching for something else or be the first to create a post!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreatePostModal
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchPosts();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
