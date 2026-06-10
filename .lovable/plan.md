# Landing Page Rebuild

Port the provided HTML design into the existing React/Tailwind/shadcn stack. Replace the landing page and global header. Keep the existing brand palette (Navy `#0F172A`, Gold `#d4af37`, Off-White `#FAFAF8`, Playfair Display + Inter) and adapt the design's structural/typographic choices to those tokens.

## Scope

**Replaced:**
- `src/components/Header.tsx` — new top nav (brand "Leadership Forge", section anchors, "Join the waitlist" gold CTA, scrolled-state blur/border)
- `src/pages/Index.tsx` — re-composed from new sections below
- New section components under `src/components/landing/`:
  - `HeroV2` (centered, eyebrow badge, italic-gold accent on H1, dual CTA, trust bar)
  - `ProblemV2` (eyebrow + headline + 3 escalating pain lines with gold ticks + closing line)
  - `DoorsSection` ("Which one is you?" — 3 door cards routing to course paths)
  - `PathwaySection` (Foresight layer card + 4-step connected pathway: Launchpad → Command the Tools → Chart the Course → Ship It)
  - `DeliverablesSection` (4 artifact cards)
  - `BioSection` (photo placeholder + Role / Experience / Philosophy + pull-quote)
  - `TestimonialsV2` (2-card workshop quotes + "online cohort coming" note)
  - `PricingWaitlist` ($75/course + waitlist form on navy)
  - `FaqSection` (5 `<details>`-style accordion items using shadcn Accordion)
  - `FooterV2` (brand + link row + copyright on navy)

**Untouched:** auth, courses, admin, course viewer, portfolio, all other routes. The existing `Footer.tsx` keeps serving non-landing pages; landing gets `FooterV2`.

## Design token reconciliation

The HTML ships its own palette (`#0B1626` navy, `#D9A53F` gold, `#F7F5F0` paper, Fraunces serif). Per your direction, we keep the locked Forge palette and Playfair/Inter — but adopt the design's **structural** moves:
- Paper sections use existing `off-white` token instead of `#F7F5F0`
- Navy sections use `--navy` (`#0F172A`)
- Gold accents use `#d4af37` (with `#e5c56b` hover per memory)
- Serif headings stay Playfair Display (no Fraunces import added)
- Italic-gold accents on H1 and pull-quotes are preserved
- Dashed gold borders, gold "tick" rules, route chips, door hover lift, 4-step rail — all preserved
- Radius capped at 8px per brand memory (design used 14px → we use 8px)

## CTA wiring (best-effort)

| Button in design | Wired to |
|---|---|
| Header "Join the waitlist" | opens `WaitlistModal` (`source="header"`) |
| Hero "Which one is you? ↓" | smooth-scroll to `#doors` |
| Hero "Join the waitlist" | `WaitlistModal` (`source="hero"`) |
| Door cards (3) | `navigate()` to existing course slugs — Command the Tools, Chart the Course, Ship It (slugs confirmed from `AdminCourses` data; if a slug is missing, card falls back to `/courses`) |
| Audit line "5-minute AI Readiness & Equity Audit" | opens `WaitlistModal` (`source="readiness-audit"`) — no audit page exists yet |
| Pathway step cards | non-interactive (visual only, matches HTML) |
| Pricing waitlist form | submits via existing `upsert_waitlist_lead` RPC (`source="pricing-waitlist"`), same success/error UX as `WaitlistModal` |
| Footer links | smooth-scroll to in-page anchors |

## Content preserved verbatim

All headlines, pain statements, door copy, pathway descriptions, deliverable names, bio paragraphs, testimonials, pricing copy, and FAQ answers from the HTML are kept as-is. The "Built by a practicing K-12 Director of Technology" bio phrasing is respected per brand memory (the design's "practicing K-12 technology director" line will be aligned to that exact memory phrasing in the footer and bio eyebrow).

## Technical notes

- Reveal-on-scroll (`.rv` / `IntersectionObserver`): implemented via a tiny `useReveal` hook with `prefers-reduced-motion` respected.
- Pathway rail "draw" animation: same `IntersectionObserver`, toggles a `drawn` class.
- Header scrolled state: `useEffect` scroll listener toggling `data-scrolled`.
- FAQ: shadcn `Accordion` (single-open behavior matches `<details>`).
- Waitlist form on pricing reuses the same Zod schema + RPC as `WaitlistModal` to avoid drift.
- Skip-link added for a11y.
- No new fonts loaded (we already have Playfair + Inter).
- No DB changes. No new edge functions. No schema migrations.

## Out of scope (call out for follow-up)

- Real bio photo — placeholder block shipped; you supply image later
- Course-slug-to-door mapping if any of the three target courses don't exist yet — those doors will route to `/courses`
- Readiness & Equity Audit page — currently routes to waitlist modal
