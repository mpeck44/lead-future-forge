

## Update Hero Section + Add Waitlist Modal

### What Changes

The hero section will be replaced with the exact copy you specified, and a new waitlist email capture modal will be created for the "Join the Waitlist" button.

### Updated Hero Content

**Badge:** "FOR K-12 SUPERINTENDENTS, PRINCIPALS, AND DISTRICT LEADERS"
- Small, uppercase, with a subtle teal background pill

**Headline:** "Stop Reacting to AI. Start Leading Through It."
- 48px mobile, scaling to 56px on desktop
- White text with "Leading Through It." highlighted in gold

**Subheadline:** "The Leadership Forge is the only professional development system that takes school leaders from AI-curious to AI-strategic -- with real deliverables you'll use this week."
- 18-20px, slightly muted (white at 85% opacity)

**CTAs (side-by-side on desktop, stacked on mobile):**
- "See the Pathways" -- solid gold button, scrolls to `#courses` section
- "Join the Waitlist" -- outline/ghost button, opens a waitlist modal

**Social Proof Bar:**
"50+ leaders trained  |  COSN/ISTE aligned  |  Built by a practicing K-12 Director of Technology"
- Subtle dot separators between items
- Slightly muted text color

### Waitlist Modal

Since no waitlist form exists yet, a simple modal will be created:
- Email input field with validation
- "Join the Waitlist" submit button
- Saves the email to a new `waitlist_leads` database table
- Shows a success message after submission
- Clean, on-brand styling matching the rest of the app

### Technical Details

**Files to create:**

| File | Purpose |
|------|---------|
| `src/components/WaitlistModal.tsx` | Dialog with email input form, saves to database |

**Files to modify:**

| File | Change |
|------|--------|
| `src/components/Hero.tsx` | Replace all content (badge, headline, subheadline, CTAs, social proof bar) with the new copy. Wire "See the Pathways" to scroll to `#courses`. Wire "Join the Waitlist" to open the modal. |

**Database change:**

A new `waitlist_leads` table will be created:

```text
waitlist_leads
--------------
id            uuid (PK, default gen_random_uuid())
email         text (not null, unique)
source        text (default 'hero')
created_at    timestamptz (default now())
```

- RLS enabled with a permissive INSERT policy for anonymous users (so visitors can submit without logging in)
- No SELECT/UPDATE/DELETE policies for anon (protects the data)

**Design implementation details:**
- Badge: `uppercase tracking-widest text-xs` with `bg-teal/20 border border-teal/30` pill
- Headline: `text-[2.75rem] sm:text-[3rem] lg:text-[3.5rem]` (44px to 56px), with "Leading Through It." in gold
- Subheadline: `text-lg sm:text-xl text-white/85` with `max-w-2xl`
- Primary CTA: solid `bg-gold text-navy` with hover state
- Secondary CTA: `border-white/60` outline style
- Social proof: `text-sm text-white/70` with dot separator spans

