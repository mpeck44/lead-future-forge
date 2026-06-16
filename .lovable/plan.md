# AI Equity Audit — Interactive Lesson in The Launchpad

Replaces the existing **"Build Your AI Equity Audit Checklist"** activity in the Foundations course (slug = `foundations`, AKA The Launchpad) with an interactive scored audit that writes to `audit_attempts` and `audit_responses`. No other Launchpad lesson changes.

## Question bank (hardcoded)
New file `src/lib/auditQuestions.ts` — 15 items, 3 per category, 4-point scale (1 = Not yet, 4 = Embedded practice).

Categories and starter items (editable):

- **fluency** — district-wide working understanding of AI
  1. Leaders can describe the difference between generative, predictive, and assistive AI.
  2. Staff can name at least three approved AI tools and what each is for.
  3. We have a shared vocabulary for talking about AI risks and benefits with families.
- **strategy** — vision, alignment, prioritization
  1. We have a written AI vision tied to our strategic plan.
  2. AI initiatives are prioritized against measurable student outcomes.
  3. Cabinet reviews AI direction at least quarterly.
- **action** — implementation discipline
  1. New AI tools follow a documented adoption process before reaching classrooms.
  2. Pilots have defined success criteria and a sunset date.
  3. We track which AI tools are actually being used and by whom.
- **governance** — policy, oversight, defensibility
  1. We have an approved AI Acceptable Use Policy covering staff and students.
  2. Data privacy review happens before any AI tool is approved.
  3. We can produce an audit trail of AI decisions for the board.
- **capacity** — people, time, support
  1. Staff have protected time to learn and practice with AI.
  2. We have at least one identified AI lead per building or department.
  3. Coaching and follow-up exist beyond one-time PD.

Each item: `{ key, category, prompt }`. The 4-point scale labels are shared across items.

## Lesson conversion (data)
Single data migration on the existing lesson row (title = `Build Your AI Equity Audit Checklist`):
- Set `lesson_type = 'audit'` (new type)
- Optionally rename title to `AI Equity Audit` (yes — matches the landing-page promise)
- Clear `template_url`, `resource_type`, `resource_name`, `download_button_text`
- Keep `is_published`, `sequence_order`, `estimated_minutes`

No schema migration needed beyond data update.

## New lesson component: `src/components/course/AuditLesson.tsx`

Props mirror existing lesson components (`lesson`, `onComplete`, etc.).

State machine:
```text
idle → in_progress (category 0..4) → review → submitted (summary view)
```

Behavior:
- On mount, fetch latest `audit_attempts` for this user. If incomplete (no `completed_at`), resume. Otherwise show summary of the latest completed attempt with "Retake audit" button (creates new attempt with `attempt_number + 1`).
- "Start audit" → `INSERT INTO audit_attempts(user_id, attempt_number)` then advance.
- One screen per category. Each item rendered as a 4-button radio row (labels: 1 Not yet · 2 Emerging · 3 Established · 4 Embedded). Saves each answer via `UPSERT INTO audit_responses` keyed by `(attempt_id, item_key)` — supports navigation back/forward without losing input.
- Progress bar uses existing `<Progress>` component: `answeredCount / 15`.
- Next/Back buttons; Next disabled until all items on the current category are answered.
- On the final category's Next, set `completed_at = now()`, call `supabase.rpc('get_audit_summary', { _attempt_id })`, mark lesson complete via existing `onComplete` flow, then render summary.

Summary view (horizontal bar chart):
- For each category: label, average score (e.g. 2.3), and a horizontal bar (width = `avg/4 * 100%`).
- Bars use `bg-foreground/15` track + `bg-primary` fill. The lowest category's bar uses `bg-[#d4af37]` (Brand Gold) and shows a `<Badge>` "Focus area".
- Below the chart: one sentence — "Your strongest fit right now is **{course title}**." with a button linking to `/course/{recommended_course}` (course title resolved from existing `courses` table query).
- "Retake audit" link (subdued).

Visual style consistency:
- Reuse `Card` / `CardHeader` / `CardContent` from existing lesson components (see `ActivityLesson.tsx` for the canonical wrapper).
- Reuse `Button`, `Progress`, `Badge`, typography classes already in the codebase.
- No new colors beyond `--primary` and the existing Brand Gold `#d4af37`.

## CourseViewer wiring
In `src/pages/CourseViewer.tsx`:
- Add `import AuditLesson from '@/components/course/AuditLesson'`.
- Add `'audit'` branch to the lesson-type switch that already handles `content/video/activity/reflection/question`. Pass the same props the others receive.
- No changes to sidebar, completion logic, or navigation.

## Recommendation write-back (this step)
On successful audit submission, also update `profiles`:
```ts
update profiles set recommended_course = <lowest>, recommendation_source = 'audit' where id = auth.uid()
```
Only overwrites when the audit completes — never on partial progress. Self-selected recommendations from elsewhere are out of scope here.

## Out of scope
- Admin UI for editing the question bank
- Any other Launchpad lessons
- Surfacing the recommendation on Dashboard / landing page (separate step)
- Email of audit results
- Comparison across multiple attempts

## Files touched
- New: `src/lib/auditQuestions.ts`, `src/components/course/AuditLesson.tsx`
- Edited: `src/pages/CourseViewer.tsx` (one switch branch + import)
- Data update via `supabase--insert`: the single lesson row
