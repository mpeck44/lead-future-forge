
# Hero: honest proof + inverted CTAs

Two focused changes. No business logic, no backend.

## 1. Replace the fabricated app mockup with a real audit-results screenshot

**Problem.** The current `HeroAppPreview.tsx` invents a user ("Welcome back, Dr. Ellison"), fakes 72% progress, and leads with a "3-Year AI Roadmap.pdf — board-ready" card. That simulates traction we don't have and foregrounds the exact deliverable a frontier model can already generate, which invites the "why not just ChatGPT" objection in the hero.

**Fix.** Replace it with a real screenshot of the **audit results screen** — actual readiness score, gap breakdown, and course routing recommendation — captured from a real run with real inputs.

**How this lands in code:**

- I'll run the readiness audit end-to-end myself against the running preview (Playwright), fill it with plausible real inputs (no staging), and screenshot the results screen at 1280×1800.
- Save that PNG under `src/assets/hero-audit-results.png` and upload via `lovable-assets` → commit only the `.asset.json` pointer.
- Rewrite `src/components/landing/HeroAppPreview.tsx` to render:
  - The same off-white browser chrome bar (`app.leadershipforge.org`) so it still reads as "the product".
  - The screenshot as an `<img>` inside the chrome, `w-full h-auto`, soft shadow, `alt="AI readiness audit results — score, gap breakdown, and recommended course path"`.
  - No fake progress bars, no fake user, no artifact card, no "Artifact saved" toast — all deleted.
- If the audit-results page has any personally identifying text from my run, I'll re-run with a neutral display name (e.g. "Sample District") before the final capture.

**Out of scope for this change:** redesigning the audit results page itself. If the current results screen doesn't visually hold up as a hero asset (e.g. too sparse), I'll flag it and we'll decide separately whether to polish that page — I won't silently restyle it to make the screenshot look better.

## 2. Invert the hero CTAs in `HeroV2.tsx`

Swap primary/secondary. The audit is the highest-converting moment (personalized diagnosis + course routing + founder pricing), so it earns primary.

- **Primary (gold, same styling as today):** `Get your AI readiness score` — triggers `onWaitlist` (which opens the audit modal, same handler as today's secondary). Small helper line directly under the button in `text-white/50 text-[0.78rem]`: "Takes 5 minutes · no email required to see your score" (exact copy TBD — I'll keep it to one short line and preserve the 5-minute promise).
- **Secondary (outline, same styling as today's outline):** `See courses and pricing →` — scrolls to `#doors` (what today's primary does).

Everything else in the hero (headline, subhead, stats strip, layout grid) stays as-is.

## 3. Prices visible without scrolling on the courses/pricing target

The secondary CTA now promises "pricing," so the `#doors` section it lands on must show prices above the fold of that section — not require another scroll.

I'll open `src/components/landing/DoorsSection.tsx` and check whether each course card already shows its price near the top of the card. If prices are currently lower in the card or hidden behind a "Learn more" click:

- Move the price (and any strikethrough / founder price) into the card header area, directly under the course title.
- No changes to the actual prices or to `/bundle` — this is purely surfacing existing numbers.

If prices are already prominent, this step is a no-op and I'll say so.

## 4. Files touched

```text
src/components/landing/HeroAppPreview.tsx    rewrite (real screenshot, no fake UI)
src/assets/hero-audit-results.png.asset.json new (CDN pointer for the real capture)
src/components/landing/HeroV2.tsx             swap primary/secondary CTAs + helper line
src/components/landing/DoorsSection.tsx       only if prices aren't already prominent
```

`StickyBuyBar.tsx` and its mount in `Index.tsx` stay exactly as they are.

## Out of scope

- No copy changes to the headline, subhead, or stats.
- No changes to `/bundle`, Stripe wiring, or the audit questions/logic.
- No redesign of the audit results page itself (flag-only if it doesn't screenshot well).
