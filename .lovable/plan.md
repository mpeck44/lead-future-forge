## What Semrush found (US database)

Your current ranking query "district leadership strategy for ai" only has ~10 searches/mo — real, but tiny. The good news: several **sibling phrases in the same cluster** have real volume and low difficulty, meaning a new site like yours can realistically compete.

### The target cluster

| Keyword | Volume/mo | Difficulty | Why it matters |
|---|---|---|---|
| ai for principals | 90 | 2/100 very easy | High-intent, matches your audience exactly |
| school district ai policy | 70 | 24/100 easy | Direct match to Mike's governance work |
| ai policy for schools | 70 | 31/100 possible | Same intent, broader phrasing |
| ai for school administrators | 70 | 4/100 very easy | Wide-open |
| ai professional development for teachers | 70 | 32/100 possible | Adjacent to your courses |
| ai in schools | 2,900 | (competitive) | Aspirational — use as supporting phrase |
| ai in k-12 education | 170 | 56/100 difficult | Long-term |

Combined, this cluster has ~500+ monthly searches with mostly single/low-double-digit difficulty scores — very reachable for a new authoritative site.

### The insight

Google is already showing you (position 38) for a low-volume phrase. To grow, we need pages built specifically for the higher-value sibling phrases, using consistent terminology so Google sees you as a topical authority on **K-12 AI leadership, policy, and district strategy** — not just one accidental phrase.

---

## The plan

### 1. Optimize the homepage (`/`) for the cluster

Rewrite title, meta description, H1, and hero subhead to naturally include:
- "K-12 AI leadership"
- "district AI strategy"
- "school AI policy"
- "for superintendents, principals, and directors of technology"

Keep Mike's voice. No keyword stuffing — the goal is that these phrases appear once each in prominent semantic locations.

### 2. Optimize `/resources` landing page

Update title/meta/H1 and intro to target "school district AI policy" and "AI for school administrators" as secondary phrases. Currently the H1 is just "Resources" — too generic to rank.

### 3. Draft 3 new resource articles (highest-ROI targets)

Each targets one low-difficulty, higher-volume keyword:

- **"AI for Principals: A Practical Playbook"** → targets *ai for principals* (KD 2, vol 90)
- **"How to Write a School District AI Policy"** → targets *school district ai policy* (KD 24, vol 70) + *ai policy for schools*
- **"AI for School Administrators: What to Do First"** → targets *ai for school administrators* (KD 4, vol 70)

Mike drafts the content; I scaffold the resource records (title, dek, slug, category, cover placeholder, publish-ready structure) and can insert them via the admin flow, or draft the copy from his outlines.

### 4. Internal linking

- Homepage → link to each of the 3 new articles by their target phrase
- `/courses` pages → link to the article most relevant to each course path
- Each new article → link to the relevant course

Internal links pass authority and tell Google these phrases are important on your site.

### 5. Re-run the SEO scan after changes

Confirm titles/descriptions/schema are healthy on updated pages before requesting re-indexing in Search Console.

---

## Technical details

- Homepage copy lives in `src/components/landing/HeroV2.tsx` and `src/pages/Index.tsx` (Helmet block)
- Resources landing metadata is in `src/pages/Resources.tsx` (title, description, H1, intro paragraph)
- New articles are Supabase `resources` rows — I'll draft them as SQL inserts (or via the admin UI). Sitemap picks them up automatically on next build via `scripts/generate-sitemap.ts`
- Internal links: minor edits to `Footer.tsx`, `Hero.tsx`, and the course page components

---

## What I need from you

1. Approve this plan and I'll start with **step 1 (homepage) + step 2 (/resources landing)** — those ship in one pass and don't require you writing new content
2. For step 3, do you want me to (a) draft full first-pass article copy for you to edit, or (b) scaffold empty publish-ready records so you can write them in the admin?

Once approved, expected turnaround: steps 1–2 same session, step 4 same session, step 3 depends on your answer above.