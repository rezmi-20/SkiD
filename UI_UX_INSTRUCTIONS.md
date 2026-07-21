# UI/UX Instructions for Coding Agents

Use this document whenever you design, build, review, or revise a user interface. Treat it as a decision framework, not a request to decorate screens.

## Mission

Create interfaces that help users understand where they are, decide confidently, complete their goal efficiently, recover from mistakes, and trust the product.

Prioritize, in this order:

1. User goal and task completion
2. Accessibility and safety
3. Clarity and predictable behavior
4. Responsive, robust implementation
5. Consistency with the existing product
6. Performance
7. Visual polish and brand expression
8. Conversion optimization, only when honest and user-aligned

Never sacrifice a higher priority for a lower one.

## Working Method

Before changing code:

1. Identify the primary users and their context.
2. State the screen's primary user goal in one sentence.
3. Identify the primary action and essential supporting actions.
4. Map the shortest safe user flow, including entry, success, cancellation, and recovery.
5. Inspect the existing product for components, tokens, conventions, and constraints.
6. List important states and edge cases.

If product requirements are ambiguous and the choice would materially affect the result, ask focused questions. Otherwise, state a reasonable assumption and proceed.

For significant new flows, work through:

1. User flow
2. Low-fidelity structure or wireframe
3. Content and interaction states
4. Visual system and component reuse
5. Responsive implementation
6. Accessibility and functional testing
7. Refinement based on evidence

The process is iterative. Return to earlier steps when testing reveals a problem.

## User Intent and Information Architecture

- Build around the user's task, not around decorative assets.
- Make the primary action obvious without making every action prominent.
- Rank information by what the user needs to decide now.
- Use progressive disclosure for secondary or advanced information.
- Never hide prices, risks, restrictions, destructive consequences, or required terms.
- Use familiar navigation and interaction patterns unless a different pattern has a clear, testable benefit.
- Follow the reading direction and conventions of the product's locale; do not assume left-to-right.
- Keep semantic document order aligned with the visual and keyboard order.
- Preserve user control: provide cancel, back, undo, edit, and clear exit paths where appropriate.

Ask of every element:

- What user question does this answer?
- What action or decision does it support?
- Would removing it make the task harder or less safe?

Remove elements with no useful answer.

## Content and Hierarchy

- Use real or representative content as early as possible.
- Prefer plain, specific language over slogans, jargon, or vague labels.
- Make CTA labels describe the result: `Add to cart`, `Save changes`, or `Send payment` is usually clearer than `Continue` or `Start my journey`.
- Friendly language must not reduce precision, especially in financial, medical, legal, privacy, or destructive workflows.
- Establish hierarchy with a restrained combination of position, size, weight, spacing, grouping, and contrast.
- Avoid multiple elements competing for primary emphasis.
- Use headings that make the page scannable and preserve a logical heading structure.
- Keep essential explanations near the control or decision they affect.
- Never rely on placeholder text as the only label or instruction.
- Design for long, short, missing, translated, right-to-left, and user-generated content.
- Prefer wrapping or flexible layouts to truncation. When truncation is necessary, preserve access to the full value.

## Layout and Responsive Design

- Start from content priority and constraints, not arbitrary device names.
- Use fluid layouts and add breakpoints where the composition stops working.
- Support small phones, large phones, tablets, laptops, wide screens, zoom, and landscape where relevant.
- Avoid horizontal scrolling except for content that genuinely requires it, such as a data grid with an accessible alternative.
- Keep line length, spacing, and density readable at every size.
- Preserve safe-area insets around notches, home indicators, browser chrome, and system gestures.
- Account for touch, mouse, keyboard, stylus, and assistive technology.
- Keep frequent mobile actions comfortably reachable without placing destructive actions where accidental activation is likely.
- Do not assume handedness or a fixed viewport height.

## Design System

Reuse the existing design system before creating new styles. If no system exists, define a small coherent foundation:

- Color roles: background, surface, text, muted text, border, primary, secondary, accent, success, warning, and danger
- Typography roles: body, label, caption, headings, and data display
- Spacing and sizing scale
- Radius, border, and elevation tokens
- Motion duration and easing tokens
- Icons from one coherent family
- Reusable layout and form primitives

Components must define relevant states:

- default
- hover, when applicable
- keyboard focus
- active or pressed
- selected
- disabled, only when necessary
- loading
- success
- warning
- error
- empty or no data

Bend a system rule only for a clear user or product need, and keep the exception intentional and documented.

## Design Maturity: From Decoration to Experience

Judge design maturity by the quality of reasoning and outcomes, not by years of experience or visual complexity.

A mature design:

