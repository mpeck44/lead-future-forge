# Auto-format lesson content on import

Right now the bulk importer stores whatever you paste into `content:` as plain text with line breaks. The lesson viewer renders that as HTML, so paragraphs collapse, lists stay as `- foo`, and headings have no visual weight — which is why you re-format every lesson by hand in the rich text editor.

Two complementary fixes, both opt-in per import:

## 1. Markdown → HTML in the parser (default ON)

Update `src/lib/parseCourseContent.ts` so any multi-line `content:` / `objective:` / `description:` / `transcript:` block is run through a lightweight Markdown-to-HTML conversion before it lands in the DB. This is deterministic, free, and handles the 90% case.

Supported syntax (standard Markdown subset):

- `# H1`, `## H2`, `### H3` → `<h2>` / `<h3>` / `<h4>` (we skip `<h1>` because the lesson title is already H1 on the page)
- Blank line between blocks → new `<p>`
- `- item` or `* item` → `<ul><li>`
- `1. item` → `<ol><li>`
- `**bold**` → `<strong>`, `*italic*` / `_italic_` → `<em>`
- `[label](url)` → `<a href>` (with `target="_blank" rel="noopener"`)
- `> quote` → `<blockquote>`
- Triple-newline / `---` → `<hr>`
- Raw `<iframe>` / existing HTML passes through untouched (so your YouTube embeds still work)

Implementation: add a small `markdownToHtml()` helper in `src/lib/markdown.ts`. We'll use the existing `marked` library if it's already installed, otherwise add it (tiny, ~30kb) — it handles all of the above correctly and we already run output through `sanitizeHtml()` in the viewer, so XSS is covered. Same sanitizer runs on import so DB content stays clean.

Result: paste plain Markdown into the import file and lessons render with real headings, bullets, and paragraphs — no manual editor work.

## 2. Optional "AI cleanup" toggle in the import dialog

For content you pasted from PDFs, slide notes, or unstructured prose (no Markdown), add a checkbox in `BulkImportDialog`:

> ☐ **Auto-format lesson content with AI** (slower, ~5–10s per lesson)

When checked, each lesson's `content` is sent to a new edge function `format-lesson-content` that calls Lovable AI (`google/gemini-3.5-flash` — cheap, fast, good at structure) with a strict system prompt:

> You are formatting a single course lesson for K-12 leaders. Convert the input into clean semantic HTML using only `<h2>`, `<h3>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<em>`, `<a>`, `<blockquote>`. Do not invent content, do not summarize, do not add intros or outros. Preserve every fact. Break long paragraphs, group related points into lists, promote natural subsection titles to `<h2>`. Return only the HTML, no code fences.

Calls run in parallel batches of 5 with progress shown in the existing "Importing..." UI. If a call fails, we fall back to the Markdown-converted version so import never blocks.

## Import dialog changes

`src/components/admin/BulkImportDialog.tsx`:
- Add two checkboxes above the format reference:
  - ☑ **Convert Markdown to formatted HTML** (default ON)
  - ☐ **Use AI to format unstructured content** (default OFF, shows cost/time hint)
- Preview step shows a "✨ Formatted" badge on lessons whose content was transformed, with a peek at the rendered HTML
- Format reference example updated to show Markdown usage in `content:` blocks

## Files

- new: `src/lib/markdown.ts` — `markdownToHtml(text)` + tests
- edit: `src/lib/parseCourseContent.ts` — apply markdown conversion to continuation fields when the new flag is set
- edit: `src/components/admin/BulkImportDialog.tsx` — checkboxes, AI formatting pass, preview badges
- new: `supabase/functions/format-lesson-content/index.ts` — Lovable AI call, auth-required, admin-only
- edit: `supabase/config.toml` — register the new function
- new: `src/lib/markdown.test.ts` — verify headings, lists, links, sanitization

## Out of scope

- Re-formatting lessons that are already in the database (this only affects new imports). Happy to add a "Reformat existing lesson" button in the lesson editor in a follow-up.
- Changing the rich text editor itself.
- Image extraction / table parsing.

## Recommendation

Start with **just #1 (Markdown)** — it removes 80% of the manual work and ships in one round of edits. Add #2 later if you find yourself importing a lot of unstructured prose where Markdown isn't practical to add by hand. Want me to do both, or just the Markdown layer first?
