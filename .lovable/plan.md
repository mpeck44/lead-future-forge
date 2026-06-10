## Plan: Update Problem Section Copy

### What We're Changing
Replace the three pain-point statements in `src/components/ProblemSection.tsx` with the new copy provided, adding a supporting line under each main statement.

### What We're NOT Changing
- Hero, navigation, or any other section
- The existing layout (3-column grid), styling, or Tailwind classes
- The heading, subtitle, or closing CTA sentence

### New Copy

1. **Main:** "AI is already in your buildings. Your approach is improvised."  
   **Supporting:** "Teachers are using tools you never approved. You're answering questions case by case."

2. **Main:** "Your board — or your boss — is asking for a plan you don't have."  
   **Supporting:** "The question has moved from 'what is AI?' to 'what's our strategy?'"

3. **Main:** "You wrote the plan. Nothing is moving."  
   **Supporting:** "The framework got adopted. The binder got shelved. Practice hasn't changed."

### Technical Details
- Convert the flat `painPoints` string array into an array of objects (`{ title: string, supporting: string }`).
- Inside the mapped cards, render the `title` in the existing `<p>` tag, then add a second `<p>` below it for the `supporting` line with slightly muted styling (`text-white/60`, `text-sm`, `mt-3`).
- All existing CSS classes on the section wrapper, grid, and card containers remain untouched.

### Files to Edit
- `src/components/ProblemSection.tsx`

No new dependencies. No database changes.