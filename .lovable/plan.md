
<context>
You’re seeing the page scroll fine (lesson content area), but the course navigation sidebar (modules + lessons list) gets “cut off” when you expand modules, and you can’t scroll to reach the remaining lessons. You also want an obvious scrollbar in that sidebar so it’s clear you can navigate it.
</context>

<diagnosis>
In `src/pages/CourseViewer.tsx`, the lesson navigation list is already wrapped in a Radix `ScrollArea`:

- `SidebarContent` uses: `div className="h-full flex flex-col overflow-hidden"`
- Inside it: `<ScrollArea className="flex-1 min-h-0">...</ScrollArea>`

However, on desktop the sidebar container that wraps `SidebarContent` is using only a `max-height`:

`className="sticky top-20 ... overflow-hidden max-h-[calc(100vh-6rem)]"`

Because it’s `max-h` (not an explicit height), `SidebarContent`’s `h-full` doesn’t reliably resolve to a real height (CSS height: 100% requires the parent to have an explicit height). That leaves the `ScrollArea` without a stable height context, so it doesn’t create a scrollable viewport; content is simply clipped by `overflow-hidden`.
</diagnosis>

<goal>
1) Make the sidebar’s lesson list actually scroll (so you can reach every lesson even when modules are expanded).
2) Make the scrollbar clearly visible (not “hidden until hover”) so users discover it.
</goal>

<implementation>
<step id="1" title="Give the desktop sidebar wrapper a real height (not just max-height)">
In `src/pages/CourseViewer.tsx`, update the desktop sidebar wrapper:

Current:
- `max-h-[calc(100vh-6rem)]`

Change to:
- `h-[calc(100vh-6rem)]` (or `h-[calc(100dvh-6rem)]` if we want better mobile/modern viewport behavior)

This will give `SidebarContent` a real height to inherit (`h-full` works), allowing the internal flex layout to properly allocate space and enabling `ScrollArea` to scroll.
</step>

<step id="2" title="Ensure the flex container can shrink correctly">
Still in `SidebarContent`, add `min-h-0` to the top-level wrapper (in addition to the existing `h-full flex flex-col overflow-hidden`).

Why: In nested flex layouts, `min-h-0` prevents the content from forcing the container to expand beyond available space and is a common requirement for scroll containers to behave correctly.
</step>

<step id="3" title="Make the navigation scrollbar visible (discoverable)">
Update the sidebar’s `ScrollArea` usage to explicitly request always-visible scrollbars:

- Add `type="always"` to the `ScrollArea` used for the module/lesson list.

This addresses the “I can’t see a scrollbar” part even when the sidebar is scrollable (Radix defaults to hover/auto behavior depending on configuration).
</step>

<step id="4" title="QA / verification checklist">
On `/course/ai-foundations` (desktop width):
- Expand Module 1 and any other modules so the list exceeds the sidebar height.
- Confirm:
  - You can scroll inside the sidebar (mouse wheel / trackpad scroll) and reach the last lesson.
  - The scrollbar is visible in the sidebar (not only on hover).
  - The lesson content area scroll remains unaffected.
  - The PortfolioTracker footer remains pinned below the scrollable list (if present), and doesn’t block scrolling.
- Also test on smaller screens (mobile sheet menu):
  - Open the menu via the hamburger button.
  - Confirm the list scrolls and the scrollbar appears there too.
</step>
</implementation>

<files-to-change>
1) `src/pages/CourseViewer.tsx`
- Desktop sidebar wrapper: switch `max-h-[calc(100vh-6rem)]` to `h-[calc(100vh-6rem)]` (or `100dvh`).
- `SidebarContent` top wrapper: add `min-h-0`.
- Sidebar `ScrollArea`: add `type="always"` (keep `flex-1 min-h-0`).

No other files required.
</files-to-change>

<expected-outcome>
After these adjustments, the navigation sidebar will:
- Constrain to the viewport height properly
- Allow scrolling through all expanded lessons
- Show a visible scrollbar so it’s obvious there’s more content
</expected-outcome>
