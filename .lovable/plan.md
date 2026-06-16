## Plan

### 1. Move Launchpad band below the routing section
- Remove the Launchpad prerequisite one-liner from `DoorsSection.tsx` (currently above the three cards).
- Insert a new quiet divider band directly below `<PathwaySection />` and above `<DeliverablesSection />` in `Index.tsx`.
- The band is a single line: **"Every path starts with a 20-minute baseline. You'll leave it with your district's AI Equity Audit score."**
- Style it as a subtle divider — not a full section. Use muted text, centered, with minimal vertical padding (no heavy borders or background shifts).

### 2. Update the Leaders Make the Future block below pricing
- In `PricingWaitlist.tsx`, update the existing dashed-gold block to match the user's exact copy:
  - Headline: **"After the courses: Leaders Make the Future"**
  - Body: **"The advanced track — ten leadership capacities built for the next decade, not the next quarter."**
- Since the course does not exist in the database yet, render a disabled / "Coming soon" button instead of a functional link.
- Keep the block visually subordinate — same dashed-gold styling, no competing visual weight.

### Files changed
- `src/components/landing/DoorsSection.tsx`
- `src/components/landing/PricingWaitlist.tsx`
- `src/pages/Index.tsx`

### Out of scope
- No database or backend changes.
- No changes to Hero, Problem, Bio, Testimonials, FAQ, Footer, or Dashboard.