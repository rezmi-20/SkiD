# UI Design System

> Defines the visual language used across the entire application. Every screen, component, and layout must follow these standards to ensure consistency and professionalism.

---

# Design Principles

The design system exists to create:

- Consistency
- Predictability
- Scalability
- Accessibility
- Maintainability

Every UI element should feel like it belongs to the same product.

---

# Design Tokens

## Base Unit

Use an **8px spacing system**.

Common values:

```
4px
8px
12px
16px
24px
32px
40px
48px
64px
80px
96px
```

Never use arbitrary spacing values.

---

# Typography

## Font Family

Recommended fonts:

- Inter
- Geist
- SF Pro Display (Apple)
- IBM Plex Sans

Never mix font families.

---

## Font Scale

| Style | Size | Weight |
|--------|------|--------|
| Display | 48px | Bold |
| H1 | 36px | Bold |
| H2 | 30px | SemiBold |
| H3 | 24px | SemiBold |
| H4 | 20px | Medium |
| Body Large | 18px | Regular |
| Body | 16px | Regular |
| Small | 14px | Regular |
| Caption | 12px | Medium |

---

## Line Height

Use approximately:

```
120% for headings

150% for body text
```

Never allow cramped typography.

---

# Color System

## Neutral Palette

```
Background

Surface

Border

Muted Background

Primary Text

Secondary Text

Disabled Text
```

Use neutral colors for most UI.

---

## Semantic Colors

### Primary

Used for:

- Main buttons
- Links
- Active states

---

### Success

Used for:

- Completed actions
- Positive status
- Success badges

---

### Warning

Used for:

- Pending actions
- Alerts
- Warnings

---

### Error

Used for:

- Validation
- Failures
- Destructive actions

---

### Info

Used for:

- Notifications
- Informational messages

---

Never assign colors randomly.

Every color should communicate meaning.

---

# Background Hierarchy

Use layered surfaces.

Example hierarchy:

```
Application Background

↓

Page Background

↓

Card Surface

↓

Interactive Surface
```

Avoid excessive contrast.

---

# Borders

Use subtle borders.

Recommended:

```
1px
```

Avoid thick borders.

Use borders primarily to separate related content.

---

# Border Radius

Maintain consistency.

Recommended values:

| Component | Radius |
|-----------|---------|
| Buttons | 10px |
| Inputs | 10px |
| Cards | 16px |
| Dialogs | 20px |
| Badges | Full |
| Avatars | Full |

Never mix inconsistent radius values.

---

# Shadows

Use elevation sparingly.

Recommended:

- Small
- Medium
- Large

Avoid dramatic shadows.

Shadows should communicate elevation—not decoration.

---

# Icons

Preferred libraries:

- Lucide
- Phosphor
- Heroicons

Rules:

- Same stroke width
- Same visual weight
- Same icon family

Never mix icon styles.

---

# Buttons

Primary

- Filled
- Highest emphasis

Secondary

- Outline

Ghost

- Minimal emphasis

Danger

- Destructive actions only

Never display multiple competing primary buttons.

---

# Inputs

Maintain consistent:

- Height
- Padding
- Border radius
- Label spacing

Always include:

- Label
- Placeholder
- Validation
- Helper text (when needed)

---

# Cards

Cards should group related information.

Every card must have:

- Consistent padding
- Clear title
- Logical spacing

Avoid decorative cards.

---

# Tables

Tables should support:

- Search
- Sorting
- Filtering
- Pagination

Maintain generous row spacing.

---

# Forms

Always:

- Group related fields
- Minimize required inputs
- Provide sensible defaults
- Validate inline

Avoid overwhelming users.

---

# Navigation

Maintain clear hierarchy.

Primary Navigation

↓

Secondary Navigation

↓

Page Actions

↓

Content

Users should always know where they are.

---

# Motion

Animations should feel natural.

Recommended durations:

```
100ms

150ms

200ms

250ms
```

Avoid:

- Slow animations
- Bouncy transitions
- Distracting effects

Motion should communicate state changes.

---

# Loading States

Prefer:

- Skeleton loaders
- Progress indicators
- Optimistic updates

Avoid blank screens.

---

# Empty States

Every empty state should include:

- Clear message
- Illustration or icon
- Explanation
- Primary action

Help users recover quickly.

---

# Responsive Breakpoints

Recommended:

```
Mobile

0–767px

Tablet

768–1023px

Desktop

1024–1439px

Large Desktop

1440px+
```

Design each breakpoint intentionally.

---

# Grid System

Use consistent layouts.

Recommended:

Desktop

```
12 Columns
```

Tablet

```
8 Columns
```

Mobile

```
4 Columns
```

Respect gutters and margins.

---

# Accessibility

Maintain:

- WCAG AA contrast
- Visible focus states
- Keyboard navigation
- Proper semantic HTML

Accessibility is mandatory.

---

# Dark Mode

Support both:

- Light Mode
- Dark Mode

Never simply invert colors.

Adjust:

- Backgrounds
- Borders
- Shadows
- Text contrast

for optimal readability.

---

# Design Consistency Checklist

Before finalizing any screen, verify:

- Typography follows the scale.
- Colors follow semantic meaning.
- Spacing uses the 8px grid.
- Radius values are consistent.
- Shadows are minimal.
- Icons belong to one library.
- Components match existing patterns.
- Layout aligns to the grid.
- Responsive behavior is correct.
- Accessibility requirements are satisfied.

---

# Golden Rule

A user should never notice the design system.

They should simply feel that every screen belongs to the same thoughtfully designed product.