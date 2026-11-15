"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/context/LanguageContext";
import {
  RiSearch2Line,
  RiAddLine,
  RiArrowLeftLine,
  RiMoreFill,
  RiCheckDoubleLine,
  RiCheckLine,
  RiMicLine,
  RiSendPlaneFill,
  RiAttachmentLine,
  RiImageLine,
  RiVideoLine,
  RiFileTextLine,
  RiCloseLine,
  RiShieldCheckFill,
  RiUser3Line,
  RiSparklingFill,
  RiLockLine,
  RiExternalLinkLine,
  RiAlertLine,
  RiScales3Line,
} from "@remixicon/react";
import { playNotificationSound } from "@/lib/sound";
import { filterContactInfo } from "@/lib/filterContactInfo";

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
  media_type?: "image" | "video" | "audio" | "file" | null;
  is_read?: boolean;
  read_at?: string | null;
  created_at: string;
  sender_name: string;
  sender_avatar: string | null;
  isOptimistic?: boolean;
  is_system?: boolean;
  event_type?: string | null;
  action_url?: string | null;
  metadata?: any;
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
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function UnifiedChatWorkspace({ role, conversationId }: UnifiedChatWorkspaceProps) {
  const router = useRouter();
  const { t } = useLanguage();

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
  const [fileName, setFileName] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | "file">("image");
  const [uploading, setUploading] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Quoted reply state (matches attached design)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Search & visual toggles
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRightPane, setShowRightPane] = useState(false);

  // Proactive contact info filter check
  const contentFilter = text.trim() ? filterContactInfo(text) : { blocked: false };
  const isBlocked = contentFilter.blocked;
  const blockedReason = contentFilter.reason;

  const bottomRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    if (role === "client" && currentConv.other_user_id) {
      setLoadingOtherProfile(true);
      fetch(`/api/workers/${currentConv.other_user_id}`)
        .then((r) => (r.ok ? r.json() : null))
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

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video" | "file"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaType(type);
    setMediaFile(file);
    setFileName(file.name);

    if (type === "image" || type === "video") {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
    }
  };

  const clearMedia = () => {
    setMediaPreview(null);
    setMediaFile(null);
    setFileName(null);
    setMediaType("image");
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Voice Recording Logic ──
  const startVoiceRecording = async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setError("Audio recording is not supported in this browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Please allow microphone access to record voice notes.");
    }
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const sendVoiceRecording = async () => {
    if (!mediaRecorderRef.current) return;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    const recorder = mediaRecorderRef.current;
    recorder.onstop = async () => {
      recorder.stream.getTracks().forEach((track) => track.stop());
      const mimeType = recorder.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      if (audioBlob.size === 0) {
        setIsRecording(false);
        return;
      }
      const ext = mimeType.includes("ogg") ? ".ogg" : mimeType.includes("mp4") ? ".m4a" : ".webm";
      const audioFile = new File([audioBlob], `voice_${Date.now()}${ext}`, { type: mimeType });

      await uploadAndSendAudio(audioFile);
      setIsRecording(false);
      setRecordingDuration(0);
    };

    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const uploadAndSendAudio = async (audioFile: File) => {
    if (!conversationId) return;
    setSending(true);
    setUploading(true);
    setError(null);

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      sender_id: myProfile?.id || "me",
      body: "🎙️ Voice note",
      image_url: URL.createObjectURL(audioFile),
      media_type: "audio",
      created_at: new Date().toISOString(),
      sender_name: myProfile?.name || "You",
      sender_avatar: null,
      is_read: false,
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const fd = new FormData();
      fd.append("file", audioFile);
      const uploadRes = await fetch("/api/private-upload", { method: "POST", body: fd });
      if (!uploadRes.ok) {
        throw new Error("Failed to upload voice note.");
      }
      const uploadData = await uploadRes.json();

      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: "🎙️ Voice note",
          imageUrl: uploadData.url,
          mediaType: "audio",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send voice note.");
      }

      await fetchMessages();
      fetchConversations();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("messages:refresh"));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send voice message.");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (sending || uploading) return;
    const pendingBody = text.trim();
    if (!pendingBody && !mediaFile) return;

    if (pendingBody) {
      const check = filterContactInfo(pendingBody);
      if (check.blocked) {
        setError(check.reason || "Sharing external links or phone numbers is prohibited.");
        return;
      }
    }

    setSending(true);
    setError(null);

    // Format body with reply quote if replying
    let finalBody = pendingBody;
    if (replyingTo && pendingBody) {
      finalBody = `> ${replyingTo.sender_name}: ${replyingTo.body || "Attachment"}\n${pendingBody}`;
    }

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      sender_id: myProfile?.id || "me",
      body: finalBody || null,
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
    setReplyingTo(null);

    if (conversationId) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                last_body: pendingBody || (mediaType === "video" ? "🎥 Video" : mediaType === "file" ? "📄 Document" : mediaType === "audio" ? "🎙️ Voice note" : "📷 Photo"),
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
        const uploadRes = await fetch("/api/private-upload", { method: "POST", body: fd });
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
          body: finalBody || null,
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

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.other_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.last_body && c.last_body.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [conversations, searchQuery]);

  // Derived recent contacts for stories / active avatar carousel (matching Image 1)
  const recentStoryContacts = useMemo(() => {
    const list = conversations.slice(0, 6);
    return list;
  }, [conversations]);

  const otherInitials = currentConv?.other_name
    ? currentConv.other_name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "DS";

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] w-full bg-background-primary-default overflow-hidden text-text-primary">
      {/* ── PANE 1: Left Panel (Messages List matching Image 1: Mengobrol UI) ── */}
      <div
        className={`w-full md:w-[360px] lg:w-[390px] flex flex-col border-r border-border-button-default bg-background-primary-default shrink-0 transition-all ${
          conversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Top Header Row: Big Bold Title + Search Button */}
        <div className="p-5 pb-3 flex items-center justify-between shrink-0">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
            {t("nav.chat") || "Messages"}
          </h1>
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((open) => {
                if (!open) setTimeout(() => searchInputRef.current?.focus(), 100);
                else setSearchQuery("");
                return !open;
              });
            }}
            className="w-10 h-10 rounded-full border border-border-button-default bg-background-secondary-default text-text-primary hover:bg-background-secondary-hover flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            aria-label="Search messages"
          >
            {isSearchOpen ? <RiCloseLine className="w-5 h-5" /> : <RiSearch2Line className="w-5 h-5" />}
          </button>
        </div>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <div className="px-5 pb-3">
            <div className="relative flex items-center rounded-full border border-border-button-default bg-background-secondary-default px-4 py-1.5 shadow-inner">
              <RiSearch2Line className="w-4 h-4 text-text-tertiary shrink-0" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations by name or message..."
                className="w-full h-9 px-3 bg-transparent text-xs font-semibold text-text-primary placeholder:text-text-placeholder outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-text-secondary hover:text-text-primary"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Active Contacts / "Stories" Carousel (Matching Image 1) ── */}
        <div className="px-5 py-3 border-b border-border-button-default/50 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-4">
            {/* Add Story / New Chat Circle */}
            <button
              type="button"
              onClick={() => {
                if (role === "client") router.push("/client/search");
                else router.push("/worker/jobs");
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-border-button-default group-hover:border-text-primary flex items-center justify-center transition-all active:scale-95 bg-background-secondary-default">
                <RiAddLine className="w-6 h-6 text-text-secondary group-hover:text-text-primary" />
              </div>
              <span className="text-[11px] font-bold text-text-secondary group-hover:text-text-primary">
                Add story
              </span>
            </button>

            {/* Recent Contacts Avatars with First Names */}
            {recentStoryContacts.map((c) => {
              const firstName = c.other_name.split(" ")[0] || "Artisan";
              const initials = c.other_name.slice(0, 2).toUpperCase();
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => router.push(`/${role}/messages/${c.id}`)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full p-0.5 border-2 border-amber-400 dark:border-amber-500 overflow-hidden relative shadow-xs group-hover:scale-105 transition-transform">
                    {c.other_avatar ? (
                      <img src={c.other_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-background-secondary-default flex items-center justify-center font-black text-xs text-text-primary">
                        {initials}
                      </div>
                    )}
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background-primary-default" />
                  </div>
                  <span className="text-[11px] font-bold text-text-secondary group-hover:text-text-primary truncate max-w-[56px]">
                    {firstName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Chats Section Title Row ── */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0">
          <span className="text-sm font-black uppercase tracking-wider text-text-primary">
            Chats
          </span>
          <button
            type="button"
            className="p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-background-secondary-default transition"
            title="Chat Options"
          >
            <RiMoreFill className="w-5 h-5" />
          </button>
        </div>

        {/* ── Conversations List Rows (Matching Image 1) ── */}
        <div className="flex-1 overflow-y-auto divide-y divide-border-button-default/40 pb-20 lg:pb-0">
          {loadingList ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3.5 animate-pulse">
                <div className="w-13 h-13 rounded-full bg-background-secondary-default shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-background-secondary-default rounded w-1/2" />
                  <div className="h-3 bg-background-secondary-default rounded w-3/4" />
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-text-tertiary h-full gap-2">
              <p className="text-xs font-bold">No discussions yet</p>
              <p className="text-[11px] max-w-[200px]">Find an artisan or reply to a job inquiry to start chatting.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === conversationId;
              const hasUnread = Boolean(conv.unread && conv.unread > 0);
              const initials = conv.other_name.slice(0, 2).toUpperCase();

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => router.push(`/${role}/messages/${conv.id}`)}
                  className={`w-full px-5 py-3.5 flex items-center gap-3.5 text-left transition-all active:bg-background-secondary-hover/70 cursor-pointer ${
                    isActive
                      ? "bg-background-secondary-default"
                      : "hover:bg-background-secondary-default/50"
                  }`}
                >
                  {/* Big Circular Avatar with Online Dot */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-border-button-default bg-background-secondary-default shadow-xs">
                      {conv.other_avatar ? (
                        <img src={conv.other_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-black text-text-primary">
                          {initials}
                        </div>
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background-primary-default" />
                  </div>

                  {/* Contact Info & Snippet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-sm font-bold text-text-primary truncate flex items-center gap-1">
                        {conv.other_name}
                        {conv.is_verified && (
                          <RiShieldCheckFill className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </span>
                      <span className="text-[11px] font-medium text-text-tertiary shrink-0">
                        {formatTime(conv.last_at) || timeAgo(conv.last_at)}
                      </span>
                    </div>

                    <p
                      className={`text-xs truncate ${
                        hasUnread
                          ? "text-text-primary font-bold"
                          : "text-text-secondary"
                      }`}
                    >
                      {conv.last_media_type === "video"
                        ? "🎥 Sent a video"
                        : conv.last_image
                        ? "📷 Sent an image"
                        : conv.last_body || "Start messaging..."}
                    </p>
                  </div>

                  {/* Unread Amber / Gold Badge matching Image 1 */}
                  {hasUnread ? (
                    <div className="w-5 h-5 rounded-full bg-[#f5b300] dark:bg-[#eab308] text-zinc-950 text-[11px] font-black flex items-center justify-center shrink-0 shadow-xs">
                      {conv.unread}
                    </div>
                  ) : (
                    <RiCheckDoubleLine className="w-4 h-4 text-text-tertiary shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Floating Bottom Action Pill (Matching Image 1) */}
        <div className="p-4 border-t border-border-button-default/60 flex items-center justify-center shrink-0 sm:hidden">
          <button
            type="button"
            onClick={() => {
              if (role === "client") router.push("/client/search");
              else router.push("/worker/jobs");
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            <RiAddLine className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* ── PANE 2: Middle Panel (Chat Message Thread matching Image 2) ── */}
      <div
        className={`flex-1 flex flex-col bg-background-primary-default transition-all ${
          !conversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {conversationId ? (
          <>
            {/* Header: Back button + Avatar + Name + Online + Call Icons */}
            <div className="h-16 border-b border-border-button-default bg-background-primary-default/95 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => router.push(`/${role}/messages`)}
                  className="md:hidden w-9 h-9 rounded-full border border-border-button-default flex items-center justify-center text-text-primary hover:bg-background-secondary-default active:scale-95 transition shrink-0"
                  aria-label="Back to messages"
                >
                  <RiArrowLeftLine className="w-5 h-5" />
                </button>

                <div
                  onClick={() => setShowRightPane((prev) => !prev)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border-button-default bg-background-secondary-default">
                      {currentConv?.other_avatar ? (
                        <img src={currentConv.other_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-text-primary">
                          {otherInitials}
                        </div>
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background-primary-default" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-black text-text-primary group-hover:text-emerald-600 transition-colors truncate">
                        {currentConv?.other_name || "Artisan Chat"}
                      </span>
                      {currentConv?.is_verified && (
                        <RiShieldCheckFill className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Online</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Right Action Icon: Details */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowRightPane(!showRightPane)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
                    showRightPane
                      ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950"
                      : "hover:bg-background-secondary-default text-text-secondary hover:text-text-primary"
                  }`}
                  title="Participant Profile"
                >
                  <RiUser3Line className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Message Area (Matching Image 2) ── */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-3.5 bg-background-primary-default">
              {/* Date Separator Pill: Today */}
              <div className="flex justify-center pb-2">
                <span className="px-4 py-1 rounded-full bg-background-secondary-default text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
                  Today
                </span>
              </div>

              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-2 text-text-tertiary">
                  <p className="text-xs font-bold">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  if (msg.is_system) {
                    let meta: any = {};
                    if (typeof msg.metadata === "object" && msg.metadata !== null) meta = msg.metadata;
                    else if (typeof msg.metadata === "string") {
                      try {
                        meta = JSON.parse(msg.metadata);
                      } catch {
                        meta = {};
                      }
                    }
                    const actionUrl = msg.action_url || meta.actionUrl;
                    const eventTitle = meta.title || "Legal Milestone Notice";
                    const eventDesc = meta.description || msg.body;

                    return (
                      <div key={msg.id} className="my-5 flex justify-center w-full px-2">
                        <div className="w-full max-w-sm sm:max-w-md rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 shadow-xs text-center flex flex-col items-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-wider uppercase mb-2">
                            <RiScales3Line className="w-3.5 h-3.5" />
                            <span>DireSkill Milestone Event</span>
                          </div>
                          <h4 className="text-sm font-bold text-text-primary mb-1">{eventTitle}</h4>
                          <p className="text-xs text-text-secondary leading-relaxed mb-3">{eventDesc}</p>
                          {actionUrl && (
                            <Link
                              href={actionUrl}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow-sm active:scale-95 transition"
                            >
                              <span>View Contract</span>
                              <RiExternalLinkLine className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const isMe =
                    myProfile && msg.sender_id
                      ? msg.sender_id.toLowerCase() === myProfile.id.toLowerCase()
                      : false;

                  const isVideo =
                    msg.media_type === "video" ||
                    Boolean(msg.image_url?.match(/\.(mp4|webm|mov|ogg)($|\?)/i)) ||
                    Boolean(msg.image_url?.includes("/video/"));

                  // Check if message contains a quoted reply line
                  const hasQuote = msg.body && msg.body.startsWith("> ");
                  let quoteSnippet = "";
                  let cleanBody = msg.body || "";
                  if (hasQuote && msg.body) {
                    const newlineIdx = msg.body.indexOf("\n");
                    if (newlineIdx !== -1) {
                      quoteSnippet = msg.body.slice(2, newlineIdx);
                      cleanBody = msg.body.slice(newlineIdx + 1);
                    }
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} group/msg`}
                    >
                      {/* Bubble Container */}
                      <div
                        onClick={() => setReplyingTo(msg)}
                        className={`relative px-4.5 py-3 rounded-3xl text-sm leading-relaxed max-w-[85%] sm:max-w-[72%] shadow-xs transition-all cursor-pointer ${
                          isMe
                            ? "bg-[#f5b300] dark:bg-[#eab308] text-zinc-950 rounded-tr-sm font-medium"
                            : "bg-background-secondary-default text-text-primary rounded-tl-sm border border-border-button-default/50"
                        }`}
                        title="Click to reply"
                      >
                        {/* Quoted Reply Sub-bubble (Matching Image 2) */}
                        {quoteSnippet && (
                          <div
                            className={`mb-2 pl-3 py-1 border-l-2 text-xs rounded-r-lg ${
                              isMe
                                ? "border-zinc-900/40 bg-black/10 text-zinc-900"
                                : "border-emerald-500 bg-background-primary-default text-text-secondary"
                            }`}
                          >
                            <p className="line-clamp-2 italic">{quoteSnippet}</p>
                          </div>
                        )}

                        {/* Media Attachment */}
                        {msg.image_url && (
                          <div className="mb-2">
                            {isVideo ? (
                              <video
                                src={msg.image_url}
                                controls
                                playsInline
                                className="w-full max-h-72 object-contain rounded-2xl"
                              />
                            ) : msg.media_type === "audio" || msg.image_url?.match(/\.(webm|ogg|mp3|wav|m4a)($|\?)/i) ? (
                              <div className="flex items-center gap-2 py-1">
                                <audio
                                  src={msg.image_url}
                                  controls
                                  className="w-full max-w-[240px] sm:max-w-[280px] h-9 rounded-full accent-zinc-950 dark:accent-white"
                                />
                              </div>
                            ) : msg.media_type === "file" || msg.image_url?.endsWith(".pdf") ? (
                              <a
                                href={msg.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2.5 p-3 rounded-2xl border transition ${
                                  isMe
                                    ? "bg-black/10 border-black/15 text-zinc-950 hover:bg-black/20"
                                    : "bg-background-primary-default border-border-button-default text-text-primary hover:bg-background-secondary-hover"
                                }`}
                              >
                                <RiFileTextLine className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <div className="text-left text-xs truncate">
                                  <span className="font-bold block truncate">Attached Document</span>
                                  <span className="text-[10px] opacity-75">Click to view/download</span>
                                </div>
                              </a>
                            ) : (
                              <img
                                src={msg.image_url}
                                alt="Attachment"
                                className="max-w-[260px] sm:max-w-[340px] rounded-2xl object-cover"
                              />
                            )}
                          </div>
                        )}

                        {/* Body text */}
                        {cleanBody && <p className="whitespace-pre-wrap break-words">{cleanBody}</p>}
                      </div>

                      {/* Underneath Status Note: Delivered / Time */}
                      <div className="flex items-center gap-1.5 pt-1 px-1 text-[11px] text-text-tertiary">
                        <span>{formatTime(msg.created_at)}</span>
                        {isMe && (
                          <span className="font-medium text-text-secondary">
                            {msg.is_read ? "Seen" : "Delivered"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Input Footer (Matching Image 2: + Pill Bar) ── */}
            <div className="p-3 sm:p-4 border-t border-border-button-default bg-background-primary-default shrink-0">
              {/* Anti-Circumvention Policy Warning */}
              {isBlocked && (
                <div className="mb-2.5 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-500">
                  <RiAlertLine className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium leading-relaxed">{blockedReason}</p>
                </div>
              )}

              {error && (
                <div className="mb-2.5 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between text-xs text-red-500">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="font-bold">
                    ×
                  </button>
                </div>
              )}

              {/* Replying Banner */}
              {replyingTo && (
                <div className="mb-2 px-4 py-2 bg-background-secondary-default rounded-2xl flex items-center justify-between text-xs border border-border-button-default">
                  <div className="truncate">
                    <span className="font-bold text-text-primary">Replying to {replyingTo.sender_name}:</span>{" "}
                    <span className="text-text-secondary italic">{replyingTo.body || "Media"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="p-1 hover:text-text-primary"
                  >
                    <RiCloseLine className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Media Preview before send */}
              {mediaFile && (
                <div className="mb-2 relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-background-secondary-default border border-border-button-default max-w-sm">
                  {mediaType === "image" && mediaPreview ? (
                    <img src={mediaPreview} alt="Preview" className="h-14 w-14 rounded-xl object-cover" />
                  ) : mediaType === "video" && mediaPreview ? (
                    <video src={mediaPreview} className="h-14 w-20 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <RiFileTextLine className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 pr-6">
                    <p className="text-xs font-bold text-text-primary truncate">{fileName || "Selected Attachment"}</p>
                    <p className="text-[10px] text-text-tertiary">Ready to send</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearMedia}
                    className="absolute top-2 right-2 p-1 rounded-full bg-background-primary-default border border-border-button-default text-text-secondary hover:text-text-primary"
                  >
                    <RiCloseLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Hidden Specialized File Inputs */}
              <input
                type="file"
                ref={photoInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, "image")}
              />
              <input
                type="file"
                ref={videoInputRef}
                className="hidden"
                accept="video/*"
                onChange={(e) => handleFileSelect(e, "video")}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => handleFileSelect(e, "file")}
              />

              {/* ── Slide-out Attachment Choice Menu ── */}
              <div className="relative">
                <AnimatePresence>
                  {isAttachMenuOpen && (
                    <>
                      <div
                        onClick={() => setIsAttachMenuOpen(false)}
                        className="fixed inset-0 z-20 bg-transparent"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 350 }}
                        className="absolute bottom-16 left-0 z-30 w-64 rounded-3xl bg-background-primary-default border border-border-button-default shadow-2xl p-2.5 space-y-1"
                      >
                        {/* Option 1: Photo */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsAttachMenuOpen(false);
                            photoInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-background-secondary-default text-text-primary transition text-left cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <RiImageLine className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">Photo</p>
                            <p className="text-[10px] text-text-tertiary">Gallery, Camera, PNG, JPG</p>
                          </div>
                        </button>

                        {/* Option 2: Video */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsAttachMenuOpen(false);
                            videoInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-background-secondary-default text-text-primary transition text-left cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <RiVideoLine className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">Video</p>
                            <p className="text-[10px] text-text-tertiary">MP4, WebM, MOV clip</p>
                          </div>
                        </button>

                        {/* Option 3: Document / File */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsAttachMenuOpen(false);
                            fileInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-background-secondary-default text-text-primary transition text-left cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <RiFileTextLine className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">Document / File</p>
                            <p className="text-[10px] text-text-tertiary">PDF, Spec sheets, blueprints</p>
                          </div>
                        </button>

                        {/* Option 4: Voice Note */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsAttachMenuOpen(false);
                            startVoiceRecording();
                          }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-background-secondary-default text-text-primary transition text-left cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <RiMicLine className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">Voice Note</p>
                            <p className="text-[10px] text-text-tertiary">Record & send voice audio</p>
                          </div>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {/* Main Input Row matching Image 2 */}
                {isRecording ? (
                  <div className="flex items-center justify-between gap-3 bg-background-secondary-default border border-rose-500/40 rounded-full px-4 py-2 w-full animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <span className="size-3 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-xs font-bold text-rose-500">
                        Recording {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelVoiceRecording}
                        className="px-3 py-1.5 rounded-full text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-background-primary-default transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={sendVoiceRecording}
                        disabled={sending || uploading}
                        className="size-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer disabled:opacity-50"
                        title="Send voice note"
                      >
                        {sending || uploading ? (
                          <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RiSendPlaneFill className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* + Attachment Button (Toggles Slide-out Menu) */}
                    <button
                      type="button"
                      onClick={() => setIsAttachMenuOpen((prev) => !prev)}
                      className={`w-11 h-11 rounded-full border border-border-button-default flex items-center justify-center shrink-0 transition active:scale-95 cursor-pointer ${
                        isAttachMenuOpen
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 rotate-45"
                          : "bg-background-secondary-default hover:bg-background-secondary-hover text-text-primary"
                      }`}
                      title="Attach photo, video or file"
                    >
                      <RiAddLine className="w-5 h-5 transition-transform" />
                    </button>

                    {/* Wide Rounded Pill Input Field */}
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a message..."
                        className="w-full h-12 bg-background-secondary-default border border-border-button-default rounded-full px-5 text-sm font-medium text-text-primary placeholder:text-text-placeholder outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring transition-all"
                      />
                    </div>

                    {/* Right Action: Send when text entered, Mic when empty */}
                    {text.trim() || mediaFile ? (
                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={sending || uploading}
                        className="w-12 h-12 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shrink-0 active:scale-95 transition shadow-sm hover:scale-105 cursor-pointer disabled:opacity-50"
                        aria-label="Send message"
                      >
                        {sending || uploading ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RiSendPlaneFill className="w-5 h-5" />
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startVoiceRecording}
                        className="w-12 h-12 rounded-full bg-background-secondary-default hover:bg-background-secondary-hover text-text-secondary hover:text-text-primary flex items-center justify-center shrink-0 transition active:scale-95 cursor-pointer"
                        title="Record Voice Note"
                      >
                        <RiMicLine className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty Chat Placeholder (Desktop) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-background-secondary-default flex items-center justify-center text-text-tertiary">
              <RiSendPlaneFill className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Your Direct Chat Workspace</h3>
            <p className="text-xs text-text-secondary max-w-sm">
              Select a client or artisan from the left to review contract terms, share milestone updates, and negotiate directly.
            </p>
          </div>
        )}
      </div>

      {/* ── PANE 3: Slide-over Participant Details Drawer (Full slide right-to-left on mobile) ── */}
      <AnimatePresence>
        {showRightPane && currentConv && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRightPane(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />

            {/* Sliding Drawer: Full screen width on mobile (100% width, sliding right-to-left), Fixed sidebar on desktop */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:max-w-md md:static md:w-[340px] md:translate-x-0 border-l border-border-button-default bg-background-primary-default p-6 space-y-6 overflow-y-auto z-50 md:z-20 shrink-0 shadow-2xl md:shadow-none flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border-button-default">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRightPane(false)}
                    className="md:hidden p-1.5 -ml-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-background-secondary-default"
                    aria-label="Back to chat"
                  >
                    <RiArrowLeftLine className="w-5 h-5" />
                  </button>
                  <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">
                    Participant Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRightPane(false)}
                  className="p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-background-secondary-default"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border-button-default">
                  {currentConv.other_avatar ? (
                    <img src={currentConv.other_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-background-secondary-default flex items-center justify-center font-black text-lg">
                      {otherInitials}
                    </div>
                  )}
                </div>
                <h4 className="text-base font-black text-text-primary">{currentConv.other_name}</h4>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500">
                  <RiShieldCheckFill className="w-4 h-4" />
                  DireSkill Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-background-secondary-default border border-border-button-default space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Location</span>
                  <span className="font-bold text-text-primary">Dire Dawa, ET</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Contract Status</span>
                  <span className="font-bold text-emerald-500">Milestone Protected</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={role === "worker" ? "/worker/gigs" : "/client/contracts"}
                  className="w-full py-3 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
                >
                  <span>View Milestone Contract</span>
                  <RiExternalLinkLine className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
