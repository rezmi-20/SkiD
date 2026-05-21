"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUnreadCount } from "@/lib/actions/notifications";

export default function NotificationBell({ role }: { role: "client" | "worker" }) {
  const [count, setCount] = useState(0);
  const href = role === "client" ? "/client/notifications" : "/worker/notifications";

  useEffect(() => {
    // Fetch on mount
    getUnreadCount().then(setCount);

    // Poll every 30s for new notifications
    const interval = setInterval(() => {
      getUnreadCount().then(setCount);
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href={href}
      className="relative w-10 h-10 flex items-center justify-center bg-surface-container rounded-full text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95 border border-surface-container-highest"
      title="Notifications"
    >
      <span className="material-symbols-outlined text-[20px]">
        {count > 0 ? "notifications_active" : "notifications"}
      </span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-on-primary rounded-full text-[9px] font-black flex items-center justify-center px-1 shadow-lg shadow-primary/40 animate-in zoom-in duration-300">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
