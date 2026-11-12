"use client";

import { useEffect, useRef, useState } from "react";
import {
  Lock,
  FileText,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Loader2,
  FileCheck,
} from "lucide-react";

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
  if (status === 401 || status === 403) return "Access denied. Insufficient verification clearance.";
  if (status === 404) return "Document unavailable or missing in encrypted vault.";
  if (status === 415) return "Unsupported document file type.";
  return "Verification document could not be retrieved.";
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
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    };
  }, [documentUrl]);

  const revealDocument = async () => {
    if (!canReveal || state.status !== "hidden") return;
    setState({ status: "loading" });
    try {
      const response = await fetch(documentUrl, {
        method: attemptId ? "POST" : "GET",
        credentials: "same-origin",
        cache: "no-store",
        ...(attemptId
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ expectedAttemptId: attemptId }),
            }
          : {}),
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
      setZoom(1);
      setRotation(0);
    } catch {
      setState({ status: "error", message: "Verification document could not be loaded." });
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  if (state.status !== "ready") {
    return (
      <div
        className={`relative flex min-h-[460px] flex-col items-center justify-center p-8 text-center rounded-xl bg-slate-900/90 dark:bg-[#0B0F19] border border-white/[0.08] overflow-hidden ${className}`}
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 max-w-md space-y-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
            {state.status === "loading" ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : state.status === "error" ? (
              <ShieldAlert className="h-8 w-8 text-rose-400" />
            ) : (
              <Lock className="h-8 w-8" />
            )}
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-white tracking-wide">
              {state.status === "hidden"
                ? revealUsed
                  ? "Document Revealed Once"
                  : "Encrypted Fayda Document"
                : state.status === "loading"
                ? "Authorizing Vault Decryption..."
                : "Decryption Error"}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {state.status === "hidden"
                ? revealUsed
                  ? "The one-time Fayda ID reveal clearance was already consumed for this review attempt."
                  : "Protected national biometric document. Decrypting logs your audit credentials and timestamp."
                : state.status === "loading"
                ? "Validating admin permissions and generating secure ephemeral blob stream..."
                : state.message}
            </p>
          </div>

          {state.status === "hidden" && !revealUsed && canReveal && (
            <button
              type="button"
              onClick={() => void revealDocument()}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Reveal Document (Audit Logged)</span>
            </button>
          )}

          {state.status === "error" && (
            <button
              type="button"
              onClick={() => setState({ status: "hidden" })}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-900 dark:bg-[#0B0F19] overflow-hidden ${className}`}
    >
      {/* Interactive Inspection Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-white/[0.08] text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-white tracking-wide truncate max-w-[200px] sm:max-w-none">
            {title}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {state.contentType.includes("pdf") ? "PDF" : "IMAGE"}
          </span>
        </div>

        {state.contentType.startsWith("image/") && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              title="Zoom out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-mono text-[11px] text-slate-300 font-semibold select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              title="Zoom in"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="h-4 w-[1px] bg-slate-800 mx-1" />
            <button
              type="button"
              onClick={handleRotate}
              title="Rotate 90 degrees"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset view"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => window.open(state.objectUrl, "_blank", "noopener,noreferrer")}
              title="Open full view in new tab"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        )}

        {state.contentType.includes("pdf") && (
          <button
            type="button"
            onClick={() => window.open(state.objectUrl, "_blank", "noopener,noreferrer")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open in Tab</span>
          </button>
        )}
      </div>

      {/* Main Document View Canvas */}
      <div className="relative flex min-h-[500px] max-h-[700px] items-center justify-center p-4 overflow-auto no-scrollbar bg-[#060910]">
        {state.contentType.startsWith("image/") ? (
          <div
            className="transition-transform duration-150 ease-out flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            <img
              src={state.objectUrl}
              alt={title}
              className="max-h-[560px] w-auto max-w-full rounded-lg object-contain shadow-2xl select-none"
              draggable={false}
            />
          </div>
        ) : (
          <iframe
            src={state.objectUrl}
            title={title}
            className="h-[580px] w-full rounded-lg border border-white/10 bg-white"
          />
        )}
      </div>
    </div>
  );
}
