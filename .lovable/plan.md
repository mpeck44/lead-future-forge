Add a Resources link to the footer for SEO discovery and navigation.

## What we'll change
- Update `src/components/Footer.tsx` to add a "Resources" link in the Quick Links column, above the existing About link.
- The link will use the existing `Link` component and route to `/resources`.

## Files modified
- `src/components/Footer.tsx`

## SEO impact
- Adds an internal link from every page to `/resources`, passing authority and helping Google discover the resource articles.
- Improves user navigation for visitors who want to browse articles.