- uses concise, user-specific copy that makes the next action clear
- establishes hierarchy before adding visual effects
- uses color, type, spacing, imagery, and motion intentionally
- removes repetition and decoration that do not support the task
- applies reusable systems while handling exceptions deliberately
- connects screens into a coherent journey with continuity, feedback, and recovery
- balances user needs, accessibility, technical constraints, and legitimate business goals
- validates decisions instead of treating personal taste as evidence

Use these common formulas as starting constraints, not universal laws:

- **60-30-10 color distribution:** Can help restrain a palette, but choose proportions based on content, brand, theme, and accessibility. Never let the formula override contrast or semantic color needs.
- **Four type sizes and two weights:** Can prevent accidental complexity in a small interface, but a product may need a richer documented type scale. Prefer named type roles and consistent use over an arbitrary count.
- **8-point spacing grid:** Use a consistent base spacing scale; allow smaller increments such as 4px when optical alignment, compact controls, borders, or platform conventions require them. Do not force every dimension onto the grid.

### Copy progression

- Remove words that do not improve meaning, confidence, or action.
- Write for the user's vocabulary and situation.
- Avoid repeating the same explanation in headings, body copy, and buttons.
- Use AI writing tools only to generate alternatives; review every result for accuracy, tone, localization, accessibility, and domain risk.

### Visual progression

- Do not use gradients, blur, glass effects, skeuomorphism, shadows, or animation merely to signal quality.
- Start with clear structure and add effects only when they communicate grouping, depth, state, brand, or atmosphere without harming usability.
- Stop when additional elements no longer improve comprehension or task completion.

### Color progression

- Avoid covering large areas with intense brand colors when a neutral surface would improve legibility and reduce fatigue.
- Do not make restraint synonymous with dullness; use accent color deliberately for identity, state, and emphasis.
- Create systematic color roles and tonal steps instead of choosing isolated values.
- HSB/HSL can help reason about hue, saturation, and brightness or lightness, but numeric similarity does not guarantee equal perceived brightness or accessible contrast. Test actual color pairs.

### Typography progression

- Use a small, named type scale with clear roles rather than arbitrary sizes and weights.
- Choose fonts for legibility, language coverage, loading performance, and product tone.
- Use tabular numerals for columns or rapidly changing numeric data when alignment aids comparison.
- Use monospace only when fixed-width characters improve the task, such as code or certain identifiers; it is not automatically better for all numbers.

### Spacing and alignment progression

- Use spacing tokens instead of unrelated pixel values.
- Create relationships through consistent proximity: tighter within groups, more generous between groups.
- Align to a clear layout structure while allowing optical corrections where geometry looks visually wrong.
- “Perfect alignment” means deliberate perceptual organization, not blindly forcing every element to the same coordinate.

### End-to-end experience

Do not design isolated static screens. Review the complete sequence:

- what prompts the user to enter the flow
- how context persists between steps
- how transitions communicate cause and effect
- how the system handles waiting, interruption, errors, and returning later
- how completion is confirmed
- what the user should do next

Thinking of a flow as a story can improve continuity, but do not turn routine tasks into cinematic sequences. Delight should come from clarity, responsiveness, useful feedback, and occasional appropriate personality—not forced animation.

## Accessibility: Non-Negotiable

Target WCAG 2.2 AA unless the project specifies a stricter standard.

- Use semantic HTML and native controls before ARIA or custom widgets.
- Make every action operable with a keyboard, except inherently freehand input.
- Keep focus visible and never obscure it behind sticky content.
- Provide a logical focus order and sensible focus management for dialogs, menus, and route changes.
- Give controls programmatic names and visible labels where users benefit from them.
- Provide useful text alternatives for meaningful images; use empty alt text for purely decorative images.
- Do not use color, shape, icons, animation, sound, or position as the only carrier of meaning.
- Meet text contrast of at least 4.5:1 for normal text and 3:1 for large text; check non-text control and state contrast as well.
- Reflow at zoom and increased text size without loss of content or function.
- Use 44 by 44 CSS pixels as a comfortable touch-target goal. WCAG 2.2 AA permits 24 by 24 CSS pixels in defined cases, but larger targets are generally safer. Follow native platform requirements where applicable.
- Leave enough space between adjacent targets.
- Respect `prefers-reduced-motion` and avoid motion that is required to understand or operate the interface.
- Provide captions, transcripts, or alternatives for time-based media as required.
- Announce dynamic status and validation messages appropriately without overwhelming screen-reader users.
- Test keyboard-only use, visible focus, screen-reader names, contrast, zoom, reduced motion, and touch targets.

## Forms and Input

