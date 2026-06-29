## Audit Insights in the Admin Console

Give you a single place to see who has completed the AI Equity Audit, what they scored, and where the aggregate gaps are across the platform.

### New admin page: `/admin/audits`

Linked from the Admin Console nav alongside Courses, Users, etc.

**Top — Summary cards**
- Total attempts (completed vs. in-progress)
- Unique users who have taken the audit
- Average score per category (fluency, strategy, action, governance, capacity)
- Most common "lowest category" (i.e. where most people need to go next)

**Middle — Category breakdown**
A simple bar chart of average score per category so you can see at a glance where the cohort is strongest/weakest.

**Bottom — Attempts table**
One row per attempt with:
- Name / email / role / district (from `profiles`)
- Completed date
- Score per category (5 small cells)
- Lowest category + recommended course
- Row click → detail drawer showing every individual question response and score

Filters: completed-only toggle, date range, role, district search.
Export: "Download CSV" of the current filtered view.

### How access is secured

- New page wrapped in the existing `AdminProtectedRoute` (admin role required).
- Backend access via a new `SECURITY DEFINER` RPC `get_audit_attempts_admin()` that:
  - Checks `has_role(auth.uid(), 'admin')` and returns empty otherwise.
  - Joins `audit_attempts` + `audit_responses` + `profiles` and returns aggregated per-attempt rows plus per-category averages.
- A second RPC `get_audit_attempt_detail_admin(_attempt_id)` returns the per-question responses for the drawer, with the same admin check.
- No new direct table policies needed — admins read exclusively through these RPCs, so learner-facing RLS on `audit_attempts` / `audit_responses` stays untouched.

### Technical notes

- Files added:
  - `src/pages/admin/AdminAudits.tsx` (page + table + filters + CSV export)
  - `src/components/admin/AuditAttemptDetailDrawer.tsx`
  - `src/components/admin/AuditCategoryChart.tsx` (uses existing `recharts`)
- Route registered in `App.tsx`; nav entry added to the admin sidebar/header.
- Migration adds the two RPCs only — no schema changes to existing tables.
- CSV export is client-side from the already-loaded rows (no extra endpoint).

### Out of scope (can add later)
- Emailing/notifying you when a new audit is completed.
- Cohort comparisons across time periods or per-district dashboards.

Want me to build this as described, or adjust the columns/filters first?