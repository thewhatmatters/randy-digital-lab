---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-007
title: Intro gate — one module owns the reveal state machine, with a watchdog
status: Done
priority: Medium
assignee:
labels: [refactor, motion, risk]
parent:
url:
linear_updated_at:
# ── mirror-script-owned (stamped by sagan-plan, never by hand) ──────────────
fetched_at:
mirror_version: 1
# ── repo-owned (carried across every fetch; set by the run, not the tracker) ─
builder_id: frontend-dieter-r1+r2
verifier_id: verify-hamilton-r1
evidence_sha: d2fa6f4959ffdfce83c476e721a939a78907a0b7
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

Give the intro reveal state machine an owner (architecture review
candidate #2). Today `intro-armed`/`intro-revealed` is a string
convention re-typed across ~10 files; the comments describe a class
(`intro-done`) that nothing reads; two independent reduced-motion checks
must agree across the server/client boundary; and the machine is
fail-closed with no watchdog — if the hero's GSAP timeline ever throws,
the home page's sections stay collapsed at 0fr forever. The
`lenis:stop`/`lenis:start` event pair is the in-house model of what this
seam should look like.

Design decided at the gate (three decisions, Randy-confirmed): a
watchdog — if `intro-revealed` hasn't arrived ~4s after arming, the gate
reveals anyway with the normal cascade transition (failure reads as a
late entrance, never a blank page); the motion-constant hoist rides
along for the five gated SCSS files (shared `rise-in` + ease in the new
partial — the rest of candidate #8 stays queued); `intro-done` is
deleted and the five comments that lie about it are rewritten.

Done means: one module owns the class vocabulary and transitions, one
shared SCSS partial owns the gate selector and the rise-in language for
the gated files, the watchdog provably un-collapses a sabotaged intro,
the dead class is gone, reduced-motion behavior is unchanged, and the
normal intro choreography is frame-for-frame identical — this ticket
ships resilience, zero visible change on the happy path. If the
choreography can't survive the refactor identically, stop and tell me
which part and why.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->
## AC

1. **One owner:** a small module (e.g. `lib/intro-gate.ts` or
   `app/components/intro-gate.ts` — builder's placement call) exports
   the class-name constants and the transitions (`arm`, `reveal`,
   watchdog start/cancel); `preloader.tsx` and `hero.tsx` consume it —
   zero hand-typed `intro-*` string literals remain in TS/TSX outside
   the module (grep-verified). The pre-paint inline script in
   `layout.tsx` may keep its literals (it cannot import at runtime) but
   a unit test pins the script's strings to the module's constants so
   they cannot drift silently.
2. **One gate in SCSS:** a shared partial (e.g. `_intro.scss`) owns the
   `html.intro-armed` / `html.intro-armed.intro-revealed` gate as
   mixin(s); the five gated modules (`experience`, `services`, `posts`,
   `work-index`, `charts/stack-matrix`) consume it — no module declares
   the gate selector chain by hand. **[Bundled hoist]** the same partial
   (or a sibling `_motion.scss`) owns ONE `rise-in` keyframes definition
   + the house ease variable; the five gated modules' duplicate
   definitions are deleted. Compiled-CSS equivalence for all five is
   proven the T-003 snapshot way (sass-diff: order-only shifts,
   cascade-safe).
3. **[Amended — see Decisions] Watchdog (silence semantics):** two
   layers, one 4000ms constant (documented in the module): (a) a
   pre-boot deadline set by the arm script — if the client never boots,
   reveal ≈4s post-arm (the true blank-page case); cleared at preloader
   mount; (b) once running, a silence window — the preloader and hero
   timelines emit per-frame pulses, and 4s of silence (choreography
   died mid-flight) triggers reveal. Firing adds `intro-revealed` via
   the module + `data-intro-watchdog` + console.warn (diagnosable);
   cancelled cleanly on normal reveal; must NOT fire on the healthy
   ≈5.5s choreography. Proven by verify in BOTH modes (temporary
   sabotage, never committed to real routes): dead-from-mount →
   visible ≈4s post-arm; hero timeline killed mid-flight → visible ≈4s
   after the failure.
4. **Dead class deleted:** `intro-done` is removed from
   `preloader.tsx`; the five comments naming it as the mechanism are
   rewritten to describe the real contract. `window.__introDone` and
   the `preloader:done` event are UNCHANGED (verify's capture recipes
   and the hero's trigger depend on them).
5. **Reduced-motion unchanged:** the no-JS and reduced-motion paths
   render content in place exactly as today (the inline script still
   never arms in those cases); the two reduced-motion reads are either
   unified through the module or their agreement is test-pinned.
6. **Happy path frame-identical:** normal intro choreography unchanged —
   verify compares the reveal sequence (preloader → hero → Experience →
   Services cascade timings) against the shipped behavior via timed
   captures/readbacks, and the full byte-compare set holds for
   post-intro settled pages (three notes routes, `/notes`, `/work`,
   `/work/knav` `<main>` regions byte-identical; home `<main>` may
   differ only by the comment/class removals — attested by normalized
   diff).
7. **Gates:** `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm test` all
   exit 0; new unit tests (constants pin, watchdog timer logic if
   extractable) follow house conventions with the mutation standard.

## Method

- **items:** (1) module + constants + transitions (AC 1), (2) SCSS
  partial + five-module migration + hoist (AC 2), (3) watchdog (AC 3),
  (4) intro-done deletion + comment rewrite (AC 4), (5) tests (AC 1/2/
  3/7) — built and checked individually.
- **lane:** quality — motion choreography must survive judgment, round
  cap 3.
- **builder:** frontend role (this is the hero/preloader's home turf).
- **round-1 evidence:** gate runs, sass-diff proofs for the five
  modules, the sabotaged-hero watchdog demonstration (timed capture:
  blank at 3s, revealed ≈4s, `data-intro-watchdog` present), a normal
  intro timing readback vs the shipped sequence, reduced-motion load,
  byte-compare set — with the first build.
- **sources (pointers, not paraphrase):** `app/layout.tsx:73-81` (the
  inline script) · `app/components/preloader.tsx` + `hero.tsx` (the
  transitions today) · the five gated `*.module.scss` ·
  `app/components/smooth-scroll.tsx` (the seam-shape model) ·
  `_card.scss`/`_chip.scss` + `tests/styles.test.ts` (partial +
  snapshot conventions) · `.sagan/MEMORY.md` (intro timings ~2.5–3s,
  capture recipes, `__introDone` dependency).

## Frontend

(builder appends its build note here; builders never verify their own work.)

### Build note — frontend-dieter-r1 (round 1, 2026-08-11)

**Built** (all five Method items):

- `lib/intro-gate.ts` — the owner. Constants (`INTRO_ARMED`, `INTRO_REVEALED`,
  `INTRO_WATCHDOG_ATTR`, `INTRO_VEIL_ATTR`, `REDUCED_MOTION_QUERY`,
  `INTRO_WATCHDOG_MS=4000`), transitions (`INTRO_ARM_SCRIPT` = arm,
  `revealIntro`, `startIntroWatchdog`/`cancelIntroWatchdog`, `introPulse`
  keepalive), and the pure timer core `silenceRemaining`. Directive-free so
  the RSC layout and the client islands both import it (T-004 pattern).
- `app/components/_motion.scss` (house `$ease` + the ONE `rise-in` keyframes
  definition, as a mixin) + `app/components/_intro.scss` (gate mixins:
  `when-intro-armed`/`when-intro-revealed`, `intro-collapse-section`/`-inner`,
  `intro-rise`; emits the keyframes once per consumer). All five gated modules
  migrated; `_card.scss` now takes `$ease` from `_motion` (its own copy
  deleted) so the name resolves from one source everywhere.
- Watchdog (see design + flag below), `intro-done` deleted everywhere, the
  five lying comments rewritten (layout.tsx, experience, services, posts,
  stack-matrix; work-index's refreshed in migration), 18 new unit tests.

**Inline-script mechanism (my call per the Decisions block):** generated at
render time. `layout.tsx` is a Server Component — it CAN import the module at
render/build time; only the script's own runtime can't import. So
`INTRO_ARM_SCRIPT` is built from the exported constants (drift impossible by
construction) AND pin tests still assert the script's strings against the
constants, guarding against a future hand-rewritten template. The stronger
drift risk is now TS↔SCSS, so tests read `_intro.scss` and `preloader.tsx`
from disk and pin them to the constants too.

**Watchdog design + margin reasoning — includes a flag for verify/PM.**
Reading the shipped timelines: the preloader's GSAP timeline is ~3.92s
scripted (drums 1.62s → rowfade 2.02s → +0.9s hold → reveal tweens end
+1.0s), and `__introDone`/`preloader:done` fire at its END; the hero then
runs ~1.56s. So on a healthy load `intro-revealed` lands ≈5.5s after
hydration — the ticket's "~2.5–3s" model predates the slot-machine preloader
rework. A single 4s from-arm deadline would therefore fire on EVERY healthy
load, violating AC 6/"must not fire on the happy path". Design that honors
the gate-locked ~4s constant: two layers on ONE constant.

1. *Pre-boot deadline* (inside the generated arm script): raw `setTimeout`
   armed the moment the gate arms. Fires ≈4s post-arm only if the client
   never takes over (chunk 404 / hydration death — the truly blank case):
   adds `intro-revealed` (normal cascade — CSS keys purely off the class),
   hides the veil (`[data-intro-veil]`), sets
   `data-intro-watchdog="no-boot"`, warns. `startIntroWatchdog()` clears it
   at preloader mount. Margin: hydration is sub-second on normal loads vs
   4000ms — ≥3s headroom; a >4s-hydration device gets content instead of
   choreography, which is the watchdog's whole philosophy.
2. *Silence window* (module): both GSAP timelines pulse via `onUpdate`, plus
   a milestone pulse at `signalDone`. Fire = 4000ms with zero pulses and no
   reveal → same reveal path + `data-intro-watchdog="stalled"` + warn.
   Happy-path margin: pulses arrive every frame while anything animates, so
   the longest normal silence is the event-handoff gap between timelines
   (frame-scale, ms) — even with hero pulses removed the hero leg is 1.56s
   vs 4000ms (≈61% headroom). Hidden tabs defer instead of firing (rAF
   paused ≠ stalled — protects the background-tab load, where the intro
   legitimately pauses).

**⚑ Consequence for AC 3's literal timing:** with a sabotaged HERO (the AC's
suggested demo), the preloader still runs its ~3.9s, so the watchdog reveals
≈4s after `preloader:done` ≈ **7.9s post-arm**, not ≈4s post-arm. "≈4s
post-arm" holds when the intro is dead from the start (script-inject the
preloader/GSAP to throw at mount, or block the JS chunk — the no-boot leg).
Both are "≈4s after the last sign of life". Flagging rather than editing AC:
verify should time from the failure point, or choose the dead-from-mount
sabotage for the literal ≈4s number.

**SCSS equivalence proof** (`.sagan/ledger/T-007/qabuild/sass-diff-*.txt` +
`sass-equivalence-summary.txt`): HEAD worktree (d2fa6f4) vs working tree,
`sass --style=expanded`, all five modules. Raw diffs = identical rule text
relocated (gate rules now emit inside their base blocks) + blank-line
removals only. Canonical proof: postcss walk → every declaration with full
selector/at-rule context, sorted → byte-identical sets for all five, zero
duplicate (context,prop) keys, so no overlapping-property crossing is
possible. Relocations are also specificity-decided (gate chains are (0,2,1)/
(0,3,1) vs (0,1,0) bases), so cascade-equivalent. The services donor
snapshot was regenerated via the sanctioned `UPDATE_SNAPSHOTS=1` flow — its
git diff shows the same order-only shift. Note: `_intro`/`_motion` are
transitively pinned by the services donor snapshot already; I did NOT add
new donor entries (flag: if the bench wants a non-card consumer pinned,
experience is the natural candidate — scope call is the PM's).

**Frozen contract kept byte-for-byte** (and now test-pinned):
`;(window as typeof window & { __introDone?: boolean }).__introDone = true`
and `window.dispatchEvent(new Event('preloader:done'))`. Reveal-order
semantics unchanged: `__introDone` → event → (no-hero fallback) reveal; hero
still reveals on its `onComplete`. Reduced-motion: the three intro reads
(inline script, preloader, hero) now share `REDUCED_MOTION_QUERY` — unified
through the module (AC 5's first option); `smooth-scroll.tsx`/others keep
their own reads, outside this machine's scope.

**Tests:** 18 new in `tests/intro-gate.test.ts` (8 cross-boundary pins — incl.
an automated AC-1 literal scan of app/+lib/ TS/TSX; 4 pure-arithmetic; 6
machine tests on `node:test` mock timers + a minimal DOM double). 5 mutation
demos, all failing as predicted, restored, transcripts in
`.sagan/ledger/T-007/qabuild/mutation-*.md`. One known equivalent mutant,
reported per house rule: removing `cancelIntroWatchdog()` from `revealIntro`
is observationally masked by `onTimeout`'s `isIntroRevealed()` early-return —
kept for timer hygiene, documented here rather than forced into a test.

**Gates:** `pnpm exec tsc --noEmit` → exit 0; `pnpm test` → exit 0 (76 tests,
0 fail). `pnpm build` NOT run (dispatch constraint: builder runs tsc+test
only; AC 7's build gate belongs to verify). No commits; services snapshot
baseline change is in the working tree for review.

**Ambiguity flags:** (1) AC 3 timing — above. (2) AC 1 lists `arm` among the
exported transitions; a runtime `arm()` would be dead code (arming is
pre-paint only), so the arm transition IS the exported `INTRO_ARM_SCRIPT`,
documented as such in the module. (3) The watchdog fires from a *hidden* tab
only after it becomes visible — deliberate, documented in the module.

**Proposed subtraction:** the `opacity: 1; animation: none` "force visible in
case the page was somehow armed" declarations inside the five modules'
`prefers-reduced-motion` blocks are provably inert — `html.intro-armed .row`
(0,2,1) outranks the media-block `.row` (0,1,0), so they can never rescue an
armed page; the real guarantees are (a) the gate never arms under reduced
motion and (b) now the watchdog. Removing them (a follow-up — this round
required compiled-CSS equivalence) deletes a lying safety net, shrinks each
media block to its honest content (the hover-transform disables), and stops
future readers from trusting a rescue that isn't there.

#### Round 2 — REVISE fixes (frontend-dieter-r2)

**Finding 1 (HIGH) — mechanism chosen: `fire()` strips the hero's inline
start state.** New `INTRO_HERO_ATTR` (`data-hero`) constant; a stalled fire
now runs `querySelectorAll('[data-hero] [style]')` → `removeAttribute('style')`
before `revealIntro()`, so the H1 lines (yPercent 115) and bio/CTA/meta
(opacity 0) return to their stylesheet state — visible, in place — and a
stalled reveal can no longer restore the page around a hero-shaped void.
Why not the class-owned-start-state option: moving the start state to CSS
would make the hero timeline animate from a computed transform matrix, where
GSAP's `yPercent` bookkeeping reads resolved px — a real risk to AC 6's
frame-identical guarantee. The strip runs ONLY inside `fire()`, which never
executes on the happy path (pin: the new "normal reveal never touches the
hero inline styles" test) — so the healthy timeline still animates from its
own `gsap.set` start state, and reduced-motion is untouched (never arms;
`fire()` unreachable). The no-boot leg needs no equivalent: the client never
booted, so no `gsap.set` inline styles exist by construction. Residual edge,
flagged not fixed (out of finding scope): hero effect runs but the
preloader's effect never does → the pre-boot deadline fires with hero styles
set; both effects live in the same hydration pass, so this needs a partial
hydration failure between two sibling islands. `preloader.tsx`'s no-hero
fallback selector now consumes `INTRO_HERO_ATTR` too (introducing the
constant while leaving a second hand-typed spelling would recreate the drift
class this ticket deletes); hero.tsx's JSX literal is disk-pinned to the
constant, round-1 style.

**Tests (findings 1 + 3):** +3 → 79 total. (a) machine: stalled fire strips
`[data-hero]` descendants' inline styles (DOM-double-level — the stub now
models the two GSAP-hidden hero elements; verify's live sabotage proves it
in a real browser); (b) machine: normal `revealIntro` leaves them alone
(pins the happy-path non-interference); (c) pin: hero.tsx carries
`INTRO_HERO_ATTR`. Literal-scan roots now
`['app','lib','components','hooks'].filter(existsSync)` per the target
structure. Mutation demos: #6 removed the strip from `fire()` (the exact
round-1 bug) → test (a) fails 78/79; #7 seeded
`components/mutation-demo-offender.ts` with `'intro-armed'` → scan fails
naming it; both restored, transcripts in `qabuild/mutation-6/7-*.md`.

**Findings 2 + 4 (LOW):** HANDOFF.md step 1 rewritten — no more `intro-done`
claim; names `lib/intro-gate.ts` as the contract owner. Module doc now
states the keepalive REQUIREMENT: any future intro timeline MUST pulse
(`introPulse` from `onUpdate` + milestone pulses) or the silence window will
"rescue" a healthy-but-mute segment longer than 4s.

**Gates:** `pnpm exec tsc --noEmit` → 0; `pnpm test` → 0 (79/79).
Transcripts: `qabuild/gate-tsc-r2.txt`, `gate-test-r2.txt`. No build (verify's
gate), no commits, no new deps. Files: `lib/intro-gate.ts`,
`app/components/hero.tsx` (comment only), `app/components/preloader.tsx`
(constant consumption), `tests/intro-gate.test.ts`, `HANDOFF.md`.

## QA

(verify appends the evidence summary here, bound to `evidence_sha`.)

### QA — verify-hamilton-r1, round 1

**Target:** uncommitted working tree over `d2fa6f4` (evidence_sha), built and
served on :3010; baseline = `git worktree add … HEAD`, built + served
sequentially on the same port. Full checks + trimmed outputs in
`events.jsonl` (`evidence.recorded`, run-20260811-180652). **Overall: PASS**
— every AC verified by execution; two report-only findings below.

- **Gates (AC 7):** tsc 0 · build 0 · test 0 (76/76, expected count).
- **AC 1:** comment-stripped scan of app/+lib/ TS/TSX → zero quoted
  `intro-*` literals outside `lib/intro-gate.ts`; the served home HTML's
  inline script is byte-equal to `INTRO_ARM_SCRIPT` exported from the module
  (compared at runtime against a node-exported copy); the 8 pin tests re-run
  green.
- **AC 2:** re-compiled all five modules HEAD vs working (`sass
  --style=expanded`), canonicalized to (context, prop, value) sets —
  byte-identical sets, zero duplicate (context,prop) keys, and every
  rule-order inversion pairs a gate chain ((0,2,1)/(0,3,1)) against a base
  class (0,1,0): cascade-equivalent. Services snapshot regen: order-only,
  and the committed snapshot == a fresh compile.
- **AC 3 (the showcase), all four modes on :3010:**
  - *Happy:* arm→`intro-revealed` at **5.56s** (preloader:done 4.05s); no
    `data-intro-watchdog`, no warn, ever.
  - *Pre-boot sabotage* (route-abort all `_next/static/**/*.js`; arm script
    runs, client never boots): revealed + `no-boot` marker at **4.03s
    post-arm**, console.warn observed. Captures: blank veil at 3s → full
    page, veil `display:none` at 4.5s.
  - *Mid-flight sabotage* (init-script stub swallows the hero's
    `preloader:done` registration — preloader completes normally, hero
    timeline never starts): revealed + `stalled` marker at **4.03s after
    silence began** (t=8.01s; preloader:done t=3.98s), warn observed;
    collapsed at silence+3s, revealed at +4.5s.
  - *Reduced motion:* never arms; content in place at 300ms; no watchdog
    attribute through 5.8s.
  - *Baseline contrast:* the HEAD build under both sabotages stays collapsed
    forever (revealed=false, no marker) — the watchdog demonstrably fixes
    the fail-closed blank page.
- **AC 4:** `intro-done` grep — zero live references (negative-assertion
  guard tests only); five rewritten comments name `intro-revealed` + the
  watchdog. Finding (a): stale `HANDOFF.md:15` still claims the preloader
  "adds the `intro-done` class" — pre-existing doc, outside the AC's five,
  wants a one-line fix.
- **AC 5:** `__introDone` + `preloader:done` observed live at ~4.0s on the
  happy path (the capture recipe still works); byte pins in the suite.
- **AC 6:** timing readback baseline vs working: reveal Δ5514ms vs Δ5563ms
  (~50ms, noise); cascade order + samples match (Experience expands first,
  Services +0.55s; settled rows 602.188px/926.406px in both). Byte-compare:
  all seven `<main>` regions **byte-identical** — including home, stronger
  than the AC's "only class/comment removals" allowance (zero hunks to
  attest).
- **AC 7 independent mutation:** removed `startIntroWatchdog`'s
  clearTimeout/delete of `window.__introWatchdog` (pre-boot handoff broken;
  distinct from the builder's five) → suite fails 75/76 ("start takes over
  from the pre-boot deadline") → restored byte-identical → clean 76/76.
  Transcript: `ledger/T-007/mutation-verify-preboot-handoff.txt`.
- **Adversarial pass:** no-boot sabotage on hero-less `/notes` → revealed +
  marker + warn at ~4s, content opacity 1. Finding (b), report-only: in the
  *stalled* mode the watchdog restores every gated section but the hero
  island's GSAP-hidden elements (H1 lines at yPercent 115, bio/CTA at
  opacity 0 via `gsap.set`) stay invisible — inline styles are outside the
  CSS gate's reach, so the hero block itself remains empty (see
  `stalled-silence4.5s-working.png`). AC 3's letter is met (sections reveal,
  marker, warn, diagnosable); the "never a blank page" spirit holds for the
  page body but not the hero block. Follow-up candidate: have the watchdog
  clear `[data-hero]` inline transforms, or set the hero's start state via a
  class the gate owns.
- **The missing test:** nothing pins that a watchdog reveal actually
  un-hides *hero-internal* content — exactly the gap finding (b) exposes; it
  belongs beside the machine tests as a DOM-level assertion on `[data-hero]`
  descendants after `fire()`.

**Not executed:** hidden-tab deferral at browser level (unit-tested only);
per-frame visual identity (event-timing + cascade-sample + settled-capture
comparison instead); the builder's five mutation demos (transcripts
reviewed; my own executed in their place).

**Gate captures** (the ones to see before sign-off), all in
`.sagan/ledger/T-007/`: `noboot-3s-working.png` + `noboot-4.5s-working.png`
(blank→revealed), `stalled-silence3s-working.png` +
`stalled-silence4.5s-working.png` (collapsed→revealed, and finding (b)),
`happy-settled-working.png`, `reduced-early-working.png`. Working evidence:
`timings-working.json`, `timings-baseline-head.json`,
`adversarial-notes-noboot-4.6s-working.png`,
`mutation-verify-preboot-handoff.txt`.

**Diff surface beyond the expected set:** `app/components/_card.scss`
($ease now from `_motion` — documented), `tests/__snapshots__/services.module.css`
(sanctioned regen), `.sagan/MEMORY.md` + `events.jsonl` (run-owned), and one
stray untracked `recording.mov` at repo root (not build-related; flagging).
Servers on :3010 stopped; :3000 untouched; baseline worktree pruned.

#### QA delta — verify-hamilton-r2 (round 2)

**Target:** same uncommitted working tree over `d2fa6f4` + the r2 fix
(`fire()` strips `[data-hero] [style]` inline styles; `INTRO_HERO_ATTR`;
+3 tests). Own build served on :3010, stopped after. Delta pass — r1
evidence stands for everything the r2 diff doesn't touch. Full checks in
`events.jsonl` (`evidence.recorded`, verifier verify-hamilton-r2, round 2).
**Overall: PASS** — the REVISE finding is fixed and proven live; the fix's
own risk (happy-path interference) is retired by execution.

- **Gates:** tsc 0 · build 0 · test 0 — **79/79**, the expected count.
- **Stalled sabotage re-run (the fix):** same mid-flight kill as r1 —
  revealed + `stalled` marker + warn at **4026ms after silence began**
  (preloader:done 3953ms → fire 7980ms; r1: 4034ms). NEW: computed
  readback of every `[data-hero]` descendant after the fire — H1 lines,
  bio, CTA, meta ALL visible (inline `style` attr null on all five,
  opacity 1, transform none, real rects);
  `[data-hero] [style]` count 0. Capture
  `gate-r2-stalled-revealed-1440-light.png`: headline, bio, CTA, meta and
  the revealed sections fill the exact frame that was a hero-shaped void
  in r1's `stalled-silence4.5s-working.png`.
- **Happy path re-check:** no watchdog attr, zero warns; arm→reveal
  **5539ms** vs r1's 5563ms (24ms, noise). Mid-hero readback at
  preloader:done+400ms: GSAP inline styles PRESENT (the strip never ran),
  line 1 at translateY 13.0%, line 2 at 28.6% — the masked line-rise
  plays from its normal `gsap.set` start state
  (`gate-r2-happy-midhero-1440-light.png`; fades still staged at
  opacity 0, sections still 0fr). Settled: lines at translate(0,0),
  Experience section 602.1875px (r1: 602.188, exact), Services 928.19 vs
  r1's 926.41 (~1.8px cross-session render variance; r1's `<main>`
  byte-compare remains the equivalence proof);
  `happy-settled-r2-working.png` structurally identical to r1's (r1
  capture was 1280/auto-theme; r2 pins 1440/light per protocol).
