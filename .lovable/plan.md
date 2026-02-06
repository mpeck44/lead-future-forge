

## Enhanced Waitlist System: Capture, Track, and Manage Leads

### What Changes

Three connected improvements to the waitlist system:

1. **Enhanced waitlist form** -- adds name and role fields to the modal (low friction)
2. **Better tracking** -- captures course interest, UTM source, and timestamp data
3. **Admin Waitlist page** -- a new page in the admin console to view, filter, and manage all waitlist leads

---

### 1. Enhanced Waitlist Modal

The current modal only captures email. The updated form will add two fields while keeping it quick (3 fields total):

**Fields:**
- **Full Name** (text input, required) -- with a person icon
- **Email** (text input, required) -- keeps the existing email field
- **Role** (dropdown, required) -- matching your K-12 role options:
  - Superintendent
  - Principal
  - Assistant Principal
  - Curriculum Director
  - Technology Director
  - Teacher Leader
  - Other

**Additional data captured automatically (no extra user input):**
- `source` -- already tracks "hero" vs "featured-foundations", "featured-strategy", etc.
- `interested_courses` -- when triggered from a specific course card, stores the course slug(s) they clicked on
- `created_at` -- timestamp of signup

The modal title will contextually update: if triggered from a specific course card, it will say "Join the Waitlist for [Course Name]" instead of the generic title.

---

### 2. Database Changes

The `waitlist_leads` table will be expanded with new columns:

| Column | Type | Notes |
|--------|------|-------|
| `full_name` | text, nullable | Name of the lead |
| `role` | text, nullable | K-12 role from dropdown |
| `interested_courses` | text[], nullable | Array of course slugs they expressed interest in |
| `notes` | text, nullable | For admin use -- add notes about a lead |

The unique constraint stays on `email`. If someone signs up again from a different course, we update the existing row to append the new course to `interested_courses` (upsert behavior) rather than rejecting them.

**RLS policies** remain the same -- anonymous INSERT is already allowed, and admin has full access.

---

### 3. Admin Waitlist Page

A new page at `/admin/waitlist` that follows the same design patterns as your existing Admin Users page:

**Features:**
- **Summary stats** at the top: total leads, leads this week, most popular course interest
- **Searchable table** with columns: Name, Email, Role, Interested Courses (as badges), Source, Signed Up date
- **Filters**: by role dropdown, by course interest, by date range
- **Click to expand** a lead row to see full details and add admin notes
- **Export** -- a button to download leads as CSV for use in email marketing tools
- **Pagination** matching the existing admin table pattern (10 per page)

**Navigation:** A new "Waitlist" item will be added to the admin sidebar between "Courses" and "Users", using a clipboard/list icon.

---

### Technical Details

**Database migration:**

```text
ALTER TABLE waitlist_leads
  ADD COLUMN full_name text,
  ADD COLUMN role text,
  ADD COLUMN interested_courses text[] DEFAULT '{}',
  ADD COLUMN notes text;
```

**Files to create:**

| File | Purpose |
|------|---------|
| `src/pages/admin/AdminWaitlist.tsx` | Full waitlist management page with table, filters, search, stats, CSV export |

**Files to modify:**

| File | Change |
|------|--------|
| `src/components/WaitlistModal.tsx` | Add name input, role dropdown, pass course slug to `interested_courses`. Implement upsert logic for returning visitors. Contextual title based on source. |
| `src/components/admin/AdminSidebar.tsx` | Add "Waitlist" nav item with `ClipboardList` icon |
| `src/App.tsx` | Add route for `/admin/waitlist` wrapped in `AdminProtectedRoute` |
| `src/components/FeaturedCourse.tsx` | Pass course title alongside slug to WaitlistModal so the modal can show "Join the Waitlist for Foundations" |

**Upsert logic in WaitlistModal:**
When a user submits and gets the duplicate email error (23505), instead of just showing "already on the list", the modal will attempt an update to append the new course slug to `interested_courses` and then show the success state. This way returning visitors can express interest in additional courses without friction.

**CSV export in admin page:**
A client-side CSV generation that downloads all filtered leads as a `.csv` file with columns: Name, Email, Role, Interested Courses, Source, Date. No external library needed -- built with native browser APIs.

