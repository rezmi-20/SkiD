---
version: alpha
name: "dire-skill.vercel.app-inspired"
description: "A design system measured from dire-skill.vercel.app on 2026-11-10. Inspired by it, not affiliated with it."
colors:
  background: "#020202"
  text: "#ffffffe6"
  heading: "#ffffff"
  text-muted: "#8c8880"
  text-subtle: "#666666"
  border: "#e2e0d8"
  surface: "#0a0b0d"
  surface-inverse: "#faf9f5"
  text-inverse: "#666666"
  primary: "#00e575"
  primary-foreground: "#000000"
  chart-1: "#00e575"
  chart-2: "#ffa1ad"
  chart-3: "#007a55"
  chart-4: "#ff416c"
typography:
  display:
    fontFamily: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: 104px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.025em
  h1:
    fontFamily: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: 82px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.04em
  h2:
    fontFamily: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: -0.025em
  h3:
    fontFamily: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.025em
  h4:
    fontFamily: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
  h5:
    fontFamily: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.625
  body-lg:
    fontFamily: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.625
  body-sm:
    fontFamily: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.625
  caption:
    fontFamily: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.625
  code:
    fontFamily: "\"IBM Plex Mono\", ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: 9px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  2xl: 22px
  3xl: 44.8px
  full: 9999px
spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 20px
  "6": 24px
  "7": 28px
  "8": 32px
  "9": 36px
  "10": 40px
  "12": 48px
  "16": 64px
  "28": 112px
  section: 112px
  section-alt: 128px
components:
  button-subtle:
    backgroundColor: "#ffffffcc"
    textColor: "#1b1b1b"
    rounded: "{rounded.full}"
    padding: "4px 13px"
    height: 26px
  button-subtle-hover:
    backgroundColor: "{colors.heading}"
  button-outline:
    backgroundColor: transparent
    textColor: "#ffffffb2"
    rounded: "{rounded.full}"
    padding: "0px 11px"
    height: 40px
  button-dark:
    backgroundColor: "#000000"
    textColor: "{colors.heading}"
    rounded: "{rounded.full}"
    padding: "10px 24px"
    height: 36px
  button-dark-hover:
    backgroundColor: "#181818"
  card:
    backgroundColor: "{colors.heading}"
    textColor: "{colors.text}"
    rounded: 28px
    padding: 24px
  badge:
    backgroundColor: "#00000099"
    textColor: "#ffffffcc"
    typography: "{typography.code}"
    rounded: "{rounded.full}"
    padding: "0px 4px"
  band-inverse:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.text-inverse}"
  page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
---

<!-- extract-design: the front matter above is generated from design-system/roles.json. Change roles.json, then run extract.mjs --rebuild to refresh it. The prose below is yours. -->

# dire-skill.vercel.app-inspired design system

> Measured from https://dire-skill.vercel.app on 2026-11-10: 3 page visits (/) at 1440px and 390px. The values are what the browser rendered. The names and the prose are judgment: check them against the screenshots in `design-system/source/screens/`. Inspired by dire-skill.vercel.app, not affiliated with it: never use its logo, illustrations, photos or words.

## Overview

<!-- write: 3–5 sentences on the feel, in concrete terms (light or dark, dense or airy, sharp or soft, quiet or loud), what makes it recognisable, and the one bold thing. Describe what you see in the screenshots. -->

What was measured: a dark interface on `#020202`, headings in `#ffffff`, body text in `#ffffffe6`, and `#00e575` for the main action. Type is Plus Jakarta Sans and IBM Plex Mono. Space runs on a 4px grid. Corners are 22px, 44.8px, and pills where the site uses them.

## Colors

