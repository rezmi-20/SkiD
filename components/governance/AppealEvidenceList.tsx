"use client";

import { useState, useEffect } from "react";
import { FileText, Film, Image as ImageIcon, ExternalLink, Download, X, Maximize2 } from "lucide-react";

interface AppealEvidenceListProps {
  evidenceReferences?: string[] | null;
  title?: string;
}

function getFileType(url: string): "image" | "video" | "pdf" | "other" {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.match(/\.(jpeg|jpg|png|webp|gif)$/i)) return "image";
  if (clean.match(/\.(mp4|webm|mov|ogg)$/i)) return "video";
  if (clean.endsWith(".pdf")) return "pdf";
  return "other";
}

function getFilename(url: string): string {
  try {
    const raw = url.split("/").pop() || "evidence-file";
    const decoded = decodeURIComponent(raw);
    const match = decoded.match(/^\d+_(.+?)(?:_[a-f0-9]{16})?(\.[a-z0-9]+)$/i);
    if (match) {
      return `${match[1]}${match[2]}`.replaceAll("_", " ");
    }
    return decoded;
  } catch {
    return url;
  }
}

export default function AppealEvidenceList({
  evidenceReferences,
  title = "Submitted Evidence Files",
}: AppealEvidenceListProps) {
  const [activeMedia, setActiveMedia] = useState<{ url: string; name: string; type: "image" | "video" } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMedia(null);
    };
    if (activeMedia) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [activeMedia]);

  let urls: string[] = [];
  if (Array.isArray(evidenceReferences)) {
    urls = evidenceReferences.filter(Boolean);
  } else if (typeof evidenceReferences === "string") {
    try {
      const parsed = JSON.parse(evidenceReferences);
      if (Array.isArray(parsed)) urls = parsed.filter(Boolean);
    } catch {
      if (evidenceReferences) urls = [evidenceReferences];
    }
  }

  if (urls.length === 0) {
    return (
      <div className="rounded-xl border border-border/80 bg-card p-5 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
        <p className="text-xs font-medium text-muted-foreground italic">
          No supporting evidence attachments were submitted with this appeal.
        </p>
      </div>
    );
  }

  const images = urls.filter((u) => getFileType(u) === "image");
  const videos = urls.filter((u) => getFileType(u) === "video");
  const documents = urls.filter((u) => getFileType(u) === "pdf" || getFileType(u) === "other");

  return (
    <>
      <div className="rounded-xl border border-border/80 bg-card p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
            <p className="text-xs text-foreground/80 font-medium mt-0.5">
              {urls.length} item{urls.length === 1 ? "" : "s"} submitted by appellant for review
            </p>
          </div>
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary uppercase tracking-wide">
            Verified Evidence
          </span>
        </div>

        {/* 1. Photos Section */}
        {images.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <div className="rounded-md bg-emerald-500/10 p-1 text-emerald-600 dark:text-emerald-400">
                <ImageIcon className="h-3.5 w-3.5" />
              </div>
              <span>Photo Evidence ({images.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((url, idx) => {
                const name = getFilename(url);
                return (
                  <div
                    key={`${url}-${idx}`}
                    className="group relative rounded-lg border border-border/80 bg-muted/20 overflow-hidden hover:border-primary/50 transition-colors flex flex-col justify-between"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveMedia({ url, name, type: "image" })}
                      className="aspect-video w-full bg-muted/40 relative overflow-hidden flex items-center justify-center cursor-pointer group-hover:opacity-95"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                        <Maximize2 className="h-4 w-4" />
                        <span>Preview</span>
                      </div>
                    </button>
                    <div className="p-2.5 flex items-center justify-between gap-2 border-t border-border/60 bg-card">
                      <span className="text-xs font-medium text-foreground truncate" title={name}>
                        {name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveMedia({ url, name, type: "image" })}
                          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Preview Fullscreen"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </button>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Open in New Tab"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Videos Section */}
        {videos.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <div className="rounded-md bg-blue-500/10 p-1 text-blue-600 dark:text-blue-400">
                <Film className="h-3.5 w-3.5" />
              </div>
              <span>Video Recordings ({videos.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videos.map((url, idx) => {
                const name = getFilename(url);
                return (
                  <div
                    key={`${url}-${idx}`}
                    className="rounded-lg border border-border/80 bg-muted/20 overflow-hidden p-2.5 space-y-2"
                  >
                    <div className="aspect-video w-full rounded bg-black/90 overflow-hidden flex items-center justify-center">
                      <video
                        src={url}
                        controls
                        preload="metadata"
                        className="h-full w-full object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-medium text-foreground truncate" title={name}>
                        {name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveMedia({ url, name, type: "video" })}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <Maximize2 className="h-3 w-3" />
                          <span>Fullscreen</span>
                        </button>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Documents Section */}
        {documents.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <div className="rounded-md bg-amber-500/10 p-1 text-amber-600 dark:text-amber-400">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <span>Document Receipts & PDFs ({documents.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {documents.map((url, idx) => {
                const name = getFilename(url);
                return (
                  <a
                    key={`${url}-${idx}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-background/60 p-3 hover:bg-accent/40 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-md bg-amber-500/15 p-2 text-amber-700 dark:text-amber-400 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary">
                          {name}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          PDF Document · Click to view
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground group-hover:text-primary">
                      <Download className="h-3.5 w-3.5" />
                      <ExternalLink className="h-3.5 w-3.5" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeMedia && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveMedia(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col rounded-xl border border-white/10 bg-[#0c0d0e] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
              <span className="text-xs font-bold text-white truncate max-w-md">
                {activeMedia.name}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={activeMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/20 transition-colors inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Open Original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveMedia(null)}
                  className="rounded-md p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/60 min-h-[300px]">
              {activeMedia.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeMedia.url}
                  alt={activeMedia.name}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded"
                />
              ) : (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  className="max-h-[75vh] w-auto max-w-full rounded"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
