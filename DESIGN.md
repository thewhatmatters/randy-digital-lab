# DESIGN.md — randy-digital

Design source of truth. Tokens here are mirrored into the Tailwind v4
`@theme {}` block in `app/global.css` and **must stay in sync** — `/audit-ui`
flags drift. Read this before building UI. Owned/updated via `/design-md`;
grid implementation via `/use-grid-system`; motion via `/add-motion`.

## Design direction

**Editorial-minimal × technical-monospace.** Restrained and type-forward like
[lab01.dev](https://lab01.dev/) — generous whitespace, content leads, flush-left
— but with a monospace, structural register: mono carries labels, metadata,
navigation, and numbering, with light Swiss/ITS grid discipline (visible
structure, ruled hairlines, numbered indexes `01 / 02 / 03`). Near-monochrome
canvas; colour comes from the lab experiments themselves, with a single signal
red used sparingly for state and emphasis. Light and dark, system-driven.

Personality: precise, understated, a little terminal. The blog reads like an
essay; the lab feels like a workbench.

## Color tokens

Near-monochrome neutrals + one signal red. Defined as runtime CSS variables in
`:root` (light) and overridden under `prefers-color-scheme: dark`, then exposed
to Tailwind via `@theme`. Use semantic names (`bg-bg`, `text-fg`, …), never raw
hex, in components.

| Token (`--color-*`) | Light | Dark | Usage |
|------|-------|------|-------|
| `bg` | `#ffffff` | `#0a0a0a` | page background |
| `surface` | `#f5f5f5` | `#171717` | code blocks, cards, insets |
| `fg` | `#111111` | `#ededed` | primary text |
| `muted` | `#737373` | `#a3a3a3` | metadata, secondary text, mono labels |
| `border` | `#e5e5e5` | `#262626` | hairlines, dividers, grid rules |
| `accent` | `#e5484d` | `#ff6369` | standard text links, focus ring, numbered markers, `::selection` |

**Accent discipline:** red is a *signal*, not decoration. Allowed on: standard
text links, active nav item, focus rings, the index numbers, small status ticks.
Not on: large fills, headings, backgrounds.

**Links:** standard text/content links (`.prose a`) render in `accent` **at
rest** — a link is itself a signal, so this is on-brand, not decoration. The
underline stays for affordance but sits in a softened accent
(`color-mix(in srgb, accent 35%, transparent)`) that solidifies to full `accent`
on hover. Token-driven, so it adapts light/dark automatically. Scoped to
standard text links; **nav and post-list links are navigation** and keep their
own component treatment (don't make those accent).

## Typography

Geist Sans (body/UI) + **Geist Mono carries the technical register** — section
labels, nav, dates, the `01/02/03` numbering, tags, code. Both already loaded
via `geist/font` in `app/layout.tsx`. Flush-left everywhere. `tracking-tight`
on headings; `text-wrap: balance` on titles.

| Role | Family | Size | Line-height | Weight | Notes |
|------|--------|------|-------------|--------|-------|
| Display (hero) | Sans | `clamp(2.25rem, 6vw, 3rem)` | 1.05 | 500 | home/section heroes only |
| H1 | Sans | `2.25rem` | 1.15 | 500 | tracking-tight |
| H2 | Sans | `1.5rem` | 1.2 | 500 | tracking-tight |
| H3 | Sans | `1.25rem` | 1.3 | 500 | |
| Body | Sans | `1rem` | 1.6 | 400 | |
| Caption | Sans | `0.9375rem` | 1.45 | 400 | margin supporting text — `muted`; a tad under body; authored via `<Caption>` |
| Mono label | Mono | `0.8125rem` | 1.4 | 500 | uppercase, `tracking-wide`, `muted` — section labels/eyebrows |
| Metadata | Mono | `0.875rem` | 1.4 | 400 | dates, tags, numbers — `muted` |
| Code | Mono | `0.875rem` | 1.5 | 400 | |

Type scale ≈ 1.25 (major third), base 16px.

## Spacing, grid & rhythm

- **Baseline:** 8px vertical rhythm. Spacing on multiples of 4/8 (Tailwind
  default scale already aligns). Align type and blocks to the baseline.
- **Grid:** 12 columns, **24px (1.5rem) gutter**, flush-left. Profile = **app**
  (place by column line + baseline; relaxed row fields) — see `/use-grid-system`.
  Implemented as `@theme` tokens in `app/global.css` (the single source of
  truth): `--grid-cols: 12`, `--grid-gutter: 1.5rem`, `--grid-maxw: 72rem`
  (= `wide`), `--grid-baseline: 0.5rem` (8px), `--leading-base: 1.5rem` (24px).
  Layout via the `grid-page` + `band` (subgrid) utilities; place children by
  column line with stock `col-start-*`/`col-end-*`.
  - **Page margin** (`--grid-margin`) is responsive: `1.5rem` (24px) mobile →
    `3rem` (48px) ≥768px → `4.5rem` (72px) ≥1024px.
  - **Overlay:** press **`g`** to toggle the column + baseline guides
    (`app/components/grid-overlay.tsx`, a client island; ignores keypresses
    while typing in inputs).
- **Container widths** (`@theme` as `--container-*`):
  - `prose` = `40rem` (640px) — reading column for blog/essays.
  - `wide` = `72rem` (1152px) — desktop container; work/lab index grids, galleries.
- **Radius:** `--radius` = `0.375rem` (6px) — modest; leans square for the
  technical feel. Hairline borders (`1px`, `border` token) do structural work.

## Motion

Layered, with a deliberately **kinetic** home intro (opt-in; heavier than the
rest of the site by design). CSS for the small stuff; GSAP + Lenis for the hero.

- **Shared ease:** `cubic-bezier(0.22, 1, 0.36, 1)` — used by the CSS `rise-in`
  entrance (Experience/Notes/Stack rows + hover nudges) and the route crossfade.
- **Durations:** micro (hover/press) `~180ms`; entrance/exit `~250–450ms`;
  hero reveal `~0.95s`; preloader wipe `~0.8s`.
- **Home hero (kinetic):** masked line-reveal of the display headline +
  scroll-choreographed pinned/parallaxed media, via **GSAP + ScrollTrigger**
  (`app/components/hero.tsx`). A first-load **preloader** veil gates the reveal.
- **Smooth scroll:** **Lenis**, GSAP-ticker-driven (`smooth-scroll.tsx`).
- **Page transitions:** **`next-view-transitions`** crossfade (App-Router-safe
  `startViewTransition`; Barba is incompatible with App Router). CSS: `global.css` §12.
- **Hard rules:** animate `transform`/`opacity` only; never layout properties.
  Always respect `prefers-reduced-motion: reduce` — Lenis off, GSAP jumps to the
  final state, preloader instant, crossfade cut.
- **Tradeoff:** more client JS + some Core Web Vitals cost (accepted); keep an
  eye on CWV via Speed Insights.

## Voice

Used by `/polish-copy`.

- Plain, precise, low-jargon. Sentence case. First person ("I build…").
- Understated confidence — state what a thing is, skip the hype adjectives.
- Mono labels are terse and lowercase-or-uppercase-consistent (`selected work`,
  `notes`, `lab`), never sentence fragments with punctuation.
- Do: "A type-safe content pipeline for the site." Don't: "A blazingly fast,
  cutting-edge content solution!"

---

_Sync check: the `bg/surface/fg/muted/border/accent` colors, container widths,
radius, and font tokens above must match `app/global.css` `@theme` + `:root`
exactly._
