## Goal
Make The Leadership Forge highly discoverable in (a) Google Search and (b) LLM answer engines (ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews) — since K-12 leaders mostly find PD through search, peer referrals, and increasingly AI assistants, not social.

## Current state (what's already in place)
- `react-helmet-async` per-route titles/descriptions/canonicals on Home + Courses
- `index.html` with Organization + WebSite JSON-LD
- `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt`
- Clean URLs, semantic HTML, mobile responsive

## Gaps that hurt discoverability
1. **Thin sitemap** — only 3 URLs. Course detail pages (`/course/:slug`) and any future content aren't listed, so Google won't crawl them efficiently.
2. **No per-course SEO** — `/course/:slug` likely has no Helmet tags, no `Course` JSON-LD, no canonical. These are the pages that should rank for "AI strategy for school districts" etc.
3. **No long-form indexable content** — Google and LLMs reward depth. There's no `/blog`, `/guides`, or `/resources` section. LLMs cite pages with substantive, quotable, factual content.
4. **llms.txt is minimal** — doesn't expose the most quotable assertions (who Mike is, what the audit measures, what each course produces). LLMs use this to summarize the site.
5. **No structured data for the people/products that matter** — no `Person` schema for Mike (E-E-A-T signal), no `Course` schema per course, no `FAQPage` schema on the FAQ section, no `BreadcrumbList`.
6. **No Google Search Console verification** — can't see what Google sees, can't submit sitemap, can't request indexing.
7. **Sitemap is static** — won't auto-include new courses or blog posts as you add them.
8. **No OG image** — link previews in Slack/email/LinkedIn (where superintendents actually share) fall back to nothing.

## Plan

### 1. Per-course SEO (biggest single win)
- Add `<Helmet>` to `CourseViewer` / course detail route with:
  - Title: `{course.title} — The Leadership Forge`
  - Description: pull from `course.description`
  - Self-referencing canonical + `og:url`
  - `Course` JSON-LD (name, description, provider=Organization, educationalLevel, timeRequired from `estimated_hours`, `audit_category` → `educationalCredentialAwarded`/`about`)

### 2. Dynamic sitemap generator
- Add `scripts/generate-sitemap.ts` wired to `predev` + `prebuild`
- Pulls all `is_published=true` courses from Supabase and emits `/course/{slug}` URLs alongside static routes
- Keeps sitemap fresh automatically as you publish courses

### 3. Enrich structured data on the landing page
- `Person` JSON-LD for Mike Peck (jobTitle, worksFor, sameAs) — strong E-E-A-T signal Google uses for YMYL-adjacent content like PD
- `FAQPage` JSON-LD generated from `FaqSection` content — eligible for rich results and frequently cited by AI Overviews
- `BreadcrumbList` on inner pages

### 4. Expand `llms.txt`
- Add an "About the instructor" block (the Director of Technology bio — your signature line)
- Add a "Courses" block listing each course with one-sentence outcome
- Add a "What the AI Equity Audit measures" block (the 5 categories) — directly quotable by LLMs answering "how do I assess my district's AI readiness?"
- Add an "FAQ" block mirroring the on-page FAQ

### 5. Google Search Console verification + submission
- Use the META verification flow (already documented for this stack) to verify `https://lead-future-forge.lovable.app`
- Add the verification meta tag to `index.html`
- Submit sitemap via the Search Console API
- This unlocks: indexing coverage reports, search query data, "Request indexing" for new pages

### 6. Social/LLM preview image
- Generate one branded `og-image.jpg` (1200×630) — Forge wordmark + tagline on the navy/gold palette
- Wire into sitewide `og:image` + `twitter:image` in `index.html`
- Helps every shared link (email, Slack, LinkedIn DMs) render with authority

### 7. Lightweight content surface for organic growth (optional, flag for your call)
- Scaffold a `/resources` route backed by a `resources` table (title, slug, excerpt, body MD, published_at)
- Each resource gets its own Helmet + `Article` JSON-LD + sitemap entry
- Even 4–6 evergreen pieces ("K-12 AI acceptable use policy template", "AI readiness audit for school districts", "3-year district AI roadmap") would meaningfully expand your search surface and give LLMs more to cite
- I'd recommend this but it's a larger build — say yes/no and I'll include or defer

## What I'd skip (not worth the effort right now)
- Submitting to Bing Webmaster Tools — Bingbot already crawls; manual submission moves the needle marginally
- Schema.org `Review`/`AggregateRating` — you don't have public reviews yet; faking these is a policy violation
- AMP — dead format

## Deliverables after build
- Every course page indexable with rich `Course` results
- Sitemap auto-updates with new courses
- Verified in Google Search Console with sitemap submitted
- FAQ rich-result eligible
- Branded OG image on every share
- Expanded llms.txt that LLMs can quote directly
- (Optional) `/resources` content surface

## One question before I build
Do you want me to include **#7 (the `/resources` content surface)** in this pass, or ship #1–#6 first and add `/resources` as a follow-up?
