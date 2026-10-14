"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { adminReplySupportTicket } from "@/lib/actions/support";
import { playNotificationSound } from "@/lib/sound";
import {
  Send,
  User,
  Headphones,
  AlertCircle,
  Volume2,
  CheckCircle2,
} from "lucide-react";

function formatDate(value: unknown) {
  if (!value) return "Just now";
  return new Date(String(value)).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

interface AdminSupportChatProps {
  ticketId: string;
  initialMessages: any[];
  ticketStatus: string;
  isAssigned: boolean;
  canOperate: boolean;
  isTerminal: boolean;
  ownerName: string;
  assignmentVersion: number;
  claimAction: (formData: FormData) => Promise<void>;
}

export default function AdminSupportChat({
  ticketId,
  initialMessages,
  ticketStatus,
  isAssigned,
  canOperate,
  isTerminal,
  ownerName,
  assignmentVersion,
  claimAction,
}: AdminSupportChatProps) {
  const [messages, setMessages] = useState<any[]>(initialMessages || []);
  const [replyText, setReplyText] = useState("");
  const [awaitUser, setAwaitUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const initialMountRef = useRef(false);

  // Real-time polling for customer messages every 2.5s
  useEffect(() => {
    let active = true;

    async function pollMessages() {
      try {
        const res = await fetch(`/api/support/${ticketId}/messages`, { cache: "no-store" });
        if (!active || !res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.messages)) {
          setMessages((prev) => {
            const prevIds = new Set(prev.map((m: any) => m.id || `${m.created_at}-${m.actor_type}`));
            const hasNewUserMsg = json.messages.some(
              (m: any) => !prevIds.has(m.id || `${m.created_at}-${m.actor_type}`) && m.actor_type !== "support_admin"
            );

            if (initialMountRef.current && hasNewUserMsg) {
              playNotificationSound();
            }

            if (json.messages.length >= prev.length || hasNewUserMsg) {
              return json.messages;
            }
            return prev;
          });
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
  }, [ticketId]);

  // Smooth auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || isPending) return;
    setError(null);

    // Optimistic UI: display immediately in thread
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      actor_type: "support_admin",
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setReplyText("");

    startTransition(async () => {
      try {
        const result = await adminReplySupportTicket(ticketId, text, awaitUser);
        if (!result.success) {
          setError(result.error || "Failed to deliver reply.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while sending reply.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Thread Header with Live Status & Audio Test */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
            Conversation Thread
          </h2>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Live
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => playNotificationSound()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-on-surface-variant hover:text-primary transition"
            title="Test notification chime sound"
          >
            <Volume2 className="h-3 w-3" />
            <span>Sound test</span>
          </button>
          <span className="text-[11px] text-on-surface-variant font-medium">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="space-y-3 min-h-[220px] max-h-[460px] overflow-y-auto rounded-2xl bg-surface-container-lowest/50 border border-outline-variant/40 p-4">
        {messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-on-surface-variant">
            No replies recorded yet.
          </div>
        ) : (
          messages.map((message: any, index: number) => {
            const isAdmin = message.actor_type === "support_admin";
            return (
              <div
                key={message.id || `${message.actor_type}-${message.created_at}-${index}`}
                className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-bold text-on-surface-variant">
                  {isAdmin ? (
                    <>
                      <span className="text-primary font-bold">Support Staff (You)</span>
                      <Headphones className="h-3 w-3 text-primary" />
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 text-on-surface-variant" />
                      <span>{ownerName || "User"}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{formatDate(message.created_at)}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isAdmin
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

      {/* Error notification if send failed */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real-time Operational Reply Box */}
      {canOperate && !isTerminal && (
        <div>
          {!isAssigned ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>You must claim this ticket before replying to the customer.</span>
              </div>
              <form action={claimAction}>
                <input type="hidden" name="assignmentVersion" value={assignmentVersion} />
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-amber-700 transition"
                >
                  Claim Now
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSendReply} className="space-y-2">
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest focus-within:border-primary transition">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSendReply(e);
                    }
                  }}
                  rows={4}
                  required
                  placeholder="Type official reply to customer... (Ctrl+Enter to send)"
                  className="w-full resize-none rounded-xl bg-transparent p-3 text-sm outline-none placeholder:text-on-surface-variant/50 text-on-surface"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 px-3 py-2 bg-surface-container/30 rounded-b-xl">
                  <label className="flex items-center gap-2 text-xs font-bold text-on-surface cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={awaitUser}
                      onChange={(e) => setAwaitUser(e.target.checked)}
                      className="text-primary rounded"
                    />
                    <span>Request info & mark awaiting user response</span>
                  </label>
                  <button
                    type="submit"
                    disabled={isPending || !replyText.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-on-primary hover:opacity-90 disabled:opacity-50 shadow transition"
                  >
                    <Send className="h-3 w-3" />
                    <span>{isPending ? "Sending..." : "Send Reply"}</span>
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant font-medium">
                Never request or record passwords, verification codes, full FIN, or payment credentials.
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
