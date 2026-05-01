"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  sender_id: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
  sender_name: string;
}

interface ConvInfo {
  other_name: string;
  other_avatar: string | null;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function WorkerChatPage() {
  const params = useParams();
  const router = useRouter();
  const convId = params.conversationId as string;
  const { data: session } = useSession();
  const myId = session?.user?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [convInfo, setConvInfo] = useState<ConvInfo | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => {
        const conv = (d.conversations || []).find((c: any) => c.id === convId);
        if (conv) setConvInfo(conv);
      })
      .catch(console.error);
  }, [convId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) { console.error(e); }
  }, [convId]);

  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (sending || !text.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send");
      } else {
        setText("");
        fetchMessages();
      }
    } catch (e) {
      setError("Connection error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0c0c0e] text-white z-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-white/5 shrink-0">
        <button onClick={() => router.push("/worker/messages")} className="p-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center text-xs font-bold">
          {convInfo?.other_avatar 
            ? <img src={convInfo.other_avatar} className="w-full h-full object-cover" alt="" />
            : <span>{convInfo?.other_name?.substring(0, 2).toUpperCase() || "??"}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{convInfo?.other_name || "Client"}</p>
          <p className="text-[10px] text-green-400">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === myId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-[#2dd4bf] text-black rounded-tr-sm" : "bg-zinc-800 text-white rounded-tl-sm"}`}>
                {msg.image_url && <img src={msg.image_url} className="rounded-lg mb-2 max-w-full" alt="" />}
                <p>{msg.body}</p>
                <p className={`text-[9px] mt-1 opacity-60 ${isMe ? "text-black" : "text-zinc-400"}`}>{formatTime(msg.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900 border-t border-white/5 pb-8">
        {error && <p className="text-[10px] text-red-400 mb-2">{error}</p>}
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Reply to client..."
            className="flex-1 bg-zinc-800 border-0 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#2dd4bf]"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !text.trim()}
            className="w-12 h-12 bg-[#2dd4bf] text-black rounded-xl flex items-center justify-center disabled:opacity-50"
          >
            {sending ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>}
          </button>
        </div>
      </div>
    </div>
  );
}
