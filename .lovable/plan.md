# Averonix Compliance Dashboard — Build Plan

A polished, frontend-only demo of a cybersecurity compliance SaaS, built on the existing TanStack Start + Tailwind + shadcn stack. No backend, no database, no auth — all data lives in local mock files.

## 1. Design System Setup

Update `src/styles.css` with the Averonix token palette (converted to oklch where needed, keeping the brand hexes as CSS vars):

- `--primary` = #C560CC, plus `--primary-hover`, `--primary-dark`, `--primary-soft`, `--primary-ultra-soft`
- `--sidebar`, `--sidebar-secondary`, `--sidebar-active` for the dark purple/black nav
- `--background` (#FCFBFE), `--card` (#FFFFFF), `--border` (#E9DDEA)
- `--foreground` (#1F1630), `--muted-foreground` (#6F6478)
- Status tokens: `--success`, `--warning`, `--danger`, `--info`
- Soft shadow + radius scale tuned for elegant cards
- Modern sans-serif (Inter) via Google Fonts link in `__root.tsx` head

Add reusable badge variants (severity, status, risk level) and a `StatCard`, `ProgressBar`, `DonutChart`, `TrendLine`, `DataTable`, `DetailPageHeader`, `ActivityTimeline` set of primitives so every page stays consistent without looking identical.

## 2. App Shell

`src/routes/__root.tsx` becomes the persistent shell:

- Left sidebar (shadcn `Sidebar`, `collapsible="icon"`) with groups OVERVIEW / COMPLIANCE / RISK / MANAGE and the exact items listed (Vendors as an expandable group with Overview / Discovery / Security Reviews / All Vendors). Active state uses `#C560CC`.
- Top header: global search, notifications bell, workspace selector ("Averonix Corp."), avatar "AC / Averonix Admin".
- `<Outlet />` for page content on a `#FCFBFE` canvas.
- Toaster mounted for "Export prepared for demo." style feedback.

## 3. Routes (file-based, TanStack Router)

List pages under `src/routes/`:
- `index.tsx` → Overview
- `frameworks.index.tsx`, `controls.index.tsx`
- `vendors.index.tsx` (Overview), `vendors.discovery.tsx`, `vendors.reviews.tsx`, `vendors.all.tsx`
- `risks.index.tsx`, `gaps.index.tsx`, `tasks.index.tsx`
- `reports.index.tsx`, `integrations.index.tsx`, `settings.tsx`

Detail pages (each its own route, looked up by `:id` from mock arrays, with a clean "Not found" state + Back button):
- `frameworks.$id.tsx`, `controls.$id.tsx`, `vendors.$id.tsx`
- `risks.$id.tsx`, `gaps.$id.tsx`, `tasks.$id.tsx`
- `reports.$id.tsx`, `integrations.$id.tsx`

All "View / Review / Manage / Continue / View requirements / Open" actions navigate to these full detail pages — never dropdowns or side modals. Dropdowns are reserved for secondary actions (Duplicate, Archive, Export, Snooze, Delete, Copy link). A right-side preview panel on list pages is allowed as a lightweight preview only.

## 4. Mock Data Layer

`src/mocks/` with typed modules:
- `frameworks.ts`, `controls.ts`, `vendors.ts`, `discoveredVendors.ts`, `reviews.ts`
- `risks.ts`, `gaps.ts`, `tasks.ts`, `reports.ts`, `integrations.ts`, `activities.ts`
- `owners.ts` (Sarah Chen, Michael Lee, Priya Nair, Laura Patel, David Kim, James Wilson, Tom Black, Rachel Green)

Each entity gets a stable `id`, enough fields to power list + detail views, and cross-links (a gap references a control, a task references a gap, etc.). All rows from the spec are seeded verbatim; additional realistic rows are added where pages need more density.

## 5. Page-by-Page Build

Built to spec — each page uses the shared primitives but a layout tuned to its purpose so they don't feel identical:

1. **Overview** — top action bar, summary strip (Readiness 58%, Open gaps 42, Evidence 63% + small sparkline), framework cards grid (all 8 frameworks with progress), Evidence Gaps + Recent Activity row.
2. **Frameworks** — All / Custom tabs, search, catalog card grid (8 cards, white with soft purple accents, Continue / Snooze / View requirements actions linking to detail).
3. **Controls** — Assignment donut + Completion card, filter bar, table (7 seeded rows + extras), right-side preview panel; full data on `/controls/:id`.
4. **Vendors / Overview** — summary only: 4 metrics, Risk Distribution donut, Reviews Due list, Top Risky Vendors mini-table, Recent Activity, Program Health bars. No big inventory table.
5. **Vendors / Discovery** — metrics, tabs (Needs review / Linked / Ignored), discovery table, right panel for MongoDB with detected accounts + discovery signals, Discovery health bar.
6. **Vendors / Security Reviews** — metrics, status tabs, filters, reviews table with progress, right panel (Okta) with next-actions checklist + activity, review health footer.
7. **Vendors / All Vendors** — full inventory table (10+ rows), Active / Archived tabs, filters, right vendor panel (AWS) with Overview / Activity tabs and "View vendor details" → `/vendors/:id`.
8. **Risks** — metrics, exposure donut + trend, filters, table (9 rows), right risk panel with "View risk details".
9. **Gaps** — gap-specific wording, severity donut + remediation trend, table (7 rows), right gap panel.
10. **Tasks** — priority donut + completion trend, table (7 rows), right task panel with checklist.
11. **Reports** — two-column: Report Library list (left) + Selected Report Preview (right, ISO 27001 Readiness with sections, Download PDF / Regenerate) + Recent Exports footer. Deliberately simpler than Risks/Gaps/Tasks.
12. **Integrations** — Connected / Available tabs, category groupings, cards (Google Workspace, GitHub, AWS, Microsoft 365, Slack, Cloudflare) with Manage / Connect → `/integrations/:id`.
13. **Settings** — sectioned page (Workspace, Users & roles, Scoring config, Vendor risk settings, Notifications, Appearance) with read-only demo values and Averonix Purple theme card.

## 6. Detail Pages

Shared `DetailPageLayout` (breadcrumb + title + status badge + primary action) with entity-specific tabs and content:

- **Framework**: Overview / Controls / Gaps / Risks / Activity — readiness focus, mapped controls table.
- **Control**: Overview / Evidence / Tests / Linked items / Activity — implementation + evidence focus.
- **Vendor**: Overview / Risk Profile / Security Review / Activity — Security Review tab has review progress, evidence status, questionnaire status, checklist, reviewer notes, final decision.
- **Risk**: Overview / Treatment Plan / Linked Controls / Activity — impact + likelihood + treatment plan.
- **Gap**: Overview / Remediation / Evidence / Linked tasks / Activity — required evidence + remediation steps.
- **Task**: Overview / Checklist / Linked items / Activity — subtasks with checkboxes (local state).
- **Report**: preview-focused, sections list, Download PDF / Regenerate / Export buttons, recent export activity.
- **Integration**: status, capabilities, connected workspace, last sync, mock sync health, scope preview, Connect / Disconnect / Configure scope / Run mock sync.

All detail pages resolve their entity by id from the mock arrays and show a clean Not Found state if missing.

## 7. Interactivity (frontend-only)

- Search inputs filter the local arrays on list pages.
- Tabs swap visible content via local state.
- Row click selects an item for the right preview panel; explicit "View …" action routes to the detail page.
- Create / Add / Generate buttons open simple modal placeholders.
- Export / Run / Sync buttons fire a toast ("Export prepared for demo.").
- Task checklists and integration toggles update local state only.

## 8. Technical Notes

- React + TypeScript + Tailwind + shadcn/ui + lucide-react + Recharts (for donuts, sparkline, trend lines).
- TanStack Router file-based routing — no react-router-dom, no backend libs.
- Strict typing for mock data; cross-entity links typed as ids.
- SEO `head()` per route with Averonix titles/descriptions; og:image only on leaf routes if added later.
- Responsive desktop-first; sidebar collapses on small screens.
- No Supabase, no auth, no real uploads, no Documents page — "Evidence status" is surfaced inside Controls, Gaps, Tasks, and Vendor reviews instead.

## What you get

A complete, navigable Averonix demo: dark purple sidebar, white workspace, #C560CC accents, every listed page and detail route working with realistic mock data and consistent design language — ready to present.