| Token | Value | Use it for | On background |
|---|---|---|---|
| `{colors.background}` | `#020202` | the page background on most pages | 1:1 |
| `{colors.text}` | `#ffffffe6` | body copy (paragraphs and lists) | 16.62:1 |
| `{colors.heading}` | `#ffffff` | headings (h1–h6) | 20.75:1 |
| `{colors.text-muted}` | `#8c8880` | 10% of text: secondary copy | 5.88:1 |
| `{colors.text-subtle}` | `#666666` | 10% of text: the quietest copy | 3.61:1 |
| `{colors.border}` | `#e2e0d8` | the most used border colour (by length) | 15.7:1 |
| `{colors.surface}` | `#0a0b0d` | panels and sections a step off the background | 1.05:1 |
| `{colors.surface-inverse}` | `#faf9f5` | the contrasting band (dark sections on a light site, or the reverse) | 19.69:1 |
| `{colors.text-inverse}` | `#666666` | text on the contrasting band | 3.61:1 |
| `{colors.primary}` | `#00e575` | the saturated colour on buttons and links | 12.32:1 |
| `{colors.primary-foreground}` | `#000000` | the readable choice on primary | 1.01:1 |

The full palette (48 colours, most used first) is in `design-system/tokens.css` as `--color-<name>`: neutral-50 `#faf9f5` (39.8%), white-a90 `#ffffffe6` (7.3%), neutral-950 `#1b1b1b` (4.9%), neutral-900 `#333333` (4%), neutral-600 `#8c8880` (3.5%), white-a80 `#ffffffcc` (3.2%), neutral-700 `#666666` (2.7%), black `#000000` (2.3%), green-400-a60 `#00e47599` (2.1%), neutral-950-2 `#0a0b0d` (1.7%), ….

Gradients the site paints: `linear-gradient(to top, oklab(0 0 0 / 0.6) 0%, oklab(0 0 0 / 0.2) 50%, rgba(0, 0, 0, 0) 100%)`; `linear-gradient(to top, rgb(0, 0, 0) 0%, oklab(0 0 0 / 0.75) 50%, oklab(0 0 0 / 0.45) 100%)`; `linear-gradient(to right bottom, lab(5.55256 -3.58823 1.21086 / 0.8) 0%, lab(2.74366 -1.30288 0.379351 / 0.9) 50%, rgba(0, 0, 0, 0) 100%)`.

<!-- write: when to use each colour and when not to (e.g. primary only for the one main action per view). -->

## Typography

- **sans**: Plus Jakarta Sans (free). Stack: `"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`
- **mono**: IBM Plex Mono (free). Stack: `"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace`

| Token | Size | Phone | Line height | Tracking | Weight | Font |
|---|---|---|---|---|---|---|
| `{typography.display}` | 104px | 30px | 1 | -0.025em | 700 | sans |
| `{typography.h1}` | 82px | 44px | 1.05 | -0.04em | 700 | sans |
| `{typography.h2}` | 48px | 30px | 1.15 | -0.025em | 400 | sans |
| `{typography.h3}` | 30px | 24px | 1.2 | -0.025em | 600 | sans |
| `{typography.h4}` | 24px | 20px | 1.25 | 0 | 700 | sans |
| `{typography.h5}` | 20px | 16px | 1.625 | 0 | 400 | sans |
| `{typography.body-lg}` | 18px | 14px | 1.625 | 0 | 400 | sans |
| `{typography.body}` | 15px | same | 1.625 | 0 | 400 | sans |
| `{typography.body-sm}` | 14px | same | 1.625 | 0 | 400 | sans |
| `{typography.caption}` | 12px | same | 1.625 | 0 | 400 | sans |
| `{typography.code}` | 9px | same | 1.5 | 0 | 400 | mono |

Weights in use: 400 (64.6%), 700 (22.3%), 500 (6.4%), 600 (4.5%), 900 (1.2%). Steps grow by about ×1.2. Text is antialiased (`-webkit-font-smoothing: antialiased`).

<!-- write: the principles you see (e.g. light weights at large sizes, tight tracking on headlines, sentence case). -->

## Layout

- Grid: 4px. Spacing steps: 4px, 8px, 12px, 16px, 20px, 24px, 28px, 32px, 36px, 40px, 48px, 64px, 112px (`--space-<n>`, where n × 4 = px).
- Sections: 112px or 128px of vertical padding on desktop, 56px or 96px on phones.
- Content width: page 1360px, wide 672px, narrow 1326px (`--container-<name>`).
- Grids: 4 columns, 12 columns, 2 columns, 3 columns.
- The home page alternates bands: `#faf9f5` → `#0a0b0d` → `#faf9f5` → `#000000`.

