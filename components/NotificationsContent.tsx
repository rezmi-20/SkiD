"use client";

import { useState, useTransition, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { markAsRead, markAllAsRead } from "@/lib/actions/notifications";
import { useRouter, usePathname } from "next/navigation";
import { format, isToday, isThisWeek } from "date-fns";
import {
  RiArrowLeftSLine,
  RiCheckDoubleLine,
  RiVolumeUpLine,
  RiNotificationOffLine,
  RiBankCardLine,
  RiStarFill,
  RiShieldCheckLine,
  RiFileTextLine,
  RiMessage3Line,
  RiBriefcaseLine,
  RiNotification3Line,
  RiSparklingFill
} from "@remixicon/react";
import { playNotificationSound } from "@/lib/sound";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link_href: string | null;
  is_read: boolean;
  created_at: string;
}

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
  if (rawHref === "/jobs" || rawHref.startsWith("/jobs/")) {
    return `/${role}${rawHref}`;
  }
  return rawHref;
}

function getNotificationThumbnail(n: Notification) {
  const typeLower = (n.type || "").toLowerCase();
  const titleLower = (n.title || "").toLowerCase();

  // 1. Promotional / Discount Banner (Matching exact red SALE tile in screenshot)
  if (typeLower.includes("discount") || typeLower.includes("promo") || titleLower.includes("discount") || titleLower.includes("sale")) {
    return {
      type: "sale_badge",
      bg: "bg-gradient-to-br from-red-600 to-rose-700",
      text: "SALE",
      subText: "20%",
    };
  }

  // 2. Payment & Milestone protection
  if (typeLower.includes("payment")) {
    return {
      type: "image",
      src: "/images/user_chapa_card.jpg",
      fallbackIcon: RiBankCardLine,
      color: "text-emerald-500",
    };
  }

  // 3. Reviews & Ratings
  if (typeLower.includes("review")) {
    return {
      type: "image",
      src: "/images/user_review_card.jpg",
      fallbackIcon: RiStarFill,
      color: "text-amber-400",
    };
  }

  // 4. Identity & Fayda Biometric Verification
  if (typeLower.includes("fayda") || typeLower.includes("identity") || typeLower.includes("verification")) {
    return {
      type: "image",
      src: "/images/user_fayda_card.jpg",
      fallbackIcon: RiShieldCheckLine,
      color: "text-emerald-500",
    };
  }

  // 5. Contracts & Milestones
  if (typeLower.includes("contract")) {
    return {
      type: "image",
      src: "/images/user_contract_card.jpg",
      fallbackIcon: RiFileTextLine,
      color: "text-blue-500",
    };
  }

  // 6. Direct Messages
  if (typeLower.includes("message")) {
    return {
      type: "image",
      src: "/images/worker_guide_avatar.jpg",
      fallbackIcon: RiMessage3Line,
      color: "text-sky-500",
    };
  }

  // 7. Job Bookings & Schedules (Matching cars/parking photo in screenshot)
  if (typeLower.includes("job")) {
    return {
      type: "image",
      src: "/images/trades/electrician.jpg",
      fallbackIcon: RiBriefcaseLine,
      color: "text-emerald-500",
    };
  }

  // Default Fallback
  return {
    type: "image",
    src: "/images/diredawa_city.jpg",
    fallbackIcon: RiNotification3Line,
    color: "text-emerald-500",
  };
}

function formatNotificationDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return format(d, "d MMM yyyy • h:mm a");
  } catch {
    return dateStr;
  }
}

