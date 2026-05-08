"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createCommunityPost } from "@/lib/actions/community";

const CATEGORIES = ["Plumbing", "Electrical", "Painting", "DIY", "Gardening"];

export default function CreatePostModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Plumbing",
    mediaUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    setLoading(true);
    setError(null);
    
    const res = await createCommunityPost(formData);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || "Failed to post");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-xl bg-surface rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-on-surface-variant font-bold text-sm">Cancel</button>
          <h2 className="text-lg font-black tracking-tight">New Tip</h2>
          <div className="w-10" />
        </div>

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-bold flex items-center gap-3">
             <span className="material-symbols-outlined text-[18px]">error</span>
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Post Title (e.g. How to fix a leaky faucet)"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
              className="w-full h-14 bg-surface-container-low border-none rounded-2xl px-6 font-bold text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />

            <textarea 
              placeholder="Share your practical tip or solution..."
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              required
              rows={5}
              className="w-full bg-surface-container-low border-none rounded-2xl p-6 font-medium text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">Select Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.category === cat 
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Multimedia Placeholder */}
          <button 
            type="button"
            className="w-full py-6 border-2 border-dashed border-surface-container-highest rounded-2xl flex flex-col items-center gap-2 hover:bg-surface-container-low transition-colors group"
          >
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">add_photo_alternate</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Add Photo or Video</span>
          </button>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Post Tip
                <span className="material-symbols-outlined">send</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