<!-- write: how much whitespace, how sections are separated, alignment habits. -->

## Elevation & Depth

| Token | Shadow |
|---|---|
| `--shadow-xs` | `rgba(0, 0, 0, 0.15) 0px 1px 3px 0px` |
| `--shadow-sm` | `rgba(0, 0, 0, 0.4) 0px 1px 3px 0px` |
| `--shadow-md` | `rgba(0, 0, 0, 0.25) 0px 1px 3px 0px, rgba(0, 0, 0, 0.25) 0px 1px 2px -1px` |
| `--shadow-lg` | `rgba(0, 0, 0, 0.25) 0px 1px 3px 0px, rgba(0, 0, 0, 0.25) 0px 2px 4px -1px` |
| `--shadow-xl` | `rgba(0, 0, 0, 0.3) 0px 1px 3px 0px, rgba(0, 0, 0, 0.3) 0px 4px 6px -1px` |
| `--shadow-2xl` | `rgb(5, 8, 7) 0px 4px 0px 0px, rgba(0, 0, 0, 0.5) 0px 8px 16px 0px` |

Effects: `filter: drop-shadow(rgba(0, 0, 0, 0.12) 0px 3px 3px)`, `filter: blur(1.1px) drop-shadow(rgba(0, 229, 117, 0.5) 0px 0px 10px)`, `backdrop-filter: blur(12px)`, `backdrop-filter: blur(8px)`.

<!-- write: what lifts and what stays flat (cards, menus, dialogs). -->

## Shapes

Radius scale: `{rounded.2xl}` 22px, `{rounded.3xl}` 44.8px, `{rounded.full}` pill. Borders: 1px in `#e2e0d8`.

## Components

### Buttons

- **subtle** (“Electrician”, ×5): `#ffffffcc` with a 1px `#d9d7d099` border, text `#1b1b1b`, pill, 26px tall, padding 4/13/4/13, 12px weight 500, shadow `rgba(0, 0, 0, 0.15) 0px 1px 3px 0px`. Hover: fill `#ffffff`. Focus: `1px auto oklab(0.854496 -0.157047 0.0582466 / 0.5)`.
- **outline** (“Share”, ×2): no fill with a 1px `#ffffff1a` border, text `#ffffffb2`, pill, 40px tall, padding 0/11/0/11, 16px weight 400.
- **outline** (“D”, ×1): no fill with a 1px `#faf9f5cc` border, text `#1b1b1b`, pill, 34px tall, padding 0/12/0/12, 16px weight 400. Hover: no visible change. Focus: `1px auto oklab(0.854496 -0.157047 0.0582466 / 0.5)`.
- **outline** (“Get Started”, ×1): no fill with a 1px `#f8f8f54d` border, text `#faf9f5`, pill, 32px tall, padding 0/17/0/17, 12px weight 600. Hover: fill `#faf9f5`, text `#000000`. Focus: `1px auto oklab(0.854496 -0.157047 0.0582466 / 0.5)`.
- **dark** (“Search”, ×1): `#000000`, text `#ffffff`, pill, 36px tall, padding 10/24/10/24, 12px weight 700. Hover: fill `#181818`. Focus: `1px auto oklab(0.854496 -0.157047 0.0582466 / 0.5)`.
- **subtle** (“Explore Directory”, ×1): `#ffffffe6` with a 1px `#ffffff99` border, text `#1b1b1b`, pill, 42px tall, padding 12/21/12/21, 12px weight 700, shadow `rgba(0, 0, 0, 0.3) 0px 1px 3px 0px, rgba(0, 0, 0, 0.3) 0px 4px 6px -1px`. Hover: fill `#ffffff`. Focus: `1px auto oklab(0.854496 -0.157047 0.0582466 / 0.5)`.

### Cards

