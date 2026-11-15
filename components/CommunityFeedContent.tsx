"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createCommunityComment,
  getCommunityComments,
  toggleLikePost,
  votePostUseful,
  flagPost,
} from "@/lib/actions/community";
import CreatePostModal from "./CreatePostModal";
import { formatDistanceToNow } from "date-fns";
import {
  RiSearch2Line,
  RiCloseLine,
  RiAddLine,
  RiNotification3Line,
  RiHeart3Fill,
  RiHeart3Line,
  RiEyeLine,
  RiChat1Line,
  RiShareForwardLine,
  RiBookmarkLine,
  RiBookmarkFill,
  RiSparklingLine,
  RiThumbDownLine,
  RiThumbUpLine,
  RiThumbUpFill,
  RiFlagLine,
  RiCheckboxCircleFill,
  RiShieldCheckLine,
  RiToolsLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiSendPlaneFill,
  RiImageAddLine,
  RiCheckLine,
} from "@remixicon/react";

/* ── 1. draw-svg Skill: Topographic Contour Vector Background Texture ──────── */
function TopographicContourSvg({
  className = "absolute inset-0 w-full h-full pointer-events-none opacity-15",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 800 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M-50 150 C 150 90, 260 210, 460 150 C 660 90, 760 190, 900 120"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.4"
      />
      <path
        d="M-50 180 C 120 120, 230 240, 430 180 C 630 120, 730 220, 900 150"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      <path
        d="M-50 210 C 90 150, 200 270, 400 210 C 600 150, 700 250, 900 180"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.2"
      />
      <circle cx="680" cy="80" r="140" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.15" />
      <circle cx="680" cy="80" r="95" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.25" />
      <circle cx="680" cy="80" r="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
    </svg>
  );
}

/* ── 2. draw-svg Skill: Fayda Ethiopian National ID Biometric Seal ─────────── */
function FaydaBiometricSealSvg({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="16" cy="16" r="14" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
      <path
        d="M16 7 C 20.97 7, 25 11.03, 25 16 C 25 20.97, 20.97 25, 16 25"
        stroke="#34d399"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 11 C 18.76 11, 21 13.24, 21 16 C 21 18.76, 18.76 21, 16 21"
        stroke="#6ee7b7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.5" fill="#bef264" />
    </svg>
  );
}

/* ── 3. draw-svg Skill: Artisan Craft Hub Geometric Compass Emblem ─────────── */
function ArtisanCraftEmblemSvg({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="currentColor" fillOpacity="0.08" />
      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      <path
        d="M20 8 L22 17 L31 20 L22 23 L20 32 L18 23 L9 20 L18 17 Z"
        fill="currentColor"
      />
      <circle cx="20" cy="20" r="2.5" fill="#10b981" />
    </svg>
  );
}

