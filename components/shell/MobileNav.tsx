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
} from "lucide-react";

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

  const navItems = [
    {
      id: "home",
      label: t("nav.home") || "Home",
      href: `/${role}/dashboard`,
      icon: Home,
      isActive: pathname === `/${role}/dashboard`,
    },
    {
      id: "search",
      label: role === "worker" ? t("nav.mygigs") || "Gigs" : t("nav.search") || "Search",
      href: role === "worker" ? "/worker/gigs" : "/client/search",
      icon: role === "worker" ? Briefcase : Search,
      isActive: pathname?.includes("/search") || pathname?.includes("/gigs"),
    },
    {
      id: "community",
      label: t("nav.community") || "Community",
      href: `/${role}/community`,
      icon: Users,
      isActive: pathname?.includes("/community"),
    },
    {
      id: "contracts",
      label: t("nav.contracts") || "Contracts",
      href: `/${role}/contracts`,
      icon: FileText,
      isActive: pathname?.includes("/contracts") || pathname?.includes("/payments"),
      badge: unreadCount,
    },
    {
      id: "profile",
      label: t("nav.profile") || "Profile",
      href: `/${role}/profile`,
      icon: User,
      isActive: pathname?.includes("/profile"),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-[max(0.6rem,calc(env(safe-area-inset-bottom)+0.4rem))] inset-x-3 sm:inset-x-6 z-50 pointer-events-none flex justify-center select-none">
      <div className="pointer-events-auto relative w-full max-w-sm h-[68px] rounded-[36px] bg-white/95 dark:bg-[#12171e]/95 backdrop-blur-2xl border border-black/8 dark:border-white/10 px-3 sm:px-4 flex items-center justify-between shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          if (isActive) {
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                className="relative flex flex-col items-center justify-center flex-1 h-full py-0.5 group active:scale-95 transition-transform touch-manipulation"
              >
                {/* Elevated dark green circle matching reference screenshot */}
                <div className="relative -top-3.5 flex items-center justify-center">
                  <motion.div
                    layoutId="activeNavElevatedCircle"
                    transition={{ type: "spring", damping: 26, stiffness: 320 }}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#134e27] border-[3.5px] border-white dark:border-[#12171e] text-[#a4fe47] flex items-center justify-center shadow-[0_8px_24px_rgba(19,78,39,0.55)]"
                  >
                    <Icon className="h-6 w-6 text-[#a4fe47] stroke-[2.2]" />
                  </motion.div>
                </div>
                {/* Active label with dot */}
                <span className="text-[10px] font-black text-zinc-900 dark:text-white -mt-2.5 tracking-tight">
                  {item.label}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white mt-0.5" />
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group active:scale-90 transition-transform touch-manipulation"
            >
              <div className="relative">
                <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 stroke-[1.8] transition-colors" />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-rose-500 text-white font-black text-[8px] flex items-center justify-center shadow-xs">
                    {(item.badge ?? 0) > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold text-zinc-400 dark:text-zinc-500 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
