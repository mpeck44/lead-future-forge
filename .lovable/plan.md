## Bundle checkout — $197 for all three paid courses

### Scope
Add a "Complete Path — $197" bundle that enrolls the buyer in Fluency, Strategy, and Action in a single Stripe checkout. Reuses the existing embedded checkout + webhook plumbing.

### 1. Stripe product
- Register a new product via the Payments tool:
  - `product_id: course_bundle`, `price_id: course_bundle_onetime`, amount `19700 usd`
  - `tax_code: txcd_10000000` (matches individual courses)
  - Syncs to live automatically on next publish.

### 2. Database
Small schema tweak so orders can represent a bundle (which has no single `course_id`):

```sql
ALTER TABLE public.orders ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE public.orders ADD COLUMN bundle_key text;
ALTER TABLE public.orders ADD CONSTRAINT orders_course_or_bundle
  CHECK (course_id IS NOT NULL OR bundle_key IS NOT NULL);
```

No new products/bundles table — the bundle definition (lookup key + course slugs) lives in one shared constants file used by the edge function and the client.

### 3. Edge function: `create-checkout`
Extend the existing function to accept either `{ courseId }` or `{ bundleKey: "complete_path" }`:
- For bundle: skip the products-table lookup, resolve the Stripe price via `lookup_keys: ["course_bundle_onetime"]`, look up the three course IDs from `courses` by slug, and reject if the user already has an active enrollment in any of them.
- Pass `metadata.bundleKey` on the Session (and no `courseId`).
- Insert an `orders` row with `bundle_key = "complete_path"`, `course_id = NULL`, amount `19700`.

### 4. Edge function: `payments-webhook`
In `handleCheckoutCompleted`, if `session.metadata.bundleKey` is present:
- Upsert three `enrollments` rows (one per course in the bundle), splitting `amount_total` evenly for `amount_paid` bookkeeping.
- Update the `orders` row to `paid` as today (matched by `stripe_session_id`).

### 5. Frontend
- New route `/bundle` → `BundleCheckout.tsx`: marketing blurb, "$197 — save $40 vs. buying separately", and the embedded checkout mounted via `StripeEmbeddedCheckoutView`.
- Extend `StripeEmbeddedCheckoutView` props to accept `bundleKey` as an alternative to `courseId` and forward it to the edge function.
- Add a "Get the complete path — $197" card to `Courses.tsx` and a secondary CTA row on each paid `PublicCourse` page linking to `/bundle`.
- `CheckoutReturn.tsx`: when the order has `bundle_key` and no single course, show "You're enrolled in all three courses" with a link to `/my-courses` instead of a single "Start the course" button.

### 6. Test plan
- Buy bundle with `4242 4242 4242 4242` in sandbox → return page shows all-three success → three `enrollments` rows created → `orders.status = paid`.
- Attempting to buy the bundle while already enrolled in any of the three is rejected with a clear message.
- Individual $79 checkout still works unchanged.

### Technical notes
- Bundle config module: `supabase/functions/_shared/bundles.ts` (edge) + `src/lib/bundles.ts` (client) — same `{ key, lookupKey, courseSlugs, priceCents }` shape.
- No changes to `products` table; the bundle is intentionally not represented there since its `course_id` is 1-to-many.
- Discount math: 3 × $79 = $237, bundle $197 → save $40. Used in copy only.
