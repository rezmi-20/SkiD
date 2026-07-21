"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUnreadCount } from "@/lib/actions/notifications";
import { Bell, BellDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function NotificationBell({ role }: { role: "client" | "worker" }) {
  const [count, setCount] = useState(0);
  const href = role === "client" ? "/client/notifications" : "/worker/notifications";

  useEffect(() => {
    getUnreadCount().then(setCount);
    const interval = setInterval(() => getUnreadCount().then(setCount), 30_000);
    return () => clearInterval(interval);
  }, []);

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
