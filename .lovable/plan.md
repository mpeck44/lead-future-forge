## Decision

Keep both Stripe prices on the Complete Path bundle product:

- `$158` — `course_bundle_founder` lookup key, active through Sept 7, 2026.
- `$197` — `course_bundle_onetime` lookup key, used automatically after the founder deadline.

## Why

The checkout edge function already resolves the bundle price by date using `getBundleLookupKey()`:

- Before `2026-09-08T03:59:59Z` → `course_bundle_founder` → $158.
- After that cutoff → `course_bundle_onetime` → $197.

Deleting the $197 price would break the bundle after the founder window closes.

## Action

No code or catalog changes required. The current setup is correct.