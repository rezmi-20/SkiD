"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Fingerprint,
  FileText,
  Bell,
  UserX,
  UserCheck,
  ExternalLink,
  Shield,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export interface ClientDrawerItem {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  verificationStatus: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  hasDocument: boolean;
  maskedFin: string | null;
  hasProfile: boolean;
  lastReminderAt: string | null;
  reminderCount: number;
  invalidApprovedReasons: string[];
  createdAt: string;
}

interface ClientDetailDrawerProps {
  client: ClientDrawerItem | null;
  isOpen: boolean;
  onClose: () => void;
  canReview?: boolean;
  canSuspend?: boolean;
  canReactivate?: boolean;
  onSendReminder?: (userId: string) => void;
  onToggleSuspension?: (userId: string, suspend: boolean) => void;
  isCoolingDown?: boolean;
  isPendingAction?: boolean;
  onStatusChanged?: () => void;
}

export function ClientDetailDrawer({
  client,
  isOpen,
  onClose,
  canReview,
  canSuspend,
  canReactivate,
  onSendReminder,
  onToggleSuspension,
  isCoolingDown,
  isPendingAction,
}: ClientDetailDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !client || !mounted) return null;

  const isApproved = client.verificationStatus === "approved";
  const isPending = client.verificationStatus === "pending";
  const isSuspended = client.isSuspended;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Full-window Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-out Sheet from true right edge */}
      <div className="relative w-full max-w-lg bg-card border-l border-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-start justify-between gap-4 bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center font-bold text-foreground text-base shadow-xs">
              {client.fullName?.charAt(0) || <User className="w-6 h-6 text-muted-foreground" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-foreground line-clamp-1">
                  {client.fullName}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    isApproved
                      ? "bg-success/10 text-success border-success/20"
                      : isSuspended
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : isPending
                      ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span className="capitalize">{isSuspended ? "Suspended" : client.verificationStatus || "Not Started"}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>Client ID:</span>
                <span className="font-mono">{client.userId.slice(0, 8)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Contact & Profile Info */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Contact Channels
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono">{client.phone ? `+251 ${client.phone}` : "No phone registered"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Registered on {new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Fayda National ID Status */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-accent" />
                <span>Fayda Identity Status</span>
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  client.hasDocument ? "bg-accent/10 text-accent border border-accent/20" : "bg-muted text-muted-foreground"
                }`}
              >
                {client.hasDocument ? "ID Document On File" : "No Document"}
              </span>
            </div>

            <div className="rounded-lg bg-secondary/30 p-3 border border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Fayda FIN Identity:</span>
              <span className="font-mono text-sm font-bold text-foreground">
                {client.maskedFin || "Not provided"}
              </span>
            </div>

            {/* Reminder status */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>KYC Verification Reminders:</span>
              <span className="font-semibold text-foreground">
                {client.reminderCount > 0
                  ? `${client.reminderCount} sent (Last: ${new Date(client.lastReminderAt || "").toLocaleDateString()})`
                  : "None sent"}
              </span>
            </div>
          </div>

          {/* Account Governance */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Account Standing & Governance
            </span>
            <div className="text-xs space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Profile Initialized:</span>
                <span className="font-semibold text-foreground">{client.hasProfile ? "Yes" : "Incomplete"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Account Status:</span>
                <span className={`font-semibold ${isSuspended ? "text-destructive" : "text-success"}`}>
                  {isSuspended ? "Suspended from marketplace" : "Active & in good standing"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-secondary/30 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {canReview && (
              <Link
                href={`/admin/clients/${client.userId}/verify`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold transition shadow-xs"
              >
                <span>Audit Verification</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            {canReview && (
              <button
                type="button"
                onClick={() => onSendReminder && onSendReminder(client.userId)}
                disabled={isCoolingDown || isPendingAction}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold disabled:opacity-40 transition flex items-center gap-1.5"
                title={isCoolingDown ? "Reminder cooling down" : "Send reminder"}
              >
                <Bell className="w-3.5 h-3.5 text-accent" />
                <span>{isCoolingDown ? "Sent Recently" : "Send Reminder"}</span>
              </button>
            )}
          </div>

          {canSuspend && !client.isSuspended && (
            <button
              type="button"
              onClick={() => onToggleSuspension && onToggleSuspension(client.userId, true)}
              disabled={isPendingAction}
              className="w-full py-2 rounded-lg border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Suspend Client Account</span>
            </button>
          )}

          {canReactivate && client.isSuspended && (
            <button
              type="button"
              onClick={() => onToggleSuspension && onToggleSuspension(client.userId, false)}
              disabled={isPendingAction}
              className="w-full py-2 rounded-lg border border-success/30 bg-success/10 hover:bg-success/20 text-success text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Reactivate Client Account</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