/* ── Categories Definition ─────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "ALL", label: "ALL CRAFTS" },
  { id: "Plumbing", label: "PLUMBING" },
  { id: "Electrical", label: "ELECTRICAL" },
  { id: "Woodwork & Finishing", label: "WOODWORK & FINISHING" },
  { id: "Masonry & Tile", label: "MASONRY & TILE" },
  { id: "Painting & Decor", label: "PAINTING & DECOR" },
  { id: "Solar & Energy", label: "SOLAR & ENERGY" },
  { id: "Tips & Q&A", label: "TIPS & DISCUSSIONS" },
];

export interface CraftItem {
  id: string;
  title: string;
  category: string;
  glassBadge: string;
  snippet: string;
  views: number;
  likesCount: number;
  commentsCount: number;
  usefulCount: number;
  notUsefulCount?: number;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  authorLocation: string;
  isVerified: boolean;
  mediaUrl: string;
  materials?: string[];
  tools?: string[];
  fullStory?: string;
  isLiked?: boolean;
  currentUserVote?: string | null;
  isDbPost?: boolean;
}

/* ── Fallback Curated Crafts for Dire Dawa Showcase (Yogi Glow style) ──────── */
const CURATED_SHOWCASE_PROJECTS: CraftItem[] = [
  {
    id: "curated-1",
    title: "CUSTOM TEAK CABINETRY",
    category: "Woodwork & Finishing",
    glassBadge: "28 MIN · KEBELE 02",
    snippet:
      "Hand-joined mortise-and-tenon teak storage tailored for historic Dire Dawa residence with brass hardware.",
    views: 342,
    likesCount: 48,
    commentsCount: 9,
    usefulCount: 32,
    authorName: "Dawit Haile",
    authorAvatar: "/images/worker_guide_avatar.jpg",
    authorRole: "Master Carpenter",
    authorLocation: "Kebele 02, Dire Dawa",
    isVerified: true,
    mediaUrl: "/images/worker_workbench_hero.jpg",
    materials: ["Ethiopian Teak", "Brass Pulls", "Matte Polyurethane", "Dowels"],
    tools: ["Table Saw", "Chisel Set", "Clamps", "Laser Guide"],
    fullStory:
      "This custom cabinetry project was designed for a historic colonial-style villa near Kebele 02. We selected kiln-dried Ethiopian teak to withstand seasonal humidity shifts. Every drawer features blind dovetail joinery for lifetime structural rigidity. The final finish was hand-rubbed with four coats of protective satin oil to highlight the rich natural grain.",
  },
  {
    id: "curated-2",
    title: "SOLAR ARRAY RETROFIT 5KVA",
    category: "Solar & Energy",
    glassBadge: "16 MIN · SABIAN",
    snippet:
      "Off-grid hybrid rooftop inverter system with lithium storage ensuring 24/7 power for Dire Dawa cold storage.",
    views: 580,
    likesCount: 76,
    commentsCount: 14,
    usefulCount: 54,
    authorName: "Binyam Tadesse",
    authorAvatar: "/images/worker-avatar-hero-transparent.png",
    authorRole: "Solar & Electrical Tech",
    authorLocation: "Sabian, Dire Dawa",
    isVerified: true,
    mediaUrl: "/images/client_project_hero.jpg",
    materials: ["Tier-1 Monocrystalline Panels (550W)", "5kW Hybrid Inverter", "LiFePO4 48V Battery", "MC4 Connectors"],
    tools: ["Multimeter", "MC4 Crimper", "Torque Wrench", "Angle Grinder"],
    fullStory:
      "Dire Dawa's strong solar irradiance makes it ideal for off-grid retrofits. We installed eight 550W high-efficiency panels mounted on reinforced aluminum roof rails pitched at 15 degrees south. The system ties directly into an automatic transfer switch, guaranteeing uninterrupted operation for temperature-sensitive cooling equipment.",
  },
  {
    id: "curated-3",
    title: "COPPER BRAZING MASTERCLASS",
    category: "Plumbing",
    glassBadge: "20 MIN · MEGALA",
    snippet:
      "High-pressure commercial water manifold jointing using silver phosphor alloy with zero capillary leak.",
    views: 419,
    likesCount: 62,
    commentsCount: 11,
    usefulCount: 43,
    authorName: "Kassahun Mengistu",
    authorAvatar: "/images/user_review_card.jpg",
    authorRole: "Certified Hydraulic Plumber",
    authorLocation: "Megala Market, Dire Dawa",
    isVerified: true,
    mediaUrl: "/images/diredawa_banner.jpg",
    materials: ["Type L Copper Tubing", "Silver-Phosphor Rods", "Stay-Clean Flux", "Dielectric Unions"],
    tools: ["Oxy-Acetylene Torch", "Deburring Tool", "Tubing Cutter", "Pressure Gauge"],
    fullStory:
      "Commercial kitchens in Megala require manifolds capable of withstanding 8 bar pressure without micro-fissures. In this installation, every copper fitting was reamed, acid-fluxed, and heated uniformly to 650°C before silver-phosphor brazing. Hydrostatic pressure testing held rock steady at 120 PSI for 24 hours.",
  },
  {
    id: "curated-4",
    title: "MARBLE TILE ACCENT ALIGNMENT",
    category: "Masonry & Tile",
    glassBadge: "12 MIN · GENDE KORE",
    snippet:
      "Laser-guided subfloor leveling and anti-fracture membrane laying for seamless large-format porcelain.",
    views: 388,
    likesCount: 51,
    commentsCount: 7,
    usefulCount: 35,
    authorName: "Yohannes Bekele",
    authorAvatar: "/images/user_contract_card.jpg",
    authorRole: "Master Tile Mason",
    authorLocation: "Gende Kore, Dire Dawa",
    isVerified: true,
    mediaUrl: "/images/diredawa_station.jpg",
    materials: ["60x120cm Porcelain", "Polymer Modified Thin-Set", "Epoxy Grout", "Leveling Spacers"],
    tools: ["Cross-Line Laser", "Notched Trowel 12mm", "Wet Tile Saw", "Rubber Mallet"],
    fullStory:
      "Large-format 60x120cm porcelain tiles require zero deflection. We poured a self-leveling underlayment with high-strength Portland mix, applied crack-isolation mesh, and back-buttered each tile to achieve 98% adhesive coverage. The result is a dead-flat plane with laser-aligned 1.5mm joints filled with stain-proof epoxy grout.",
  },
];

