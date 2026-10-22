"use client";

import React, { useState, useTransition } from "react";
import { 
  Megaphone, MessageSquare, HelpCircle, Star, Plus, 
  Trash2, Edit, Check, Eye, EyeOff, Search, AlertCircle, 
  Sparkles, CheckCircle2, ChevronRight, X
} from "lucide-react";
import { 
  createLandingFaq, updateLandingFaq, deleteLandingFaq, toggleLandingFaq,
  createLandingTestimonial, updateLandingTestimonial, deleteLandingTestimonial, toggleLandingTestimonial,
  createOfficialAnnouncement 
} from "@/lib/actions/content-management";
import { removeCommunityPost } from "@/lib/actions/community";

interface FaqItem {
  id: string;
  topic: string;
  question: string;
  answer: string;
  takeaway?: string | null;
  language: string;
  sortOrder: number;
  isActive: boolean;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  trade: string;
  jobs: string;
  quote: string;
  language: string;
  avatarBg?: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface PostItem {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  likesCount: number;
  flagsCount: number;
  isRemoved: boolean;
}

interface Props {
  initialFaqs: FaqItem[];
  initialTestimonials: TestimonialItem[];
  initialPosts: PostItem[];
  canModerate: boolean;
}

export function ContentAdministrationHub({
  initialFaqs,
  initialTestimonials,
  initialPosts,
  canModerate
}: Props) {
  const [activeTab, setActiveTab] = useState<"faqs" | "testimonials" | "feed" | "broadcast">("faqs");

  // FAQ State
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqTopic, setFaqTopic] = useState("");
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqTakeaway, setFaqTakeaway] = useState("");
  const [faqLanguage, setFaqLanguage] = useState("EN");
  const [faqSortOrder, setFaqSortOrder] = useState(0);

  // Testimonial State
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [testName, setTestName] = useState("");
  const [testRole, setTestRole] = useState("");
  const [testTrade, setTestTrade] = useState("Electrician");
  const [testJobs, setTestJobs] = useState("Verified Job");
  const [testQuote, setTestQuote] = useState("");
  const [testLanguage, setTestLanguage] = useState("EN");
  const [testAvatarBg, setTestAvatarBg] = useState("bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-white");
  const [testSortOrder, setTestSortOrder] = useState(0);

  // Feed Moderation State
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [postSearch, setPostSearch] = useState("");
  const [postFilter, setPostFilter] = useState<"all" | "active" | "hidden">("all");

  // Announcement State
  const [annTitle, setAnnTitle] = useState("");
  const [annCategory, setAnnCategory] = useState("Announcements");
  const [annContent, setAnnContent] = useState("");

  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // ── FAQ Handlers ────────────────────────────────────────────────────────────

  const openAddFaqModal = () => {
    setEditingFaq(null);
    setFaqTopic("General");
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqTakeaway("");
    setFaqLanguage("EN");
    setFaqSortOrder(faqs.length + 1);
    setFaqModalOpen(true);
  };

  const openEditFaqModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFaqTopic(faq.topic);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqTakeaway(faq.takeaway || "");
    setFaqLanguage(faq.language);
    setFaqSortOrder(faq.sortOrder);
    setFaqModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqTopic.trim() || !faqQuestion.trim() || !faqAnswer.trim()) {
      setErrorMessage("Topic, question, and answer are required.");
      return;
    }

    startTransition(async () => {
      try {
        if (editingFaq) {
          const res = await updateLandingFaq(editingFaq.id, {
            topic: faqTopic,
            question: faqQuestion,
            answer: faqAnswer,
            takeaway: faqTakeaway,
            language: faqLanguage,
            sortOrder: faqSortOrder,
            isActive: editingFaq.isActive,
          });
          if (res.success) {
            setFaqs((prev) =>
              prev.map((f) =>
                f.id === editingFaq.id
                  ? {
                      ...f,
                      topic: faqTopic,
                      question: faqQuestion,
                      answer: faqAnswer,
                      takeaway: faqTakeaway,
                      language: faqLanguage,
                      sortOrder: faqSortOrder,
                    }
                  : f
              )
            );
            showStatus("FAQ updated successfully.");
            setFaqModalOpen(false);
          } else {
            setErrorMessage(res.error || "Failed to update FAQ.");
          }
        } else {
          const res = await createLandingFaq({
            topic: faqTopic,
            question: faqQuestion,
            answer: faqAnswer,
            takeaway: faqTakeaway,
            language: faqLanguage,
            sortOrder: faqSortOrder,
          });
          if (res.success && res.id) {
            setFaqs((prev) => [
              ...prev,
              {
                id: res.id,
                topic: faqTopic,
                question: faqQuestion,
                answer: faqAnswer,
                takeaway: faqTakeaway,
                language: faqLanguage,
                sortOrder: faqSortOrder,
                isActive: true,
              },
            ]);
            showStatus("New FAQ created and published to landing page.");
            setFaqModalOpen(false);
          } else {
            setErrorMessage(res.error || "Failed to create FAQ.");
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || "An error occurred.");
      }
    });
  };

  const handleToggleFaq = (id: string, currentActive: boolean) => {
    const next = !currentActive;
    startTransition(async () => {
      const res = await toggleLandingFaq(id, next);
      if (res.success) {
        setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, isActive: next } : f)));
        showStatus(`FAQ ${next ? "activated" : "hidden"} on landing page.`);
      }
    });
  };

  const handleDeleteFaq = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this FAQ?")) return;
    startTransition(async () => {
      const res = await deleteLandingFaq(id);
      if (res.success) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        showStatus("FAQ deleted.");
      }
    });
  };

  // ── Testimonial Handlers ────────────────────────────────────────────────────

  const openAddTestimonialModal = () => {
    setEditingTestimonial(null);
    setTestName("");
    setTestRole("Homeowner");
    setTestTrade("Electrician");
    setTestJobs("Verified Job");
    setTestQuote("");
    setTestLanguage("EN");
    setTestSortOrder(testimonials.length + 1);
    setTestimonialModalOpen(true);
  };

  const openEditTestimonialModal = (item: TestimonialItem) => {
    setEditingTestimonial(item);
    setTestName(item.name);
    setTestRole(item.role);
    setTestTrade(item.trade);
    setTestJobs(item.jobs);
    setTestQuote(item.quote);
    setTestLanguage(item.language);
    setTestAvatarBg(item.avatarBg || "bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-white");
    setTestSortOrder(item.sortOrder);
    setTestimonialModalOpen(true);
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || !testRole.trim() || !testQuote.trim()) {
      setErrorMessage("Name, role, and quote are required.");
      return;
    }

    startTransition(async () => {
      try {
        if (editingTestimonial) {
          const res = await updateLandingTestimonial(editingTestimonial.id, {
            name: testName,
            role: testRole,
            trade: testTrade,
            jobs: testJobs,
            quote: testQuote,
            language: testLanguage,
            avatarBg: testAvatarBg,
            sortOrder: testSortOrder,
            isActive: editingTestimonial.isActive,
          });
          if (res.success) {
            setTestimonials((prev) =>
              prev.map((t) =>
                t.id === editingTestimonial.id
                  ? {
                      ...t,
                      name: testName,
                      role: testRole,
                      trade: testTrade,
                      jobs: testJobs,
                      quote: testQuote,
                      language: testLanguage,
                      avatarBg: testAvatarBg,
                      sortOrder: testSortOrder,
                    }
                  : t
              )
            );
            showStatus("Testimonial updated.");
            setTestimonialModalOpen(false);
          }
        } else {
          const res = await createLandingTestimonial({
            name: testName,
            role: testRole,
            trade: testTrade,
            jobs: testJobs,
            quote: testQuote,
            language: testLanguage,
            avatarBg: testAvatarBg,
            sortOrder: testSortOrder,
          });
          if (res.success && res.id) {
            setTestimonials((prev) => [
              ...prev,
              {
                id: res.id,
                name: testName,
                role: testRole,
                trade: testTrade,
                jobs: testJobs,
                quote: testQuote,
                language: testLanguage,
                avatarBg: testAvatarBg,
                sortOrder: testSortOrder,
                isActive: true,
              },
            ]);
            showStatus("Testimonial created and featured on landing page.");
            setTestimonialModalOpen(false);
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to save testimonial.");
      }
    });
  };

  const handleToggleTestimonial = (id: string, currentActive: boolean) => {
    const next = !currentActive;
    startTransition(async () => {
      const res = await toggleLandingTestimonial(id, next);
      if (res.success) {
        setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: next } : t)));
        showStatus(`Testimonial ${next ? "activated" : "hidden"} on landing page.`);
      }
    });
  };

  const handleDeleteTestimonial = (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    startTransition(async () => {
      const res = await deleteLandingTestimonial(id);
      if (res.success) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        showStatus("Testimonial deleted.");
      }
    });
  };

  // ── Feed Post Moderation ────────────────────────────────────────────────────

  const handleTogglePostRemove = (postId: string, currentRemoved: boolean) => {
    const next = !currentRemoved;
    const reason = window.prompt(next ? "Reason for hiding this post:" : "Reason for restoring this post:")?.trim();
    if (!reason) {
      alert("A moderation reason is required for audit logs.");
      return;
    }

    startTransition(async () => {
      const res = await removeCommunityPost(postId, next, reason);
      if (res.success) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isRemoved: next } : p)));
        showStatus(`Post ${next ? "hidden" : "restored"}.`);
      } else {
        alert(res.error || "Failed to update post status.");
      }
    });
  };

  // ── Announcement Handler ────────────────────────────────────────────────────

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      setErrorMessage("Announcement title and content are required.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createOfficialAnnouncement({
          title: annTitle,
          content: annContent,
          category: annCategory,
        });

        if (res.success && res.postId) {
          showStatus("Official announcement published to community feed.");
          setAnnTitle("");
          setAnnContent("");
          setActiveTab("feed");
        } else {
          setErrorMessage(res.error || "Failed to post announcement.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to post announcement.");
      }
    });
  };

  const filteredPosts = posts.filter((p) => {
    const q = postSearch.toLowerCase();
    const matchesQ =
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q);
    const matchesF =
      postFilter === "all" ||
      (postFilter === "active" && !p.isRemoved) ||
      (postFilter === "hidden" && p.isRemoved);
    return matchesQ && matchesF;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-white/10 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sans tracking-tight">Content Administration & Landing Portal</h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Control landing page FAQs, manage public testimonials, moderate community feeds, and broadcast official platform bulletins.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-black/50 p-1.5 rounded-xl border border-white/10 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("faqs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "faqs" ? "bg-white text-black font-bold shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            Landing FAQs ({faqs.length})
          </button>
          <button
            onClick={() => setActiveTab("testimonials")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "testimonials" ? "bg-white text-black font-bold shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            Testimonials ({testimonials.length})
          </button>
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "feed" ? "bg-white text-black font-bold shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            Feed Moderation ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "broadcast" ? "bg-purple-500 text-white font-bold shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            Broadcast Bulletin
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white text-sm">
            ×
          </button>
        </div>
      )}

      {/* ── TAB 1: FAQS ────────────────────────────────────────────────────────── */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-400">
              Showing FAQs currently published or drafted for the main landing page.
            </div>
            {canModerate && (
              <button
                onClick={openAddFaqModal}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-zinc-200 transition-all shadow cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Landing FAQ</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {faq.topic}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white">
                        {faq.language}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">#{faq.sortOrder}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFaq(faq.id, faq.isActive)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          faq.isActive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        {faq.isActive ? "Active" : "Hidden"}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">{faq.question}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{faq.answer}</p>
                  {faq.takeaway && (
                    <div className="mt-2 text-[11px] font-mono text-zinc-500 italic">
                      Key Takeaway: {faq.takeaway}
                    </div>
                  )}
                </div>

                {canModerate && (
                  <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => openEditFaqModal(faq)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {faqs.length === 0 && (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900/30 rounded-2xl border border-dashed border-white/10">
              No custom FAQs added yet. The landing page is displaying curated defaults from translation dictionaries.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: TESTIMONIALS ─────────────────────────────────────────────────── */}
      {activeTab === "testimonials" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-400">
              Manage client and artisan reviews featured on the landing page sliding track.
            </div>
            {canModerate && (
              <button
                onClick={openAddTestimonialModal}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-zinc-200 transition-all shadow cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Testimonial</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow ${
                          item.avatarBg || "bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-white"
                        }`}
                      >
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm leading-tight">{item.name}</div>
                        <div className="text-[11px] text-zinc-400">{item.role} · {item.trade}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleTestimonial(item.id, item.isActive)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        item.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                      }`}
                    >
                      {item.isActive ? "Live" : "Draft"}
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 italic font-serif leading-relaxed">
                    “{item.quote.replace(/^“|”$/g, "")}”
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span className="text-emerald-400">{item.jobs}</span>
                    <span>Lang: {item.language}</span>
                  </div>
                </div>

                {canModerate && (
                  <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => openEditTestimonialModal(item)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit size={11} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(item.id)}
                      className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {testimonials.length === 0 && (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900/30 rounded-2xl border border-dashed border-white/10">
              No custom testimonials added yet. Displaying default curated reviews from Dire Dawa clients and artisans.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: FEED MODERATION ─────────────────────────────────────────────── */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                placeholder="Search community posts by title, body, author..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPostFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  postFilter === "all" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 border border-white/10"
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => setPostFilter("active")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  postFilter === "active" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 border border-white/10"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setPostFilter("hidden")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  postFilter === "hidden" ? "bg-red-500 text-white" : "bg-zinc-900 text-zinc-400 border border-white/10"
                }`}
              >
                Hidden
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/50 border-b border-white/10 text-zinc-400 font-mono">
                <tr>
                  <th className="p-3.5 font-bold">Category</th>
                  <th className="p-3.5 font-bold">Title & Content</th>
                  <th className="p-3.5 font-bold">Author</th>
                  <th className="p-3.5 font-bold">Flags</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/10 text-zinc-300">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-md">
                      <div className="font-bold text-white text-sm mb-1">{post.title}</div>
                      <div className="text-zinc-400 line-clamp-2 leading-relaxed">{post.content}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-zinc-200">{post.authorName}</td>
                    <td className="p-3.5">
                      <span
                        className={`font-mono text-xs font-bold ${
                          post.flagsCount > 0 ? "text-red-400" : "text-zinc-500"
                        }`}
                      >
                        {post.flagsCount} flags
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          post.isRemoved ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {post.isRemoved ? "Removed" : "Visible"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {canModerate && (
                        <button
                          onClick={() => handleTogglePostRemove(post.id, post.isRemoved)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            post.isRemoved
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                          }`}
                        >
                          {post.isRemoved ? "Restore Post" : "Hide Post"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPosts.length === 0 && (
              <div className="p-12 text-center text-zinc-500 text-xs">No community posts match your criteria.</div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: BROADCAST OFFICIAL BULLETIN ─────────────────────────────────── */}
      {activeTab === "broadcast" && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Broadcast Official Community Bulletin</h2>
              <p className="text-xs text-zinc-400">
                Publishes an official pinned alert or update to the entire DireSkill worker and client community feed.
              </p>
            </div>
          </div>

          <form onSubmit={handlePublishAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Announcement Category
              </label>
              <select
                value={annCategory}
                onChange={(e) => setAnnCategory(e.target.value)}
                className="w-full bg-black border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="Announcements">Platform Announcements</option>
                <option value="Safety Notice">Worker & Client Safety Notice</option>
                <option value="Artisan Workshops">Skill Training & Certification Workshops</option>
                <option value="System Update">System & Payment Gateway Updates</option>
                <option value="Policy Change">Terms & Proclamation Compliance Updates</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Bulletin Headline <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Mandatory Fayda ID Digital Contract Compliance Update"
                required
                className="w-full bg-black border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Detailed Content <span className="text-red-400">*</span>
              </label>
              <textarea
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                rows={6}
                placeholder="Write the full announcement message here..."
                required
                className="w-full bg-black border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Broadcasting..." : "Publish Official Announcement to Community Feed"}
            </button>
          </form>
        </div>
      )}

      {/* ── FAQ MODAL ──────────────────────────────────────────────────────────── */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-900 border border-white/20 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white">
                {editingFaq ? "Edit Landing FAQ" : "Add Landing Page FAQ"}
              </h3>
              <button
                onClick={() => setFaqModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Topic / Category</label>
                  <input
                    type="text"
                    value={faqTopic}
                    onChange={(e) => setFaqTopic(e.target.value)}
                    placeholder="e.g. Verification, Payments, Safety"
                    required
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Target Language</label>
                  <select
                    value={faqLanguage}
                    onChange={(e) => setFaqLanguage(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="EN">English (EN)</option>
                    <option value="አማ">Amharic (አማ)</option>
                    <option value="ORO">Afaan Oromoo (ORO)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Question</label>
                <input
                  type="text"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. How does Fayda ID verification protect clients?"
                  required
                  className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Answer</label>
                <textarea
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  rows={4}
                  placeholder="Provide a clear, detailed response..."
                  required
                  className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Key Takeaway (Optional)</label>
                <input
                  type="text"
                  value={faqTakeaway}
                  onChange={(e) => setFaqTakeaway(e.target.value)}
                  placeholder="Single-sentence summary"
                  className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200"
                >
                  {isPending ? "Saving..." : "Save FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TESTIMONIAL MODAL ──────────────────────────────────────────────────── */}
      {testimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-900 border border-white/20 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white">
                {editingTestimonial ? "Edit Testimonial" : "Add Landing Page Testimonial"}
              </h3>
              <button
                onClick={() => setTestimonialModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g. Muna Ibrahim"
                    required
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Role</label>
                  <input
                    type="text"
                    value={testRole}
                    onChange={(e) => setTestRole(e.target.value)}
                    placeholder="e.g. Homeowner, Store Manager"
                    required
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Trade / Service</label>
                  <input
                    type="text"
                    value={testTrade}
                    onChange={(e) => setTestTrade(e.target.value)}
                    placeholder="e.g. Electrician"
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Jobs Badge</label>
                  <input
                    type="text"
                    value={testJobs}
                    onChange={(e) => setTestJobs(e.target.value)}
                    placeholder="e.g. 5 Verified Jobs"
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Language</label>
                  <select
                    value={testLanguage}
                    onChange={(e) => setTestLanguage(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="EN">English (EN)</option>
                    <option value="አማ">Amharic (አማ)</option>
                    <option value="ORO">Afaan Oromoo (ORO)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Testimonial Quote</label>
                <textarea
                  value={testQuote}
                  onChange={(e) => setTestQuote(e.target.value)}
                  rows={3}
                  placeholder="The user's direct quote or review..."
                  required
                  className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Avatar Color Theme</label>
                <select
                  value={testAvatarBg}
                  onChange={(e) => setTestAvatarBg(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                >
                  <option value="bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-white">Warm Gold / Amber</option>
                  <option value="bg-gradient-to-tr from-blue-600 via-indigo-400 to-sky-200 text-white">Azure / Sky Blue</option>
                  <option value="bg-gradient-to-tr from-emerald-600 via-teal-400 to-emerald-200 text-white">Emerald Green</option>
                  <option value="bg-gradient-to-tr from-purple-600 via-violet-400 to-fuchsia-200 text-white">Royal Purple</option>
                  <option value="bg-gradient-to-tr from-rose-600 via-rose-400 to-pink-200 text-white">Rose Red</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTestimonialModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200"
                >
                  {isPending ? "Saving..." : "Save Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
