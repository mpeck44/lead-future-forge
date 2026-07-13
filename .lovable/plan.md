# Hero preview + purchase flow

Three focused changes on the landing page. No business logic or backend changes.

## 1. Rebuild the hero app preview as a light "split view"

Rewrite `src/components/landing/HeroAppPreview.tsx` so the card reads off-white against the dark navy hero — the contrast the user asked for — and shows both the pathway *and* a tangible artifact.

**Top card — pathway progress (compact)**
- Off-white background (`hsl(0 0% 98%)` / `#FAFAF8`), subtle border, deep-navy text, gold accents preserved.
- Browser chrome bar with muted dots + `app.leadershipforge.org`.
- Header: "Your pathway" eyebrow + "Welcome back, Dr. Ellison".
- Three compact rows: **Command the Tools** (72% gold progress, active), **Chart the Course** (locked), **Ship It** (locked). Same content as today, just re-skinned light.

**Bottom card — artifact thumbnail (new, smaller)**
- Slight overlap / staggered offset below the pathway card (negative margin), same light surface with a thin left gold accent.
- Renders a mini "document" preview:
  - Small doc-icon tile + label: **3-Year AI Roadmap.pdf** · "Board-ready · 14 pages"
  - Three faint text-line placeholders (skeleton bars) suggesting document content.
  - Small "Ready to present" pill in gold.
- Retains the existing "Artifact saved" green toast, repositioned to hang off the artifact card's bottom-right.

**Styling notes**
- Only use design tokens already in the theme (navy, gold, off-white, muted). No hardcoded `text-white`/`bg-black` in components.
- Shadow: soft, dark shadow so the light cards read as elevated on the navy hero.
- Fully responsive: on mobile the two cards stack cleanly; on desktop the offset gives depth without pushing outside the column.

## 2. Add a sticky "Buy Complete Path" bar for logged-out visitors

Add `src/components/landing/StickyBuyBar.tsx` and mount it in `src/pages/Index.tsx`.

Behavior:
- Only renders when the user is **not** authenticated (checks `useAuth().user`).
- Hidden by default; becomes visible once the user has scrolled past the hero (roughly `window.scrollY > 600`, using a scroll listener with `requestAnimationFrame`).
- Fixed to the bottom of the viewport, full-width on mobile, centered pill on desktop, `z-40` so it sits below modals.
- Contents: short label ("The Complete Path — Fluency + Strategy + Action") + strikethrough $237 + bold $197 + primary gold **Buy the bundle →** button linking to `/bundle`, plus a small secondary text link "Compare courses" → `#doors`.
- Includes a small close (`×`) button that hides it for the session (sessionStorage flag) so it never feels intrusive.
- Reduced-motion friendly slide-in; respects `prefers-reduced-motion`.

Hero CTAs in `HeroV2.tsx` stay as they are: **Explore the courses →** (primary) and **Take the 5-min readiness audit** (secondary). The sticky bar becomes the direct-to-purchase shortcut once the visitor has engaged with the page.

## 3. Files touched

```text
src/components/landing/HeroAppPreview.tsx   rewrite (light split view)
src/components/landing/StickyBuyBar.tsx     new
src/pages/Index.tsx                          mount <StickyBuyBar /> once
```

No route, DB, edge function, or pricing logic changes. `/bundle` and its checkout already exist.

## Out of scope

- No changes to the hero copy, headline, or the two existing CTA buttons.
- No changes to `/bundle` pricing, Stripe wiring, or the courses grid.
- No new imagery/illustration assets — the artifact card is pure CSS.
