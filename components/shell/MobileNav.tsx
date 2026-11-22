"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
  Home,
  Search,
  Briefcase,
  User,
  Users,
  MessageSquare,
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

  const isHome = pathname === `/${role}/dashboard`;
  const isCommunity = pathname?.includes("/community");
  const isSearch = pathname?.includes("/search") || pathname?.includes("/gigs");
  const isMessages = pathname === `/${role}/messages`;
  const isProfile = pathname?.includes("/profile");

  // Completely hide bottom nav inside active chat threads so the message input bar is flush and unobstructed
  const isInsideActiveChat = Boolean(
    pathname && /\/(?:worker|client)\/messages\/[a-zA-Z0-9_-]+/.test(pathname)
  );

  if (isInsideActiveChat) {
    return null;
  }

  const navItems = [
    {
      id: "home",
      tourId: "tour-home",
      label: t("nav.home") || "Home",
      href: `/${role}/dashboard`,
      icon: Home,
      isActive: isHome,
      isCenter: false,
    },
    {
      id: "community",
      tourId: "tour-community",
      label: t("nav.community") || "Community",
      href: `/${role}/community`,
      icon: Users,
      isActive: isCommunity,
      isCenter: false,
    },
    {
      id: "search",
      tourId: role === "worker" ? "tour-gigs" : "tour-search",
      label: role === "worker" ? t("nav.mygigs") || "Gigs" : t("nav.search") || "Search",
      href: role === "worker" ? "/worker/gigs" : "/client/search",
      icon: role === "worker" ? Briefcase : Search,
      isActive: isSearch,
      isCenter: true,
    },
    {
      id: "messages",
      tourId: "tour-chat",
      label: t("nav.chat") || "Messages",
      href: `/${role}/messages`,
      icon: MessageSquare,
      isActive: isMessages,
      badge: unreadCount,
      isCenter: false,
    },
    {
      id: "profile",
      tourId: "tour-profile",
      label: t("nav.profile") || "Profile",
      href: `/${role}/profile`,
      icon: User,
      isActive: isProfile,
      isCenter: false,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] inset-x-0 z-50 flex justify-center pointer-events-none select-none px-3">
      <div className="pointer-events-auto relative w-full max-w-[365px] sm:max-w-[410px] h-[58px] sm:h-[62px] px-2 sm:px-2.5 rounded-full bg-[#121316]/95 dark:bg-[#0c0d10]/95 backdrop-blur-2xl border border-white/10 dark:border-white/10 shadow-[0_14px_40px_rgba(0,0,0,0.45)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.7)] flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          // ── Pattern B: Elevated Circular Center Hero Button ──
          if (item.isCenter) {
            return (
              <Link
                key={item.id}
                id={item.tourId}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className="relative -top-3 sm:-top-3.5 flex flex-col items-center justify-center shrink-0 transition-transform active:scale-90 touch-manipulation select-none group"
              >
                <div
                  className={cx(
                    "w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all duration-300 border-[3.5px] border-[#121316] dark:border-[#0c0d10]",
                    isActive
                      ? "bg-[#134e27] text-[#a4fe47] shadow-[0_8px_24px_rgba(19,78,39,0.55)] ring-2 ring-[#a4fe47]/40 scale-105"
                      : "bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                  )}
                >
                  <Icon
                    className={cx(
                      "h-5 w-5 sm:h-5.5 sm:w-5.5 transition-colors",
                      isActive ? "stroke-[2.4]" : "stroke-[2.2]"
                    )}
                  />
                </div>
              </Link>
            );
          }

          // ── Pattern A: Standard Tabs with Active Pill Expansion ──
          return (
            <Link
              key={item.id}
              id={item.tourId}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={cx(
                "relative flex items-center justify-center rounded-full transition-all touch-manipulation select-none group",
                isActive
                  ? "px-3 sm:px-3.5 py-1.5 sm:py-2 text-white"
                  : "w-10 h-10 sm:w-11 sm:h-11 text-zinc-400 hover:text-zinc-100 active:scale-95"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="floatingNavActivePill"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="absolute inset-0 rounded-full bg-white/15 dark:bg-white/12 border border-white/10 shadow-inner"
                />
              )}

              <div className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <Icon
                  className={cx(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-white stroke-[2.2]" : "text-zinc-400 group-hover:text-zinc-100 stroke-[1.8]"
                  )}
                />
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.18 }}
                    className="text-xs sm:text-sm font-semibold text-white tracking-tight whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {!isActive && Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-emerald-500 text-white font-black text-[8px] flex items-center justify-center shadow-xs">
                    {(item.badge ?? 0) > 99 ? "99+" : item.badge}
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
