## Goal
Switch the site's canonical SEO identity from `lead-future-forge.lovable.app` to the newly acquired `edleaderforge.com`, so Google, Bing, and LLM crawlers attribute everything to the real domain.

## What needs to change

### 1. Replace hardcoded URLs (sitewide find/replace)
Update every occurrence of `https://lead-future-forge.lovable.app` → `https://edleaderforge.com` in:
- `index.html` (sitewide OG tags, JSON-LD for Organization / WebSite / EducationalOrganization)
- `public/robots.txt` (Sitemap directive)
- `public/sitemap.xml` (all `<loc>` entries)
- `public/llms.txt` (all referenced URLs)
- `scripts/generate-sitemap.ts` (`BASE_URL` constant — so future regenerations stay on the new domain)
- `src/pages/Index.tsx` (canonical, og:url, og:image, Person JSON-LD worksFor)
- `src/pages/Courses.tsx` (canonical / og)
- `src/pages/PublicCourse.tsx` (canonical / og / JSON-LD)
- `src/pages/Resources.tsx` (canonical / og / CollectionPage JSON-LD)
- `src/pages/ResourceDetail.tsx` (`SITE_URL` constant — drives canonical, og:url, Article + Breadcrumb JSON-LD)
- `supabase/functions/delete-user/index.ts` (only if it references the URL in a non-cosmetic way — will confirm before editing)

### 2. Redirect strategy (`www` + old Lovable subdomain)
- Designate `edleaderforge.com` as the **Primary** domain in Lovable Project Settings → Domains.
- Add `www.edleaderforge.com` as a connected domain so it redirects to the apex.
- Leave `lead-future-forge.lovable.app` connected for now; once the new domain is Active, Google will see the 301-equivalent canonical signal and reattribute. We don't unpublish it — it stays as a soft fallback for any existing inbound links.

### 3. Regenerate sitemap
Run the sitemap generator (auto-runs on `predev`/`prebuild`) so `public/sitemap.xml` is rewritten against the new `BASE_URL`.

### 4. Post-deploy SEO hygiene (manual, user-side)
After publish:
- In **Google Search Console**: add `edleaderforge.com` as a new property, verify, and submit `https://edleaderforge.com/sitemap.xml`. Optionally use the Change of Address tool from the old Lovable property to the new domain.
- In **Bing Webmaster Tools**: same — add the new site and submit the sitemap.
- Re-share any LinkedIn / social posts that previewed the old URL so platforms refresh their cached OG image against the new canonical.

## What's intentionally NOT changing
- Brand copy, design tokens, course content — domain swap only.
- Supabase project URL / anon key (those are infra, not user-facing SEO).
- Per-route Helmet structure — only the literal hostname inside the strings.

## Things to confirm before I implement
1. Confirm `edleaderforge.com` (apex, no `www`) is the canonical form you want. I'll set every canonical/og:url to the bare apex.
2. OK to leave `lead-future-forge.lovable.app` published as a fallback (recommended for ~30–60 days while Google reattributes), or do you want me to note that you'll unpublish it later?