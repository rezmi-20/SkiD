"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCommunityPosts, toggleLikePost, votePostUseful, flagPost } from "@/lib/actions/community";
import CreatePostModal from "./CreatePostModal";
import { formatDistanceToNow } from "date-fns";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Paperclip, 
  Smile, 
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  Award,
  ThumbsDown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function CommunityFeedContent({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [votedPosts, setVotedPosts] = useState<Record<string, 'useful' | 'not_useful'>>({});

  const fetchPosts = async () => {
    setLoading(true);
    const data = await getCommunityPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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

  const handleVote = async (postId: string, type: 'useful' | 'not_useful') => {
    // Prevent double voting
    if (votedPosts[postId]) return;

    const res = await votePostUseful(postId, type);
    if (res.success) {
      setVotedPosts(prev => ({ ...prev, [postId]: type }));
      setPosts(posts.map((p) => {
        if (p.id === postId) {
          if (type === 'useful') {
            return { ...p, useful_count: (p.useful_count || 0) + 1 };
          } else {
            return { ...p, not_useful_count: (p.not_useful_count || 0) + 1 };
          }
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
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-24">
      
      {/* ── Page Header ── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">DireSkill Community</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-0.5">Feed</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share practical tips, job lessons, and local repair knowledge.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl font-bold uppercase tracking-wider text-xs gap-1.5 shrink-0 shadow-sm"
        >
          <Plus size={14} /> New Tip
        </Button>
      </header>

      {/* ── Search bar (No category filters) ── */}
      <div className="relative group w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          type="text"
          placeholder="Search community posts and tips..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-11 bg-card border-border rounded-xl text-sm"
        />
      </div>

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
            const formattedDate = post.created_at 
              ? new Date(post.created_at).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : "Recently";

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Header info */}
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={post.author_avatar || "/default-avatar.svg"} alt={post.author_name} />
                        <AvatarFallback className="text-xs font-bold bg-muted">{authorInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-foreground leading-none">{post.author_name}</span>
                          {post.is_verified && (
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-0.5 scale-90">
                              <CheckCircle2 size={10} className="fill-white text-blue-500" />
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                          {post.role === "worker" ? "Verified Provider" : "Client"} · {formattedDate}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleFlag(post.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition-all"
                      title="Flag Post"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="mt-4 space-y-2.5">
                    <h2 className="text-sm font-bold text-foreground tracking-tight">{post.title}</h2>
                    <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                    
                    {post.media_url && (
                      <div className="rounded-xl overflow-hidden border border-border bg-muted max-h-96 mt-3">
                        <img src={post.media_url} alt="Attachment" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Counters row */}
                <div className="px-5 py-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{post.likes_count} Likes</span>
                    <span className="font-medium">•</span>
                    <span className="font-medium">{post.comments_count || 0} Comments</span>
                  </div>

                  <div className="flex items-center gap-3 font-semibold text-primary">
                    <span>{post.useful_count || 0} Useful</span>
                    <span className="text-muted-foreground font-normal">•</span>
                    <span className="text-muted-foreground">{post.not_useful_count || 0} Not Useful</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-5 py-2.5 bg-muted/20 border-t border-b border-border/40 flex items-center justify-between gap-2">
                  <Button
                    onClick={() => handleLike(post.id)}
                    variant="ghost"
                    size="sm"
                    className={`flex-1 rounded-lg text-xs font-bold gap-1.5 h-9 ${
                      post.is_liked ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ThumbsUp size={14} className={post.is_liked ? "fill-primary" : ""} />
                    Like
                  </Button>

                  <Button
                    onClick={() => handleVote(post.id, 'useful')}
                    disabled={Boolean(votedPosts[post.id])}
                    variant="ghost"
                    size="sm"
                    className={`flex-1 rounded-lg text-xs font-bold gap-1.5 h-9 ${
                      votedPosts[post.id] === 'useful' 
                        ? "text-emerald-600 hover:text-emerald-600 bg-emerald-500/10" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sparkles size={14} />
                    Useful
                  </Button>

                  <Button
                    onClick={() => handleVote(post.id, 'not_useful')}
                    disabled={Boolean(votedPosts[post.id])}
                    variant="ghost"
                    size="sm"
                    className={`flex-1 rounded-lg text-xs font-bold gap-1.5 h-9 ${
                      votedPosts[post.id] === 'not_useful' 
                        ? "text-rose-600 hover:text-rose-600 bg-rose-500/10" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ThumbsDown size={14} />
                    Unuseful
                  </Button>
                </div>

                {/* Mock Comment box (matches reference mockup exactly) */}
                <div className="p-4 flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 border border-border shrink-0">
                    <AvatarImage src="/default-avatar.svg" />
                    <AvatarFallback className="text-[10px] font-bold">ME</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 relative flex items-center bg-muted/60 border border-border/80 rounded-xl px-3.5 h-9">
                    <input 
                      type="text" 
                      placeholder="Write your comment..." 
                      disabled
                      className="bg-transparent text-xs w-full pr-16 outline-none border-none placeholder:text-muted-foreground/60 text-muted-foreground cursor-not-allowed"
                    />
                    <div className="absolute right-3 flex items-center gap-2 text-muted-foreground/50">
                      <Paperclip size={13} className="cursor-not-allowed" />
                      <Smile size={13} className="cursor-not-allowed" />
                      <ImageIcon size={13} className="cursor-not-allowed" />
                    </div>
                  </div>
                </div>

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
