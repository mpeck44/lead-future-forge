# Dashboard Redesign Plan

Rebuild `src/pages/Dashboard.tsx` to match the new HTML design (hero + continue card, 4-step pathway strip, portfolio grid, footer band). Keeps the existing brand palette already in `index.css` (Navy / Gold / Off-white) and Playfair + Inter fonts — the HTML's `Fraunces` will be substituted with our existing `Playfair Display` to stay consistent with the landing page rebuild.

## Component structure

New files under `src/components/dashboard/`:

- `DashboardHero.tsx` — greeting + dynamic subtitle + "Continue" card (gold top border, progress bar, time remaining, CTA).
- `PathwayStrip.tsx` — 4-step rail (Launchpad → Command → Chart → Ship) with done / current / locked states and a mini progress fill on the current step.
- `PortfolioGrid.tsx` — 4-up card grid with three chip states (Draft / Built / Tested in your district), "Mark as tested" button, and the footer explainer line.
- `DashboardFooter.tsx` — slim navy footer band ("PEKK Education program · © 2026").

`src/pages/Dashboard.tsx` becomes the data layer: runs the existing queries (enrollments, progress, current module, portfolio stats) and passes plain props into the new presentational components. Existing `Header.tsx` stays.

## Data wiring (uses tables already in the project)

- **Hero / Continue card** — already computed by `currentModuleProgress` (module title, lessons complete / total, remaining minutes). Continue button links to `/course/{mostRecentEnrollment.courses.slug}`.
- **Pathway strip** — needs four fixed slots in this order: `the-launchpad`, `command-the-tools`, `chart-the-course`, `ship-it`. For each:
  - If the user is enrolled and `completedLessons === totalLessons` → **done**.
  - If enrolled and partially complete (or most-recent enrollment) → **current**, with the mini-fill driven by `progressData` for that course.
  - Otherwise → **locked**, "Preview →" links to `/courses` (we don't yet have per-course preview routes).
- **Portfolio grid** — query `portfolio_items` for the user; show up to 4 most recent (newest first). Chip state derives from existing columns:
  - `used_in_district === true` → **Tested in your district**
  - else `status === 'draft'` → **Draft** (dashed card)
  - else → **Built**
  - Header meta = `{total} artifacts · {usedInDistrict} tested in your district`.
- **"Mark as tested"** — updates `portfolio_items.used_in_district = true` for that row (RLS already allows the owner to update their own items), then invalidates the dashboard portfolio query.

## CTA rewiring

- "Continue Module N →" → `/course/{slug}` for the active enrollment.
- Portfolio "View" / "Resume draft" links → `/portfolio` (no per-item route exists today).
- Pathway "Preview →" on locked steps → `/courses`.
- Nav avatar dropdown is left to the existing `Header.tsx`.

## Things that may not match perfectly (flagging now)

1. **Fixed 4-course pathway vs. dynamic catalog.** The design hard-codes Launchpad / Command the Tools / Chart the Course / Ship It as the canonical path. The DB has a flexible `courses` table — slugs and titles must exist and match exactly, or the pathway will show locked placeholders. If any of those four slugs aren't seeded yet, the strip will still render but won't link anywhere meaningful. Worth confirming the slug list before shipping.
2. **No "preview" route** for unenrolled courses, so the "Preview →" link on locked pathway steps will land on the general `/courses` page rather than a per-course preview.
3. **No per-portfolio-item detail page.** The design's "View" / "Resume draft" links will point to `/portfolio` until we add item-level routes.
4. **"12 minutes" hero subtitle** is dynamic — when `currentModuleProgress` is null (no enrollments / all done) the copy gracefully falls back to existing empty-state language; the polished one-liner only appears when we actually have a current module and a remaining time.
5. **`used_in_district` is currently the only "tested" signal.** The mock JS mentions a `tested_at` timestamp; we don't have that column. Adding one is a future migration, not part of this UI swap. Recommend flipping just `used_in_district` for now.
6. **Portfolio cap.** The grid is fixed at four cards in the mock. Real users may have many more items. Proposal: show the four most recently updated, with a "View Portfolio →" link to see the rest. Confirm if you'd prefer a different ordering.

## Files touched

- Create: `src/components/dashboard/DashboardHero.tsx`, `PathwayStrip.tsx`, `PortfolioGrid.tsx`, `DashboardFooter.tsx`.
- Edit: `src/pages/Dashboard.tsx` (recompose; keep all existing queries, add one for `portfolio_items` listing and a mutation for mark-as-tested).
- No changes to `index.css` (tokens already in place from the landing rebuild), no schema changes, no edits to `Header.tsx` or auth.

Approve and I'll build it; let me know on the six flags above (especially #1 — the canonical four course slugs) and I'll fold the answers into the implementation.