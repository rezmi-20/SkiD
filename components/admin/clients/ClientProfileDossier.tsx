"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  DollarSign,
  FileText,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  Ban,
  Bell,
  CheckCircle2,
  AlertTriangle,
  User,
  ExternalLink,
} from "lucide-react";
import { setSuspendedStatus } from "@/lib/actions/super-admin";
import { sendClientVerificationReminder } from "@/lib/client-verification-reminders";

interface ClientJobItem {
  id: string;
  title: string;
  workerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface ClientData {
  userId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  verificationStatus: string;
  finLast4?: string | null;
  createdAt: string;
  totalSpent: number;
  totalJobs: number;
  activeContracts: number;
  reminderCount: number;
  lastReminderAt?: string | null;
}

interface Props {
  client: ClientData;
  jobs: ClientJobItem[];
  canSuspendAccount?: boolean;
}

export function ClientProfileDossier({
  client,
  jobs,
  canSuspendAccount = true,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleToggleSuspension = () => {
    setActionMessage(null);
    startTransition(async () => {
      const result = await setSuspendedStatus(client.userId, !client.isSuspended);
      if (result.success) {
        setActionMessage({ text: client.isSuspended ? "Account reactivated." : "Account suspended." });
        router.refresh();
      } else {
        setActionMessage({ text: result.error || "Failed to update suspension status", error: true });
      }
    });
  };

  const handleSendReminder = () => {
    setActionMessage(null);
    startTransition(async () => {
      const result = await sendClientVerificationReminder(client.userId);
      if (result.success) {
        setActionMessage({ text: "Verification reminder sent to client." });
        router.refresh();
      } else {
        setActionMessage({ text: result.error || "Failed to send reminder", error: true });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Top Navigation Link ── */}
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Clients Directory</span>
        </Link>
      </div>

      {/* ── Flush Header (Unwrapped) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 bg-secondary border border-border">
            <AvatarFallback className="bg-accent text-accent-foreground text-xl font-bold">
              {getInitials(client.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {client.fullName}
              </h1>
              <Badge variant="outline" className="text-xs">
                Employer Client
              </Badge>
              <Badge
                className={
                  client.isSuspended
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }
              >
                {client.isSuspended ? "Suspended" : "Active"}
              </Badge>
              <Badge
                className={
                  client.isVerified
                    ? "bg-accent/20 text-accent border-accent/30"
                    : "bg-muted text-muted-foreground border-border"
                }
              >
                {client.isVerified ? "Fayda Verified" : "Pending KYC"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {client.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                +251 {client.phone || "No phone recorded"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(client.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!client.isVerified && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendReminder}
              disabled={isPending}
            >
              <Bell className="w-3.5 h-3.5 mr-1.5" />
              Send KYC Reminder
            </Button>
          )}

          {canSuspendAccount && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSuspension}
              disabled={isPending}
              className={
                client.isSuspended
                  ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                  : "text-destructive hover:text-destructive hover:bg-destructive/10"
              }
            >
              <Ban className="w-3.5 h-3.5 mr-1.5" />
              {client.isSuspended ? "Reactivate Account" : "Suspend Account"}
            </Button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            actionMessage.error
              ? "bg-destructive/10 border-destructive/20 text-destructive"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {actionMessage.error ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* ── 4 Key Performance Metrics (Matching customers.tsx) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Escrow Spent</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-accent mt-1">
                ETB {client.totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Jobs Posted</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-1">
                {client.totalJobs}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Contracts</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-1">
                {client.activeContracts}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Account Standing</p>
              <p
                className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${
                  client.isSuspended ? "text-destructive" : "text-emerald-500"
                }`}
              >
                {client.isSuspended ? "Suspended" : "Good Standing"}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                client.isSuspended ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 2-Column Unwrapped Dossier Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personnel & Verification Record */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Client Information</CardTitle>
              <CardDescription>Employer contact details and verification profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground block font-medium">Employer Name</span>
                <p className="text-sm font-semibold text-foreground mt-0.5">{client.fullName}</p>
              </div>

              <div>
                <span className="text-muted-foreground block font-medium">Contact Email</span>
                <p className="text-sm font-medium text-foreground mt-0.5">{client.email}</p>
              </div>

              <div>
                <span className="text-muted-foreground block font-medium">Phone Number</span>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  +251 {client.phone || "Not recorded"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground block font-medium">Fayda National ID</span>
                <p className="text-sm font-mono font-medium text-foreground mt-0.5">
                  {client.finLast4 ? `•••• •••• •••• ${client.finLast4}` : "Unlinked"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground block font-medium">KYC Reminders Sent</span>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {client.reminderCount} reminders sent
                  {client.lastReminderAt && ` (last: ${new Date(client.lastReminderAt).toLocaleDateString()})`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Governance & Permissions</CardTitle>
              <CardDescription>Escrow authorization and marketplace status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Account Status</span>
                <span
                  className={`font-semibold ${
                    client.isSuspended ? "text-destructive" : "text-emerald-500"
                  }`}
                >
                  {client.isSuspended ? "Suspended by Admin" : "Active & In Good Standing"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Escrow Contract Access</span>
                <span
                  className={`font-semibold ${
                    client.isVerified ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  {client.isVerified ? "Full Unrestricted Access" : "Pending Verification"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">Account UUID</span>
                <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[150px]">
                  {client.userId}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Jobs & Contracts History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Jobs Posted & Contracts</CardTitle>
                <CardDescription>All job listings and funded contracts by this employer</CardDescription>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {jobs.length} jobs
              </span>
            </CardHeader>
            <CardContent className="p-0">
              {jobs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-y border-border bg-secondary/30 text-muted-foreground">
                        <th className="py-2.5 px-4 font-medium">Job Title</th>
                        <th className="py-2.5 px-4 font-medium">Assigned Artisan</th>
                        <th className="py-2.5 px-4 font-medium">Escrow Value</th>
                        <th className="py-2.5 px-4 font-medium">Status</th>
                        <th className="py-2.5 px-4 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-4 font-semibold text-foreground">
                            {job.title}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {job.workerName}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-accent">
                            {job.amount > 0 ? `ETB ${job.amount.toLocaleString()}` : "Pending Bid"}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                job.status === "completed"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : job.status === "in_progress" || job.status === "funded"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : "bg-secondary text-muted-foreground border-border"
                              }
                            >
                              {job.status.replaceAll("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {job.createdAt
                              ? new Date(job.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center space-y-2">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-sm font-medium text-foreground">No Jobs Posted Yet</p>
                  <p className="text-xs text-muted-foreground">
                    This client has not created any job posts on DireSkill yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