const CURATED_KNOWLEDGE_POSTS: CraftItem[] = [
  {
    id: "curated-know-1",
    title: "LEAK DETECT IN CONCRETE SLABS",
    category: "Tips & Q&A",
    glassBadge: "8 MIN · Q&A",
    snippet:
      "Non-destructive acoustic listening method to locate concealed under-slab pipe ruptures without excavating tiles.",
    views: 612,
    likesCount: 94,
    commentsCount: 18,
    usefulCount: 68,
    authorName: "Mustafa Ahmed",
    authorAvatar: "/images/skilled-workers-hero.jpg",
    authorRole: "Leak Diagnostics Specialist",
    authorLocation: "Kebele 04, Dire Dawa",
    isVerified: true,
    mediaUrl: "/images/diredawa_city.jpg",
    materials: ["Electronic Listening Rod", "Pressure Dampeners", "Thermal Probe"],
    tools: ["Ground Microphone", "Acoustic Amplifier", "Digital Pressure Transducer"],
    fullStory:
      "Never start breaking concrete before isolating the exact pressure drop frequency! By pressurizing the domestic line with nitrogen to 60 PSI, escaping gas creates a distinct 300Hz-800Hz sound wave that our ground sensor pinpoints within a 10cm radius.",
  },
  {
    id: "curated-know-2",
    title: "CIRCUIT BREAKER SIZING FOR DRIERS",
    category: "Electrical",
    glassBadge: "10 MIN · TECHNICAL",
    snippet:
      "Why standard 16A miniature breakers trip under industrial motor starting inrush and how to select Type C curves.",
    views: 450,
    likesCount: 68,
    commentsCount: 12,
    usefulCount: 50,
    authorName: "Sileshi Kebede",
    authorAvatar: "/images/worker_holding_card.png",
    authorRole: "Industrial Electrician",
    authorLocation: "Industrial Zone, Dire Dawa",
    isVerified: true,
    mediaUrl: "/images/artisan-login-hero.jpg",
    materials: ["Type C MCB (25A)", "6mm² Copper Wire", "DIN Rail Enclosure"],
    tools: ["Clamp Meter", "Megohmmeter", "Insulated Screwdrivers"],
    fullStory:
      "Inductive motor loads like heavy compressors and sawmill motors draw 5x to 7x rated current for the first 300 milliseconds. Using standard Type B domestic breakers causes nuisance tripping. Switching to Type C allows that momentary magnetic burst while preserving reliable thermal overload protection.",
  },
  {
    id: "curated-know-3",
    title: "EXTERIOR STUCCO CURE IN DRY HEAT",
    category: "Painting & Decor",
    glassBadge: "14 MIN · WEATHER TIPS",
    snippet:
      "Techniques for hydrating cementitious render during Dire Dawa's peak sun to prevent shrinkage hairline cracking.",
    views: 310,
    likesCount: 42,
    commentsCount: 8,
    usefulCount: 29,
    authorName: "Solomon Girma",
    authorAvatar: "/images/user_fayda_card.jpg",
    authorRole: "Finishing Specialist",
    authorLocation: "Dechetu, Dire Dawa",
    isVerified: true,
    mediaUrl: "/images/diredawa_street.jpg",
    materials: ["Hydrated Lime", "Sharp Silica Sand", "Polypropylene Microfibers", "Curing Spray"],
    tools: ["Spray Gun", "Plasterer's Float", "Shade Cloth"],
    fullStory:
      "Direct afternoon sun pulls moisture out of fresh mortar before cement hydration is complete. We drape 70% shade netting over scaffolding and mist the wall three times daily for the first 72 hours. Adding 0.2% polypropylene microfibers eliminates shrinkage micro-cracking.",
  },
];

type CommunityComment = {
  id: string;
  content: string;
  created_at: string | Date;
  author_name: string;
  author_avatar: string | null;
  role: string;
};

