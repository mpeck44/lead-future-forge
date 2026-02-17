

## Landing Page Revisions

Based on the LearnHub reference screenshots and your feedback, here are the changes planned across the landing page.

---

### 1. Hero Section Overhaul

**Background**: Switch from the current dark navy gradient to a light, warm background (cream/off-white like the reference). This immediately fixes the contrast issue where everything blends together.

**Text colors**: Headline becomes dark navy, subheadline becomes a muted dark gray. The accent span in the headline stays a brand color (teal) for emphasis.

**Remove the social proof bubbles**: The four pill badges below the CTAs ("50+ district leaders trained", "Standards aligned", etc.) will be removed entirely.

**Add a stats bar**: Replace the bubbles with a clean stats row similar to the reference (bold numbers with labels underneath), using your real figures:
- "50+" / "District Leaders Trained"  
- "4" / "Leadership Courses"
- "COSN & ISTE" / "Standards Aligned"

**Buttons stay** but adapt to the light background:
- Primary CTA ("Get the Leadership Forge Preview") stays solid green
- Secondary CTA ("Join the Leadership Waitlist") becomes an outlined dark button (navy border + navy text) so it stands out on the light background

**Course card stays** on the right, unchanged -- it already looks great.

**Remove floating orbs and dot grid** since they were designed for the dark background and would look odd on a light one.

**Keep the audience badge** at top ("For K-12 Superintendents...") but restyle it for the light background (green pill with dark text, similar to the "New: AI-Powered Learning" badge in the reference).

---

### 2. Replace "Problem You're Facing" with Testimonials

Instead of the pain-point section, create a testimonials section titled "What Our Leaders Say" (styled like the "What Our Students Say" reference). Three testimonial cards in a row with:
- Star rating (5 stars)
- Quote text
- Name and title/role

Placeholder testimonials will be used -- you can swap in real ones later. Light background, clean card styling with subtle borders.

---

### 3. Add Final CTA Section

A new section at the very bottom of the page (before the footer) with:
- Bold headline: "Ready to Lead AI in Your District?"
- Short supporting line
- Two buttons: primary CTA (green) and secondary (outline)
- Centered layout inside a clean card on a light teal/blue background (like the reference)

---

### 4. Page Flow (Updated)

```text
Header
  |
Hero (light background, stats bar, no bubbles)
  |
Testimonials ("What Our Leaders Say") -- replaces ProblemSection
  |
Outcomes ("What This Program Delivers")
  |
Featured Course Cards
  |
What Makes This Different
  |
NEW: Final CTA Section
  |
Footer
```

---

### Technical Details

**Files to create:**

| File | Purpose |
|------|---------|
| `src/components/TestimonialsSection.tsx` | Three testimonial cards with stars, quotes, and attribution |
| `src/components/FinalCTA.tsx` | Bottom-of-page call-to-action section with two buttons |

**Files to modify:**

| File | Change |
|------|---------|
| `src/components/Hero.tsx` | Light background, remove bubbles, add stats bar, restyle buttons and text for light theme, remove floating orbs/dot grid |
| `src/pages/Index.tsx` | Replace ProblemSection with TestimonialsSection, add FinalCTA before Footer |

**No database changes needed.**

