"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, UserCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}) {
  useEffect(() => {
    console.warn("[ADMIN_ACCESS_NOTICE]", error);
  }, [error]);

  const isAuthError =
    error.message?.toLowerCase().includes("permission") ||
    error.message?.toLowerCase().includes("access") ||
    error.message?.toLowerCase().includes("authorized") ||
    error.message?.toLowerCase().includes("required") ||
    (error as any).status === 403 ||
    (error as any).status === 401;

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6 text-center">
        {/* Friendly Shield Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Friendly Explanation */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Authorization Notice
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {isAuthError
              ? "You are attempting an action you are not authorized for"
              : "Something went wrong in this workspace"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed pt-1">
            {isAuthError
              ? "Your current administrator role does not possess clearance for this view or action. Platform operations, financial escrow releases, and sensitive court filings require elevated privileges."
              : error.message || "An unexpected error occurred while loading this administrative workspace."}
          </p>
        </div>

        {/* Helpful Info Box */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border text-left text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Shield className="w-4 h-4 text-accent" />
            <span>How to proceed:</span>
          </div>
          <ul className="text-muted-foreground space-y-1 list-disc list-inside">
            <li>Verify your assigned administrative role in your staff profile.</li>
            <li>If you require this permission, ask your Super Administrator to adjust your role.</li>
            <li>You can safely return to your authorized dashboard workspaces below.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/admin/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 transition shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>

          <Link
            href="/admin/profile"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border transition"
          >
            <UserCheck className="w-4 h-4 text-muted-foreground" />
            <span>Check My Profile</span>
          </Link>

          {!isAuthError && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => reset()}
              className="text-xs"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

