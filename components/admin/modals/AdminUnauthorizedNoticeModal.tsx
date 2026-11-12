"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ShieldAlert, ArrowRight, X, UserCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UnauthorizedNoticeData {
  isOpen: boolean;
  title: string;
  message: string;
  actionName?: string;
  contractId?: string;
  requiredRole?: string;
}

interface Props {
  notice?: UnauthorizedNoticeData | null;
  onClose?: () => void;
}

export function AdminUnauthorizedNoticeModal({
  notice: externalNotice,
  onClose: externalOnClose,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [internalNotice, setInternalNotice] = useState<UnauthorizedNoticeData | null>(null);

  useEffect(() => {
    setMounted(true);

    const handleGlobalNotice = (e: any) => {
      if (e.detail) {
        setInternalNotice({
          isOpen: true,
          title: e.detail.title || "Action Restricted · Clearance Required",
          message:
            e.detail.message ||
            "You are attempting an action that you are not authorized to perform with your current administrative role.",
          actionName: e.detail.actionName,
          contractId: e.detail.contractId,
          requiredRole: e.detail.requiredRole,
        });
      }
    };

    window.addEventListener("admin-unauthorized-action", handleGlobalNotice);

    // Global fetch interceptor: automatically catch 401 & 403 responses to show friendly popup modal
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401 || response.status === 403) {
        try {
          const clone = response.clone();
          const data = await clone.json();
          const message =
            data?.message ||
            data?.error ||
            "You are attempting an administrative action that you are not authorized to perform.";
          setInternalNotice({
            isOpen: true,
            title:
              response.status === 401
                ? "Authentication Clearance Required"
                : "Action Restricted · Clearance Required",
            message: typeof message === "string" ? message : JSON.stringify(message),
            actionName: typeof args[0] === "string" ? args[0].split("?")[0] : "Administrative Action",
          });
        } catch {
          setInternalNotice({
            isOpen: true,
            title:
              response.status === 401
                ? "Authentication Clearance Required"
                : "Action Restricted · Clearance Required",
            message:
              "You are attempting an administrative action that you are not authorized to perform with your current role.",
            actionName: typeof args[0] === "string" ? args[0].split("?")[0] : "Administrative Action",
          });
        }
      }
      return response;
    };

    return () => {
      window.removeEventListener("admin-unauthorized-action", handleGlobalNotice);
      window.fetch = originalFetch;
    };
  }, []);

  const activeNotice = externalNotice || internalNotice;

  const handleClose = () => {
    if (externalOnClose) externalOnClose();
    setInternalNotice(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeNotice?.isOpen) {
        handleClose();
      }
    };
    if (activeNotice?.isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeNotice?.isOpen]);

  if (!activeNotice?.isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Friendly Popup Modal Window */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 space-y-5">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Administrative Clearance
              </span>
              <h3 className="text-base font-bold text-foreground">
                {activeNotice.title || "Authorization Notice"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explanatory Body with Friendly Message */}
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <p className="text-foreground font-semibold text-sm">
            You are attempting an action that you are not currently authorized to perform.
          </p>

          <p className="text-muted-foreground">
            {activeNotice.message ||
              "Your current administrator credentials do not have permission for this sensitive action. This restriction is enforced to maintain platform integrity, financial escrow safety, and regulatory compliance."}
          </p>

          {activeNotice.actionName && (
            <div className="py-2 px-3 rounded-lg bg-secondary/50 border border-border flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Action Attempted:</span>
              <span className="font-semibold text-foreground">{activeNotice.actionName}</span>
            </div>
          )}

          {activeNotice.contractId && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Record Reference:</span>
              <span className="font-mono font-bold text-foreground">#{activeNotice.contractId.slice(0, 10)}</span>
            </div>
          )}
        </div>

        {/* Friendly Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <Link
            href="/admin/profile"
            onClick={handleClose}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition"
          >
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Check My Permissions</span>
            </span>
          </Link>
          <Button
            onClick={handleClose}
            className="bg-accent text-accent-foreground hover:opacity-90 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-xs"
          >
            <span>Understood, Continue</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Global helper to trigger the friendly unauthorized popup anywhere in client components
 */
export function triggerUnauthorizedNotice(details: {
  title?: string;
  message?: string;
  actionName?: string;
  contractId?: string;
  requiredRole?: string;
}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("admin-unauthorized-action", {
        detail: details,
      })
    );
  }
}
