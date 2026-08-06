"use client";

import { useEffect, useState } from "react";

interface ProtectedVerificationDocumentViewerProps {
  documentUrl: string;
  title: string;
  className?: string;
}

type ViewerState =
  | { status: "loading"; message: string }
  | { status: "error"; message: string }
  | { status: "ready"; objectUrl: string; contentType: string };

function messageForStatus(status: number) {
  if (status === 401 || status === 403) return "Access denied";
  if (status === 404) return "Document unavailable";
  if (status === 415) return "Unsupported document type";
  return "Verification document could not be loaded";
}

export default function ProtectedVerificationDocumentViewer({
  documentUrl,
  title,
  className = "",
}: ProtectedVerificationDocumentViewerProps) {
  const [state, setState] = useState<ViewerState>({ status: "loading", message: "Loading document" });

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;

    async function loadDocument() {
      setState({ status: "loading", message: "Loading document" });
      try {
        const response = await fetch(documentUrl, {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          setState({ status: "error", message: messageForStatus(response.status) });
          return;
        }

        const contentType = (response.headers.get("content-type") || "").toLowerCase();
        if (!contentType.startsWith("image/") && !contentType.includes("pdf")) {
          setState({ status: "error", message: "Unsupported document type" });
          return;
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setState({ status: "ready", objectUrl, contentType });
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: "error", message: "Verification document could not be loaded" });
        }
      }
    }

    loadDocument();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentUrl]);

  if (state.status !== "ready") {
    return (
      <div className={`flex min-h-[420px] flex-col items-center justify-center gap-4 text-center ${className}`}>
        <span className="material-symbols-outlined text-[64px] opacity-30">description</span>
        <p className="text-sm font-black uppercase tracking-widest text-on-surface-variant">{state.message}</p>
      </div>
    );
  }

  if (state.contentType.startsWith("image/")) {
    return (
      <div className={`flex min-h-[420px] items-center justify-center ${className}`}>
        <img
          src={state.objectUrl}
          alt={title}
          className="max-h-[560px] w-auto max-w-full rounded-xl bg-white object-contain shadow-2xl"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <iframe
        src={state.objectUrl}
        title={title}
        className="h-[560px] w-full rounded-xl border border-white/10 bg-white"
      />
      <button
        type="button"
        onClick={() => window.open(state.objectUrl, "_blank", "noopener,noreferrer")}
        className="rounded-lg border border-outline-variant bg-surface-container px-4 py-2 text-xs font-black uppercase tracking-widest text-on-surface"
      >
        Open securely in new tab
      </button>
    </div>
  );
}
