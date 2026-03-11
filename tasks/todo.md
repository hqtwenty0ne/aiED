# AI Educational Website — `ai-education/index.html`

## Plan
Create a self-contained, single-file AI educational landing page with modern design-agency aesthetics.

## Checklist

- [x] Create `ai-education/` directory
- [x] Design CSS custom properties (palette, typography, layout tokens)
- [x] Build Nav — sticky dark bar, logo, 3 links, "Enroll" CTA pill, mobile hamburger
- [x] Build Hero — full-bleed dark section, headline, sub-copy, two buttons, placeholder image with badge
- [x] Build Marquee strip — pure-CSS infinite scroll of AI company names
- [x] Build Courses — 3×2 card grid with placeholder images, tags, titles, descriptions
- [x] Build Stats — 4-stat horizontal band (learners, courses, instructors, rating)
- [x] Build Curriculum — 2-col layout: left copy, right numbered 6-module list
- [x] Build Testimonials — 3 quote cards with avatar placeholders
- [x] Build CTA Banner — dark full-width strip with enroll button
- [x] Build Footer — 4-col links + copyright row
- [x] Add mobile nav toggle script

## Review

All sections implemented in a single self-contained file (`ai-education/index.html`) with no external JS dependencies.

**Key decisions:**
- Used CSS custom properties for the full design token system (colors, radius, max-width, transitions)
- Marquee uses pure CSS `@keyframes` animation — pauses on hover via `animation-play-state`
- `placehold.co` images use brand colors to maintain visual consistency across cards
- Mobile-responsive via media queries at 900px and 600px breakpoints
- Mobile nav toggle is ~8 lines of vanilla JS (no framework)
- `clamp()` used for fluid display typography across breakpoints
