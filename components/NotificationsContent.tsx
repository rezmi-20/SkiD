"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { markAsRead, markAllAsRead } from "@/lib/actions/notifications";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  new_message:        { icon: "chat_bubble",     color: "text-blue-400",   bg: "bg-blue-400/10" },
  contract_signed:    { icon: "edit_document",   color: "text-primary",    bg: "bg-primary/10" },
  contract_completed: { icon: "task_alt",        color: "text-green-400",  bg: "bg-green-400/10" },
  job_accepted:       { icon: "handshake",       color: "text-primary",    bg: "bg-primary/10" },
  job_rejected:       { icon: "cancel",          color: "text-error",      bg: "bg-error/10" },
  fayda_approved:     { icon: "verified_user",   color: "text-primary",    bg: "bg-primary/10" },
  fayda_rejected:     { icon: "shield_with_heart", color: "text-error",   bg: "bg-error/10" },
  new_review:         { icon: "star",            color: "text-yellow-400", bg: "bg-yellow-400/10" },
  payment_confirmed:  { icon: "payments",        color: "text-green-400",  bg: "bg-green-400/10" },
  payment_failed:     { icon: "error",           color: "text-error",      bg: "bg-error/10" },
  contract_terms_submitted: { icon: "contract",  color: "text-primary",    bg: "bg-primary/10" },
  contract_terms_accepted:  { icon: "check_circle", color: "text-green-400", bg: "bg-green-400/10" },
  contract_terms_rejected:  { icon: "cancel",    color: "text-error",      bg: "bg-error/10" },
  completion_requested: { icon: "task_alt",      color: "text-primary",    bg: "bg-primary/10" },
  completion_accepted:  { icon: "verified",      color: "text-green-400",  bg: "bg-green-400/10" },
  completion_rejected:  { icon: "undo",          color: "text-error",      bg: "bg-error/10" },
  dispute_update:       { icon: "gavel",         color: "text-rose-400",   bg: "bg-rose-400/10" },
  post_liked:         { icon: "thumb_up",        color: "text-primary",    bg: "bg-primary/10" },
  post_commented:     { icon: "forum",           color: "text-blue-400",   bg: "bg-blue-400/10" },
};

const DEFAULT_CONFIG = { icon: "notifications", color: "text-on-surface-variant", bg: "bg-surface-container-high" };

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
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filtered = filter === "unread"
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    });
  };

  const handleTap = async (n: Notification) => {
    if (!n.is_read) {
      await markAsRead(n.id);
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
    }
    if (n.link_href) router.push(n.link_href);
  };

  return (
    <div className="flex flex-col gap-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex items-end justify-between px-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[2px] bg-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Activity</p>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-tight">
              Notifi<span className="text-primary italic">cations</span>
            </h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-primary text-on-primary rounded-full text-xs font-black shadow-lg shadow-primary/30">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="px-5 py-2.5 bg-surface-container-high text-on-surface-variant text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-surface-container-highest"
          >
            Mark All Read
          </button>
        )}
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 w-fit p-1 bg-surface-container-low/50 rounded-3xl border border-surface-container-highest/30">
        {(["all", "unread"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 ${
              filter === f
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {f === "all" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {filtered.map((n, idx) => {
              const config = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
              const Wrapper = n.link_href ? "div" : "div";

              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleTap(n)}
                  className={`relative flex items-start gap-5 p-5 rounded-[1.75rem] border cursor-pointer transition-all group hover:shadow-md active:scale-[0.99] ${
                    n.is_read
                      ? "bg-surface-container-lowest border-surface-container-highest"
                      : "bg-surface-container-low border-primary/20 shadow-sm"
                  }`}
                >
                  {/* Unread dot */}
                  {!n.is_read && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ml-3 ${config.bg}`}>
                    <span className={`material-symbols-outlined text-[22px] filled ${config.color}`}>
                      {config.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={`font-black text-sm leading-snug tracking-tight group-hover:text-primary transition-colors ${
                        n.is_read ? "text-on-surface opacity-70" : "text-on-surface"
                      }`}>
                        {n.title}
                      </h3>
                      <span className="text-[9px] font-bold text-on-surface-variant opacity-40 whitespace-nowrap shrink-0">
                        {formatDistanceToNow(new Date(n.created_at))} ago
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      n.is_read ? "text-on-surface-variant opacity-50" : "text-on-surface-variant"
                    }`}>
                      {n.body}
                    </p>

                    {n.link_href && (
                      <div className="flex items-center gap-1 mt-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black uppercase tracking-widest">Open</span>
                        <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-32 flex flex-col items-center text-center gap-8 bg-surface-container-low/30 rounded-[3rem] border border-dashed border-surface-container-highest"
        >
          <div className="relative w-32 h-32">
            <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[64px] text-primary opacity-20">notifications</span>
            </div>
            <div className="absolute inset-0 border-2 border-primary/10 rounded-full animate-ping" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-on-surface tracking-tight">You're all caught up!</h3>
            <p className="text-on-surface-variant opacity-60 max-w-xs mx-auto text-sm leading-relaxed">
              {filter === "unread" ? "No unread notifications right now." : "No notifications yet. Activity will appear here."}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="../messages" className="px-6 py-3 bg-primary/10 text-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all active:scale-95">
              Check Messages
            </Link>
            <Link href="../contracts" className="px-6 py-3 bg-surface-container-high text-on-surface-variant rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-surface-container-highest transition-all active:scale-95">
              View Contracts
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
