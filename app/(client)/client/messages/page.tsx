"use client";

const MOCK_CONVERSATIONS = [
  {
    id: "1",
    name: "Ahmed Tesfaye",
    role: "Master Plumber",
    avatar: null,
    initials: "AT",
    lastMessage: "I'll be there by 10am tomorrow. Please make sure the main valve is accessible.",
    time: "2m ago",
    unread: 2,
    online: true,
    status: "active",
  },
  {
    id: "2",
    name: "Selamawit Kebede",
    role: "Electrician",
    avatar: null,
    initials: "SK",
    lastMessage: "The wiring repair is complete. Can you confirm the circuit is working?",
    time: "1h ago",
    unread: 0,
    online: true,
    status: "completed",
  },
  {
    id: "3",
    name: "Dawit Berhanu",
    role: "Painter",
    avatar: null,
    initials: "DB",
    lastMessage: "Thank you for the great rating! Looking forward to working with you again.",
    time: "3h ago",
    unread: 0,
    online: false,
    status: "completed",
  },
  {
    id: "4",
    name: "Muna Ibrahim",
    role: "Satellite Dish Expert",
    avatar: null,
    initials: "MI",
    lastMessage: "I have the materials ready. Shall we schedule for this weekend?",
    time: "Yesterday",
    unread: 1,
    online: false,
    status: "pending",
  },
];

export default function MessagesPage() {
  return (
    <div className="space-y-6 pb-28 md:pb-10">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
            Messages
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Your conversations with professionals
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full h-12 pl-11 pr-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-white text-sm font-medium placeholder:text-zinc-600 focus:outline-none focus:border-green-400/40 transition-all"
        />
      </div>

      {/* ── Conversations List ── */}
      <div className="space-y-3">
        {MOCK_CONVERSATIONS.map((conv) => (
          <button
            key={conv.id}
            className="w-full group bg-zinc-900/60 border border-white/5 hover:border-green-400/20 rounded-[1.75rem] p-4 md:p-5 flex items-center gap-4 text-left transition-all duration-300"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base ${
                conv.unread > 0 ? "bg-green-400/15 border border-green-400/30 text-green-400" : "bg-zinc-800 border border-white/5 text-zinc-400"
              }`}>
                {conv.initials}
              </div>
              {conv.online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-[#09090b] rounded-full" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black tracking-tight ${conv.unread > 0 ? "text-white" : "text-zinc-300"}`}>
                    {conv.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest hidden md:block ${
                    conv.status === "active" ? "bg-green-400/10 text-green-400" :
                    conv.status === "pending" ? "bg-yellow-400/10 text-yellow-500" :
                    "bg-zinc-800 text-zinc-600"
                  }`}>
                    {conv.status}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-600 font-medium shrink-0 ml-2">{conv.time}</span>
              </div>
              <p className="text-xs text-zinc-600 font-medium mb-1">{conv.role}</p>
              <p className={`text-xs truncate ${conv.unread > 0 ? "text-zinc-300 font-semibold" : "text-zinc-600 font-medium"}`}>
                {conv.lastMessage}
              </p>
            </div>

            {/* Badge */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              {conv.unread > 0 ? (
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-black text-black">{conv.unread}</span>
                </div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-700 group-hover:text-zinc-500 transition-colors">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ── Coming Soon Banner ── */}
      <div className="relative overflow-hidden bg-green-400/5 border border-green-400/15 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-400/10 blur-[60px] pointer-events-none rounded-full" />
        <div className="relative z-10 w-14 h-14 bg-zinc-900 border border-green-400/20 rounded-2xl flex items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-base font-black text-white tracking-tight mb-1">Real-time Chat Coming Soon</h3>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed">
            Full real-time messaging with file sharing, voice notes, and job confirmations is being built.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-400/10 border border-green-400/20 rounded-xl">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">In Development</span>
          </div>
        </div>
      </div>
    </div>
  );
}
