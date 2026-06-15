# Landing copy adjustments

Frontend-only. Brand palette, typography, and section order stay intact.

## 1. ProblemV2.tsx — rewrite the three lines to map 1:1 to the doors

Replace the existing three problem lines so each one teed up the matching door:

1. "Your teachers are using AI tools you didn't approve. You're improvising the response." → routes to **Command the Tools**
2. "Your board is asking where the district stands on AI. You don't have a plan to point at." → routes to **Chart the Course**
3. "The policy passed. It's months later. Nothing in your buildings has actually changed." → routes to **Ship It**

Closer line stays: "You don't need another workshop. You need a *system*."

## 2. DoorsSection.tsx — keep short cards, add expandable detail

Update each card's quote + promise to the tightened version, then add a collapsible "See what you'll build" panel under each card using the existing shadcn Accordion (or a simple disclosure). Inside the panel, render:

- **Situation** line
- **Promise** paragraph
- **What you build** — 4 bullet items (titles + one-line descriptions)
- **Time** — e.g. "~2 hours, self-paced"
- **Who it's for** — short line

Copy per door:

**Door 1 — Command the Tools** (Fluency, produced)
- Quote: "I'm already doing AI work, but I'm winging it."
- Promise: "In about two hours, the AI work already happening in your district becomes organized, documented, and defensible."
- Builds: AI Tool Evaluation Matrix · Stakeholder Coordination Map · Communication Template Pack · 5-Day Quick Start Plan
- Time: ~2 hours · For: Tech directors, principals, instructional coaches

**Door 2 — Chart the Course** (Strategy, 5 modules)
- Quote: "My board and community want an AI answer, and I need a plan."
- Promise: "In about four and a half hours, you build the strategic answer — vision, governance, roadmap, and the deck for the room you answer to."
- Builds: Innovation Portfolio Map · Strategic Pilot Designs · Risk/Opportunity Matrix · Four-Layer Governance Stack · Strategic Roadmap + Stakeholder Presentation
- Time: ~4.5 hours · For: Superintendents, asst. supts, curriculum directors, principals

**Door 3 — Ship It** (Action)
- Quote: "We have a framework, but nothing is actually moving."
- Promise: "In about four hours, your framework becomes a 90-day plan where every line has a name and a date — plus PD, resistance strategy, and a monitoring system."
- Builds: 90-Day Launch Plan · PD Needs Assessment + Calendar · Change Response Toolkit · Monitoring Dashboard · Scaling Decision Framework · Sustainability Plan
- Time: ~4 hours · For: Leaders holding an adopted plan that isn't moving

Add the Launchpad one-liner directly above the three cards (inside DoorsSection, under the heading/intro):

> "Every path starts with a 20-minute baseline. You'll leave it with your district's AI Equity Audit score."

Styled as a subtle dashed-gold callout strip so it reads as a prerequisite, not a fourth card.

## 3. PathwaySection.tsx — remove Launchpad and Leaders Make the Future

- Drop the Launchpad step from the 4-step rail. The rail becomes a 3-step sequence: Command the Tools → Chart the Course → Ship It (renumbered 1–3).
- Remove the "Leaders Make the Future" dashed-gold callout block and its connecting stem from the top of this section.
- Keep heading, intro, and "Each course recommends the next." closer.

## 4. PricingWaitlist.tsx — add Leaders Make the Future callout below

Append a small dashed-gold band beneath the waitlist form (still inside the navy section, or as a thin band right after it) with:

> **Leaders Make the Future** — Finished a course? The advanced track: ten leadership capacities for the next decade, not the next quarter.

## Files touched

- `src/components/landing/ProblemV2.tsx` — rewrite three lines
- `src/components/landing/DoorsSection.tsx` — new quotes/promises, Launchpad one-liner, collapsible detail per card
- `src/components/landing/PathwaySection.tsx` — drop Launchpad step and Leaders Make the Future block; renumber to 3 steps
- `src/components/landing/PricingWaitlist.tsx` — add Leaders Make the Future callout below the form

## Out of scope

- Course-page detail (the full per-module breakdown lives there, not on the landing)
- Header, Hero, Bio, Testimonials, FAQ, Footer, Dashboard — untouched
- No DB, routing, or schema changes
