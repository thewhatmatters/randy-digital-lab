# Handoff — Services bento: all four facet "tool" visuals complete

_Updated 2026-06-22 · home Services build-out_

## Goal

Randy's personal site (Next 16 App Router + Tailwind v4). The home **Services
bento** is now feature-complete: each of the four tiles *demonstrates* its facet
with a depicted-tool visual loaded with the site's own material, instead of a
placeholder icon. This session built the **Strategy Sankey** (with a
`/deep-research`-grounded flow model) and the **Motion timeline**, plus a lot of
layout/polish iteration. Randy signed off ("looks pretty bad ass"). Committing +
pushing now.

## The four visuals (all Server Components unless noted; theme-aware via tokens)

Each is a fixed-size element that overflows its tile panel and is clipped (the
`panelMedia` variant in services.module.scss = `padding:0`, full-bleed). One
accent moment each. Shared muted palette across Motion + Strategy: indigo
`#635aa6` · steel `#47729e` · sage `#5d7d54` · clay `#9a6a4f`.

- **`design-canvas.{tsx,scss}`** (Design) — a depicted Paper canvas: sidebar
  (Pages + layer tree, `01·Color` active), tool rail (cursor active + tools),
  board = the **real Light/Dark token swatches from `global.css`**. Each row now
  **leads with the accent swatch** (`--accent`) for a hit of colour. Tool-rail
  hover scales the **icon only** (not the box) so hover ≈ active size.
- **`code-window.{tsx,scss}`** (Development) — a depicted IDE showing the real
  `margin.tsx` source via **sugar-high** `highlight()` (same lib as the site's
  MDX). Active tab marked in `--accent`.
- **`motion-timeline.{tsx,scss}`** (Motion) — a depicted video/motion editor.
  **CLIENT island** (`'use client'`): on hover a rAF loop scrubs the playhead +
  counts the frame/timecode up; the transport **play button toggles to pause**
  and back (click pauses/resumes); mouse-out snaps to default; reduced-motion
  sits it out. Driven via refs (no per-frame re-render). Tracks = the site's
  real motion stack: `hero-reveal.tsx` (filmstrip) + 4 colour-coded clips
  `rise-in` (indigo, ease-curve icon, **square left corners** = continues
  off-left) · `stagger` (steel) · `lenis-scroll` (sage) · `view-transition`
  (clay) — offset to read as the rise-in stagger; the last trails off-canvas.
  Ruler = **mm:ss labels** (`00:01…00:05`) centred per second; playhead at
  `4.53rem` = frame 32 (00:01.02), aligned to the per-second scale
  (`REM_PER_SEC = 4.25`). NO vertical gridlines (tried, removed at Randy's ask).
- **`strategy-sankey.{tsx,scss}`** (Strategy) — a hand-authored SVG Sankey
  (computed ribbon geometry) on a **dot-grid canvas** (small + light: `11px`
  grid, `9%` fg). 4 columns / 3 visible groupings: **Capabilities** (AI/Design/
  Dev, source-coloured) → **Activities** (Personalize/Position/Systems, neutral)
  → **Outcomes** (Market Fit/Loyalty/Brand, accent) → converge into **Business
  Value** which runs **off the right edge** (fixed `40rem` SVG, canvas clips).
  Labels carry a `var(--bg)` paint-order halo. Model grounded in
  `docs/research-strategy-sankey-flow.md`.

## Current layout (services.tsx `SERVICES`, DOM order = visual order)

Pinwheel — both rows span-5-left + span-7-right is NOT it; final is:
- **Top:** Design `1/8` (span 7, 578px) · Development `8/13` (span 5, 406px) — row 1
- **Bottom:** Strategy `1/6` (span 5, 406px) · Motion `6/13` (span 7, 578px) — row 2

This is the **original order** (we did a long back-and-forth reordering, then
Randy said "go back to the original order"). DOM order: Design, Development,
Strategy, Motion. Widths: Design/Motion = span 7; Development/Strategy = span 5.

## Tile anatomy (services.{tsx,scss}) — unchanged this session

Tile = `var(--bg)` + `1px var(--border)` + `border-bottom-width:2px` (keycap
edge) + `border-radius:0.75rem` (soft). Panel = inset `var(--surface)` screen,
`border-radius:0.5rem`. Hover border → `color-mix(in srgb, var(--fg) 24%,
var(--border))` (shared with button/command-bar). Label `clamp(1.125rem,1.5vw,
1.25rem)` = 20px desktop.

## Deep-research artifact

`docs/research-strategy-sankey-flow.md` — the Sankey flow model (capability maps
→ value chain → outcomes → value), 10 sources, weighted node table + rationale.
NOT yet added to `docs/sources/INDEX.md` (it's a research output, not an ingested
source — leave it standalone unless Randy wants it indexed).

## Next steps / open threads

1. **Motion `view-transition` clip** is mostly off-canvas (offset 54%); Randy was
   offered pulling it in — left trailing for now. Revisit if he wants more shown.
2. **/work** data layer still a placeholder (MDX + `utils.ts` like `notes/`).
3. Footer map CARTO **attribution** still off; two footer **logo placeholders**.
4. Consider an `/audit-ui` pass on the Services section (a11y/CWV) — lots of new
   client JS in the Motion island + 4 rich visuals; watch bundle/CWV.

## Verify / commands

- `pnpm dev` (running) · `pnpm exec tsc --noEmit` (clean — run from project root;
  the shell `cd`s into skill dirs, so `cd` back first).
- Headless verify via `automate-browser`: Lenis intercepts `scrollTo` → use
  element `scroll_into_view_if_needed`; force theme via
  `localStorage.setItem('theme','light'|'dark')` in an init script; `.hover()`
  for hover/scrub states. Strategy tile panel measured ~394–406px wide.

## Git state

Branch `main` (tracks `origin/main`). **Committing + pushing now.** Modified:
`design-canvas.{tsx,scss}`, `services.tsx`. New: `motion-timeline.{tsx,scss}`,
`strategy-sankey.{tsx,scss}`, `docs/research-strategy-sankey-flow.md`. After
push: tree clean, in sync. (Prior pushes this arc: `8adff0f`, `51ab91f`.)
