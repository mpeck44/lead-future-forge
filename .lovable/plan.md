## Problem

Post-signup flow drops users on a generic dashboard with no path forward. The deeper issue: `/courses` is a separate destination that competes with the dashboard, so both surfaces have to compensate for each other. The fix is to collapse them into one state-driven surface and route users through the audit before showing them a price grid.

## Core principles

- **Honor the CTA that got them here.** "Start Foundations free" → start Foundations. "Get the bundle" → open bundle checkout. Never dump either into a catalog.
- **Audit-gated pricing.** Cold price grids convert worse than personalized recommendations. Foundations ends in the audit; the audit unlocks the purchase block.
- **One surface, many states.** `/courses` becomes a redirect. The dashboard is the only logged-in destination.

## 1. Preserve intent through signup (buy + learn)

On any logged-out CTA, stash intent in `sessionStorage` before `/auth`:
- `{ type: "bundle" }`
- `{ type: "course", slug }` — paid course buy
- `{ type: "enroll", slug: "foundations" }` — free start

After successful sign-in / email confirm, read the intent and:
- `bundle` / `course` → open the shared `<CheckoutModal>` immediately on `/dashboard`.
- `enroll` → auto-enroll via existing enrollment path, then `navigate` straight to `/course/foundations` (Lesson 1). No dashboard flash, no catalog.

Implementation:
- `useAuth.tsx`: `emailRedirectTo` carries `?intent=<encoded>` so email-confirm survives. Fallback `/dashboard`.
- `Auth.tsx`: on success, consume intent and dispatch (checkout modal or enrollment redirect).
- Factor a shared `<CheckoutModal courseSlug|bundleKey>` used from Header, Dashboard, and post-auth handler.

## 2. Merge `/courses` into the dashboard as a state-driven zone

Keep `/courses` as a redirect to `/dashboard` (with anchor if needed for legacy links like `#bundle` → dashboard opens the purchase block). Delete the standalone catalog page from active use.

Dashboard renders one of five states:

| State | Hero | Course zone |
|---|---|---|
| A. Zero enrollments (cold arrival) | "Start Foundations free" | Locked previews of Fluency/Strategy/Action. No pricing. |
| B. Foundations in progress | "Continue: <Module N>" | Locked previews. No pricing. |
| C. Foundations done, audit not taken | Single CTA: "Take your audit" | Course zone suppressed. |
| D. Audit complete, unpaid | Recommended course, framed by audit answers | Purchase block: recommended course primary; bundle beside it; other two below. |
| E. Any paid enrollment | Continue module + portfolio | Remaining courses shown as purchasable. |

State detection uses existing signals:
- Enrollments query (already there).
- `profiles.recommended_course` (already populated by audit).
- New/existing signal for "audit completed" — verify against the Foundations audit lesson's `user_progress` row or an `audits` table (need to confirm in build phase; likely `user_progress` on the audit lesson id, or a dedicated audit-submissions table).

The purchase block from Lovable's original item 2 gets built — just rendered at state D, not state A.

## 3. Correction: Foundations is a course, not "the audit"

The prior plan called Foundations "the free audit." It isn't — Foundations is a free course that ends with the audit. Any code or copy that treats Foundations as a single audit lesson needs a pass during build to correct that assumption.

## 4. Escape hatch

Persistent low-emphasis text link in the header, all states: **"Browse all courses and pricing"** → opens the purchase block on the dashboard directly (state D layout, regardless of current state). Findable, not promoted. Leaders who arrived purchase-ready are one click from checkout; audit-path users are never shoved into a price grid.

## 5. Founder-pricing urgency banner

Slim dismissible banner, all states, sitewide top:

> Founder pricing ends September 7. [X] seats remain.

Dismiss state stored in `localStorage`. Uses existing `FOUNDER_CUTOFF_ISO` from `founderDiscount.ts`. Seats-remaining number: static config for now (e.g. from an env-like constant), refined later if a real counter is wired.

## 6. Dropped from the earlier plan

- Original item 2 (add purchase block to dashboard for zero-enrollment users) — moved to state D.
- Original item 3 (soften "Foundations = up next", change subtitle to "Pick your path below") — dropped. It severs the funnel and contradicts the CTA the user just clicked.
- Original item 4 (leave Foundations manual enroll, just add copy hint) — replaced by auto-enroll on `enroll` intent.

## Files touched

- `src/hooks/useAuth.tsx` — intent-aware `emailRedirectTo`.
- `src/pages/Auth.tsx` — consume intent on success.
- `src/pages/Dashboard.tsx` — five-state renderer.
- `src/pages/Courses.tsx` — replace with a redirect component to `/dashboard` (keep hashes).
- `src/App.tsx` — route unchanged, component swap.
- `src/components/Header.tsx` — "Browse all courses and pricing" link; bundle CTA stashes intent.
- `src/components/landing/*` — landing CTAs stash intent instead of routing to `/courses`.
- New `src/components/CheckoutModal.tsx` — shared modal (bundle + course).
- New `src/components/FounderPricingBanner.tsx` — sitewide dismissible banner.
- New dashboard subcomponents: `PurchaseBlock.tsx` (state D), `LockedPreviews.tsx` (states A/B), `AuditPromptCard.tsx` (state C).
- `src/lib/intent.ts` — small util for stash/consume.

## Out of scope

- Real seat-remaining counter (static value for now).
- Any change to audit questions or scoring.
- Schema changes (verify audit-completion signal reuses existing tables before adding one).

## Success signal

Compare audit-gated conversion vs. the previous cold-catalog conversion over the first ~10 enrollments. If audit-gated underperforms, that's real signal about the audit's role — not just the funnel.
