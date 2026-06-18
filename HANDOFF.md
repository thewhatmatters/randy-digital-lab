# Handoff — Chart system, Caption, accent links

_Updated 2026-06-18 · session refresh checkpoint_

## Goal

Rebuild Randy's personal site (Next.js App Router + Tailwind v4): portfolio,
MDX **notes**, a **lab** of experiments. This session added a minimalist
data-viz system, an opt-in margin caption, accent text links, and a project
skill to keep charts consistent.

## Current state (what shipped this session)

1. **Chart system (visx).** `<LineChart>` — our own thin Server-Component
   wrapper over visx (`@visx/scale` + `@visx/shape` + `@visx/curve`):
   `app/components/charts/line-chart.tsx` + `line-chart.module.scss`. Pure SVG,
   zero client JS, token-styled (tracks light/dark), responsive `viewBox`. Props:
   `points` (NOT `data`), optional accent `marker`, required `label` (a11y).
   Registered in `app/components/mdx.tsx`. (Committed: `e8cf19d`, **unpushed**.)
2. **The blockJS fix (root unblocker).** next-mdx-remote v6 strips ALL JS
   expression props by default (`blockJS` security guard) — so `points={[…]}`/
   `marker={{…}}` arrived `undefined`, only string literals survived. Fixed with
   `blockJS: false` in `app/components/mdx.tsx` (first-party content;
   `blockDangerousJS` stays on). Unblocks expression props for ALL MDX components
   site-wide. (Part of `e8cf19d`.)
3. **60% chart refined to be truer.** Reshaped `points` in
   `building-conan.mdx` so reliability slips from the first tokens and
   accelerates past the 0.6 marker — a continuous concave curve, no false
   plateau/cliff (the old flat-then-cliff over-claimed). Caption + aria-label
   updated to match.
4. **`<Caption>` component.** Opt-in muted supporting text for the margin
   (`app/components/margin.tsx` + `.caption` in `margin.module.scss`): `--muted`,
   `0.9375rem` (~15px, a tad under 16px body), registered in `mdx.tsx`, used on
   the chart caption. Replaced an earlier *implicit* `:not()` auto-mute rule
   (which silently muted the conan.sh CTA too — opt-in is better). A component,
   not a bare class, because CSS-module class names are hashed and can't be
   referenced from raw MDX.
5. **Standard text links → accent.** `.prose a` in `global.css` now renders
   `var(--accent)` at rest with a softened accent underline
   (`color-mix(accent 35%)`) that solidifies on hover; token-driven. Scoped to
   content links only — nav/post-list links keep their navigation treatment.
6. **`chart-craft` skill** (project-local, committed-with-repo like
   `design-token-drift`): `.claude/skills/chart-craft/` — style contract +
   architecture + form catalog (line built; flow/rings/pyramid/proportional-
   circles specced). Audited ✅ ready. In CLAUDE.md skills list.
7. **Docs.** DESIGN.md records the accent-link rule + a Caption type role.
   CLAUDE.md gained a Data-viz/charts bullet.

Verified: `pnpm build` passes (11/11 prerender) after each code change; chart,
caption, and accent link confirmed visually.

## Next steps

1. Confirm dark-theme rendering of the accent link + chart by toggling the
   site theme (token-driven, so expected fine — not yet eyeballed in true dark).
2. Build the other catalog chart types on demand (flow/rings/pyramid/
   proportional-circles) per `/chart-craft` when a note needs them.
3. Refresh the Paper canvas (now also: accent links, captions, the chart) —
   run `/design-token-drift` first. Code is canonical; canvas is downstream.
4. Voice pass on notes; portfolio/projects index; remaining lab islands.

## Key decisions (and why)

- **visx over Recharts/Tremor** — unstyled primitives, no forced client runtime,
  composes with hand SVG; stays a Server Component. See memory
  `mdx-blockjs-and-charts`.
- **Caption is opt-in (`<Caption>`), not implicit** — auto-styling every margin
  paragraph had side effects (muted the CTA link). Explicit = intentional.
- **Links are accent at rest** — a link is itself a signal, so it's on-brand for
  the accent-discipline rule, not decoration. Scoped to `.prose a` only.
- **`chart-craft` is project-local** — it references this repo's components,
  tokens, MDX setup (same call as `design-token-drift`).

## Open questions / risks

- Charts depend on `blockJS: false` staying set in `mdx.tsx`. A next-mdx-remote
  major bump could change defaults and silently strip expression props again.
- Accent-link underline uses `color-mix` (fine in modern browsers; the repo
  already uses modern CSS like subgrid w/ fallback).
- Caption color relies on a doubled-class `.caption.caption` (0,2,0) to outrank
  `.prose p` — same trick the pull quote uses; keep it.

## Files & commands in play

- Charts: `app/components/charts/line-chart.tsx` + `.module.scss`; MDX map
  `app/components/mdx.tsx` (note `blockJS: false`).
- Margin/Caption: `app/components/margin.tsx` + `margin.module.scss`.
- Links: `app/global.css` (`.prose a`). Notes: `app/notes/posts/*.mdx`.
- Skill: `.claude/skills/chart-craft/`. Docs: `DESIGN.md`, `CLAUDE.md`.
- `pnpm dev` / `pnpm build`. Headless screenshots via `automate-browser` skill.

## Git state

Branch `main` (tracks `origin/main`). `e8cf19d` (chart system) is committed but
**unpushed**. This session's remaining work (chart refine, Caption, accent
links, chart-craft skill, DESIGN.md/CLAUDE.md) is being committed in focused
commits and pushed now. After push: tree clean, in sync.

## Don't redo

- **Implicit margin-prose muting** (`.margin :not()` auto-caption) — tried,
  reverted; it muted unintended text. Use `<Caption>` explicitly.
- **Sticky / "follows-you-down" margins** — rejected earlier as too jerky.
- **Flat-then-cliff 60% curve** — replaced with the truer continuous decline;
  don't revert to the plateau telling.
- Serif body + drop cap on notes; credits/byline on notes — all rejected.
