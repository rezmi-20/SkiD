"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  CreditCard,
  UserRound,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Coins,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import type { AdminPaymentReportRow } from "@/lib/actions/admin-payments";

interface PaymentDetailDrawerProps {
  payment: AdminPaymentReportRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentDetailDrawer({
  payment,
  isOpen,
  onClose,
}: PaymentDetailDrawerProps) {
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

  if (!isOpen || !payment || !mounted) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case "released":
        return {
          icon: CheckCircle2,
          class: "bg-success/10 text-success border-success/20",
          label: "Settled & Released",
        };
      case "refunded":
        return {
          icon: AlertTriangle,
          class: "bg-destructive/10 text-destructive border-destructive/20",
          label: "Refunded to Client",
        };
      default:
        return {
          icon: Clock,
          class: "bg-warning/10 text-warning border-warning/20",
          label: "In Escrow Custody",
        };
    }
  };

  const statusInfo = statusBadge(payment.status);
  const StatusIcon = statusInfo.icon;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-out Sheet - Unboxed Clean Design */}
      <div className="relative w-full max-w-lg bg-card border-l border-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Ref #{payment.paymentId.slice(0, 8)}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.class}`}
              >
                <StatusIcon className="w-3 h-3" />
                <span>{statusInfo.label}</span>
              </span>
            </div>
            <h2 className="text-base font-bold text-foreground line-clamp-1">
              {payment.jobTitle || "Escrow Transaction"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Unwrapped & Clean */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Net Artisan Payout Hero */}
          <div className="flex items-baseline justify-between pb-4 border-b border-border">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Net Artisan Settlement
              </span>
              <p className="text-3xl font-bold font-mono text-foreground mt-1">
                ETB {payment.netAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-muted-foreground">Commission Retained</span>
              <p className="text-xs font-bold text-accent mt-0.5 font-mono">
                ETB {payment.commissionAmount.toLocaleString()} (10%)
              </p>
            </div>
          </div>

          {/* Financial Breakdown - Clean Divider List */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Financial Breakdown & Allocation
            </span>
            <div className="divide-y divide-border/60">
              <div className="py-2.5 flex justify-between items-center first:pt-0">
                <span className="text-muted-foreground">Gross Escrow Deposited</span>
                <span className="font-mono font-bold text-foreground">
                  ETB {payment.amount.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-muted-foreground">Platform Commission Retention</span>
                <span className="font-mono font-semibold text-accent">
                  - ETB {payment.commissionAmount.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-bold text-foreground">Net Payee Release</span>
                <span className="font-mono font-bold text-success">
                  ETB {payment.netAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Parties - Clean Unboxed Rows */}
          <div className="space-y-3 pt-2 border-t border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Transaction Counterparties
            </span>
            <div className="divide-y divide-border/60">
              {/* Client Row */}
              <div className="py-2.5 flex items-center justify-between first:pt-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs shrink-0">
                    C
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-xs">{payment.clientName}</p>
                    <p className="text-[10px] text-muted-foreground">Paying Client · Chapa Debited</p>
                  </div>
                </div>
                <Link
                  href="/admin/clients"
                  className="text-xs text-accent hover:underline font-semibold"
                >
                  View Profile
                </Link>
              </div>

              {/* Worker Row */}
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                    W
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-xs">{payment.workerName}</p>
                    <p className="text-[10px] text-muted-foreground">Artisan Payee · Telebirr/Bank</p>
                  </div>
                </div>
                <Link
                  href="/admin/workers"
                  className="text-xs text-accent hover:underline font-semibold"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Gateway Verification & Audit Metadata */}
          <div className="space-y-3 pt-2 border-t border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Gateway Verification & Audit Log
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Payment Processor:</span>
                <span className="font-semibold text-foreground">Chapa Gateway (ETB)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Chapa Reference:</span>
                <span className="font-mono font-bold text-foreground truncate max-w-[220px]">
                  {payment.chapaRef || "chapa_live_ref_on_file"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Gateway State:</span>
                <span className="font-mono font-semibold text-accent capitalize">
                  {payment.chapaStatus || "success"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Transaction Initiated:</span>
                <span className="font-mono text-muted-foreground">
                  {new Date(payment.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground transition cursor-pointer"
          >
            Close Drawer
          </button>
          <Link
            href="/admin/contracts"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 text-xs font-bold transition shadow-xs"
          >
            <span>View Related Contract</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
