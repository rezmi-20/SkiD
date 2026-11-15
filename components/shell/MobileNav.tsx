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
  FileText,
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
  const isSearch = pathname?.includes("/search") || pathname?.includes("/gigs");
  const isCommunity = pathname?.includes("/community");
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
      label: t("nav.home") || "Home",
      href: `/${role}/dashboard`,
      icon: Home,
      isActive: isHome,
    },
    {
      id: "search",
      label: role === "worker" ? t("nav.mygigs") || "Gigs" : t("nav.search") || "Search",
      href: role === "worker" ? "/worker/gigs" : "/client/search",
      icon: role === "worker" ? Briefcase : Search,
      isActive: isSearch,
    },
    {
      id: "community",
      label: t("nav.community") || "Community",
      href: `/${role}/community`,
      icon: Users,
      isActive: isCommunity,
    },
    {
      id: "messages",
      label: t("nav.chat") || "Messages",
      href: `/${role}/messages`,
      icon: MessageSquare,
      isActive: isMessages,
      badge: unreadCount,
    },
    {
      id: "profile",
      label: t("nav.profile") || "Profile",
      href: `/${role}/profile`,
      icon: User,
      isActive: isProfile,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 w-full z-50 select-none bg-white/98 dark:bg-[#12171e]/98 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="relative w-full max-w-lg mx-auto h-[62px] sm:h-[66px] px-2 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          if (isActive) {
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                className="relative flex-1 h-full flex flex-col items-center justify-center group active:scale-95 transition-transform touch-manipulation"
              >
                {/* ── Active Tab Indicator: Elevated Dark Green Circular Badge ── */}
                <div className="relative -top-4 sm:-top-5 flex flex-col items-center">
                  <motion.div
                    layoutId="activeNavElevatedCircle"
                    transition={{ type: "spring", damping: 26, stiffness: 340 }}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#134e27] border-[4px] border-white dark:border-[#12171e] text-[#a4fe47] flex items-center justify-center shadow-[0_8px_20px_rgba(19,78,39,0.45)]"
                  >
                    <Icon className="h-6 w-6 text-[#a4fe47] stroke-[2.2]" />
                  </motion.div>
                  <span className="text-[10px] font-black text-zinc-950 dark:text-white mt-0.5 tracking-tight">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className="relative flex-1 h-full flex flex-col items-center justify-center py-1 group active:scale-90 transition-transform touch-manipulation"
            >
              <div className="relative">
                <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 stroke-[1.8] transition-colors" />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-0.5 rounded-full bg-rose-500 text-white font-black text-[8px] flex items-center justify-center shadow-xs">
                    {(item.badge ?? 0) > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium text-zinc-400 dark:text-zinc-500 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
