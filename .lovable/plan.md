## Diagnosis (no fix needed for most of it)

**"Page with redirect" (3 URLs)** — This is your `http://`, `www.`, and `http://www.` versions correctly redirecting to `https://edleaderforge.com/`. This is the desired canonical behavior. Not an error, no action needed.

**"Discovered – currently not indexed" (7 URLs)** — Google found these pages via your sitemap but hasn't crawled them yet. This is a **crawl-priority** issue common for new sites, not a technical block. The homepage IS indexed, so crawling works.

## What resolves it (mostly outside code)

The highest-impact fix is manual: in Google Search Console, open URL Inspection for each of the 7 URLs and click **"Request indexing."** Google will usually crawl within a few days. Also confirm `https://edleaderforge.com/sitemap.xml` is submitted under GSC → Sitemaps.

## Code changes to help crawl priority

Two small edits — nothing else in the codebase needs to change:

1. **Per-course unique metadata on `/courses/fluency`, `/courses/strategy`, `/courses/action`.**
   Read `src/pages/PublicCourse.tsx` and confirm each course page renders a `<Helmet>` block with a **unique** `<title>`, `<meta name="description">`, and `<link rel="canonical">` derived from the course's own data (name, outcome, deliverable). Right now these three pages likely share very similar head tags, which makes Google treat them as near-duplicates and deprioritize them. If they're already unique, no change needed — otherwise wire them to the course row's fields.

2. **Add a `<lastmod>` on the 4 course entries in `public/sitemap.xml`** (or in `scripts/generate-sitemap.ts` if it drives the file). A fresh `lastmod` nudges Google to recrawl. Two of the resource entries already have `lastmod`; the course entries don't. Pull `updated_at` from the `courses` table the same way `generate-sitemap.ts` already does for resources.

## What I won't touch

- `robots.txt` — already correct (public routes allowed, private routes disallowed).
- Sitemap structure — already valid and lists all 7 URLs.
- Redirects — the http→https and www→apex behavior is correct; do not change it.
- `/auth` and `/resources` — these will index naturally once you request indexing in GSC; no code change would speed that up.

## Technical notes

- Files to read before editing: `src/pages/PublicCourse.tsx`, `scripts/generate-sitemap.ts`.
- The sitemap generator already fetches `updated_at` for resources; extending it to courses is a one-line change to the `courses` select and one field in the entry mapping.
- No database migration, no edge function change.

## What you should do in parallel (GSC, not code)

1. GSC → URL Inspection → paste each of the 7 URLs → **Request indexing**.
2. GSC → Sitemaps → verify `sitemap.xml` is listed as "Success."
3. Wait 3–7 days and recheck. This category typically clears on its own once Google has crawled the sites at least once.