- Ask only for information needed now.
- Use the input type that matches the data and task.
- Use text fields for frequent or precise entry; sliders are mainly for approximate values and must have an accessible precise alternative.
- Use visual swatches or cards only when they improve comparison; preserve text labels, semantics, selection state, and keyboard operation.
- Group related fields and explain formatting before submission when helpful.
- Use sensible, visible, reversible defaults.
- Never preselect paid, risky, privacy-sensitive, or consent-related choices.
- Preserve user input after validation errors.
- Validate at an appropriate time; do not scold users while they are still typing.
- Identify the field, explain the problem, and say how to fix it.
- Never change context unexpectedly merely because a value was selected.
- For high-risk actions, provide a review step containing the recipient, amount, fees, exchange rate, timing, resulting balance, and other material consequences.

## Feedback and System Status

- Acknowledge interactions promptly.
- Show loading only when useful; prevent duplicate submissions.
- Prefer a stable skeleton or reserved space to layout shifts and flashing spinners.
- Tell users what happened, whether it succeeded, and what they can do next.
- Use optimistic updates only when failure is unlikely and recovery is clear.
- Make destructive and irreversible actions explicit. Provide confirmation or undo proportional to the risk.
- Do not use emojis, color, or animation as the sole status signal.
- For progress indicators, report real progress. Never fabricate an artificial head start.

## Navigation and Search

- Keep navigation consistent and make the current location clear.
- Bottom mobile navigation is for three to five frequent, top-level destinations.
- Do not put settings, legal pages, logout, or infrequent actions in primary bottom navigation.
- Use a central CTA only when it is a frequent primary action and does not confuse navigation state.
- Prefer icons with concise visible labels. Do not remove labels based on assumptions about age or technical ability.
- Distinguish active tabs with more than color alone.
- Search must work as a normal text input even when suggestions are unavailable.
- Recent searches, popular items, and recommendations may reduce effort, but provide privacy controls and ways to clear history.
- Make suggestion lists keyboard accessible and explain empty, no-result, offline, and error states.
- Use filters and sorting appropriate to the user's decision; preserve their state when navigating back where helpful.
- Choose pagination, `Load more`, or infinite scrolling based on the task. Prefer user control and stable position for goal-directed search; never make the footer unreachable.

## Empty, Error, and Edge States

Design these states intentionally:

- first use
- genuinely empty data
- no search results
- filters producing no matches
- loading and slow connection
- partial data
- offline
- permission denied
- expired session
- recoverable error
- unavailable or deleted content
- success and completion

An empty state should explain the situation and offer a relevant next step. Illustrations are optional. An error state should preserve work where possible and provide recovery rather than a dead end.

## Personalization

- Adapt complexity to demonstrated needs, not stereotypes.
- Give new users simple guidance, returning users efficient routines, and advanced users optional power tools.
- Never trap a user in an inferred skill level.
- Provide a useful non-personalized default and allow preference changes.
- Explain personalization when it materially affects recommendations or outcomes.
- Collect and expose only the data necessary for the feature.
- Use names and personal history only when appropriate for shared-screen and privacy contexts.

## Commerce, Pricing, and Conversion Ethics

Optimize for informed, successful decisions—not clicks at any cost.

- Provide value before signup when practical, and explain what an account enables.
- Preserve pre-signup work and explain storage or expiration honestly.
- Display total price, currency, mandatory fees, taxes, renewal terms, billing frequency, and cancellation conditions before commitment.
- Use a fixed price only when it is actually known. For variable pricing, explain the range and what determines the final total.
- Free-trial copy must disclose duration, first charge date and amount, renewal behavior, cancellation method, and whether a reminder will truly be sent.
- Do not use preselected subscriptions, hidden fees, confirm-shaming, fake urgency, obstructive cancellation, or misleading scarcity.
- Popularity, bestseller, review, sold-count, comparison, certification, and testing claims must be authentic, current, and supportable.
- `Most popular`, `cheaper`, or similar badges need a truthful comparison basis.
- Lifestyle images may help users imagine use, but retain accurate product views and details.
- Product previews should be representative and must not expose private or misleading content.
- Progressive disclosure must not conceal material terms, safety information, or costs.
- State cancellation deadlines and exceptions next to `free cancellation` claims.
- Loss framing may explain factual consequences; never threaten or exaggerate loss to coerce action.
- Treat reported conversion gains as case-study claims until supported by experiment design, sample size, duration, statistical confidence, and comparable traffic.

## Trust and High-Risk Workflows

- Favor clarity and error prevention over speed in financial, health, identity, legal, privacy, and destructive actions.
- Identify recipients using verified names plus another meaningful identifier; photos alone are insufficient.
- Provide a clear review and confirmation step.
- Show fees, timing, limits, pending status, and resulting balances before a transaction.
- Use plain language and never soften a serious warning into vague friendly copy.
- Protect personal information in recent-recipient lists, notifications, tracking screens, and shared-device contexts.
- Make security boundaries and irreversible consequences explicit.

## Visual Design and Media

