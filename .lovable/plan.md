
# Pre-launch security review

Findings from scanning the live database, edge functions, and frontend, mapped to your 5 areas.

## 1. Privacy policy & data location

**Current state (verified):**
- `src/pages/PrivacyTerms.tsx` exists and is routed.
- User data lives in Lovable Cloud (Supabase, US region): `profiles`, `user_roles`, `orders`, `enrollments`, `audit_*`, `portfolio_items`, `waitlist_leads`, `client_error_logs`. Payment card data never touches your DB — Stripe handles it.

**Action:** I'll audit `PrivacyTerms.tsx` and update it to explicitly disclose:
- Data categories collected (name, email, role, district, audit responses, payment metadata from Stripe, portfolio uploads).
- Sub-processors: Stripe (payments), Lovable Cloud/Supabase (hosting + DB, US), Google Analytics.
- User rights (access, deletion via /profile, contact email `contact@peckeducation.com`).
- Cookie/analytics disclosure for the GA tag.
- Last-updated date + link in footer confirmed.

I will only add legally-defensible, app-visible facts — no compliance certification claims.

## 2. Row Level Security

**Verified via linter + direct DB inspection:**
- Every public table has RLS enabled with policies (no naked tables).
- 1 permissive-policy warning: `waitlist_leads` INSERT uses `WITH CHECK (true)` for anon. This is **intentional** (public lead capture) and is already fronted by SECURITY DEFINER RPC `upsert_waitlist_lead`. The direct INSERT policy is redundant.
- 8 SECURITY DEFINER function grant warnings. Review:
  - `has_role`, `get_audit_summary`, `upsert_waitlist_lead` — executable by `anon` (`has_role` and `get_audit_summary` don't need anon).
  - Admin functions correctly restricted to `authenticated` + gated by `has_role` check inside.

**Action (single migration):**
- Drop the redundant `Anyone can submit to waitlist` INSERT policy on `waitlist_leads` (keep the RPC path only).
- `REVOKE EXECUTE ... FROM anon` on `has_role` and `get_audit_summary` (keep `authenticated`).
- Leave `upsert_waitlist_lead` callable by anon (needed for public capture) and document in security memory.

## 3. Auth failure-path testing

**Action:** I'll drive Playwright against the running app to test:
- Wrong password 5x (verify no lockout bypass, error messaging).
- Password reset for non-existent email (should not enumerate).
- Signup with an existing email (already handled by `friendlyError`).
- Verification link re-click behavior.
- Empty/invalid inputs on all three forms (login, signup, magic link).

Fix any issues surfaced. Report a pass/fail matrix.

## 4. Security headers baseline

**Current state:** No custom headers (Lovable static hosting sets defaults; no meta CSP configured).

**Action:** Add a conservative baseline via `<meta>` tags in `index.html` where the platform allows (Referrer-Policy, X-Content-Type-Options equivalent via meta is limited — CSP via meta is the main lever). Add:
- `<meta http-equiv="Content-Security-Policy" ...>` scoped to allow Stripe, Supabase, Google Fonts, GA, self.
- `<meta name="referrer" content="strict-origin-when-cross-origin">`.
- Confirm `rel="noopener noreferrer"` on external links.

I will test CSP in report-only style first by verifying no breakage in checkout, GA, fonts, Supabase before enforcing.

## 5. OWASP quick review

**Verified:**
- **A03 Injection / XSS:** `src/lib/sanitize.ts` uses DOMPurify; `dangerouslySetInnerHTML` sites already sanitized. Zod validation on Auth inputs. Supabase parameterized queries throughout.
- **A01 Broken access control:** RBAC via `user_roles` + `has_role` SECURITY DEFINER (correct pattern). `AdminProtectedRoute` gates admin UI.
- **A02 Crypto failures:** HIBP password check — need to verify it's enabled.
- **A07 Auth failures:** Password min 6 chars — weak vs OWASP recommendation (8+).
- **A09 Logging:** `client_error_logs` in place.

**Action:**
- Enable `password_hibp_enabled: true` via `configure_auth`.
- Bump min password to 8 chars in `Auth.tsx` zod schema (matches helper text already shown).
- Sweep for any remaining `dangerouslySetInnerHTML` without DOMPurify.
- Verify edge functions (`create-checkout`, `delete-user`, `log-client-error`, `export-course`, `payments-webhook`) validate JWT / signatures correctly.

## Deliverable

One combined pass:
1. DB migration (RLS + function grants cleanup).
2. `configure_auth` for HIBP + stronger password rule.
3. `index.html` header additions.
4. `PrivacyTerms.tsx` refresh.
5. Playwright auth failure-path run + fixes.
6. Update `mem://security-memory` documenting intentional public paths (waitlist RPC, published courses).

## Technical notes

- CSP tuning: needs `connect-src` for `*.supabase.co`, `api.stripe.com`, `www.google-analytics.com`; `frame-src` for `js.stripe.com`, `hooks.stripe.com`; `script-src` allowing Stripe, GA, and Lovable badge.
- No Sentry — you use custom `logClientError` → `log-client-error` edge fn → `client_error_logs`. Keep as-is.
