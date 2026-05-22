## Goal

Swap the current studio-style portrait in the hero for an environmental/action image that visually reinforces "practicing K-12 Director of Technology" and the practitioner-led brand voice.

## Approach

1. **Generate a new hero image** using the premium image model, with a prompt tuned to the Forge brand:
   - Subject: A K-12 technology leader (mid-40s male, professional but approachable) mid-conversation with educators in a modern school setting — whiteboard with a roadmap sketch visible behind, natural light, candid not posed
   - Style: Editorial documentary photography, shallow depth of field, warm but cinematic
   - Color treatment: Tones that harmonize with Deep Navy #0F172A and Brand Gold #d4af37 — warm neutrals, navy shadows, a subtle gold light source
   - Aspect ratio: 3:4 portrait (matches current `lg:aspect-[3/4]`) so no layout changes are needed
   - Save to `src/assets/hero-leader-v2.jpg`

2. **Generate 1–2 alternatives** so you can compare:
   - Alt A: Closer crop, leader at a whiteboard mid-sketch
   - Alt B: Wider shot, leader walking a school hallway with tablet, blurred staff in background

3. **Review & pick** — I'll show all options. You choose one (or ask for revisions).

4. **Swap the import in `src/components/Hero.tsx`** from `hero-leader.jpg` to the chosen file. Update the `alt` text to describe the new scene while keeping the practitioner framing. No layout, gradient, or copy changes.

5. **Optional polish** (only if you want it after seeing the image):
   - Add a thin gold border accent or corner mark behind the image frame to tie it to the Forge palette
   - Slightly stronger navy gradient overlay at the bottom for better blend with the dark hero

## Notes

- Won't look like you — AI-generated people are generic by design. The win is *signal* (this person does the work), not personal likeness. If you want it to be you specifically, that needs a real photo shoot or an uploaded reference photo I can use as a starting point.
- The existing `hero-leader.jpg` stays in the repo as fallback until you confirm the new one.
- No backend, no copy, no layout changes — this is purely an asset swap.

## Out of scope

- Restyling the rest of the page sections
- Changing hero copy, CTAs, or trust bar
- Adding video or motion to the hero
