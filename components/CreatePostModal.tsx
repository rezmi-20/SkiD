"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { createCommunityPost } from "@/lib/actions/community";
import {
  RiCloseLine,
  RiImageAddLine,
  RiSendPlaneFill,
  RiSparklingLine,
  RiCheckLine,
} from "@remixicon/react";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Woodwork & Finishing",
  "Masonry & Tile",
  "Painting & Decor",
  "Solar & Energy",
  "Tips & Q&A",
];

export default function CreatePostModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Plumbing",
    mediaUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setLoading(true);
    setError(null);

    const res = await createCommunityPost(formData);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || "Failed to publish post. Please try again.");
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
        setError(data.error || "Failed to upload image.");
      }
    } catch {
      setError("An error occurred during image upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Sheet */}
      <motion.div
        initial={{ y: "100%", opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative w-full max-w-xl bg-background-primary-default border border-border-button-default rounded-t-[2.5rem] sm:rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-separator-border">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              <RiSparklingLine className="w-3.5 h-3.5" />
              Dire Dawa Artisan Hub
            </div>
            <h2 className="text-xl font-black tracking-tight text-text-primary mt-0.5">
              Share Your Craft
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-border-button-default bg-background-secondary-default text-text-secondary hover:text-text-primary hover:bg-background-secondary-hover flex items-center justify-center transition-all active:scale-95"
            aria-label="Close dialog"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-text-error-primary rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-1.5">
                Craft Title
              </label>
              <input
                type="text"
                placeholder="e.g. Copper Pipe Brazing Masterclass in Kebele 02"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full h-12 bg-background-secondary-default border border-border-button-default rounded-2xl px-4 font-bold text-text-primary placeholder:text-text-placeholder outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-1.5">
                Project Breakdown & Insights
              </label>
              <textarea
                placeholder="What technique, troubleshooting fix, or mastercraft tips would you like to share with the community?"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={4}
                className="w-full bg-background-secondary-default border border-border-button-default rounded-2xl p-4 font-medium text-text-primary placeholder:text-text-placeholder outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring transition-all resize-none text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Category selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-text-tertiary">
              Trade Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm"
                        : "bg-background-secondary-default text-text-secondary hover:bg-background-secondary-hover hover:text-text-primary border border-border-button-default/60"
                    }`}
                  >
                    {isSelected && <RiCheckLine className="w-3.5 h-3.5" />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Uploader */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-text-tertiary">
              Project Media (Optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {formData.mediaUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-border-button-default bg-background-secondary-default h-48 group">
                <img
                  src={formData.mediaUrl}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, mediaUrl: "" }))}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors shadow-lg active:scale-95"
                  aria-label="Remove image"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-7 border-2 border-dashed border-border-button-default rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-background-secondary-default/50 transition-colors group cursor-pointer"
              >
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-background-secondary-default flex items-center justify-center text-text-secondary group-hover:text-text-primary group-hover:scale-105 transition-all">
                      <RiImageAddLine className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary group-hover:text-text-primary">
                      Attach Craft Photo or Diagram
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full h-13 py-3.5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-full font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 text-xs cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <RiSendPlaneFill className="w-4 h-4" />
                  Publish To Artisan Community
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
