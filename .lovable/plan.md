

## Flexible Course Tagging System

### Current State

Right now, the only categorization for courses is a single `path_type` dropdown with 5 hardcoded options (Leadership Path 1/2/3, Standalone, Bundle). Modules have a similar fixed `path_type` field. There's no way to add additional labels like "AI Literacy", "Beginner", "ISTE Aligned", etc.

### What This Adds

A flexible tagging system that lets you create and assign any number of custom tags to courses. Tags appear as color-coded badges throughout the admin and public-facing pages.

**Examples of tags you might create:**
- Topic tags: "AI Literacy", "Data Privacy", "Strategic Planning"
- Audience tags: "Beginner", "Advanced", "Cabinet-Level"
- Alignment tags: "ISTE Aligned", "COSN Framework"
- Status tags: "New", "Updated", "Popular"

---

### How It Works

**In the Admin Course Form:**
- A new "Tags" field appears below the existing Path Type dropdown
- Type a tag name and press Enter (or comma) to add it
- Tags appear as removable pills/chips in the input
- As you type, existing tags from other courses are suggested in a dropdown (autocomplete) so you stay consistent
- Tags are freeform -- you can type anything, no predefined list required

**In the Admin Courses Table:**
- Tags display as small badges next to the course title
- A new "Tag" filter dropdown lets you filter courses by any tag

**On the Public Courses Page:**
- Tags appear as small badges on each course card
- Visitors can see at a glance what each course covers

**On the Landing Page (Featured Courses):**
- Tags show as subtle badges in the course card meta bar area, alongside the existing time/audience pills

---

### Technical Approach

**Database: Add a `tags` column to the `courses` table**

A `text[]` (text array) column on the courses table. This matches the pattern already used elsewhere in the project (e.g., `interested_courses` on `waitlist_leads`, `key_takeaways` on `lessons`). No extra tables or joins needed.

```text
ALTER TABLE courses ADD COLUMN tags text[] DEFAULT '{}';
```

This is the simplest approach for the current scale. Each course stores its own array of tag strings. To get all unique tags across courses (for autocomplete and filtering), we query distinct values from the array.

**Files to create:**

| File | Purpose |
|------|---------|
| `src/components/admin/TagInput.tsx` | Reusable tag input component with autocomplete, chip display, and keyboard support (Enter/comma to add, Backspace to remove) |

**Files to modify:**

| File | Change |
|------|---------|
| `src/components/admin/CourseFormDialog.tsx` | Add `tags` field to the form schema and render the TagInput component below Path Type |
| `src/pages/admin/AdminCourses.tsx` | Display tags as badges in the table, add a tag filter dropdown, pass tags through create/update mutations |
| `src/pages/Courses.tsx` | Show tags as badges on public course cards |
| `src/components/FeaturedCourse.tsx` | Show tags in the featured course cards on the landing page, fetch tags in the query |

**TagInput component behavior:**
- Text input with inline chip display
- Typing and pressing Enter or comma creates a new tag (auto-trimmed, lowercased for consistency)
- Backspace on empty input removes the last tag
- Dropdown shows existing tags from other courses (fetched via a query that extracts unique values from all courses' `tags` arrays)
- Clicking a suggestion adds it
- Each chip has an X button to remove
- Duplicate prevention (case-insensitive)

**Tag display styling:**
- Admin table: small outline badges, max 3 visible with "+N more" overflow
- Public pages: subtle colored badges matching the existing design system

**No changes to RLS policies needed** -- the existing course policies already cover this column since it's on the same table.

