# DESIGN.md — randy-digital

> **Placeholder.** This is the design source of truth for the project. Fill in
> the `TODO` values, then mirror the tokens into the Tailwind v4 `@theme {}`
> block in `app/global.css`. The `/design-md`, `/build-ui`, `/use-grid-system`,
> and `/add-motion` skills read this file. Run `/audit-ui` to catch drift.

## Design direction

_TODO — one paragraph on the intended feel. Reference points so far:
[lab01.dev](https://lab01.dev/) (numbered, restrained, type-forward, polished
UI craft). Decide: editorial/minimal vs. expressive/experimental? Light, dark,
or both? Personality of the lab vs. the blog?_

## Color tokens

Map every value into `@theme` as `--color-*`. Tailwind v4 exposes these as
runtime CSS variables — usable in canvas/WebGL sketches too.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-bg` | TODO | TODO | page background |
| `--color-surface` | TODO | TODO | cards, code blocks |
| `--color-fg` | TODO | TODO | primary text |
| `--color-muted` | TODO | TODO | secondary text |
| `--color-accent` | TODO | TODO | links, highlights |
| `--color-border` | TODO | TODO | hairlines, dividers |

## Typography

Starter ships **Geist**. Decide whether to keep it or pair a display/serif face.

| Role | Family | Size / line-height | Weight |
|------|--------|--------------------|--------|
| Display / H1 | TODO | TODO | TODO |
| Heading | TODO | TODO | TODO |
| Body | TODO (Geist?) | TODO | TODO |
| Mono / code | Geist Mono | TODO | TODO |

Set a modular type scale (e.g. 1.2–1.333 ratio) and a base size. Flush-left.

## Spacing, grid & rhythm

- **Baseline:** 8px vertical rhythm (set spacing scale on multiples of 8/4).
- **Grid:** 12-column on a constant gutter — see `/use-grid-system`. Decide
  max content width and gutter. App profile (column-line + baseline) vs.
  editorial (strict fields)?
- **Radius / shadows / borders:** TODO.

## Motion

Defaults the `/add-motion` skill should honor:

- **Durations:** TODO (e.g. 150ms micro, 300ms entrance).
- **Easing:** TODO (e.g. standard ease-out for entrances).
- **Page transitions:** View Transitions API (crossfade) — TODO confirm.
- **Hard rules:** animate `transform`/`opacity` only; always respect
  `prefers-reduced-motion`.

## Voice

_Used by `/polish-copy`. TODO — describe the writing voice (e.g. plain,
confident, low-jargon; sentence case; first person?). Add do/don't examples._

---

_Once filled in, the color + spacing + type tokens here must match
`app/global.css` `@theme` exactly. `/audit-ui` flags divergence._
