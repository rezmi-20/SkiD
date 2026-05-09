"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth/client";
import { AnimatePresence, motion } from "framer-motion";

interface Conversation {
  id: string;
  other_name: string;
  other_avatar: string | null;
  last_body: string | null;
  last_at: string | null;
}

interface MessagingContextType {
  conversations: Conversation[];
  unreadCount: number;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  const [activeToast, setActiveToast] = useState<{ name: string; body: string; id: string } | null>(null);
  
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkNotifications = (newConvs: Conversation[]) => {
    if (newConvs.length === 0) return;
    
    // Find the most recent message across all conversations
    const latest = newConvs.reduce((prev, current) => {
        if (!current.last_at) return prev;
        if (!prev.last_at) return current;
        return new Date(current.last_at) > new Date(prev.last_at) ? current : prev;
    }, newConvs[0]);

    if (latest && latest.last_at && latest.last_at !== lastNotificationId) {
      // If this is not the first load, show toast
      if (lastNotificationId !== null && latest.last_body) {
        setActiveToast({
          name: latest.other_name,
          body: latest.last_body,
          id: latest.id
        });
        // Auto-hide after 5 seconds
        setTimeout(() => setActiveToast(null), 5000);
      }
      setLastNotificationId(latest.last_at);
    }
  };

  const fetchConversations = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        const convs = data.conversations || [];
        setConversations(convs);
        checkNotifications(convs);
      }
    } catch (e) {
      console.error("Failed to fetch conversations for notifications", e);
    }
  };

  useEffect(() => {
    if (session) {
      fetchConversations();
      pollInterval.current = setInterval(fetchConversations, 10000); // Every 10 seconds
    } else {
      setConversations([]);
      if (pollInterval.current) clearInterval(pollInterval.current);
    }
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [session]);

  return (
    <MessagingContext.Provider value={{ conversations, unreadCount: 0 }}>
      {children}
      
      {/* Global Notification Toast */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-4 right-4 z-[9999] md:left-auto md:right-8 md:w-80"
          >
            <div 
              onClick={() => {
                const role = session?.user?.role === 'worker' ? 'worker' : 'client';
                window.location.href = `/${role}/messages/${activeToast.id}`;
              }}
              className="bg-[#1c1c1e] border border-white/10 rounded-2xl p-4 shadow-2xl cursor-pointer hover:bg-[#2c2c2e] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2dd4bf] rounded-full flex items-center justify-center text-black font-black">
                  {activeToast.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-[#2dd4bf] uppercase tracking-widest mb-0.5">New Message</p>
                  <p className="text-sm font-bold text-white truncate">{activeToast.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{activeToast.body}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MessagingContext.Provider>
  );
}

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) throw new Error("useMessaging must be used within MessagingProvider");
  return context;
};
