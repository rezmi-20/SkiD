# Design Review Checklist

> This checklist must be completed before any UI or UX changes are accepted into production. Its purpose is to ensure every interface is polished, accessible, consistent, and aligned with the design system.

---

# Review Process

Every screen should pass the following review stages:

1. Visual Design
2. Layout
3. Components
4. User Experience
5. Accessibility
6. Responsiveness
7. Performance
8. Content
9. Quality Assurance

Do not merge designs that fail any critical section.

---

# Visual Design

## Consistency

- [ ] Uses the design system
- [ ] Consistent typography
- [ ] Consistent spacing
- [ ] Consistent border radius
- [ ] Consistent shadows
- [ ] Consistent icon style

---

## Colors

- [ ] Semantic colors only
- [ ] Primary color used consistently
- [ ] Error colors only for errors
- [ ] Success colors only for success
- [ ] No random accent colors

---

## Typography

- [ ] Proper heading hierarchy
- [ ] Readable body text
- [ ] Appropriate font sizes
- [ ] Consistent font weights
- [ ] Adequate line spacing

---

# Layout

## Structure

- [ ] Logical information hierarchy
- [ ] Proper whitespace
- [ ] Consistent alignment
- [ ] Balanced layout
- [ ] No visual clutter

---

## Spacing

- [ ] Uses 8px spacing system
- [ ] Equal spacing between sections
- [ ] Proper padding inside cards
- [ ] Consistent margins

---

## Navigation

- [ ] Easy to understand
- [ ] Active page highlighted
- [ ] Breadcrumbs where necessary
- [ ] No dead-end navigation

---

# Components

## Buttons

- [ ] Only one primary action
- [ ] Secondary actions clearly distinguished
- [ ] Hover states
- [ ] Focus states
- [ ] Disabled states
- [ ] Loading states

---

## Forms

- [ ] Labels provided
- [ ] Validation messages
- [ ] Helper text where appropriate
- [ ] Smart defaults used
- [ ] Required fields indicated

---

## Tables

- [ ] Search available
- [ ] Sorting works
- [ ] Filtering works
- [ ] Pagination implemented (if needed)
- [ ] Empty state available

---

## Cards

- [ ] One purpose per card
- [ ] Consistent padding
- [ ] Clear hierarchy
- [ ] No unnecessary decoration

---

## Dialogs

- [ ] Correct size
- [ ] Escape closes dialog
- [ ] Focus trapped
- [ ] Destructive actions confirmed

---

# User Experience

## Clarity

- [ ] User immediately understands the page
- [ ] Primary action is obvious
- [ ] Labels are descriptive
- [ ] Icons support understanding

---

## Feedback

- [ ] Success messages displayed
- [ ] Errors clearly explained
- [ ] Loading indicators shown
- [ ] Empty states handled

---

## Interaction

- [ ] Hover feedback
- [ ] Keyboard navigation
- [ ] Focus visibility
- [ ] Smooth transitions

---

## Cognitive Load

- [ ] No unnecessary steps
- [ ] No duplicate information
- [ ] Minimal distractions
- [ ] Logical workflow

---

# Dashboard Review

If reviewing a dashboard:

- [ ] KPIs are meaningful
- [ ] No duplicate metrics
- [ ] Charts answer real questions
- [ ] Filters are useful
- [ ] Search works
- [ ] Tables are readable
- [ ] Actions are easy to find

---

# Marketplace Review

If reviewing a marketplace:

- [ ] Trust signals visible
- [ ] Profiles complete
- [ ] Search intuitive
- [ ] Filters useful
- [ ] Pricing transparent
- [ ] Reviews authentic
- [ ] Messaging contextual

---

# Landing Page Review

If reviewing a landing page:

- [ ] Hero explains product immediately
- [ ] Strong value proposition
- [ ] Single primary CTA
- [ ] Product screenshots included
- [ ] Testimonials present
- [ ] Pricing easy to understand
- [ ] FAQ addresses objections

---

# Accessibility

## Keyboard

- [ ] Fully navigable
- [ ] Logical tab order
- [ ] Focus indicators visible

---

## Screen Readers

- [ ] Semantic HTML
- [ ] ARIA labels where needed
- [ ] Form labels connected
- [ ] Images have alt text

---

## Contrast

- [ ] WCAG AA compliant
- [ ] Text readable
- [ ] Interactive elements distinguishable

---

# Responsiveness

## Desktop

- [ ] Layout balanced
- [ ] No overflow
- [ ] Proper spacing

---

## Tablet

- [ ] Navigation adapts
- [ ] Grid adjusts
- [ ] Components resize correctly

---

## Mobile

- [ ] Single-column layout where appropriate
- [ ] Touch targets ≥ 44px
- [ ] Readable typography
- [ ] No horizontal scrolling

---

# Performance

- [ ] Images optimized
- [ ] Lazy loading used
- [ ] Skeleton loaders present
- [ ] No unnecessary animations
- [ ] Efficient rendering

---

# Content Review

- [ ] Grammar correct
- [ ] Clear wording
- [ ] No placeholder text
- [ ] No Lorem Ipsum
- [ ] No fake data in production
- [ ] Consistent terminology

---

# Error Handling

Verify:

- [ ] Empty states
- [ ] Loading states
- [ ] Network errors
- [ ] Permission errors
- [ ] Validation errors
- [ ] Offline behavior (if applicable)

---

# Security & Privacy

- [ ] Sensitive information hidden
- [ ] Password fields masked
- [ ] Confirmation before destructive actions
- [ ] No exposed secrets or API keys

---

# AI Quality Review

Ask the following questions:

### Does this look handcrafted?

- [ ] Yes
- [ ] No

---

### Would this fit alongside products like:

- Stripe
- Linear
- Vercel
- Notion
- GitHub
- Figma

- [ ] Yes
- [ ] No

---

### Is every component necessary?

- [ ] Yes
- [ ] No

---

### Is the interface immediately understandable?

- [ ] Yes
- [ ] No

---

### Can a new user complete the primary task without guidance?

- [ ] Yes
- [ ] No

---

# Final Approval

The design is ready for production only if:

- [ ] All checklist items pass
- [ ] Accessibility requirements are met
- [ ] Responsive testing is complete
- [ ] Performance is acceptable
- [ ] UX review is approved
- [ ] Design system compliance is verified

---

# Golden Rule

Before shipping, ask one final question:

> **"Would I be proud to ship this interface if it were compared side-by-side with Stripe, Linear, Notion, or Vercel?"**

If the answer is **no**, continue refining.

Great products are built through thoughtful iteration—not by settling for the first draft.