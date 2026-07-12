## Courses page reorg

Two frontend-only changes to `src/pages/Courses.tsx`. No backend, no schema.

### 1. Remove the internal path badges
- Delete the `Badge` that renders `course.path_type` ("Accelerator Path", "1", "2", "3") from the course card header.
- Keep the "Requires Foundations" badge — that one is meaningful to users.
- Leave `path_type` in the query/select for now (used elsewhere and for sort logic below); just stop rendering it.

### 2. Reorder cards: Foundations on top, then a row of three

Layout when no search query is active:

```text
[ Complete Path — $197 bundle banner ]           (unchanged)

[ ───────── Foundations (full-width card) ─────────── ]

[ Fluency ]   [ Strategy ]   [ Action ]
```

Details:
- Classify each course by slug (canonical) with a fallback to `audit_category` / `path_type`:
  - Foundations → slug contains `foundations`
  - Fluency → `audit_category === 'fluency'` or slug contains `fluency`
  - Strategy → `audit_category === 'strategy'` or slug contains `strategy`
  - Action → `audit_category === 'action'` or slug contains `action`
  - Anything else → "Other" bucket, rendered in a normal 3-col grid below the pathway trio (safety net for future courses).
- Render Foundations as a single full-width card (`md:col-span-3` inside the same grid, or a standalone card above the trio). Use the existing `Card` component and copy — just widen it and keep the same enroll / view-details actions.
- Render Fluency, Strategy, Action in that fixed order in a `grid-cols-1 md:grid-cols-3` row underneath. Missing entries collapse gracefully (e.g. if Strategy isn't published yet, the row shows two cards).
- When the user types a search query, fall back to the current flat filtered grid — pathway structure only shows for the unfiltered catalog view.
- Course count label ("N courses available") stays as-is.

### Out of scope
- No connector lines / tree SVG (rejected option).
- No changes to individual course pages, bundle page, or the CTA section.
- No DB migration; `path_type` column stays.

### Files touched
- `src/pages/Courses.tsx` — remove badge, add classification + new render structure for the unfiltered view.
