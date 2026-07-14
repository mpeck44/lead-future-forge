
# Consolidate purchase on `/courses`, retire `/bundle`

Goal: `/courses` is the single "where to buy" page. Every gold CTA in the app funnels there. `/bundle` goes away; its Stripe checkout moves into a modal on `/courses`. Individual paid checkout stays where it already works (the per-course public page), and the catalog's card buttons route the buyer to the right surface without silently free-enrolling paid courses.

## 1. Reroute every gold CTA to `/courses`

| Where | Before | After |
| --- | --- | --- |
| `Header.tsx` — landing header (desktop + mobile) | "Get the bundle" → `/bundle` | "Get the bundle" → `/courses` |
| `Header.tsx` — app header (desktop + mobile) | "Get the bundle" → `/bundle` | "Get the bundle" → `/courses` |
| `HeroV2.tsx` — hero secondary CTA | "See courses and pricing" → scrolls to `#doors` | "See courses and pricing →" → `/courses` |
| `DoorsSection.tsx` — each door card body | `/courses/{slug}` (per-course marketing page) | `/courses#{slug}` (jumps to that card on catalog) |
| `DoorsSection.tsx` — audit footer link | Opens waitlist modal via `onAudit` | `/courses/foundations` (public course page for the free Foundations course; audit is the readiness lesson inside it) |
| `StickyBuyBar.tsx` | "Buy the bundle" → `/bundle` | "Buy the bundle" → `/courses#bundle` |
| `PublicCourse.tsx` — bundle upsell link (line 374) | `/bundle` | `/courses#bundle` |

Labels stay as-is per your call ("Get the bundle" keeps its wording; navy bundle card is the first thing anyone sees on `/courses`, so the label reads correctly the moment they land).

Each catalog card gets an `id={course.slug}` so `#fluency`, `#strategy`, `#action`, `#foundations` deep-link cleanly, plus the navy bundle card gets `id="bundle"`. `scroll-mt-24` on each so anchors don't hide behind the fixed header.

## 2. Move bundle checkout onto `/courses`, retire `/bundle`

The navy bundle card's primary "Get the bundle" button today links to `/bundle`. Rewire it to open a Stripe embedded checkout modal inline on `/courses`, using the exact same flow `BundleCheckout.tsx` uses today (`StripeEmbeddedCheckoutView` with `bundleKey={COMPLETE_PATH.key}`). Includes the same guards:

- If not signed in → `navigate("/auth?redirect=/courses")`.
- If `!paymentsConfigured()` → toast that payments aren't live yet.
- If the user already owns any of Fluency/Strategy/Action → toast telling them to buy the remaining ones individually (same message as today).
- On success, Stripe returns to `/checkout/return?session_id={CHECKOUT_SESSION_ID}` — unchanged, already handled by `CheckoutReturn.tsx`.

Then:

- Delete `src/pages/BundleCheckout.tsx`.
- Remove the `/bundle` route from `src/App.tsx` and its import.
- The `bundle_key` field on `orders`, the `create-checkout` edge function's bundle branch, `supabase/functions/_shared/bundles.ts`, and `src/lib/bundles.ts` all stay — checkout still uses them, the URL surface is what's going away.
- Add a small redirect: hitting `/bundle` should send the user to `/courses#bundle` so any stale bookmark/email link still lands. Simplest way in React Router: add a `<Route path="/bundle" element={<Navigate to="/courses#bundle" replace />} />` entry.

## 3. Individual paid enrollment — stop silently free-enrolling paid courses

Today `Courses.tsx#handleEnroll` inserts an enrollment row with `amount_paid: 0`. That's fine for Foundations (free), but for the three paid courses it hands out a free enrollment on click. Since we're consolidating purchase on `/courses`, fix this in the same pass:

- **Foundations card (`price === 0`)** — button stays "Enroll for free", keeps current `handleEnroll` behavior.
- **Paid course cards (Fluency, Strategy, Action)** — button becomes "Buy $79" and opens a Stripe modal on `/courses` (same modal pattern as the bundle, just with `courseId` instead of `bundleKey` — `StripeEmbeddedCheckoutView` already supports both).
- "View course details" secondary button stays as-is (routes to `/courses/{slug}` for buyers who want the full pitch first).
- Signed-out click on any paid Buy button → `navigate("/auth?redirect=/courses#{slug}")`.

Net effect: `/courses` handles both bundle and individual purchase. Per-course marketing pages (`/courses/{slug}`) stay reachable via "View course details" but are no longer required for checkout.

## 4. Detail tightening on `/courses` so buyers know what they're buying

Since `/courses` is now the full purchase surface, add just enough on-card detail that a buyer doesn't need to click through to decide:

- Move the current per-slug `deliverable` copy (already added last turn) to a small "You'll leave with" block on each card, one bullet, bold + one-line explainer, rather than the current single sentence squeezed into the description group. Keeps card height similar; increases scanability.
- On the navy bundle card, keep the three bullets as-is (Fluency / Strategy / Action deliverables).
- Add a one-line "30-day refund" reassurance under the Buy button on each paid card and the bundle card. (Confirm the refund policy first — if you don't have one, drop this bullet.)

Not in this plan: expanding cards into full landing-page pitches. If a buyer wants deeper detail, "View course details" is still there.

## 5. Files touched

```text
src/components/Header.tsx                    4 button targets → /courses
src/components/landing/HeroV2.tsx            secondary CTA → /courses (was #doors)
src/components/landing/DoorsSection.tsx      card links → /courses#{slug}; audit link → /courses/foundations
src/components/landing/StickyBuyBar.tsx      → /courses#bundle
src/pages/PublicCourse.tsx                   /bundle link → /courses#bundle
src/pages/Courses.tsx                        add id anchors on cards; bundle modal;
                                             individual paid Buy → Stripe modal;
                                             refund line under Buy buttons (if kept)
src/App.tsx                                  remove BundleCheckout import + route;
                                             add <Navigate> redirect for /bundle → /courses#bundle
src/pages/BundleCheckout.tsx                 DELETE
```

Untouched: edge functions, `orders` table, `bundles.ts` config, Stripe products, `CheckoutReturn.tsx`, auth flow.

## Verification once built

- Every gold button in the app lands on `/courses` (or the modal on it).
- Clicking "Get the bundle" on `/courses` opens the Stripe checkout without a page navigation.
- Visiting `/bundle` directly redirects to `/courses#bundle`.
- Clicking "Buy $79" on a paid card as a signed-in user with `paymentsConfigured()` opens Stripe for that course.
- Signed-out Buy click routes to `/auth?redirect=/courses#{slug}` and lands back on the correct card after login.

## Open question / needs your call

**Refund line:** do you have a stated refund policy (e.g. 30-day money-back) you want on each Buy button? If not, I'll skip it — an unbacked reassurance is worse than none.

## Out of scope

- Founder pricing / Labor Day deadline (still parked from the last decision).
- Rewriting the per-course marketing pages (`/courses/{slug}`) — they stay as the "read more" surface.
- Any change to the Stripe product/price setup.

