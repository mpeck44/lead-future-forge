## Fix Rich Text Bullet/Numbered Lists

### What’s going wrong
The list buttons are likely inserting list HTML correctly, but the bullets/numbers aren’t visibly rendering because the app relies on Tailwind `prose` classes without enabling the typography plugin styles. In practice, that makes `<ul>` / `<ol>` content look like plain text.

### Plan

**1. Enable Tailwind typography styles**
Update `tailwind.config.ts` to register `@tailwindcss/typography`, since the package is already installed.

**2. Add explicit list styling for editor + rendered lesson content**
Harden the UI so lists remain visible even if typography styles are limited:
- In `src/components/admin/RichTextEditor.tsx`, add scoped classes for `ul`, `ol`, and `li` spacing/markers on the editable area.
- In lesson render surfaces (`LessonPreviewDialog` and course lesson content wrappers), add scoped list marker classes so saved bullet/numbered lists render consistently.

**3. Keep the current command behavior, but verify the visual result**
No major logic rewrite unless needed. The current toolbar focus-preservation fix should stay; this pass is about making inserted lists visibly render in admin preview and learner-facing content.

### Files to update
- `tailwind.config.ts`
- `src/components/admin/RichTextEditor.tsx`
- `src/components/admin/LessonPreviewDialog.tsx`
- `src/components/course/ContentLesson.tsx`
- `src/components/course/ActivityLesson.tsx`
- `src/components/course/ReflectionLesson.tsx`
- `src/components/course/QuestionLesson.tsx`

### Expected outcome
- Bullet list button shows real bullets in the editor
- Numbered list button shows numbering
- Saved lists render correctly in preview dialogs and in course lessons
- Existing bold/italic/link behavior remains unchanged

### Technical notes
- Prefer scoped utility selectors like:
  - `[&_ul]:list-disc`
  - `[&_ol]:list-decimal`
  - `[&_ul]:pl-6`
  - `[&_ol]:pl-6`
  - `[&_li]:my-1`
- This avoids depending on browser defaults alone and keeps the result stable across admin/editor/course contexts.