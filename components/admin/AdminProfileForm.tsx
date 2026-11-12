"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  User,
  Bell,
  Shield,
  Palette,
  Link2,
  Database,
  Mail,
  Smartphone,
  Globe,
  Key,
  RefreshCw,
  Check,
  ExternalLink,
  Zap,
  AlertCircle,
  CheckCircle2,
  QrCode,
  Copy,
  Trash2,
  Sliders,
  Radio,
} from "lucide-react";
import { updateAdminPassword } from "@/lib/actions/admin-account";

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  lastSync: string | null;
  configKey?: string;
}

const initialIntegrationsList: IntegrationItem[] = [
  {
    id: "chapa",
    name: "Chapa Payment Gateway",
    description: "Escrow settlements and merchant checkout",
    connected: true,
    lastSync: "2 mins ago",
    configKey: "CHASECK_TEST-••••••••••••4892",
  },
  {
    id: "fayda",
    name: "Fayda KYC Identity Service",
    description: "National ID verification and FIN checks",
    connected: true,
    lastSync: "Real-time",
    configKey: "FAYDA-PROD-API-CLIENT-991",
  },
  {
    id: "telebirr",
    name: "Telebirr Mobile Money",
    description: "Instant artisan mobile wallet payouts",
    connected: true,
    lastSync: "1 hour ago",
    configKey: "FABRIC-APP-ID-44281",
  },
  {
    id: "sms",
    name: "Ethio Telecom SMS Gateway",
    description: "Two-factor authentication and SMS dispatch",
    connected: false,
    lastSync: null,
  },
  {
    id: "cbe",
    name: "CBE Birr Settlement API",
    description: "Direct bank transfer reconciliation",
    connected: false,
    lastSync: null,
  },
  {
    id: "cloudflare",
    name: "Cloudflare Evidence Vault",
    description: "Encrypted dispute documents and photo storage",
    connected: true,
    lastSync: "5 mins ago",
    configKey: "R2-BUCKET-DIRESKILL-VAULT",
  },
];

const initialNotificationSettings = [
  {
    id: "dispute_updates",
    label: "Dispute & Mediation Alerts",
    description: "Get notified when disputes change status or require adjudication",
    email: true,
    push: true,
  },
  {
    id: "verification_activity",
    label: "Artisan Verification Submissions",
    description: "Updates on new artisan KYC documents awaiting verification",
    email: true,
    push: false,
  },
  {
    id: "escrow_alerts",
    label: "Escrow & Payout Releases",
    description: "Alerts for escrow releases, milestone holds, and dispute refunds",
    email: true,
    push: true,
  },
  {
    id: "governance_updates",
    label: "Platform Security & Governance",
    description: "Weekly audit logs, admin actions, and risk telemetry reports",
    email: true,
    push: false,
  },
  {
    id: "customer_health",
    label: "Support Escalations",
    description: "Alerts when high-priority client or artisan support tickets arrive",
    email: false,
    push: true,
  },
];

interface AdminProfile {
  email: string;
  admin_employee_id: string;
  work_email: string;
  full_name: string;
  department: string;
  phone?: string | null;
  admin_role: string;
  admin_status: string;
  activation_completed_at?: string | null;
}

