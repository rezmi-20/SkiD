"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Globe, 
  Calendar, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  MapPin, 
  Lock, 
  Moon, 
  Sun,
  Star,
  Activity,
  Hash,
  CreditCard
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ProfileContentProps {
  user: {
    name: string;
    email: string;
    role: "client" | "worker";
    initials: string;
    avatarUrl?: string | null;
    is_verified?: boolean;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    district?: string;
    verificationStatus?: string;
    maskedFin?: string | null;
  };
  stats: {
    label: string;
    value: string;
  }[];
  menuGroups: {
    group: string;
    items: {
      label: string;
      subtitle: string;
      icon: string;
      link?: string;
      onClick?: () => void;
      isLoading?: boolean;
      isSuccess?: boolean;
    }[];
  }[];
  skills?: string[];
}

export default function ProfileContent({ user, stats, menuGroups, skills }: ProfileContentProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const identityVerified = Boolean(user.is_verified && user.maskedFin);
  const verificationHref = user.role === "worker" ? "/worker/pending-verification" : "/client/profile/settings?verify=1&returnTo=/client/profile";
  const verificationLabel = (() => {
    if (identityVerified) return t("profile.verified");
    switch (user.verificationStatus) {
      case "pending": return t("verification.status.pending");
      case "approved": return t("verification.status.approved");
      case "rejected": return t("verification.status.rejected");
      case "resubmission_requested": return t("verification.status.resubmission_requested");
      case "suspended": return t("verification.status.suspended");
      case "revoked": return t("verification.status.revoked");
      default: return t("profile.incomplete");
    }
  })();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-5xl mx-auto pb-24">
      
      {/* ── HEADER BLOCK (No card border/box, blends with page background) ── */}
      <div className="relative py-8 flex flex-col items-center text-center">
        {/* Subtle grid pattern background to blend in */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(var(--color-primary) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Avatar Section */}
          <div className="relative mb-4">
            <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full border-4 border-background p-1.5 shadow-lg flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>

          {/* User Name & Details */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-extrabold text-foreground">{user.name}</h1>
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
              <CheckCircle2 size={12} className="fill-white text-blue-500" />
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-medium mb-4">{user.email}</p>

          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-card border-border">
              {user.role === "worker" ? t("profile.verifiedProvider") : t("profile.clientAccount")}
            </Badge>
            {user.role === "worker" && (
              <Badge variant="outline" className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                {t("profile.faydaActive")}
              </Badge>
            )}
            {user.role === "client" && !identityVerified && (
              <Badge variant="outline" className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border-amber-500/20">
                {t("profile.faydaPending")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI/STATS ROW (Clean, borderless grid items) ── */}
      <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto border-t border-b border-border/60 py-6">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center justify-center text-center">
            <span className="text-2xl md:text-3xl font-black text-foreground">{stat.value}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── SKILLS ROW (Worker Only) ── */}
      {skills && skills.length > 0 && (
        <div className="space-y-3 max-w-3xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">{t("profile.professionalSkills")}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {skills.map((skill, i) => (
              <Badge key={i} variant="secondary" className="px-3.5 py-1.5 text-xs rounded-xl font-semibold bg-indigo-500/10 text-indigo-600 border-none">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* ── PROFILE DETAILS GRID (Directly on page background) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pt-4">
        
        {/* Card 1: Personal Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/80">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">{t("profile.personalDetails")}</h2>
            <Link href={user.role === "worker" ? "/worker/profile/settings" : "/client/profile/settings"}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary rounded-lg gap-1 hover:bg-primary/5 px-2">
                <Settings size={12} /> {t("profile.edit")}
              </Button>
            </Link>
          </div>

          <div className="space-y-1 text-sm">
            {[
              { label: t("profile.fullName"), value: user.name },
              { label: t("profile.dateOfBirth"), value: user.dateOfBirth || t("profile.defaultDob") },
              { label: t("profile.gender"), value: user.gender || t("profile.genderMale") },
              { label: t("profile.nationality"), value: t("profile.nationalityEthiopian") },
              { label: t("profile.address"), value: user.district ? `${user.district}, Dire Dawa` : t("profile.defaultAddress") },
              { label: t("profile.phoneNumber"), value: user.phone || t("profile.defaultPhone") },
              { label: t("checkout.email"), value: user.email },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground font-medium">{row.label}</span>
                <span className="font-semibold text-foreground text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Account Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/80">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">{t("profile.accountDetails")}</h2>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] uppercase tracking-wider rounded-full px-2 py-0">{t("profile.active")}</Badge>
          </div>

          <div className="space-y-1 text-sm">
            {[
              { label: t("profile.displayName"), value: user.name.toLowerCase().replace(/\s+/g, "_") + "_ds" },
              { label: t("profile.accountCreated"), value: t("profile.accountCreatedDate") },
              { label: t("profile.lastLogin"), value: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) },
              { label: t("profile.membershipStatus"), value: t("profile.premiumMember") },
              { label: t("profile.accountVerification"), value: verificationLabel, isBadge: true },
              { label: t("profile.faydaFin"), value: user.maskedFin || t("profile.notRecorded") },
              { label: t("footer.language"), value: language === "en" ? "English" : language === "am" ? "Amharic" : "Afaan Oromo" },
              { label: t("profile.timeZone"), value: t("profile.eastAfricaTime") },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground font-medium">{row.label}</span>
                {row.isBadge ? (
                  <Badge variant="outline" className={`${identityVerified ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"} rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider`}>
                    {row.value}
                  </Badge>
                ) : (
                  <span className="font-semibold text-foreground text-right">{row.value}</span>
                )}
              </div>
            ))}
          </div>
          {!identityVerified && (
            <Button asChild size="sm" className="rounded-xl text-xs font-semibold">
              <Link href={verificationHref}>{t("profile.completeFayda")}</Link>
            </Button>
          )}
        </div>

        {/* Card 3: Security Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/80">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">{t("profile.securitySettings")}</h2>
            <Lock size={12} className="text-muted-foreground" />
          </div>

          <div className="space-y-1 text-sm">
            {[
              { label: t("profile.passwordLastChanged"), value: t("profile.passwordLastChangedDate") },
              { label: t("profile.twoFactor"), value: t("profile.enabled"), isBadge: true },
              { label: t("profile.securityQuestionsSet"), value: t("profile.yes") },
              { label: t("profile.loginNotifications"), value: t("profile.enabled"), isBadge: true },
              { label: t("profile.connectedDevices"), value: t("profile.twoDevices") },
              { label: t("profile.recentAccountActivity"), value: t("profile.noSuspiciousActivity") },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground font-medium">{row.label}</span>
                {row.isBadge ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    {row.value}
                  </Badge>
                ) : (
                  <span className="font-semibold text-foreground text-right">{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Preferences & App Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/80">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">{t("profile.preferences")}</h2>
            <Globe size={12} className="text-muted-foreground" />
          </div>

          <div className="space-y-4 text-sm pt-2">
            {/* Language Toggle */}
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground font-medium">{t("footer.language")}</span>
              <div className="flex items-center gap-1 bg-muted rounded-xl p-0.5 border border-border">
                <button 
                  onClick={() => setLanguage("en")} 
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    language === "en" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage("am")} 
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    language === "am" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  አማ
                </button>
                <button
                  onClick={() => setLanguage("om")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    language === "om" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  OM
                </button>
              </div>
            </div>

            {/* Dark Mode Switch */}
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground font-medium">{t("profile.darkModeAppearance")}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                className="h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground gap-1 px-3 border border-border"
              >
                {theme === "dark" ? <Sun size={11} /> : <Moon size={11} />}
                <span className="text-[9px] font-bold uppercase tracking-wider">{theme === "dark" ? t("profile.activated") : t("profile.deactivated")}</span>
              </Button>
            </div>

            <Separator className="bg-border/60 my-2" />

            <div className="flex flex-col gap-2 pt-1">
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-xl text-xs font-semibold h-10 border-border text-foreground hover:bg-muted"
                asChild
              >
                <Link href={user.role === "worker" ? "/worker/profile/settings" : "/client/profile/settings"}>
                  <Settings size={13} className="mr-2 text-muted-foreground" /> {t("profile.accountProfileSettings")}
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } })}
                className="w-full justify-start rounded-xl text-xs font-semibold h-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut size={13} className="mr-2" /> {t("profile.signOut")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* ── Footer ── */}
      <footer className="text-center py-8">
        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
          {t("profile.footer")}
        </p>
      </footer>
    </div>
  );
}
