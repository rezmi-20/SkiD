"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Briefcase,
  Star,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  ExternalLink,
  Ban,
  Bell,
  CheckCircle2,
  Clock,
  Wrench,
  DollarSign,
  AlertTriangle,
  FileText,
  User,
} from "lucide-react";
import { setSuspendedStatus } from "@/lib/actions/super-admin";
import { sendWorkerVerificationReminder } from "@/lib/worker-verification-reminders";

interface ContractItem {
  id: string;
  jobTitle: string;
  clientName: string;
  amount: number;
  status: string;
  workLocation?: string | null;
  createdAt?: string | null;
}

interface RatingItem {
  id: string;
  score: number;
  reviewText: string;
  raterName: string;
  createdAt: string;
}

interface WorkerData {
  userId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  district?: string | null;
  skills?: string[] | null;
  experienceYears?: number | null;
  finLast4?: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  verificationStatus: string;
  createdAt: string;
  totalEarnings: number;
  totalJobs: number;
  avgRating: number;
  ratingCount: number;
}

interface Props {
  worker: WorkerData;
  contracts: ContractItem[];
  ratings: RatingItem[];
  canSuspendAccount?: boolean;
}

export function WorkerProfileDossier({
  worker,
  contracts,
  ratings,
  canSuspendAccount = true,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleToggleSuspension = () => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const result = await setSuspendedStatus(worker.userId, !worker.isSuspended);
      if (result.success) {
        setActionSuccess(worker.isSuspended ? "Account reactivated." : "Account suspended.");
        router.refresh();
      } else {
        setActionError(result.error || "Failed to update suspension status");
      }
    });
  };

  const handleSendReminder = () => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const result = await sendWorkerVerificationReminder(worker.userId);
      if (result.success) {
        setActionSuccess("KYC verification reminder dispatched to artisan.");
        router.refresh();
      } else {
        setActionError(result.error || "Failed to send reminder.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Top Navigation Link ── */}
      <div>
        <Link
          href="/admin/workers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Workers Directory</span>
        </Link>
      </div>

      {/* ── Flush Header (Unwrapped) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 bg-secondary border border-border">
            <AvatarFallback className="bg-accent text-accent-foreground text-xl font-bold">
              {getInitials(worker.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {worker.fullName}
              </h1>
              <Badge
                className={
                  worker.isSuspended
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }
              >
                {worker.isSuspended ? "Suspended" : "Active"}
              </Badge>
              <Badge
                className={
                  worker.isVerified
                    ? "bg-accent/20 text-accent border-accent/30"
                    : "bg-muted text-muted-foreground border-border"
                }
              >
                {worker.isVerified ? "Fayda Verified" : "Pending KYC"}
              </Badge>
              {worker.district && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {worker.district}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {worker.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                +251 {worker.phone || "No phone recorded"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(worker.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!worker.isVerified && (
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
                worker.isSuspended
                  ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                  : "text-destructive hover:text-destructive hover:bg-destructive/10"
              }
            >
              <Ban className="w-3.5 h-3.5 mr-1.5" />
              {worker.isSuspended ? "Reactivate Account" : "Suspend Account"}
            </Button>
          )}

          <Link href={`/admin/verify/${worker.userId}`}>
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              Inspect KYC Submission
            </Button>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* ── 4 Key Performance Metrics (Matching customers.tsx) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Escrow Revenue</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-accent mt-1">
                ETB {worker.totalEarnings.toLocaleString()}
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
              <p className="text-xs text-muted-foreground font-medium">Completed Contracts</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-1">
                {worker.totalJobs}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Customer Rating</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-amber-500 mt-1 flex items-center gap-1">
                <span>{worker.avgRating}</span>
                <Star className="w-4 h-4 fill-amber-500 inline" />
                <span className="text-xs text-muted-foreground font-normal">
                  ({worker.ratingCount})
                </span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Trade Experience</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-1">
                {worker.experienceYears || 1} Years
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 2-Column Unwrapped Dossier Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personnel & Contact Record */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Artisan Information</CardTitle>
              <CardDescription>Verified profile attributes and contact records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground block font-medium">Full Name</span>
                <p className="text-sm font-semibold text-foreground mt-0.5">{worker.fullName}</p>
              </div>

              <div>
                <span className="text-muted-foreground block font-medium">Work Email</span>
                <p className="text-sm font-medium text-foreground mt-0.5">{worker.email}</p>
              </div>

              <div>
                <span className="text-muted-foreground block font-medium">Direct Phone</span>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  +251 {worker.phone || "Not recorded"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground block font-medium">District & Operating Zone</span>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {worker.district || "Dire Dawa, Ethiopia"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground block font-medium">Fayda National ID</span>
                <p className="text-sm font-mono font-medium text-foreground mt-0.5">
                  {worker.finLast4 ? `•••• •••• •••• ${worker.finLast4}` : "Unlinked"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground block font-medium mb-1.5">Trade Skills & Badges</span>
                <div className="flex flex-wrap gap-1.5">
                  {worker.skills && worker.skills.length > 0 ? (
                    worker.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">General Artisan</span>
                  )}
                </div>
              </div>

              {worker.bio && (
                <div>
                  <span className="text-muted-foreground block font-medium mb-1">Biography</span>
                  <p className="text-xs text-foreground/80 leading-relaxed bg-secondary/50 p-3 rounded-lg border border-border">
                    {worker.bio}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Governance & Identity Standing</CardTitle>
              <CardDescription>System access privileges and integrity oversight</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Account Status</span>
                <span
                  className={`font-semibold ${
                    worker.isSuspended ? "text-destructive" : "text-emerald-500"
                  }`}
                >
                  {worker.isSuspended ? "Suspended by Admin" : "Active & In Good Standing"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Fayda KYC State</span>
                <span className="font-semibold text-foreground capitalize">
                  {worker.verificationStatus?.replaceAll("_", " ") || "Pending Review"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">Personnel UUID</span>
                <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[150px]">
                  {worker.userId}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Contracts History & Customer Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Marketplace Contracts</CardTitle>
                <CardDescription>Escrow-backed contracts and completed milestone settlements</CardDescription>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {contracts.length} records
              </span>
            </CardHeader>
            <CardContent className="p-0">
              {contracts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-y border-border bg-secondary/30 text-muted-foreground">
                        <th className="py-2.5 px-4 font-medium">Job Title</th>
                        <th className="py-2.5 px-4 font-medium">Employer Client</th>
                        <th className="py-2.5 px-4 font-medium">Amount</th>
                        <th className="py-2.5 px-4 font-medium">Status</th>
                        <th className="py-2.5 px-4 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {contracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-4 font-semibold text-foreground">
                            {contract.jobTitle}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {contract.clientName}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-accent">
                            ETB {contract.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                contract.status === "completed"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : contract.status === "in_progress" || contract.status === "funded"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : "bg-secondary text-muted-foreground border-border"
                              }
                            >
                              {contract.status.replaceAll("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {contract.createdAt
                              ? new Date(contract.createdAt).toLocaleDateString()
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
                  <p className="text-sm font-medium text-foreground">No Contracts Recorded Yet</p>
                  <p className="text-xs text-muted-foreground">
                    This artisan has not participated in settled marketplace contracts yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Client Feedback & Ratings</CardTitle>
                <CardDescription>Verified employer reviews upon milestone approval</CardDescription>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {ratings.length} reviews
              </span>
            </CardHeader>
            <CardContent>
              {ratings.length > 0 ? (
                <div className="space-y-3">
                  {ratings.map((rating) => (
                    <div
                      key={rating.id}
                      className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">
                          {rating.raterName}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rating.score ? "fill-amber-500" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{rating.reviewText}</p>
                      <span className="text-[10px] text-muted-foreground block pt-1">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-2">
                  <Star className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-sm font-medium text-foreground">No Customer Ratings Yet</p>
                  <p className="text-xs text-muted-foreground">
                    Ratings will populate as employer clients review completed milestones.
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

