

## Fix Experience Blocks: Placement and Matching

### Problem
1. The lesson titled "Why AI Literacy Matters?" partially matches **two** keys in the experience blocks data file: `"Why AI Literacy"` and `"Why AI"`, causing two blocks to appear.
2. Experience blocks render **above** the lesson content. They should appear **after** the content, like tips/tricks.

### What changes

**File: `src/data/experienceBlocks.ts`**
- Make the `"Why AI"` key more specific (e.g., `"Why AI?"` or `"Why AI Statement"`) so it only matches the intended lesson, not "Why AI Literacy."
- This is where all experience blocks are defined — you can review, edit, add, or remove any block here. Each entry maps a partial lesson title to the block content.

**File: `src/components/course/ContentLesson.tsx`**
- Move the experience blocks section (currently lines 49-60) to **after** the main content section (after line 80) and **before** the Key Takeaways section (line 83). This positions Mike's insights as a post-content supplement.

### Admin visibility
Currently there's no admin UI to see/manage experience blocks — they're hardcoded in a data file. A follow-up option would be to surface these in the admin course content editor if you'd like more control.

