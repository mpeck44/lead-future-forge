# Rebalance the Problem section

Rework `src/components/landing/ProblemV2.tsx` from a single stacked column into the two-column layout shown in the mockup. No copy changes elsewhere, no new components, no token changes.

## Layout

```text
┌──────────────────────────────┬──────────────────────────────────────────┐
│ • THE SITUATION              │ 01  Your teachers are using AI tools…    │
│                              │ ─────────────────────────────────────── │
│ The problem school           │ 02  Your board is asking where the…      │
│ leaders face                 │ ─────────────────────────────────────── │
│                              │ 03  The policy passed. It's months…      │
│ You're being asked to lead   │ ─────────────────────────────────────── │
│ on AI before anyone handed   │                                          │
│ you a playbook. Sound        │     You don't need another workshop.     │
│ familiar?                    │     You need a *system.*                 │
└──────────────────────────────┴──────────────────────────────────────────┘
```

- Grid: `lg:grid-cols-[1fr_1.35fr]` with generous column gap; stacks on mobile.
- Left column (sticky-feeling, no actual sticky):
  - Gold-dot eyebrow "THE SITUATION" (existing styling).
  - Display headline: **The problem school leaders face**.
  - Muted subhead: *You're being asked to lead on AI before anyone handed you a playbook. Sound familiar?*
- Right column:
  - Three numbered rows (`01`, `02`, `03`) in gold display type, content in foreground display type, separated by `border-b border-foreground/10` (top border on first row).
  - Below the third divider, the closing line in display: **You don't need another workshop. You need a *system.*** (gold italic "system.")

## Copy (final)

- Eyebrow: `The situation`
- Headline: `The problem school leaders face`
- Subhead: `You're being asked to lead on AI before anyone handed you a playbook. Sound familiar?`
- 01: `Your teachers are using AI tools you didn't approve. You're improvising the response.`
- 02: `Your board is asking where the district stands on AI. You don't have a plan to point at.`
- 03: `The policy passed. It's months later. Nothing in your buildings has actually changed.`
- Closing: `You don't need another workshop. You need a system.`

## Out of scope

- No changes to Hero, Doors, or other sections.
- No new design tokens, fonts, or assets.
- No reveal-animation changes beyond keeping existing `rv` classes on the same elements.
