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
  Sparkles,
  MessageSquare,
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

  const isHomeActive = pathname === `/${role}/dashboard`;
  const isSearchActive = pathname?.includes("/search") || pathname?.includes("/gigs");
  const isContractsActive = pathname?.includes("/contracts") || pathname?.includes("/payments");
  const isProfileActive = pathname?.includes("/profile");

  return (
    <nav className="lg:hidden fixed bottom-[max(0.6rem,calc(env(safe-area-inset-bottom)+0.4rem))] inset-x-3 sm:inset-x-6 z-50 pointer-events-none flex justify-center select-none">
      <div className="pointer-events-auto relative w-full max-w-sm h-[68px] rounded-[36px] bg-white/95 dark:bg-[#12171e]/95 backdrop-blur-2xl border border-black/8 dark:border-white/10 px-4 sm:px-5 flex items-center justify-between shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
        
        {/* 1. Home */}
        <Link
          href={`/${role}/dashboard`}
          aria-label={t("nav.home") || "Home"}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 group active:scale-90 transition-transform touch-manipulation"
        >
          <Home
            className={`h-5 w-5 transition-colors ${
              isHomeActive
                ? "text-zinc-900 dark:text-white stroke-[2.5]"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 stroke-[1.8]"
            }`}
          />
          <span
            className={`text-[10px] mt-1 font-semibold tracking-tight ${
              isHomeActive
                ? "text-zinc-900 dark:text-white font-black"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {t("nav.home") || "Home"}
          </span>
          {isHomeActive && (
            <motion.span
              layoutId="mobileNavActiveDot"
              className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-[#a4fe47] mt-0.5"
            />
          )}
        </Link>

        {/* 2. Search / Gigs */}
        <Link
          href={role === "worker" ? "/worker/gigs" : "/client/search"}
          aria-label={role === "worker" ? t("nav.mygigs") : t("nav.search")}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 group active:scale-90 transition-transform touch-manipulation"
        >
          {role === "worker" ? (
            <Briefcase
              className={`h-5 w-5 transition-colors ${
                isSearchActive
                  ? "text-zinc-900 dark:text-white stroke-[2.5]"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 stroke-[1.8]"
              }`}
            />
          ) : (
            <Search
              className={`h-5 w-5 transition-colors ${
                isSearchActive
                  ? "text-zinc-900 dark:text-white stroke-[2.5]"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 stroke-[1.8]"
              }`}
            />
          )}
          <span
            className={`text-[10px] mt-1 font-semibold tracking-tight ${
              isSearchActive
                ? "text-zinc-900 dark:text-white font-black"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {role === "worker" ? t("nav.mygigs") || "Gigs" : t("nav.search") || "Search"}
          </span>
          {isSearchActive && (
            <motion.span
              layoutId="mobileNavActiveDot"
              className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-[#a4fe47] mt-0.5"
            />
          )}
        </Link>

        {/* 3. Center Action Button: Prominent Floating Dark Green Circle with Sparkle */}
        <div className="relative flex items-center justify-center -top-3.5 px-1">
          <Link
            href={role === "worker" ? "/worker/gigs" : "/client/search"}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#134e27] hover:bg-[#0e3b1c] active:scale-90 transition-all flex items-center justify-center shadow-[0_8px_24px_rgba(19,78,39,0.55)] border-[3.5px] border-white dark:border-[#12171e] text-white touch-manipulation group"
            title="Quick Action"
            aria-label="Quick Action"
          >
            <Sparkles className="h-6 w-6 text-[#a4fe47] group-hover:rotate-12 transition-transform duration-200" />
          </Link>
        </div>

        {/* 4. Contracts / Chat */}
        <Link
          href={`/${role}/contracts`}
          aria-label={t("nav.contracts") || "Contracts"}
          className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group active:scale-90 transition-transform touch-manipulation"
        >
          <div className="relative">
            <FileText
              className={`h-5 w-5 transition-colors ${
                isContractsActive
                  ? "text-zinc-900 dark:text-white stroke-[2.5]"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 stroke-[1.8]"
              }`}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-rose-500 text-white font-black text-[8px] flex items-center justify-center shadow-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] mt-1 font-semibold tracking-tight ${
              isContractsActive
                ? "text-zinc-900 dark:text-white font-black"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {t("nav.contracts") || "Contracts"}
          </span>
          {isContractsActive && (
            <motion.span
              layoutId="mobileNavActiveDot"
              className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-[#a4fe47] mt-0.5"
            />
          )}
        </Link>

        {/* 5. Profile */}
        <Link
          href={`/${role}/profile`}
          aria-label={t("nav.profile") || "Profile"}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 group active:scale-90 transition-transform touch-manipulation"
        >
          <User
            className={`h-5 w-5 transition-colors ${
              isProfileActive
                ? "text-zinc-900 dark:text-white stroke-[2.5]"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 stroke-[1.8]"
            }`}
          />
          <span
            className={`text-[10px] mt-1 font-semibold tracking-tight ${
              isProfileActive
                ? "text-zinc-900 dark:text-white font-black"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {t("nav.profile") || "Profile"}
          </span>
          {isProfileActive && (
            <motion.span
              layoutId="mobileNavActiveDot"
              className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-[#a4fe47] mt-0.5"
            />
          )}
        </Link>
      </div>
    </nav>
  );
}
