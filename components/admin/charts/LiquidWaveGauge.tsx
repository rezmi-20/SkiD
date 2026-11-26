"use client";

import React, { useId } from "react";

interface LiquidWaveGaugeProps {
  percentage: number;
  size?: number;
  color?: string; // e.g. "#0284c7" or "oklch(0.65 0.2 240)"
  bgColor?: string;
  label?: string;
}

export function LiquidWaveGauge({
  percentage = 50,
  size = 180,
  color = "var(--admin-accent, #0284c7)",
  bgColor = "var(--color-background-secondary-default, oklch(0.18 0.005 260))",
  label = "Verified",
}: LiquidWaveGaugeProps) {
  const clipId = useId();
  const clampedPercent = Math.max(0, Math.min(100, Math.round(percentage)));

  // Center & Radius
  const r = size / 2;
  const innerR = r - 4; // stroke width 4

  // Water level Y from top: 0% => size - stroke, 100% => stroke
  const waterY = size - (size * clampedPercent) / 100;

  // Wave amplitude and wavelength
  const waveAmp = clampedPercent === 0 || clampedPercent === 100 ? 0 : 7;

  // Foreground wave path spanning 2 full wavelengths for smooth animation
  const waveWidth = size * 2;
  const fgWave = `
    M 0 ${waterY}
    Q ${size * 0.25} ${waterY - waveAmp}, ${size * 0.5} ${waterY}
    T ${size} ${waterY}
    T ${size * 1.5} ${waterY}
    T ${waveWidth} ${waterY}
    L ${waveWidth} ${size + 20}
    L 0 ${size + 20}
    Z
  `;

  // Background wave path (offset phase and lower amplitude)
  const bgWave = `
    M 0 ${waterY + 2}
    Q ${size * 0.25} ${waterY + 2 + waveAmp * 0.75}, ${size * 0.5} ${waterY + 2}
    T ${size} ${waterY + 2}
    T ${size * 1.5} ${waterY + 2}
    T ${waveWidth} ${waterY + 2}
    L ${waveWidth} ${size + 20}
    L 0 ${size + 20}
    Z
  `;

  return (
    <div className="flex flex-col items-center justify-center select-none" style={{ width: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}: ${clampedPercent}%`}
        className="overflow-visible"
      >
        <title>{`${label}: ${clampedPercent}%`}</title>
        <desc>{`Completion gauge showing ${clampedPercent} percent for ${label}`}</desc>
        <defs>
          {/* Clip path inside the circle */}
          <clipPath id={clipId}>
            <circle cx={r} cy={r} r={innerR} />
          </clipPath>

          {/* Liquid gradient */}
          <linearGradient id={`liquid-grad-${clipId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.82" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>

          {/* Background liquid tint */}
          <linearGradient id={`bg-liquid-${clipId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Base background circle */}
        <circle cx={r} cy={r} r={innerR} fill={bgColor} className="opacity-70" />

        {/* Liquid Waves clipped inside circle */}
        <g clipPath={`url(#${clipId})`}>
          {/* Background wave layer with CSS animation */}
          <path
            d={bgWave}
            fill={`url(#bg-liquid-${clipId})`}
            className="animate-wave-slow"
            style={{
              animation: "liquid-wave-anim 8s linear infinite reverse",
            }}
          />

          {/* Foreground wave layer with CSS animation */}
          <path
            d={fgWave}
            fill={`url(#liquid-grad-${clipId})`}
            style={{
              animation: "liquid-wave-anim 4.5s linear infinite",
            }}
          />
        </g>

        {/* Outer Circular Ring matching active accent token */}
        <circle
          cx={r}
          cy={r}
          r={innerR}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          className="transition-colors duration-300"
        />

        {/* Percentage text in center */}
        <text
          x={r}
          y={r + 8}
          textAnchor="middle"
          fill="#ffffff"
          className="font-bold tracking-tight drop-shadow-md select-none"
          style={{ fontSize: `${Math.round(size * 0.19)}px`, fontFamily: "inherit" }}
        >
          {clampedPercent}%
        </text>
      </svg>

      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-2">
          {label}
        </span>
      )}

      <style jsx>{`
        @keyframes liquid-wave-anim {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${size}px);
          }
        }
      `}</style>
    </div>
  );
}

