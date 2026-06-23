## Add Recommendation Card to Learner Dashboard

Insert a single recommendation card above the existing `PathwayStrip` + `PortfolioGrid` in `src/pages/Dashboard.tsx`. No other dashboard structure changes. Catalog and pathway remain untouched.

### Component

Create `src/components/dashboard/RecommendationCard.tsx` — a self-contained card that:
- Reads `profiles.recommended_course` for the current user (already fetched alongside `full_name` after a small extension to the profile query in `Dashboard.tsx`).
- Computes the recommended course's state from data the dashboard already loads: `enrollments` + `progressBundle.byCourse` (done/total lessons).
- Renders one of four variants. Visually matches the existing gold-bordered hero card (same `border-t-4 border-gold`, navy/gold tokens, gold CTA button) so it sits naturally above the pathway strip.

### Variants

| State | Condition | Headline | Body | CTA |
|---|---|---|---|---|
| **Start** | enrolled but `done === 0`, OR not enrolled | "Your recommended starting point: {Course Name}" | course's situation line | "Start {Course Name}" → `/course/{slug}` if enrolled, else `/courses` |
| **Continue** | enrolled, `0 < done < total` | "Pick up where you left off in {Course Name}" | "{done} of {total} lessons complete" | "Continue {Course Name}" → `/course/{slug}` |
| **Next-step** | recommended course completed AND there is a next rung on the ladder | "You finished {Just-Done Course}. Next: {Next Course Name}" | next course's situation line | "Start {Next Course Name}" → `/course/{next-slug}` if enrolled, else `/courses` |
| **Re-audit** | recommended course is `action` AND completed (top of ladder reached) | "Re-run your Equity Audit" | "The trend line from your baseline is the story you tell next year." | "Start new audit" → inserts a fresh `audit_attempts` row, then navigates to `/course/foundations` |

If `recommended_course` is null / empty, render nothing (card simply doesn't appear; existing dashboard is unchanged).

### Ladder

Hardcoded in the component, mapped to actual DB slugs (per earlier decision):
- `fluency` → `strategy` → `action` → re-audit

(Spec slugs `command_the_tools` / `chart_the_course` / `ship_it` map to `fluency` / `strategy` / `action`.)

### Situation lines

Lifted verbatim from `src/components/landing/DoorsSection.tsx` and stored in a small constant map inside `RecommendationCard.tsx` keyed by slug — no DB schema change.

### Re-audit click

```ts
// pick next attempt_number = max(existing) + 1, then insert
const { data: latest } = await supabase
  .from("audit_attempts")
  .select("attempt_number")
  .eq("user_id", user.id)
  .order("attempt_number", { ascending: false })
  .limit(1);
const nextNum = (latest?.[0]?.attempt_number ?? 0) + 1;
await supabase.from("audit_attempts").insert({ user_id: user.id, attempt_number: nextNum });
navigate("/course/foundations");
```

Because `AuditLesson` resumes the latest incomplete attempt, this drops the learner into a fresh audit.

### Dashboard wiring

In `src/pages/Dashboard.tsx`:
1. Extend the profile fetch to also select `recommended_course`.
2. Fetch course titles for the three slugs once (small `courses` query already feasible — or include in the existing enrollment query results / add a lightweight `useQuery`).
3. Render `<RecommendationCard ... />` immediately after `<DashboardHero />` and before `<PathwayStrip />`.

### Out of scope

- Pathway strip, portfolio grid, hero continue-card (untouched).
- Catalog page (`/courses`) — all three courses already visible and purchasable; no change.
- Editing recommendation source / re-routing logic (lives in `RouterLesson`).
- Changing `recommended_course` slug values.

### Files

- **Create** `src/components/dashboard/RecommendationCard.tsx`
- **Edit** `src/pages/Dashboard.tsx` (add profile field, course-title lookup, render card)
