# Paste rich content from Google Docs into the lesson editor

Right now, when you paste from Google Docs into the **Content** rich text editor on a lesson, all formatting is stripped — headings become regular text, bullets become lines, bold disappears. That's because `RichTextEditor.handlePaste` deliberately grabs only `text/plain` from the clipboard and reinserts it as plain text.

Google Docs (and Word, Notion, Pages, web pages) actually put a full HTML version of the selection on the clipboard under the `text/html` MIME type. We just need to read it, clean it up, and insert it.

## What changes

### 1. New paste pipeline in `RichTextEditor`

Replace the current plain-text paste with a smarter handler:

1. Read `text/html` from the clipboard. If absent, fall back to `text/plain` (current behavior).
2. Run the HTML through a new `cleanPastedHtml()` function (see below) that strips Google Docs cruft and normalizes it to the small set of tags we already render in lessons.
3. Run it through the existing `sanitizeHtml()` from `src/lib/sanitize.ts` (XSS safety, YouTube embed allow-list).
4. Insert via `document.execCommand("insertHTML", false, cleaned)` so it merges into the current selection.
5. Fire the existing `onChange` so the form state updates.

### 2. New helper: `src/lib/cleanPastedHtml.ts`

Google Docs paste HTML is famously noisy — wrapping `<b>` tags, inline `style="font-weight:700"` instead of real `<strong>`, `<span>` soup, MS Office conditional comments, image-less `<img>` tags pointing at `googleusercontent.com`, etc. This helper normalizes it:

- Parse the HTML in a detached `DOMParser` document (no script execution).
- **Unwrap Google's container**: Docs wraps everything in `<b style="font-weight:normal" id="docs-internal-guid-…">`. Replace that node with its children.
- **Strip junk tags**: remove `<meta>`, `<style>`, `<script>`, `<o:p>`, MS Office `<!--[if …]-->` comments, and empty `<span>`s.
- **Convert inline styles to semantic tags**:
  - `style="font-weight:700|bold"` → wrap contents in `<strong>`
  - `style="font-style:italic"` → `<em>`
  - `style="text-decoration:underline"` → `<u>`
  - `style="text-decoration:line-through"` → `<s>`
- **Headings**: Google Docs uses real `<h1>`–`<h6>`. Down-shift by one (`h1`→`h2`, …, `h5`→`h6`, `h6`→`<p><strong>`) to match our existing convention (lesson title is the page H1) — same rule already used by `markdownToHtml()` in `src/lib/markdown.ts`.
- **Lists**: keep `<ul>`/`<ol>`/`<li>` as-is. Strip list-style inline CSS so our editor's `prose` classes take over.
- **Links**: keep `href`. If it's an http(s) link, add `target="_blank" rel="noopener noreferrer"`. Strip Google's redirect wrappers (`https://www.google.com/url?q=REAL_URL&sa=…`) and use the unwrapped `REAL_URL`.
- **Images**: drop them. Google Docs pasted images are blob URLs that die when the clipboard is released, and we don't have storage hooked into this editor yet. Add a small toast: "Images aren't supported when pasting from Google Docs — upload them with the image tool." (Skip the toast for now if it adds friction; happy to add in a follow-up.)
- **Strip all remaining `style`, `class`, `id`, `dir`, `lang` attributes** on every element.
- **Collapse empty paragraphs** that Google inserts between blocks.

Return the cleaned `innerHTML` string.

### 3. Shift+paste escape hatch

If the user holds **Shift** while pasting, skip the HTML path entirely and insert plain text (current behavior). Matches how Google Docs / Notion / VS Code work. Implemented by checking `e.nativeEvent.shiftKey` in `handlePaste`.

### 4. Tests

New `src/lib/cleanPastedHtml.test.ts` covering:

- Real Google Docs paste fixture (`<b id="docs-internal-guid-…">…</b>` wrapper) is unwrapped
- `style="font-weight:700"` becomes `<strong>`
- `<h1>` becomes `<h3>` (because we additionally down-shift, matching markdown.ts)
- Bulleted and numbered lists survive intact
- Google redirect URLs are unwrapped
- `<script>` and inline `onclick` are removed
- Empty `<span>` and `<meta>` tags are stripped
- Plain-text paste path (no `text/html`) still works

## Files

- **edit** `src/components/admin/RichTextEditor.tsx` — rewrite `handlePaste`
- **new** `src/lib/cleanPastedHtml.ts` — DOM-based normalizer
- **new** `src/lib/cleanPastedHtml.test.ts`

## Out of scope

- Image paste from Google Docs (blob URLs expire; would need storage upload — separate feature).
- Pasting Google Docs tables. They paste as `<table>` HTML; we'd render them but the lesson viewer's `prose` styles don't currently format tables. Can add table styling later if you need it.
- Changing the bulk import flow — this is only about the in-editor paste experience.

## Why this works

The lesson viewer already renders the full set of tags this produces (`h2`–`h4`, `p`, `ul`/`ol`/`li`, `strong`, `em`, `u`, `s`, `a`, `blockquote`), the same `sanitizeHtml()` already protects against XSS, and `contenteditable` + `execCommand("insertHTML")` is the standard mechanism every rich text editor uses for paste. No new dependencies.
