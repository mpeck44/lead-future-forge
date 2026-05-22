// Parser for bulk course content import
// Format:
//   === MODULE: Title ===
//   description: ...
//   deliverable: ...
//   path_type: foundation | path_1 | path_2 | path_3
//
//   --- LESSON: Title ---
//   type: content | video | activity | reflection | question | quiz
//   objective: ...
//   estimated_minutes: 15
//   content: ...  (multi-line supported, all following lines append until next field/marker)
//   takeaways: item1 | item2 | item3
//   video_url: https://...
//   resource_url: https://...
//   resource_name: Template Name
//   resource_type: google_doc | pdf | guide | link
//   download_button_text: Download Template
//   transcript: ...

export interface ParsedLesson {
  title: string;
  lesson_type: string;
  content?: string;
  learning_objective?: string;
  estimated_minutes?: number;
  key_takeaways?: string[];
  video_url?: string;
  template_url?: string;
  resource_name?: string;
  resource_type?: string;
  download_button_text?: string;
  video_transcript?: string;
}

export interface ParsedModule {
  title: string;
  description?: string;
  deliverable_name?: string;
  path_type?: string;
  lessons: ParsedLesson[];
}

export interface ParseWarning {
  line: number;
  message: string;
}

export interface ParseResult {
  modules: ParsedModule[];
  warnings: ParseWarning[];
}

const VALID_LESSON_TYPES = ["content", "video", "activity", "reflection", "question", "quiz"];
const VALID_PATH_TYPES = ["foundation", "path_1", "path_2", "path_3"];
const VALID_RESOURCE_TYPES = ["google_doc", "pdf", "guide", "link"];

// Known field keys: only these are treated as field markers.
// Lines with colons that don't match these are treated as continuation text.
const KNOWN_MODULE_FIELDS = new Set([
  "description",
  "deliverable",
  "deliverable_name",
  "path_type",
]);

const KNOWN_LESSON_FIELDS = new Set([
  "type",
  "lesson_type",
  "objective",
  "learning_objective",
  "estimated_minutes",
  "minutes",
  "content",
  "takeaways",
  "key_takeaways",
  "video_url",
  "resource_url",
  "template_url",
  "resource_name",
  "resource_type",
  "download_button_text",
  "transcript",
  "video_transcript",
]);

// Fields that support multi-line continuation
const CONTINUATION_FIELDS = new Set([
  "content",
  "objective",
  "learning_objective",
  "transcript",
  "video_transcript",
  "description",
]);

const MODULE_REGEX = /^===\s*MODULE:\s*(.+?)\s*===$/;
const LESSON_REGEX = /^---\s*LESSON:\s*(.+?)\s*---$/;
const FIELD_REGEX = /^(\w+(?:_\w+)*):\s*(.*)$/;

// Maps field keys to the actual property they set on the lesson/module,
// so we know which property to append to during continuation.
function getLessonContinuationProp(fieldKey: string): keyof ParsedLesson | null {
  switch (fieldKey) {
    case "content":
      return "content";
    case "objective":
    case "learning_objective":
      return "learning_objective";
    case "transcript":
    case "video_transcript":
      return "video_transcript";
    default:
      return null;
  }
}

function getModuleContinuationProp(fieldKey: string): keyof ParsedModule | null {
  switch (fieldKey) {
    case "description":
      return "description";
    default:
      return null;
  }
}

import { markdownToHtml } from "./markdown";

export interface ParseOptions {
  /** Convert Markdown in content/objective/transcript/description fields into HTML. Default true. */
  formatMarkdown?: boolean;
}

