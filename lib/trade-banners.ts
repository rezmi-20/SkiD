export type WorkerTradeKey =
  | "satellite-dish-installer"
  | "plumber"
  | "electrician"
  | "painter"
  | "house-finishing";

export interface TradeBannerMeta {
  key: WorkerTradeKey;
  title: string;
  shortTitle: string;
  bannerUrl: string;
  alt: string;
  iconName: string;
  badgeLabel: string;
  accentColor: string;
  gradientOverlay: string;
  keywords: string[];
}

export const WORKER_TRADE_BANNERS: Record<WorkerTradeKey, TradeBannerMeta> = {
  "satellite-dish-installer": {
    key: "satellite-dish-installer",
    title: "Satellite Dish Installation Specialist",
    shortTitle: "Satellite Dish Installer",
    bannerUrl: "/images/trades/satellite-dish-installer.jpg",
    alt: "Satellite Dish Installer on Rooftop with Signal Meter and DireSkill Gear",
    iconName: "satellite",
    badgeLabel: "Satellite & Telecom",
    accentColor: "#0284c7", // sky-600
    gradientOverlay: "from-sky-950/80 via-zinc-950/40 to-transparent",
    keywords: [
      "satellite",
      "dish",
      "antenna",
      "receiver",
      "lnb",
      "tv",
      "telecom",
      "signal",
      "decoder",
      "satellite dish installer",
    ],
  },
  "plumber": {
    key: "plumber",
    title: "Licensed Plumbing & Sanitary Specialist",
    shortTitle: "Plumber",
    bannerUrl: "/images/trades/plumber.jpg",
    alt: "Professional Plumber Repairing Sink Piping with DireSkill Workwear",
    iconName: "wrench",
    badgeLabel: "Plumbing & Piping",
    accentColor: "#2563eb", // blue-600
    gradientOverlay: "from-blue-950/80 via-zinc-950/40 to-transparent",
    keywords: [
      "plumber",
      "plumbing",
      "pipe",
      "piping",
      "leak",
      "drain",
      "faucet",
      "sink",
      "toilet",
      "water",
      "boiler",
      "sanitary",
    ],
  },
  "electrician": {
    key: "electrician",
    title: "Certified Electrical & Wiring Technician",
    shortTitle: "Electrician",
    bannerUrl: "/images/trades/electrician.jpg",
    alt: "Certified Electrician at Circuit Breaker Panel with Multimeter and DireSkill Gear",
    iconName: "zap",
    badgeLabel: "Electrical Systems",
    accentColor: "#eab308", // amber-500
    gradientOverlay: "from-amber-950/80 via-zinc-950/40 to-transparent",
    keywords: [
      "electrician",
      "electrical",
      "wiring",
      "circuit",
      "breaker",
      "voltage",
      "power",
      "generator",
      "solar",
      "lighting",
      "switch",
      "house wiring",
    ],
  },
  "painter": {
    key: "painter",
    title: "Professional Wall & Interior Painter",
    shortTitle: "Painter",
    bannerUrl: "/images/trades/painter.jpg",
    alt: "Professional Painter with Roller and Paint Cans in DireSkill Workwear",
    iconName: "paint-bucket",
    badgeLabel: "Painting & Coating",
    accentColor: "#8b5cf6", // violet-500
    gradientOverlay: "from-violet-950/80 via-zinc-950/40 to-transparent",
    keywords: [
      "painter",
      "painting",
      "paint",
      "wall",
      "primer",
      "roller",
      "color",
      "coating",
      "interior painting",
      "exterior painting",
    ],
  },
  "house-finishing": {
    key: "house-finishing",
    title: "House Finishing & Drywall Craftsman",
    shortTitle: "House Finishing",
    bannerUrl: "/images/trades/house-finishing.jpg",
    alt: "House Finishing Craftsman with Plaster Float and DireSkill Uniform",
    iconName: "home",
    badgeLabel: "House Finishing",
    accentColor: "#10b981", // emerald-500
    gradientOverlay: "from-emerald-950/80 via-zinc-950/40 to-transparent",
    keywords: [
      "house finishing",
      "finishing",
      "drywall",
      "dry waller",
      "gypsum",
      "plaster",
      "carpenter",
      "carpentry",
      "mason",
      "masonry",
      "tile",
      "tiling",
      "flooring",
      "ceiling",
      "renovation",
      "others",
    ],
  },
};

export const ALL_TRADE_BANNERS = [
  WORKER_TRADE_BANNERS["satellite-dish-installer"],
  WORKER_TRADE_BANNERS["plumber"],
  WORKER_TRADE_BANNERS["electrician"],
  WORKER_TRADE_BANNERS["painter"],
  WORKER_TRADE_BANNERS["house-finishing"],
];

/**
 * Resolves the most appropriate trade hero banner based on skills, occupation, category, or bio.
 */
export function resolveTradeBanner(
  skills?: string[] | string | null,
  bio?: string | null,
  categoryHint?: string | null
): TradeBannerMeta {
  const normalizedTokens: string[] = [];

  if (categoryHint && typeof categoryHint === "string") {
    normalizedTokens.push(categoryHint.toLowerCase());
  }

  if (Array.isArray(skills)) {
    skills.forEach((s) => {
      if (typeof s === "string") normalizedTokens.push(s.toLowerCase());
    });
  } else if (typeof skills === "string" && skills.trim()) {
    normalizedTokens.push(
      ...skills
        .replace(/^\{|\}$/g, "")
        .split(",")
        .map((s) => s.trim().replace(/^"|"$/g, "").toLowerCase())
    );
  }

  if (bio && typeof bio === "string") {
    normalizedTokens.push(bio.toLowerCase());
  }

  const combinedSearchText = normalizedTokens.join(" ");

  // Order of specific match checks:
  // 1. Satellite dish installer (very specific)
  if (
    WORKER_TRADE_BANNERS["satellite-dish-installer"].keywords.some((kw) =>
      combinedSearchText.includes(kw)
    )
  ) {
    return WORKER_TRADE_BANNERS["satellite-dish-installer"];
  }

  // 2. Plumber
  if (
    WORKER_TRADE_BANNERS["plumber"].keywords.some((kw) =>
      combinedSearchText.includes(kw)
    )
  ) {
    return WORKER_TRADE_BANNERS["plumber"];
  }

  // 3. Electrician
  if (
    WORKER_TRADE_BANNERS["electrician"].keywords.some((kw) =>
      combinedSearchText.includes(kw)
    )
  ) {
    return WORKER_TRADE_BANNERS["electrician"];
  }

  // 4. Painter
  if (
    WORKER_TRADE_BANNERS["painter"].keywords.some((kw) =>
      combinedSearchText.includes(kw)
    )
  ) {
    return WORKER_TRADE_BANNERS["painter"];
  }

  // 5. House finishing worker
  if (
    WORKER_TRADE_BANNERS["house-finishing"].keywords.some((kw) =>
      combinedSearchText.includes(kw)
    )
  ) {
    return WORKER_TRADE_BANNERS["house-finishing"];
  }

  // Default fallback: Electrician or House Finishing
  return WORKER_TRADE_BANNERS["electrician"];
}

