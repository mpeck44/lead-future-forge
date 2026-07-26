# Security Hardening — Items 6–11

Applying your answers: no CAPTCHA, add in-memory rate limits, delete `admin-fix-tax-codes`.

## 6. Server-side validation on every endpoint

- Add `zod` schemas to every edge function that reads a request body: `create-checkout`, `log-client-error`, `delete-user`, `export-course`, `payments-webhook` (query param `env`).
- On validation failure return `400` with a generic `"Invalid request"` message; keep field-level detail in server logs only.
- Keep existing client-side validation for UX; treat it as untrusted.

## 7. Credential / sensitive data leak sweep

- **Frontend `.env`**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_PAYMENTS_CLIENT_TOKEN` — all public-safe. Document in security memory so scans don't re-flag.
- **API responses**: admin RPCs return PII but are gated by `has_role('admin')`. `create-checkout` / `payments-webhook` only return `clientSecret` / status. OK.
- **Logs**: replace `console.error("... error:", e.message)` in edge functions with a structured log that keeps stack server-side and returns a generic message with a `request_id` (see item 11).
- **`log-client-error`**: cap `context` object size and scrub obvious secret patterns (`sk_`, `Bearer `, JWT `eyJ` prefix) before insert.

## 8. No API keys in the frontend

- Confirmed clean: no service role key, Stripe secret, or `LOVABLE_API_KEY` in `src/`. All privileged calls proxy through edge functions.
- Add a header comment in `src/lib/stripe.ts` reminding future edits to keep secret keys server-side only.
- **Delete `supabase/functions/admin-fix-tax-codes/`** — the function has no auth check and is no longer needed.

## 9. Rate limits on paid-API endpoints (in-memory)

Reuse the small IP+user limiter pattern from `log-client-error`, extracted to `_shared/rateLimit.ts`. Applied caps:

- `create-checkout`: 10 / min / user.
- `delete-user`: 3 / min / user.
- `export-course`: 20 / min / IP (already key-gated, this is belt-and-suspenders).
- `log-client-error`: keep existing 30 / min / IP.
- `payments-webhook`: no limit (Stripe-signed).

Tradeoff noted: limits are per-instance and reset on cold start. Enough to stop a runaway client loop, not a distributed attacker.

## 10. CORS lockdown (no CAPTCHA)

- Extract `_shared/cors.ts` with an allow-list: `https://edleaderforge.com`, `https://www.edleaderforge.com`, `https://lead-future-forge.lovable.app`, and the Lovable preview origin (`*.lovable.app`).
- Replace `Access-Control-Allow-Origin: *` in `create-checkout`, `log-client-error`, `export-course`, `payments-webhook` with the allow-list. Requests from other origins get a 403.
- `delete-user` already allow-lists — align it with the shared helper.

## 11. Safe error messages

- Small mapper in `_shared/validation.ts`: known validation errors → friendly message; everything else → `"Something went wrong. Please try again."` with a generated `request_id`.
- Server-side: keep `console.error` with full stack + `request_id` so `/admin/errors` stays useful.
- Frontend audit: `Auth.tsx`, `CheckoutModal.tsx`, `Profile.tsx` — ensure no raw Postgres / Stripe strings leak into toasts/banners; fall back to the generic message when the edge function returns one.

## Files touched

```text
supabase/functions/_shared/
  cors.ts          (new)
  validation.ts    (new — zod + safe-error mapper)
  rateLimit.ts     (new)
supabase/functions/create-checkout/index.ts
supabase/functions/delete-user/index.ts
supabase/functions/export-course/index.ts
supabase/functions/log-client-error/index.ts
supabase/functions/payments-webhook/index.ts
supabase/functions/admin-fix-tax-codes/   (deleted)
src/pages/Auth.tsx                (generic error fallback)
src/components/CheckoutModal.tsx  (generic error fallback)
src/lib/stripe.ts                 (comment)
```

No DB migrations required.
