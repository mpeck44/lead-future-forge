

## Replace Hero Image with AI-Generated Photo of You

### What you've provided
Four reference images of you:
- Professional B&W headshot (clean, smiling)
- Speaking on stage with mic (cut-out, NFT shirt)
- Two panel/event photos (purple stage lighting)

### The plan

**1. Generate a new hero photo using AI**
Use the Lovable AI image model (`google/gemini-3-pro-image-preview` for highest quality) with your reference photos as input. The prompt will direct the model to:
- Use your facial features from the B&W headshot (clearest reference)
- Place you in a context that matches the current hero: a confident K-12 leader in a professional setting (think: superintendent presenting AI strategy, modern office or boardroom backdrop)
- Match the existing hero's visual treatment: 4:5 aspect ratio, warm natural lighting, slight cinematic depth, color grade that complements the deep navy `#0F172A` background and gold `#d4af37` accent
- Professional attire (button-down or blazer, no t-shirt) to match the "Director of Technology / board-ready leader" positioning
- Authentic, approachable expression, not stiff corporate stock

**2. Save and wire it up**
- Save the generated image to `src/assets/hero-leader.jpg` (replacing the existing file, same filename so the import in `Hero.tsx` keeps working with no code change)
- Verify the import at the top of `src/components/Hero.tsx` (`import heroLeader from "@/assets/hero-leader.jpg"`) still resolves
- Update the `alt` text on the `<img>` to reflect that it's you (Mike Peck), since the bio strategy already centers on "Built by a practicing K-12 Director of Technology"

**3. QA**
- Generate, then preview the image before committing
- If the first generation isn't strong enough (likeness off, lighting wrong, awkward composition), iterate with refined prompts up to 2-3 times
- Confirm the 4:5 aspect ratio crops well in the existing hero layout at desktop and mobile

### Honest caveat on likeness
AI image models can approximate your likeness from references but may not produce a perfect photographic match, this won't look identical to a real photo of you. If exact likeness matters (it often does for credibility), a real photo shoot is the gold standard. The AI version is a strong interim option and works well stylistically. I'll generate it and you decide if it's good enough to ship.

### Files touched
- `src/assets/hero-leader.jpg` (replaced)
- `src/components/Hero.tsx` (alt text update only)

