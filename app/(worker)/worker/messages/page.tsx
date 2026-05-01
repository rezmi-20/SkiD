"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  other_name: string;
  other_avatar: string | null;
  last_body: string | null;
  last_image: string | null;
  last_at: string | null;
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

export default function WorkerMessagesPage() {
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
    <div className="p-4 md:p-8 space-y-6 pb-28">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-white">Client Messages</h1>
        <p className="text-zinc-500 text-sm">Manage inquiries and active bookings</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-20 bg-zinc-900/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/40 rounded-3xl border border-white/5">
          <div className="w-16 h-16 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="text-white font-bold mb-1">No messages yet</h3>
          <p className="text-zinc-500 text-sm">When clients contact you, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => router.push(`/worker/messages/${conv.id}`)}
              className="w-full group bg-zinc-900/60 border border-white/5 hover:border-[#2dd4bf]/20 rounded-2xl p-4 flex items-center gap-4 text-left transition-all"
            >
              <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-white/5 flex items-center justify-center">
                {conv.other_avatar
                  ? <img src={conv.other_avatar} className="w-full h-full object-cover" alt="" />
                  : <span className="font-bold text-zinc-500">{conv.other_name?.substring(0, 2).toUpperCase()}</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-bold text-white">{conv.other_name}</span>
                  <span className="text-[10px] text-zinc-600">{timeAgo(conv.last_at)}</span>
                </div>
                <p className="text-xs text-zinc-500 truncate">
                  {conv.last_image ? "📷 Photo received" : conv.last_body || "New conversation started"}
                </p>
              </div>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-700 group-hover:text-[#2dd4bf] transition-colors">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
