"use client";

import React from "react";

export type EmptyStateKind = "contracts" | "messages" | "search" | "offers" | "reviews";

interface EmptyStateIllustrationProps {
  kind: EmptyStateKind;
  className?: string;
}

/**
 * On-brand vector spot illustrations built from simple grid-aligned primitives
 * using semantic CSS custom property fallbacks for light/dark polarity.
 */
export default function EmptyStateIllustration({
  kind,
  className = "w-24 h-18 mx-auto",
}: EmptyStateIllustrationProps) {
  return (
    <svg
      viewBox="0 0 96 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Subtle circular backdrop glow */}
      <circle
        cx="48"
        cy="36"
        r="28"
        fill="var(--color-primary, #45BA50)"
        fillOpacity="0.09"
      />
      <circle
        cx="48"
        cy="36"
        r="20"
        stroke="var(--color-primary, #45BA50)"
        strokeOpacity="0.22"
        strokeWidth="1.25"
        strokeDasharray="3 3"
      />

      {kind === "messages" && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <rect
            x="22"
            y="18"
            width="40"
            height="28"
            rx="8"
            fill="var(--md-sys-color-surface-container-lowest, #ffffff)"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.75"
          />
          <line x1="30" y1="28" x2="52" y2="28" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.75" />
          <line x1="30" y1="35" x2="44" y2="35" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.75" />
          <rect
            x="44"
            y="32"
            width="30"
            height="22"
            rx="7"
            fill="var(--color-primary, #45BA50)"
            fillOpacity="0.18"
            stroke="var(--color-primary, #45BA50)"
            strokeWidth="1.75"
          />
          <circle cx="53" cy="43" r="1.5" fill="var(--color-primary, #45BA50)" />
          <circle cx="59" cy="43" r="1.5" fill="var(--color-primary, #45BA50)" />
          <circle cx="65" cy="43" r="1.5" fill="var(--color-primary, #45BA50)" />
        </g>
      )}

      {kind === "contracts" && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <rect
            x="28"
            y="12"
            width="36"
            height="46"
            rx="6"
            fill="var(--md-sys-color-surface-container-lowest, #ffffff)"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.75"
          />
          <line x1="36" y1="24" x2="56" y2="24" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.75" />
          <line x1="36" y1="32" x2="52" y2="32" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.75" />
          <line x1="36" y1="40" x2="46" y2="40" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.75" />
          <circle
            cx="62"
            cy="48"
            r="10"
            fill="var(--color-primary, #45BA50)"
            fillOpacity="0.18"
            stroke="var(--color-primary, #45BA50)"
            strokeWidth="1.75"
          />
          <path d="M58 48l3 3 5-6" stroke="var(--color-primary, #45BA50)" strokeWidth="2" />
        </g>
      )}

      {kind === "offers" && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <rect
            x="24"
            y="22"
            width="48"
            height="32"
            rx="7"
            fill="var(--md-sys-color-surface-container-lowest, #ffffff)"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.75"
          />
          <path d="M40 22v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.75" />
          <line x1="24" y1="34" x2="72" y2="34" stroke="var(--color-primary, #45BA50)" strokeWidth="1.75" />
          <rect x="44" y="31" width="8" height="6" rx="2" fill="var(--color-primary, #45BA50)" />
        </g>
      )}

      {kind === "search" && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <circle
            cx="44"
            cy="33"
            r="15"
            fill="var(--md-sys-color-surface-container-lowest, #ffffff)"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="1.75"
          />
          <circle cx="44" cy="33" r="6" stroke="var(--color-primary, #45BA50)" strokeWidth="1.75" />
          <line x1="55" y1="44" x2="67" y2="56" stroke="var(--color-primary, #45BA50)" strokeWidth="2.5" />
        </g>
      )}

      {kind === "reviews" && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <rect
            x="22"
            y="18"
            width="52"
            height="34"
            rx="8"
            fill="var(--md-sys-color-surface-container-lowest, #ffffff)"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.75"
          />
          <path
            d="M48 25l2.3 4.6 5.1.7-3.7 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1-3.7-3.6 5.1-.7L48 25z"
            fill="var(--color-primary, #45BA50)"
            fillOpacity="0.2"
            stroke="var(--color-primary, #45BA50)"
            strokeWidth="1.5"
          />
        </g>
      )}
    </svg>
  );
}
