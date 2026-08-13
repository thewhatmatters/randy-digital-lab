# Build note — T-011, round 1 (frontend)

## What was built

- **Rename (AC 4/5):** `app/components/work-glow.tsx` → `app/components/glow.tsx`,
  export `WorkGlow` → `Glow`. The component body is untouched except the
  header comment (now describes both surfaces) — the per-theme grayscale
  ramps, the `--bg`-luminance ground judgment, the `data-theme`
  MutationObserver re-read, the deferred WebGL mount, the reduced-motion
  refusal, and `FADE_MS`/speed-0 behavior all carry by construction (same
  file, no fork). Importers re-pointed: `work-tile.tsx`,
  `work-carousel.tsx` (which serves both the modal and full-page seats —
  see ambiguity 1).
- **Lab island (AC 1/2):** new `app/lab/frame.tsx` — `LabFrame`, a
  `'use client'` wrapper hosting exactly the work-tile wake mechanism:
  `useState` awake flag flipped by `onPointerEnter/Leave` +
  `onFocus/onBlur` (React's focus events bubble, so this is
  focusin/focusout — tabbing to any control inside the experiment wakes
  the frame), passed to `<Glow active={awake}/>` for the shader
  mount/speed, while the CSS `:hover`/`:focus-within` drives the opacity
  fade. The experiment passes through as `children`, unmodified, across
  the server/client boundary. `app/lab/page.tsx` (still a Server
  Component) swaps its frame `<div>` for `<LabFrame>`; grid-placement
  utilities stay in the route via a `className` prop (route owns layout,
  island owns behavior).
- **Module (AC 1/3/6):** `app/lab/page.module.scss` — the accent radial is
  gone; `.frame` background is plain `var(--surface)` (so pre-mount,
  post-fade, reduced-motion and no-JS all read as `--surface` inside the
  existing border). Added `isolation: isolate` to `.frame` and a `.glow`
  layer mirroring the work-index pattern: absolute inset, `z-index: -1`
  inside the isolated context (below everything the experiment draws;
  `overflow: hidden` + the 14px radius clip it to the frame's bounds),
  `opacity: 0` → 1 on `.frame:hover/:focus-within` over `1s $ease`
  (`$ease` now `@use`d from the shared `_motion.scss`, the same curve the
  tiles use — not a retyped copy), and `display: none` under
  `prefers-reduced-motion` (belt-and-braces with the component's own
  mount refusal).

## Checks run (build tools only — gates and captures belong to verify)

- `pnpm exec tsc --noEmit` — clean.
- `pnpm test` — 106/106 pass (the style-donor snapshots don't cover the
  touched modules; unchanged baselines).
- `pnpm exec sass app/lab/page.module.scss` — compiles; `$ease` resolves
  to `cubic-bezier(0.22, 1, 0.36, 1)`.
- Not run/verified by me: `pnpm build`, any render check, captures,
  reduced-motion browser check — verify's lane.

## Key choices

- Island lives at `app/lab/frame.tsx` (not `app/components/`): it is
  lab-route-specific and keeps AC 8's diff confinement honest; it shares
  `page.module.scss` rather than growing a second module, since `.frame`
  and `.glow` are one visual object.
- Wake-state shape deliberately byte-parallel to `work-tile.tsx`
  (state → `active` prop; CSS pseudo-classes → fade) per Method, so the
  two surfaces cannot drift.

## Ambiguities flagged

1. AC 4 says "all three /work seats re-point" but only two files import
   the glow — `work-tile.tsx` and `work-carousel.tsx` (the latter is both
   the modal and full-page seat). Both re-pointed; there is no third
   import site. Read as seats ≠ files.
2. Comment-only edits in `work-index.module.scss` and
   `work-carousel.module.scss`: five `work-glow.tsx` filename references
   updated to `glow.tsx`, plus one factual fix ("PulsingBorder" →
   "MeshGradient" — the comment named the wrong shader). These files are
   not strictly in AC 8's diff list, but Sass strips `//` comments so the
   compiled CSS is byte-identical, neither module is snapshotted, and
   leaving comments pointing at a deleted file seemed worse. Flagging
   rather than reverting; trivial to drop if the critic disagrees.
3. No new tests: nothing here has a seam the existing suite's idioms
   (compile snapshots, TS/CSS truth-pinning) would catch better than
   tsc + the verify captures; AC 8's "any tests" read as permissive.

## Proposed simplification (accepted — executed in amendment r1.1 below)

The `.glow` seat CSS is now written three times (work-index,
work-carousel, lab page modules: absolute inset, `z-index: -1`,
`color: var(--fg)`, pointer-events, the 1s fade) and
`work-carousel.module.scss` still hand-declares its own local `$ease`
duplicating `_motion.scss`. Hoisting a `glow-seat` mixin into a
`_glow.scss` partial (with the reduced-motion `display: none` included)
and retiring the local `$ease` would make the seat as fork-proof as the
component now is — one definition, three `@include`s; removal buys
drift-immunity for exactly the property (`transition: opacity 1s $ease`)
that AC 2 pins to the component's `FADE_MS`.

---

# Amendment r1.1 (human-gated; AC 8 + Decisions amended)

## What changed

- **New partial `app/components/_glow.scss`:** one `glow-seat($fade)`
  mixin holding the seat geometry (absolute inset, `z-index: -1`, block,
  full-size, `pointer-events: none`). `$fade: true` (work tile, lab
  frame) interleaves `opacity: 0` + `transition: opacity 1s $ease`
  ($ease from `_motion.scss`) at exactly the positions the seats
  shipped with, so the hoist compiles byte-identical; the always-on
  carousel seat takes the default. One deliberate deviation from my
  original two-mixin proposal: a single parameterized mixin, chosen so
  the compiled declaration order is preserved and the no-change claim
  stays mechanical instead of "reordering is equivalent, trust the
  reasoning".
- **Three consumers re-seated:** `app/components/work-index.module.scss`
  and `app/lab/page.module.scss` → `@include glow-seat($fade: true)`;
  `app/components/work-carousel.module.scss` → `@include glow-seat`.
  Consumer-side differences stay consumer-side as directed: the
  `:hover`/`:focus-within` wake rules and each module's reduced-motion
  `display: none` block (kept local so each module's media block stays
  one block — noted in the partial's header).
- **Inert `color: var(--fg)` deleted from all three seats**, and every
  comment claiming `color`/CSS feeds the shader its palette rewritten to
  the true mechanism: glow.tsx reads the token custom properties itself
  via `getComputedStyle` (first wake + `data-theme` re-reads);
  currentColor was never consulted.
- **`work-carousel.module.scss`'s local `$ease` retired** — now
  `@use './motion' as *` (same `cubic-bezier(0.22, 1, 0.36, 1)` value,
  so `.track`/`.arrow`/`.dot` output is unchanged).

## Compiled-CSS evidence (how I checked)

Compiled all three modules with `pnpm exec sass --style=expanded` before
and after (baselines + afters in the session scratchpad,
`glow-baseline/*.{before,after}.css`) and diffed. Result for each of
page / work-index / work-carousel: **byte-identical except exactly one
deleted line, `color: var(--fg);`** — the whole intended diff in
compiled terms; no reorders, no other changes. Verify can reproduce
with the same two-compile diff.

## Checks run

- `pnpm exec tsc --noEmit` — clean.
- `pnpm test` — 106/106 (donor snapshots untouched; neither donor
  consumes `_glow.scss`/`_motion.scss`).
- Not run: `pnpm build`, captures — verify's lane, as before.
