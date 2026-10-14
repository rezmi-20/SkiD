"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { reopenSupportTicket, submitSupportReply } from "@/lib/actions/support";
import { playNotificationSound } from "@/lib/sound";
import {
  Send,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  LifeBuoy,
  User,
  Headphones,
  RotateCcw,
} from "lucide-react";

function formatDate(value: unknown) {
  if (!value) return "Not recorded";
  return new Date(String(value)).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

export default function UserSupportDetails({ data, role }: { data: any; role: "client" | "worker" }) {
  const { ticket, messages, events, attachments } = data;
  const [messagesList, setMessagesList] = useState<any[]>(messages || []);
  const [currentStatus, setCurrentStatus] = useState<string>(ticket.status);

  const canReply = currentStatus !== "closed";
  const canReopen = currentStatus === "resolved";

  const [replyText, setReplyText] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [showReopen, setShowReopen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const initialMountRef = useRef(false);

  // Real-time polling for incoming messages
  useEffect(() => {
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

            // Sync with latest messages from server
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
        // Transient network blip
      }
    }

    initialMountRef.current = true;
    const interval = setInterval(pollMessages, 2500);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [ticket.id, role]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList.length]);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    setError(null);

    // Optimistic UI: display immediately
    const optimisticMsg = {
      actor_type: role,
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessagesList((prev) => [...prev, optimisticMsg]);
    setReplyText("");

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

  const statusColors: Record<string, string> = {
    open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    assigned: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    in_progress: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    awaiting_user: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    escalated: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    resolved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    closed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <Link
          href={`/${role}/support`}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to tickets
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-black uppercase tracking-widest text-primary">
                {ticket.reference}
              </span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusColors[currentStatus] || "bg-zinc-500/10 text-zinc-400"}`}>
                {String(currentStatus).replaceAll("_", " ")}
              </span>
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                {ticket.priority} priority
              </span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-black text-on-surface tracking-tight">
              {ticket.subject}
            </h1>
          </div>
          {canReopen && !showReopen && (
            <button
              onClick={() => setShowReopen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container transition"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reopen Ticket
            </button>
          )}
        </div>
      </div>

      <hr className="border-outline-variant/40" />

      {/* Inquiry Summary */}
      <div className="rounded-xl bg-surface-container-low/60 border border-outline-variant/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            Original Request · Category: {String(ticket.category).replaceAll("_", " ")}
          </span>
          <span className="text-xs text-on-surface-variant font-medium">
            {formatDate(ticket.created_at)}
          </span>
        </div>
        <p className="text-sm text-on-surface font-medium leading-relaxed whitespace-pre-wrap">
          {ticket.description}
        </p>
        {ticket.job_title && (
          <p className="text-xs font-semibold text-primary">
            Linked Job: {ticket.job_title}
          </p>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="pt-2 border-t border-outline-variant/30 flex flex-wrap gap-2">
            {attachments.map((item: any) => (
              <a
                key={item.id}
                href={`/api/support/${ticket.id}/attachments/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-container px-3 py-1.5 text-xs font-bold text-primary hover:bg-surface-container-high transition"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{item.file_name || "Attachment"}</span>
                <span className="text-[10px] text-on-surface-variant font-normal">({item.mime_type})</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Escalation or Resolution Banners */}
      {ticket.escalation_type && (
        <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/10 p-3.5 text-xs font-bold text-primary">
          <LifeBuoy className="h-4 w-4 shrink-0" />
          <span>This case has been escalated to {String(ticket.escalation_type).replaceAll("_", " ")} for specialized review.</span>
        </div>
      )}

      {ticket.resolution_summary && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              Resolution: {String(ticket.resolution_type).replaceAll("_", " ")}
            </h3>
          </div>
          <p className="text-xs text-on-surface font-medium leading-relaxed pl-6">
            {ticket.resolution_summary}
          </p>
        </div>
      )}

      {/* Reopen Form Modal / Drawer */}
      {showReopen && (
        <form onSubmit={handleReopen} className="rounded-xl border border-outline-variant bg-surface-container p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface">Reopen this ticket</h3>
            <button
              type="button"
              onClick={() => setShowReopen(false)}
              className="text-xs font-bold text-on-surface-variant hover:text-on-surface"
            >
              Cancel
            </button>
          </div>
          <textarea
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            rows={3}
            required
            placeholder="Please explain why this issue needs to be reopened..."
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-xs outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-on-primary hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Reopening..." : "Confirm Reopen"}
          </button>
        </form>
      )}

      {/* Modern Conversational Chat Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
              Live Support Chat
            </h2>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-[11px] font-medium text-on-surface-variant">
            {messagesList.length} {messagesList.length === 1 ? "message" : "messages"}
          </span>
        </div>

        {/* Chat message bubbles */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto rounded-2xl bg-surface-container-lowest/50 border border-outline-variant/40 p-4">
          {messagesList.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface-variant">
              No replies yet. Our support staff will respond shortly.
            </div>
          ) : (
            messagesList.map((message: any, index: number) => {
              const isMe = message.actor_type === role;
              return (
                <div
                  key={`${message.actor_type}-${message.created_at}-${index}`}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-bold text-on-surface-variant">
                    {isMe ? (
                      <>
                        <span>You</span>
                        <User className="h-3 w-3 text-primary" />
                      </>
                    ) : (
                      <>
                        <Headphones className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Support Agent</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{formatDate(message.created_at)}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-primary text-on-primary rounded-br-sm font-medium"
                        : "bg-surface-container border border-outline-variant/60 text-on-surface rounded-bl-sm font-medium"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Reply Box */}
        {canReply ? (
          <form onSubmit={handleReply} className="space-y-2">
            <div className="relative rounded-xl border border-outline-variant bg-surface-container-lowest focus-within:border-primary transition">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReply(e);
                  }
                }}
                rows={3}
                required
                placeholder="Type your message to support... (Press Enter to send)"
                className="w-full resize-none rounded-xl bg-transparent p-3 text-sm outline-none placeholder:text-on-surface-variant/50 text-on-surface"
              />
              <div className="flex items-center justify-between border-t border-outline-variant/30 px-3 py-2 bg-surface-container/30 rounded-b-xl">
                <span className="text-[11px] text-on-surface-variant font-medium">
                  Do not include passwords, verification codes, or bank credentials.
                </span>
                <button
                  type="submit"
                  disabled={isPending || !replyText.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-on-primary hover:opacity-90 disabled:opacity-40 transition"
                >
                  <Send className="h-3 w-3" />
                  <span>{isPending ? "Sending..." : "Send"}</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-outline-variant/40 bg-surface-container/30 p-3 text-center text-xs text-on-surface-variant font-medium">
            This ticket is closed and can no longer receive new replies.
          </div>
        )}
      </div>

      {/* Event Audit Trail (Clean Timeline) */}
      <details className="group rounded-xl border border-outline-variant/40 bg-surface-container-lowest/30 p-4">
        <summary className="flex cursor-pointer items-center justify-between text-xs font-bold uppercase tracking-wider text-on-surface-variant select-none">
          <span>Ticket Activity History ({events.length})</span>
          <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-3 space-y-2.5 pt-2 border-t border-outline-variant/20">
          {events.map((event: any, i: number) => (
            <div key={`${event.event_type}-${event.created_at}-${i}`} className="flex items-center justify-between text-xs text-on-surface-variant py-1">
              <span className="font-semibold text-on-surface">
                {String(event.event_type).replaceAll("_", " ").toUpperCase()}
              </span>
              <span className="text-[11px] font-medium">
                {formatDate(event.created_at)}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