export function parseCourseContent(text: string, options: ParseOptions = {}): ParseResult {
  const { formatMarkdown = true } = options;
  const lines = text.split("\n");
  const modules: ParsedModule[] = [];
  const warnings: ParseWarning[] = [];

  let currentModule: ParsedModule | null = null;
  let currentLesson: ParsedLesson | null = null;

  // Tracks active multi-line field: { target: 'lesson' | 'module', prop: string }
  let continuation: {
    target: "lesson" | "module";
    prop: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Handle blank lines: preserve paragraph breaks in continuation, otherwise skip
    if (!line) {
      if (continuation) {
        // Append paragraph break to the active continuation field
        if (continuation.target === "lesson" && currentLesson) {
          const prop = continuation.prop as keyof ParsedLesson;
          (currentLesson as any)[prop] = ((currentLesson as any)[prop] || "") + "\n\n";
        } else if (continuation.target === "module" && currentModule) {
          const prop = continuation.prop as keyof ParsedModule;
          (currentModule as any)[prop] = ((currentModule as any)[prop] || "") + "\n\n";
        }
      }
      continue;
    }

    // Check for module marker
    const moduleMatch = line.match(MODULE_REGEX);
    if (moduleMatch) {
      continuation = null;
      // Save previous lesson to previous module
      if (currentLesson && currentModule) {
        trimContinuationFields(currentLesson);
        currentModule.lessons.push(currentLesson);
        currentLesson = null;
      }
      // Save previous module
      if (currentModule) {
        trimModuleContinuationFields(currentModule);
        modules.push(currentModule);
      }
      currentModule = {
        title: moduleMatch[1].trim(),
        lessons: [],
      };
      continue;
    }

    // Check for lesson marker
    const lessonMatch = line.match(LESSON_REGEX);
    if (lessonMatch) {
      continuation = null;
      if (!currentModule) {
        warnings.push({
          line: lineNumber,
          message: `Lesson "${lessonMatch[1].trim()}" appears before any module. It will be skipped.`,
        });
        continue;
      }
      // Save previous lesson
      if (currentLesson) {
        trimContinuationFields(currentLesson);
        currentModule.lessons.push(currentLesson);
      }
      currentLesson = {
        title: lessonMatch[1].trim(),
        lesson_type: "content", // default
      };
      continue;
    }

    // Check for field, but only if the key is a known field
    const fieldMatch = line.match(FIELD_REGEX);
    if (fieldMatch) {
      const key = fieldMatch[1].toLowerCase();
      const value = fieldMatch[2].trim();

      // Determine if this is a known field in the current context
      const isKnownModuleField = currentModule && !currentLesson && KNOWN_MODULE_FIELDS.has(key);
      const isKnownLessonField = currentLesson && KNOWN_LESSON_FIELDS.has(key);

      if (isKnownModuleField && currentModule && !currentLesson) {
        continuation = null; // Reset continuation
        switch (key) {
          case "description":
            currentModule.description = value;
            if (CONTINUATION_FIELDS.has(key)) {
              const prop = getModuleContinuationProp(key);
              if (prop) continuation = { target: "module", prop };
            }
            break;
          case "deliverable":
          case "deliverable_name":
            currentModule.deliverable_name = value;
            break;
          case "path_type":
            if (VALID_PATH_TYPES.includes(value)) {
              currentModule.path_type = value;
            } else {
              warnings.push({
                line: lineNumber,
                message: `Invalid path_type "${value}". Valid: ${VALID_PATH_TYPES.join(", ")}`,
              });
            }
            break;
        }
        continue;
      }

      if (isKnownLessonField && currentLesson) {
        continuation = null; // Reset continuation
        switch (key) {
          case "type":
          case "lesson_type":
            if (VALID_LESSON_TYPES.includes(value)) {
              currentLesson.lesson_type = value;
            } else {
              warnings.push({
                line: lineNumber,
                message: `Invalid lesson type "${value}". Valid: ${VALID_LESSON_TYPES.join(", ")}`,
              });
            }
            break;
          case "objective":
          case "learning_objective":
            currentLesson.learning_objective = value;
            if (CONTINUATION_FIELDS.has(key)) {
              continuation = { target: "lesson", prop: "learning_objective" };
            }
            break;
          case "estimated_minutes":
          case "minutes": {
            const mins = parseInt(value, 10);
            if (!isNaN(mins) && mins >= 0) {
              currentLesson.estimated_minutes = mins;
            } else {
              warnings.push({
                line: lineNumber,
                message: `Invalid estimated_minutes "${value}". Must be a non-negative number.`,
              });
            }
            break;
          }
          case "content":
            currentLesson.content = value;
            if (CONTINUATION_FIELDS.has(key)) {
              continuation = { target: "lesson", prop: "content" };
            }
            break;
          case "takeaways":
          case "key_takeaways":
            currentLesson.key_takeaways = value
              .split("|")
              .map((t) => t.trim())
              .filter(Boolean);
            break;
          case "video_url":
            currentLesson.video_url = value;
            break;
          case "resource_url":
          case "template_url":
            currentLesson.template_url = value;
            break;
          case "resource_name":
            currentLesson.resource_name = value;
            break;
          case "resource_type":
            if (VALID_RESOURCE_TYPES.includes(value)) {
              currentLesson.resource_type = value;
            } else {
              warnings.push({
                line: lineNumber,
                message: `Invalid resource_type "${value}". Valid: ${VALID_RESOURCE_TYPES.join(", ")}`,
              });
            }
            break;
          case "download_button_text":
            currentLesson.download_button_text = value;
            break;
          case "transcript":
          case "video_transcript":
            currentLesson.video_transcript = value;
            if (CONTINUATION_FIELDS.has(key)) {
              continuation = { target: "lesson", prop: "video_transcript" };
            }
            break;
        }
        continue;
      }

      // If the key matched the regex but is NOT a known field, fall through
      // to continuation logic below (e.g., "CATEGORY 1: Narrow AI...")
    }

    // Line didn't match a known field or marker, try continuation
    if (continuation) {
      if (continuation.target === "lesson" && currentLesson) {
        const prop = continuation.prop as keyof ParsedLesson;
        const existing = (currentLesson as any)[prop] || "";
        // If existing ends with \n\n (paragraph break), just append the line
        // Otherwise add a single newline
        if (existing.endsWith("\n\n")) {
          (currentLesson as any)[prop] = existing + line;
        } else {
          (currentLesson as any)[prop] = existing + "\n" + line;
        }
      } else if (continuation.target === "module" && currentModule) {
        const prop = continuation.prop as keyof ParsedModule;
        const existing = (currentModule as any)[prop] || "";
        if (existing.endsWith("\n\n")) {
          (currentModule as any)[prop] = existing + line;
        } else {
          (currentModule as any)[prop] = existing + "\n" + line;
        }
      }
      continue;
    }

    // Line doesn't match any pattern and no continuation active, warn if in context
    if (currentModule || currentLesson) {
      warnings.push({
        line: lineNumber,
        message: `Could not parse line: "${line.substring(0, 60)}${line.length > 60 ? "..." : ""}"`,
      });
    }
  }

  // Push final lesson and module
  if (currentLesson && currentModule) {
    trimContinuationFields(currentLesson);
    currentModule.lessons.push(currentLesson);
  }
  if (currentModule) {
    trimModuleContinuationFields(currentModule);
    modules.push(currentModule);
  }

  // Apply Markdown -> HTML conversion to content fields (post-trim)
  if (formatMarkdown) {
    for (const mod of modules) {
      // Module descriptions stay plain text (rendered as text in admin lists)
      for (const lesson of mod.lessons) {
        if (lesson.content) lesson.content = markdownToHtml(lesson.content);
      }
    }
  }

  return { modules, warnings };
}

// Trim trailing whitespace/newlines from multi-line fields
function trimContinuationFields(lesson: ParsedLesson) {
  if (lesson.content) lesson.content = lesson.content.trim();
  if (lesson.learning_objective) lesson.learning_objective = lesson.learning_objective.trim();
  if (lesson.video_transcript) lesson.video_transcript = lesson.video_transcript.trim();
}

function trimModuleContinuationFields(mod: ParsedModule) {
  if (mod.description) mod.description = mod.description.trim();
}
