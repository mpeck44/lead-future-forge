Plan: Add a combined Privacy Policy & Terms of Service page

Goal: Publish the user's provided Privacy Policy and Terms of Service on a single public page at /privacy-terms, link it from the footer, and make it crawlable.

Changes to make

1. New public page: src/pages/PrivacyTerms.tsx
   - Route: /privacy-terms
   - Use the exact copy provided by the user for both Privacy Policy and Terms of Service.
   - Replace the placeholder [your email address] with contact@peckeducation.com (user confirmed).
   - Structure the page with two semantic <article> sections: "Privacy Policy" and "Terms of Service", each with id anchors (#privacy-policy, #terms-of-service).
   - Add a small sticky/in-page table of contents so users can jump between the two documents.
   - Render lists as semantic <ul> / <ol> items using JSX (no dangerouslySetInnerHTML).
   - Use existing design tokens (font-display, font-body, bg-background, text-foreground, text-muted-foreground, etc.) and match the Courses page public layout: Header + main content + FooterV2.
   - Add Helmet SEO: title, description, canonical, og:url, og:title, og:description, and WebPage JSON-LD pointing to https://edleaderforge.com/privacy-terms.

2. Routing: src/App.tsx
   - Add a public route: <Route path="/privacy-terms" element={<PrivacyTerms />} /> above the catch-all route.

3. Footer link: src/components/landing/FooterV2.tsx
   - Add a "Privacy & Terms" link in the footer link list pointing to /privacy-terms.
   - Also add a matching link in the legacy src/components/Footer.tsx if it is still used on other public routes.

4. Sitemap: scripts/generate-sitemap.ts
   - Add { path: "/privacy-terms", changefreq: "yearly", priority: "0.3" } to staticEntries so the page is discoverable by crawlers.

5. Verification
   - Run the build/typecheck to ensure no TS/JS errors.
   - Check that the route renders correctly at /privacy-terms and that footer links navigate there.
   - Confirm the sitemap generator still completes and public/sitemap.xml is updated.

Out of scope
   - No backend changes (no tables, no RLS, no RPC).
   - No legal review of the provided copy; the user's supplied text will be used verbatim.
   - No new navigation bar links unless asked.

Estimated size: small/medium — one new page + two footer tweaks + one route + one sitemap entry.