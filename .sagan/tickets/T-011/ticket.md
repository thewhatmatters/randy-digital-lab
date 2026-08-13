---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-011
title: Lab frames — seat the shared mesh-glow as the experiment frame ground
status: Todo
priority: Medium
assignee:
labels: [frontend, lab, motion]
parent:
url:
linear_updated_at:
# ── mirror-script-owned (stamped by sagan-plan, never by hand) ──────────────
fetched_at:
mirror_version: 1
# ── repo-owned (carried across every fetch; set by the run, not the tracker) ─
builder_id:
verifier_id:
evidence_sha:
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

The /work tiles and carousels got a mesh-gradient glow ground this week
(work-glow.tsx: Paper's MeshGradient, theme-aware grayscale ramps, wake
on hover, WebGL deferred to first wake). The lab should speak the same
language: each experiment frame on /lab gets the glow as its background,
behind the live experiment.

Structural facts (recon 2026-08-12): the lab has no tiles — each
registry entry renders LIVE inside a fixed-height, overflow-hidden
`.frame` (app/lab/page.module.scss) whose background is --surface plus
a static accent radial; the dev-overlay experiment is a centered
max-width card, so the frame ground is genuinely visible around it.
The lab page is a Server Component — the wake state needs a small
client island.

Done means: every experiment frame (one today) wakes its glow on hover
or focus exactly like a work tile, the accent radial is gone with plain
--surface as every at-rest/fallback state, the glow component carries a
work-neutral shared name with /work re-pointed and rendering
identically, theme correctness and reduced-motion behavior carry by
construction, and the critic confirms the glow serves the experiment
rather than fighting it. If the glow cannot sit behind an experiment
without harming its legibility, stop and show me rather than dimming or
altering the experiment itself.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->

## AC

1. Every experiment frame on /lab (today one — `dev-overlay`, measured
   2026-08-12) renders the shared mesh-glow ground behind the live
   experiment content, clipped by the frame's own bounds and stacked
   below everything the experiment draws.
2. Wake parity with the work tiles: the glow fades in on hover or
   focus-within of the frame and fades out on leave, with the same ~1s
   ease and the flow kept running through the fade-out. WebGL mounts
   only on a frame's first wake; shader speed drops to 0 at rest.
3. The accent radial in `.frame` is removed. Every at-rest and fallback
   state — pre-mount, post-fade, reduced motion, no-JS — reads as plain
   `--surface` inside the existing border.
4. One glow component, work-neutral name: `app/components/work-glow.tsx`
   is renamed/moved under `app/components/` (exact name at the
   builder's discretion, e.g. `glow.tsx`), all three /work seats
   re-point, and /work renders identically — import paths may change
   (the explicit carve-out); rendered-output capture comparison is the
   evidence.
5. Theme correctness carries by construction, not by copy: the same
   component keeps the per-theme grayscale ramps and the `data-theme`
   MutationObserver re-read. No lab-specific fork.
6. Under `prefers-reduced-motion` the glow never mounts and the frame
   keeps the static AC-3 background.
7. Critic criterion (judgment, not mechanical): the glow reads as
   ground and never fights the experiment's own palette or contrast.
   Comparative bar: the current /lab page; evidence: light AND dark
   captures, at rest and woken.
8. `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm build` green at the
   evidence SHA. Diff confined to the lab page/module, the renamed glow
   component and its importers, and any tests.

## Method

- Lane: frontend. Rubric: ui.
- Pointers: `app/lab/page.tsx` (Server Component — introduce a small
  client island to host the frame's wake state; the experiment
  components themselves are not modified), `app/lab/page.module.scss`
  (`.frame` radial removal; glow layer placement mirrors the
  work-index pattern — absolute inset, negative z-index inside an
  isolated stacking context), `app/components/work-glow.tsx` (rename +
  re-point importers `work-tile.tsx`, `work-carousel.tsx`).
- The wake mechanism should mirror work-tile.tsx: React state for the
  shader mount/speed, CSS `:hover`/`:focus-within` for the opacity
  fade, so the two surfaces cannot drift.
- Round-1 evidence: /lab captures light + dark, at rest + woken;
  /work tile/modal/detail captures demonstrating AC-4's no-change;
  reduced-motion check; gate output.
- Dev gotcha (standing, .sagan/MEMORY.md): editing under a running
  `next dev` can corrupt the /work modal interception — bounce dev and
  clear `.next/dev` before capture runs.

## Decisions

- 2026-08-12 (gate, Randy): sprint scope — T-010 + T-011 planned
  together, built one at a time (T-010 first; no file overlap).
- 2026-08-12 (gate, Randy): trigger is hover/focus wake, matching the
  work tiles (PM had recommended in-view-permanent; consistency won).
- 2026-08-12 (gate, Randy): the accent radial is replaced, not layered
  or kept as fallback.
- 2026-08-12 (gate, Randy): one shared component under a work-neutral
  name; no lab copy.

<!-- sagan:repo-owned:end -->