export default function CommunityFeedContent({ initialPosts }: { initialPosts: any[] }) {
  const [dbPosts, setDbPosts] = useState<any[]>(initialPosts || []);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<CraftItem | null>(null);

  /* Interactive button states */
  const [likesState, setLikesState] = useState<Record<string, { isLiked: boolean; count: number }>>({});
  const [usefulVotes, setUsefulVotes] = useState<Record<string, { vote: string | null; count: number; notUsefulCount: number }>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<string, CommunityComment[]>>({});
  const [commentDraft, setCommentDraft] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast((current) => (current === msg ? null : current));
    }, 3200);
  };

  /* Fetch database posts on mount */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/community/posts", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && Array.isArray(payload.posts)) {
        setDbPosts(payload.posts);
      }
    } catch (error) {
      console.error("[COMMUNITY_FEED_LOAD_ERROR]", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  /* Handle Like button with tactile feedback */
  const handleLike = async (item: CraftItem) => {
    const id = item.id;
    const current = likesState[id] || {
      isLiked: Boolean(item.isLiked),
      count: Number(item.likesCount || 0),
    };
    const nextLiked = !current.isLiked;
    const nextCount = nextLiked ? current.count + 1 : Math.max(0, current.count - 1);

    // Optimistic state
    setLikesState((prev) => ({
      ...prev,
      [id]: { isLiked: nextLiked, count: nextCount },
    }));

    if (item.id && !item.id.startsWith("curated-")) {
      const res = await toggleLikePost(item.id);
      if (!res.success) {
        showToast(res.error || "Could not update like.");
        // Revert
        setLikesState((prev) => ({
          ...prev,
          [id]: current,
        }));
      }
    } else {
      showToast(nextLiked ? "Craft liked! Added to trending." : "Like removed.");
    }
  };

  /* Handle Useful vote button */
  const handleVoteUseful = async (item: CraftItem) => {
    const id = item.id;
    const current = usefulVotes[id] || {
      vote: item.currentUserVote || null,
      count: Number(item.usefulCount || 0),
      notUsefulCount: Number(item.notUsefulCount || 0),
    };
    const isNowUseful = current.vote !== "useful";
    const nextUsefulCount = isNowUseful ? current.count + 1 : Math.max(0, current.count - 1);
    const nextNotUsefulCount = current.vote === "not_useful" ? Math.max(0, current.notUsefulCount - 1) : current.notUsefulCount;

    setUsefulVotes((prev) => ({
      ...prev,
      [id]: {
        vote: isNowUseful ? "useful" : null,
        count: nextUsefulCount,
        notUsefulCount: nextNotUsefulCount,
      },
    }));

    if (item.id && !item.id.startsWith("curated-")) {
      const res = await votePostUseful(item.id, isNowUseful ? "useful" : null);
      if (!res.success) {
        showToast(res.error || "Could not record vote.");
        setUsefulVotes((prev) => ({ ...prev, [id]: current }));
      } else {
        showToast(isNowUseful ? "Marked as useful craft advice!" : "Vote removed.");
      }
    } else {
      showToast(isNowUseful ? "Marked as useful craft advice!" : "Vote removed.");
    }
  };

  /* Handle Dislike / Not Useful vote button */
  const handleVoteNotUseful = async (item: CraftItem) => {
    const id = item.id;
    const current = usefulVotes[id] || {
      vote: item.currentUserVote || null,
      count: Number(item.usefulCount || 0),
      notUsefulCount: Number(item.notUsefulCount || 0),
    };
    const isNowNotUseful = current.vote !== "not_useful";
    const nextNotUsefulCount = isNowNotUseful ? current.notUsefulCount + 1 : Math.max(0, current.notUsefulCount - 1);
    const nextUsefulCount = current.vote === "useful" ? Math.max(0, current.count - 1) : current.count;

    setUsefulVotes((prev) => ({
      ...prev,
      [id]: {
        vote: isNowNotUseful ? "not_useful" : null,
        count: nextUsefulCount,
        notUsefulCount: nextNotUsefulCount,
      },
    }));

    if (item.id && !item.id.startsWith("curated-")) {
      const res = await votePostUseful(item.id, isNowNotUseful ? "not_useful" : null);
      if (!res.success) {
        showToast(res.error || "Could not record feedback.");
        setUsefulVotes((prev) => ({ ...prev, [id]: current }));
      } else {
        showToast(isNowNotUseful ? "Feedback recorded." : "Dislike removed.");
      }
    } else {
      showToast(isNowNotUseful ? "Feedback recorded." : "Dislike removed.");
    }
  };

  /* Handle Bookmark button */
  const handleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarks((prev) => {
      const isSaved = !prev[id];
      showToast(isSaved ? "Saved craft to your reading bookmarks." : "Removed from bookmarks.");
      return { ...prev, [id]: isSaved };
    });
  };

  /* Handle Share button */
  const handleShare = async (item: CraftItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/community/feed#${item.id}` : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: `Check out this artisan trade craft on DireSkill: ${item.title}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Direct craft link copied to clipboard!");
      }
    } catch {
      showToast("Link copied to clipboard!");
    }
  };

  /* Open Project Details & fetch comments */
  const openProjectDetails = async (project: CraftItem) => {
    setSelectedProject(project);
    if (project.id && !project.id.startsWith("curated-") && !commentsByPost[project.id]) {
      const comments = await getCommunityComments(project.id);
      setCommentsByPost((prev) => ({ ...prev, [project.id]: comments as CommunityComment[] }));
    }
  };

  /* Add Comment */
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentDraft.trim() || !selectedProject || submittingComment) return;
    setSubmittingComment(true);

    const postId = selectedProject.id;
    if (postId && !postId.startsWith("curated-")) {
      const res = await createCommunityComment(postId, commentDraft.trim());
      if (res.success) {
        setCommentDraft("");
        const comments = await getCommunityComments(postId);
        setCommentsByPost((prev) => ({ ...prev, [postId]: comments as CommunityComment[] }));
        showToast("Your comment has been added!");
      } else {
        showToast(res.error || "Failed to post comment.");
      }
    } else {
      // Local addition for curated mock
      const newComment: CommunityComment = {
        id: `local-${Date.now()}`,
        content: commentDraft.trim(),
        created_at: new Date().toISOString(),
        author_name: "You (Artisan)",
        author_avatar: "/images/worker_guide_avatar.jpg",
        role: "worker",
      };
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      setCommentDraft("");
      showToast("Your comment has been posted!");
    }
    setSubmittingComment(false);
  };

  /* Map DB posts to uniform craft items */
  const formattedDbPosts: CraftItem[] = useMemo(() => {
    return dbPosts.map((p) => {
      return {
        id: p.id,
        title: (p.title || "UNTITLED CRAFT").toUpperCase(),
        category: p.category || "General",
        glassBadge: `${p.category?.toUpperCase() || "CRAFT"} · DIRE DAWA`,
        snippet: p.content || "",
        views: Number(p.likes_count || 0) * 7 + 19,
        likesCount: Number(p.likes_count || 0),
        commentsCount: Number(p.comments_count || 0),
        usefulCount: Number(p.useful_count || 0),
        notUsefulCount: Number(p.not_useful_count || 0),
        authorName: p.author_name || "DireSkill Member",
        authorAvatar: p.author_avatar || "/default-avatar.svg",
        authorRole: p.role === "worker" ? "Verified Artisan" : p.role === "admin" ? "DireSkill Lead" : "Client",
        authorLocation: "Dire Dawa",
        isVerified: Boolean(p.is_verified),
        mediaUrl: p.media_url || "/images/worker_workbench_hero.jpg",
        materials: ["Standard Trade Materials", "Local Dire Dawa Sourcing"],
        tools: ["Essential Hand & Power Tools"],
        fullStory: p.content || "",
        isLiked: Boolean(p.is_liked),
        currentUserVote: p.current_user_vote || null,
        isDbPost: true,
      };
    });
  }, [dbPosts]);

  /* Combined lists filtered by category and search */
  const allShowcaseItems: CraftItem[] = useMemo(() => {
    const list = [...CURATED_SHOWCASE_PROJECTS, ...formattedDbPosts.filter((_, idx) => idx % 2 === 0)];
    return list.filter((item) => {
      const matchesCat =
        selectedCategory === "ALL" ||
        item.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [formattedDbPosts, selectedCategory, searchQuery]);

  const allKnowledgeItems: CraftItem[] = useMemo(() => {
    const list = [...CURATED_KNOWLEDGE_POSTS, ...formattedDbPosts.filter((_, idx) => idx % 2 === 1)];
    return list.filter((item) => {
      const matchesCat =
        selectedCategory === "ALL" ||
        item.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [formattedDbPosts, selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-8 pb-32">
      {/* ── 1. Top Bar / Editorial Header ── */}
      <header className="flex items-center justify-between gap-4 pt-1">
        {/* Left: Brand Identity Wordmark */}
        <div className="flex items-center gap-3">
          <ArtisanCraftEmblemSvg className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-text-primary flex items-center gap-1.5">
              DIRE <span className="text-emerald-600 dark:text-emerald-400 font-black">·</span> CRAFT
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
              Artisan Community Hub
            </span>
          </div>
        </div>

        {/* Right: Action Buttons, Bell, Avatar, + Share */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Toggle Pill */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((open) => {
                if (open) setSearchQuery("");
                return !open;
              });
            }}
            className={`w-11 h-11 rounded-full border border-border-button-default bg-background-secondary-default text-text-primary hover:bg-background-secondary-hover flex items-center justify-center transition-all active:scale-95 cursor-pointer ${isSearchOpen ? "ring-2 ring-emerald-500/30 bg-emerald-500/10" : ""
              }`}
            aria-label="Toggle search"
            title="Search crafts and discussions"
          >
            {isSearchOpen ? <RiCloseLine className="w-5 h-5" /> : <RiSearch2Line className="w-5 h-5" />}
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => showToast("You have 3 new craft updates in Dire Dawa.")}
            className="w-11 h-11 rounded-full border border-border-button-default bg-background-secondary-default text-text-primary hover:bg-background-secondary-hover flex items-center justify-center transition-all active:scale-95 relative cursor-pointer"
            aria-label="Notifications"
            title="Community notifications"
          >
            <RiNotification3Line className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background-primary-default" />
          </button>

          {/* Profile Avatar */}
          <div
            className="w-11 h-11 rounded-full overflow-hidden border-2 border-border-button-default bg-background-secondary-default shrink-0 shadow-sm"
            title="Your Profile"
          >
            <img
              src="/images/worker_guide_avatar.jpg"
              alt="Artisan Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Primary Action Button: + Share Your Craft (Always visible on mobile & desktop) */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <RiAddLine className="w-4 h-4" />
            <span className="sm:hidden">Post</span>
            <span className="hidden sm:inline">Share Your Craft</span>
          </button>
        </div>
      </header>

      {/* ── 2. Collapsible Search Field ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="relative flex items-center rounded-full border border-border-button-default bg-background-secondary-default px-4 py-1.5 shadow-inner">
              <RiSearch2Line className="w-5 h-5 text-text-tertiary shrink-0" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mastercrafts, plumbing fixes, solar retrofits, wood finishing..."
                className="w-full h-10 px-3 bg-transparent text-sm font-semibold text-text-primary placeholder:text-text-placeholder outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full hover:bg-background-tertiary-default text-text-secondary"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. Conversational Bold Headline (Yogi Glow style) ── */}
      <div className="space-y-1.5 pt-1">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary leading-[1.1]">
          What trade craft inspires you today?
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-text-secondary leading-relaxed max-w-2xl">
          Verified Dire Dawa mastercraft breakdowns, trade solutions, and peer wisdom protected by DireSkill.
        </p>
      </div>

      {/* ── Quick Compose Prompt Bar (Interactive, instant access on mobile & desktop) ── */}
      <div
        onClick={() => setIsCreateModalOpen(true)}
        className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-background-secondary-default hover:bg-background-secondary-hover border border-border-button-default/80 cursor-pointer shadow-sm transition-all group active:scale-[0.99]"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden bg-background-tertiary-default shrink-0 border border-border-button-default">
          <img src="/images/worker_guide_avatar.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 text-xs sm:text-sm text-text-placeholder font-medium truncate">
          Share your trade project, advice, or ask Dire Dawa artisans...
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider group-hover:scale-105 active:scale-95 transition-all"
          >
            <RiAddLine className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Post</span>
            <span className="sm:hidden">Post</span>
          </button>
        </div>
      </div>

      {/* ── 4. Horizontal Pill Filter Carousel (Yogi Glow style) ── */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 snap-x scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`snap-start shrink-0 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${isActive
                    ? "bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-md scale-[1.02]"
                    : "bg-background-secondary-default text-text-secondary hover:bg-background-secondary-hover hover:text-text-primary border border-border-button-default/60"
                  }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5. Feedback Toast ── */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[80] bg-zinc-950 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20"
          >
            <RiSparklingLine className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 6. Section 1: "Featured Artisan Showcases" (Deep Stretch in Reference) ── */}
      <section className="space-y-4 pt-2">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
              Featured Artisan Showcases
            </h2>
            <p className="text-xs font-semibold text-text-secondary mt-0.5">
              High-precision craftsmanship from verified Dire Dawa artisans
            </p>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-text-tertiary">
            {allShowcaseItems.length} Projects
          </span>
        </div>

        {allShowcaseItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {allShowcaseItems.map((item, idx) => {
              const likeInfo = likesState[item.id] || {
                isLiked: Boolean(item.isLiked),
                count: Number(item.likesCount || 0),
              };
              const usefulInfo = usefulVotes[item.id] || {
                vote: item.currentUserVote || null,
                count: Number(item.usefulCount || 0),
                notUsefulCount: Number(item.notUsefulCount || 0),
              };
              const isSaved = Boolean(bookmarks[item.id]);

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => openProjectDetails(item)}
                  className="rounded-[2.25rem] border border-border-button-default/70 bg-background-primary-default p-3 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  <TopographicContourSvg className="absolute inset-0 w-full h-full pointer-events-none opacity-5 text-emerald-600" />

                  {/* Photo Container with Frosted Glass Badge & Bookmark Button */}
                  <div className="relative aspect-[4/5] w-full rounded-[1.75rem] overflow-hidden bg-background-secondary-default shadow-inner">
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />

                    {/* Gradient shade at bottom for glass badge readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Frosted Glass Badge Pinned at Bottom Center */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center pointer-events-none">
                      <span className="backdrop-blur-md bg-black/45 border border-white/25 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg">
                        {item.glassBadge}
                      </span>
                    </div>

                    {/* Bookmark Button Pinned Top Right */}
                    <button
                      type="button"
                      onClick={(e) => handleBookmark(item.id, e)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md bg-black/40 border border-white/20 text-white hover:bg-black/60 flex items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer"
                      aria-label="Save craft"
                      title={isSaved ? "Remove from saved" : "Save craft"}
                    >
                      {isSaved ? (
                        <RiBookmarkFill className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <RiBookmarkLine className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Content Below Photo */}
                  <div className="pt-3 px-1 pb-1 space-y-2">
                    {/* Bold Uppercase Title */}
                    <h3 className="text-base font-black tracking-tight text-text-primary uppercase group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    {/* 2-line snippet */}
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                      {item.snippet}
                    </p>

                    {/* Author Line */}
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={item.authorAvatar}
                        alt={item.authorName}
                        className="w-6 h-6 rounded-full object-cover border border-border-button-default"
                      />
                      <span className="text-xs font-bold text-text-primary truncate">
                        {item.authorName}
                      </span>
                      {item.isVerified && <FaydaBiometricSealSvg className="w-4 h-4 shrink-0" />}
                    </div>

                    {/* Footer Row: Quick Actions (Like, Dislike, Comment, Share) */}
                    <div className="flex items-center justify-between pt-2 border-t border-separator-border/70 text-xs text-text-secondary">
                      {/* View Counter */}
                      <div className="flex items-center gap-1 font-bold text-text-tertiary">
                        <RiEyeLine className="w-3.5 h-3.5" />
                        <span>{item.views}</span>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {/* 1. Like Quick Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(item);
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all active:scale-90 cursor-pointer ${likeInfo.isLiked
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : "hover:bg-background-secondary-hover text-text-secondary"
                            }`}
                          aria-label="Like post"
                          title="Like this craft"
                        >
                          {likeInfo.isLiked ? (
                            <RiHeart3Fill className="w-3.5 h-3.5 text-red-500 fill-current" />
                          ) : (
                            <RiHeart3Line className="w-3.5 h-3.5" />
                          )}
                          <span>{likeInfo.count}</span>
                        </button>

                        {/* 2. Dislike / Not Useful Quick Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoteNotUseful(item);
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all active:scale-90 cursor-pointer ${usefulInfo.vote === "not_useful"
                              ? "bg-zinc-800 text-amber-400 border border-zinc-700"
                              : "hover:bg-background-secondary-hover text-text-secondary"
                            }`}
                          aria-label="Dislike post"
                          title="Dislike / Not useful"
                        >
                          <RiThumbDownLine className={`w-3.5 h-3.5 ${usefulInfo.vote === "not_useful" ? "text-amber-400" : ""}`} />
                          {usefulInfo.notUsefulCount > 0 && <span>{usefulInfo.notUsefulCount}</span>}
                        </button>

                        {/* 3. Comment Quick Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectDetails(item);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold hover:bg-background-secondary-hover text-text-secondary active:scale-90 transition-all cursor-pointer"
                          title="View comments"
                        >
                          <RiChat1Line className="w-3.5 h-3.5" />
                          <span>{item.commentsCount}</span>
                        </button>

                        {/* 4. Share Quick Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item, e);
                          }}
                          className="p-1 rounded-full text-text-secondary hover:bg-background-secondary-hover active:scale-90 transition-all cursor-pointer"
                          title="Share craft"
                        >
                          <RiShareForwardLine className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-[2rem] border border-dashed border-border-button-default bg-background-secondary-default/50 space-y-2">
            <p className="text-sm font-bold text-text-primary">No showcases found for this category</p>
            <p className="text-xs text-text-secondary">Try switching categories or clearing your search.</p>
          </div>
        )}
      </section>

      {/* ── 7. Section 2: "Artisan Discussions & Knowledge" (Mindful Flow in Reference) ── */}
      <section className="space-y-4 pt-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
              Artisan Discussions & Knowledge
            </h2>
            <p className="text-xs font-semibold text-text-secondary mt-0.5">
              Practical trade solutions, tool tips, and technical Q&A
            </p>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-text-tertiary">
            {allKnowledgeItems.length} Discussions
          </span>
        </div>

        {allKnowledgeItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allKnowledgeItems.map((item, idx) => {
              const likeInfo = likesState[item.id] || {
                isLiked: Boolean(item.isLiked),
                count: Number(item.likesCount || 0),
              };
              const usefulInfo = usefulVotes[item.id] || {
                vote: item.currentUserVote || null,
                count: Number(item.usefulCount || 0),
                notUsefulCount: Number(item.notUsefulCount || 0),
              };

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => openProjectDetails(item)}
                  className="rounded-[2.25rem] border border-border-button-default/70 bg-background-primary-default p-3 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[16/10] w-full rounded-[1.75rem] overflow-hidden bg-background-secondary-default shadow-inner">
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Glass Duration/Topic Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center pointer-events-none">
                      <span className="backdrop-blur-md bg-black/45 border border-white/25 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                        {item.glassBadge}
                      </span>
                    </div>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={(e) => handleShare(item, e)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md bg-black/40 border border-white/20 text-white hover:bg-black/60 flex items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer"
                      aria-label="Share discussion"
                      title="Share link"
                    >
                      <RiShareForwardLine className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="pt-3 px-1 pb-1 space-y-2">
                    <h3 className="text-base font-black tracking-tight text-text-primary uppercase group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                      {item.snippet}
                    </p>

                    {/* Author & Verified Tag */}
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={item.authorAvatar}
                        alt={item.authorName}
                        className="w-6 h-6 rounded-full object-cover border border-border-button-default"
                      />
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-xs font-bold text-text-primary truncate">
                          {item.authorName}
                        </span>
                        {item.isVerified && <FaydaBiometricSealSvg className="w-4 h-4 shrink-0" />}
                      </div>
                    </div>

                    {/* Footer Row: Quick Actions (Like, Dislike, Comment, Share) */}
                    <div className="flex items-center justify-between pt-2 border-t border-separator-border/70 text-xs">
                      {/* View & Comment Count */}
                      <div className="flex items-center gap-2.5 text-text-tertiary font-bold">
                        <span className="flex items-center gap-1">
                          <RiEyeLine className="w-3.5 h-3.5" />
                          {item.views}
                        </span>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {/* 1. Like Quick Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(item);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold transition-all active:scale-90 cursor-pointer ${likeInfo.isLiked
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : "hover:bg-background-secondary-hover text-text-secondary"
                            }`}
                          title="Like discussion"
                        >
                          {likeInfo.isLiked ? (
                            <RiHeart3Fill className="w-3.5 h-3.5 text-red-500 fill-current" />
                          ) : (
                            <RiHeart3Line className="w-3.5 h-3.5" />
                          )}
                          <span>{likeInfo.count}</span>
                        </button>

                        {/* 2. Dislike Quick Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoteNotUseful(item);
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all active:scale-90 cursor-pointer ${usefulInfo.vote === "not_useful"
                              ? "bg-zinc-800 text-amber-400 border border-zinc-700"
                              : "hover:bg-background-secondary-hover text-text-secondary"
                            }`}
                          title="Dislike"
                        >
                          <RiThumbDownLine className={`w-3.5 h-3.5 ${usefulInfo.vote === "not_useful" ? "text-amber-400" : ""}`} />
                          {usefulInfo.notUsefulCount > 0 && <span>{usefulInfo.notUsefulCount}</span>}
                        </button>

                        {/* 3. Comment Quick Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectDetails(item);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold hover:bg-background-secondary-hover text-text-secondary active:scale-90 transition-all cursor-pointer"
                          title="Comments"
                        >
                          <RiChat1Line className="w-3.5 h-3.5" />
                          <span>{item.commentsCount}</span>
                        </button>

                        {/* 4. Share Quick Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item, e);
                          }}
                          className="p-1 rounded-full text-text-secondary hover:bg-background-secondary-hover active:scale-90 transition-all cursor-pointer"
                          title="Share"
                        >
                          <RiShareForwardLine className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-[2rem] border border-dashed border-border-button-default bg-background-secondary-default/50 space-y-2">
            <p className="text-sm font-bold text-text-primary">No community discussions found</p>
            <p className="text-xs text-text-secondary">Be the first to share advice or ask a trade question.</p>
          </div>
        )}
      </section>

      {/* ── 8. Mobile Floating Action Button (Floating ABOVE Mobile Bottom Nav) ── */}
      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 sm:hidden z-40">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider shadow-2xl active:scale-95 transition-all border border-white/20"
        >
          <RiAddLine className="w-4 h-4" />
          <span>Post Craft</span>
        </button>
      </div>

      {/* ── 9. stageshow Skill: Interactive Project Inspection Modal Drawer ── */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-0 sm:p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-w-3xl bg-background-primary-default border border-border-button-default rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between p-5 border-b border-separator-border bg-background-primary-default shrink-0">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                    {selectedProject.category}
                  </span>
                  <span className="text-xs text-text-tertiary">· {selectedProject.glassBadge}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="w-9 h-9 rounded-full border border-border-button-default bg-background-secondary-default text-text-secondary hover:text-text-primary flex items-center justify-center transition-all active:scale-95"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
                {/* Hero Media Display */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-[2rem] overflow-hidden border border-border-button-default bg-background-secondary-default shadow-sm">
                  <img
                    src={selectedProject.mediaUrl}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4">
                    <span className="backdrop-blur-md bg-black/50 border border-white/20 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                      {selectedProject.glassBadge}
                    </span>
                  </div>
                </div>

                {/* Title & Author Meta */}
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary uppercase">
                    {selectedProject.title}
                  </h2>

                  {/* Author Card */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background-secondary-default border border-border-button-default/60">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedProject.authorAvatar}
                        alt={selectedProject.authorName}
                        className="w-11 h-11 rounded-full object-cover border border-border-button-default"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-text-primary">
                            {selectedProject.authorName}
                          </span>
                          {selectedProject.isVerified && (
                            <FaydaBiometricSealSvg className="w-4 h-4 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-text-tertiary font-semibold">
                          {selectedProject.authorRole} · {selectedProject.authorLocation}
                        </p>
                      </div>
                    </div>

                    {/* Milestone Protection Badge */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      <RiShieldCheckLine className="w-4 h-4" />
                      <span>Milestone Protected</span>
                    </div>
                  </div>
                </div>

                {/* Full Breakdown Story */}
                <div className="space-y-3 text-sm text-text-primary leading-relaxed">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-tertiary">
                    Project Story & Technical Specifications
                  </h3>
                  <p className="whitespace-pre-line leading-relaxed">
                    {selectedProject.fullStory || selectedProject.snippet}
                  </p>
                </div>

                {/* Materials & Tools Used */}
                {selectedProject.materials && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-background-secondary-default border border-border-button-default/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-text-tertiary">
                        <RiToolsLine className="w-4 h-4 text-emerald-500" />
                        <span>Materials Sourced</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProject.materials.map((m: string) => (
                          <span
                            key={m}
                            className="px-2.5 py-1 rounded-full bg-background-primary-default border border-border-button-default text-[11px] font-bold text-text-secondary"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-background-secondary-default border border-border-button-default/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-text-tertiary">
                        <RiShieldCheckLine className="w-4 h-4 text-emerald-500" />
                        <span>Tools & Quality Standards</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedProject.tools || ["Standard Precision Tools"]).map((t: string) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-full bg-background-primary-default border border-border-button-default text-[11px] font-bold text-text-secondary"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-separator-border">
                  <div className="flex items-center gap-2">
                    {/* Like button in modal */}
                    <button
                      type="button"
                      onClick={() => handleLike(selectedProject)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer ${likesState[selectedProject.id]?.isLiked || selectedProject.isLiked
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          : "bg-background-secondary-default text-text-secondary hover:text-text-primary border border-border-button-default"
                        }`}
                    >
                      <RiHeart3Fill className="w-4 h-4 text-red-500" />
                      <span>
                        {likesState[selectedProject.id]?.count ?? selectedProject.likesCount ?? 0} Likes
                      </span>
                    </button>

                    {/* Useful Vote in modal */}
                    <button
                      type="button"
                      onClick={() => handleVoteUseful(selectedProject)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer ${usefulVotes[selectedProject.id]?.vote === "useful"
                          ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                          : "bg-background-secondary-default text-text-secondary hover:text-text-primary border border-border-button-default"
                        }`}
                    >
                      <RiSparklingLine className="w-4 h-4 text-emerald-500" />
                      <span>
                        {usefulVotes[selectedProject.id]?.count ?? selectedProject.usefulCount ?? 0} Found Useful
                      </span>
                    </button>

                    {/* Dislike button in modal */}
                    <button
                      type="button"
                      onClick={() => handleVoteNotUseful(selectedProject)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer ${usefulVotes[selectedProject.id]?.vote === "not_useful"
                          ? "bg-zinc-800 text-amber-400 border border-zinc-700"
                          : "bg-background-secondary-default text-text-secondary hover:text-text-primary border border-border-button-default"
                        }`}
                    >
                      <RiThumbDownLine className={`w-4 h-4 ${usefulVotes[selectedProject.id]?.vote === "not_useful" ? "text-amber-400" : ""}`} />
                      <span>
                        {usefulVotes[selectedProject.id]?.notUsefulCount ?? selectedProject.notUsefulCount ?? 0}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleShare(selectedProject)}
                      className="px-3.5 py-2 rounded-full bg-background-secondary-default text-text-secondary hover:text-text-primary border border-border-button-default text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <RiShareForwardLine className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 pt-4 border-t border-separator-border">
                  <h3 className="text-sm font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
                    <RiChat1Line className="w-4 h-4 text-emerald-500" />
                    Artisan Discussion Thread (
                    {(commentsByPost[selectedProject.id] || []).length || selectedProject.commentsCount || 0})
                  </h3>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {(commentsByPost[selectedProject.id] || []).map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-background-secondary-default border border-border-button-default/50"
                      >
                        <img
                          src={comment.author_avatar || "/images/worker_guide_avatar.jpg"}
                          alt={comment.author_name}
                          className="w-8 h-8 rounded-full object-cover border border-border-button-default"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-primary">
                              {comment.author_name}
                            </span>
                            <span className="text-[10px] text-text-tertiary">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary mt-1 whitespace-pre-wrap leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(commentsByPost[selectedProject.id] || []).length === 0 && (
                      <p className="text-xs text-text-tertiary py-2">
                        No comments yet. Start the conversation below!
                      </p>
                    )}
                  </div>

                  {/* Add Comment Input Form */}
                  <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Add technical feedback or ask the artisan a question..."
                      maxLength={1000}
                      className="flex-1 h-12 bg-background-secondary-default border border-border-button-default rounded-full px-5 text-xs font-medium text-text-primary placeholder:text-text-placeholder outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
                    />
                    <button
                      type="submit"
                      disabled={!commentDraft.trim() || submittingComment}
                      className="w-12 h-12 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                      aria-label="Post comment"
                    >
                      <RiSendPlaneFill className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 10. Create Post Modal ── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreatePostModal
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              setIsCreateModalOpen(false);
              fetchPosts();
              showToast("Your craft project was published to the Dire Dawa community!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
