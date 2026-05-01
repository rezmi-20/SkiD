"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  other_name: string;
  other_avatar: string | null;
  other_skill: string;
  is_verified: boolean;
  last_body: string | null;
  last_image: string | null;
  last_at: string | null;
  unread: number;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 pb-28 md:pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">Messages</h1>
          <p className="text-zinc-500 text-sm font-medium">Your conversations with professionals</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder="Search conversations..." className="w-full h-12 pl-11 pr-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-white text-sm font-medium placeholder:text-zinc-600 focus:outline-none focus:border-green-400/40 transition-all" />
      </div>

      {/* Conversations */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-20 bg-zinc-900/60 rounded-[1.75rem] animate-pulse" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="text-white font-bold mb-1">No conversations yet</h3>
          <p className="text-zinc-500 text-sm">Find a worker and send them a message to get started.</p>
          <Link href="/client/search" className="mt-6 px-5 py-2.5 bg-[#2dd4bf] text-black text-xs font-black uppercase tracking-widest rounded-xl no-underline">
            Find Workers
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => router.push(`/client/messages/${conv.id}`)}
              className="w-full group bg-zinc-900/60 border border-white/5 hover:border-green-400/20 rounded-[1.75rem] p-4 md:p-5 flex items-center gap-4 text-left transition-all duration-300"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center font-black text-base ${conv.unread > 0 ? "bg-green-400/15 border border-green-400/30 text-green-400" : "bg-zinc-800 border border-white/5 text-zinc-400"}`}>
                  {conv.other_avatar
                    ? <img src={conv.other_avatar} className="w-full h-full object-cover" alt={conv.other_name} />
                    : <span>{conv.other_name?.substring(0, 2).toUpperCase()}</span>
                  }
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black tracking-tight ${conv.unread > 0 ? "text-white" : "text-zinc-300"}`}>{conv.other_name}</span>
                    {conv.is_verified && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-green-400">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-600 font-medium shrink-0 ml-2">{timeAgo(conv.last_at)}</span>
                </div>
                <p className="text-xs text-zinc-600 font-medium mb-1">{conv.other_skill}</p>
                <p className={`text-xs truncate ${conv.unread > 0 ? "text-zinc-300 font-semibold" : "text-zinc-600 font-medium"}`}>
                  {conv.last_image ? "📷 Photo" : conv.last_body || "Start a conversation..."}
                </p>
              </div>

              {/* Badge */}
              <div className="shrink-0">
                {conv.unread > 0 ? (
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-black text-black">{conv.unread}</span>
                  </div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-700 group-hover:text-zinc-500 transition-colors">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