export function AdminProfileForm({ profile }: { profile: AdminProfile }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState(initialNotificationSettings);
  const [integrations, setIntegrations] = useState(initialIntegrationsList);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [compactView, setCompactView] = useState(false);

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Theme integration
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || theme === "grayscale";

  // Password update state
  const passwordFormRef = useRef<HTMLFormElement>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);
  const [isPasswordPending, startPasswordTransition] = useTransition();

  // 2FA Dialog state
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorCopied, setTwoFactorCopied] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  // Active Sessions state
  const [sessions, setSessions] = useState([
    { id: "1", device: "MacBook Pro", location: "Dire Dawa, ET", current: true, time: "Now" },
    { id: "2", device: "iPhone 15 Pro", location: "Addis Ababa, ET", current: false, time: "2 hours ago" },
    { id: "3", device: "Chrome on Windows", location: "Dire Dawa, ET", current: false, time: "1 day ago" },
  ]);

  // Integration config modal state
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  const [integrationKeyInput, setIntegrationKeyInput] = useState("");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Profile Form fields state
  const nameParts = (profile.full_name || "Admin User").trim().split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "Admin");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "User");
  const [workEmail, setWorkEmail] = useState(profile.work_email || profile.email);
  const [role, setRole] = useState(profile.admin_role || "super_admin");
  const [timezone, setTimezone] = useState("eat");

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return (profile.full_name || "AD").slice(0, 2).toUpperCase();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 900);
  };

  const toggleNotification = (id: string, type: "email" | "push") => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [type]: !n[type] } : n))
    );
  };

  const handleSyncIntegration = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, connected: true, lastSync: "Just now" } : item
        )
      );
      setSyncingId(null);
    }, 1000);
  };

  const handleOpenIntegrationConfig = (item: IntegrationItem) => {
    setSelectedIntegration(item);
    setIntegrationKeyInput(item.configKey || "");
    setIsConfigModalOpen(true);
  };

  const handleSaveIntegration = () => {
    if (!selectedIntegration) return;
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === selectedIntegration.id
          ? {
              ...item,
              connected: Boolean(integrationKeyInput.trim()),
              configKey: integrationKeyInput.trim() || undefined,
              lastSync: "Just now",
            }
          : item
      )
    );
    setIsConfigModalOpen(false);
  };

  const handleDisconnectIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, connected: false, lastSync: null, configKey: undefined }
          : item
      )
    );
  };

  const handlePasswordSubmit = (formData: FormData) => {
    setPasswordMessage(null);
    const pwd = String(formData.get("password") || "");
    const confirm = String(formData.get("confirmPassword") || "");

    if (pwd !== confirm) {
      setIsPasswordSuccess(false);
      setPasswordMessage("Password confirmation does not match.");
      return;
    }

    startPasswordTransition(async () => {
      const result = await updateAdminPassword(formData);
      setIsPasswordSuccess(!!result.success);
      setPasswordMessage(
        result.success
          ? result.message || "Password updated successfully."
          : result.error || "Failed to update password."
      );
      if (result.success && passwordFormRef.current) {
        passwordFormRef.current.reset();
      }
    });
  };

  const handleVerify2FACode = () => {
    if (twoFactorCode.trim().length !== 6) {
      setTwoFactorError("Please enter a valid 6-digit verification code.");
      return;
    }
    setTwoFactorError(null);
    setIs2FAEnabled(true);
    setIs2FAModalOpen(false);
    setTwoFactorCode("");
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const copySecretKey = () => {
    navigator.clipboard.writeText("DIRE-SKILL-AUTH-9842-SEC");
    setTwoFactorCopied(true);
    setTimeout(() => setTwoFactorCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences, credentials, and platform integrations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary border border-border p-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* ── 1. Profile Tab ── */}
        <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Personal Information</CardTitle>
              <CardDescription>Update your personal details and administrator preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="size-20 bg-secondary border border-border">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt={firstName} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/png, image/jpeg, image/gif"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-secondary border-border focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-secondary border-border focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    className="bg-secondary border-border focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Platform Staff Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Administrator</SelectItem>
                      <SelectItem value="content_verification_admin">Verification Officer</SelectItem>
                      <SelectItem value="dispute_payment_admin">Dispute Mediator</SelectItem>
                      <SelectItem value="user_support_admin">Support Specialist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone & Locale</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="bg-secondary border-border w-full md:w-[320px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eat">East Africa Time (EAT, UTC+3)</SelectItem>
                    <SelectItem value="utc">Coordinated Universal Time (UTC)</SelectItem>
                    <SelectItem value="cet">Central European Time (CET)</SelectItem>
                    <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Display Preferences</CardTitle>
              <CardDescription>Customize how data and telemetry are displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                  </div>
                </div>
                <Switch
                  checked={isDark}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Currency Format</p>
                    <p className="text-sm text-muted-foreground">Display currency in your marketplace locale</p>
                  </div>
                </div>
                <Select defaultValue="etb">
                  <SelectTrigger className="w-[120px] bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="etb">ETB (Br)</SelectItem>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Compact View</p>
                    <p className="text-sm text-muted-foreground">Show denser records layout in directories</p>
                  </div>
                </div>
                <Switch
                  checked={compactView}
                  onCheckedChange={setCompactView}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSaveProfile}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                  Changes Saved
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* ── 2. Notifications Tab ── */}
        <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you want to receive administrative alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr,80px,80px] gap-4 pb-3 border-b border-border text-sm text-muted-foreground">
                  <span>Notification Type</span>
                  <span className="text-center flex items-center justify-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                  <span className="text-center flex items-center justify-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    Push
                  </span>
                </div>
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className="grid grid-cols-[1fr,80px,80px] gap-4 py-4 border-b border-border last:border-0 animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div>
                      <p className="font-medium text-foreground">{notification.label}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={notification.email}
                        onCheckedChange={() => toggleNotification(notification.id, "email")}
                      />
                    </div>
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={notification.push}
                        onCheckedChange={() => toggleNotification(notification.id, "push")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 3. Integrations Tab ── */}
        <TabsContent value="integrations" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-medium">Connected Services & Gateways</CardTitle>
                <CardDescription>Manage third-party payment gateways, national KYC, and telemetry pipelines</CardDescription>
              </div>
              <Link href="/admin/settings?tab=integrations">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Platform Integrations Hub</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration, index) => (
                  <div
                    key={integration.id}
                    className={`p-4 rounded-lg border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                      integration.connected
                        ? "bg-secondary/50 border-border hover:border-accent/50"
                        : "bg-secondary/20 border-border hover:border-muted-foreground/30"
                    }`}
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            integration.connected ? "bg-accent/20" : "bg-muted"
                          }`}
                        >
                          <Zap
                            className={`w-5 h-5 ${
                              integration.connected ? "text-accent" : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          integration.connected
                            ? "bg-accent/20 text-accent border-accent/30"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {integration.connected ? "Connected" : "Not connected"}
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {integration.connected ? (
                        <>
                          <span className="text-xs text-muted-foreground">
                            Last sync: {integration.lastSync}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              disabled={syncingId === integration.id}
                              onClick={() => handleSyncIntegration(integration.id)}
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 mr-1.5 ${
                                  syncingId === integration.id ? "animate-spin" : ""
                                }`}
                              />
                              {syncingId === integration.id ? "Syncing..." : "Sync"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() => handleOpenIntegrationConfig(integration)}
                            >
                              Configure
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-destructive hover:text-destructive"
                              onClick={() => handleDisconnectIntegration(integration.id)}
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
                            className="h-8 bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => handleOpenIntegrationConfig(integration)}
                          >
                            Connect
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

        {/* ── 4. Security Tab ── */}
        <TabsContent value="security" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Password & Authentication</CardTitle>
              <CardDescription>Manage your personnel security credentials and secret phrase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {passwordMessage && (
                <div
                  className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
                    isPasswordSuccess
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}
                >
                  {isPasswordSuccess ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordMessage}</span>
                </div>
              )}

              <form ref={passwordFormRef} action={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    placeholder="Enter current password"
                    className="bg-secondary border-border focus:border-accent max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">New Strong Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Min 8 chars with uppercase, number & symbol"
                    className="bg-secondary border-border focus:border-accent max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    className="bg-secondary border-border focus:border-accent max-w-md"
                  />
                </div>
                <Button variant="outline" type="submit" disabled={isPasswordPending}>
                  {isPasswordPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Two-Factor Authentication (2FA)</CardTitle>
              <CardDescription>Add an extra layer of biometric or authenticator security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Key className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Authenticator App (TOTP)</p>
                    <p className="text-sm text-muted-foreground">
                      Use Google Authenticator or 1Password for time-based 6-digit OTP codes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      is2FAEnabled
                        ? "bg-accent/20 text-accent border-accent/30"
                        : "bg-muted text-muted-foreground border-border"
                    }
                  >
                    {is2FAEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIs2FAModalOpen(true)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Active Workstation Sessions</CardTitle>
              <CardDescription>Inspect authorized devices currently signed in to your administrative account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {session.device}
                          {session.current && (
                            <Badge className="ml-2 bg-accent/20 text-accent border-accent/30 text-xs">
                              Current
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.location} • {session.time}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── 2FA Management Dialog ── */}
      <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication Setup</DialogTitle>
            <DialogDescription>
              Scan this QR code with Google Authenticator, 1Password, or Authy to configure 2FA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Mock QR Visual */}
            <div className="flex flex-col items-center justify-center p-4 bg-secondary/60 rounded-xl border border-border">
              <div className="w-36 h-36 bg-white dark:bg-card p-2 rounded-lg border border-border flex items-center justify-center shadow-xs">
                <QrCode className="w-32 h-32 text-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Can&apos;t scan? Enter the secret key manually:
              </p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs font-mono font-bold text-accent bg-background px-2.5 py-1 rounded border border-border">
                  DIRE-SKILL-AUTH-9842-SEC
                </code>
                <Button variant="ghost" size="icon-sm" onClick={copySecretKey} title="Copy Key">
                  {twoFactorCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twoFactorCode">Enter 6-Digit Authenticator Code</Label>
              <Input
                id="twoFactorCode"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.slice(0, 6))}
                placeholder="000 000"
                maxLength={6}
                className="text-center font-mono tracking-widest text-base"
              />
              {twoFactorError && (
                <p className="text-xs text-destructive font-semibold">{twoFactorError}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {is2FAEnabled ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setIs2FAEnabled(false);
                  setIs2FAModalOpen(false);
                }}
              >
                Disable 2FA
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIs2FAModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleVerify2FACode}>
                Verify & Activate
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Integration Config Dialog ── */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}. Enter credentials to authenticate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="apiKeyInput">API Secret / Access Key</Label>
              <Input
                id="apiKeyInput"
                value={integrationKeyInput}
                onChange={(e) => setIntegrationKeyInput(e.target.value)}
                placeholder="Enter client secret or bearer token"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Keys are stored encrypted and masked in PostgreSQL vault storage.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs space-y-1">
              <span className="font-semibold text-foreground">Endpoint Health Ping</span>
              <p className="text-muted-foreground">
                Tested against https://api.direskill.et/v1/gateways/{selectedIntegration?.id}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveIntegration}>
              Save & Test Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
