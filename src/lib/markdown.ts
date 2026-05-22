import { marked } from "marked";
import { sanitizeHtml } from "./sanitize";

// Configure marked: GFM, line breaks honored, no headerIds (not needed here)
marked.setOptions({
  gfm: true,
  breaks: false,
});

/**
 * Detect whether a block of text contains any Markdown signals worth converting.
 * If not, we leave it as-is (wrapped in <p>) so plain prose still renders cleanly.
 */
export function looksLikeMarkdown(text: string): boolean {
  if (!text) return false;
  return /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|---\s*$|```)/.test(text) ||
    /\*\*[^*]+\*\*/.test(text) ||
    /(^|[\s(])_[^_]+_([\s).,!?]|$)/.test(text) ||
    /\[[^\]]+\]\([^)]+\)/.test(text);
}

/**
 * Convert a markdown-flavored string to sanitized HTML.
 * - Preserves existing HTML (e.g. YouTube iframe embeds inserted by the rich text editor).
 * - If the text contains no markdown signals, wraps paragraphs in <p> so blank-line
 *   breaks render correctly in the lesson viewer.
 * - Always runs through DOMPurify (which already permits YouTube iframes).
 *
 * Skips H1 promotion: the lesson title is already the page H1, so we down-shift
 * `#` headings by one level.
 */
export function markdownToHtml(text: string): string {
  if (!text || !text.trim()) return "";

  // If the input already contains block-level HTML (e.g. <p>, <iframe>, <div>),
  // assume it was authored in the rich text editor and leave it alone.
  if (/<(p|div|h[1-6]|ul|ol|iframe|blockquote)\b/i.test(text)) {
    return sanitizeHtml(text);
  }

  let html: string;
  if (looksLikeMarkdown(text)) {
    const raw = marked.parse(text, { async: false }) as string;
    // Down-shift headings: H1 -> H2, H2 -> H3, etc. (lesson title is the page H1)
    html = raw
      .replace(/<h6\b/g, "<h6")
      .replace(/<h5\b/g, "<h6")
      .replace(/<h4\b/g, "<h5")
      .replace(/<h3\b/g, "<h4")
      .replace(/<h2\b/g, "<h3")
      .replace(/<h1\b/g, "<h2")
      .replace(/<\/h1>/g, "</h2>")
      .replace(/<\/h2>/g, "</h3>")
      .replace(/<\/h3>/g, "</h4>")
      .replace(/<\/h4>/g, "</h5>")
      .replace(/<\/h5>/g, "</h6>")
      // Add target=_blank to external links
      .replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
  } else {
    // Plain prose: split on blank lines into paragraphs, preserve single \n as <br>
    html = text
      .split(/\n{2,}/)
      .map((para) => `<p>${para.trim().replace(/\n/g, "<br>")}</p>`)
      .join("\n");
  }

  return sanitizeHtml(html);
}
