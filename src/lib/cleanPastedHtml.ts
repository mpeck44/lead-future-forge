/**
 * Normalize HTML pasted from rich-text sources (Google Docs, Word, Notion, web pages)
 * into the small set of semantic tags our lesson viewer renders cleanly.
 *
 * - Strips wrapping <b id="docs-internal-guid-..."> Google Docs adds around everything
 * - Removes <meta>, <style>, <script>, <o:p>, MS Office comments, empty <span>s
 * - Promotes inline-styled span text (font-weight, font-style, text-decoration) to
 *   <strong>/<em>/<u>/<s>
 * - Down-shifts headings (h1->h2, h2->h3, ..., h6->p+strong) to match markdown.ts
 * - Unwraps Google's /url?q=... redirect wrappers and adds target=_blank to external links
 * - Drops <img> (Google Docs paste images are short-lived blob URLs)
 * - Strips all remaining style/class/id/dir/lang attributes
 *
 * Output is plain HTML; the caller should still run it through sanitizeHtml().
 */
export function cleanPastedHtml(html: string): string {
  if (!html || !html.trim()) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;
  if (!body) return "";

  // 1. Strip junk tags entirely
  body.querySelectorAll("meta, style, script, link, title, o\\:p, img").forEach((n) => n.remove());

  // 2. Unwrap Google Docs' outer <b id="docs-internal-guid-...">
  body.querySelectorAll('b[id^="docs-internal-guid-"]').forEach((el) => unwrap(el));

  // 3. Convert inline-styled spans/elements to semantic tags
  body.querySelectorAll("[style]").forEach((el) => {
    const style = (el.getAttribute("style") || "").toLowerCase();
    const wraps: string[] = [];
    if (/font-weight\s*:\s*(bold|[6-9]00)/.test(style)) wraps.push("strong");
    if (/font-style\s*:\s*italic/.test(style)) wraps.push("em");
    if (/text-decoration[^;]*underline/.test(style)) wraps.push("u");
    if (/text-decoration[^;]*line-through/.test(style)) wraps.push("s");
    if (wraps.length > 0 && el.tagName === "SPAN") {
      // Replace span with nested semantic wrappers around its children
      let inner: Node = doc.createDocumentFragment();
      while (el.firstChild) inner.appendChild(el.firstChild);
      for (const tag of wraps) {
        const w = doc.createElement(tag);
        w.appendChild(inner);
        inner = w;
      }
      el.parentNode?.replaceChild(inner, el);
    }
  });

  // 4. Down-shift headings (h1->h2 ... h5->h6, h6->p>strong)
  for (let lvl = 6; lvl >= 1; lvl--) {
    body.querySelectorAll(`h${lvl}`).forEach((el) => {
      if (lvl === 6) {
        const p = doc.createElement("p");
        const strong = doc.createElement("strong");
        while (el.firstChild) strong.appendChild(el.firstChild);
        p.appendChild(strong);
        el.parentNode?.replaceChild(p, el);
      } else {
        const next = doc.createElement(`h${lvl + 1}`);
        while (el.firstChild) next.appendChild(el.firstChild);
        el.parentNode?.replaceChild(next, el);
      }
    });
  }

  // 5. Unwrap Google redirect links + add target=_blank to external links
  body.querySelectorAll("a[href]").forEach((a) => {
    let href = a.getAttribute("href") || "";
    const match = href.match(/^https?:\/\/(?:www\.)?google\.com\/url\?(?:[^&]*&)*q=([^&]+)/);
    if (match) {
      try {
        href = decodeURIComponent(match[1]);
        a.setAttribute("href", href);
      } catch {
        /* leave as-is */
      }
    }
    if (/^https?:/i.test(href)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });

  // 6. Unwrap empty spans + spans with no meaningful attributes
  body.querySelectorAll("span").forEach((el) => unwrap(el));

  // 7. Strip leftover formatting attributes from every element
  body.querySelectorAll("*").forEach((el) => {
    el.removeAttribute("style");
    el.removeAttribute("class");
    el.removeAttribute("id");
    el.removeAttribute("dir");
    el.removeAttribute("lang");
    // Strip on* event handlers defensively (sanitizer will catch these too)
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith("on")) el.removeAttribute(attr.name);
    });
  });

  // 8. Collapse empty paragraphs
  body.querySelectorAll("p").forEach((p) => {
    if (!p.textContent?.trim() && p.children.length === 0) p.remove();
  });

  return body.innerHTML.trim();
}

function unwrap(el: Element) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}
