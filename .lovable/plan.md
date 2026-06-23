## Rebuild the Artifacts section to match the mockup

Rewrite `src/components/landing/DeliverablesSection.tsx` so the section matches the attached mockup. The current version (4 identical white cards) gets replaced with a 3-part layout: a hero "Featured deliverable" card on the left, a clean stacked list of supporting deliverables on the right, and a full-width dark testimonial below. The stray "Photo / browse files" placeholder visible in the screenshot is a mockup artifact and will not exist in the built version.

### Layout

```text
┌─ eyebrow + headline + subhead (left-aligned, max ~640px) ──┐
│                                                            │
├──────────────────────────────────┬─────────────────────────┤
│ FEATURED DELIVERABLE             │ ▣ AI Governance Framework
│ 3-Year AI Strategic Roadmap      │   Customized to your…   │
│                       [Board-ready] ─────────────────────── │
│  Y1 ████████████░░░  Foundations │ ▣ Pilot Program Design  │
│  Y2 ████████░░░░░░░  Scaled      │   Scoped, staffed…      │
│  Y3 █████░░░░░░░░░░  District    │ ───────────────────────  │
│  ──                              │ ▣ Stakeholder Comms     │
│  Sequenced, defensible, and yours│   Board, parents, staff…│
├──────────────────────────────────┴─────────────────────────┤
│  ░ dark navy band                                           │
│  "I walked into my board meeting with a roadmap            │
│   instead of a shrug. That's the difference."              │
│  Dr. Maria Ellison — Superintendent, suburban district     │
└────────────────────────────────────────────────────────────┘
```

- Two-column grid `lg:grid-cols-[1.05fr_1fr]` with `gap-10`; stacks on mobile.
- Featured card: white surface, `rounded-xl`, soft shadow, `p-7`. Top row = gold uppercase eyebrow "FEATURED DELIVERABLE" + display headline; right side a small gold pill "Board-ready". Body = three rows (Y1/Y2/Y3) each rendered as `grid-cols-[auto_1fr_auto]` with gold display year label, slim progress bar (gold fill on `bg-foreground/10`, widths 78%/58%/38%), and a muted right-side caption ("Foundations & policy", "Scaled pilots", "District-wide"). A `border-t border-foreground/10` then a muted footer line.
- Right column: three deliverable rows separated by `border-b border-foreground/10`. Each row = `grid-cols-[auto_1fr]` with a small navy square icon tile (`bg-deep-navy text-gold rounded-md w-10 h-10`) holding a Lucide icon, plus title (`font-display`) and muted body. Icons: `ShieldCheck`, `FlaskConical`, `MessageSquareQuote`.
- Testimonial band: full-width inside the container, `bg-deep-navy text-background rounded-xl px-10 py-9 mt-12`. Italic Playfair quote, then `Dr. Maria Ellison` in gold + muted role line. No avatar/photo element.

### Content

- Eyebrow: `What you'll walk away with`
- Headline: `You don't finish with notes. You finish with` *artifacts.* (italic gold last word)
- Subhead: `Every module produces something you can put in front of your board, your cabinet, or your staff — this week.`
- Featured: title `3-Year AI Strategic Roadmap`, pill `Board-ready`, footer `Sequenced, defensible, and yours — generated from your district's real policies, people, and risk tolerance.`
- Right list:
  - `AI Governance Framework` — `Customized to your district's policies, people, and risk tolerance.`
  - `Pilot Program Design` — `Scoped, staffed, and measured — success metrics defined before you start.`
  - `Stakeholder Comms Templates` — `Board, parents, staff — the messages ready before the questions come.`
- Quote: `"I walked into my board meeting with a roadmap instead of a shrug. That's the difference."` — `Dr. Maria Ellison` — `Superintendent, suburban district (4,800 students)`

### Out of scope

- No new tokens, fonts, or assets.
- No changes to other landing sections or Index ordering.
- No photo/avatar element on the testimonial.
- No backend, data, or routing changes.
