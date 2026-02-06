

## Fix: Multi-Line Content Support in Bulk Import Parser

### The Problem
The parser treats each line independently and only recognizes `key: value` pairs. But real course content has:
- Multi-paragraph text (continuing after the `content:` line)
- Category headings like `CATEGORY 1: Narrow AI - The Automation Tools...`
- Bullet lists like `- Spam filters in school email`
- Instructional prompts like `[Your turn: List 1-2 tools...]`

All of these are part of the lesson content, but the parser flags them as errors because they don't match the `key: value` format.

### The Solution
Make the parser "multi-line aware" so that after a text field is set (like `content:`), all subsequent lines are appended to that field until the parser hits a new recognized marker (module, lesson, or another known field).

### How It Will Work

1. **Track a "continuation field"** -- When `content:`, `transcript:`, or `objective:` is set, the parser remembers which field is "active"
2. **Unrecognized lines become continuation text** -- Instead of warning, they get appended to the active field with a newline separator
3. **Blank lines preserve paragraph breaks** -- A blank line inside content adds `\n\n` to maintain paragraph structure
4. **Known fields reset continuation** -- When the parser hits a new `key: value` pair (like `takeaways:` or `estimated_minutes:`), a new lesson marker, or a new module marker, it stops appending
5. **Only match known field keys** -- Add a whitelist check so that lines like `CATEGORY 1: Narrow AI...` don't accidentally match as a field (even though they contain a colon)

### Example of How Your File Will Parse

Before (current behavior):
```
content: A superintendent once asked me...
                                              --> sets content (1 line only)
CATEGORY 1: Narrow AI...                      --> WARNING: Could not parse
- Spam filters in school email                --> WARNING: Could not parse  
- Adaptive learning platforms (Lexia, IXL)    --> WARNING: Could not parse
```

After (new behavior):
```
content: A superintendent once asked me...
                                              --> sets content AND starts continuation
CATEGORY 1: Narrow AI...                      --> appended to content
- Spam filters in school email                --> appended to content
- Adaptive learning platforms (Lexia, IXL)    --> appended to content
takeaways: AI is a tool | Start small         --> STOPS continuation, sets takeaways field
```

The result: `content` will contain the full multi-paragraph text with line breaks preserved, exactly as you wrote it.

### Technical Details

**File: `src/lib/parseCourseContent.ts`**

Changes:
- Add a `KNOWN_LESSON_FIELDS` set containing all recognized field keys (type, objective, estimated_minutes, content, takeaways, video_url, etc.)
- Add a `KNOWN_MODULE_FIELDS` set (description, deliverable, path_type)
- Change the field-matching logic: after matching `FIELD_REGEX`, also verify the key is in the known fields set. If not, treat it as continuation text
- Add a `continuationField` variable that tracks which field is currently "active" for multi-line appending (set when `content`, `transcript`, or `objective` fields are assigned)
- When a line doesn't match any pattern, instead of warning, append it to the active continuation field
- When a blank line is encountered inside a lesson (with an active continuation field), append `\n\n` to preserve paragraph breaks
- Reset `continuationField` when a new field, lesson, or module marker is hit

**File: `src/lib/parseCourseContent.test.ts`**

Add new tests:
- Multi-line content: verify paragraphs after `content:` are joined into one field
- Bullet lists: verify lines starting with `-` are included in content
- Content with colons: verify lines like `CATEGORY 1: text` don't break the parser
- Blank lines between paragraphs: verify `\n\n` separators are preserved
- Continuation stops at next field: verify `takeaways:` after content paragraphs correctly starts a new field

### Files to Change

| File | Change |
|------|--------|
| `src/lib/parseCourseContent.ts` | Add multi-line continuation logic, known-field whitelisting |
| `src/lib/parseCourseContent.test.ts` | Add tests for multi-line content, bullet lists, paragraph breaks |

No other files need to change -- the `BulkImportDialog` and database insertion logic remain the same since they already handle the `content` field as a string.
