
# Resources Hub + SEO Polish

Three things, sequenced from biggest to smallest. The resources hub is the real build; the other two are quick polish to do alongside.

---

## 1. Resources hub (the main work)

A DB-backed blog/resources surface so you can publish repurposed LinkedIn/personal-blog content from inside the admin console, with full SEO treatment.

### Public surface

- **`/resources`** — index page. Hero strip + filter chips by category + grid of post cards (cover image, category, title, dek, published date, read time). Newest first. Filter is client-side query param (`?category=governance`).
- **`/resources/:slug`** — detail page. Title, byline (Mike Peck), published date, read time, cover image, category chip, sanitized rich-text body, and a "Related posts" rail (3 most recent in same category, excluding current).
- Both routes are public (no auth), like `/courses/:slug`.

### Admin surface

- **`/admin/resources`** — list view: table of posts with status (draft/published), category, published date, last edited; New / Edit / Delete actions.
- **`/admin/resources/:id`** — editor: reuses the existing `RichTextEditor` (so you get the Google-Docs paste cleanup, image upload to `lesson-images`, headings, lists, etc.). Fields: title, slug (auto from title, editable), category, dek/excerpt, cover image, body, status (draft/published), published_at (defaults to first-publish time).
- Sidebar link added under existing Admin nav.

### SEO surface (per post)

- `<Helmet>` with title, description (from dek), self-canonical, og:title/description/url/type=article, og:image (cover).
- JSON-LD: `Article` (headline, author=Mike Peck `Person`, datePublished, dateModified, image) + `BreadcrumbList` (Home → Resources → Post).
- `/resources` index gets `CollectionPage` + `BreadcrumbList`.
- Sitemap generator extended to fetch all `published = true` posts and add `/resources/:slug` entries with `lastmod = updated_at`. `/resources` itself added as a static entry.
- `public/llms.txt` gets a "Resources" section that the generator populates from the DB (titles + URLs + one-line dek).

### Data model

```text
resources
  id              uuid PK
  slug            text unique
  title           text
  dek             text          -- short excerpt, used for description meta + card
  body_html       text          -- sanitized rich-text output
  cover_image_url text          -- nullable; from lesson-images bucket
  category        app_resource_category  -- enum
  status          text          -- 'draft' | 'published'
  published_at    timestamptz   -- set on first publish
  read_time_min   int           -- nullable; auto-computed on save
  author_name     text default 'Mike Peck'
  created_at, updated_at
```

Enum `app_resource_category`: `governance`, `strategy`, `classroom`, `leadership`. (Easy to extend later.)

RLS:
- `SELECT` to anon + authenticated where `status = 'published'`.
- All-access policy for admins via `has_role(auth.uid(), 'admin')`.
- GRANTs: SELECT to anon + authenticated; ALL to service_role; INSERT/UPDATE/DELETE to authenticated (gated by admin policy).

Canonical handling: every post self-canonicals to `/resources/:slug`. (You picked "site is the canonical source.") No `canonical_url` override column — we can add one later if you ever decide to syndicate inbound.

### Cross-linking

- Landing page: small "From the Resources" strip (3 most recent published) between Deliverables and Pricing. Optional — flag if you want it skipped on v1.
- Course public pages (`/courses/:slug`): a "Related reading" block pulling recent posts whose category matches the course's `audit_category` (loose mapping).

---

## 2. `EducationalOrganization` schema

Add `EducationalOrganization` JSON-LD to `index.html` alongside the existing `Organization` block. Same fields (name, url, logo, sameAs to LinkedIn) plus `description` framing LeaderForge as a K-12 leadership education provider. ~10 lines.

---

## 3. Meta description tuning

Targeted rewrite on six pages, working in the keyword set you've been targeting ("K-12 AI leadership", "district AI strategy", "AI governance for schools", "superintendent AI", "school district AI"). Each description ≤160 chars, action-oriented, specific:

- `/` (Index)
- `/courses` (catalog)
- `/courses/foundations`
- `/courses/fluency`
- `/courses/strategy`
- `/courses/action`

Also retighten `<title>` on the four course pages to lead with the keyword phrase rather than the course's marketing name (e.g. "K-12 AI Strategy Course — Chart the Course | LeaderForge").

---

## Technical details

- **Migration**: one migration creates the `app_resource_category` enum + `resources` table + GRANTs + RLS policies + `updated_at` trigger. No data backfill.
- **Read time**: server-side trigger or client-side compute on save (~200 wpm against stripped text). Doing it on save keeps it cheap; recompute on every update.
- **Sanitization**: reuse the existing DOMPurify wrapper used by lesson rendering (allows YouTube iframes, images, headings, lists, code).
- **Cover images**: upload through the existing image uploader into the `lesson-images` bucket (already public). Same path conventions.
- **Sitemap**: extend `scripts/generate-sitemap.ts` to also `SELECT slug, updated_at FROM resources WHERE status = 'published'`. The `predev`/`prebuild` hooks already run it.
- **`llms.txt`**: convert to a generated file (`scripts/generate-llms.ts`) wired into the same `predev`/`prebuild` hooks, so resource posts get appended automatically. Keeps the manual sections (instructor bio, courses, audit categories) as a template literal in the script.
- **Routes**: register `/resources`, `/resources/:slug`, `/admin/resources`, `/admin/resources/:id` in `src/App.tsx`. Admin routes wrapped in the existing `AdminProtectedRoute`.
- **JSON-LD authoring**: posts can carry inline `<script type="application/ld+json">` blocks in body content if needed for FAQs, but the page-level `Article` is auto-generated from row fields.
- **Caveats from prior context**: SSR isn't available on Lovable, so per-post `og:image` won't be picked up by non-JS social crawlers (LinkedIn/Slack/Facebook) — they'll fall back to the sitewide og:image. Googlebot + Bingbot + LLM crawlers execute JS and will see everything correctly. This is the same limitation we hit on course pages.

---

## What I'm not doing in this plan

- Comments, likes, newsletter signup, RSS feed. (Easy follow-ups if you want them.)
- Multi-author support. Author is hardcoded to Mike Peck.
- Scheduled publishing. Status is binary draft/published; `published_at` set when status flips to published.
- Canonical-URL override field for syndication. You picked self-canonical; we can add the column later in one migration without touching post data.

Want me to also seed 1–2 starter posts (e.g. a hello-world + one repurposed piece you paste in) as part of the build, or leave the table empty and you'll publish from the admin?
