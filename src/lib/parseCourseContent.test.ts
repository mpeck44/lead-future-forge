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
});
