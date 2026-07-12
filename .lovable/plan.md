
# Platform Operations Build — Payments, Email, Access Control

Scope: turn the site from a marketing/course-viewer into a real revenue-generating platform. Split into 4 phases so we can ship and test each before stacking the next.

---

## Phase 1 — Payment foundation (Stripe checkout for paid courses)

**Goal:** users can buy Command / Strategy / Implementation courses with a card. Foundations stays free.

Backend (Lovable Cloud + Stripe seamless):
1. Enable Stripe via `payments--enable_stripe_payments` (managed, no BYOK). Set full-compliance handling as default since it's US-based digital courses.
2. New tables:
   - `products` — one row per paid course, links `course_id` → Stripe product/price IDs, amount, currency.
   - `orders` — `id`, `user_id`, `course_id`, `stripe_session_id`, `amount_paid`, `status` (pending/paid/refunded), `receipt_url`, `coupon_code_used`, `created_at`.
3. Edge functions:
   - `create-checkout` — authenticated, takes `course_id` + optional `coupon_code`, returns Stripe Checkout URL.
   - `stripe-webhook` — verifies signature, on `checkout.session.completed` creates `orders` row + `enrollments` row + fires enrollment email.
4. UI:
   - `PublicCourse.tsx` — for paid courses, "Enroll Now" becomes "Buy — $X" opening Stripe Checkout. Free courses (Foundations) keep current flow.
   - New `/checkout/success?session_id=...` page — verifies order, shows receipt link, CTA to start course.
   - Guard: `CourseViewer` already checks enrollment, so gating happens automatically once `enrollments` row is written.

Copy: keep Foundations free everywhere. Add price display on `Courses.tsx` cards (already formats price — will just have real numbers).

**You'll need to do:** provide prices per paid course after Stripe is enabled; I'll create the products via `batch_create_product`.

---

## Phase 2 — Access control (coupon codes + magic-link invites)

Backend:
1. `coupon_codes` table — `code` (unique), `discount_type` ('percent'|'fixed'), `discount_value`, `course_id` (nullable = any paid course), `max_redemptions`, `redemptions_count`, `expires_at`, `created_by`, `active`.
2. `enrollment_invites` table — `id`, `email`, `course_id`, `token` (uuid), `status` ('pending'|'redeemed'|'expired'), `expires_at`, `created_by`, `redeemed_by_user_id`.
3. Edge functions:
   - `validate-coupon` — checks code, applies to Stripe session (`coupon` param); 100%-off codes skip Stripe entirely and enroll directly.
   - `create-invite` — admin-only, generates token, sends invite email with `/invite/:token` link.
   - `redeem-invite` — accepts token, requires auth (redirects to /auth if not logged in preserving token), enrolls user, marks redeemed.
4. Admin UI additions:
   - `/admin/coupons` — list + create form (code, % or $, course, max uses, expiry). Copy-to-clipboard.
   - `/admin/invites` — send single-email invite form + table of pending/redeemed.
5. Checkout UI: coupon input field on the Buy step; instant validate feedback.
6. New public route `/invite/:token` — validates + enrolls.

---

## Phase 3 — Automated emails

Prereq: `email_domain--setup_email_infra` (if not already), `scaffold_auth_email_templates`, `scaffold_transactional_email`. Uses Lovable Emails (no Resend/etc.).

Templates to build in Forge brand (Navy #0F172A, Gold #d4af37, Playfair headings, Inter body, white body bg):

1. **Auth emails** (branded via `scaffold_auth_email_templates`):
   - Signup confirmation
   - Password reset
   - Magic link
2. **Enrollment confirmation + receipt** (`enrollment-confirmation`):
   - Triggered by `stripe-webhook` after paid enrollment AND by free/coupon enrollment path.
   - Includes course title, amount paid ("$0.00 — comp" if coupon), Stripe receipt URL, "Start course" CTA to `/course/:slug`.
3. **District PO invoice acknowledgment** (`po-request-received`) — Phase 4.
4. **Course completion + certificate** (`course-completion`):
   - Triggered when `user_progress` shows all lessons complete for a course.
   - New edge function `issue-certificate` generates a signed PDF (name + course + date + Mike's signature block) into `certificates` storage bucket (private, signed URL).
   - Email links to certificate download.

Trigger wiring: DB trigger on `user_progress` completion → calls `issue-certificate` via `pg_net` → certificate row created → `send-transactional-email` invoked.

---

## Phase 4 — District PO / invoice purchase path

Backend:
1. `po_requests` table — `id`, `course_id`, `district_name`, `billing_contact_name`, `billing_contact_email`, `seats_requested`, `billing_address`, `notes`, `status` ('new'|'invoiced'|'paid'|'fulfilled'|'declined'), `admin_notes`, `invoice_url`, `created_at`.
2. `seat_grants` table — when admin marks PO paid, generates N single-use codes tied to that PO for staff redemption (reuses Phase 2 coupon/invite plumbing under the hood, or dedicated `seat_codes` table if cleaner — will use `enrollment_invites` extended with `po_request_id`).
3. Edge functions:
   - `submit-po-request` — public, rate-limited, sends acknowledgment email to buyer + notification email to Mike.
   - `fulfill-po-request` — admin, generates seat codes, emails buyer the redemption list + CSV.

UI:
1. On paid `PublicCourse.tsx`: "Purchasing for a district?" link → `/purchase-order/:slug` form.
2. `/purchase-order/:slug` — captures district info + seats, submits.
3. `/admin/po-requests` — inbox: list, view, update status, upload invoice PDF, trigger fulfillment.

---

## Sequencing & checkpoints

```text
Phase 1 (Stripe checkout)       → test with $1 product before real prices
   ↓
Phase 3a (auth + enrollment emails only)  → so buyers get receipts immediately
   ↓
Phase 2 (coupons + invites)     → now you can comp people cleanly
   ↓
Phase 3b (certificate email)    → after first paid students exist
   ↓
Phase 4 (district PO path)      → last; needs everything above
```

Rationale: don't take live money until receipts land in inboxes; don't build certificates until real completions happen; PO path piggybacks on invite plumbing so build it last.

---

## Additional operational suggestions (NOT in this plan — flag for later)

Not building these now, but noting so we don't paint into a corner:
- Abandoned-checkout recovery email (Stripe supports natively via Checkout — can flip on).
- Foundations → paid pathway drip (post-completion nurture email 3 days later).
- Waitlist → launch email (auto-notify `waitlist_leads` when a course flips to `is_published=true`).
- Admin revenue dashboard (revenue by course, coupon redemption stats, PO pipeline).
- Refund flow in admin (Stripe refund API + `orders.status='refunded'` + revoke enrollment).
- Invoice PDF (separate from Stripe receipt — needed for district reimbursement).

Say the word after Phase 4 and I'll fold any/all of these in.

---

## Confirm to start

If this shape looks right, approve and I'll begin **Phase 1 only**. I'll pause at the end of Phase 1 for you to test a real card before we move to Phase 2.
