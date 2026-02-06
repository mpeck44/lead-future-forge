import { describe, it, expect } from "vitest";
import { parseCourseContent } from "./parseCourseContent";

describe("parseCourseContent", () => {
  it("parses a single module with no lessons", () => {
    const text = `=== MODULE: Intro to AI ===
description: An introductory module
deliverable: Summary Doc
path_type: foundation`;

    const result = parseCourseContent(text);
    expect(result.modules).toHaveLength(1);
    expect(result.modules[0].title).toBe("Intro to AI");
    expect(result.modules[0].description).toBe("An introductory module");
    expect(result.modules[0].deliverable_name).toBe("Summary Doc");
    expect(result.modules[0].path_type).toBe("foundation");
    expect(result.modules[0].lessons).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("parses a module with lessons", () => {
    const text = `=== MODULE: AI Basics ===

--- LESSON: What is AI? ---
type: content
objective: Understand AI basics
estimated_minutes: 15
content: AI is the simulation of human intelligence
takeaways: AI is a tool | AI augments humans | Start small

--- LESSON: Watch: AI Overview ---
type: video
estimated_minutes: 10
video_url: https://youtube.com/watch?v=abc123
takeaways: AI is growing | Policy matters`;

    const result = parseCourseContent(text);
    expect(result.modules).toHaveLength(1);
    expect(result.modules[0].lessons).toHaveLength(2);

    const lesson1 = result.modules[0].lessons[0];
    expect(lesson1.title).toBe("What is AI?");
    expect(lesson1.lesson_type).toBe("content");
    expect(lesson1.learning_objective).toBe("Understand AI basics");
    expect(lesson1.estimated_minutes).toBe(15);
    expect(lesson1.content).toBe("AI is the simulation of human intelligence");
    expect(lesson1.key_takeaways).toEqual(["AI is a tool", "AI augments humans", "Start small"]);

    const lesson2 = result.modules[0].lessons[1];
    expect(lesson2.title).toBe("Watch: AI Overview");
    expect(lesson2.lesson_type).toBe("video");
    expect(lesson2.video_url).toBe("https://youtube.com/watch?v=abc123");
    expect(lesson2.key_takeaways).toEqual(["AI is growing", "Policy matters"]);
  });

  it("parses multiple modules", () => {
    const text = `=== MODULE: Module One ===
description: First module

--- LESSON: Lesson A ---
type: content

=== MODULE: Module Two ===
description: Second module

--- LESSON: Lesson B ---
type: reflection
estimated_minutes: 5
content: Reflect on your learning`;

    const result = parseCourseContent(text);
    expect(result.modules).toHaveLength(2);
    expect(result.modules[0].title).toBe("Module One");
    expect(result.modules[0].lessons).toHaveLength(1);
    expect(result.modules[1].title).toBe("Module Two");
    expect(result.modules[1].lessons).toHaveLength(1);
    expect(result.modules[1].lessons[0].lesson_type).toBe("reflection");
  });

  it("handles activity lesson type with resources", () => {
    const text = `=== MODULE: Activities ===

--- LESSON: Build Your Plan ---
type: activity
objective: Create an implementation plan
estimated_minutes: 20
content: Use the template to draft your plan
resource_url: https://docs.google.com/doc/template
resource_name: Implementation Template
resource_type: google_doc
download_button_text: Get Template`;

    const result = parseCourseContent(text);
    const lesson = result.modules[0].lessons[0];
    expect(lesson.lesson_type).toBe("activity");
    expect(lesson.template_url).toBe("https://docs.google.com/doc/template");
    expect(lesson.resource_name).toBe("Implementation Template");
    expect(lesson.resource_type).toBe("google_doc");
    expect(lesson.download_button_text).toBe("Get Template");
  });

  it("warns on invalid lesson type", () => {
    const text = `=== MODULE: Test ===

--- LESSON: Bad Type ---
type: invalid_type`;

    const result = parseCourseContent(text);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].message).toContain("Invalid lesson type");
    // Lesson should still have default type
    expect(result.modules[0].lessons[0].lesson_type).toBe("content");
  });

  it("warns on invalid path_type", () => {
    const text = `=== MODULE: Test ===
path_type: invalid_path`;

    const result = parseCourseContent(text);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].message).toContain("Invalid path_type");
  });

  it("warns when lesson appears before any module", () => {
    const text = `--- LESSON: Orphan Lesson ---
type: content`;

    const result = parseCourseContent(text);
    expect(result.modules).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].message).toContain("before any module");
  });

  it("handles empty input", () => {
    const result = parseCourseContent("");
    expect(result.modules).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("handles video transcript field", () => {
    const text = `=== MODULE: Videos ===

--- LESSON: Demo Video ---
type: video
video_url: https://youtube.com/watch?v=xyz
transcript: This is the full transcript of the video`;

    const result = parseCourseContent(text);
    expect(result.modules[0].lessons[0].video_transcript).toBe(
      "This is the full transcript of the video"
    );
  });

  it("accepts alternative field name aliases", () => {
    const text = `=== MODULE: Aliases ===
deliverable_name: Alt Deliverable

--- LESSON: Alt Fields ---
lesson_type: video
learning_objective: Test objective
key_takeaways: A | B | C
template_url: https://example.com
video_transcript: Some transcript
minutes: 12`;

    const result = parseCourseContent(text);
    expect(result.modules[0].deliverable_name).toBe("Alt Deliverable");
    const lesson = result.modules[0].lessons[0];
    expect(lesson.lesson_type).toBe("video");
    expect(lesson.learning_objective).toBe("Test objective");
    expect(lesson.key_takeaways).toEqual(["A", "B", "C"]);
    expect(lesson.template_url).toBe("https://example.com");
    expect(lesson.video_transcript).toBe("Some transcript");
    expect(lesson.estimated_minutes).toBe(12);
  });

  // ===== Multi-line content tests =====

  it("supports multi-line content with paragraphs", () => {
    const text = `=== MODULE: Test ===

--- LESSON: Multi-line ---
type: content
estimated_minutes: 10
content: First paragraph of content.

Second paragraph after a blank line.

Third paragraph here.
takeaways: Point A | Point B`;

    const result = parseCourseContent(text);
    expect(result.warnings).toHaveLength(0);
    const lesson = result.modules[0].lessons[0];
    expect(lesson.content).toContain("First paragraph of content.");
    expect(lesson.content).toContain("Second paragraph after a blank line.");
    expect(lesson.content).toContain("Third paragraph here.");
    // Paragraph breaks should be preserved
    expect(lesson.content).toContain("\n\n");
    // Takeaways should be parsed correctly, not appended to content
    expect(lesson.key_takeaways).toEqual(["Point A", "Point B"]);
    expect(lesson.content).not.toContain("Point A");
  });

  it("supports bullet lists in content", () => {
    const text = `=== MODULE: Test ===

--- LESSON: Bullets ---
type: content
content: Here are some examples:
- First bullet item
- Second bullet item
- Third bullet item
takeaways: Summary point`;

    const result = parseCourseContent(text);
    expect(result.warnings).toHaveLength(0);
    const lesson = result.modules[0].lessons[0];
    expect(lesson.content).toContain("- First bullet item");
    expect(lesson.content).toContain("- Second bullet item");
    expect(lesson.content).toContain("- Third bullet item");
    expect(lesson.key_takeaways).toEqual(["Summary point"]);
  });

  it("handles lines with colons that are not known fields", () => {
    const text = `=== MODULE: Test ===

--- LESSON: Colons ---
type: content
content: Introduction text
CATEGORY 1: Narrow AI - The Automation Tools
This is more content about narrow AI.
CATEGORY 2: Generative AI - The Creation Tools
More content about generative AI.
takeaways: AI has categories`;

    const result = parseCourseContent(text);
    expect(result.warnings).toHaveLength(0);
    const lesson = result.modules[0].lessons[0];
    expect(lesson.content).toContain("CATEGORY 1: Narrow AI");
    expect(lesson.content).toContain("CATEGORY 2: Generative AI");
    expect(lesson.key_takeaways).toEqual(["AI has categories"]);
  });

  it("stops continuation when a new lesson marker is hit", () => {
    const text = `=== MODULE: Test ===

--- LESSON: First ---
type: content
content: Content for first lesson
This continues on the next line.

--- LESSON: Second ---
type: video
video_url: https://youtube.com/watch?v=123`;

    const result = parseCourseContent(text);
    expect(result.modules[0].lessons).toHaveLength(2);
    expect(result.modules[0].lessons[0].content).toContain("Content for first lesson");
    expect(result.modules[0].lessons[0].content).toContain("This continues on the next line.");
    expect(result.modules[0].lessons[1].title).toBe("Second");
    expect(result.modules[0].lessons[1].lesson_type).toBe("video");
  });

  it("stops continuation when a new module marker is hit", () => {
    const text = `=== MODULE: First Module ===

--- LESSON: Lesson ---
type: content
content: Some content
More content here

=== MODULE: Second Module ===
description: New module`;

    const result = parseCourseContent(text);
    expect(result.modules).toHaveLength(2);
    expect(result.modules[0].lessons[0].content).toContain("More content here");
    expect(result.modules[1].title).toBe("Second Module");
  });

  it("supports multi-line transcript for video lessons", () => {
    const text = `=== MODULE: Test ===

--- LESSON: Video ---
type: video
video_url: https://youtube.com/watch?v=abc
transcript: Hello and welcome.
Today we'll discuss AI in education.
Let's get started.
takeaways: AI is useful`;

    const result = parseCourseContent(text);
    expect(result.warnings).toHaveLength(0);
    const lesson = result.modules[0].lessons[0];
    expect(lesson.video_transcript).toContain("Hello and welcome.");
    expect(lesson.video_transcript).toContain("Today we'll discuss AI in education.");
    expect(lesson.video_transcript).toContain("Let's get started.");
    expect(lesson.key_takeaways).toEqual(["AI is useful"]);
  });

  it("handles square brackets and special characters in content", () => {
    const text = `=== MODULE: Test ===

--- LESSON: Special Chars ---
type: activity
content: Fill in below:
[Your turn: List 1-2 tools you currently use]
→ Narrow AI = efficiency question
takeaways: Practice makes perfect`;

    const result = parseCourseContent(text);
    expect(result.warnings).toHaveLength(0);
    const lesson = result.modules[0].lessons[0];
    expect(lesson.content).toContain("[Your turn: List 1-2 tools you currently use]");
    expect(lesson.content).toContain("→ Narrow AI = efficiency question");
  });

  it("parses real-world content file without excessive warnings", () => {
    const text = `=== MODULE: Understanding the AI Landscape ===
description: Cut through AI jargon
deliverable: AI Types Cheat Sheet
path_type: foundation

--- LESSON: The AI Categories That Matter ---
type: video
objective: Understand the three AI categories
estimated_minutes: 6
video_url: https://example.com/video
content: A superintendent once asked me a question.

CATEGORY 1: Narrow AI - The Automation Tools.
This is AI that does one specific task really well.
- Spam filters in your email
- Autocorrect on your phone

CATEGORY 2: Generative AI - The Creation Tools.
This is the AI that creates new content.
takeaways: Narrow AI automates | Generative AI creates | AGI doesn't exist yet

--- LESSON: Create Your AI Types Cheat Sheet ---
type: activity
objective: Build a reference document
estimated_minutes: 4
content: You're creating a one-page reference document.

CATEGORY 1: NARROW AI (Automation AI)
What it is: AI designed to do one specific task efficiently.

K-12 Examples (General):
- Spam filters in school email
- Adaptive learning platforms (Lexia, IXL, DreamBox)

Examples from MY school/district:
[Your turn: List 1-2 tools you currently use]
takeaways: Add your school's specific AI examples | Use when evaluating vendors
resource_url: https://docs.google.com/document/template
resource_name: AI Types Cheat Sheet Template`;

    const result = parseCourseContent(text);
    // Should produce no warnings — all content lines are continuation
    expect(result.warnings).toHaveLength(0);
    expect(result.modules).toHaveLength(1);
    expect(result.modules[0].lessons).toHaveLength(2);

    const lesson1 = result.modules[0].lessons[0];
    expect(lesson1.content).toContain("CATEGORY 1: Narrow AI");
    expect(lesson1.content).toContain("- Spam filters in your email");
    expect(lesson1.key_takeaways).toHaveLength(3);

    const lesson2 = result.modules[0].lessons[1];
    expect(lesson2.content).toContain("[Your turn: List 1-2 tools you currently use]");
    expect(lesson2.resource_name).toBe("AI Types Cheat Sheet Template");
  });
});
