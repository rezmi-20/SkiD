"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Paperclip,
  Smile,
  Send,
  ArrowLeft,
  MoreVertical,
  ShieldCheck,
  Star,
  MessageSquare,
  Lock,
  User,
  ExternalLink,
  FileText,
  Sparkles,
  Clock,
  ChevronRight,
  Check,
  CheckCheck,
  Play,
  Video,
  FileVideo,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { playNotificationSound } from "@/lib/sound";

interface Conversation {
  id: string;
  other_user_id: string;
  other_name: string;
  other_avatar: string | null;
  other_role?: string;
  other_skill?: string;
  other_skills?: string[];
  other_bio?: string;
  other_hourly_rate?: number | string;
  other_district?: string;
  other_experience_years?: number;
  other_availability?: string;
  is_verified?: boolean;
  last_body: string | null;
  last_image: string | null;
  last_media_type?: string | null;
  last_at: string | null;
  unread?: number;
}

interface Message {
  id: string;
  sender_id: string;
  body: string | null;
  image_url: string | null;
  media_type?: "image" | "video" | null;
  is_read?: boolean;
  read_at?: string | null;
  created_at: string;
  sender_name: string;
  sender_avatar: string | null;
  isOptimistic?: boolean;
}

interface MyProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface WorkerProfile {
  id: string;
  email: string;
  full_name: string;
  bio: string;
  skills: string[];
  hourly_rate: string;
  avatar_url: string;
  is_verified: boolean;
  avg_rating: string | number;
  total_ratings: string | number;
}

interface UnifiedChatWorkspaceProps {
  role: "client" | "worker";
  conversationId?: string;
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

export default function UnifiedChatWorkspace({ role, conversationId }: UnifiedChatWorkspaceProps) {
  const router = useRouter();

  // Current logged in user info
  const [myProfile, setMyProfile] = useState<MyProfile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentConv, setCurrentConv] = useState<Conversation | null>(null);

  // Participant profile states for Pane 3
  const [otherWorkerProfile, setOtherWorkerProfile] = useState<WorkerProfile | null>(null);
  const [loadingOtherProfile, setLoadingOtherProfile] = useState(false);

