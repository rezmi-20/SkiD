# Component Standards

> This document defines the behavior, appearance, and usage rules for every reusable UI component. All components must follow these standards to ensure a consistent, accessible, and scalable user experience.

---

# Core Principles

Every component should be:

- Reusable
- Predictable
- Accessible
- Responsive
- Consistent
- Minimal

Never build a custom component if an existing pattern solves the same problem.

---

# Buttons

## Types

### Primary

Purpose:

- Main call-to-action
- Save
- Create
- Continue
- Submit

Rules:

- Only one primary button per section
- Highest visual emphasis
- Filled background

---

### Secondary

Purpose:

- Alternative actions
- Edit
- Cancel
- View Details

Rules:

- Outline or subtle fill
- Lower emphasis than primary

---

### Ghost

Purpose:

- Toolbar actions
- Inline actions
- Minimal interactions

Rules:

- Transparent background
- Visible hover state

---

### Destructive

Purpose:

- Delete
- Remove
- Archive
- Reset

Rules:

- Use semantic danger color
- Always require confirmation for irreversible actions

---

## Button Sizes

| Size | Height |
|-------|---------|
| Small | 32px |
| Medium | 40px |
| Large | 48px |

---

## Button States

Every button must support:

- Default
- Hover
- Active
- Focus
- Disabled
- Loading

Never leave users wondering if an action is processing.

---

# Inputs

## Text Input

Include:

- Label
- Placeholder
- Validation
- Helper text (optional)

Avoid placeholder-only labels.

---

## Password Input

Always include:

- Show/Hide password toggle
- Strength indicator (if creating passwords)

---

## Search Input

Should support:

- Clear button
- Keyboard shortcut (optional)
- Search icon

---

## Number Input

Use only when numeric values are required.

Provide:

- Validation
- Min/Max limits
- Step controls when appropriate

---

# Textarea

Use for long-form input.

Requirements:

- Label
- Character limit (if applicable)
- Auto-resize when practical

---

# Select

Use when users choose from predefined options.

Rules:

- Searchable when options exceed 10 items
- Display selected value clearly
- Support keyboard navigation

---

# Checkbox

Use for:

- Multiple selections
- Preferences
- Optional settings

Never use checkboxes for mutually exclusive choices.

---

# Radio Group

Use when only one option can be selected.

Always show all available options together.

---

# Switch

Use for immediate on/off settings.

Avoid switches for actions requiring confirmation.

---

# Forms

## Layout

Group related fields together.

Separate unrelated sections.

Avoid long, uninterrupted forms.

---

## Validation

Validate:

- Required fields
- Email format
- Password rules
- Numeric ranges

Provide validation immediately after interaction.

Never wait until submission.

---

## Smart Defaults

Whenever possible:

- Pre-fill known values
- Select common options
- Reduce typing

---

# Cards

Purpose:

Group related content.

A card should contain one clear concept.

Examples:

- Project summary
- User profile
- Statistics
- Report

Avoid using cards only for decoration.

---

# Tables

Tables must support:

- Search
- Sorting
- Filtering
- Pagination
- Empty state

Optional:

- Bulk actions
- Column resizing
- Sticky headers

---

# Lists

Use lists when:

- Items are simple
- Comparison isn't required

Use tables when:

- Multiple attributes must be compared

---

# Badges

Purpose:

Display status.

Examples:

- Active
- Pending
- Draft
- Paid
- Archived

Use semantic colors only.

Never use badges as buttons.

---

# Avatars

Support:

- Image
- Initials
- Placeholder icon

Fallback gracefully if no image exists.

---

# Dropdown Menus

Use for:

- Secondary actions
- Overflow menus
- Context menus

Avoid placing primary actions inside dropdowns.

---

# Tabs

Use tabs to switch between related views.

Examples:

- Overview
- Billing
- Analytics
- Activity

Keep labels short and descriptive.

---

# Accordion

Use when:

- Content is optional
- Large sections can be collapsed

Avoid nesting accordions.

---

# Modal Dialog

Use for:

- Create
- Edit
- Confirmation
- High-focus tasks

Rules:

- Trap keyboard focus
- Close with Escape
- Support backdrop click (unless destructive)

Avoid placing long workflows inside modals.

---

# Drawer

Use when:

- Context should remain visible
- Editing side panels
- Filters
- Settings

Prefer drawers over modals for non-blocking tasks.

---

# Toast Notifications

Purpose:

Provide non-intrusive feedback.

Examples:

- Saved successfully
- Deleted
- Error occurred

Disappear automatically unless user action is required.

---

# Tooltips

Use only to clarify icons or advanced functionality.

Never hide essential information inside tooltips.

---

# Breadcrumbs

Show breadcrumbs when navigation depth exceeds two levels.

Example:

Dashboard → Projects → Marketing → Campaign A

---

# Pagination

Use when datasets become large.

Include:

- Current page
- Total pages
- Next/Previous
- Page size selector (optional)

---

# Skeleton Loaders

Use instead of spinners for page content.

Skeletons improve perceived performance.

---

# Empty States

Every empty state should include:

- Friendly illustration or icon
- Clear explanation
- Primary action
- Optional documentation link

Example:

"No projects yet."

Button:

"Create Project"

---

# Error States

Error messages should:

- Explain what happened
- Suggest how to fix it
- Preserve user input whenever possible

Never display raw system errors.

---

# Success States

Always confirm successful actions.

Examples:

- Toast notification
- Success banner
- Updated UI state

---

# Responsive Behavior

Every component must adapt to:

- Desktop
- Tablet
- Mobile

Avoid horizontal scrolling whenever possible.

---

# Accessibility

Every interactive component must support:

- Keyboard navigation
- Focus indicators
- Screen readers
- ARIA labels where appropriate
- WCAG AA contrast

Accessibility is required—not optional.

---

# Component Checklist

Before introducing a new component, verify:

- Does an existing component already solve this problem?
- Is the component reusable?
- Is it accessible?
- Is it responsive?
- Does it follow the design system?
- Does it reduce complexity instead of increasing it?

---

# Golden Rule

Components are building blocks—not decorations.

Each component should solve one problem exceptionally well and behave consistently throughout the application.