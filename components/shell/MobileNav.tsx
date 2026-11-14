"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  Home,
  Search,
  Briefcase,
  FileText,
  User,
  Users,
} from "lucide-react";
import { cx } from "@/utils/cx";

interface MobileNavProps {
  role: "client" | "worker";
}

export default function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread-count");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.count === "number") {
            setUnreadCount(data.count);
          }
        }
      } catch {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 4000);

    const handleUpdate = () => fetchUnread();
    window.addEventListener("messages:refresh", handleUpdate);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("messages:refresh", handleUpdate);
    };
  }, []);

  const isHomeActive = pathname === `/${role}/dashboard`;
  const isSearchActive = pathname?.includes("/search") || pathname?.includes("/gigs");
  const isCommunityActive = pathname?.includes("/community");
  const isContractsActive = pathname?.includes("/contracts") || pathname?.includes("/payments");
  const isProfileActive = pathname?.includes("/profile");

  const leftItems = [
    {
      id: "home",
      label: t("nav.home") || "Home",
      href: `/${role}/dashboard`,
      icon: Home,
      isActive: isHomeActive,
    },
    {
      id: "search",
      label: role === "worker" ? t("nav.mygigs") || "Gigs" : t("nav.search") || "Search",
      href: role === "worker" ? "/worker/gigs" : "/client/search",
      icon: role === "worker" ? Briefcase : Search,
      isActive: isSearchActive,
    },
  ];

  const rightItems = [
    {
      id: "contracts",
      label: t("nav.contracts") || "Contracts",
      href: `/${role}/contracts`,
      icon: FileText,
      isActive: isContractsActive,
      badge: unreadCount,
    },
    {
      id: "profile",
      label: t("nav.profile") || "Profile",
      href: `/${role}/profile`,
      icon: User,
      isActive: isProfileActive,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 w-full z-50 select-none bg-white/98 dark:bg-[#12171e]/98 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="relative w-full max-w-lg mx-auto h-[60px] sm:h-[64px] px-2 flex items-center justify-between">
        {/* ── Left 2 Items (Home & Search/Gigs) ── */}
        {leftItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className="flex-1 h-full flex flex-col items-center justify-center py-1 group active:scale-95 transition-transform touch-manipulation"
            >
              <div className="relative">
                <Icon
                  className={cx(
                    "h-5 w-5 transition-colors",
                    isActive
                      ? "text-zinc-950 dark:text-white stroke-[2.3]"
                      : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 stroke-[1.8]"
                  )}
                />
              </div>

              {/* Label */}
              <span
                className={cx(
                  "text-[10.5px] mt-0.5 tracking-tight transition-colors",
                  isActive
                    ? "font-bold text-zinc-950 dark:text-white"
                    : "font-medium text-zinc-400 dark:text-zinc-500"
                )}
              >
                {item.label}
              </span>

              {/* Active Dot Indicator (Exact Sixpay Match) */}
              <span
                className={cx(
                  "w-1 h-1 rounded-full mt-0.5 transition-opacity",
                  isActive ? "bg-zinc-950 dark:bg-white opacity-100" : "opacity-0"
                )}
              />
            </Link>
          );
        })}

        {/* ── Center Elevated Circle Action (Community Feed) ── */}
        <div className="relative flex-1 h-full flex items-center justify-center">
          <Link
            href={`/${role}/community`}
            aria-label="Community Feed"
            className="absolute -top-5 sm:-top-6 flex flex-col items-center group active:scale-90 transition-transform touch-manipulation"
          >
            {/* Dark green circle with white ring matching reference photo */}
            <div
              className={cx(
                "w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#134e27] border-[4px] border-white dark:border-[#12171e] text-[#a4fe47] flex items-center justify-center shadow-[0_8px_20px_rgba(19,78,39,0.45)] transition-all",
                isCommunityActive && "ring-2 ring-[#a4fe47] shadow-[0_8px_28px_rgba(164,254,71,0.5)]"
              )}
            >
              <Users className="h-6 w-6 text-[#a4fe47] stroke-[2.2]" />
            </div>
          </Link>
        </div>

        {/* ── Right 2 Items (Contracts & Profile) ── */}
        {rightItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className="flex-1 h-full flex flex-col items-center justify-center py-1 group active:scale-95 transition-transform touch-manipulation"
            >
              <div className="relative">
                <Icon
                  className={cx(
                    "h-5 w-5 transition-colors",
                    isActive
                      ? "text-zinc-950 dark:text-white stroke-[2.3]"
                      : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 stroke-[1.8]"
                  )}
                />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-0.5 rounded-full bg-rose-500 text-white font-black text-[8px] flex items-center justify-center shadow-xs">
                    {(item.badge ?? 0) > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cx(
                  "text-[10.5px] mt-0.5 tracking-tight transition-colors",
                  isActive
                    ? "font-bold text-zinc-950 dark:text-white"
                    : "font-medium text-zinc-400 dark:text-zinc-500"
                )}
              >
                {item.label}
              </span>

              {/* Active Dot Indicator (Exact Sixpay Match) */}
              <span
                className={cx(
                  "w-1 h-1 rounded-full mt-0.5 transition-opacity",
                  isActive ? "bg-zinc-950 dark:bg-white opacity-100" : "opacity-0"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
