# AI Equity Audit — Backend Data Model

Backend only. No UI changes in this step.

## Categories
Five audit categories (CHECK-constrained values for `audit_responses.category`):
`fluency`, `strategy`, `action`, `governance`, `capacity`

## Schema changes (single migration)

### 1. `audit_attempts`
- `id` uuid pk
- `user_id` uuid → `auth.users(id)` on delete cascade, not null
- `attempt_number` int not null default 1
- `started_at` timestamptz not null default now()
- `completed_at` timestamptz nullable
- `created_at`, `updated_at` timestamptz
- Unique `(user_id, attempt_number)`
- Index on `user_id`
- RLS: owner can select/insert/update/delete their own rows; service_role full

### 2. `audit_responses`
- `id` uuid pk
- `attempt_id` uuid → `audit_attempts(id)` on delete cascade, not null
- `category` text not null, CHECK in the five values above
- `item_key` text not null
- `score` int not null, CHECK between 1 and 4
- `created_at` timestamptz
- Unique `(attempt_id, item_key)` so re-answering an item upserts cleanly
- Index on `(attempt_id, category)`
- RLS: owner of parent attempt can select/insert/update/delete (checked via `EXISTS` against `audit_attempts.user_id = auth.uid()`); service_role full

### 3. `profiles` additions
- `recommended_course` text nullable, CHECK in (`fluency`, `strategy`, `action`) or null
- `recommendation_source` text nullable, CHECK in (`self_selected`, `audit`) or null

### 4. Function: `public.get_audit_summary(_attempt_id uuid)`
SECURITY DEFINER, returns table of:
- `category` text
- `avg_score` numeric
- `item_count` int
- `is_lowest` boolean
- `recommended_course` text — populated only on the lowest row using direct key match:
  - `fluency` → `fluency`
  - `strategy` or `governance` → `strategy`
  - `action`, `implementation`, or `capacity` → `action`

Function verifies `auth.uid()` owns the attempt before returning rows. Ties on lowest broken by category order: `fluency, strategy, action, governance, capacity` (so the earliest-listed wins deterministically).

## GRANTs
For both new tables:
```
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<t> TO authenticated;
GRANT ALL ON public.<t> TO service_role;
```
No `anon` grant — audit data is per-user.

`GRANT EXECUTE ON FUNCTION public.get_audit_summary(uuid) TO authenticated;`

## Out of scope (later steps)
- UI for the audit (form, scoring, results screen)
- Writing recommendations back to `profiles` (will be a separate edge function or RPC once UI exists)
- Seeding item_keys / question bank — schema is content-agnostic for now
