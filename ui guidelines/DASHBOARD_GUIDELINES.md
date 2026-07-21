# Dashboard Guidelines

> Defines the architecture, UX patterns, and design principles for building professional SaaS dashboards. Every dashboard should help users accomplish work efficiently—not simply display information.

---

# Dashboard Philosophy

A dashboard is a workspace.

Its purpose is to help users:

- Make decisions
- Monitor progress
- Complete tasks
- Discover insights
- Take action

Every element should support one of these goals.

---

# Design Priorities

Always optimize for:

1. Clarity
2. Speed
3. Information hierarchy
4. Productivity
5. Consistency

Never optimize for visual complexity.

---

# Dashboard Layout

Every dashboard should follow this structure.

```
---------------------------------------------------------
| Sidebar | Top Navigation                              |
|         |---------------------------------------------|
|         | Page Header                                 |
|         |---------------------------------------------|
|         | Filters / Actions                           |
|         |---------------------------------------------|
|         | KPI Cards                                   |
|         |---------------------------------------------|
|         | Charts / Analytics                          |
|         |---------------------------------------------|
|         | Tables / Lists                              |
---------------------------------------------------------
```

---

# Sidebar

The sidebar is the application's backbone.

It should contain:

- Logo
- Workspace switcher
- Main navigation
- Search
- Notifications
- User account
- Settings
- Help

---

## Sidebar Rules

Group related items.

Example:

### Main

- Dashboard
- Projects
- Teams
- Tasks

### Workspace

- Calendar
- Files
- Reports

### Bottom Section

- Settings
- Billing
- Help
- Profile

Never overload the sidebar.

---

# Top Navigation

Should contain:

- Search
- Notifications
- User menu
- Workspace selector (optional)

Avoid duplicating sidebar navigation.

---

# Page Header

Every page should include:

- Title
- Description
- Primary action
- Breadcrumb (if needed)

Example

```
Projects

Manage all active projects across your workspace.

[ New Project ]
```

---

# KPI Cards

Use KPI cards only for important metrics.

Examples:

- Revenue
- Active Users
- Open Jobs
- Conversion Rate
- Storage Used

Avoid showing more than 4–6 KPIs on a single row.

---

## KPI Card Content

Each card should contain:

- Title
- Current value
- Trend indicator
- Comparison period

Example:

```
Monthly Revenue

$52,340

↑ 8.4%

vs last month
```

---

# Charts

Charts should answer a question.

Never include charts for decoration.

Preferred chart types:

- Line Chart → Trends
- Bar Chart → Comparisons
- Donut Chart → Distribution
- Area Chart → Growth
- Heatmap → Density

---

## Chart Rules

Always include:

- Labels
- Axes
- Date range
- Legend (if needed)
- Tooltip

Avoid:

- 3D charts
- Pie charts with many slices
- Decorative animations

---

# Tables

Tables are the primary data display.

Support:

- Search
- Filters
- Sorting
- Pagination
- Bulk actions

Optional:

- Column visibility
- Export
- Inline editing

---

# Filters

Filters should appear above tables or charts.

Common filters:

- Date range
- Status
- Team
- Owner
- Category

Show active filters clearly.

---

# Search

Global search should be easily accessible.

Support:

- Keyboard shortcut
- Instant results
- Recent searches

---

# Actions

Primary actions should be visible.

Examples:

- Create Project
- Add User
- Invite Member
- Generate Report

Secondary actions belong in menus.

---

# Empty States

Every dashboard must support empty states.

Example:

```
No projects yet.

Create your first project to start tracking progress.

[ Create Project ]
```

Never leave blank pages.

---

# Loading States

Prefer:

- Skeleton loaders
- Placeholder charts
- Loading rows

Avoid large blocking spinners.

---

# Error States

When data cannot load:

Show:

- Friendly explanation
- Retry button
- Error details (optional)

Never expose technical errors directly.

---

# Responsive Layout

Desktop

- Multi-column layout

Tablet

- Reduced columns
- Collapsible sidebar

Mobile

- Single-column layout
- Bottom sheet or drawer navigation
- Prioritize essential content

---

# Data Density

Dashboards contain more information than marketing pages.

Use:

- Smaller typography
- Compact spacing
- Clear grouping

Never make dashboards feel cluttered.

---

# Navigation

Support:

- Breadcrumbs
- Back navigation
- Workspace switching

Users should never feel lost.

---

# Notifications

Use toast notifications for:

- Save
- Delete
- Update
- Import
- Export

Avoid intrusive modal confirmations for successful actions.

---

# Modals

Use modals for:

- Creating records
- Editing records
- Confirmation dialogs

Avoid long multi-step workflows inside modals.

---

# Drawers

Use drawers for:

- Filters
- Quick editing
- Detail panels

Keep users in context.

---

# Optimistic UI

Whenever possible:

Update the interface immediately after user actions.

Examples:

- Mark task complete
- Delete item
- Archive record

Synchronize with the server afterward.

---

# Accessibility

Every dashboard must support:

- Keyboard navigation
- Focus indicators
- Screen readers
- Semantic HTML
- WCAG AA contrast

---

# Performance

Large dashboards should:

- Lazy load widgets
- Virtualize large tables
- Cache data
- Avoid unnecessary re-renders

Fast dashboards improve productivity.

---

# Dashboard Checklist

Before shipping, verify:

- Sidebar is organized
- Navigation is intuitive
- KPIs are meaningful
- Charts answer real questions
- Tables support search and filters
- Empty states exist
- Loading states exist
- Error states exist
- Responsive layout works
- Accessibility passes
- Performance is acceptable

---

# Anti-Patterns

Avoid:

- Duplicate metrics
- Too many charts
- More than six KPI cards per row
- Decorative widgets
- Fake analytics
- Excessive gradients
- Crowded layouts
- Hidden navigation

---

# Inspiration

Aim for dashboards comparable to:

- Stripe Dashboard
- Linear
- GitHub
- Vercel
- Clerk
- Figma
- Notion

---

# Golden Rule

A dashboard should help users make decisions quickly.

If users spend time figuring out the interface instead of completing work, the dashboard has failed.