- ×8: `#ffffff` on `#faf9f5`, 1px `#e4e2da` border, 28px corners, 24px padding, shadow `rgba(0, 0, 0, 0.15) 0px 1px 3px 0px`.
- ×3: `#14161bcc` on `#0a0b0d`, 1px `#ffffff1a` border, 37.4px corners, 20px padding, shadow `rgba(0, 0, 0, 0.25) 0px 1px 3px 0px, rgba(0, 0, 0, 0.25) 0px 2px 4px -1px`.
- ×1: `#ffffff1a` on `#faf9f5`, 1px `#ffffff26` border, 37.4px corners, 16px padding.

### Badges

- “From ETB 4,500”: `#00000099`, text `#ffffffcc`, pill, 9px.
- “Verified Job”: `#ecfdf5`, text `#007a55`, pill, 10px.

<!-- write: the site's signature components you can see in the screenshots, and how to build each from the tokens. -->

## Do's and Don'ts

### Do

- Use the tokens for every colour, size, space, radius and shadow. If a value is missing, add a token; don't hard-code it.
- Keep `{colors.primary}` for the one main action on a screen.
- Headings in `{colors.heading}`, running text in `{colors.text}`.
<!-- write: the habits that make it look like the site (from the screenshots). -->

### Don't

- Don't use dire-skill.vercel.app's logo, illustrations, photos, icons or copy. Draw your own.
<!-- write: the mistakes that would break the look. -->

## Motion

`--duration-fast` 150ms, `--duration-base` 300ms, `--duration-slow` 700ms; easing `--ease-standard` `cubic-bezier(0.4, 0, 0.2, 1)`, `--ease-alt-1` `cubic-bezier(0, 0, 0.2, 1)`. Transitions animate all, color, background-color, border-color, outline-color, text-decoration-color. The site respects `prefers-reduced-motion`; so should you.

## Iconography & Graphics

- Icons: line icons, strokes ≈ 1.75px at a 24px grid, round caps, round joins, drawn at 39px/16px/14px/13px (by size: 39px line 1.75px, 16px line 1.75px, 14px line 1.75px, 13px line 1.75px). They take the text colour (`currentColor`). See `design-system/source/screens/icons.png`.
- Chart colours, in order: `{colors.chart-1}` `#00e575`, `{colors.chart-2}` `#ffa1ad`, `{colors.chart-3}` `#007a55`, `{colors.chart-4}` `#ff416c` (`--color-chart-<n>`; the first is the highlight, the rest are context or more series). Gridlines in `#e2e0d8`, labels in `#8c8880`.
<!-- write: illustration style (flat, gradient, line, isometric, photo), how graphics sit on the page, and what to avoid. The draw-svg skill reads this section. -->

## Responsive Behavior

- Breakpoints: none found (mobile-first (min-width queries)).
- On phones: display 104→30px, h1 82→44px, h2 48→30px, h3 30→24px, h4 24→20px, h5 20→16px, body-lg 18→14px.

## Known Gaps

- No other pages of the same site were linked from the start page, so only it was measured. Add pages with --include /path,/other.
- The site looks the same with dark mode on, so there's no dark theme to extract (it may switch with a toggle instead; see css.darkSelectors).
- The CSS has dark-mode selectors (.dark, [data-sonner-theme="dark"]) but the page didn't switch with the system setting: dark mode is a toggle, or a class for dark sections only. Check the screenshots before adding a dark theme.
- Hover and focus states were measured on the most common buttons, links and fields only.
<!-- write: anything you couldn't see or confirm. -->

## Files

- `design-system/tokens.css`: every token as a CSS custom property. Import it once, globally.
- `design-system/theme.css`: the same tokens as a Tailwind CSS v4 theme (`@import` it after Tailwind).
- `design-system/design.tokens.json`: W3C Design Tokens (2025.10) for Figma plugins, Style Dictionary or Terrazzo.
- `design-system/roles.json`: the choices behind the names. Change it and run `extract.mjs --rebuild`.
- `design-system/preview.html`: every token, a sample page built only from them, and the real site's screenshots.
