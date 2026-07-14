
# Catalog page fix + site-wide name unification

Scope: `/courses` catalog visual hierarchy, the non-landing header CTA, canonical course names across every surface, and copy fixes. No founder pricing / deadline (skipped per your call). No DB renames.

## 1. Canonical names — plain vocabulary wins

Rename the buyer-facing display of the three paid courses to **Fluency / Strategy / Action** everywhere. Retire "Command the Tools / Chart the Course / Ship It" from the marketing surfaces.

Surfaces edited:
- `HeroV2.tsx` — pathway chips / any inline references to the metaphor names.
- `PathwaySection.tsx` — `title` becomes "Fluency", "Strategy", "Action"; the metaphor line becomes a short one-line description under the title (not a competing name).
- `DoorsSection.tsx` — `route` labels become "Fluency", "Strategy", "Action".
- `Courses.tsx` — already uses Fluency / Strategy / Action from DB titles. No change needed to names.
- `FeaturedCourse.tsx` — verify heading copy references the same three names; no change to card subtitles.
- Audit routing/results (`src/lib/auditQuestions.ts`, `AuditLesson.tsx`, `RecommendationCard.tsx`) — any user-visible "Command the Tools" style label becomes "Fluency" etc. Slug keys (`fluency` | `strategy` | `action`) stay unchanged; this is a display-string sweep only.
- Waitlist modal + email copy in `WaitlistModal.tsx` — display strings only.

Not touched: DB `courses.title`, slugs, `audit_category` enum, edge functions, Stripe product names.

## 2. Header CTA — kill the dead waitlist button

`Header.tsx` (non-landing branch, lines 244–250 and mobile 282–284):

- Replace `Join the Waitlist` button (desktop + mobile) with a primary CTA `Get the bundle` linking to `/bundle`.
- Landing header (lines 132–139, 168–175) also swaps to `Get the bundle` → `/bundle`. Remove `WaitlistModal` import + state from `Header.tsx` since it's the only consumer there.

## 3. Catalog visual hierarchy — one job per color

`src/pages/Courses.tsx` `renderCourseCard` + bundle strip + page background.

**Color job reset:**
- Gold reserved for the enroll/buy button only. Remove `text-primary` from price (line 179) → use `text-navy` (`text-foreground`). Remove `text-primary` from the italic tagline (line 207) → use `text-muted-foreground`.
- `"View course details"` button: outline-only, transparent fill, navy text, hairline border. Loses visual weight so the gold Enroll button dominates.
- Requires-Foundations badge: neutral (charcoal outline, no gold accent). It's information, not a promotion.

**Card lift:**
- Page background stays cream (`bg-background`).
- Cards get explicit white fill (`bg-white`), a hairline border (`border border-border/60`), and a soft shadow (`shadow-sm hover:shadow-md`). Cards separate from the surface instead of blending.

**Bundle becomes the focal point:**
- Replace the thin horizontal bundle strip (lines 371–388) with a full-height navy card sized to match the three pathway cards below.
- Layout change: bundle card sits in the same row/grid as Fluency / Strategy / Action, OR spans a prominent slot above them at the same card height (not a strip). Choosing above-them, full-width dark card with the same padding scale as the course cards below.
- Style: `bg-navy text-white` card, gold `Get the bundle →` button inside (linking to `/bundle`), price shown as $197 in white with "Save $40 vs. buying separately" in white/70. No gold background tint. Contents:
  - Eyebrow: "Complete Path" in gold small-caps.
  - Title: "Fluency + Strategy + Action" in white display font.
  - Body: 2-line pitch.
  - Bullets: three tight "What you get" lines (one per course, distinct deliverables — see §5).
  - CTA row: gold `Get the bundle →` primary + white/outline `Compare courses` secondary that scrolls to the trio.
- Foundations card stays visually prominent but drops the gold Enroll button to a burnt-orange fill matching enroll style; it's the funnel entry, not the money card.

## 4. Requires-Foundations gate — verified open

Confirmed in `handleEnroll` (Courses.tsx lines 80–133) and `/bundle` checkout: nothing blocks a paid enroll or bundle purchase on Foundations completion. The badge is informational only. **No code change required** — plan documents this as verified. The badge stays (still useful signal for cold traffic), but rewords to `Builds on Foundations` so it reads as continuity, not a gate.

## 5. Distinct deliverables + time estimates per card

Replace the identical "Documents and tools you can use next week" line in `renderCourseCard` (line 196) with per-course copy keyed by slug. Add a small lookup at the top of `Courses.tsx`:

```text
fluency    → "AI Communication & Stakeholder Plan — templates, coordination map, 5-day action plan"       · 6 hours
strategy   → "3-Year AI Strategic Roadmap — governance matrix, portfolio priorities, board-ready deck"   · 8 hours (fill from DB when set)
action     → "90-Day Pilot Launch Plan — milestones, pilot playbook, responsible-use checklist"           · 8 hours (fill from DB when set)
foundations→ "AI Landscape & District Readiness Baseline — maturity scorecard, risk/opportunity matrix"  · 4 hours
```

Time estimates: DB currently has `estimated_hours` for foundations (4) and fluency (6) only. Strategy and Action are null → show a fallback of "~8 hours" so every card carries a time signal (same visual weight as Fluency's Clock icon). Update `courses.estimated_hours` for strategy/action via a one-line migration to 8 each, so the fallback isn't hard-coded in the component. Migration:

```sql
update public.courses set estimated_hours = 8 where slug in ('strategy','action') and estimated_hours is null;
```

Remove the "This isn't comprehensive. It's practical." italic line (line 207–209) — it's decorative filler that doesn't earn its space now that each card names its actual output.

## 6. Files touched

```text
src/pages/Courses.tsx                     card styling, bundle card rewrite, per-slug deliverables + hours
src/components/Header.tsx                 waitlist button → "Get the bundle" (both branches, mobile too)
src/components/landing/HeroV2.tsx         name references (Fluency/Strategy/Action)
src/components/landing/PathwaySection.tsx titles → Fluency/Strategy/Action; metaphor demoted to description
src/components/landing/DoorsSection.tsx   route labels → Fluency/Strategy/Action
src/components/FeaturedCourse.tsx         verify name display (likely no-op)
src/lib/auditQuestions.ts + AuditLesson + RecommendationCard  display-string sweep
src/components/WaitlistModal.tsx          display-string sweep only
supabase migration                        set estimated_hours=8 for strategy + action
```

## Out of scope

- Founder pricing, Labor Day deadline (skipped per your call — noted as separate decision to revisit).
- Renaming DB rows, slugs, Stripe products, or `audit_category` enum values.
- `/bundle` page redesign (only the catalog's bundle card changes; the destination page is a follow-up).
- Building the public audit page.

