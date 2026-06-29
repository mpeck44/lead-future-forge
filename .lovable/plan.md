# Replace course tags with structured fields

## Why

The new journey is deterministic: everyone takes **Foundations** first, the **audit** identifies the lowest of five categories, and that points to the next course. Free-form `tags` (e.g. "Beginner", "AI Literacy", "ISTE Aligned") fight that model — they imply browsing/filtering that no longer exists, and they hide the real routing signal (audit category) in unstructured strings. Tags are also currently empty on every course, so this is a low-risk moment to fix it.

Three typed fields replace tags entirely:

1. **`audit_category`** — the single audit gap this course closes (`fluency` | `strategy` | `action` | `governance` | `capacity`). Becomes the bridge between audit results and the catalog.
2. **`role_fit[]`** — which K-12 roles the course is built for (superintendent, principal, director_of_tech, teacher_leader, etc.). The one dimension the pathway can't encode; profile already knows the user's role.
3. **`requires_foundations`** — boolean gate that replaces the implicit "Beginner" tag with a real prerequisite. Foundations itself is `false`; everything else defaults `true`.

## What changes

### Database (one migration)

- Add `app_audit_category` enum (`fluency`, `strategy`, `action`, `governance`, `capacity`).
- Add to `public.courses`:
  - `audit_category app_audit_category` (nullable — Foundations has none)
  - `role_fit text[] NOT NULL DEFAULT '{}'`
  - `requires_foundations boolean NOT NULL DEFAULT true`
- Drop `tags text[]` from `public.courses` (currently empty on all 4 rows, so no data loss).
- Backfill the four existing courses:
  - `foundations` → category `NULL`, `requires_foundations=false`
  - `fluency` → category `fluency`
  - `strategy` → category `strategy`
  - `action` → category `action`
- Rewrite `public.get_audit_summary` so `recommended_course` is selected from `courses` by `audit_category = ranked.category` (preferring `is_published=true`, tiebreak by `created_at`) instead of the hardcoded `CASE` mapping. Governance still falls through to the strategy course and capacity to the action course **until** dedicated courses exist with those categories — implemented as a `COALESCE` chain in SQL, not hardcoded slugs.

### Code

- **`src/components/admin/CourseFormDialog.tsx`** — remove the `tags` field + `TagInput`. Add:
  - `audit_category` Select (5 enum options + "None — foundational course")
  - `role_fit` multi-select (checkbox group using the same K-12 roles already defined for profiles)
  - `requires_foundations` Switch (defaults on; auto-off only when `audit_category` is null, with a helper line explaining the link)
  - Zod schema updated; `path_type` options unchanged.
- **`src/components/admin/TagInput.tsx`** — delete (no other callers; verified by codebase search).
- **`src/lib/auditQuestions.ts`** — no change; the category enum already matches.
- **Audit result page** (wherever `get_audit_summary` is consumed) — no API change, the function still returns `recommended_course`. Verify it still renders.
- **`src/pages/Courses.tsx` / catalog cards** — if any chip currently renders `course.tags`, swap to a small "For: Superintendents, Principals" line from `role_fit` and a "Prerequisite: Foundations" pill when `requires_foundations` is true. (Will confirm exact spots during build.)

### Out of scope

- No UI for users to filter by category/role — the journey is deterministic, not browse-driven.
- No changes to `path_type`, pricing, modules, lessons, enrollments, or RLS.
- No new tokens, fonts, or visual redesign.
- No migration of historical tag values (none exist).

## Technical notes

- Enum vs text: an enum gives the admin form a closed set, prevents typos in the routing query, and matches the existing `audit_responses.category` CHECK constraint values exactly.
- `role_fit` stays `text[]` rather than an enum so adding a new role later doesn't require a migration; values are validated client-side against the same role list used in `profiles`.
- The rewritten `get_audit_summary` keeps its `SECURITY DEFINER` and `auth.uid()` ownership check unchanged.
- After the migration runs, `src/integrations/supabase/types.ts` regenerates automatically; the form and any tag readers must be updated in the same build step to keep the app compiling.
