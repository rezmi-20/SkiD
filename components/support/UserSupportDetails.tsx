"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import {
  RiCustomerService2Line,
  RiSendPlane2Fill,
  RiAttachmentLine,
  RiCheckboxCircleFill,
  RiTimeLine,
  RiUserLine,
  RiArrowLeftLine,
  RiRefreshLine,
  RiInformationLine,
  RiFileTextLine,
  RiShieldCheckFill,
} from "@remixicon/react";
import { reopenSupportTicket, submitSupportReply } from "@/lib/actions/support";
import { playNotificationSound } from "@/lib/sound";
import { DEMO_SUPPORT_TICKET } from "@/lib/mock-support";
import { cx } from "@/utils/cx";

function formatDate(value: unknown) {
  if (!value) return "Not recorded";
  return new Date(String(value)).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

export default function UserSupportDetails({
  data,
  role,
  isDemoMode = false,
}: {
  data: any;
  role: "client" | "worker";
  isDemoMode?: boolean;
}) {
  const activeData = data || DEMO_SUPPORT_TICKET;
  const { ticket, messages = [], attachments = [] } = activeData;
  const [messagesList, setMessagesList] = useState<any[]>(messages || []);
  const [currentStatus, setCurrentStatus] = useState<string>(ticket?.status || "open");

  const canReply = currentStatus !== "closed";
  const canReopen = currentStatus === "resolved";

  const [replyText, setReplyText] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [showReopen, setShowReopen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const initialMountRef = useRef(false);

  // Real-time polling for incoming messages (bypassed in demo mode)
  useEffect(() => {
    if (isDemoMode) return;
    let active = true;

    async function pollMessages() {
      try {
        const res = await fetch(`/api/support/${ticket.id}/messages`, { cache: "no-store" });
        if (!active || !res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.messages)) {
          setMessagesList((prev) => {
            const prevIds = new Set(prev.map((m: any) => m.id || `${m.created_at}-${m.actor_type}`));
            const hasNewStaffMsg = json.messages.some(
              (m: any) => !prevIds.has(m.id || `${m.created_at}-${m.actor_type}`) && m.actor_type !== role
            );

            if (initialMountRef.current && hasNewStaffMsg) {
              playNotificationSound();
            }

            if (json.messages.length >= prev.length || hasNewStaffMsg) {
              return json.messages;
            }
            return prev;
          });

          if (json.ticketStatus) {
            setCurrentStatus(json.ticketStatus);
          }
        }
      } catch {
        // Transient error
      }
    }

    initialMountRef.current = true;
    const interval = setInterval(pollMessages, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [ticket?.id, role, isDemoMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList.length]);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    setError(null);

    const newMsg = {
      id: `local-${Date.now()}`,
      actor_type: role,
      message: text,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessagesList((prev) => [...prev, newMsg]);
    setReplyText("");

    if (isDemoMode) {
      setTimeout(() => {
        setMessagesList((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            actor_type: "staff",
            message: "Thank you for the update! Our desk has noted your comments and verified the milestone status.",
            content: "Thank you for the update! Our desk has noted your comments and verified the milestone status.",
            created_at: new Date().toISOString(),
          },
        ]);
        playNotificationSound();
      }, 1200);
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitSupportReply(ticket.id, text);
        if (!result.success) {
          setError(result.error || "Could not send reply.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      }
    });
  };

  const handleReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    setError(null);

    if (isDemoMode) {
      setShowReopen(false);
      setReopenReason("");
      setCurrentStatus("open");
      return;
    }

    startTransition(async () => {
      try {
        const result = await reopenSupportTicket(ticket.id, reopenReason.trim());
        if (!result.success) {
          setError(result.error || "Could not reopen ticket.");
          return;
        }
        setShowReopen(false);
        setReopenReason("");
        setCurrentStatus("open");
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      {isDemoMode && (
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-3.5 flex items-center justify-between gap-3 text-caption-1-semibold text-text-primary">
          <div className="flex items-center gap-2">
            <RiInformationLine className="size-4 text-accent-600 shrink-0" />
            <span>Preview Mode: Live support messaging preview with automated desk simulation.</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-600 text-white shrink-0">
            Preview Active
          </span>
        </div>
      )}

      {/* Top Header */}
      <div>
        <Link
          href={`/${role}/support`}
          className="inline-flex items-center gap-1.5 text-caption-1-semibold text-text-secondary hover:text-text-primary mb-3"
        >
          <RiArrowLeftLine className="size-4" />
          <span>Back to tickets</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[11px] font-bold text-accent-600 px-2.5 py-0.5 rounded-md bg-background-secondary-default border border-border-button-default">
                {ticket.reference}
              </span>
              <span
                className={cx(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                  currentStatus === "resolved"
                    ? "border-accent-500/30 bg-accent-500/10 text-accent-700 dark:text-accent-300"
                    : "border-chart-4/30 bg-chart-4/10 text-chart-4"
                )}
              >
                {String(currentStatus).replaceAll("_", " ")}
              </span>
              <span className="rounded-full bg-background-secondary-default px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-tertiary border border-border-button-default">
                {ticket.priority} priority
              </span>
            </div>
            <h1 className="mt-2 text-title-1-medium text-text-primary tracking-tight">
              {ticket.subject}
            </h1>
          </div>
          {canReopen && !showReopen && (
            <button
              onClick={() => setShowReopen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-border-button-default bg-background-secondary-default px-3 py-1.5 text-caption-1-semibold font-bold text-text-primary hover:bg-background-tertiary-default transition"
            >
              <RiRefreshLine className="size-4" />
              <span>Reopen Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Inquiry Summary Card */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
            Original Inquiry · Category: {String(ticket.category).replaceAll("_", " ")}
          </span>
          <span className="text-caption-2 text-text-tertiary">{formatDate(ticket.created_at)}</span>
        </div>
        <p className="text-body-medium text-text-primary leading-relaxed whitespace-pre-wrap">
          {ticket.description}
        </p>
        {ticket.job_title && (
          <p className="text-caption-1-semibold text-accent-600">Linked Job: {ticket.job_title}</p>
        )}

        {attachments.length > 0 && (
          <div className="pt-3 border-t border-separator-border flex flex-wrap gap-2">
            {attachments.map((item: any) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border-button-default bg-background-secondary-default px-3 py-1.5 text-caption-1-semibold text-accent-600 hover:border-accent-500 transition"
              >
                <RiFileTextLine className="size-4" />
                <span>{item.file_name || "Attachment"}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Reopen Drawer Form */}
      {showReopen && (
        <form
          onSubmit={handleReopen}
          className="rounded-3xl border border-border-button-default bg-background-secondary-default p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-primary">
              Reopen Support Request
            </h3>
            <button
              type="button"
              onClick={() => setShowReopen(false)}
              className="text-caption-2 text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
          <textarea
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            rows={3}
            required
            placeholder="Please explain what details or issues still require resolution..."
            className="w-full rounded-2xl border border-border-button-default bg-background-primary-default p-3 text-body-medium text-text-primary outline-none focus:border-accent-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-accent-600 px-4 py-2 text-caption-1-semibold font-bold uppercase tracking-wider text-white hover:bg-accent-700 disabled:opacity-50"
          >
            {isPending ? "Reopening..." : "Confirm Reopen"}
          </button>
        </form>
      )}

      {/* Conversational Live Chat Feed */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-separator-border pb-4">
          <div className="flex items-center gap-2">
            <RiCustomerService2Line className="size-5 text-accent-600" />
            <h2 className="text-title-3-semibold text-text-primary">Live Support Desk Thread</h2>
            <span className="size-2 rounded-full bg-accent-500 animate-pulse" />
          </div>
          <span className="text-caption-2 text-text-tertiary">
            {messagesList.length} {messagesList.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {/* Messages */}
        <div className="space-y-3.5 max-h-[440px] overflow-y-auto pe-2">
          {messagesList.length === 0 ? (
            <p className="py-12 text-center text-caption-2 text-text-tertiary">
              No replies logged yet. Support desk will review your inquiry shortly.
            </p>
          ) : (
            messagesList.map((msg: any, idx: number) => {
              const isMe = msg.actor_type === role;
              const text = msg.content || msg.message || "";
              return (
                <div key={msg.id || idx} className={cx("flex flex-col", isMe ? "items-end" : "items-start")}>
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-bold text-text-tertiary">
                    <span>{isMe ? "You" : "DireSkill Support"}</span>
                    <span>·</span>
                    <span>{formatDate(msg.created_at)}</span>
                  </div>
                  <div
                    className={cx(
                      "max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-body-medium leading-relaxed whitespace-pre-wrap shadow-2xs",
                      isMe
                        ? "bg-accent-600 text-white rounded-tr-xs"
                        : "bg-background-secondary-default text-text-primary border border-border-button-default rounded-tl-xs"
                    )}
                  >
                    {text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Reply Input Form */}
        {canReply && (
          <form onSubmit={handleReply} className="flex items-center gap-2 pt-2 border-t border-separator-border">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response to support staff..."
              className="flex-1 rounded-2xl border border-border-button-default bg-background-secondary-default px-4 py-3 text-body-medium text-text-primary placeholder:text-text-placeholder focus:border-accent-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isPending || !replyText.trim()}
              className="size-12 rounded-2xl bg-accent-600 text-white flex items-center justify-center shrink-0 hover:bg-accent-700 disabled:opacity-40 transition active:scale-95"
            >
              <RiSendPlane2Fill className="size-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
