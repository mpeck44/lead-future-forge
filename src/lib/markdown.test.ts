import { describe, it, expect } from "vitest";
import { markdownToHtml, looksLikeMarkdown } from "./markdown";

describe("looksLikeMarkdown", () => {
  it("detects headings, lists, bold, links", () => {
    expect(looksLikeMarkdown("# Hello")).toBe(true);
    expect(looksLikeMarkdown("- item")).toBe(true);
    expect(looksLikeMarkdown("1. item")).toBe(true);
    expect(looksLikeMarkdown("**bold**")).toBe(true);
    expect(looksLikeMarkdown("[a](http://x.com)")).toBe(true);
    expect(looksLikeMarkdown("just plain prose here")).toBe(false);
  });
});

describe("markdownToHtml", () => {
  it("down-shifts H1 to H2", () => {
    expect(markdownToHtml("# Title")).toContain("<h2>Title</h2>");
  });

  it("renders bullet lists", () => {
    const html = markdownToHtml("- one\n- two\n- three");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>one</li>");
  });

  it("renders numbered lists", () => {
    const html = markdownToHtml("1. one\n2. two");
    expect(html).toContain("<ol>");
  });

  it("renders bold and italics", () => {
    expect(markdownToHtml("**bold** and *italic*")).toContain("<strong>bold</strong>");
  });

  it("adds target=_blank to external links", () => {
    const html = markdownToHtml("[link](https://example.com)");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("wraps plain prose paragraphs", () => {
    const html = markdownToHtml("first paragraph\n\nsecond paragraph");
    expect(html).toContain("<p>first paragraph</p>");
    expect(html).toContain("<p>second paragraph</p>");
  });

  it("preserves existing HTML", () => {
    const input = '<p>already HTML</p>';
    expect(markdownToHtml(input)).toContain("already HTML");
  });

  it("returns empty for empty input", () => {
    expect(markdownToHtml("")).toBe("");
    expect(markdownToHtml("   ")).toBe("");
  });

  it("strips dangerous scripts via sanitizer", () => {
    const html = markdownToHtml("# Hi\n\n<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
  });
});