export default function NotificationsContent({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const role: "client" | "worker" = pathname?.startsWith("/worker") ? "worker" : "client";

  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  /* Group notifications into Today, This Week, Earlier matching the inspiration */
  const groupedSections = useMemo(() => {
    const todayList: Notification[] = [];
    const thisWeekList: Notification[] = [];
    const earlierList: Notification[] = [];

    filtered.forEach((n) => {
      try {
        const d = new Date(n.created_at);
        if (isToday(d)) {
          todayList.push(n);
        } else if (isThisWeek(d)) {
          thisWeekList.push(n);
        } else {
          earlierList.push(n);
        }
      } catch {
        earlierList.push(n);
      }
    });

    return [
      { key: "today", title: "Today", items: todayList },
      { key: "this_week", title: "This Week", items: thisWeekList },
      { key: "earlier", title: "Earlier", items: earlierList },
    ].filter((section) => section.items.length > 0);
  }, [filtered]);

  const handleMarkAllRead = () => {
    startTransition(async () => {
      try {
        await markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      } catch (err) {
        console.warn("Failed to mark all notifications as read:", err);
      }
    });
  };

  const handleTap = async (n: Notification) => {
    try {
      if (!n.is_read) {
        await markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
        );
      }
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
    const targetLink = resolveNotificationLink(n.link_href, role);
    if (targetLink) router.push(targetLink);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${role}/dashboard`);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14 pt-1 font-['Inter',system-ui,sans-serif]">
      {/* ── 1. TOP UTILITY BAR (Back button on left, Chime & Mark All Read on right; Title is in top nav bar) ── */}
      <div className="flex items-center justify-between py-2 mb-4">
        {/* Rounded square back button on left */}
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border border-border-button-default bg-background-primary-default hover:bg-background-secondary-hover text-text-primary flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
          aria-label="Back"
          title="Back"
        >
          <RiArrowLeftSLine className="w-6 h-6" />
        </button>

        {/* Action icons on right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => playNotificationSound()}
            className="w-10 h-10 rounded-2xl border border-border-button-default bg-background-primary-default hover:bg-background-secondary-hover text-text-secondary hover:text-text-primary flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
            title="Test notification sound chime"
            aria-label="Test sound"
          >
            <RiVolumeUpLine className="w-4 h-4 text-emerald-500" />
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl border border-border-button-default bg-background-primary-default hover:bg-background-secondary-hover text-text-primary text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Mark all notifications as read"
            >
              <RiCheckDoubleLine className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px]">Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. FILTER TABS (All / Unread) ── */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            filter === "all"
              ? "bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm"
              : "bg-background-secondary-default text-text-secondary hover:bg-background-secondary-hover border border-border-button-default/60"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            filter === "unread"
              ? "bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm"
              : "bg-background-secondary-default text-text-secondary hover:bg-background-secondary-hover border border-border-button-default/60"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* ── 3. GROUPED NOTIFICATIONS LIST (Today, This Week, Earlier) ── */}
      {groupedSections.length > 0 ? (
        <div className="space-y-6">
          {groupedSections.map((section) => (
            <div key={section.key} className="space-y-3">
              {/* Section Header: e.g. "Today", "This Week" */}
              <h2 className="text-sm font-bold text-text-tertiary px-1">
                {section.title}
              </h2>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {section.items.map((n, idx) => {
                    const thumb = getNotificationThumbnail(n);
                    const isPromo =
                      n.type === "discount_promo" ||
                      n.title.toLowerCase().includes("discount") ||
                      n.title.toLowerCase().includes("sale") ||
                      n.title.toLowerCase().includes("offer");

                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => handleTap(n)}
                        className={`group relative flex items-start gap-3.5 pb-4 border-b border-separator-border/60 last:border-b-0 cursor-pointer rounded-2xl p-2 -mx-2 transition-all hover:bg-background-secondary-hover/40 active:scale-[0.99] ${
                          !n.is_read ? "bg-emerald-500/5 dark:bg-emerald-500/10" : ""
                        }`}
                      >
                        {/* ── Left: Rounded Square Thumbnail (Matching Image 1) ── */}
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border border-border-button-default shadow-xs bg-zinc-950 flex items-center justify-center">
                          {thumb.type === "sale_badge" ? (
                            /* Vibrant Red SALE Tile matching Inspiration */
                            <div className="w-full h-full bg-gradient-to-br from-red-600 to-rose-700 flex flex-col items-center justify-center text-white p-1 select-none">
                              <span className="text-xs sm:text-sm font-black tracking-wider leading-none">
                                {thumb.text}
                              </span>
                              <span className="text-[9px] font-bold opacity-90 mt-0.5">
                                {thumb.subText}
                              </span>
                            </div>
                          ) : (
                            /* Photo Thumbnail */
                            <img
                              src={thumb.src}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}

                          {/* Unread Glowing Dot on Thumbnail */}
                          {!n.is_read && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background-primary-default shadow-sm" />
                          )}
                        </div>

                        {/* ── Right: Notification Body ── */}
                        <div className="flex-1 min-w-0 pr-1">
                          {/* Title: Green for discount/promo, Primary for standard */}
                          <h3
                            className={`text-sm sm:text-base font-extrabold tracking-tight truncate leading-snug ${
                              isPromo
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-text-primary"
                            }`}
                          >
                            {n.title}
                          </h3>

                          {/* Subtitle: Date & Time Bullet (e.g. 7 Feb 2026 • 7:40 pm) */}
                          <p className="text-xs text-text-tertiary font-medium mt-0.5">
                            {formatNotificationDate(n.created_at)}
                          </p>

                          {/* Description Body */}
                          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-1 line-clamp-2">
                            {n.body}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 flex flex-col items-center text-center gap-3 bg-background-secondary-default/50 rounded-3xl border border-dashed border-border-button-default p-8">
          <div className="w-14 h-14 bg-background-secondary-default rounded-full flex items-center justify-center text-text-tertiary border border-border-button-default">
            <RiNotificationOffLine className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">You're all caught up!</h3>
            <p className="text-xs text-text-secondary max-w-xs mx-auto">
              {filter === "unread"
                ? "No unread notifications right now."
                : "No notifications yet. New bookings, contracts, and updates will appear here."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
