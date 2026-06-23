## Hero revision — match the mockup

Replace the current `HeroV2` content with a two-column layout that matches the mockup. No changes outside the hero section.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header (unchanged)                                     │
├──────────────────────────┬──────────────────────────────┤
│  Headline                │  ┌─ browser chrome ───────┐  │
│  Subhead                 │  │ app.leadershipforge.org│  │
│  [Explore] [Audit]       │  │                        │  │
│  ──────────────          │  │ Your pathway           │  │
│  50+   4    ISTE·CoSN    │  │ Welcome back, Dr...    │  │
│                          │  │ [1] Command the Tools  │  │
│                          │  │ [2] Chart the Course   │  │
│                          │  │ [3] Ship It            │  │
│                          │  └──── toast: Artifact ───┘  │
├─────────────────────────────────────────────────────────┤
│  TRUSTED IN DISTRICTS …  Pen Argyl · Chester · …        │
└─────────────────────────────────────────────────────────┘
```

### Content

- Headline: "Stop reacting to AI. Start *leading through it.*" (lowercase "reacting"/"leading", italic gold phrase — matches mockup; current is title-cased).
- Subhead: keep current copy ("The only professional-development system… Monday morning.").
- Primary CTA: "Explore the courses →" scrolls to `#doors` (was "Which one is you? ↓").
- Secondary CTA: "Take the 5-min readiness audit" opens the audit/waitlist flow (keep current `onWaitlist` wiring).
- Stat trio under a hairline divider:
  - **50+** District Leaders Trained
  - **4** Leadership Courses
  - **ISTE · CoSN** aligned
- Bottom strip (inside hero section, above next section): small caps label "TRUSTED IN DISTRICTS ACROSS PA & BEYOND" + four wordmarks as styled text: Pen Argyl ASD, Chester County IU, Bethlehem Area, Easton ASD.

### App preview mockup (HTML/CSS, no real data)

New component `src/components/landing/HeroAppPreview.tsx` — pure presentational, no data fetching:

- Outer card: `bg-[#0b1220]` (slightly lighter than navy), rounded-lg, subtle border, shadow.
- Browser chrome row: three dots + `app.leadershipforge.org` label.
- Body:
  - Eyebrow "Your pathway" + "Welcome back, Dr. Ellison" in display font.
  - Three pathway rows, each a dark card with a numbered square badge:
    1. **Command the Tools** — progress bar 72% in gold, "72%" right-aligned. Active state (gold left border / badge filled gold).
    2. **Chart the Course** — "Strategy · 6 modules", "Locked" pill right.
    3. **Ship It** — "Action · 90-day plan", "Locked" pill right.
- Floating toast (absolute, bottom-right, overlapping card edge): white card, green check icon, "Artifact saved" bold + "3-Year Roadmap · ready for your board".

All colors via existing tokens (navy, gold, muted, foreground) — no hardcoded brand colors except the slightly-lighter card background, which I'll add as an inline style or extend the existing surface scale.

### Files touched

- `src/components/landing/HeroV2.tsx` — rewrite content/layout (keep `onWaitlist` prop, keep `hero-horizon-glow` and reveal classes).
- `src/components/landing/HeroAppPreview.tsx` — new, pure JSX/Tailwind.
- No changes to `Index.tsx`, header, or other sections.

### Out of scope

- District names are placeholders — wire to real partners later.
- No image generation; mockup is built in markup.
- No font, route, or backend changes.