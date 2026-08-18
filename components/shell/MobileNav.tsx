"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  FileText,
  CreditCard,
  MessageSquare,
  User,
  Briefcase,
  Wallet,
  Users,
  Scale,
  LifeBuoy,
} from "lucide-react";

interface NavItem {
  key: TranslationKey;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const CLIENT_NAV: NavItem[] = [
  { key: "nav.dashboard", label: "Home", href: "/client/dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "nav.discover", label: "Discover", href: "/client/search", icon: <Search size={20} /> },
  { key: "nav.contracts", label: "Contracts", href: "/client/contracts", icon: <FileText size={20} /> },
  { key: "nav.payments", label: "Payments", href: "/client/payments", icon: <CreditCard size={20} /> },
  { key: "nav.disputes", label: "Disputes", href: "/client/disputes", icon: <Scale size={20} /> },
  { key: "nav.support", label: "Support", href: "/client/support", icon: <LifeBuoy size={20} /> },
  { key: "nav.chat", label: "Chat", href: "/client/messages", icon: <MessageSquare size={20} /> },
  { key: "nav.feed", label: "Community", href: "/client/community", icon: <Users size={20} /> },
  { key: "nav.profile", label: "Profile", href: "/client/profile", icon: <User size={20} /> },
];

const WORKER_NAV: NavItem[] = [
  { key: "nav.dashboard", label: "Home", href: "/worker/dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "nav.mygigs", label: "Gigs", href: "/worker/gigs", icon: <Briefcase size={20} /> },
  { key: "nav.contracts", label: "Contracts", href: "/worker/contracts", icon: <FileText size={20} /> },
  { key: "nav.earnings", label: "Earnings", href: "/worker/earnings", icon: <Wallet size={20} /> },
  { key: "nav.disputes", label: "Disputes", href: "/worker/disputes", icon: <Scale size={20} /> },
  { key: "nav.support", label: "Support", href: "/worker/support", icon: <LifeBuoy size={20} /> },
  { key: "nav.chat", label: "Chat", href: "/worker/messages", icon: <MessageSquare size={20} /> },
  { key: "nav.feed", label: "Community", href: "/worker/community", icon: <Users size={20} /> },
  { key: "nav.profile", label: "Profile", href: "/worker/profile", icon: <User size={20} /> },
];

export default function MobileNav({ role }: { role: "client" | "worker" }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const navItems = role === "client" ? CLIENT_NAV : WORKER_NAV;

  // Show max 5 most important items on mobile
  const visibleItems = navItems.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="flex items-center h-16 border-t border-border bg-background/95 backdrop-blur-xl">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col flex-1 items-center justify-center gap-1 min-h-[44px] transition-colors"
            >
              <span
                className={cn(
                  "flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
