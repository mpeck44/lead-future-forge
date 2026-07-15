## Founder Cohort Bundle Discount — $158 through Labor Day 2026

**Offer:** Bundle drops from $197 → **$158** until end of day **Monday, September 7, 2026 (Eastern Time)**. Individual courses stay at $79. After the cutoff, the bundle auto-flips back to $197 with no code change.

### 1. Shared cutoff + price logic

Create `src/lib/founderDiscount.ts` (mirrored in `supabase/functions/_shared/founderDiscount.ts`) exporting:
- `FOUNDER_CUTOFF_ISO = "2026-09-08T03:59:59Z"` (11:59pm ET on Sept 7)
- `FOUNDER_BUNDLE_CENTS = 15800`, `REGULAR_BUNDLE_CENTS = 19700`
- `isFounderActive(now = new Date())` → boolean
- `getBundlePriceCents()` → 15800 or 19700

### 2. Stripe

Add a second Stripe price on the existing bundle product at **$158** with lookup key `course_bundle_founder`. Update `supabase/functions/_shared/bundles.ts` so `getBundle("complete_path")` returns the founder lookup key + $158 when `isFounderActive()` is true, else the existing `course_bundle_onetime` + $197. The create-checkout function already resolves prices by lookup key — no other server change.

### 3. Client price display (all four locations currently showing $197)

Replace hardcoded `$197` / `19700` with `getBundlePriceCents()` and show a strikethrough `$197` next to the active price when the founder window is open, plus a small "Founder cohort — ends Sept 7" ribbon/label:

- `src/pages/Courses.tsx` — navy bundle card (main CTA area)
- `src/components/landing/DoorsSection.tsx` — "save $40" copy needs to become "save $79" while active
- `src/components/landing/PricingWaitlist.tsx` — bundle mention if present
- `src/components/landing/StickyBuyBar.tsx` — sticky bar price
- `src/lib/bundles.ts` — `COMPLETE_PATH.priceCents` sourced from helper; `tagline` swaps to "Founder cohort pricing — save $79 through Sept 7" while active

Also scan for any other `$197` / `197` / `19700` literals (FAQ, hero, llms.txt, sitemap description) and route them through the helper or update copy.

### 4. Countdown affordance (light)

On the `/courses` bundle card only, render a single line beneath the price: **"Founder pricing ends Monday, Sept 7 · save $39"**. No live countdown timer — just the date, to avoid over-engineering.

### 5. Auto-flip behavior

After Sept 7 11:59pm ET:
- Helper returns false → all UI reverts to $197 and drops the ribbon
- Server resolves `course_bundle_onetime` again → checkout charges $197
- No deploy required at the cutoff

### Technical notes

- The `FOUNDER_CUTOFF_ISO` constant lives in one file, re-exported to both the client lib and the edge function shared folder (two files, same value) since the client and Deno function can't share source directly.
- Existing orders/webhook code is untouched — the webhook already trusts the Stripe price the customer actually paid.
- Test mode: create the $158 price in Stripe sandbox first; production price syncs on publish.

### Files touched

- `src/lib/founderDiscount.ts` (new)
- `supabase/functions/_shared/founderDiscount.ts` (new)
- `supabase/functions/_shared/bundles.ts`
- `src/lib/bundles.ts`
- `src/pages/Courses.tsx`
- `src/components/landing/DoorsSection.tsx`
- `src/components/landing/PricingWaitlist.tsx`
- `src/components/landing/StickyBuyBar.tsx`
- `public/llms.txt` (pricing mention)
- Stripe: one new price via `payments--create_price`
