import DOMPurify from "dompurify";

/**
 * DOMPurify configuration that allows YouTube embeds while sanitizing dangerous content
 */
const SANITIZE_CONFIG = {
  ADD_TAGS: ["iframe"],
  ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "src", "style", "class", "contenteditable", "target", "rel"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
};

/**
 * Sanitize HTML content to prevent XSS attacks while preserving safe formatting and YouTube embeds
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  
  // Custom hook to ensure iframes only point to YouTube
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName === "iframe") {
      const src = (node as HTMLIFrameElement).getAttribute("src") || "";
      if (!src.startsWith("https://www.youtube.com/embed/")) {
        node.parentNode?.removeChild(node);
      }
    }
  });

  const sanitized = DOMPurify.sanitize(html, SANITIZE_CONFIG);
  
  // Remove the hook after use to prevent memory leaks
  DOMPurify.removeHook("uponSanitizeElement");
  
  return sanitized as string;
}
