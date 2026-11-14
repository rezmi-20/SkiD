import Link from "next/link";
import Image from "next/image";

interface DireSkillLogoProps {
  /** Size of the monogram icon in px. Default: 36 */
  iconSize?: number;
  /** If true, show the "DireSkill" wordmark next to the icon. Default: true */
  showWordmark?: boolean;
  /** Extra className on the outer wrapper */
  className?: string;
  /** Colour variant. "light" = white/green on dark bg, "dark" = dark/green on light bg, "color" = adaptive */
  variant?: "light" | "dark" | "color";
  /** Optional custom redirect href */
  href?: string;
  /** Optional click handler */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * DireSkillLogo — Official DS (wrench + hammer) emblem and wordmark.
 * Uses the authentic brand identity across auth, sidebars, and navigation.
 */
export default function DireSkillLogo({
  iconSize = 36,
  showWordmark = true,
  className = "",
  variant = "color",
  href = "/",
  onClick,
}: DireSkillLogoProps) {
  const wordmarkLeft =
    variant === "dark"
      ? "text-zinc-900"
      : variant === "light"
      ? "text-white"
      : "text-zinc-900 dark:text-white";

  const wordmarkRight = "text-[#45BA50]";

  const iconSrc =
    variant === "light"
      ? "/direskill_icon.png"
      : variant === "dark"
      ? "/images/direskill_icon_light.png"
      : null;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 active:scale-[0.96] transition-all duration-150 ease-out select-none group ${className}`}
      aria-label="DireSkill — Home"
    >
      {/* Official DS Emblem (Wrench + Hammer) */}
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        {iconSrc ? (
          <img
            src={iconSrc}
            alt="DireSkill Emblem"
            width={iconSize}
            height={Math.round(iconSize * (195 / 222))}
            className="w-auto h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <>
            {/* Light Mode adaptive (dark D, green S) */}
            <img
              src="/images/direskill_icon_light.png"
              alt="DireSkill Emblem"
              width={iconSize}
              height={Math.round(iconSize * (195 / 222))}
              className="w-auto h-full object-contain filter drop-shadow-sm block dark:hidden group-hover:scale-105 transition-transform duration-200"
            />
            {/* Dark Mode adaptive (white D, green S) */}
            <img
              src="/direskill_icon.png"
              alt="DireSkill Emblem"
              width={iconSize}
              height={Math.round(iconSize * (195 / 222))}
              className="w-auto h-full object-contain filter drop-shadow-sm hidden dark:block group-hover:scale-105 transition-transform duration-200"
            />
          </>
        )}
      </div>

      {/* Official Wordmark */}
      {showWordmark && (
        <span
          className="font-extrabold tracking-tight flex items-center leading-none"
          style={{ fontSize: Math.round(iconSize * 0.58) }}
        >
          <span className={`${wordmarkLeft} transition-colors`}>Dire</span>
          <span className={`${wordmarkRight} font-black`}>Skill</span>
        </span>
      )}
    </Link>
  );
}
