"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { markAsRead, markAllAsRead } from "@/lib/actions/notifications";
import { useRouter, usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  MessageSquare,
  FileText,
  CheckCircle2,
  Handshake,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Star,
  CreditCard,
  AlertTriangle,
  FileSignature,
  Gavel,
  ThumbsUp,
  MessageCircle,
  Bell,
  LifeBuoy,
  ArrowRight,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { playNotificationSound } from "@/lib/sound";

function resolveNotificationLink(rawHref: string | null, role: "client" | "worker"): string | null {
  if (!rawHref) return null;
  if (rawHref.startsWith("http://") || rawHref.startsWith("https://")) return rawHref;
  if (rawHref.startsWith("/client") || rawHref.startsWith("/worker") || rawHref.startsWith("/admin")) return rawHref;

  if (rawHref === "/messages" || rawHref.startsWith("/messages/")) {
    return `/${role}${rawHref}`;
  }
  if (rawHref === "/contracts") {
    return `/${role}/contracts`;
  }
  if (rawHref === "/profile" || rawHref.startsWith("/profile/")) {
    return `/${role}${rawHref}`;
  }
  return rawHref;
}

interface TypeConfigItem {
  icon: LucideIcon;
  color: string;
  bg: string;
}

const TYPE_CONFIG: Record<string, TypeConfigItem> = {
  new_message:        { icon: MessageSquare,   color: "text-blue-500",   bg: "bg-blue-500/10" },
  contract_signed:    { icon: FileSignature,   color: "text-primary",    bg: "bg-primary/10" },
  contract_completed: { icon: CheckCircle2,    color: "text-green-500",  bg: "bg-green-500/10" },
  job_accepted:       { icon: Handshake,       color: "text-primary",    bg: "bg-primary/10" },
  job_rejected:       { icon: XCircle,         color: "text-red-500",    bg: "bg-red-500/10" },
  fayda_approved:     { icon: ShieldCheck,     color: "text-primary",    bg: "bg-primary/10" },
  fayda_rejected:     { icon: ShieldAlert,     color: "text-red-500",    bg: "bg-red-500/10" },
  new_review:         { icon: Star,            color: "text-amber-400",  bg: "bg-amber-400/10" },
  payment_confirmed:  { icon: CreditCard,      color: "text-green-500",  bg: "bg-green-500/10" },
  payment_failed:     { icon: AlertTriangle,   color: "text-red-500",    bg: "bg-red-500/10" },
  contract_terms_submitted: { icon: FileText,  color: "text-primary",    bg: "bg-primary/10" },
  contract_terms_accepted:  { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  contract_terms_rejected:  { icon: XCircle,   color: "text-red-500",    bg: "bg-red-500/10" },
  completion_requested: { icon: FileText,      color: "text-primary",    bg: "bg-primary/10" },
  completion_accepted:  { icon: CheckCircle2,  color: "text-green-500",  bg: "bg-green-500/10" },
  completion_rejected:  { icon: XCircle,       color: "text-red-500",    bg: "bg-red-500/10" },
  dispute_update:       { icon: Gavel,         color: "text-rose-400",   bg: "bg-rose-400/10" },
  support_update:       { icon: LifeBuoy,      color: "text-primary",    bg: "bg-primary/10" },
  post_liked:         { icon: ThumbsUp,        color: "text-primary",    bg: "bg-primary/10" },
  post_commented:     { icon: MessageCircle,   color: "text-blue-500",   bg: "bg-blue-500/10" },
};

const DEFAULT_CONFIG: TypeConfigItem = { icon: Bell, color: "text-on-surface-variant", bg: "bg-surface-container-high" };

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link_href: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsContent({ initialNotifications }: { initialNotifications: Notification[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const role: "client" | "worker" = pathname?.startsWith("/worker") ? "worker" : "client";
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filtered = filter === "unread"
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleMarkAllRead = () => {
    startTransition(async () => {
      try {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (err) {
        console.warn("Failed to mark all notifications as read:", err);
      }
    });
  };

  const handleTap = async (n: Notification) => {
    try {
      if (!n.is_read) {
        await markAsRead(n.id);
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
      }
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
    const targetLink = resolveNotificationLink(n.link_href, role);
    if (targetLink) router.push(targetLink);
  };

  return (
    <div className="flex flex-col gap-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-end justify-between px-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[2px] bg-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Activity</p>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-primary text-on-primary rounded-full text-xs font-black shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => playNotificationSound()}
            title="Test notification sound chime"
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container text-on-surface-variant text-[11px] font-bold rounded-lg hover:bg-surface-container-high transition border border-outline-variant/40"
          >
            <Volume2 className="w-3.5 h-3.5 text-primary" />
            <span>Test Sound</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-[11px] font-bold rounded-lg hover:bg-primary/10 hover:text-primary transition-all border border-outline-variant/40"
            >
              Mark All Read
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/40 pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === "all"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === "unread"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((n, idx) => {
              const config = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
              const IconComp = config.icon;

              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => handleTap(n)}
                  className={`relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/40 ${
                    n.is_read
                      ? "bg-surface-container-lowest border-outline-variant/40"
                      : "bg-surface-container-low border-primary/30 shadow-sm"
                  }`}
                >
                  {/* Unread dot */}
                  {!n.is_read && (
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20" />
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-1.5 ${config.bg}`}>
                    <IconComp className={`w-5 h-5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={`font-bold text-sm tracking-tight ${
                        n.is_read ? "text-on-surface/70" : "text-on-surface"
                      }`}>
                        {n.title}
                      </h3>
                      <span className="text-[11px] font-medium text-on-surface-variant/70 whitespace-nowrap shrink-0">
                        {formatDistanceToNow(new Date(n.created_at))} ago
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      n.is_read ? "text-on-surface-variant/60" : "text-on-surface-variant"
                    }`}>
                      {n.body}
                    </p>

                    {n.link_href && (
                      <div className="flex items-center gap-1 mt-2 text-primary text-[11px] font-bold">
                        <span>Open details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 flex flex-col items-center text-center gap-4 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/60">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Bell className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-on-surface">You're all caught up!</h3>
            <p className="text-on-surface-variant text-xs max-w-xs mx-auto">
              {filter === "unread" ? "No unread notifications right now." : "No notifications yet. New updates will appear here."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
