"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MessageSquare, CheckCircle2, ChevronRight } from "lucide-react";

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

function timeAgo(dateStr: string | null, nowLabel: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return nowLabel;
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function MessagesContent({ conversations, loading, role }: MessagesContentProps) {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-full pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-widest text-primary font-bold">
            {t("messages.inbox")}
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface leading-tight tracking-tight">
            {t("messages.titleMain")} <span className="text-primary">{t("messages.titleHighlight")}</span>
          </h1>
          <p className="text-xs text-on-surface-variant max-w-md">
            {role === "client" ? t("messages.descClient") : t("messages.descWorker")}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-high px-3.5 py-1.5 rounded-full border border-surface-container-highest w-fit">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">{t("messages.realtime")}</span>
        </div>
      </header>

      {/* Search Input */}
      <div className="relative group mx-1">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant opacity-60 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
         <input 
           type="text" 
           placeholder={t("messages.searchPlaceholder")} 
           className="w-full h-12 pl-11 pr-4 bg-surface-container-lowest border border-surface-container-highest rounded-2xl text-on-surface text-xs placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all touch-manipulation"
         />
      </div>

      {/* Conversations List */}
      <div className="flex flex-col gap-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-container-low rounded-2xl animate-pulse mx-1" />
          ))
        ) : conversations.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
             <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center border border-surface-container-highest">
                <MessageSquare className="h-6 w-6 text-on-surface-variant opacity-40" />
             </div>
             <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold text-on-surface">{t("messages.emptyTitle")}</h3>
                <p className="text-xs text-on-surface-variant max-w-[260px]">
                  {t("messages.emptyDesc")}
                </p>
             </div>
             {role === "client" && (
                <Link href="/client/search" className="mt-2 h-11 px-6 flex items-center justify-center bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all touch-manipulation">
                  {t("messages.findWorkers")}
                </Link>
             )}
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => router.push(`/${role}/messages/${conv.id}`)}
              className="group relative bg-surface-container-lowest border border-surface-container-highest rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 text-left transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.99] mx-1 touch-manipulation"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                 <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-bold text-sm border border-surface transition-transform group-hover:scale-105 duration-200 ${conv.unread > 0 ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                    {conv.other_avatar ? (
                      <img src={conv.other_avatar} className="w-full h-full object-cover" alt={conv.other_name} />
                    ) : (
                      <span>{conv.other_name.substring(0, 2).toUpperCase()}</span>
                    )}
                 </div>
                 {conv.is_verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full border-2 border-surface-container-lowest flex items-center justify-center shadow-sm">
                       <CheckCircle2 className="h-3 w-3" />
                    </div>
                 )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                 <div className="flex items-center justify-between">
                    <h3 className={`text-xs truncate group-hover:text-primary transition-colors ${conv.unread > 0 ? "text-on-surface font-extrabold" : "text-on-surface-variant font-semibold"}`}>
                      {conv.other_name}
                    </h3>
                    <span className="text-[10px] text-on-surface-variant opacity-50 shrink-0 font-medium">
                       {timeAgo(conv.last_at, t("messages.now"))}
                    </span>
                 </div>
                 <p className="text-[10px] text-primary uppercase tracking-wider font-bold">{conv.other_skill}</p>
                 <p className={`text-xs truncate ${conv.unread > 0 ? "text-on-surface font-bold" : "text-on-surface-variant opacity-60"}`}>
                   {conv.last_image ? t("messages.sharedImage") : (conv.last_body || t("messages.startConversation"))}
                 </p>
              </div>

              {/* Unread Badge */}
              {conv.unread > 0 && (
                <div className="shrink-0 w-5 h-5 bg-primary text-on-primary rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm animate-pulse">
                   {conv.unread}
                </div>
              )}
              
              {/* Arrow Icon */}
              {conv.unread === 0 && (
                 <ChevronRight className="h-4 w-4 text-on-surface-variant/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
