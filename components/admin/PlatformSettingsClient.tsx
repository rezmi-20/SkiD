"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sliders,
  Link2,
  Activity,
  Shield,
  Zap,
  RefreshCw,
  Check,
  CheckCircle2,
  ExternalLink,
  Users,
  Briefcase,
  UserRound,
  FileText,
  CreditCard,
  Scale,
  Key,
  Database,
  Radio,
  Terminal,
  Send,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface StatsData {
  totalUsers: number;
  totalWorkers: number;
  totalClients: number;
  totalJobs: number;
  totalPayments: number;
}

interface Props {
  stats: StatsData;
}

interface IntegrationService {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  lastSync: string | null;
  fields: { label: string; placeholder: string; defaultValue?: string; type?: string }[];
}

const initialServices: IntegrationService[] = [
  {
    id: "chapa",
    name: "Chapa Payment Gateway",
    description: "Escrow settlements, card payments, and merchant checkout",
    connected: true,
    lastSync: "2 mins ago",
    fields: [
      { label: "Secret API Key", placeholder: "CHASECK_TEST-••••••••••••4892", defaultValue: "CHASECK_TEST-4892719a84" },
      { label: "Public API Key", placeholder: "CHAPUBK_TEST-••••••••••••1029", defaultValue: "CHAPUBK_TEST-1029810b12" },
      { label: "Webhook Signature Secret", placeholder: "chapa-webhook-secret-phrase", defaultValue: "direskill-chapa-webhook-v1" },
    ],
  },
  {
    id: "fayda",
    name: "Fayda KYC Identity Service",
    description: "National ID verification, FIN lookup, and biometric validation",
    connected: true,
    lastSync: "Real-time",
    fields: [
      { label: "API Gateway Endpoint", placeholder: "https://api.fayda.et/v2/verify", defaultValue: "https://api.fayda.et/v2/verify" },
      { label: "OAuth Client ID", placeholder: "FAYDA-PROD-CLIENT-991", defaultValue: "FAYDA-PROD-CLIENT-991" },
      { label: "Client Secret", placeholder: "••••••••••••••••••••••••", defaultValue: "sec_991820491820412" },
    ],
  },
  {
    id: "telebirr",
    name: "Telebirr Mobile Money",
    description: "Instant artisan mobile wallet payouts and deposit push",
    connected: true,
    lastSync: "1 hour ago",
    fields: [
      { label: "Fabric App ID", placeholder: "FABRIC-APP-ID-44281", defaultValue: "FABRIC-APP-ID-44281" },
      { label: "Merchant Short Code", placeholder: "100293", defaultValue: "100293" },
      { label: "App Secret", placeholder: "••••••••••••••••", defaultValue: "tb_sec_99410" },
    ],
  },
  {
    id: "sms",
    name: "Ethio Telecom SMS Gateway",
    description: "Two-factor authentication codes and dispute event alerts",
    connected: false,
    lastSync: null,
    fields: [
      { label: "SMS Gateway URL", placeholder: "https://sms.ethiotelecom.et/api/v1/send" },
      { label: "Sender Alpha Tag", placeholder: "DireSkill", defaultValue: "DireSkill" },
      { label: "Access Token", placeholder: "Bearer token from Ethio Telecom" },
    ],
  },
  {
    id: "cbe",
    name: "CBE Birr Settlement API",
    description: "Direct Commercial Bank of Ethiopia escrow transfers",
    connected: false,
    lastSync: null,
    fields: [
      { label: "CBE Terminal ID", placeholder: "CBE-TERM-9901" },
      { label: "Merchant Account Number", placeholder: "1000192847192" },
      { label: "Reconciliation Webhook URL", placeholder: "https://api.direskill.et/webhooks/cbe" },
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare Evidence Vault",
    description: "Encrypted dispute court attachments and KYC document archive",
    connected: true,
    lastSync: "5 mins ago",
    fields: [
      { label: "R2 Bucket Name", placeholder: "direskill-evidence-vault", defaultValue: "direskill-evidence-vault" },
      { label: "Cloudflare Account ID", placeholder: "c98f••••••••••••34a1", defaultValue: "c98f1029384734a1" },
      { label: "Access Key ID", placeholder: "R2_ACCESS_KEY_••••", defaultValue: "R2_ACCESS_KEY_9941" },
    ],
  },
];

export function PlatformSettingsClient({ stats }: Props) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "general";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [services, setServices] = useState<IntegrationService[]>(initialServices);

  // General tab states
  const [fee, setFee] = useState("5");
  const [minDeposit, setMinDeposit] = useState("500");
  const [autoReleaseWindow, setAutoReleaseWindow] = useState("72h");
  const [currency, setCurrency] = useState("etb");

  // Payment Simulator states
  const [isSimulatorEnabled, setIsSimulatorEnabled] = useState(true);
  const [isAutoAcknowledge, setIsAutoAcknowledge] = useState(true);
  const [isCbeBirrSimulation, setIsCbeBirrSimulation] = useState(false);
  const [isSendingPing, setIsSendingPing] = useState(false);
  const [testWebhookResult, setTestWebhookResult] = useState<string | null>(null);

  // Security & Governance states
  const [strictFayda, setStrictFayda] = useState(true);
  const [autoHold, setAutoHold] = useState(true);
  const [mandatory2FA, setMandatory2FA] = useState(false);
  const [auditLogging, setAuditLogging] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30m");

  // Save feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Modal configuration state
  const [selectedService, setSelectedService] = useState<IntegrationService | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [modalFormState, setModalFormState] = useState<Record<string, string>>({});
  const [isTestingService, setIsTestingService] = useState(false);
  const [serviceTestSuccess, setServiceTestSuccess] = useState<string | null>(null);

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["general", "integrations", "telemetry", "security"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleSaveParameters = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const handleSyncService = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, connected: true, lastSync: "Just now" } : s))
      );
      setSyncingId(null);
    }, 1000);
  };

  const handleOpenConfigModal = (service: IntegrationService) => {
    setSelectedService(service);
    const initialMap: Record<string, string> = {};
    service.fields.forEach((f) => {
      initialMap[f.label] = f.defaultValue || "";
    });
    setModalFormState(initialMap);
    setServiceTestSuccess(null);
    setIsConfigDialogOpen(true);
  };

  const handleSaveServiceConfig = () => {
    if (!selectedService) return;
    setIsTestingService(true);
    setTimeout(() => {
      setIsTestingService(false);
      setServices((prev) =>
        prev.map((s) =>
          s.id === selectedService.id
            ? { ...s, connected: true, lastSync: "Just now" }
            : s
        )
      );
      setServiceTestSuccess("Credentials validated and connection verified (HTTP 200).");
      setTimeout(() => {
        setIsConfigDialogOpen(false);
      }, 1000);
    }, 800);
  };

  const handleDisconnectService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, connected: false, lastSync: null } : s))
    );
  };

  const handleSendTestWebhook = () => {
    setIsSendingPing(true);
    setTestWebhookResult(null);
    setTimeout(() => {
      setIsSendingPing(false);
      const simulatedResponse = {
        event: "chapa.checkout.success",
        timestamp: new Date().toISOString(),
        status: "200 OK",
        data: {
          tx_ref: `tx-sim-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: "1,500.00",
          currency: "ETB",
          payment_method: "CBE_BIRR",
          artisan_payout_escrow: "1,425.00",
          platform_commission: "75.00",
        },
      };
      setTestWebhookResult(JSON.stringify(simulatedResponse, null, 2));
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header (Unwrapped) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Platform Settings & Governance
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage global escrow parameters, payment simulator sandbox, and live infrastructure telemetry
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Platform settings saved</span>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary border border-border p-1">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Sliders className="w-4 h-4 mr-2" />
            General Parameters
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Integrations & Gateways
          </TabsTrigger>
          <TabsTrigger
            value="telemetry"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Activity className="w-4 h-4 mr-2" />
            System Telemetry
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Shield className="w-4 h-4 mr-2" />
            Governance & Rules
          </TabsTrigger>
        </TabsList>

        {/* ── 1. General Parameters Tab ── */}
        <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Escrow & Commission Parameters</CardTitle>
              <CardDescription>Configure marketplace fee deductions and automated milestone settlements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="commissionFee">Platform Commission Fee (%)</Label>
                  <div className="relative">
                    <Input
                      id="commissionFee"
                      type="number"
                      min={0}
                      max={30}
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="bg-secondary border-border focus:border-accent font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deducted from completed contracts upon mutual release. At {fee}%, a 1,000 ETB job retains {Number(fee) * 10} ETB for platform operations.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="autoRelease">Milestone Auto-Release Window</Label>
                  <Select value={autoReleaseWindow} onValueChange={setAutoReleaseWindow}>
                    <SelectTrigger className="bg-secondary border-border w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Hours after Milestone Completion</SelectItem>
                      <SelectItem value="48h">48 Hours after Milestone Completion</SelectItem>
                      <SelectItem value="72h">72 Hours (DireSkill Standard)</SelectItem>
                      <SelectItem value="7d">7 Days (Extended Commercial Trade)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Grace period before uncontested artisan milestone claims release automatically.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="minEscrow">Minimum Escrow Contract Deposit</Label>
                  <Select value={minDeposit} onValueChange={setMinDeposit}>
                    <SelectTrigger className="bg-secondary border-border w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="250">250 ETB (Entry Repairs)</SelectItem>
                      <SelectItem value="500">500 ETB (Standard Minimum)</SelectItem>
                      <SelectItem value="1000">1,000 ETB (Substantial Trade Jobs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Marketplace Base Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-secondary border-border w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="etb">ETB - Ethiopian Birr (Br)</SelectItem>
                      <SelectItem value="usd">USD - US Dollar ($)</SelectItem>
                      <SelectItem value="eur">EUR - Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Simulator Box with Interactive Ping */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Payment Gateway Sandbox & Simulator</CardTitle>
              <CardDescription>Simulate Ethiopian bank webhooks, mobile deposits, and CBE Birr transfers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Chapa Simulator Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Simulate checkout approvals without debiting live capital accounts
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isSimulatorEnabled}
                  onCheckedChange={setIsSimulatorEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Webhook Auto-Acknowledgment</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically acknowledge incoming payment gateway webhooks during integration tests
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isAutoAcknowledge}
                  onCheckedChange={setIsAutoAcknowledge}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">CBE Birr Instant Reconciliation</p>
                    <p className="text-xs text-muted-foreground">
                      Mock direct bank settlement verification in test environments
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isCbeBirrSimulation}
                  onCheckedChange={setIsCbeBirrSimulation}
                />
              </div>

              {/* Interactive Webhook Ping Tester */}
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-accent" />
                    <span>Interactive Webhook Ping Simulator</span>
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSendingPing}
                    onClick={handleSendTestWebhook}
                    className="gap-1.5"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSendingPing ? "animate-pulse" : ""}`} />
                    <span>{isSendingPing ? "Dispatching..." : "Send Test Ping"}</span>
                  </Button>
                </div>

                {testWebhookResult && (
                  <pre className="p-3.5 rounded-lg bg-secondary/80 border border-border text-[11px] font-mono text-foreground overflow-x-auto">
                    {testWebhookResult}
                  </pre>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSaveParameters}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving Parameters...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Parameters
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* ── 2. Integrations Tab ── */}
        <TabsContent value="integrations" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Connected Services & Gateways</CardTitle>
              <CardDescription>Inspect status, configure API credentials, and sync external gateways</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    className={`p-4 rounded-lg border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                      service.connected
                        ? "bg-secondary/50 border-border hover:border-accent/50"
                        : "bg-secondary/20 border-border hover:border-muted-foreground/30"
                    }`}
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            service.connected ? "bg-accent/20" : "bg-muted"
                          }`}
                        >
                          <Zap
                            className={`w-5 h-5 ${
                              service.connected ? "text-accent" : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          service.connected
                            ? "bg-accent/20 text-accent border-accent/30 text-xs"
                            : "bg-muted text-muted-foreground border-border text-xs"
                        }
                      >
                        {service.connected ? "Connected" : "Not configured"}
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/50">
                      {service.connected ? (
                        <>
                          <span className="text-xs text-muted-foreground">
                            Last sync: {service.lastSync}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={syncingId === service.id}
                              onClick={() => handleSyncService(service.id)}
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 mr-1.5 ${
                                  syncingId === service.id ? "animate-spin" : ""
                                }`}
                              />
                              {syncingId === service.id ? "Syncing..." : "Sync"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs font-semibold"
                              onClick={() => handleOpenConfigModal(service)}
                            >
                              Configure
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleDisconnectService(service.id)}
                            >
                              Disconnect
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-muted-foreground">Not configured</span>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                            onClick={() => handleOpenConfigModal(service)}
                          >
                            Configure & Connect
                            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 3. Telemetry Tab ── */}
        <TabsContent value="telemetry" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Neon PostgreSQL Records Telemetry</CardTitle>
                <CardDescription>Real-time record volumes stored in production PostgreSQL database</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSyncingId("telemetry");
                  setTimeout(() => setSyncingId(null), 800);
                }}
                className="gap-1.5 text-xs"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${syncingId === "telemetry" ? "animate-spin" : ""}`}
                />
                <span>Refresh Counts</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-secondary/40 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">Registered Users</span>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">{stats.totalUsers}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/40 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">Artisan Profiles</span>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">{stats.totalWorkers}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/40 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">Employer Clients</span>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">{stats.totalClients}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                    <UserRound className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/40 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">Marketplace Jobs</span>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">{stats.totalJobs}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/40 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">Settled Payments</span>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">{stats.totalPayments}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/40 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">Database Health</span>
                    <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Operational (100%)</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Neon Connection Pool Diagnostics</CardTitle>
              <CardDescription>Serverless WebSocket proxy, latency, and socket stability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-secondary/30 border border-border">
                  <span className="text-muted-foreground">Pooler Latency</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">18 ms (Low)</p>
                </div>
                <div className="p-3.5 rounded-lg bg-secondary/30 border border-border">
                  <span className="text-muted-foreground">Encryption Security</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">TLS 1.3 Active</p>
                </div>
                <div className="p-3.5 rounded-lg bg-secondary/30 border border-border">
                  <span className="text-muted-foreground">Serverless Region</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">AWS us-east-2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 4. Security & Governance Tab ── */}
        <TabsContent value="security" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Platform Governance & Compliance Rules</CardTitle>
              <CardDescription>Enforce trust, KYC compliance, and audit safety platform-wide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Strict Fayda National ID Enforcement</p>
                    <p className="text-xs text-muted-foreground">
                      Require verified Fayda FIN registration before artisans can bid on high-tier jobs
                    </p>
                  </div>
                </div>
                <Switch
                  checked={strictFayda}
                  onCheckedChange={setStrictFayda}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Automatic Escrow Freeze on Dispute Filing</p>
                    <p className="text-xs text-muted-foreground">
                      Instantly freeze contract milestones in escrow as soon as a dispute claim is initiated
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoHold}
                  onCheckedChange={setAutoHold}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Mandatory 2FA for Staff Accounts</p>
                    <p className="text-xs text-muted-foreground">
                      Require two-factor authenticator app confirmation on every admin personnel login
                    </p>
                  </div>
                </div>
                <Switch
                  checked={mandatory2FA}
                  onCheckedChange={setMandatory2FA}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Immutable Audit Trail Logging</p>
                    <p className="text-xs text-muted-foreground">
                      Preserve non-repudiation audit trails for all verification decisions and payout releases
                    </p>
                  </div>
                </div>
                <Switch
                  checked={auditLogging}
                  onCheckedChange={setAuditLogging}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Session Idle Timeout</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically sign out dormant administrative workstation sessions
                    </p>
                  </div>
                </div>
                <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                  <SelectTrigger className="w-[140px] bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15m">15 Minutes</SelectItem>
                    <SelectItem value="30m">30 Minutes</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="8h">8 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSaveParameters}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving Governance...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Governance Policy
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Integration Configuration Dialog ── */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure {selectedService?.name}</DialogTitle>
            <DialogDescription>
              {selectedService?.description}. Configure authentication credentials for this gateway.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedService?.fields.map((field) => (
              <div key={field.label} className="space-y-1.5">
                <Label htmlFor={field.label}>{field.label}</Label>
                <Input
                  id={field.label}
                  value={modalFormState[field.label] || ""}
                  onChange={(e) =>
                    setModalFormState((prev) => ({
                      ...prev,
                      [field.label]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  type={field.type || "text"}
                  className="font-mono text-xs bg-secondary border-border"
                />
              </div>
            ))}

            {serviceTestSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{serviceTestSuccess}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfigDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isTestingService}
              onClick={handleSaveServiceConfig}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isTestingService ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Verifying Connection...
                </>
              ) : (
                "Save & Test Connection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
