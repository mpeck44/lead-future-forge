

## Add "Problem" and "Differentiator" Sections to the Landing Page

Two new content sections will be inserted into the landing page flow to create emotional resonance and differentiate the platform.

---

### Page Flow (Updated)

```text
Header
  |
Hero
  |
NEW: "The Problem You're Facing" section
  |
Featured Course Cards ("What You'll Build")
  |
NEW: "What Makes This Different" section
  |
Footer
```

---

### Section 1: The Problem You're Facing

Placed between the Hero and the course cards. Dark navy background (matching the hero) so it feels like a natural continuation before transitioning to the lighter card section.

**Layout:**
- Section heading: "The Problem You're Facing" in display font
- Three pain-point statements in a responsive 3-column grid (stacked on mobile), each with a subtle left border accent in teal or gold
- Closing line below: "You don't need another workshop. You need a system." -- styled as a standout quote with gold accent

**Visual details:**
- Navy background with subtle dot grid texture (reusing the existing `.hero-dot-grid` pattern)
- Each pain-point card has a semi-transparent background with a colored left border
- Staggered fade-in animation on scroll (optional, keeps it simple for now)

---

### Section 2: What Makes This Different

Placed after the course cards section. Light background (matching the card section) with a clean, professional layout.

**Layout:**
- Section heading: "What Makes This Different"
- Four feature blocks in a 2x2 grid (stacked on mobile), each with:
  - An icon (Hammer/wrench for practitioner, Briefcase for portfolio, GitFork/split for pathways, ShieldCheck for standards)
  - Bold title
  - 1-2 sentence description
- Clean card styling with subtle borders

---

### Technical Details

**Files to create:**

| File | Purpose |
|------|---------|
| `src/components/ProblemSection.tsx` | "The Problem You're Facing" section with three pain-point cards and closing statement |
| `src/components/DifferentiatorSection.tsx` | "What Makes This Different" section with four feature blocks |

**Files to modify:**

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Import and place the two new components: ProblemSection between Hero and FeaturedCourse, DifferentiatorSection after FeaturedCourse |

All copy is exactly as provided. No database changes needed.

