

## Dynamic Featured Courses Grid on Landing Page

### What Changes

The current static single-card `FeaturedCourse` component will be replaced with a dynamic section that fetches your 4 featured courses from the database and displays them in a responsive grid.

### Layout

- **Desktop**: 2x2 grid of course cards
- **Tablet**: 2 columns
- **Mobile**: Single column, stacked

### Card Design

Each card will include:

1. **Gradient header bar** at the top -- each course gets a unique color scheme for visual distinction:
   - Foundations: navy-to-teal gradient
   - Fluency: teal-to-dark-teal gradient
   - Strategy: navy-to-gold gradient  
   - Action: dark-teal-to-green gradient

2. **Course title** (large, display font)

3. **Short description** -- first paragraph only (before the line break), keeping cards compact

4. **Meta bar** with visual separation:
   - Clock icon + estimated hours (e.g., "~4 hours" or "Coming Soon" if not set)
   - Users icon + "Best for" audience label (e.g., "For Administrators")

5. **Deliverables list** with checkmark icons -- pulled from the module `deliverable_name` values. For courses without deliverables yet, a placeholder like "Deliverables coming soon" will show

6. **"Coming Soon" button** at the bottom (since courses are pre-launch). This will open the waitlist modal with a source tag identifying which course triggered it

### Data Flow

The component will query the database at render time using React Query:
- Fetch all courses where `featured = true`
- For each course, fetch associated module deliverable names
- Display a loading skeleton while data loads

### Technical Details

**File to modify:**

| File | Change |
|------|---------|
| `src/components/FeaturedCourse.tsx` | Complete rewrite: replace static card with dynamic grid fetching featured courses from the database |

**No new files needed** -- the WaitlistModal already accepts a `source` prop and can be reused.

**Query logic:**
- Primary query: `supabase.from('courses').select('*').eq('featured', true).order('created_at')`
- Secondary query per course: `supabase.from('modules').select('deliverable_name').eq('course_id', courseId).not('deliverable_name', 'is', null).order('sequence_order')`
- Both wrapped in a single `useQuery` hook for clean loading/error states

**Card structure (per card):**

```text
+---------------------------------------+
|  [gradient header - unique per card]  |
|  Course Title (Playfair Display)      |
+---------------------------------------+
|  Short description paragraph          |
|                                       |
|  +---------+  +------------------+    |
|  | ~4 hrs  |  | For Administrators|   |
|  +---------+  +------------------+    |
|                                       |
|  What You'll Build:                   |
|  [check] AI Types Cheat Sheet         |
|  [check] Portfolio Progress Tracker   |
|  [check] AI Equity Audit Checklist    |
|                                       |
|  [ Coming Soon ]  (button)            |
+---------------------------------------+
```

**Color mapping for visual distinction:**
Each course slug maps to a unique gradient and accent. This is hardcoded since there are only 4 courses, keeping it simple and visually intentional:
- `foundations` -- navy/teal gradient, teal accent
- `fluency` -- teal/dark-teal gradient, gold accent  
- `strategy` -- navy/gold gradient, gold accent
- `action` -- dark-teal/green gradient, green accent

**Audience mapping:**
Since there is no "audience" field in the database, a simple map based on slug will provide the "Best for" label:
- `foundations` -- "All K-12 Leaders"
- `fluency` -- "Practitioners"
- `strategy` -- "Superintendents and Cabinet"
- `action` -- "Implementation Teams"

**Responsive behavior:**
- `grid-cols-1 md:grid-cols-2` for the 2x2 / stacked layout
- Cards have equal height via CSS grid
- Deliverables list scrolls gracefully if a course has many items

**Section header** stays the same: "What You'll Build" with subtitle "Real tools and frameworks you can use in your district -- not just theory"

