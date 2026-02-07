

## Hero Section Refresh

### Problems to Fix

1. **"Join the Waitlist" button is invisible** -- white outline on a light gradient background makes it unreadable (visible in your screenshot)
2. **Hero feels flat** -- just a gradient with centered text, no visual depth or energy

### What Changes

The hero will be refreshed with more visual interest while keeping the same messaging and brand identity. Here's what's different:

---

### Button Fix

The "Join the Waitlist" button will switch from a ghost white outline to a **solid white button with navy text** -- always visible, high contrast, and professional. On hover, it will slightly dim rather than disappear.

---

### Visual Enhancements

**1. Deeper, richer background gradient**
- Shift from the current flat teal wash to a deeper navy-dominant gradient with more contrast
- The background will feel more intentional and premium

**2. Subtle animated grid pattern overlay**
- A faint geometric dot grid overlaid on the background adds texture without distraction
- Creates a "tech-forward" feel appropriate for AI-focused content

**3. Floating accent shapes with subtle animation**
- Small, slow-moving decorative elements (glowing orbs and rings) at different depths
- Creates parallax-like visual depth that draws the eye
- Uses brand colors (teal, gold) at low opacity so they enhance without distracting

**4. Glowing accent line under the headline**
- A short horizontal gradient bar (teal-to-gold) beneath the main headline
- Draws the eye and creates visual separation between headline and subheadline

**5. Social proof bar upgrade**
- Instead of plain text separated by pipes, each stat gets its own subtle pill/badge with a small icon
- "50+ leaders trained" gets a users icon, "COSN/ISTE aligned" gets a shield icon, etc.
- Feels more polished and credible

**6. Staggered animations refined**
- Existing fade-in animations will be kept but polished with slightly different timing for a smoother cascade effect

---

### What Stays the Same

- All copy/messaging (headline, subheadline, badge text, social proof text)
- "See the Pathways" gold button behavior (scrolls to courses)
- "Join the Waitlist" button behavior (opens waitlist modal)
- Overall centered layout
- Mobile responsiveness

---

### Technical Details

**Files to modify:**

| File | Change |
|------|--------|
| `src/components/Hero.tsx` | Update button styling, add decorative elements, enhance social proof bar, add CSS keyframes for floating animation |
| `src/index.css` | Add keyframe animations for floating elements and grid pattern |

**Button fix (specific change):**
The outline button class changes from:
`border-white/60 text-white hover:bg-white/10 hover:border-white`
to:
`bg-white text-navy hover:bg-white/90 border-white`

This makes it always readable -- solid white background with dark navy text.

**New decorative elements added to the JSX:**
- A CSS-based dot grid overlay (using `radial-gradient` in a pseudo-element)
- 3-4 floating circles/rings with slow CSS animations (`animate-float-slow`, `animate-float-slower`)
- A gold-to-teal gradient accent line (thin horizontal bar, ~120px wide, centered under the headline)

**New CSS keyframes in `src/index.css`:**
- `float-slow`: gentle up-down movement over 20 seconds
- `float-slower`: slightly different timing over 25 seconds
- Grid dot pattern via a utility class

**No new dependencies needed.**

