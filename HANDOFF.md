# Handoff — Chart refinement: regions, linear curve, caption

_Updated 2026-06-18 · session refresh checkpoint_

## Goal

Rebuild Randy's personal site (Next.js App Router + Tailwind v4): portfolio,
MDX **notes**, a **lab** of experiments. This session refined the 60% chart in
the "Building Conan" note and extended the `<LineChart>` component, then
captured the new conventions in the `chart-craft` skill.

## Current state (what shipped this session)

All changes below are committed + pushed (see Git state). The work refines the
chart system shipped last session.

1. **`<LineChart>` — threshold-region treatment (`regions` prop).** Opt-in,
   requires a `marker`. Fills the area *under the curve*, split at the marker:
   a soft vertical gradient before (the reliable zone fading) and a hairline
   diagonal hatch after (the degraded/"noisy" zone). Semantic, not decoration —
   monochrome (`--fg`/`--muted`), accent stays reserved for the marker line.
   Uses `useId()` for unique `<defs>` ids; stays a pure Server Component (note
   still prerenders static). `app/components/charts/line-chart.tsx`.
2. **`<LineChart>` — `curve` prop (`'monotone'` | `'linear'`).** Straight
   segments for a deliberate "drawn" look; both the line and the two area fills
   share the selected curve. Default stays `monotone` to hold the style
   contract.
3. **Marker label shrunk.** `9px` → `6px` (viewBox units) + letter-spacing, so
   "60%" reads as a quiet micro-label. `line-chart.module.scss`.
4. **60% chart reshaped (the big iteration).** Now `curve="linear"`,
   `strokeWidth={1.5}`, `regions`, and **3 points**: `(0,.93) (0.6,.82) (1,.2)`
   — a gentle slope into the marker, one clean bend ON the marker x, then a
   sharp drop. KEY LEARNING: with linear curve, jaggedness comes from *too many
   points* (every point is a kink), NOT from the curve type. Few points = clean.
5. **Caption rewritten to stand alone.** Final:
   _"Context rot: as an agent's context window fills, its reliability decays —
   slipping from the first tokens, then accelerating past the 60% line."_ Names
   the phenomenon (context rot), mechanism (context window filling), and shape —
   readable without the article. aria-label describes the shape literally for
   screen readers. `app/notes/posts/building-conan.mdx`.
6. **`chart-craft` skill updated to match (code is canonical, docs downstream).**
   `references/catalog.md` line entry: new `curve`/`regions`/`strokeWidth` API,
   the region treatment, and a "few points, not many" shape-discipline note.
   `references/style.md`: clarified the "no gradients" rule as
   *gradients-as-decoration*, with the semantic-fill exception + a "remove it —
   does the chart say less?" test.

Verified: `pnpm build` passes (compiles, note prerenders static) after each
change; chart confirmed visually in BOTH light and dark via headless
screenshots (`automate-browser`). Dark is token-driven via
`[data-theme='dark']` (next-themes) — toggled in the screenshot script, renders
correctly.

## Next steps

1. Build the other catalog chart types on demand (flow/rings/pyramid/
   proportional-circles) per `/chart-craft` when a note needs them.
2. Refresh the Paper canvas — it now LAGS the code (no regions/linear line,
   newer caption). Run `/design-token-drift` first; code is canonical.
3. Voice pass on notes; portfolio/projects index; remaining lab islands.

## Key decisions (and why)

- **Region fills are semantic, so allowed** — the gradient/hatch encode the two
  sides of the 60% threshold; that's data-ink, not chrome. This is the one
  sanctioned exception to chart-craft's "no gradients" rule, now documented.
- **Few points over many for linear charts** — a dense `points` array reads as
  jagged because every point is a kink. Minimum points that tell the story; put
  the single bend on the marker x so it reads intentional.
- **Caption must stand alone** — Randy's bar: a caption carries the whole idea
  without the surrounding prose. Name the subject and the phenomenon, no bare
  "It".
- **Default curve stays monotone** — `linear` is opt-in so the smooth house
  style remains the default for other charts.

## Open questions / risks

- A straight (2-point) line would read as a *steady* decline, not accelerating —
  the 3-point bend is what earns "accelerating past 60%". Keep caption + shape
  in agreement if the points change.
- Charts still depend on `blockJS: false` in `mdx.tsx` (next-mdx-remote strips
  expression props otherwise) — a major bump could regress this silently.

## Files & commands in play

- Chart: `app/components/charts/line-chart.tsx` + `.module.scss`.
- Note: `app/notes/posts/building-conan.mdx` (the `<LineChart>` + `<Caption>`).
- Skill docs: `.claude/skills/chart-craft/references/{catalog,style}.md`.
- MDX map: `app/components/mdx.tsx` (note `blockJS: false`).
- `pnpm dev` / `pnpm build`. Screenshots via `automate-browser` skill
  (set `data-theme='dark'` on `<html>` for dark; dev may run on :3000/:3001).

## Don't redo

- **Many-point linear line** — looks jagged/rough; reverted to 3 points. Don't
  re-densify.
- **Bare-pronoun caption** ("It slips…") — no antecedent, fails the
  stands-alone bar. Name the subject.
- **"falls off fast / steady slide" caption phrasings** — weaker than naming
  context rot directly.
- Earlier rejects still standing: flat-then-cliff 60% curve, implicit
  margin-prose muting, sticky margins, serif body / drop cap / byline on notes.

## Git state

Branch `main` (tracks `origin/main`), in sync after this session's push. Tree
clean. Commit: chart regions + linear curve + standalone caption + chart-craft
docs.
