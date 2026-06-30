"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/lib/translations";

interface NavItem {
  key: TranslationKey;
  href: string;
  icon: string;
}

const CLIENT_NAV: NavItem[] = [
  { key: "nav.dashboard", href: "/client/dashboard", icon: "grid_view" },
  { key: "nav.discover", href: "/client/search", icon: "search" },
  { key: "nav.contracts", href: "/client/contracts", icon: "description" },
  { key: "nav.payments", href: "/client/payments", icon: "payments" },
  { key: "nav.chat", href: "/client/messages", icon: "chat_bubble" },
  { key: "nav.profile", href: "/client/profile", icon: "person" },
];

const WORKER_NAV: NavItem[] = [
  { key: "nav.dashboard", href: "/worker/dashboard", icon: "grid_view" },
  { key: "nav.mygigs", href: "/worker/gigs", icon: "construction" },
  { key: "nav.contracts", href: "/worker/contracts", icon: "description" },
  { key: "nav.earnings", href: "/worker/earnings", icon: "account_balance_wallet" },
  { key: "nav.chat", href: "/worker/messages", icon: "chat_bubble" },
  { key: "nav.profile", href: "/worker/profile", icon: "person" },
];

export default function MobileNav({ role }: { role: "client" | "worker" }) {
  const pathname = usePathname();
  const navItems = role === "client" ? CLIENT_NAV : WORKER_NAV;
  const { t } = useLanguage();

  return (
    <nav className="md:hidden fixed bottom-4 left-3 right-3 z-50">
      <div className="flex justify-around items-center h-16 bg-on-surface/95 backdrop-blur-xl border border-surface-container-highest/20 rounded-2xl px-1 shadow-2xl transition-all duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-all duration-300 relative group ${isActive ? "flex-[1.5]" : "flex-1"}`}
            >
              <div className={`
                flex items-center gap-1.5 px-2.5 py-2 rounded-xl transition-all duration-300
                ${isActive ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-surface-container-lowest opacity-60"}
              `}>
                <span className={`material-symbols-outlined text-[20px] ${isActive ? "filled" : ""}`}>
                  {item.icon}
                </span>
                {isActive && (
                  <span className="text-[11px] font-bold tracking-tight animate-in slide-in-from-left-2 duration-300">
                    {t(item.key).split(' ')[0]}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
