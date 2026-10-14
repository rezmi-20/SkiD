"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, BellDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { playNotificationSound } from "@/lib/sound";

export default function NotificationBell({ role }: { role: "client" | "worker" }) {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const href = role === "client" ? "/client/notifications" : "/worker/notifications";

  useEffect(() => {
    let active = true;

    async function loadUnreadCount() {
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/notifications/unread-count", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!active || !response.ok) return;

        const data = await response.json().catch(() => null);
        if (typeof data?.count === "number") {
          // Play notification chime when new notifications enter while user is active
          if (prevCountRef.current !== null && data.count > prevCountRef.current) {
            playNotificationSound();
          }
          prevCountRef.current = data.count;
          setCount(data.count);
        }
      } catch {
        // Keep the last known count during transient auth/network failures.
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        inFlightRef.current = false;
      }
    }

    loadUnreadCount();

    // Check every 10 seconds for real-time notification updates
    const interval = window.setInterval(loadUnreadCount, 10_000);

    // Refresh immediately whenever the tab comes into focus
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadUnreadCount();
      }
    };
    window.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", loadUnreadCount);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", loadUnreadCount);
      abortRef.current?.abort();
    };
  }, [role]);

  return (
    <Link
      href={href}
      title="Notifications"
      className={cn(
        "relative inline-flex items-center justify-center w-9 h-9 rounded-full",
        "text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      )}
    >
      {count > 0 ? (
        <BellDot size={18} className="text-primary animate-pulse" />
      ) : (
        <Bell size={18} />
      )}
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-black text-on-primary ring-2 ring-background shadow-sm">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
