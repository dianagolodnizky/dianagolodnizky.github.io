# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for UX/UI designer Diana Golodnizky. Static site — no build system, no framework, no npm. All assets are served as-is.

**Stack**: Vanilla JS, HTML5, CSS3  
**Libraries (CDN)**: Bootstrap 5.3.3, GSAP 3.12.5 + ScrollTrigger, anime.js 3.2.1, jQuery 3.6.3, Lottie Player, p5.js 1.9.0, Google Fonts (Montserrat, League Gothic)

## Site Structure

- **index.html** — Homepage with 6 sections + footer (hero, about, projects grid, works, skills, software, education)
- **ken-lanefesh.html** — PTSD app case study; the most complex page (19 numbered sections, side-navigation panel `.cs-side-menu`)
- **south-korea-booklet.html** — InDesign flipbook project  
- **plugit-app.html**, **faded-ashes.html**, **body-vs-mind.html**, **safe-driving-rules.html**, **blockmates.html**, **basic.html** — Individual project pages

## Local Development

No build step. Serve the directory with any static server:

```bash
python -m http.server 8000
# or
npx http-server
```

Then open `http://localhost:8000`.

## CSS Architecture

**css/style.css** (~4150 lines) — Global styles and design tokens.

`:root` custom properties used everywhere:
- Colors: `--white`, `--grey`, `--black`, `--dark-purple` (`#7E6C90`), `--light-purple` (`#897B96`)
- Typography: `--h1-size` through `--h6-size`, `--body-small/regular/medium/large`
- Layout: `--layout-grid-column: 120px` (standard section padding)
- Base font: `15px = 1rem`

Fonts: **League Gothic** (all headings), **Montserrat** (body text)

**css/responsive.css** (~11100 lines) — All media query overrides, organized into named blocks. Each block redefines `:root` font-size variables and overrides layout properties. The breakpoints are:

| Block | Range |
|-------|-------|
| XS    | ≤ 575.98px |
| SM    | 576px – 767.98px |
| MD    | 768px – 991.98px |
| LG    | 992px – 1199.98px |
| XL    | 1200px – 1399.98px |
| XXL   | 1400px – 1899px |
| XXXL  | ≥ 1900px (27" monitor — matches style.css defaults) |
| Narrow | `max-width: 400px` (at end of file, after XXXL) |

Each breakpoint block ends with a `/* =========== CASE STUDY =========== */` section containing responsive overrides for `ken-lanefesh.html`. When adding case study responsive CSS, insert inside that section of the relevant breakpoint block, not at the top-level of the media query. The `max-width: 400px` block at the end of the file is for narrow-phone overrides only and follows the same case study section comment pattern.

## JavaScript Architecture

**js/homepage.js** (~2100 lines) — All homepage interactivity.

Key systems:
1. **Preloader** — anime.js timeline, runs once per session (sessionStorage guard). Dispatches `preloaderDone` event on completion. Mobile vs desktop have different exit animations.
2. **Navbar** — Sticky on scroll, color changes per section (see `navColorMap` array ~line 287). GSAP-powered mobile menu uses CSS custom properties `--panel-right-1` through `--panel-right-4` for 4-panel reveal.
3. **Grid line scroll sync** (`syncGridLinesWithScroll()`) — LERP-based scroll animation that scales `.h-line` and `.v-line` decorative elements. Each section has a staggered delay. Sections 4, 6, and footer are excluded.
4. **Text animation pipeline** — jQuery wraps text in `<span>` per character/word, then anime.js staggers reveal. Applied to headings and specific selectors in a long `.each()` block (~line 558).
5. **p5.js grid trail** — Mouse-following canvas effect; fixed position, `pointer-events: none`. Neighbor cells activate and fade randomly.
6. **Video/Lottie fallback** — Desktop header uses `.mp4`; mobile uses Lottie JSON (`header-xs-video.json` in `Video/`).

Case study JS is separate per page (inline `<script>` tags or small included files). The `.cs-side-menu` panel slide behavior is driven by JS toggling a class on the element.

## Decorative Grid System

`.custom-grid` elements contain `.h-line` (horizontal) and `.v-line` (vertical) decorative overlay lines. These are **not layout elements** — they scale from 0 to their target size as the user scrolls into each section, driven by `syncGridLinesWithScroll()` in homepage.js.

## Case Study Page Pattern

All case study pages share:
- Same navbar markup (with all project links listed)
- `css/style.css` + `css/responsive.css` both imported
- `.case-study-header` with full-viewport hero
- `.cs-file-button` (download PDF button)
- `.cs-side-menu` (fixed right-side navigation panel, starts off-screen at `right: -400px`)
- Numbered content sections: `.case-study-section1` through `.case-study-sectionN`

`ken-lanefesh.html` has 19 sections including: goals grid (section 3), features staggered columns (sections 8/11), wireframe float rows (sections 16/18), persona cards (section 12), user journey table (section 13), and a thank-you CTA (section 19 with large left-padding to center content past the side menu).

## Important Implementation Notes

- **No `!important` abuse** — the only legitimate `!important` uses are on `.cs-side-menu` position overrides in responsive.css (to override inline JS styles) and a few `margin-top !important` on floated `.left-side` columns
- **Float-based layouts** — sections 1, 2, 4, 5, 7, 10 use `float: left/right` with `width: 50%`. On mobile these reset to `float: none; width: 100%`. Sections with floated children need `overflow: hidden` on the parent to create a BFC and contain the floats (so the section height wraps its content correctly)
- **Staggered column layout** — sections 3, 8, 11 use `flex-direction: row` with different `margin-top` percentages per column to create a vertical stagger effect. On mobile these collapse to `flex-direction: column`
- **Wireframe rows** (sections 16, 18) — alternating `float: right` / `float: left` rows at `width: 70%`. On smaller screens these convert to CSS grid
- **H2 typography parity** — case study page `h2` elements must never override `font-size` or `line-height`. They inherit the global `--h2-size` variable and line-height rules from `style.css`/`responsive.css`, which are identical to the index page. Only `color` and `margin` may be overridden per-section
- **`display: contents` on wrapper divs** — used in SM/XS/MD to dissolve a wrapper element so its children participate directly in the parent's CSS Grid. Used on `.grid-lines` in `case-study-section3` (makes decorative line divs direct grid items) and on `.challenge` in `case-study-section4` (makes each `h6`+`p` pair participate in the parent grid, aligning all labels in column 1 and all paragraphs in column 2). Note: `display: contents` removes the element's own box but preserves children — absolute/fixed positioning on the dissolved element no longer works
- **CSS Grid for auto-height sections** — when a section uses `position: absolute` children (like section 3's goal items) and needs `height: auto`, convert to `display: grid` with explicit `grid-column` / `grid-row` placement per item. This lets the section height grow with content instead of needing a hardcoded pixel height
- **Aligning mixed-width labels** — to make a column of label+text pairs where all text blocks share the same left edge, use `display: grid; grid-template-columns: max-content 1fr` on the container and `display: contents` on each pair wrapper. The widest label drives column 1 width; all text blocks automatically start at the same x position
