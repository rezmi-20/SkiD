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
      // Optimistic update
      setPosts(posts.map(p => {
        if (p.id === postId) {
          const isLikedNow = !p.is_liked;
          return {
            ...p,
            is_liked: isLikedNow,
            likes_count: isLikedNow ? p.likes_count + 1 : p.likes_count - 1
          };
        }
        return p;
      }));
    }
  };

  const handleFlag = async (postId: string) => {
    if (confirm("Are you sure you want to flag this post as inappropriate?")) {
      const res = await flagPost(postId, "Inappropriate content");
      if (res.success) {
        alert("Thank you. Our moderators will review this post.");
      }
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-variant px-6 h-16 flex items-center justify-between">
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined">search</span>
        </button>
        <h1 className="text-xl font-black text-primary tracking-tight">Community Feed</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined filled">add_circle</span>
        </button>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-6">
        {/* Search & Categories */}
        <div className="space-y-4">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Search tips, tricks, and discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-surface-container-low border-none rounded-2xl pl-12 pr-6 font-medium text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-4">
          {loading ? (
             <div className="flex flex-col items-center py-20 gap-4 opacity-40">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Loading the feed...</p>
             </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-surface-container-lowest rounded-[2rem] p-6 border border-surface-variant shadow-sm hover:shadow-md transition-all group"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-[1.2rem] overflow-hidden border-2 border-surface-container-high bg-surface-container-high flex items-center justify-center shrink-0">
                      {post.author_avatar ? (
                        <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{post.author_name?.[0]}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-on-surface">{post.author_name}</span>
                        {post.is_verified && (
                          <span className="material-symbols-outlined text-primary text-[16px] filled">verified</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          post.role === 'worker' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {post.role}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-medium opacity-60">
                          {formatDistanceToNow(new Date(post.created_at))} ago
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors opacity-40 group-hover:opacity-100">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-4">
                    {post.content}
                  </p>
                  
                  {post.media_url && (
                    <div className="mt-4 rounded-2xl overflow-hidden aspect-video bg-surface-container-high border border-surface-variant">
                      <img src={post.media_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-variant/50">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 group/btn transition-colors ${
                        post.is_liked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] transition-transform active:scale-125 ${post.is_liked ? 'filled' : ''}`}>
                        thumb_up
                      </span>
                      <span className="text-xs font-black">{post.likes_count}</span>
                    </button>
                    
                    <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary group/btn transition-colors">
                      <span className="material-symbols-outlined text-[20px] transition-transform active:scale-125">
                        chat_bubble
                      </span>
                      <span className="text-xs font-black">{post.comments_count}</span>
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleFlag(post.id)}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors group/flag"
                  >
                    <span className="material-symbols-outlined text-[18px] opacity-40 group-hover/flag:opacity-100">flag</span>
                  </button>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="flex flex-col items-center py-20 text-center gap-4">
              <div className="w-16 h-16 bg-surface-container-high rounded-[2rem] flex items-center justify-center text-on-surface-variant opacity-20">
                <span className="material-symbols-outlined text-4xl">forum</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">No tips found</h3>
                <p className="text-xs text-on-surface-variant mt-1">Try a different category or search term.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Create Post Modal */}
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
