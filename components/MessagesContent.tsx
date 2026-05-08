"use client";

import { useLanguage } from "@/context/LanguageContext";
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

interface MessagesContentProps {
  conversations: Conversation[];
  loading: boolean;
  role: "client" | "worker";
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function MessagesContent({ conversations, loading, role }: MessagesContentProps) {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="flex flex-col gap-1">
          <p className="text-label-md uppercase tracking-[0.2em] text-primary opacity-80">
            Inbox
          </p>
          <h1 className="text-[32px] md:text-[40px] font-bold text-on-surface leading-tight tracking-tight">
            Communications <span className="text-primary">Hub</span>
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-md">
            Manage your discussions with {role === "client" ? "professionals" : "clients"}.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-surface-container-highest">
           <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
           <span className="text-label-sm font-bold text-on-surface uppercase tracking-widest">Real-time Sync</span>
        </div>
      </header>

      {/* Search Input */}
      <div className="relative group mx-1">
         <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">search</span>
         <input 
           type="text" 
           placeholder="Search conversations..." 
           className="w-full h-14 pl-12 pr-4 bg-surface-container-lowest border border-surface-container-highest rounded-[1.25rem] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
         />
      </div>

      {/* Conversations List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-low rounded-[2rem] animate-pulse mx-1" />
          ))
        ) : conversations.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
             <div className="w-20 h-20 bg-surface-container rounded-[2rem] flex items-center justify-center border border-surface-container-highest">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant opacity-40">forum</span>
             </div>
             <div className="flex flex-col gap-1">
                <h3 className="text-headline-md text-on-surface">No conversations yet</h3>
                <p className="text-body-md text-on-surface-variant max-w-[240px]">
                  Start a discussion to see your messages here.
                </p>
             </div>
             {role === "client" && (
                <Link href="/client/search" className="mt-2 h-12 px-8 flex items-center justify-center bg-on-surface text-surface-container-lowest rounded-2xl text-label-md font-bold uppercase tracking-widest hover:bg-primary transition-all">
                  Find Workers
                </Link>
             )}
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => router.push(`/${role}/messages/${conv.id}`)}
              className="group relative bg-surface-container-lowest border border-surface-container-highest rounded-[2rem] p-4 md:p-5 flex items-center gap-4 text-left transition-all hover:shadow-md hover:border-primary/20 mx-1"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                 <div className={`w-16 h-16 rounded-[1.5rem] overflow-hidden flex items-center justify-center font-bold text-lg border-2 border-surface transition-transform group-hover:scale-105 duration-300 ${conv.unread > 0 ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                    {conv.other_avatar ? (
                      <img src={conv.other_avatar} className="w-full h-full object-cover" alt={conv.other_name} />
                    ) : (
                      <span>{conv.other_name.substring(0, 2).toUpperCase()}</span>
                    )}
                 </div>
                 {conv.is_verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-on-primary rounded-full border-2 border-surface-container-lowest flex items-center justify-center shadow-sm">
                       <span className="material-symbols-outlined text-[12px] filled">verified</span>
                    </div>
                 )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                 <div className="flex items-center justify-between">
                    <h3 className={`text-headline-sm truncate group-hover:text-primary transition-colors ${conv.unread > 0 ? "text-on-surface" : "text-on-surface-variant font-medium"}`}>
                      {conv.other_name}
                    </h3>
                    <span className="text-label-sm text-on-surface-variant opacity-40 shrink-0 font-bold">
                       {timeAgo(conv.last_at)}
                    </span>
                 </div>
                 <p className="text-label-sm text-primary uppercase tracking-widest opacity-80 mb-1">{conv.other_skill}</p>
                 <p className={`text-body-md truncate ${conv.unread > 0 ? "text-on-surface font-bold" : "text-on-surface-variant opacity-60"}`}>
                   {conv.last_image ? "📷 Shared an image" : (conv.last_body || "Start a conversation...")}
                 </p>
              </div>

              {/* Unread Badge */}
              {conv.unread > 0 && (
                <div className="shrink-0 w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg animate-pulse">
                   {conv.unread}
                </div>
              )}
              
              {/* Arrow Icon */}
              {conv.unread === 0 && (
                 <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
