

## Remove Em Dashes Across the Site

### Scope
Found em dashes (—) in 11 files. I'll replace each with the most grammatically natural alternative (comma, period, parentheses, or colon) based on context. Code-only uses (placeholder text in admin tables like "—" for empty values) will be left alone since they're visual UI placeholders, not prose — unless you'd prefer those changed too.

### Files & Replacements

**User-facing landing page copy (priority):**
- `src/components/Hero.tsx` — body copy: "...board-ready plans, with deliverables you use Monday morning." Comments updated too.
- `src/components/ProblemSection.tsx` — 2 instances → commas
- `src/components/OutcomesSection.tsx` — 3 instances → commas / parentheses
- `src/components/DifferentiatorSection.tsx` — 2 instances → commas
- `src/components/TestimonialsSection.tsx` — 1 instance in testimonial quote → comma
- `src/components/FeaturedCourse.tsx` — 1 instance in shortDescription → colon

**Course content data:**
- `src/data/experienceBlocks.ts` — replace em dashes inside Mike's experience block strings with commas/periods (e.g., `"AI can't build relationships, only you can."`)

**Code comments / parser internals (low visibility but cleaned for consistency):**
- `src/lib/parseCourseContent.ts` — comments only → commas
- `src/lib/parseCourseContent.test.ts` — comment only → comma

**Admin UI placeholder dashes (LEFT AS-IS):**
- `src/pages/admin/AdminCourses.tsx` line 408, `src/pages/admin/AdminWaitlist.tsx` lines 77, 239, 355 — these render `—` as a visual "no value" placeholder in admin tables. Standard UI convention. Will leave unless you want them swapped to "N/A" or a hyphen.

### Approach
For each prose em dash, I'll choose the cleanest replacement:
- Parenthetical aside → commas (most common)
- Strong break / contrast → period + new sentence
- List/explanatory follow-on → colon

No layout, styling, or logic changes. Pure copy edits.

