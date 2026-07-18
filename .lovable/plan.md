# Plan: Mobile menu a11y + lightweight client error logging

## 1. Mobile menu a11y (small fix)

The hamburger button already toggles the mobile panel — it isn't dead. But it's missing ARIA state, so add:

- `type="button"`, `aria-expanded={isMenuOpen}`, `aria-controls="mobile-menu"` on both toggle buttons in `src/components/Header.tsx`.
- `id="mobile-menu"` on both mobile panel `<div>`s.

## 2. Lightweight client error logger

No Sentry. Errors flow: browser → edge function → DB table → admin page.

### Database (migration)

New table `public.client_error_logs`:
- `id uuid pk`, `created_at timestamptz default now()`
- `user_id uuid null` (nullable — errors can happen logged-out)
- `message text not null`
- `stack text null`
- `source text null` (file/line if available)
- `url text null`
- `user_agent text null`
- `kind text not null` ('error' | 'unhandledrejection' | 'manual')
- `context jsonb null`

Order: CREATE TABLE → GRANTs → ENABLE RLS → POLICIES.
- `GRANT ALL ON public.client_error_logs TO service_role;`
- `GRANT SELECT ON public.client_error_logs TO authenticated;` (admin read gated by RLS)
- Policy: admins can SELECT via `has_role(auth.uid(), 'admin')`. No insert policy — writes come from the edge function using the service role, which bypasses RLS.
- Index on `created_at DESC`.

### Edge function `log-client-error`

- Public (no JWT). CORS enabled.
- Body validated with Zod: `message` required (max 4KB), rest optional and length-capped.
- Uses `SUPABASE_SERVICE_ROLE_KEY` client to insert.
- Extracts `user_id` from `Authorization: Bearer ...` via `getClaims()` when present (best-effort — never blocks).
- Simple in-memory IP rate limit (e.g. 30/min) to prevent flooding.
- No config.toml change needed (default `verify_jwt=false`).

### Client wiring

- `src/lib/logClientError.ts` — `logClientError(payload)` helper that POSTs via `supabase.functions.invoke('log-client-error', ...)`. Wrapped in try/catch so logging failures never surface.
- `src/main.tsx` — install:
  - `window.addEventListener('error', ...)` → send `{ kind:'error', message, source, stack, url, userAgent }`
  - `window.addEventListener('unhandledrejection', ...)` → send `{ kind:'unhandledrejection', message: reason?.message ?? String(reason), stack: reason?.stack }`
  - Skip in `import.meta.env.DEV` to avoid noise (or keep on — I'll gate it with a small `if (import.meta.env.PROD)`).

### Admin errors page

- New route `/admin/errors` in `src/App.tsx` inside `AdminProtectedRoute`.
- `src/pages/admin/AdminErrors.tsx` using `AdminLayout` pattern:
  - Table: created_at, kind, message (truncated), url, user_id → email lookup, expand-row for stack + context.
  - Filters: kind, last 24h/7d/30d/all, search on message.
  - Pagination (50/page).
- Sidebar entry in `src/components/admin/AdminSidebar.tsx`: "Errors" with a `Bug` icon.

## Files touched / created

- `src/components/Header.tsx` (edit)
- `src/main.tsx` (edit)
- `src/lib/logClientError.ts` (new)
- `supabase/functions/log-client-error/index.ts` (new)
- migration for `client_error_logs`
- `src/App.tsx` (add route)
- `src/pages/admin/AdminErrors.tsx` (new)
- `src/components/admin/AdminSidebar.tsx` (add nav item)

No secrets required — `SUPABASE_SERVICE_ROLE_KEY` is already available to edge functions.
