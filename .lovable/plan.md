## Add image support to the lesson content editor

Yes — this is very doable. Here's the plan.

### What you'll get

In the RichTextEditor toolbar (used everywhere lesson content is edited), a new **Image** button next to the YouTube button. Clicking it opens a file picker. You select an image from your computer, it uploads to storage, and gets inserted at the cursor as a properly sized, responsive image. You can also **paste** images directly from the clipboard (e.g. screenshots, copied images from Google Docs).

Images render in the lesson viewer (ContentLesson, ActivityLesson, etc.) automatically since they use the same sanitized HTML pipeline.

### Implementation

**1. Storage bucket**
- New public storage bucket `lesson-images` via migration
- RLS: admins can upload/delete; anyone can read (images are embedded in public-facing lessons)
- 5 MB per-file limit, restricted to image MIME types

**2. `src/components/admin/RichTextEditor.tsx`**
- Add `Image` toolbar button (lucide `ImageIcon`)
- New `handleImageUpload(file)`: validates type/size, uploads to `lesson-images/{uuid}.{ext}` via Supabase client, inserts `<img src="..." alt="" class="rounded-lg my-4 max-w-full h-auto" />` at the cursor
- Click handler opens a hidden `<input type="file" accept="image/*">`
- Extend `handlePaste` to detect image items in `clipboardData.files` and route them through the same upload flow
- Loading state on the toolbar button while uploading; toast on error

**3. `src/lib/cleanPastedHtml.ts`**
- Currently strips all `<img>` tags (because Google Docs pastes blob URLs that expire). Update to **keep** `<img>` tags whose `src` starts with `http://` or `https://` (real hosted images), and continue stripping `blob:` and `data:` URLs. This way an image already hosted on the web survives a paste.

**4. `src/lib/sanitize.ts`**
- Already allows `<img>` via DOMPurify defaults — verify `src`, `alt`, `width`, `height`, `class` attributes pass through. Add `loading="lazy"` via the existing pipeline if needed.

**5. Lesson viewers**
- No changes needed — `ContentLesson`, `ActivityLesson`, etc. already render sanitized HTML inside `prose` containers. Tailwind Typography styles images automatically. We just want to confirm `max-w-full h-auto` classes are preserved.

### Out of scope (can add later if useful)

- Image resizing handles / alignment controls (left/right/center). For now images are full-width responsive — clean and consistent.
- Captions
- Drag-and-drop file upload onto the editor (paste covers most use cases)
- Image library / reuse picker
- Bulk import dialog image support (would need Markdown `![alt](url)` syntax — easy follow-up if you want it)

### Approval needed

This requires a database migration to create the `lesson-images` storage bucket. Approve the plan and I'll create the migration, then wire up the editor.
