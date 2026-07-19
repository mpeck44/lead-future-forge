## Context

An account management page already exists at `/profile` and is linked from the header user menu (desktop dropdown + mobile). It lets users edit their name, district, role, view account creation date, and delete their account (with "DELETE" typed confirmation via the existing `delete-user` edge function).

**No new page is needed.** But there's one real bug and one small UX gap.

## Problems to fix

1. **Email change is fake.** The form's email field writes to `profiles.email` only. `auth.users.email` (the actual login credential) is never updated. Users think they changed their email but still have to log in with the old one, and Supabase auth emails still go to the old address.
2. **Discoverability.** The Profile link lives only inside the header avatar dropdown. A user who just signed up may not find it.

## Changes

### 1. Wire email changes through Supabase Auth (`src/pages/Profile.tsx`)

- Detect when the submitted email differs from the current `user.email`.
- If it does, call `supabase.auth.updateUser({ email: newEmail })` with `emailRedirectTo: ${origin}/dashboard`. This triggers Supabase's built-in email-change confirmation flow (a confirmation link is sent to the new address; the change only takes effect when confirmed).
- Show a toast: "Check your new email to confirm the change." Do NOT update `profiles.email` yet — let it sync after confirmation on next login, or update it after `auth.updateUser` succeeds so admin views stay accurate (acceptable since RLS scopes the row to the user).
- If only non-email fields changed, keep the existing `profiles` update path.
- Handle the "email already in use" and "rate limit" errors with a friendly inline message (reuse the pattern from `Auth.tsx`).
- Add a small helper note under the email field: "Changing your email requires confirmation from the new address."

### 2. Add a "Account" quick link on the Dashboard

In `src/pages/Dashboard.tsx`, add a subtle "Account settings" link (icon + text) near the welcome header or in the user's greeting area, routing to `/profile`. Keeps discoverability without cluttering the dashboard.

### 3. Minor polish on `/profile`

- Show the current login email (`user.email`) as read-only helper text below the email input when a pending change exists, so the user knows which one is still active.
- Group cards under an h2 hierarchy so the page reads: Profile Information → Account Management (delete).

## Out of scope

- Password change UI (can add later if requested — would use `supabase.auth.updateUser({ password })` plus a "current password" reauth step).
- Two-factor / MFA.
- Avatar upload.
- Any change to the delete flow — it already works correctly.

## Files touched

- `src/pages/Profile.tsx` — email-change logic, helper text, error handling
- `src/pages/Dashboard.tsx` — add "Account settings" link

No database migrations, no new edge functions, no new routes.