- Visual rhythm should support scanning, grouping, and task flow.
- Use a restrained palette and coherent imagery; do not force uniform stock photography at the expense of truthful representation.
- Use icons to reinforce labels, not replace unfamiliar concepts.
- Shadows are optional. Use spacing, borders, or surface color when clearer.
- If using shadows, define reusable elevation tokens and verify them in light, dark, and high-contrast themes.
- Large typography is appropriate for short statements when it remains responsive, localizable, zoomable, and subordinate to task completion.
- Decorative illustrations, 3D models, and animation must justify their loading, rendering, and cognitive cost.

## Motion and Micro-interactions

Motion must clarify cause and effect, spatial relationships, status, or continuity.

- Keep transitions brief and interruptible.
- Preserve native scrolling; never scrolljack.
- Avoid parallax or scroll narratives that block access to content.
- Provide reduced-motion behavior.
- Do not delay navigation or task completion for animation.
- Do not make hover the only way to discover essential information.
- Hover content must also work with keyboard focus and be dismissible, persistent enough to read, and hoverable when required.
- Preserve the system cursor unless a custom cursor has a validated functional purpose; never reduce pointer precision or hide interaction state.

## Performance and Robustness

- Optimize images, fonts, icons, 3D assets, and animation.
- Reserve media dimensions to prevent layout shift.
- Lazy-load noncritical content without hiding the primary task.
- Avoid unnecessary JavaScript and expensive effects.
- Keep the interface usable on slow networks and lower-powered devices.
- Provide fallbacks when recommendations, personalization, media, or third-party services fail.
- Test long content, missing images, failed requests, stale data, and rapid repeated input.
- Never equate a visually minimal page with a fast page; measure performance.

## Evidence and Validation

- Treat inspiration galleries and competitor screens as references, not usability evidence.
- Do not copy a pattern without understanding its user, context, and tradeoffs.
- Validate risky assumptions with user research, usability testing, analytics, or controlled experiments.
- Pair quantitative results with qualitative evidence where possible.
- Do not claim an improvement without evidence.
- Prefer the smallest change that can test the hypothesis.
- Check that a conversion improvement does not increase errors, refunds, abandonment later in the flow, support burden, or user regret.

## Optional Trends, Not Defaults

Use these only when they fit the brand and task:

- Interactive 3D product views
- Scroll-based storytelling
- Neon or mist effects
- Very large typography
- Custom cursors
- Highly minimal layouts

Before adopting one, verify usability, accessibility, mobile behavior, localization, performance, reduced-motion support, and a static fallback. Trends must never override familiar behavior or clear content.

## Required Review Before Completion

Before presenting the work as complete, verify:

### User goal

- The primary task and action are immediately understandable.
- Important information appears before the decision it affects.
- The user can cancel, go back, edit, or recover where appropriate.

### Content

- Labels describe outcomes clearly.
- Realistic long, short, empty, missing, and translated content works.
- No important information is hidden by truncation or progressive disclosure.

### Interaction

- Every control has all relevant states.
- Feedback is immediate, specific, and recoverable.
- Gestures, hover, drag, and icons have discoverable accessible alternatives.

### Accessibility

- Semantic structure and names are correct.
- Keyboard operation and focus order work.
- Contrast, zoom/reflow, touch targets, and reduced motion are checked.
- Meaning never depends on a single sensory cue.

### Responsive behavior

- The UI works at narrow and wide sizes, zoom, and orientation changes.
- No essential control conflicts with safe areas or system gestures.

### Trust

- Prices, terms, defaults, claims, and consequences are truthful and visible.
- No dark patterns, fake activity, fabricated progress, or coercive language exist.

### Engineering quality

- Existing components and tokens are reused appropriately.
- Loading, empty, error, success, and offline states are handled.
- Performance is proportionate to the experience.
- Tests cover the highest-risk behavior.

## Delivery Format

When reporting UI/UX work, briefly state:

1. The user goal optimized
2. The main design decisions and why they help
3. Accessibility and responsive behavior addressed
4. States and edge cases handled
5. Validation performed and any remaining assumptions

Do not describe a screen as `modern`, `clean`, `intuitive`, or `professional` without explaining the concrete design choices and user benefit.

## Reference Baseline

- [W3C WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [W3C Web Accessibility Introduction](https://www.w3.org/WAI/fundamentals/accessibility-intro/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Learn UI Design: The HSB Color System](https://www.learnui.design/blog/the-hsb-color-system-practicioners-primer.html)
- [The 8-Point Grid System](https://www.youtube.com/watch?v=ohF93_k3IMk&t=86s)
- [Mobbin pattern library](https://mobbin.com/)
- [UXPeak](https://www.uxpeak.com/)

Pattern libraries and courses are sources of ideas, not standards. Validate their advice against user needs, platform conventions, accessibility requirements, ethical design, and measured outcomes.
