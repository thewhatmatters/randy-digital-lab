---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-012
title: Lab 02 — the aurora page transition as a live experiment, with its copy prompt
status: Done
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
builder_id: frontend-persona-r1.1
verifier_id: verify-qa
evidence_sha: fcb3cb25b51d56d4f47ed6e06d00103556f9edd0
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

The aurora page transition shipped today (main @ fcb3cb2): the footer
bloom's equalizer, stood up across the viewport on a route change —
bars grow from the bottom edge, the route swaps at the top of that
growth, then the panel travels up and off the top. It should also be a
lab experiment, complete with its copyable prompt, in the spirit of
glimm.dev/#installation.

Structural facts (recon 2026-08-15):

- The lab registry (`app/lab/experiments.tsx`) ALREADY carries a
  `prompt` field — "agent-ready spec to recreate it (the copy prompt)" —
  rendered by `app/components/copy-prompt.tsx`. The copy affordance
  exists; this ticket fills the slot, it does not invent it.
- One experiment today (`01` dev-overlay, measured 2026-08-15), so the
  new entry is `02`.
- Every entry renders LIVE inside a fixed-height, overflow-hidden
  `LabFrame` (app/lab/frame.tsx) carrying the shared glow ground and
  its hover/focus wake (T-011). There is no per-experiment route.
- The transition is `app/components/aurora-sweep.tsx` +
  `aurora-sweep.module.scss`, already sharing `aurora-bars.ts` (the
  12-column arc) and `_aurora.scss` (bar spectrum, panel grid + melt)
  with `footer-reveal`.

The tension to resolve: the shipped effect is full-viewport and bound
to the router; a lab frame is a clipped box with no routing. A demo
that never changes a page is not showing a page transition.

Done means: /lab renders experiment 02 as a working miniature site —
its own nav, real content changes behind the aurora — drawn from the
same definitions the shipped transition uses rather than a copy of
them; the registry entry is complete including a from-scratch prompt an
agent could build from with no access to this repo; the horizontal
sweep variant moves out of the shipped component and into the
experiment as a toggle; a real navigation on the live site still looks
exactly as it does today; and the critic confirms the experiment reads
as a considered piece rather than a rainbow in a box. If the gesture
cannot be made legible at frame scale without changing what it is,
stop and show me rather than quietly retuning the geometry.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->

## AC

1. `/lab` renders a second experiment, numbered `02`, as a live
   in-frame miniature: it has its own nav of at least two destinations,
   activating one changes the panel's content, and the aurora plays
   over that change. The demo is self-contained — activating its nav
   never navigates the real site and never fires the site-wide
   transition.
2. One definition, two seats: a presentational riser is extracted and
   consumed by BOTH `app/components/aurora-sweep.tsx` and the lab
   experiment. No second copy of the bar arc, the bar spectrum, or the
   panel geometry enters the codebase — `AURORA_BARS` and the
   `_aurora.scss` mixins stay the only sources, and the extraction adds
   no third.
