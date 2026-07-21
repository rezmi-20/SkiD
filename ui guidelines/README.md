# AI UI/UX Documentation

This directory contains the complete design system and UI/UX standards used by AI coding assistants to generate professional, production-ready interfaces.

These documents are intended to ensure every screen follows the same visual language, interaction patterns, and usability principles regardless of which AI model is generating the code.

---

# Documentation Structure

```
docs/
├── README.md
├── AI_UI_UX_GUIDELINES.md
├── UI_DESIGN_SYSTEM.md
├── COMPONENT_STANDARDS.md
├── DASHBOARD_GUIDELINES.md
├── MARKETPLACE_GUIDELINES.md
├── LANDING_PAGE_GUIDELINES.md
└── DESIGN_REVIEW_CHECKLIST.md
```

---

# Reading Order

The AI should always read these documents in the following order before designing or modifying the UI.

## 1. AI_UI_UX_GUIDELINES.md

Defines the overall philosophy of the application.

Includes:

- Core design principles
- UX psychology
- Accessibility
- Visual consistency
- Product thinking
- Professional UI standards

This document has the highest priority.

---

## 2. UI_DESIGN_SYSTEM.md

Defines the visual language.

Includes:

- Colors
- Typography
- Spacing
- Grid system
- Border radius
- Shadows
- Icons
- Motion
- Responsive behavior

Every component should follow this design system.

---

## 3. COMPONENT_STANDARDS.md

Defines reusable UI components.

Includes:

- Buttons
- Inputs
- Forms
- Tables
- Cards
- Dialogs
- Drawers
- Toasts
- Tabs
- Dropdowns
- Navigation
- Empty states

Never reinvent component behavior.

---

## 4. DASHBOARD_GUIDELINES.md

Rules for SaaS dashboards.

Includes:

- Sidebar architecture
- KPI layouts
- Charts
- Data tables
- Analytics
- Filters
- Search
- Empty states
- Dashboard responsiveness

---

## 5. MARKETPLACE_GUIDELINES.md

Rules specific to hiring and marketplace applications.

Includes:

- Listings
- Candidate profiles
- Search experience
- Messaging
- Payments
- Trust signals
- Reviews
- Hiring workflow

---

## 6. LANDING_PAGE_GUIDELINES.md

Rules for marketing websites.

Includes:

- Hero sections
- Feature sections
- Social proof
- Pricing
- CTA placement
- FAQ
- Product screenshots
- Conversion optimization

---

## 7. DESIGN_REVIEW_CHECKLIST.md

The final quality assurance checklist.

Run this checklist before accepting any UI changes.

No screen should be considered complete until every item passes.

---

# AI Workflow

Whenever asked to build a UI, follow this process.

## Step 1

Understand the user's objective.

Ask:

> What is the user trying to accomplish?

Never start by choosing components.

---

## Step 2

Read:

```
AI_UI_UX_GUIDELINES.md
```

Apply the design philosophy.

---

## Step 3

Read:

```
UI_DESIGN_SYSTEM.md
```

Apply typography, spacing, colors, grids, and layout rules.

---

## Step 4

Read:

```
COMPONENT_STANDARDS.md
```

Reuse existing component patterns.

Avoid creating custom UI unnecessarily.

---

## Step 5

If building a dashboard

Read:

```
DASHBOARD_GUIDELINES.md
```

---

## Step 6

If building a hiring marketplace

Read:

```
MARKETPLACE_GUIDELINES.md
```

---

## Step 7

If building a marketing website

Read:

```
LANDING_PAGE_GUIDELINES.md
```

---

## Step 8

Before finishing

Run:

```
DESIGN_REVIEW_CHECKLIST.md
```

Fix every issue before returning the result.

---

# General Rules

Always:

- Design for users first.
- Remove unnecessary UI.
- Reduce cognitive load.
- Use consistent spacing.
- Use semantic colors.
- Maintain accessibility.
- Prefer clarity over decoration.
- Build responsive layouts.
- Keep interactions predictable.

Never:

- Use emojis in the interface.
- Use random colors.
- Duplicate information.
- Add placeholder widgets.
- Generate fake statistics.
- Overcrowd dashboards.
- Create confusing navigation.
- Use dark patterns.

---

# Supported Technologies

These documents are optimized for projects using:

- React
- Next.js
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide Icons
- Framer Motion
- TanStack Table
- Recharts

---

# Design Inspiration

Every generated interface should feel comparable to products built by:

- Stripe
- Linear
- Notion
- Vercel
- GitHub
- Clerk
- Framer
- Figma

If the result would look out of place beside these products, refine it further.

---

# Golden Rule

A user should immediately understand:

- Where they are.
- What they can do.
- What they should do next.

Every screen should feel intentional, trustworthy, and professionally crafted—not AI-generated.