"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  sender_id: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
  sender_name: string;
  sender_avatar: string | null;
}

interface ConvInfo {
  other_name: string;
  other_avatar: string | null;
  other_skill: string;
  is_verified: boolean;
  other_id: string;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch conversation info from list API
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
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    }
  }, [convId]);

  // Initial fetch + polling every 3s
  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const sendMessage = async () => {
    if (sending || uploading) return;
    if (!text.trim() && !imageFile) return;

    setSending(true);
    setError(null);

    try {
      let imageUrl: string | null = null;

      // Upload image if present
      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          setError(err.error || "Image upload failed");
          setSending(false);
          setUploading(false);
          return;
        }
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
        setUploading(false);
      }

      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim() || null, imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send message");
        return;
      }

      setText("");
      clearImage();
      await fetchMessages();
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0c0c0e] text-white" style={{ zIndex: 100 }}>

      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#18181b]/95 backdrop-blur-md border-b border-white/5 shrink-0">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center text-sm font-bold">
            {convInfo?.other_avatar
              ? <img src={convInfo.other_avatar} className="w-full h-full object-cover" alt="" />
              : <span>{convInfo?.other_name?.substring(0, 2).toUpperCase() || "??"}</span>
            }
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-[#18181b] rounded-full" />
        </div>

        {/* Name + Skill */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold truncate">{convInfo?.other_name || "Loading..."}</span>
            {convInfo?.is_verified && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-green-400 shrink-0">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                Verified
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 truncate">{convInfo?.other_skill || "Professional"} • <span className="text-green-400">Online</span></p>
        </div>

        {/* Profile link */}
        {convInfo?.other_id && (
          <Link href={`/client/worker/${convInfo.other_id}`} className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          </Link>
        )}
      </div>

      {/* ── MESSAGE AREA ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-zinc-500 text-sm font-medium">No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender_id === myId;
          const showAvatar = !isMe && (i === 0 || messages[i - 1].sender_id !== msg.sender_id);

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar (received only) */}
              {!isMe && (
                <div className={`shrink-0 w-7 h-7 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center text-[10px] font-bold ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                  {convInfo?.other_avatar
                    ? <img src={convInfo.other_avatar} className="w-full h-full object-cover" alt="" />
                    : <span>{msg.sender_name?.substring(0, 2).toUpperCase()}</span>
                  }
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                {/* Image */}
                {msg.image_url && (
                  <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={msg.image_url}
                      alt="attachment"
                      className={`max-w-[220px] rounded-2xl object-cover shadow-lg ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}
                    />
                  </a>
                )}
                {/* Text bubble */}
                {msg.body && (
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-[#2563eb] text-white rounded-br-sm"
                      : "bg-[#27272a] text-zinc-100 rounded-bl-sm"
                  }`}>
                    {msg.body}
                  </div>
                )}
                <span className="text-[10px] text-zinc-600 font-medium px-1">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="mx-4 mb-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-xs text-red-400 font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* ── IMAGE PREVIEW ── */}
      {imagePreview && (
        <div className="mx-4 mb-2 relative inline-flex shrink-0">
          <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-white/10" />
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <button onClick={clearImage} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* ── INPUT BAR ── */}
      <div className="px-3 py-3 bg-[#18181b]/95 backdrop-blur-md border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2 bg-[#27272a] rounded-2xl px-3 py-2 border border-white/5">
          {/* Attachment */}
          <button
            onClick={() => fileRef.current?.click()}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-400">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none min-w-0 py-1"
          />

          {/* Send */}
          <button
            onClick={sendMessage}
            disabled={sending || uploading || (!text.trim() && !imageFile)}
            className="w-9 h-9 bg-[#2dd4bf] hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95"
          >
            {sending || uploading
              ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            }
          </button>
        </div>

        {/* Warning label */}
        <p className="text-center text-[10px] text-zinc-700 font-medium mt-2">
          🚫 Sharing contact info (phone, email, social media) is not allowed
        </p>
      </div>
    </div>
  );
}
