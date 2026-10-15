"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  role: "client" | "worker";
}

export default function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      id: "home",
      label: "Home",
      href: `/${role}/dashboard`,
      icon: <Home className="h-5 w-5 stroke-[2]" />,
      activeIcon: <Home className="h-4 w-4 stroke-[2.5]" />,
    },
    {
      id: "community",
      label: "Community",
      href: `/${role}/community`,
      icon: <Compass className="h-5 w-5 stroke-[2]" />,
      activeIcon: <Compass className="h-4 w-4 stroke-[2.5]" />,
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
    <nav className="lg:hidden fixed bottom-4 inset-x-4 z-50 pointer-events-none flex justify-center pb-safe">
      <div className="pointer-events-auto w-full max-w-sm h-[68px] rounded-full bg-[#181d24]/95 dark:bg-[#13171d]/95 backdrop-blur-xl border border-white/10 px-3 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        {navItems.map((item) => {
          const isActive =
            item.href === `/${role}/dashboard`
              ? pathname === item.href
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative flex items-center justify-center transition-all duration-300"
            >
              {isActive ? (
                /* Active Tab: Vibrant Lime Pill Button (Pixel-perfect from inspiration) */
                <div className="flex items-center gap-2 bg-[#b5f23d] text-black font-extrabold text-xs px-4 py-2.5 rounded-full shadow-[0_4px_16px_rgba(181,242,61,0.35)] animate-in zoom-in-95 duration-200">
                  {item.activeIcon}
                  <span className="tracking-tight">{item.label}</span>
                </div>
              ) : (
                /* Inactive Tab: Minimal Icon with thumb target */
                <div className="flex items-center justify-center h-12 w-12 rounded-full text-[#8a929e] hover:text-white active:scale-90 transition-all">
                  {item.icon}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
