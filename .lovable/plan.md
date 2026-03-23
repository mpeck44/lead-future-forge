

## Landing Page Taste Overhaul

This is a significant visual redesign touching every section. The goal: move from "AI-generated edtech template" to "practitioner-built executive presence."

---

### 1. Color Palette Shift

Update CSS variables to replace teal/green defaults with a forge-inspired executive palette.

- **Primary accent**: Warm gold/burnt orange (`#D97706`) replaces teal as the primary action color
- **Background**: Deep navy (`#0F172A`) for hero, off-white (`#FAFAF8`) for content sections
- **Text**: Crisp white on dark sections, deep charcoal on light sections
- **Secondary accent**: Keep navy as the anchor, gold for highlights
- **Remove**: Teal and green from CTAs and accents site-wide

**Files**: `src/index.css` (CSS variables), `tailwind.config.ts` (add `burnt-orange` color)

---

### 2. Hero Section — Complete Rebuild

Transform from light cream card-grid layout to a dark, authoritative, asymmetric hero.

**Layout**: Two-column asymmetric split (60% text / 40% visual) on deep navy gradient background (`#0F172A` → `#1E293B`). Optional faint grid-line texture overlay for practitioner feel.

**Left column (60%)**:
- Massive headline (~80-100px desktop) in Playfair Display: "From Reactive to Strategic: Lead AI in Your District with Confidence."
- Lighter-weight subheadline (20-24px) in DM Sans with generous spacing
- Primary CTA: Large burnt-orange/gold button ("Get the Leadership Forge Preview →") with subtext
- Secondary CTA: White outline button ("Join the Waitlist")
- Micro-trust line below buttons: "50+ District Leaders Trained · COSN & ISTE Aligned" in small white text
- Massive vertical padding (120-160px top/bottom)

**Right column (40%)**:
- Keep the course card but restyle it for the dark background (subtle glass/translucent card with light borders)
- This maintains the "real tool preview" feel without needing stock photos

**Remove**: Progress bar from hero, teal-colored elements, cream background, floating orbs

**File**: `src/components/Hero.tsx`

---

### 3. Testimonials — Add Human Texture

Restyle testimonial cards to feel less generic.

- Add avatar circles with initials (styled with warm colors, not teal)
- Swap star color from yellow to gold brand color
- Add subtle quote mark decoration (large faded quotation mark behind text)
- Warmer card styling: slight warm-tinted border, no pure white cards on white background — use very light warm gray cards instead

**File**: `src/components/TestimonialsSection.tsx`

---

### 4. Outcomes Section — Break the Card Grid

Replace the 4-column identical card grid with 2-3 asymmetrical content blocks.

- Two-column layout with alternating large/small blocks
- Each outcome gets a bold number/label on the left and description on the right
- Use horizontal dividers instead of card borders
- More whitespace between items
- No icons in colored squares (the #1 AI-template tell)

**File**: `src/components/OutcomesSection.tsx`

---

### 5. Featured Courses — Make Deliverables Feel Real

The course cards are strong but feel like a catalog.

- Keep the 2-column grid but add visual differentiation between cards (alternating header accent colors using gold/burnt-orange/navy)
- Replace the generic shield icon with course-specific visual elements
- Make the header bands taller with the course title inside them (white text on dark)
- Style the deliverables list with a more distinctive check style (gold checks instead of teal)

**File**: `src/components/FeaturedCourse.tsx`

---

### 6. Differentiator Section — Kill the 2x2 Grid

Replace identical cards with a more editorial layout.

- Single-column layout with 4 items stacked vertically
- Each item: bold left-aligned title + description text, separated by thin horizontal rules
- No icon boxes — just a small accent bar or number on the left
- Much more whitespace between items
- This feels editorial and intentional, not template-generated

**File**: `src/components/DifferentiatorSection.tsx`

---

### 7. Final CTA — More Authority

- Switch to navy background with white text (matches hero bookend)
- Larger headline, more whitespace
- Gold/burnt-orange primary button
- Remove the white card-inside-a-section pattern

**File**: `src/components/FinalCTA.tsx`

---

### 8. Header & Footer — Palette Alignment

- Header: Update CTA button colors from green to burnt-orange/gold
- Footer: Already navy — update accent links from teal to gold/warm tones
- Logo badge: Navy background with gold "LF" text

**Files**: `src/components/Header.tsx`, `src/components/Footer.tsx`

---

### Technical Summary

| File | Change |
|------|--------|
| `src/index.css` | Update CSS variables: primary → gold/burnt-orange, remove teal dominance |
| `tailwind.config.ts` | Add `burnt-orange` to color palette |
| `src/components/Hero.tsx` | Dark navy hero, asymmetric 60/40, massive type, gold CTA, restyled card |
| `src/components/TestimonialsSection.tsx` | Avatar initials, quote decoration, warmer card styling |
| `src/components/OutcomesSection.tsx` | Asymmetrical blocks replacing 4-card grid |
| `src/components/DifferentiatorSection.tsx` | Editorial single-column layout replacing 2x2 grid |
| `src/components/FeaturedCourse.tsx` | Gold accents, visual differentiation between cards |
| `src/components/FinalCTA.tsx` | Navy background, larger type, gold button |
| `src/components/Header.tsx` | Button color updates to gold |
| `src/components/Footer.tsx` | Accent color updates from teal to gold |

No database changes needed.

