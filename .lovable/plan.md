

## Bulk Course Content Upload

This feature lets you upload a structured text file (or paste text) to create multiple modules and lessons at once, instead of adding them one-by-one through the form dialogs.

### How It Will Work

1. **A new "Import Content" button** appears next to the existing "Add Module" button on the course content editor page
2. Clicking it opens a dialog where you can either **upload a text file** or **paste content directly**
3. The system parses your text into modules and lessons, then shows you a **preview of what will be created** so you can review before committing
4. You confirm, and all modules/lessons are inserted into the database in one batch

### Text File Format

You'll use a simple, readable format with clear section markers. Here's an example:

```text
=== MODULE: Understanding AI in Education ===
description: A foundational module on AI concepts for K-12 leaders
deliverable: AI Landscape Summary
path_type: foundation

--- LESSON: What is AI? ---
type: content
objective: Understand the basic concepts of artificial intelligence
estimated_minutes: 15
content: Artificial intelligence refers to computer systems that can perform tasks...
takeaways: AI is a tool, not a replacement | Focus on practical applications | Start small
resource_url: https://docs.google.com/document/d/example

--- LESSON: Watch: AI in Schools Today ---
type: video
estimated_minutes: 10
video_url: https://youtube.com/watch?v=example
takeaways: Districts are already using AI | Policy comes first

--- LESSON: Reflect on Your District ---
type: reflection
estimated_minutes: 5
content: Think about where AI could have the biggest impact in your district...

=== MODULE: Building Your AI Vision ===
description: Create your personal AI leadership vision statement
deliverable: AI Vision Statement
path_type: path_1

--- LESSON: Crafting Your Vision ---
type: activity
objective: Draft a personal AI vision statement
estimated_minutes: 20
content: Use the template below to craft your vision statement...
resource_url: https://docs.google.com/document/d/vision-template
resource_name: AI Vision Template
```

**Key rules:**
- Modules start with `=== MODULE: Title ===`
- Lessons start with `--- LESSON: Title ---`
- Fields are `key: value` on each line
- Takeaways are separated by `|` (pipe character)
- Lessons are added to whichever module they appear under
- All imported lessons start as **drafts** (unpublished) so you can review them

### What You'll See

1. **Import Dialog** -- Upload file or paste text, with a format reference guide
2. **Preview Step** -- See all parsed modules and lessons in a table before confirming
3. **Validation** -- Warnings for any lines that couldn't be parsed (e.g., unknown field names)
4. **Progress** -- A progress indicator during the import, with a success summary at the end

### Technical Details

**New files to create:**
| File | Purpose |
|------|---------|
| `src/components/admin/BulkImportDialog.tsx` | Main dialog with file upload, text paste, preview, and import logic |
| `src/lib/parseCourseContent.ts` | Pure function that parses the text format into structured module/lesson objects |
| `src/lib/parseCourseContent.test.ts` | Unit tests for the parser to ensure reliable parsing |

**Files to modify:**
| File | Change |
|------|--------|
| `src/pages/admin/AdminCourseContent.tsx` | Add "Import Content" button and wire up the `BulkImportDialog` |

**Parser logic (`parseCourseContent.ts`):**
- Splits text by module markers (`=== MODULE: ... ===`)
- Within each module, splits by lesson markers (`--- LESSON: ... ---`)
- Extracts key-value pairs from each section
- Maps `type` values to valid lesson types (content, video, activity, reflection, question, quiz)
- Splits `takeaways` by `|` into an array
- Returns a structured array of modules with nested lessons, plus any parsing warnings

**Import flow (`BulkImportDialog.tsx`):**
- Step 1: Input (file upload or paste) with a collapsible format reference
- Step 2: Preview parsed results in a clean table (module titles, lesson count, types, any warnings)
- Step 3: Confirm and insert -- creates modules first (to get IDs), then inserts all lessons with correct `module_id` references and auto-incremented `sequence_order`
- All lessons default to `is_published: false` (draft) so you can review each one
- Existing modules are preserved; new ones are appended after the last existing module

**Database interaction:**
- Uses the existing `supabase` client -- no schema changes needed
- Modules are inserted sequentially (each needs an ID before its lessons can reference it)
- Lessons within each module are batch-inserted with incrementing `sequence_order`
- On completion, the query cache is invalidated to refresh the page

