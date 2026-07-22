"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, BellDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function NotificationBell({ role }: { role: "client" | "worker" }) {
  const [count, setCount] = useState(0);
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
    const interval = window.setInterval(loadUnreadCount, 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
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
      {count > 0 ? <BellDot size={18} /> : <Bell size={18} />}
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[9px] font-black px-1 flex items-center justify-center border-2 border-background"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Link>
  );
}