- **No-boot re-confirm:** revealed + `no-boot` marker + warn at **4005ms
  post-arm** (r1: 4030ms); veil `display:none`; hero has zero `[style]`
  descendants by construction, H1 opacity 1.
- **Independent mutation (new code, distinct from builder's #6/#7):**
  narrowed `fire()`'s strip selector to the child combinator
  (`[data-hero] > [style]`) — a plausible refactor that misses every
  GSAP-hidden element (lines 3 deep, fades 2) → suite fails **78/79**,
  the new stalled-fire DOM test names it → restored byte-identical (cmp)
  → clean 79/79. Transcript:
  `ledger/T-007/mutation-verify-r2-strip-selector.txt`.
- **r1's "missing test" is now pinned** (the stalled-fire DOM assertion) —
  and it demonstrably can fail (my mutation + builder's #6 both trip it).
  The remaining unpinned behavior is the builder-flagged residual edge:
  hero effect hydrates but the preloader effect never mounts → the
  pre-boot deadline fires with hero styles set. Needs a partial hydration
  failure between sibling islands; out of this finding's scope,
  follow-up candidate.

**Not executed:** the full r1 matrix (reduced-motion, baseline contrast,
sass-equivalence, 7-route byte-compare) — delta pass, r2 diff touches only
`lib/intro-gate.ts`, a hero.tsx comment, preloader.tsx constant
consumption, tests, HANDOFF.md; the residual-edge scenario above.

## Decisions

- 2026-08-11 — Ticket compiled from architecture review candidate #2.
  Three design decisions confirmed by Randy at the opening gate:
  **watchdog ~4s → reveal with the normal cascade** (failure = late
  entrance, never blank); **motion-constant hoist bundled** for the
  five gated files (rest of candidate #8 stays queued); **intro-done
  deleted** + lying comments rewritten. Inline-script mechanism (pinned
  literals vs generated) left to the builder within AC 1's test-pin
  constraint.
- 2026-08-11 — **AC 3 amended** (gated, Randy-confirmed): the builder
  measured the SHIPPED choreography at ≈5.5s post-arm (preloader 3.92s
  + hero 1.56s) — the ticket's "~2.5–3s" was a stale MEMORY.md figure
  predating the drum-preloader rework, so a literal 4s-from-arm
  watchdog would fire on every healthy load. Amended to **silence
  semantics**: 4s pre-boot deadline (client never boots) + 4s
  pulse-silence window (choreography dies mid-flight) — one constant,
  failure still reads as a late entrance ≈4s after things go quiet.
  Verify proves both sabotage modes. MEMORY.md timing note corrected
  by the PM.

- 2026-08-11 — **Promoted** after the project's FIRST REVISE cycle
  (round 1: critic-dijkstra-r1 REVISE, 1 high — hero void on stalled
  fire, judged from the capture; round 2: fix + delta verify all-PASS +
  fresh critic-dijkstra-r2 APPROVED, envelope validated). Evidence
  bound to `d2fa6f4`: baseline stays collapsed forever under both
  sabotages, watchdog recovers ≈4s in each mode with the hero
  readback-proven visible, happy path frame-identical, 79/79 tests.
  Carried forward: the partial-hydration edge (hero hydrates, preloader
  never mounts — disclosed deferral); HANDOFF.md is legacy and due for
  retirement at next /checkpoint. Status → Done.

<!-- sagan:repo-owned:end -->
