## Diagnosis

Both files are live and return HTTP 200 — no code fix is needed:

- `https://edleaderforge.com/sitemap.xml` → 200 OK
- `https://edleaderforge.com/llms.txt` → 200 OK
- `https://edleaderforge.com/robots.txt` → 200 OK (already references the sitemap)

The 404 is the same property-mismatch pattern we hit before. Google fetches the sitemap **relative to the Search Console property it was submitted under**. If you submitted it under the `www.edleaderforge.com` property (or the old `lead-future-forge.lovable.app` property), Google tries to fetch from that host. `www.edleaderforge.com/sitemap.xml` 302-redirects to the apex — and Search Console treats cross-host redirects on a sitemap URL as inaccessible (effectively a 404 in its UI).

A quick note on naming: the files are `sitemap.xml` and `llms.txt` (not `.xml`). There is no `llms.xml` and no `robots.xml` — those exact names would 404.

## Fix (no code changes)

1. In Search Console, open the **`https://edleaderforge.com`** property (the apex, URL‑prefix property — not the `www` one and not the old `lovable.app` one).
2. Go to **Sitemaps**, remove any failing entries pointing at the wrong host.
3. Submit just the path: `sitemap.xml`
4. Optional: if you also want LLM discoverability tools that read `llms.txt` to find it via Search Console, no submission is needed — `llms.txt` isn't a sitemap format, so don't submit it as one. It's already linked from the site and live at `/llms.txt`.
5. If you want both `edleaderforge.com` and `www.edleaderforge.com` tracked, add a separate property for `www` and either submit a sitemap whose URLs use the `www` host, or just rely on the 301/302 redirect to apex and don't submit a sitemap under `www`.

## Optional verification

After resubmitting, click "See index coverage" in Search Console. Status should move from "Couldn't fetch" to "Success" within a few minutes to a few hours.