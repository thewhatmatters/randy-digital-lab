# Handoff — Preloader: slot-machine drum intro with blur-to-focus reveal

_Updated 2026-06-22 · home/site preloader build_

## Goal

Replace the old wordmark preloader with a **Love, Death + Robots-style intro**: a
slot-machine reel of three icons that spin and clack into place, unique per page,
then reveal the page. Randy signed off ("Love it"). This session built it end to
end and iterated heavily on the reel mechanic and the reveal style.

## What shipped (this session)

Three files — all the preloader work, currently **uncommitted on `main`**:

- **`app/components/reel-glyphs.tsx`** (NEW) — a **12-mark glyph pool** drawn in the
  Services pictogram idiom (`viewBox 40`, `stroke 2`, round joins, `currentColor`) +
  `triadForPath(pathname)`. Per-section triads keyed by first path segment:
  `home [0,1,7]` (diamond·cross·half-disc — the LD+R heart/✕/robot homage),
  `work [3,4,9]`, `notes [11,6,5]`, `lab [8,10,2]`. Sub-routes inherit their
  section's triad; unknown sections hash to a stable triad. **The pool + assignments
  are deliberately first-draft — meant for Randy's redline** (just index triples into
  `POOL`).
- **`app/components/preloader.tsx`** (rewritten) — the intro logic. `'use client'`,
  GSAP timeline in `useLayoutEffect`.
- **`app/components/preloader.module.scss`** (rewritten) — the 3×3 drum + masks.

## The final effect (the arc, in order)

1. **3×3 slot machine.** Three reels are **closed 12-face drums** — a true cylinder,
   one pool glyph per face, `THETA = 30°` (12×30 = 360°, no wrap, no blanks).
   `RADIUS = 119px` from the tiling condition `r = (h/2)/tan(θ/2)` so faces meet.
   Each drum spins `TURNS = 3` full revolutions then settles its **result face on the
   center row** with a `back.out(1.4)` overshoot clack. Drums offset `slot*0.16`s
   left-to-right. `z:-RADIUS` recenters so the front glyph sits flat at full size.
2. **3 visible rows.** Slot window is `$cell * 3` (12rem) tall with `perspective:
   22rem`, so the center row faces front and the rows above/below **tilt away on the
   drum** (the thing Randy specifically wanted). `.strip` is `preserve-3d`; `.cell` is
   absolute, centered (`top:50%; margin-top:-$cell*0.5`), placed via inline
   `transform: rotateX(i*THETA) translateZ(RADIUS)`; `backface-visibility:hidden`.
3. **Off-center rows fade out after landing.** A `--rowfade` CSS var drives each slot's
   fade-mask band width. It starts wide (`12%` — neighbors visible while spinning) and
   GSAP tightens it to **`38%` after landing** (0.5s) so the band sits in the gap
   between the result glyph's ink (~42–58%) and the neighbor ink (~23%/~76%) →
   **only the result row remains**, no remnants. Mask feather `$feather: 8%`.
4. **Hold** `HOLD = 0.9`s on the lone result triad.
5. **Blur-to-focus reveal** (Randy's chosen reveal, beat iris + column-bands). Opaque
   `.cover` fades while the veil's `backdrop-filter: blur(20px→0)` (driven via a JS
   proxy + `applyBlur`) resolves the page from soft to sharp. Reel fades + `scale 0.96`.
6. `preloader:done` (+ `window.__introDone`) fires on complete so the Hero plays its
   masked reveal AFTER. `el.style.display='none'`.

## Key decisions (and why)

- **Plays on EVERY full page load**, not once-per-session. The old `sessionStorage
  introSeen` guard locked Randy out of seeing it after first visit (he only saw a
  pre-hydration flash). Dropped it. Safe because the preloader lives in the
  **persistent root layout** → client-side `next-view-transitions` nav never remounts
  it (in-app nav crossfades). If repeat-refresh ever feels heavy, re-add a gentler cap.
- **Icons start `opacity:0` (CSS)**, revealed by JS only when the spin begins → the
  reduced-motion / suppressed paths show no flash of static glyphs. Reduced-motion
  dismisses instantly.
- **No-JS safety**: `animation: pl-safety 0.1s 5s` lifts the veil if JS never runs
  (bumped from 3s → 5s so it never fires mid-intro; intro completes ~3.3s).
- **Closed 12-face drum** chosen over a flat translateY strip because a gentle-pitch
  flat reel didn't read as "tilted" — a steep 30° closed cylinder makes the drum
  unmistakable without wrap-overlap.
- **Reveal explored 4 ways** (iris, blur, column-bands, mosaic). Randy A/B'd iris vs
  blur vs bands → **chose blur-to-focus**. Iris/bands code is fully in this session's
  history if ever wanted.

## Verify / commands

- `pnpm exec tsc --noEmit` — **clean** (run from project root; the shell `cd`s into
  the automate-browser skill dir during headless checks, so `cd` back first).
- `pnpm dev` running. Headless verify via `automate-browser`: `localStorage.setItem
  ('theme','dark')` in an init script; do NOT clear sessionStorage anymore (guard is
  gone). Reel lands ~1.3s, rowfade done ~2.0s, reveal ~2.9s, `preloader:done` ~3.4s.

## Next steps / open threads

1. **Icon-pool redline** — the 12 marks + per-route `TRIADS` in `reel-glyphs.tsx` are
   first-draft; Randy may want to tune which glyphs/triads.
2. **backdrop-blur CWV check** — blur-to-focus is the one reveal with real GPU cost.
   Fold into an `/audit-ui` pass (handoff already flagged the Services section too).
3. **Internal-nav mini-reel** — only the crossfade today; `triadForPath` is already
   route-aware if a lighter route-change reel is wanted later.
4. Tuning knobs all labelled in code: `TURNS`, `HOLD`, `BLUR`, `perspective`,
   `--rowfade` target (`38`), `$feather`.

## Git state

Branch `main` (tracks `origin/main`). **Committing + pushing now** (Randy asked):
the three preloader files above. Before this: tree was clean at `15ce0ca`. After
push: tree clean, in sync.
