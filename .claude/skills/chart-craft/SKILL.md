---
name: chart-craft
description: Style contract for all data-visualization on randy.digital — keeps every chart in the site's minimalist, monochrome, editorial language and grounded in a consistent architecture. Use when building, embedding, or reviewing any chart, graph, diagram, or data figure for a note or a lab experiment — "add a chart", "make a chart for this note", "visualize this data", "is this chart on-style", "build a bar/flow/ring chart", "review the chart styling". Enforces monochrome hairline marks on the page background with var(--accent) reserved for the single emphasized element; no axes/gridlines/ticks/boxed legends; uppercase letter-spaced mono micro-labels; whitespace-forward, maximal data-ink. Charts are our own thin visx wrappers (@visx/scale + @visx/shape + @visx/curve) rendered as React Server Components (pure SVG, zero client JS) and styled only with design tokens via co-located SCSS modules; interactivity becomes a 'use client' island. Carries the blockJS:false MDX requirement and the line-chart.tsx reference implementation. Code is canonical; DESIGN.md holds the tokens.
---

# chart-craft

Keep every chart in randy.digital's minimalist, monochrome, editorial style — built as visx Server-Component wrappers, styled only with tokens via co-located SCSS modules.

## What it does

A **style contract** for data-visualization. The risk it guards isn't "can we
draw a chart" — it's *drift*: a chart that creeps in with axis ticks, a boxed
legend, a heavy stroke, or a hard-coded color and quietly turns the lab into a
dashboard. This skill is the language every chart speaks, plus the architecture
every chart is built on. It's a detector/guide, not a renderer — the actual
chart components live in `app/components/charts/`. **Code is canonical;
`DESIGN.md` holds the tokens.** The full visual spec, form catalog, and
architecture notes live in `references/` (loaded when relevant — spec A1).

## How to run

Say "add a chart to this note", "visualize this data", "build a flow/ring/bar
chart", "is this chart on-style?", or run `/chart-craft`. Good moments: before
adding any figure to a note or lab experiment, when building a new chart type,
and as a review pass on an existing chart.

## The style contract (the non-negotiables)

- **Monochrome, hairline.** Marks are `var(--muted)`/`var(--fg)` at a thin,
  consistent stroke (~0.5–1px). **`var(--accent)` is reserved** for the single
  element you're pointing at (a threshold marker, the one highlighted series) —
  never decoration.
- **No chrome.** No axes, no gridlines, no ticks, no bounding boxes, no boxed
  legends. Labels float. Let whitespace do the framing.
- **Caps micro-labels.** Uppercase, letter-spaced, small, light,
  `var(--font-mono)`. Section titles use caps + a long horizontal rule (the
  existing `.title` / `band` rhythm).
- **Whitespace-forward.** Maximal data-ink ratio. Decoration is the enemy.
- **Tokens only.** Never hard-code a color or font — pull design tokens so the
  chart tracks light/dark automatically.

→ Full spec + the reference image's vocabulary: `references/style.md`.

## The architecture (how every chart is built)

- **Our wrappers over visx, not a chart library's components.** Build on
  `@visx/scale` + `@visx/shape` + `@visx/curve`; we own the SVG.
- **Server Component by default.** Pure SVG, zero client JS, drawn in the RSC
  pass. Only an *interactive* chart (hover/tooltip, a lab experiment) becomes a
  `'use client'` island.
- **Styled via a co-located `*.module.scss`** (the project CSS convention) — see
  the `css-architecture` memory.
- **`blockJS: false` is required.** next-mdx-remote v6 strips ALL JS expression
  props by default, so `points={[…]}` / `marker={{…}}` arrive `undefined` and
  only string literals survive. The project sets `blockJS: false` in
  `app/components/mdx.tsx`; any MDX-authored chart depends on it.
- **Reference implementation:** `app/components/charts/line-chart.tsx` (prop is
  `points`, not `data`; optional accent `marker`; required `label` for a11y).
  Register new charts in the MDX map in `app/components/mdx.tsx`.

→ Details + the blockJS diagnosis: `references/architecture.md`.

## Building a new chart (checklist)

1. Is it in the catalog? (`references/catalog.md` — line, bundled-flow, orbital
   rings, pyramid, proportional circles.) Match the specced treatment.
2. Server Component unless it needs interaction — then `'use client'` island.
3. visx for math/shapes; emit a responsive `<svg viewBox>` (scales to container).
4. Tokens only, via a co-located `*.module.scss`. No hard-coded colors.
5. No chrome; caps mono micro-labels; one accent element at most.
6. `label` prop for a11y (`role="img"` + `aria-label`).
7. Register in `app/components/mdx.tsx`; charts sit inside `<Margin>` in notes
   (the editorial margin — see the `note-attribution-and-margin` memory).
8. Verify with `pnpm build` (it must prerender as static) and a visual pass in
   both themes.

## Conventions this skill follows

- Spec is `~/.claude/skills/skill-architecture.md`.
- Project-local skill (committed with the repo, like `design-token-drift`)
  because it references this project's components, tokens, and MDX setup.
- Docs-only: no scripts, no secrets. Detail lives in `references/` (spec A1).
- Cross-links: `references/architecture.md` (visx + blockJS), the
  `css-architecture` / `note-attribution-and-margin` memories, and `DESIGN.md`
  as the token source of truth.
