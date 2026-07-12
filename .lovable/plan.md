## Landing page: strengthen positioning

Two changes to `src/pages/Index.tsx` section order and content.

### 1. New section: "Why not just ask ChatGPT?"

Create `src/components/landing/WhyNotChatGPTSection.tsx` — a full-width objection-handler block styled to match the site (navy background, gold accent rule, Playfair headline, Inter body). Content:

- Eyebrow: **The objection everyone thinks but doesn't say**
- Headline: **"Why not just ask ChatGPT?"**
- Body (Mike's voice, first-person):
  > AI can draft your policy in an afternoon. It can't tell you which clause fails in a board meeting, which stakeholder quietly kills your pilot, or what breaks in month three.
  >
  > The hard part was never generating answers. It's knowing which questions to ask.
  >
  > That's what I teach.
- Signature line: small gold rule + "— Mike Peck, K-12 Director of Technology"

Placement: directly after `ProblemV2` and before the (new) authority block — the objection lands right after the pain is named, before the person is introduced.

### 2. Restructure the bio into an "authority / demand evidence" block, moved up

Rebuild `BioSection.tsx` (or add a new `AuthoritySection.tsx` and retire `BioSection`) around proof of external demand rather than résumé shape.

New structure:

- Eyebrow: **Why people are already coming to me**
- Headline: **Built by a practitioner other leaders are already seeking out.**
- Left column: Mike's headshot (keep existing image, keep grayscale treatment).
- Right column: four short proof cards, each a one-line claim + one-line detail. Not bullets — small labeled blocks with gold micro-eyebrows:

  1. **Teaching** — Currently teaching emerging-technology courses to doctoral students at Delaware Valley University.
  2. **Speaking** — Sought out for regional panels and keynotes on AI in K-12.
  3. **Convening** — Founded a K-12 AI leadership advisory group; organizing in-person events for district leaders.
  4. **Building** — Designs and runs custom AI systems in a working district — not theory, current practice.

- Closing pull-quote (keep the existing philosophy line): *"I build practical tools educational leaders can put into practice today."*

Move this section **up the page** in `Index.tsx`. New order:

```text
HeroV2
ProblemV2
WhyNotChatGPTSection        ← new
AuthoritySection            ← moved from position 6 to position 4
DoorsSection
PathwaySection
DeliverablesSection
TestimonialsV2
PricingWaitlist
FaqSection
```

Rationale: buyer sees pain → objection defused → the person who can solve it → then the offer. Person appears while attention is still high, framed as demand-evidence not résumé.

### Technical details

- New file: `src/components/landing/WhyNotChatGPTSection.tsx`.
- Rewrite: `src/components/landing/BioSection.tsx` → rename export or replace with `AuthoritySection.tsx` (keep import path stable by editing `BioSection.tsx` in place to minimize churn).
- Edit: `src/pages/Index.tsx` — insert `WhyNotChatGPTSection`, move authority section above `DoorsSection`.
- Reuse existing tokens: `bg-navy`, `text-gold`, `hsl(40_72%_30%)` eyebrows, Playfair `font-display`, Inter `font-body`, `rv` reveal classes. No new colors, no new fonts.
- No copy changes to Hero, Problem, Doors, Pathway, Deliverables, Testimonials, Pricing, FAQ in this pass.
- No backend, routing, or SEO metadata changes.

### Out of scope for this change

- Rewriting testimonials, pricing, or FAQ.
- Adding new images or logos for Delaware Valley University / panels (text-only proof for now; can add logos in a later pass once permissions are confirmed).
