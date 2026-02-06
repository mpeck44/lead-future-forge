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
//   content: ...
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

const MODULE_REGEX = /^===\s*MODULE:\s*(.+?)\s*===$/;
const LESSON_REGEX = /^---\s*LESSON:\s*(.+?)\s*---$/;
const FIELD_REGEX = /^(\w+(?:_\w+)*):\s*(.+)$/;

export function parseCourseContent(text: string): ParseResult {
  const lines = text.split("\n");
  const modules: ParsedModule[] = [];
  const warnings: ParseWarning[] = [];

  let currentModule: ParsedModule | null = null;
  let currentLesson: ParsedLesson | null = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Check for module marker
    const moduleMatch = line.match(MODULE_REGEX);
    if (moduleMatch) {
      // Save previous lesson to previous module
      if (currentLesson && currentModule) {
        currentModule.lessons.push(currentLesson);
        currentLesson = null;
      }
      // Save previous module
      if (currentModule) {
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
      if (!currentModule) {
        warnings.push({
          line: lineNumber,
          message: `Lesson "${lessonMatch[1].trim()}" appears before any module. It will be skipped.`,
        });
        continue;
      }
      // Save previous lesson
      if (currentLesson) {
        currentModule.lessons.push(currentLesson);
      }
      currentLesson = {
        title: lessonMatch[1].trim(),
        lesson_type: "content", // default
      };
      continue;
    }

    // Check for field
    const fieldMatch = line.match(FIELD_REGEX);
    if (fieldMatch) {
      const key = fieldMatch[1].toLowerCase();
      const value = fieldMatch[2].trim();

      // Module-level fields (when no lesson is active)
      if (currentModule && !currentLesson) {
        switch (key) {
          case "description":
            currentModule.description = value;
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
          default:
            warnings.push({
              line: lineNumber,
              message: `Unknown module field "${key}"`,
            });
        }
        continue;
      }

      // Lesson-level fields
      if (currentLesson) {
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
            break;
          default:
            warnings.push({
              line: lineNumber,
              message: `Unknown lesson field "${key}"`,
            });
        }
        continue;
      }

      // Field outside any context
      if (!currentModule) {
        warnings.push({
          line: lineNumber,
          message: `Field "${key}" appears before any module marker. It will be ignored.`,
        });
      }
      continue;
    }

    // Line doesn't match any pattern — only warn if we're inside a module/lesson context
    if (currentModule || currentLesson) {
      warnings.push({
        line: lineNumber,
        message: `Could not parse line: "${line.substring(0, 60)}${line.length > 60 ? "..." : ""}"`,
      });
    }
  }

  // Push final lesson and module
  if (currentLesson && currentModule) {
    currentModule.lessons.push(currentLesson);
  }
  if (currentModule) {
    modules.push(currentModule);
  }

  return { modules, warnings };
}
