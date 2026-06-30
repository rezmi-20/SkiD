"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type MessageType = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string | null;
  imageUrl: string | null;
  createdAt: string;
};

interface UseChatOptions {
  /** The conversation ID to load and poll */
  conversationId: string | null;
  /** The logged-in user's ID (to distinguish sent vs received) */
  currentUserId: string | null;
  /** Poll interval in ms. Default: 3000 */
  pollInterval?: number;
}

/**
 * useChat
 * Manages real-time-like messaging via polling for a given conversation.
 * Handles fetching, sending, and auto-scrolling to the latest message.
 * Used by the client and worker chat pages.
 *
 * NOTE: Can be upgraded to WebSockets/SSE in a future phase.
 */
export function useChat({
  conversationId,
  currentUserId,
  pollInterval = 3000,
}: UseChatOptions) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data: MessageType[] = await res.json();
      setMessages(data);

      // Auto-scroll only when a new message arrives
      const latestId = data[data.length - 1]?.id ?? null;
      if (latestId && latestId !== lastMessageIdRef.current) {
        lastMessageIdRef.current = latestId;
        setTimeout(scrollToBottom, 50);
      }
    } catch {
      // Silently fail on poll
    }
  }, [conversationId, scrollToBottom]);

  const sendMessage = useCallback(
    async ({ body, imageUrl }: { body?: string; imageUrl?: string }) => {
      if (!conversationId || (!body?.trim() && !imageUrl)) return;
      setSending(true);
      setError(null);

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimistic: MessageType = {
        id: tempId,
        conversationId,
        senderId: currentUserId ?? "",
        body: body ?? null,
        imageUrl: imageUrl ?? null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      setTimeout(scrollToBottom, 50);

      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body, imageUrl }),
        });
        if (!res.ok) throw new Error("Failed to send message");

        // Replace optimistic with real data
        await fetchMessages();
      } catch (err: any) {
        setError(err.message ?? "Could not send message.");
        // Remove optimistic on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setSending(false);
      }
    },
    [conversationId, currentUserId, fetchMessages, scrollToBottom]
  );

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));
  }, [fetchMessages]);

  // Polling — paused when tab hidden
  useEffect(() => {
    if (!conversationId) return;
    const poll = () => {
      if (document.visibilityState === "visible") fetchMessages();
    };
    const interval = setInterval(poll, pollInterval);
    document.addEventListener("visibilitychange", poll);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [conversationId, fetchMessages, pollInterval]);

  return {
    messages,
    loading,
    sending,
    error,
    bottomRef,
    sendMessage,
    refetch: fetchMessages,
  };
}
