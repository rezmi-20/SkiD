"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Users, MessageSquare, User, Briefcase } from "lucide-react";

interface MobileNavProps {
  role: "client" | "worker";
}

export default function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
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

  // Role-specific second navigation item (Search for client, My Gigs for worker)
  const actionItem =
    role === "worker"
      ? {
          id: "gigs",
          label: "My Gigs",
          href: "/worker/gigs",
          icon: <Briefcase className="h-5 w-5 stroke-[2]" />,
          activeIcon: <Briefcase className="h-4 w-4 stroke-[2.5]" />,
        }
      : {
          id: "search",
          label: "Search",
          href: "/client/search",
          icon: <Search className="h-5 w-5 stroke-[2]" />,
          activeIcon: <Search className="h-4 w-4 stroke-[2.5]" />,
        };

  const navItems = [
    {
      id: "home",
      label: "Home",
      href: `/${role}/dashboard`,
      icon: <Home className="h-5 w-5 stroke-[2]" />,
      activeIcon: <Home className="h-4 w-4 stroke-[2.5]" />,
    },
    actionItem,
    {
      id: "community",
      label: "Community",
      href: `/${role}/community`,
      icon: <Users className="h-5 w-5 stroke-[2]" />,
      activeIcon: <Users className="h-4 w-4 stroke-[2.5]" />,
    },
    {
      id: "chat",
      label: "Chat",
      href: `/${role}/messages`,
      icon: <MessageSquare className="h-5 w-5 stroke-[2]" />,
      activeIcon: <MessageSquare className="h-4 w-4 stroke-[2.5]" />,
    },
    {
      id: "profile",
      label: "Profile",
      href: `/${role}/profile`,
      icon: <User className="h-5 w-5 stroke-[2]" />,
      activeIcon: <User className="h-4 w-4 stroke-[2.5]" />,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.5rem))] inset-x-2 sm:inset-x-4 z-50 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-md h-[66px] rounded-full bg-[#181d24]/95 dark:bg-[#13171d]/95 backdrop-blur-xl border border-white/10 px-2 sm:px-3 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive =
            item.href === `/${role}/dashboard`
              ? pathname === item.href
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className="relative flex items-center justify-center transition-all duration-200 touch-manipulation focus:outline-none"
            >
              {isActive ? (
                /* Active Tab: Vibrant Lime Pill Button using palette rgba(164, 254, 71) */
                <div className="flex items-center gap-1.5 bg-[#a4fe47] text-[#0d1406] font-black text-xs px-3 sm:px-3.5 py-2 rounded-full shadow-[0_4px_16px_rgba(164,254,71,0.35)] animate-in zoom-in-95 duration-200 shrink-0 relative">
                  {item.activeIcon}
                  <span className="tracking-tight text-[11px] sm:text-xs">{item.label}</span>
                  {item.id === "chat" && unreadCount > 0 && (
                    <span className="ml-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              ) : (
                /* Inactive Tab: Minimal Icon with thumb-friendly hit target */
                <div className="relative flex items-center justify-center h-11 w-11 rounded-full text-[#8a929e] hover:text-white active:scale-90 transition-all">
                  {item.icon}
                  {item.id === "chat" && unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shadow-md border-2 border-[#181d24] animate-in zoom-in-75 duration-200">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