  // Message input state
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "dms" | "groups" | "low">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Right pane toggle (Desktop slide-over profile drawer)
  const [showRightPane, setShowRightPane] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch current user details
  useEffect(() => {
    fetch("/api/auth/me?optional=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.authenticated !== false) {
          setMyProfile({
            id: data.id,
            email: data.email,
            name: data.name || "User",
            role: data.role,
          });
        }
      })
      .catch((err) => {
        console.warn("Failed to load profile for chat", err);
      });
  }, []);

  // Fetch Conversation List
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      const list = data.conversations || [];
      setConversations(list);

      if (conversationId) {
        const found = list.find((c: Conversation) => c.id === conversationId);
        if (found) setCurrentConv(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  }, [conversationId]);

  const initialMountRef = useRef(false);
  const convPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch Messages for current conversation
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const newMessages: Message[] = data.messages || [];

      setMessages((prev) => {
        const prevIds = new Set(prev.map((m) => m.id));
        const hasNewOtherMsg = newMessages.some(
          (m: Message) => !prevIds.has(m.id) && m.sender_id !== myProfile?.id
        );

        if (initialMountRef.current && hasNewOtherMsg) {
          playNotificationSound();
        }

        return newMessages;
      });

      // Notify MobileNav to clear/refresh unread message badge
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("messages:refresh"));
      }
    } catch (e) {
      console.error(e);
    }
  }, [conversationId, myProfile?.id]);

  // Initial load and periodic conversation list polling (every 4s)
  useEffect(() => {
    fetchConversations();

    if (convPollingRef.current) clearInterval(convPollingRef.current);
    convPollingRef.current = setInterval(fetchConversations, 4000);

    return () => {
      if (convPollingRef.current) clearInterval(convPollingRef.current);
    };
  }, [fetchConversations]);

  // Initial load of messages & start fast polling (every 2.5s)
  useEffect(() => {
    if (conversationId) {
      setLoadingMessages(true);
      fetchMessages().finally(() => {
        setLoadingMessages(false);
        initialMountRef.current = true;
      });

      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(fetchMessages, 2500);
    } else {
      setMessages([]);
      setCurrentConv(null);
      setOtherWorkerProfile(null);
      initialMountRef.current = false;
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [conversationId, fetchMessages]);

  // Fetch participant's worker profile if they are a worker (Pane 3)
  useEffect(() => {
    if (!currentConv) {
      setOtherWorkerProfile(null);
      return;
    }
    
    // We only fetch worker profile if they are worker (or we try if we are client)
    if (role === "client" && currentConv.other_user_id) {
      setLoadingOtherProfile(true);
      fetch(`/api/workers/${currentConv.other_user_id}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data && data.worker) {
            setOtherWorkerProfile(data.worker);
          } else {
            setOtherWorkerProfile(null);
          }
        })
        .catch(() => setOtherWorkerProfile(null))
        .finally(() => setLoadingOtherProfile(false));
    } else {
      setOtherWorkerProfile(null);
    }
  }, [currentConv, role]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVid = file.type.startsWith("video/");
    setMediaType(isVid ? "video" : "image");
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaPreview(null);
    setMediaFile(null);
    setMediaType("image");
    if (fileRef.current) fileRef.current.value = "";
  };

  const sendMessage = async () => {
    if (sending || uploading) return;
    const pendingBody = text.trim();
    if (!pendingBody && !mediaFile) return;

    setSending(true);
    setError(null);

    // Optimistic UI append
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      sender_id: myProfile?.id || "me",
      body: pendingBody || null,
      image_url: mediaPreview,
      media_type: mediaType,
      created_at: new Date().toISOString(),
      sender_name: myProfile?.name || "You",
      sender_avatar: null,
      is_read: false,
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");

    // Update conversation last snippet in sidebar immediately
    if (conversationId) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                last_body: pendingBody || (mediaType === "video" ? "🎥 Video" : "📷 Photo"),
                last_media_type: mediaType,
                last_at: new Date().toISOString(),
              }
            : c
        )
      );
    }

    try {
      let uploadedUrl: string | null = null;
      const finalMediaType = mediaType;

      if (mediaFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", mediaFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          setError("Failed to upload media. Please try again.");
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          setText(pendingBody);
          setSending(false);
          setUploading(false);
          return;
        }
        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.url;
        setUploading(false);
      }

      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: pendingBody || null,
          imageUrl: uploadedUrl,
          mediaType: finalMediaType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send message");
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setText(pendingBody);
        return;
      }

      clearMedia();
      await fetchMessages();
      fetchConversations();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("messages:refresh"));
      }
    } catch {
      setError("Connection error. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setText(pendingBody);
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

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.other_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.last_body && c.last_body.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (activeTab === "dms") return true;
    if (activeTab === "groups") return false;
    if (activeTab === "low") return false;
    return true;
  });

  const myInitials = myProfile?.name ? myProfile.name.slice(0, 2).toUpperCase() : "ME";

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-background overflow-hidden text-foreground">
      
      {/* ── PANE 1: Left Panel (My Profile, Search & Conversations) ── */}
      <div className={`w-full md:w-[320px] lg:w-[340px] flex flex-col border-r border-outline-variant/20 bg-surface-container-lowest shrink-0 transition-all ${
        conversationId ? "hidden md:flex" : "flex"
      }`}>
        
        {/* Top: Little Info About My Profile */}
        <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/50 flex items-center gap-3 shrink-0">
          <Avatar className="w-10 h-10 border border-outline-variant/20 rounded-xl">
            <AvatarFallback className="text-xs font-black bg-primary/10 text-primary rounded-xl">
              {myInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate text-foreground leading-tight">{myProfile?.name || "Loading..."}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase font-semibold tracking-wider mt-0.5">
              {myProfile?.role || role}
            </p>
          </div>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-3 border-b border-outline-variant/20 bg-surface-container-lowest shrink-0">
          {(["all", "dms", "groups", "low"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab 
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10" 
                  : "bg-surface-container-low hover:bg-surface-container text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-outline-variant/20 bg-surface-container-lowest shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9 h-9 rounded-xl bg-surface-container border border-outline-variant/20 text-xs focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10 bg-surface-container-lowest/20">
          {loadingList ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
                <div className="w-11 h-11 bg-surface-container rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container rounded w-2/3" />
                  <div className="h-3 bg-surface-container rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full gap-2">
              <MessageSquare className="w-8 h-8 opacity-30" />
              <p className="text-xs font-semibold">No discussions found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === conversationId;
              const hasUnread = conv.unread && conv.unread > 0;
              const isVerified = conv.is_verified;
              const initials = conv.other_name.slice(0, 2).toUpperCase();

              return (
                <button
                  key={conv.id}
                  onClick={() => router.push(`/${role}/messages/${conv.id}`)}
                  className={`w-full p-4 flex items-center gap-3 text-left transition-all duration-200 relative ${
                    isActive 
                      ? "bg-primary/8 dark:bg-primary/5 text-foreground" 
                      : "hover:bg-surface-container-low/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {/* Left Highlight bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full" />
                  )}

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="w-11 h-11 border border-outline-variant/20 rounded-xl">
                      {conv.other_avatar && <AvatarImage src={conv.other_avatar} />}
                      <AvatarFallback className="text-xs font-black bg-surface-container text-foreground rounded-xl">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-surface-container-lowest" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs truncate font-semibold flex items-center gap-1 ${
                        hasUnread ? "text-foreground" : "text-foreground/90"
                      }`}>
                        {conv.other_name}
                        {isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-primary fill-primary/10 shrink-0" />
                        )}
                      </span>
                      <span className="text-[9px] text-muted-foreground shrink-0">
                        {timeAgo(conv.last_at)}
                      </span>
                    </div>

                    <p className={`text-[11px] truncate ${
                      hasUnread ? "text-foreground font-semibold" : "text-muted-foreground"
                    }`}>
                      {conv.last_media_type === "video" || (conv.last_image && conv.last_image.match(/\.(mp4|webm|mov|ogg)($|\?)/i))
                        ? "🎥 Sent a video"
                        : conv.last_image
                        ? "📷 Sent an image"
                        : (conv.last_body || "Start messaging...")}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Star className="w-3 h-3 text-muted-foreground/30 hover:text-amber-400 transition-colors" />
                    {hasUnread && (
                      <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center shadow-sm shadow-primary/20 animate-pulse">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── PANE 2: Middle Panel (Chat Conversation Window) ── */}
      <div className={`flex-1 flex flex-col bg-background/95 transition-all ${
        !conversationId ? "hidden md:flex" : "flex"
      }`}>
        
        {conversationId ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-10">
              <div 
                onClick={() => setShowRightPane((prev) => !prev)}
                className="flex items-center gap-3 min-w-0 cursor-pointer select-none group"
                title="Participant profile"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/${role}/messages`);
                  }}
                  className="md:hidden shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
 
                <div className="relative shrink-0">
                  <Avatar className="w-10 h-10 border border-outline-variant/20 group-hover:ring-2 ring-primary/40 transition-all">
                    {currentConv?.other_avatar && <AvatarImage src={currentConv.other_avatar} />}
                    <AvatarFallback className="text-xs font-black bg-surface-container text-foreground">
                      {currentConv?.other_name.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-surface-container-lowest" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                      {currentConv?.other_name || "Chat"}
                    </span>
                    {currentConv?.is_verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1.5">
                    <span>{currentConv?.other_role === "worker" || role === "client" ? (currentConv?.other_skill || "Professional") : "Client"}</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-emerald-500 font-medium">Online</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`flex rounded-xl transition-all duration-200 ${
                    showRightPane 
                      ? "bg-primary/10 text-primary hover:bg-primary/20" 
                      : "text-muted-foreground hover:bg-surface-container hover:text-foreground"
                  }`}
                  onClick={() => setShowRightPane(!showRightPane)}
                  title="Toggle profile slide drawer"
                >
                  <User className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-surface-container text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-surface-container-low/10 relative"
                 style={{
                   backgroundImage: "radial-gradient(circle, var(--color-outline-variant) 0.6px, transparent 0.6px)",
                   backgroundSize: "24px 24px",
                 }}>
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
                  <MessageSquare className="w-9 h-9 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-xs font-semibold">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  // VERY IMPORTANT: Check if msg is sent by current logged in user
                  const isMe = (myProfile && msg.sender_id) 
                    ? msg.sender_id.toLowerCase() === myProfile.id.toLowerCase() 
                    : false;
                  
                  const showAvatar = !isMe && (i === 0 || messages[i - 1].sender_id !== msg.sender_id);
                  const isSequential = i > 0 && messages[i - 1].sender_id === msg.sender_id && 
                    (new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() < 300000);

                  const isVideo = msg.media_type === "video" || 
                    Boolean(msg.image_url?.match(/\.(mp4|webm|mov|ogg)($|\?)/i)) || 
                    Boolean(msg.image_url?.includes("/video/"));

                  return (
                    <div key={msg.id} className={`flex items-start gap-2 ${
                      isMe ? "justify-end" : "justify-start"
                    } ${isSequential ? "mt-1" : "mt-3.5"}`}>
                      
                      {/* Left Avatar (received messages only) */}
                      {!isMe && (
                        <div className="shrink-0 w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
                          {showAvatar ? (
                            <Avatar className="w-8 h-8 rounded-xl border border-outline-variant/20">
                              {currentConv?.other_avatar && <AvatarImage src={currentConv.other_avatar} />}
                              <AvatarFallback className="text-[10px] font-black bg-surface-container">{msg.sender_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-8 h-8" />
                          )}
                        </div>
                      )}

                      {/* Bubble Container */}
                      <div className={`flex flex-col max-w-[85%] sm:max-w-[72%] ${isMe ? "items-end" : "items-start"}`}>
                        {!isMe && showAvatar && (
                          <span className="text-[10px] text-muted-foreground font-semibold mb-1 ml-1">
                            {msg.sender_name}
                          </span>
                        )}

                        {/* WhatsApp / Telegram Styled Bubble */}
                        <div className={`relative px-3.5 py-2.5 rounded-2xl text-[13px] sm:text-xs leading-relaxed transition-all duration-200 shadow-sm ${
                          isMe
                            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-xs shadow-primary/10 ml-auto"
                            : "bg-surface-container-high dark:bg-[#1a1f26] text-foreground rounded-tl-xs border border-outline-variant/30 shadow-sm mr-auto"
                        }`}>
                          {/* Media Attachment (Video or Image) */}
                          {msg.image_url && (
                            <div className="mb-2">
                              {isVideo ? (
                                <div className="relative overflow-hidden rounded-xl bg-black max-w-[280px] sm:max-w-[340px] shadow-sm">
                                  <video
                                    src={msg.image_url}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    className="w-full max-h-72 object-contain rounded-xl"
                                  />
                                </div>
                              ) : (
                                <a href={msg.image_url} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden rounded-xl group">
                                  <img
                                    src={msg.image_url}
                                    alt="attachment"
                                    className="max-w-[240px] sm:max-w-[320px] rounded-xl object-cover shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
                                  />
                                </a>
                              )}
                            </div>
                          )}

                          {/* Message Body */}
                          {msg.body && (
                            <p className="whitespace-pre-wrap break-words leading-relaxed select-text pr-2">
                              {msg.body}
                            </p>
                          )}

                          {/* WhatsApp / Telegram Metadata Row: Time & Delivery / Seen Receipts */}
                          <div className={`flex items-center gap-1.5 justify-end pt-1 -mb-0.5 select-none ${
                            isMe ? "text-primary-foreground/75" : "text-muted-foreground/75"
                          }`}>
                            <span className="text-[10px] tracking-tight font-medium">
                              {formatTime(msg.created_at)}
                            </span>
                            {isMe && (
                              <span className="inline-flex items-center ml-0.5" title={msg.is_read ? "Seen" : "Sent"}>
                                {msg.isOptimistic ? (
                                  <Clock className="w-3 h-3 text-primary-foreground/60" />
                                ) : msg.is_read ? (
                                  /* WhatsApp / Telegram Seen Receipt: Vibrant Sky Blue Double Check */
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-300 stroke-[2.8]" />
                                ) : (
                                  /* Sent Receipt: 1 Checkmark */
                                  <Check className="w-3.5 h-3.5 text-primary-foreground/75 stroke-[2.4]" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md shrink-0 z-10">
              {error && (
                <div className="mb-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-400 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="hover:text-rose-300 font-bold shrink-0">×</button>
                </div>
              )}

              {/* Media Preview Box (Supports Video & Photo) */}
              {mediaPreview && (
                <div className="mb-3 inline-flex relative shrink-0">
                  {mediaType === "video" ? (
                    <div className="relative h-20 w-32 rounded-xl overflow-hidden border border-outline-variant/30 shadow-md bg-black flex items-center justify-center">
                      <video src={mediaPreview} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                        <Play className="w-6 h-6 text-white drop-shadow" />
                      </div>
                    </div>
                  ) : (
                    <img src={mediaPreview} alt="preview" className="h-16 w-16 object-cover rounded-xl border border-outline-variant/30 shadow-md" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <button onClick={clearMedia} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm active:scale-90 transition-transform">
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/40 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all duration-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="p-2 hover:bg-surface-container-high text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200 shrink-0"
                  title="Attach photo or video"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/mp4,video/webm,video/quicktime,video/ogg"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm focus:outline-none min-w-0 py-1 px-1.5 placeholder:text-muted-foreground/45 text-foreground"
                />

                <button className="p-2 hover:bg-surface-container-high text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200 shrink-0">
                  <Smile className="w-4 h-4" />
                </button>

                <Button
                  onClick={sendMessage}
                  disabled={sending || uploading || (!text.trim() && !mediaFile)}
                  size="sm"
                  className="rounded-xl h-9 px-4 gap-1.5 text-xs font-bold shadow-md shadow-primary/10 active:scale-[0.98] transition-transform duration-200"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>

              <p className="text-center text-[9px] text-muted-foreground/60 font-semibold mt-2 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-muted-foreground/45" />
                Sharing contact details is strictly against security policies
              </p>
            </div>
          </>
        ) : (
          /* Empty Chat Pane */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 opacity-70 bg-surface-container-low/10"
               style={{
                 backgroundImage: "radial-gradient(circle, var(--color-outline-variant) 0.6px, transparent 0.6px)",
                 backgroundSize: "24px 24px",
               }}>
            <div className="w-16 h-16 rounded-[1.25rem] bg-surface-container flex items-center justify-center border border-outline-variant/30 shadow-sm">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Communications Workspace</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                Select a conversation thread from the inbox list to read and write messages.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ── PANE 3: Participant Semi-Profile Slide Drawer (Mobile Slide-Over & Desktop Sidebar) ── */}
      {conversationId && (
        <>
          {/* Mobile Overlay Backdrop */}
          {showRightPane && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
              onClick={() => setShowRightPane(false)}
            />
          )}

          <div
            className={`flex flex-col border-l border-outline-variant/20 bg-surface-container-lowest shrink-0 overflow-y-auto transition-all duration-300 ease-in-out
              fixed inset-y-0 right-0 z-50 w-[85vw] max-w-[360px] h-full shadow-2xl
              lg:static lg:h-auto lg:z-20
              ${
                showRightPane
                  ? "translate-x-0 opacity-100 lg:w-[330px] lg:xl:w-[350px] pointer-events-auto"
                  : "translate-x-full opacity-0 pointer-events-none lg:w-0 lg:border-none lg:overflow-hidden"
              }
            `}
          >
            <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/50 flex items-center justify-between shrink-0">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Participant Profile</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-bold text-muted-foreground h-7 hover:text-foreground hover:bg-surface-container rounded-lg gap-1 px-2"
                onClick={() => setShowRightPane(false)}
              >
                <X className="w-3.5 h-3.5" />
                Close
              </Button>
            </div>

          {loadingOtherProfile ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : otherWorkerProfile ? (
            /* WOKER PROFILE DISPLAY (Visible to Client) */
            <div className="p-5 space-y-5 animate-in fade-in duration-300">
              
              {/* Profile Card Header */}
              <div className="flex flex-col items-center text-center space-y-3">
                <Avatar className="w-20 h-20 border border-outline-variant/20 rounded-2xl shadow-sm">
                  {otherWorkerProfile.avatar_url && (
                    <AvatarImage src={otherWorkerProfile.avatar_url} className="object-cover" />
                  )}
                  <AvatarFallback className="text-xl font-bold bg-surface-container">
                    {otherWorkerProfile.full_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-1 justify-center text-foreground">
                    {otherWorkerProfile.full_name}
                    {otherWorkerProfile.is_verified && (
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                    {currentConv?.other_skill || "Professional"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-0.5 bg-primary/10 text-primary border-none py-0.5 px-2 rounded-full font-black text-[10px]">
                    <Star size={9} className="fill-primary stroke-none" />
                    <span>{Number(otherWorkerProfile.avg_rating || 0).toFixed(1)}</span>
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    ({otherWorkerProfile.total_ratings || 0} reviews)
                  </span>
                </div>
              </div>

              {/* DIRECT START HIRING BUTTON */}
              <div className="pt-1">
                <Button asChild className="w-full rounded-2xl h-11 font-bold uppercase tracking-wider text-xs shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200">
                  <Link href={`/client/contract/new?workerId=${otherWorkerProfile.id}`}>
                    <FileText size={14} className="mr-1.5" />
                    Start Hiring Worker
                  </Link>
                </Button>
              </div>

              <Separator className="bg-outline-variant/20" />

              {/* Bio */}
              <div className="space-y-1.5">
                <h5 className="text-[11px] font-bold text-foreground/85 uppercase tracking-wider">About</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {otherWorkerProfile.bio || "No professional overview bio provided by this worker."}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-foreground/85 uppercase tracking-wider">Skills</h5>
                <div className="flex flex-wrap gap-1.5">
                  {(otherWorkerProfile.skills || []).map((skill, i) => (
                    <Badge key={i} variant="outline" className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground border-outline-variant bg-surface-container-low/40">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Technical Cert info */}
              <div className="border border-outline-variant/20 bg-surface-container-low/30 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Credential Status</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Fayda Identity &amp; Professional COC Verification are approved for this worker.
                </p>
              </div>

            </div>
          ) : (
            /* CLIENT PROFILE CARD / GENERAL CARD (Visible to Worker, or fallback) */
            <div className="p-5 space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-col items-center text-center space-y-3">
                <Avatar className="w-16 h-16 border border-outline-variant/20 rounded-2xl shadow-sm animate-float">
                  {currentConv?.other_avatar && (
                    <AvatarImage src={currentConv.other_avatar} className="object-cover" />
                  )}
                  <AvatarFallback className="text-lg font-bold bg-surface-container">
                    {currentConv?.other_name.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="text-sm font-bold text-foreground">{currentConv?.other_name}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                    {role === "worker" ? "Client" : "User"}
                  </p>
                </div>
                
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 animate-pulse" /> Verified Partner
                </span>
              </div>

              <Separator className="bg-outline-variant/20" />

              <div className="border border-outline-variant/20 bg-surface-container-low/30 rounded-2xl p-4 space-y-2.5">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Account Role</p>
                  <p className="text-xs font-bold text-foreground">Client Member</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Location Jurisdiction</p>
                  <p className="text-xs font-bold text-foreground">Dire Dawa District</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Security Backing</p>
                  <p className="text-xs font-bold text-foreground">Escrow-backed Contracts</p>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground leading-normal text-center italic mt-4">
                Use escrow payment terms to verify budget release before starting work on active contracts.
              </p>
            </div>
          )}

        </div>
        </>
      )}

    </div>
  );
}
