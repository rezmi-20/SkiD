"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { createCommunityPost } from "@/lib/actions/community";
import { ImagePlus, X, Send } from "lucide-react";

const CATEGORIES = ["Plumbing", "Electrical", "Painting", "DIY", "Gardening"];

export default function CreatePostModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Plumbing",
    mediaUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();

      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, mediaUrl: data.url }));
      } else {
        setError(data.error || "Failed to upload image");
      }
    } catch (err) {
      setError("An error occurred during image upload.");
    } finally {
      setUploading(false);
    }
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
        className="relative w-full max-w-xl bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground font-semibold text-sm">Cancel</button>
          <h2 className="text-base font-extrabold tracking-tight uppercase">New Community Post</h2>
          <div className="w-10" />
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-bold flex items-center gap-3">
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Post Title (e.g. Tips for repairing leaky pipes)"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
              className="w-full h-12 bg-background border border-border rounded-xl px-4 font-bold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            />

            <textarea 
              placeholder="What knowledge would you like to share today?"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              required
              rows={4}
              className="w-full bg-background border border-border rounded-xl p-4 font-medium text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm leading-relaxed"
            />
          </div>

          {/* Category selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Select Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                    formData.category === cat 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-muted text-muted-foreground hover:bg-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Image Uploader */}
          <div className="space-y-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />

            {formData.mediaUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border bg-muted h-40 group">
                <img src={formData.mediaUrl} alt="Upload preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, mediaUrl: "" }))}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-6 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1.5 hover:bg-muted/40 transition-colors group"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ImagePlus size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Attach Photo</span>
                  </>
                )}
              </button>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading || uploading}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 text-xs"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Post Tip
                <Send size={13} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
