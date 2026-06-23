# Routing Analytics

Lightweight, write-only telemetry to settle the routing architecture question during beta. No UI changes. You'll inspect `routing_events` directly in the backend.

## 1. New table: `public.routing_events`

Columns:
- `id uuid pk default gen_random_uuid()`
- `user_id uuid not null` (references the authenticated user)
- `event_type text not null` — one of `door_selected`, `course_purchased`, `course_completed`, `ladder_followed`, `ladder_skipped` (CHECK constraint)
- `course_key text` — slug like `fluency`/`strategy`/`action` (nullable so we don't lose events if a slug is missing)
- `source text` — only set for `door_selected`: `self_selected` or `audit`
- `created_at timestamptz not null default now()`

Index: `(user_id, created_at desc)` for quick per-user review.

RLS:
- `insert`: authenticated users can insert rows where `user_id = auth.uid()`.
- `select`: authenticated users can read their own rows; service_role full access (so you can query everything in the backend).
- No anon access. No update/delete policies.

Grants: `INSERT, SELECT` to `authenticated`; `ALL` to `service_role`.

## 2. Logging points (no UI changes)

A small helper `src/lib/analytics/logRoutingEvent.ts` will wrap the insert and swallow errors silently so analytics never breaks a flow. All call sites use it fire-and-forget.

| Event | Where | Trigger |
| --- | --- | --- |
| `door_selected` | `src/components/course/RouterLesson.tsx` → `persistRecommendation` | After the profile update succeeds. `course_key` = chosen slug, `source` = `self_selected` or `audit`. |
| `course_purchased` | `src/pages/Courses.tsx` → `handleEnroll` | After the `enrollments` insert succeeds (not on the duplicate-enrollment branch). `course_key` = the course slug looked up from the `courses` list already in state. |
| `course_completed` | `src/pages/CourseViewer.tsx` → `markCompleteMutation.onSuccess` (and the two auto-complete branches in the reflection/question mutations) | After invalidating progress, recompute completion: if `completedLessons.size + 1 === allLessons.length` (i.e. this completion finishes the course), log once with `course_key` = current course slug. Guarded so it only fires on the transition, not on every later view. |
| `ladder_followed` / `ladder_skipped` | `src/pages/Courses.tsx` → `handleEnroll`, right after `course_purchased` | Read `profiles.recommended_course` for the current user. If it equals the slug just enrolled → `ladder_followed`; otherwise → `ladder_skipped`. `course_key` = the slug just enrolled. Only logged when `recommended_course` is non-null (otherwise there is no ladder to compare against). |

Notes:
- `course_purchased` is logged on every successful enrollment insert. Courses are currently free, so this captures "started owning the course" — matching the spec's intent.
- The ladder events are derived from the recommendation stored on the profile at enrollment time; no extra state needed.
- No retries, no toasts, no user-visible behavior. Errors are logged to `console.warn` in dev only.

## 3. Out of scope

- No dashboard, no admin views, no charts.
- No backfill of historical enrollments/completions.
- No changes to existing flows beyond the logging calls.
- No changes to other courses or the landing page.

## Technical details

- Migration creates the table, CHECK constraint on `event_type`, the index, GRANTs, RLS, and three policies (insert-own, select-own, service_role all).
- Helper signature:
  ```ts
  logRoutingEvent({
    eventType: 'door_selected' | 'course_purchased' | 'course_completed' | 'ladder_followed' | 'ladder_skipped',
    courseKey?: string | null,
    source?: 'self_selected' | 'audit' | null,
  }): Promise<void>
  ```
  Internally reads `supabase.auth.getUser()` and inserts; returns void; never throws.
- `course_completed` guard uses the lesson list and completed set already in `CourseViewer` state to detect the "this completion was the last one" transition before the query invalidation refetches.
