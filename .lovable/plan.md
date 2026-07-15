## Fix tax codes + switch to full compliance handling (+3.5%)

### Part A — Fix misclassified tax codes

All four Stripe products (Fluency, Strategy, Action, and the `course_bundle` bundle) were created with `txcd_10502000` = **Gift Card**, which is why Stripe marks them "Ineligible for Managed Payments" and would tax them as stored-value cards.

**Correct code:** `txcd_10000000` — "General — Electronically Supplied Services." Standard Stripe classification for digital / downloadable / streamed content including online courses. Eligible for managed payments; taxed correctly across the ~80 supported buyer countries.

**How I'll update them:**

1. Create a one-off edge function `admin-fix-tax-codes` (Deno, uses the shared `createStripeClient`). It:
   - Lists Stripe products via `stripe.products.list({ limit: 100 })`.
   - Filters to the four we care about by matching name against `["Fluency", "Strategy", "Action", "Complete Path"]`.
   - Calls `stripe.products.update(id, { tax_code: "txcd_10000000" })` on each.
   - Returns a JSON summary of what it updated.
   - Requires `Authorization: Bearer <service key>` — protected, not user-facing.
2. Invoke the function once from the Supabase Studio "Invoke" panel (or via curl) with sandbox env, verify the 4 updates, then again with live env once you publish.
3. Delete the function after both environments are done. Nothing in the app calls it.

Alternative if you'd rather do it by hand: I list the 4 product IDs, you update tax_code in the Stripe dashboard (Products → each product → Edit → Product tax code → `txcd_10000000`). Same result.

### Part B — Switch checkout to full compliance handling

Once products are eligible, flip `supabase/functions/create-checkout/index.ts`:

- Remove `automatic_tax: { enabled: true }` from the `checkout.sessions.create` call.
- Add `managed_payments: { enabled: true }` (cast the params object to `Stripe.Checkout.SessionCreateParams` to avoid the SDK type error, per the dahlia preview API).
- Add `customer_country` to session metadata (best-effort; leave empty string if unknown — no client change required for the initial rollout).
- Set `metadata.managed_payments = "true"`.

Buyer impact: on the Stripe-hosted portion of the embedded checkout, the bank-statement descriptor becomes `LINK.COM* Ed Leader Forge` (or your configured descriptor), and the payment terms footer appears. Fee is +3.5% per transaction; in exchange Stripe handles tax filing/remittance in ~80 countries, fraud, disputes, and transaction-level customer support.

For buyers in Stripe's unsupported destinations (JP, MX, SG), Stripe still processes the payment and calculates tax; you'd handle domestic filing there. In practice for a K-12 US-facing product this is a non-issue.

### Rollout order

1. Ship + run `admin-fix-tax-codes` in sandbox → verify eligibility flips to "Eligible" in all 4 products.
2. Ship the checkout switch to `managed_payments`.
3. Test a sandbox purchase end to end (bundle + one individual course) to confirm the session opens and completes.
4. On publish / live go-live, run the same admin function against live and confirm.
5. Delete `admin-fix-tax-codes`.

### Files touched

- `supabase/functions/admin-fix-tax-codes/index.ts` (new, temporary)
- `supabase/functions/create-checkout/index.ts` (tax mode swap)

No client-side changes. No pricing changes. No DB changes.
