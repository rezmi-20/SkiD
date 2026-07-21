import Link from "next/link";

interface DireSkillLogoProps {
  /** Size of the monogram icon box in px. Default: 40 */
  iconSize?: number;
  /** If true, show the "DIRESKILL" wordmark next to the icon. Default: true */
  showWordmark?: boolean;
  /** Extra className on the outer wrapper */
  className?: string;
  /** Colour variant. "light" = white icon on dark bg, "dark" = dark icon on light bg */
  variant?: "light" | "dark" | "color";
}

/**
 * DireSkillLogo — the official DS monogram + wordmark.
 * Clicking it redirects to the landing page ("/").
 */
export default function DireSkillLogo({
  iconSize = 40,
  showWordmark = true,
  className = "",
  variant = "color",
}: DireSkillLogoProps) {
  const iconBg =
    variant === "dark"
      ? "bg-on-surface"
      : variant === "light"
      ? "bg-white/10 border border-white/20"
      : "bg-primary/10 border border-primary/20";

  const strokeColor =
    variant === "dark"
      ? "text-surface-container-lowest"
      : variant === "light"
      ? "text-white"
      : "text-primary";

  const wordmarkLeft =
    variant === "dark"
      ? "text-on-surface"
      : variant === "light"
      ? "text-white"
      : "text-on-surface";

  const wordmarkRight =
    variant === "dark"
      ? "text-on-surface"
      : variant === "light"
      ? "text-green-400"
      : "text-primary";

  return (
    <Link
      href="/"
      className={`flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 ${className}`}
      aria-label="DireSkill — go to home"
    >
      {/* Icon box */}
      <div
        className={`${iconBg} rounded-xl flex items-center justify-center shrink-0 shadow-md`}
        style={{ width: iconSize, height: iconSize }}
      >
        {/* Inline DS monogram */}
        <svg
          width={Math.round(iconSize * 0.55)}
          height={Math.round(iconSize * 0.55)}
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="16"
          strokeLinejoin="miter"
          strokeLinecap="square"
          className={strokeColor}
        >
          <defs>
            <clipPath id="ds-logo-clip">
              <path
                d="M 0,0 H 200 V 200 H 0 Z M 35,186 L 53,168 L 35,168 Z M 167,81 L 185,63 L 167,63 Z"
                clipRule="evenodd"
              />
            </clipPath>
          </defs>
          <g clipPath="url(#ds-logo-clip)">
            {/* D */}
            <path d="M 70,135 L 70,45 L 110,45 A 45,45 0 0,1 110,135 Z" />
            {/* S */}
            <path d="M 45,178 L 105,178 C 135,178 145,158 140,138 C 130,118 85,118 70,103 C 70,83 85,73 110,73 L 175,73" />
          </g>
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={`font-black tracking-tighter uppercase select-none`}
          style={{ fontSize: Math.round(iconSize * 0.47) }}
        >
          <span className={wordmarkLeft}>DIRE</span>
          <span className={wordmarkRight}>SKILL</span>
        </span>
      )}
    </Link>
  );
}
