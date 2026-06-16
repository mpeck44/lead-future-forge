## Final step: routing screen for The Launchpad

A new lesson type, `router`, slotted as the last lesson of The Launchpad (Foundations course) immediately after the audit results. It writes `profiles.recommended_course` and `profiles.recommendation_source` on selection, then shows a confirmation screen.

### What the learner sees

**Selection screen**
- Headline: "Where are you right now?"
- Subhead: "Pick the sentence that sounds like your district — or let your audit decide."
- Three situation cards (filled, equal weight):
  1. "AI is already in my buildings. Our approach is improvised." → `fluency` (Command the Tools)
  2. "My board — or my boss — is asking for a plan I don't have." → `strategy` (Chart the Course)
  3. "We wrote the plan. Nothing is moving." → `action` (Ship It)
- Fourth option, outline button, visually separated under the three cards: "Use my audit score" → reads the latest completed `audit_attempts` for the user, picks the lowest-scoring category, maps it (see Technical), and sets `recommendation_source = 'audit'`. Disabled with a hint if the audit hasn't been completed.

**Confirmation screen** (replaces the selection UI, same lesson)
- Heading is the matching result copy:
  - command_the_tools / `fluency`: "Your gap is operational. Tools are in use without evaluation criteria. Start by getting what's already happening under control."
  - chart_the_course / `strategy`: "Your gap is strategic. Activity without direction. Start by building the framework and roadmap your stakeholders are waiting for."
  - ship_it / `action`: "Your gap is execution. The thinking is done; the follow-through isn't. Start by turning your plan into assignments with names and dates."
- Single primary button: "Go to {course title}". If the user is enrolled in that course (row in `enrollments` for `user_id` + `course_id`), link to `/course/{slug}`; otherwise link to `/courses`.
- Small "Change my answer" ghost link that returns to the selection screen (does not clear the saved recommendation until a new one is chosen).

The lesson auto-marks complete the moment a selection is made (same pattern AuditLesson already uses for `onComplete`).

### Visual style
Reuses the existing lesson card pattern (`border rounded-lg bg-card p-6`), brand gold accents (`#d4af37`), Playfair headline, Inter body — matches AuditLesson's summary screen.

### Out of scope
Other Launchpad lessons, other courses, the dashboard, the landing-page routing section, adding a real purchase page, multi-attempt history. Source of truth for course slugs stays `fluency` / `strategy` / `action`.

### Technical details

**Lesson row.** Convert the existing `"Choose Your Path"` content lesson (id `5abe638f-...`, sequence_order 5 in the Foundations "Building Your Foundation" module) into the router, via a data update:
- `lesson_type = 'router'`
- `title = 'Choose Your Path'` (kept)
- `content` cleared / set to short intro markup; no template/resource fields.

No schema migration needed — `lesson_type` is free-form text, and `profiles.recommended_course` / `recommendation_source` already exist from the earlier step.

**New component:** `src/components/course/RouterLesson.tsx`
- Props mirror AuditLesson: `{ lesson, isCompleted, onComplete, isPending }`.
- Local state: `phase: 'select' | 'confirm'`, `selectedSlug: 'fluency'|'strategy'|'action'|null`, `source: 'self_selected'|'audit'`.
- On mount: read `profiles.recommended_course` + `recommendation_source` for the current user; if present, hydrate state and start on `confirm`. Also fetch the latest *completed* `audit_attempts` row id (one query, `.order('completed_at', desc).limit(1)`) to know whether the audit option is enabled.
- Card click handler: `setRecommendation(slug, 'self_selected')`.
- Audit-score handler: call `supabase.rpc('get_audit_summary', { _attempt_id })` with the latest completed attempt; pick the row where `is_lowest = true` (RPC already orders ties by category order: fluency, strategy, action, governance, capacity, which yields the required tiebreak when combined with the mapping below); map category → slug:
  - `fluency` → `fluency`
  - `strategy` or `governance` → `strategy`
  - `action` or `capacity` → `action`
  Then `setRecommendation(mappedSlug, 'audit')`.
- `setRecommendation` upserts `profiles { recommended_course, recommendation_source }` for `auth.uid()`, calls `onComplete()` once (guarded by `isCompleted`), and transitions to `confirm`.
- Confirmation screen: looks up enrollment with `supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', courseId).maybeSingle()` where `courseId` is resolved by a one-time `courses` query keyed on the three slugs (cached in a `useMemo`/`useQuery`). Button `<Link>` to `/course/{slug}` when enrolled, otherwise `/courses`.

**CourseViewer wiring:** `src/pages/CourseViewer.tsx`
- Add `import RouterLesson from '@/components/course/RouterLesson'`.
- Add a `case 'router':` branch in `renderLessonContent()` returning `<RouterLesson ... />` with the same prop shape used by AuditLesson.
- Extend the existing exclusion on line 915 so the manual "Mark as Complete" button does not render for `'router'` either (component handles completion itself).
- No changes to icons/labels are required; the default content icon is acceptable for this step.

**Files**
- New: `src/components/course/RouterLesson.tsx`
- Edited: `src/pages/CourseViewer.tsx`
- Data update (via supabase--insert) on `public.lessons` row `5abe638f-c7e5-4a34-a330-fa38fc1c0c90`.