3. The registry entry is complete and uses the existing rendering path
   unchanged: `number`, `slug`, `title`, `summary`, `stack`, `fonts`,
   `colors` (token references only, per the registry's own convention),
   `prompt`, `component`. `app/components/copy-prompt.tsx` is not
   modified.
4. The prompt is a from-scratch build spec, self-contained: an agent
   with no access to this repo, in a fresh Next.js App Router project,
   could build the effect from it. It names the gesture, the arc, the
   swap moment, the reduced-motion path, and the two traps this build
   hit — the lighten-blend failure on light grounds, and the bottom
   fade needing a bent ramp rather than a two-stop one. Critic
   criterion (judgment): comparative bar is experiment 01's prompt.
5. The horizontal sweep variant leaves production: the `GESTURE`
   constant and the `'sweep'` branch come out of
   `app/components/aurora-sweep.tsx`, which keeps exactly one path (the
   rise). The variant survives inside the experiment as a viewer-facing
   toggle between the two gestures.
6. A real route transition on the live site is unchanged to the eye.
   Explicit carve-out against AC 2 and AC 5: `aurora-sweep.tsx` and its
   module WILL change (that is what those items require) — what must
   not change is the rendered result. Evidence is capture comparison at
   matched points of the run against `main` @ fcb3cb2, using the
   shipped timing constants (`SWEEP_MS`, `PUSH_AT`) as the sampling
   source rather than remembered figures.
7. Under `prefers-reduced-motion` the experiment does not animate: the
   frame shows a legible static state of the gesture (not a blank
   panel, not a hidden experiment), no animation loop or timer starts,
   and the nav still changes content. The frame's existing glow wake
   behavior (T-011) is unaffected in every motion mode.
8. Keyboard and AT: the demo's nav destinations are real controls,
   reachable and operable by keyboard in DOM order, with a visible
   focus state; the aurora layer itself is `aria-hidden`. A content
   change is perceivable without relying on the animation.
9. Critic criterion (judgment, not mechanical): at frame scale the
   experiment reads as a considered piece rather than a rainbow in a
   box — the gesture is legible, the miniature reads as a site, and the
   frame's glow ground and the aurora do not fight each other.
   Comparative bar: experiment 01 on the same page. Evidence: light AND
   dark captures, at rest and mid-gesture, both gestures.
10. **Amended — see Decisions (promote gate).** `pnpm test`, `pnpm exec
    tsc --noEmit`, `pnpm build` green at the evidence SHA. Diff confined
    to `app/lab/*`, the new experiment component(s), the extracted
    shared riser and its two importers, `app/components/_aurora.scss`
    (the shared skin AC 2 already sanctions — the original wording
    omitted it, which made a diff AC 2 required read as an AC 10
    violation), and any tests.
11. **Amended — see Decisions (r1.1).** The gesture toggle cannot swap
    the layer in flight: activating it while a run is in progress is
    either ignored or restarts cleanly, matching the guard `go()`
    already has via `running.current`. The repro that must stop
    reproducing: click `02 work`, wait ~120ms, click the other gesture.
12. **Amended — see Decisions (r1.1).** `tests/aurora-transition.test.ts`
    pins the LAB seat's use of the shared riser, not only the route
    seat's — AC 2 is "one definition, two seats" and only one seat
    carries an assertion today. Mutation-proven: deleting the riser
    element from `aurora-transition.tsx` must fail the suite (it
    currently leaves all 115 tests green).

## Method

- Lane: frontend. Rubric: ui.
- Pointers: `app/lab/experiments.tsx` (registry entry + prompt),
  `app/lab/page.tsx` / `frame.tsx` / `page.module.scss` (how an
  experiment is seated — the frame is a client island already),
  `app/components/aurora-sweep.tsx` + `aurora-sweep.module.scss` (the
  shipped transition; source of the extraction and of AC 5's removal),
  `app/components/aurora-bars.ts` + `_aurora.scss` (the existing shared
  definitions — extend this pattern, do not start a parallel one),
  `app/components/dev-overlay.tsx` (the reference experiment
  component: self-contained, themed from tokens),
  `app/components/copy-prompt.tsx` (read-only here — AC 3).
- The extraction is the load-bearing move and should happen first: get
  one riser rendering in both seats with the site transition proven
  unchanged (AC 6), THEN build the miniature around it. Building the
  demo first invites a copy that is never un-forked.
- The miniature's "pages" are content, not routes — no router, no
  `next/link`, no history entries. State in the experiment component.
- Round-1 evidence: /lab captures light + dark, at rest and mid-gesture
  for both gestures; a real-navigation capture comparison vs fcb3cb2
  (AC 6); reduced-motion check; keyboard walk-through; gate output.
- Dev gotcha (standing, .sagan/MEMORY.md): editing under a running
  `next dev` can corrupt the /work modal interception — bounce dev and
  clear `.next/dev` before capture runs. Captures for AC 6 should come
  from `next start`, not `next dev`.

## Decisions

- 2026-08-15 (gate, Randy): the demo is a working miniature site with
  its own nav and real content changes — not a replay button, not an
  auto-loop on frame wake. It is a page transition; something has to
  change.
- 2026-08-15 (gate, Randy): extract a shared presentational riser used
  by both seats, rather than letting the lab keep its own copy. Accepts
  that the riser is currently welded to the router interceptor and the
  extraction is real work.
- 2026-08-15 (gate, Randy): the prompt is a from-scratch build spec
  (experiment 01's shape), not an install-and-wire recipe — there is no
  package to install.
- 2026-08-15 (gate, Randy): the horizontal sweep variant moves out of
  production and into the experiment as a toggle; the shipped component
  keeps one path.
- 2026-08-15 (amendment r1.1, Randy): verify's finding 2 (the gesture
  toggle swaps the layer in flight; no AC covered it) is fixed rather
  than deferred, and verify's named missing test (the lab seat's riser
  assertion) is added. Both were reported by verify, which does not fix;
  neither is a critic finding against the unchanged bar, so this is an
  amendment round — labeled r1.1, touching no counter. AC 11 and AC 12
  added and marked Amended.
- 2026-08-15 (PM error, r1 critique): the round-1 critic pack named only
  `.sagan/ledger/T-012/gate/` as its evidence, so the critic never saw
  the `t000/t025/t080/t100` matched pairs verify had captured in
  `work/`. Its NEEDS_EVIDENCE on AC 6 is therefore a pointer-pack
  defect, not an evidence gap — the requested motion sampling already
  existed. The re-critique pack names both directories. Recorded because
  the verdict file stands as written and the reason it says
  NEEDS_EVIDENCE is not the artifact's fault.
- 2026-08-15 (promote gate, Randy): PROMOTE at evidence SHA fcb3cb2
  (tree dirty; artifacts committed immediately after). Critic APPROVED
  r1.1 with 7 low findings, none blocking; verify PASS on all 12 AC
  items across r1 + the r1.1 delta. Round 1's NEEDS_EVIDENCE stands in
  the record as a PM pointer-pack defect, not an artifact defect.
- 2026-08-15 (promote gate, Randy): AC 10 amended to name
  `app/components/_aurora.scss` in its confinement list. Both stations
  independently read the +34 there as in scope because AC 2 sanctions
  that file as a shared source; the bar's wording was the defect, not
  the work. The route-seat assertion the builder added beyond AC 12's
  literal text is likewise accepted in scope (verify: the route seat had
  the identical hole, so it was pinning an import, not a seat).
- 2026-08-15 (promote gate, Randy): two follow-ups logged, NOT done
  here. (a) Blur does not scale: at 375px the measured solid core is 51%
  rise / 41.8% sweep against 79% at desktop frame scale, and the shipped
  route seat degrades the same way (62%) and did before this ticket —
  making blur relative to column width changes both seats and needs its
  own before/after. (b) Rename `aurora-sweep.tsx`: the sweep left
  production, so the file holding the rise is misnamed; deferred so this
  ticket's AC 6 evidence trail, which names the current path, stays
  intact.
- 2026-08-15 (PM, self-lint): no findings. Checked (a) simultaneous
  satisfiability — AC 2/5 mandate changes to `aurora-sweep.tsx` while
  AC 6 demands invariance, resolved by writing the file-vs-rendered
  carve-out into AC 6 explicitly; (b) quoted arithmetic — AC 6 names
  `SWEEP_MS`/`PUSH_AT` as the sampling source instead of repeating
  numbers, and AC 1/the description date the "one experiment today"
  count rather than hard-coding it into a criterion; (c) change vs
  invariance — same AC 6 carve-out.

<!-- sagan:repo-owned:end -->
