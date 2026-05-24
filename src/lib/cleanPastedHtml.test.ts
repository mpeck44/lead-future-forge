import { describe, it, expect } from "vitest";
import { cleanPastedHtml } from "./cleanPastedHtml";

describe("cleanPastedHtml", () => {
  it("returns empty for empty input", () => {
    expect(cleanPastedHtml("")).toBe("");
    expect(cleanPastedHtml("   ")).toBe("");
  });

  it("unwraps the Google Docs <b id='docs-internal-guid-...'> container", () => {
    const html = `<b id="docs-internal-guid-abc123" style="font-weight:normal"><p>Hello</p></b>`;
    const out = cleanPastedHtml(html);
    expect(out).toContain("<p>Hello</p>");
    expect(out).not.toContain("docs-internal-guid");
    expect(out).not.toMatch(/^<b/);
  });

  it("promotes inline font-weight:700 span to <strong>", () => {
    const html = `<p>hello <span style="font-weight:700">bold</span> world</p>`;
    const out = cleanPastedHtml(html);
    expect(out).toContain("<strong>bold</strong>");
  });

  it("promotes italic and underline spans", () => {
    expect(cleanPastedHtml(`<span style="font-style:italic">x</span>`)).toContain("<em>x</em>");
    expect(cleanPastedHtml(`<span style="text-decoration:underline">x</span>`)).toContain("<u>x</u>");
  });

  it("down-shifts h1 -> h2, h2 -> h3", () => {
    const out = cleanPastedHtml(`<h1>Title</h1><h2>Sub</h2>`);
    expect(out).toContain("<h2>Title</h2>");
    expect(out).toContain("<h3>Sub</h3>");
  });

  it("converts h6 to <p><strong>", () => {
    const out = cleanPastedHtml(`<h6>tiny</h6>`);
    expect(out).toContain("<p><strong>tiny</strong></p>");
  });

  it("preserves bulleted and numbered lists", () => {
    const out = cleanPastedHtml(`<ul><li>one</li><li>two</li></ul><ol><li>a</li></ol>`);
    expect(out).toContain("<ul>");
    expect(out).toContain("<li>one</li>");
    expect(out).toContain("<ol>");
  });

  it("unwraps Google redirect URLs", () => {
    const html = `<a href="https://www.google.com/url?q=https%3A%2F%2Fexample.com%2Fpage&sa=D&source=docs">link</a>`;
    const out = cleanPastedHtml(html);
    expect(out).toContain('href="https://example.com/page"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("strips style, class, id attributes", () => {
    const out = cleanPastedHtml(`<p style="color:red" class="x" id="y">hi</p>`);
    expect(out).toBe("<p>hi</p>");
  });

  it("removes script tags and on* handlers", () => {
    const out = cleanPastedHtml(`<p onclick="alert(1)">hi</p><script>alert(2)</script>`);
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("script");
  });

  it("removes meta, style, and images", () => {
    const out = cleanPastedHtml(`<meta charset="utf-8"><style>p{}</style><img src="x"><p>ok</p>`);
    expect(out).toBe("<p>ok</p>");
  });

  it("collapses empty paragraphs", () => {
    const out = cleanPastedHtml(`<p></p><p>real</p><p>   </p>`);
    expect(out).toBe("<p>real</p>");
  });
});
