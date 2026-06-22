# Handoff — Services bento as interactive "tool" windows

_Updated 2026-06-22 · home Services rework_

## Goal

Randy's personal site (Next 16 App Router + Tailwind v4). This stretch reworked
the **home Services bento** so each tile *demonstrates* its facet instead of
describing it — a framed "tool" panel over the label + blurb. Two facets now
ship real depicted-tool visuals (Design, Development); three are still icon
placeholders (Strategy, Motion, Systems). Next obvious task: **Motion**'s visual
(plot the real `cubic-bezier(0.22, 1, 0.36, 1)` rise-in ease as a curve).

## Tile anatomy (current, all five tiles)

`app/components/services.{tsx,module.scss}` — each tile is a **tool card**:
- **Tile** = `var(--bg)` + `1px solid var(--border)` with `border-bottom-width:
  2px` (keycap-style grounded edge, matches the command-bar key), `border-radius:
  0.75rem` (softer/rounder — `var(--radius)`≈6px reads sharp at tile scale),
  `padding: 0.25rem` (4px frame). _Was a flat `--surface` fill with no border;
  Randy found that too flat — moved the gray inward (see Panel) for depth + air._
- **Panel** = an inset "screen" on `var(--surface)` + hairline border,
  `border-radius: 0.5rem` (nests in the tile frame). Two variants: default
  centres a pictogram (the 3 placeholders, which read as little artboards on the
  gray screen); `panelMedia` (`padding:0`, `flex:0 0 auto`) full-bleeds a visual
  that **overflows + clips** (the gray is hidden behind the window).
- **Body** = label + blurb on the tile surface, below the panel. Label is
  `clamp(1.125rem, 1.5vw, 1.25rem)` → **20px desktop** (shrunk from 26px at
  Randy's request; the `clamp` MAX is the lever, the `vw` was pinned).
- **Hover** = panel border → `color-mix(in srgb, var(--fg) 24%, var(--border))`,
  the **shared site hover-border** (matches `button` / `command-bar`, NOT a
  one-off `--fg` or `--muted`). Plus rise-in stagger, reduced-motion-aware.
- Layout unchanged: r1 Design `1/8` (span7) + Development `8/13` (span5);
  r2 Strategy `1/5` · Motion `5/9` · Systems `9/13`.

## The two tool visuals (the heart of this session)

Both are **Server Components (zero client JS)**, theme-aware via semantic tokens,
fixed intrinsic size anchored top-left so they bleed past the panel and clip —
"a viewport into the real tool, with the site's own material loaded." Each has a
single **accent moment** and **decorative hover micro-states** (cheap 0.15s
transitions, `cursor:pointer`, reduced-motion drops the movement).

- **`code-window.{tsx,module.scss}`** (Development) — a depicted IDE. Tabs
  (active `margin.tsx` 2nd so it's visible, accent top-bar), breadcrumb,
  explorer (monochrome React/doc glyphs), line-numbered editor showing the
  **real `margin.tsx` source** highlighted by **sugar-high** (`highlight()`,
  the same lib the site's MDX code blocks use; inherits the themed `--sh-*`).
  `--ide-*` SCSS vars alias the semantic tokens. Window `46rem × 19.5rem`.
  Hover: tabs + explorer rows tint.
- **`design-canvas.{tsx,module.scss}`** (Design) — the mirror: a depicted Paper
  canvas. Sidebar (Pages + layer tree, `01·Color` active), tool rail (cursor
  active + 8 tools + `Aa`), board = **real Light/Dark token swatches from
  `global.css`** (`--bg/surface/fg/muted/border/accent` w/ hex + role). `01` in
  accent. `--ui-*` alias semantic tokens. Window `48rem × 19.5rem`. Hover: tools
  scale `1.1`, rows tint, **swatches lift `-3px` + drop shadow**.

## Key decisions (and the corrections behind them)

- **Detour on the Development visual**: file-tree → almost-VS-Code (always-dark,
  hardcoded colours + bright language icons) → Randy: "I didn't want the colours
  exactly… still themed for light/dark, the original colours we had." Final =
  theme-aware monochrome chrome + site's own `--sh-*` syntax + one accent. The
  old `file-tree.{tsx,scss}` was **deleted**.
- **Swatch fills are literal hex** (both Light+Dark rows shown) = documentation;
  only the *chrome* is theme-reactive. Same logic as the code window showing
  literal source.
- **Hover micro-states are decorative only** — Randy wanted them to *feel*
  interactive, explicitly "not that they can do anything."

## Next steps

1. **Motion visual** — real ease curve (`cubic-bezier(0.22,1,0.36,1)`) plotted,
   ball tracing it. Same mould: `panelMedia` + a Server-Component window + one
   accent + decorative hover. Carry the hover treatment into row 2 as built.
2. **Systems visual** — type ramp / grid / token sheet (more of the real system).
3. **Strategy visual** — softest to literalise (flow/annotation board).
4. Standing from before: **/work** data layer (MDX + `utils.ts` like `notes/`);
   footer map CARTO **attribution** still off; swap 2 footer logo placeholders.

## Files & commands in play

- Services: `app/components/services.{tsx,module.scss}` (`MARKS`=placeholder
  icons, `SERVICES`=copy + col/row + optional `visual`). Home: `app/page.tsx`.
- Visuals: `app/components/code-window.{tsx,module.scss}`,
  `app/components/design-canvas.{tsx,module.scss}`.
- Highlighter: `sugar-high` `highlight()` (also used in `app/components/mdx.tsx`).
  Tokens: `app/global.css` (`--sh-*` light+dark, semantic palette).
- `pnpm dev` / `pnpm exec tsc --noEmit` (clean). Headless verify via
  `automate-browser` (Lenis intercepts `scrollTo` → use element
  `scroll_into_view_if_needed`; force theme via `localStorage.setItem('theme',…)`
  in an init script; `.hover()` to capture hover states).

## Git state

Branch `main` (tracks `origin/main`). The tool-windows work shipped in commit
`8adff0f` (pushed). The tile-softening pass (tile → `--bg` + keycap border +
0.75rem radius; gray moved to the panel) is a **follow-up commit + push now** —
only `services.module.scss` + this `HANDOFF.md`. After push: tree clean, in sync.
