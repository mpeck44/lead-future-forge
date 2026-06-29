// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Pulls published course slugs from Supabase so the sitemap stays in sync with the catalog.

import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://lead-future-forge.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Static public routes (admin/dashboard/profile are intentionally excluded — gated by auth)
const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/courses", changefreq: "weekly", priority: "0.9" },
  { path: "/auth", changefreq: "monthly", priority: "0.3" },
];

function loadEnv(): Record<string, string> {
  const envPath = resolve(".env");
  if (!existsSync(envPath)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function fetchPublishedCourseSlugs(): Promise<string[]> {
  const env = { ...loadEnv(), ...process.env } as Record<string, string>;
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[sitemap] Supabase env not found — skipping course slugs.");
    return [];
  }
  try {
    const res = await fetch(`${url}/rest/v1/courses?select=slug,updated_at&is_published=eq.true`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.warn(`[sitemap] Supabase fetch failed: ${res.status}`);
      return [];
    }
    const rows = (await res.json()) as Array<{ slug: string; updated_at?: string }>;
    return rows.map((r) => r.slug).filter(Boolean);
  } catch (err) {
    console.warn("[sitemap] Course fetch error:", err);
    return [];
  }
}

function buildXml(entries: SitemapEntry[]): string {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

(async () => {
  const slugs = await fetchPublishedCourseSlugs();
  // Course detail pages are auth-gated; we don't emit /course/:slug for crawlers.
  // Course slugs are still surfaced through /courses (CollectionPage ItemList JSON-LD).
  void slugs;
  const xml = buildXml(staticEntries);
  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`sitemap.xml written (${staticEntries.length} entries)`);
})();
