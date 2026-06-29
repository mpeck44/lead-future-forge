
# Public course pages + build-time prerendering

## Goal

Get crawler-visible HTML for the marketing surface without leaving the Vite + React SPA. Two pieces:

1. **Public course detail pages** at `/courses/:slug` — separate from the auth-gated `/course/:slug` learner viewer.
2. **Build-time prerender** that runs the SPA in headless Chromium during `vite build` and writes fully-rendered `index.html` files into `dist/` for every public route. Crawlers receive HTML; users still hydrate into the SPA.

This is the closest equivalent to SSG available on this stack. True SSR is not available on Lovable hosting.

## Scope of public routes to prerender

- `/` (already exists)
- `/courses` (already exists)
- `/courses/foundations` (new)
- `/courses/fluency` (new)
- `/courses/strategy` (new)
- `/courses/action` (new)

The authenticated viewer stays at `/course/:slug` (singular) — unchanged. Public marketing stays at `/courses/:slug` (plural). No collision.

## New public course page — content

Each `/courses/:slug` page renders:

- Hero: course title, one-line promise, "What you'll build" outcome line, CTA to enroll (or join waitlist if signed out).
- Audience / role fit (from `role_fit`).
- Module outline: list of module titles with one-line descriptions. No lesson content exposed.
- FAQ block (3–4 Qs per course).
- JSON-LD: `Course` schema + `BreadcrumbList`.
- Per-route `<Helmet>` for title, description, canonical, og:*.

Data is read at build time via a tiny Node script that queries the public `courses` + `modules` tables with the anon key (RLS already allows public reads of published courses/modules). Pages also re-query at runtime so updates are reflected for live visitors between deploys.

## Prerender mechanism

Use `vite-plugin-prerender` (or the lighter `vite-plugin-prerender-spa`, Puppeteer-based) configured in `vite.config.ts`:

```text
build → SPA bundles to dist/ → plugin spins up headless Chromium →
visits each route on a local static server → writes the rendered
HTML to dist/<route>/index.html → Lovable hosting serves the static
HTML; React hydrates on load.
```

Routes list is generated dynamically: static routes hard-coded, course routes pulled from the DB at build time so new courses auto-prerender.

Helmet output is captured into each prerendered file's `<head>`, so per-route title/description/canonical/og:* and JSON-LD ship as static HTML — fixing the social-preview crawler limitation noted in the head-meta guidance.

## Sitemap + llms.txt

`scripts/generate-sitemap.ts` (already wired to predev/prebuild) gets extended to:

- Pull course slugs from the DB.
- Emit `/`, `/courses`, and `/courses/:slug` entries with `lastmod`.
- Append the same course URLs to `public/llms.txt` under a new "Courses" section.

## What stays out of scope

- No changes to the authenticated `/course/:slug` viewer or any in-app behavior.
- No `/resources` content hub yet — easy to add later using the same prerender pipeline.
- No dynamic-rendering / bot-sniffing fallback. Prerender covers it.
- No framework migration (Next, Remix, TanStack Start are not supported on Lovable).

## Technical notes

- New files: `src/pages/PublicCourse.tsx`, `src/pages/PublicCourses.tsx` (may reuse existing `Courses.tsx` if it's already public), route entries in `src/App.tsx`.
- `vite.config.ts`: add prerender plugin, configure routes via an async loader that hits the DB with the anon key.
- `scripts/generate-sitemap.ts`: add DB-backed course slug loader.
- Build time will grow by a few seconds per route (headless Chromium navigation). Acceptable for the route count.
- Prerender uses the published origin `https://lead-future-forge.lovable.app` for canonical/og:url.
- Caveat to flag to the user: the in-preview dev server still serves the SPA shell directly — prerendered HTML only appears in production builds / the published site. The first published deploy after this change is where the SEO benefit lands.
