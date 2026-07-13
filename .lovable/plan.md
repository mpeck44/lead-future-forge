
# Hero: real audit screenshot + inverted CTAs

Uploaded screenshot #4 (baseline + recommended course card) becomes the hero visual. No public audit build required.

## 1. Prepare the hero image

- Crop the uploaded screenshot to just the content column — drop the left "Foundations" sidebar and the top "My Courses / Foundations / 60%" chrome. Result: the "AI Equity Audit / Your AI Equity Audit baseline" heading, the 5-bar card, and the "Recommended next course → Go to Fluency" card.
- Scrub identifiers before upload: change "Attempt #2" → remove the "Attempt #N" line entirely (or replace with a neutral subhead — I'll pick the cleaner of the two visually). No other text edits.
- Upload via `lovable-assets` to `src/assets/hero-audit-results.png.asset.json`. Commit only the pointer.

## 2. Rewrite `HeroAppPreview.tsx`

Replace the fabricated dashboard/artifact cards with the real screenshot inside the existing off-white browser chrome bar:

- Keep the chrome bar (`app.edleaderforge.com` — match the custom domain in memory, not the placeholder URL).
- Render the screenshot as `<img src={heroAuditAsset.url} alt="AI readiness audit results — score across five categories with a recommended course path" className="w-full h-auto" />` inside a soft-shadow rounded container.
- Delete: fake "Welcome back" user, 72% progress bar, "3-Year AI Roadmap.pdf" card, "Artifact saved" toast, chrome-bar gold dot indicators.

## 3. Invert hero CTAs in `HeroV2.tsx`

- **Primary (gold):** `Get your AI readiness score` → triggers `onWaitlist("readiness-audit")` (same handler as today's secondary). Helper line under button in `text-white/50 text-[0.78rem]`: "Takes 5 minutes · see your district's baseline and recommended path".
- **Secondary (outline):** `See courses and pricing →` → scrolls to `#doors`.
- Headline, subhead, and stats strip unchanged.

Honesty note: the primary CTA currently opens the waitlist modal, not a live public audit. That's a known gap — flagged for a follow-up, not this change. The screenshot itself is real, so the hero no longer fabricates traction.

## 4. Prices visible on `#doors`

Open `DoorsSection.tsx`. If each course card's price isn't already directly under the course title (above any body copy), move it there. No price changes, no `/bundle` changes. If prices are already prominent, no-op.

## 5. Files touched

```text
src/assets/hero-audit-results.png.asset.json  new (CDN pointer from uploaded screenshot)
src/components/landing/HeroAppPreview.tsx     rewrite (real screenshot, no fake UI)
src/components/landing/HeroV2.tsx             swap primary/secondary CTAs + helper line
src/components/landing/DoorsSection.tsx       conditional: move price under title
```

`StickyBuyBar.tsx` and its mount in `Index.tsx` unchanged.

## Out of scope

- Building the public audit page (primary CTA still opens waitlist modal — flagged, separate work).
- Copy changes to headline, subhead, stats.
- `/bundle`, Stripe, audit questions/logic, or audit results page redesign.
