"use client";

import { useEffect, useRef, useState } from "react";

interface ProtectedVerificationDocumentViewerProps {
  documentUrl: string;
  title: string;
  attemptId?: string | null;
  canReveal?: boolean;
  revealUsed?: boolean;
  className?: string;
}

type ViewerState =
  | { status: "hidden" }
  | { status: "loading" }
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
  attemptId = null,
  canReveal = true,
  revealUsed = false,
  className = "",
}: ProtectedVerificationDocumentViewerProps) {
  const [state, setState] = useState<ViewerState>({ status: "hidden" });
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    };
  }, [documentUrl]);

  const revealDocument = async () => {
    if (!canReveal || !attemptId || state.status !== "hidden") return;
    setState({ status: "loading" });
    try {
      const response = await fetch(documentUrl, {
        method: attemptId ? "POST" : "GET",
        credentials: "same-origin",
        cache: "no-store",
        ...(attemptId ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expectedAttemptId: attemptId }),
        } : {}),
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
      const objectUrl = URL.createObjectURL(await response.blob());
      objectUrlRef.current = objectUrl;
      setState({ status: "ready", objectUrl, contentType });
    } catch {
      setState({ status: "error", message: "Verification document could not be loaded" });
    }
  };

  if (state.status !== "ready") {
    return (
      <div className={`flex min-h-[420px] flex-col items-center justify-center gap-4 text-center ${className}`}>
        <span className="material-symbols-outlined text-[64px] opacity-30">description</span>
        <p className="text-sm font-black uppercase tracking-widest text-on-surface-variant">
          {state.status === "hidden" ? (revealUsed ? "Fayda document already revealed for this review" : attemptId ? "Fayda document protected" : "Document protected") : state.status === "loading" ? (attemptId ? "Authorizing one-time reveal" : "Loading document") : state.message}
        </p>
        {state.status === "hidden" && !revealUsed && canReveal && (
          <button type="button" onClick={() => void revealDocument()} className="rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-secondary">
            {attemptId ? "Reveal Fayda document once" : "Open document"}
          </button>
        )}
        {state.status === "error" && <p className="max-w-md text-xs text-on-surface-variant">{state.message}</p>}
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
