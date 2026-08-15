# QA — T-012, round 1

**Overall: PASS** (10/10 AC executable and passing) with three reported
findings that are the human's call at the gate, not blockers I can resolve:
one scope question the builder already raised, one AC 9 judgment input, and
one low-severity defect.

- Verifier: `verify-qa` — persona `~/.claude/agents/qa/` (present;
  `instructions.md` + `house-context.md` / `verification-evidence.md` /
  `test-strategy.md` / `test-authorship.md` loaded). Role spec wins where they
  conflict: report-only, no source or test file in the repo was edited,
  nothing committed, no branch, no push.
- Evidence SHA: `fcb3cb25b51d56d4f47ed6e06d00103556f9edd0`, **working tree
  DIRTY** — the artifacts are uncommitted. Full listing with per-file sha256:
  `.sagan/ledger/T-012/TREE-STATE.txt`.
- Environment: Chromium 1200 via Playwright 1.62.1, `next start` (never
  `next dev`, per the standing gotcha) on 4312 (worktree) and 4311 (baseline
  worktree at `fcb3cb2`, built and dep-installed separately). Both servers
  killed at end of run; nothing serving now.

## Per-AC verdicts

| AC | Result | Decided by |
|---|---|---|
| 1 | PASS | rendered `/lab`; nav activation changes content, no URL/history change, no site-wide veil |
| 2 | PASS | grep + compile + 11 mutation demos; one gap reported (see Findings) |
| 3 | PASS | registry read + sha256 of `copy-prompt.tsx` |
| 4 | PASS | mechanical checklist against the prompt text (judgment half is the critic's) |
| 5 | PASS | grep exit 1 for `GESTURE` and for band selectors in the production module; mutation M4/M8 |
| 6 | PASS | matched-frame pixel comparison vs `fcb3cb2` — 0 differing pixels at 5 points x 2 schemes |
| 7 | PASS | reduced-motion contexts: no animations, no timers, legible parked frame, nav still works |
| 8 | PASS | keyboard walk-through, focus-ring computed values, Enter/Space activation, AT semantics |
| 9 | PASS (mechanical half) | 12 gate captures delivered; the judgment is the critic's, with measurements attached |
| 10 | PASS with a flagged scope question | three gate commands green; diff enumerated |

### AC 1 — experiment 02 is a live, self-contained miniature

PASS.

- `curl http://localhost:4312/lab` → `id="aurora-transition"` present alongside
  `id="dev-overlay"`; the baseline at 4311 has only `dev-overlay`. Numbered `02`.
- Nav has three destinations (`01 base / 02 work / 03 notes`), three visibly
  different layouts. Content change observed: heading `"Randy"` → `"Work"` →
  `"Notes"`.
- Self-containment, measured in-page:
  `url http://localhost:4312/lab -> http://localhost:4312/lab | history.length
  2 -> 2 | site-wide veil(z95) ever present=false`. There are **0 `<a>`
  elements inside the experiment**, so `sweepTarget()`'s `closest('a')` can
  never match it.
- The aurora plays over the change — see the mid-gesture gate captures.

### AC 2 — one definition, two seats

PASS on the artifact; one coverage gap reported.

- `AURORA_BARS` has exactly two consumers (`footer-reveal.tsx`,
  `aurora-riser.tsx`) and one declaration (`aurora-bars.ts`). The only other
  textual occurrence of the arc is inside experiment 02's copy prompt, which
  AC 4 explicitly requires to be self-contained; the arc test strips template
  literals on purpose and says so.
- Panel geometry exists once: `@include aurora-panel` / `@include aurora-bar`
  appear only in `aurora-riser.module.scss` and `footer-reveal.module.scss`.
  `aurora-sweep.module.scss` no longer declares `.riser` at all.
- Rendered proof of the shared seat: the route seat's DOM at run time carries
  `class="aurora-riser-module-scss-module__…__riser"` — the riser module, not
  the sweep module.
- 11 mutation demos caught; 5 survived. The relevant survivor: the LAB seat can
  stop rendering `<AuroraRiser>` and the suite stays green (Findings §3).

### AC 3 — registry entry complete, `copy-prompt.tsx` untouched

PASS. All nine fields present and typed (`number` `02`, `slug`
`aurora-transition`, `title`, `summary`, `stack`, `fonts`, `colors`, `prompt`,
`component`). `colors` are five token references only, per the registry's own
comment. `copy-prompt.tsx` is not in `git status`; sha256
`b6ed9a29ffd2b7765701fdb1425c8bd64981f0293605adb6ff896bb2769f2f63` recorded.
`app/lab/page.tsx`, `frame.tsx` and `page.module.scss` are likewise unmodified —
the entry went through the existing rendering path with no changes to it.

### AC 4 — the prompt is a from-scratch build spec

PASS on every mechanical clause. Checklist run against the experiment-02 block:

```
PASS names the gesture (stands up / rising past you)
PASS names the arc (12 bars, 39,57,73,86,95,99,99,95,86,73,57,39)
PASS names the swap moment ("At 55%: swap the page")
PASS names the reduced-motion path (prefers-reduced-motion)
PASS trap 1: the lighten-blend failure (plus-lighter + magenta text)
PASS trap 2: the bent bottom ramp ("four stops, not two")
PASS no repo-relative paths in the prompt body
PASS no "this repo" references in the prompt body
```

The comparative judgment against experiment 01's prompt is the critic's, not
mine. Note for it: 01's prompt is ~20 lines of requirements, 02's is ~30 lines
of numbered mechanics including two named traps — different in kind, not just
length.

### AC 5 — the sweep left production

PASS.

- `grep -rn "GESTURE" app/` → **exit 1, 0 matches**.
- `grep -n "band|\.step|forward|back|\$steps" app/components/aurora-sweep.module.scss`
  → **exit 1, 0 matches**.
- The variant survives in the lab as a two-segment `aria-pressed` toggle;
  observed switching gestures by mouse and by keyboard, and both gestures
  captured at rest and mid-run in both schemes.
- Mutations M4 (re-add `GESTURE`) and M8 (re-add `.band` to the production
  module) both fail the suite, so AC 5 is pinned, not just currently true.

### AC 6 — a real route transition is unchanged to the eye

**PASS, by rendering — pixel-identical, not merely computed-equivalent.**

The build note deliberately made no pixel claim. I verified it independently
and did not re-read its argument.

Method (`.sagan/ledger/T-012/work/AC6_pixel-diff.txt` for the full output):

1. `git worktree add --detach <scratch>/baseline fcb3cb2`, `pnpm install
   --frozen-lockfile`, `pnpm build`, `next start -p 4311`. Worktree HEAD
   `fcb3cb2`; `package.json` / `pnpm-lock.yaml` are unchanged between the two
   trees, so the dependency graph is identical.
2. Worktree served on 4312 from the same `pnpm build` that satisfied AC 10.
3. Same navigation on both: `/notes` → click `a[href="/notes/building-conan"]`.
   Both pages are byte-identical between the trees, so the ground under the
   veil is controlled.
4. **Matched by construction, not by wall clock.** The two timers the click
   handler schedules are stretched 300x (installed immediately before the click,
   torn down immediately after) so the veil stays mounted; then every running
   animation is `pause()`d and `currentTime` set to the same value in both
   trees. Sample points are fractions of the shipped constants —
   `0, 0.25, PUSH_AT (0.55), 0.8, 1.0` x `SWEEP_MS (760)`. No guessed
   millisecond figures anywhere.

Result, 1280x800, DSF 1, light and dark:

```
── MASKED (footer world clock excluded) ──
  ac6_dark_t000          differing-px= 0/1024000  max-delta=0  bbox=None
  ac6_dark_t025          differing-px= 0/1024000  max-delta=0  bbox=None
  ac6_dark_t055-PUSH_AT  differing-px= 0/1024000  max-delta=0  bbox=None
  ac6_dark_t080          differing-px= 0/1024000  max-delta=0  bbox=None
  ac6_dark_t100          differing-px= 0/1024000  max-delta=0  bbox=None
  ac6_light_*            all 0/1024000, max-delta=0, bbox=None
```

The mask is one rectangle, `(150,690)-(700,720)`, over the footer's world-clock
strip. The unmasked run is printed in the same file so the mask is auditable:
its entire delta was `15:18:01` vs `15:18:12` — the clock ticked between the two
captures. Nothing else on the page differed at any sample point.

**The DOM delta — the build note's claim, checked.** The build note said to
expect exactly one: the redundant per-bar inline `--sweep-ms`. That is confirmed,
and it is the only delta in the bars' inline styles. To be exact, the veil
subtree's `outerHTML` differs in three ways, all renames:

```
- <div  class="…aurora-sweep-module…__riser" style="--sweep-ms: 760ms;">
+ <div  class="…aurora-riser-module…__riser" style="--rise-ms: 760ms;">
- <span class="…aurora-sweep-module…__riserBar" style="--sweep-ms: 760ms; --bar-h: 39%;">
+ <span class="…aurora-riser-module…__riserBar" style="--bar-h: 39%;">      (x12)
```

i.e. the CSS-module hash prefix (the file was renamed), the panel's custom
property name, and the removal of the redundant per-bar `--sweep-ms`. No
element, no attribute and no ordering changed.

**Computed styles, both schemes.** Every delta on `.veil`, `.riser` and two
sampled bars is a custom-property rename (`--sweep-ms`→`--rise-ms`,
`--sweep-alpha`→`--aurora-alpha`), an animation-name hash rename, or the newly
present `--rise-viewport: 100vh`. The values that decide the render are
identical:

```
riser height   1040px / 1040px      (= 130vh of 800)
riser rect     y=-216 h=1040        identical, both schemes
bar x, width   identical for all 12 bars
filter         blur(6px) / blur(6px)
mask-image     identical
bar background identical
opacity        light 0.75 / 0.75    dark 0.6 / 0.6
animation      0.76s cubic-bezier(0.65,0,0.35,1) both; bars 0.418s both
```

(The only non-rename computed delta was the bars' live `scaleY` — 0.000317 vs
0.000322, ~0.13px of height — because that dump was taken a few ms into each
run before pausing. The frozen frames settle it at zero.)

**End-to-end behaviour, unpatched, 3 runs each tree:**

```
baseline fcb3cb2  swap at +430/+427/+431ms after veil mount, run 762/761/761ms
worktree          swap at +429/+428/+426ms after veil mount, run 762/760/761ms
```

Nominal is 418ms and 760ms; the offset is MutationObserver latency, identical in
both. Both trees land on `/notes/building-conan` with the same `h1`. The work
tile opt-out attribute is still present on `/work` in both.

### AC 7 — reduced motion

PASS, checked in `prefers-reduced-motion: reduce` contexts, light and dark.

```
resting gesture layer: present=true ariaHidden="true" display=block
  opacity 0.75 (light) / 0.6 (dark)
  riser animation-name = "none"
  bar   animation-name = "none", transform = matrix(1,0,0,0.39,0,0)  [12 bars]
running animations inside the frame: []          <- empty, both schemes
setTimeout calls during a nav activation: []     <- none scheduled, both schemes
nav still changes content: "Randy" -> "Work"     <- both schemes
sweep parked: animation-name="none", transform = translate3d(491.4px,0,0)
              (= 70cqw of the 702px seat), 11 steps present
```

Legibility: `AC7_reduced-motion_light_rise_page02-after-nav.png` shows the
"Work" heading, the three tiles and their `01/02/03` labels fully readable with
the parked arc sitting under them; the dark sweep still shows the magenta end of
the spectrum against readable content. Not blank, not hidden.

**T-011 glow wake, all three motion modes:**

```
normal motion, #dev-overlay      rest opacity 0 (no canvas)
                                 hover opacity 1 + canvas mounted
                                 after leave opacity 0, canvas retained
normal motion, #aurora-transition  identical readings
normal motion, focus wake        opacity 1 + canvas   (tab into the nav)
reduced motion, both frames      display:none at rest AND on hover, no canvas
```

Both frames behave identically, which is the T-011 contract. `frame.tsx` and
`page.module.scss` are byte-unchanged (sha256 in TREE-STATE.txt), so nothing
could have altered it.

### AC 8 — keyboard and AT

PASS.

Tab walk from the top of `/lab`. The experiment's five controls arrive
consecutively, in DOM order, with no traps and no skipped control:

```
 12  inFrame=false <BUTTON> "Copy prompt"          (experiment 01's)
 13  inFrame=true  <BUTTON> "rise"    pressed=true   outline=[2px solid rgb(229,72,77)]
 14  inFrame=true  <BUTTON> "sweep"   pressed=false  outline=[2px solid rgb(229,72,77)]
 15  inFrame=true  <BUTTON> "01base"  current=page   outline=[2px solid rgb(229,72,77)]
 16  inFrame=true  <BUTTON> "02work"                 outline=[2px solid rgb(229,72,77)]
 17  inFrame=true  <BUTTON> "03notes"                outline=[2px solid rgb(229,72,77)]
 18  inFrame=false <A> "02Aurora Page Transition"  (out again)
DOM order: ["BUTTON:rise","BUTTON:sweep","BUTTON:01base","BUTTON:02work","BUTTON:03notes"]
```

- Focus rings: nav `2px solid rgb(229,72,77)` offset `3px`; toggle same colour
  and width, offset `2px`. `rgb(229,72,77)` is `--accent`. Captured in
  `gate/AC8_focus-ring_*.png`.
- Operability: `"Randy" --Enter on nav[3]--> "Notes" --Space on nav[1]-->
  "Randy"`. Gesture toggle by Enter: `["rise=true","sweep=false"] ->
  ["rise=false","sweep=true"]`.
- Aurora layer is `aria-hidden` **while it plays** (checked mid-run, not just at
  rest): `{"ariaHidden":"true","pointerEvents":"none"}`.
- Content change perceivable without the animation: `aria-current="page"` moves
  with the nav, and the heading is a persistent unkeyed `<h3 aria-live="polite">`
  announcing one short string. Wireframe bodies are `aria-hidden` (placeholders).
  Nav is labelled `"Miniature site"`, toggle group `role=group aria-label="Gesture"`.

### AC 9 — reads as a considered piece (critic's judgment)

PASS on my half: 12 gate captures delivered, showing the gesture rather than the
frame. The judgment is the critic's; two things it should weigh, both measured
rather than asserted:

1. **The build note's blur flag is confirmed, and it is worse at mobile width
   than the note computed.** Measured solid-core fraction
   `(barWidth - 2*blur)/barWidth`:

   | seat | viewport | bar | solid core |
   |---|---|---|---|
   | route (shipped) | 1600 / 1280 / 375 | 133 / 107 / 31px | 91% / 89% / 62% |
   | lab experiment 02 | ≥1280 / 768 / 375 | 58.5 / 50.5 / 24.3px | **79%** / 76% / **51%** |

   The note predicted ~80% at frame scale; 79% measured, and 79% is the ceiling
   (the miniature caps at 44rem). At 375px it falls to 51% and the capture
   `gate/AC9_lab-375_*_rise_mid-gesture-at-swap.png` shows the arc reading as one
   smooth rainbow rather than twelve columns. The shipped route transition
   degrades the same way at 375 (62%) — that part is pre-existing at `fcb3cb2`,
   not introduced here. At 1280 the columns clearly survive as columns.

2. **The sweep band reads as a gradient, not as eleven steps, at frame scale.**
   `--sweep-blur: 10px` on ~83px steps whose neighbours are 50/50 colour-mixes.
   See `gate/AC9_lab-1280_light_sweep_mid-gesture-at-swap.png` and its dark twin.
   The rise survives the reduction; the sweep's defining detail does not.

I retuned nothing. Full numbers:
`.sagan/ledger/T-012/work/AC9_blur-vs-scale-measurements.txt`.

Also for the critic: the frame's glow ground is awake in the 1280 captures
(the pointer is over the frame), so they show glow and aurora on screen
together — which is the "do not fight each other" question, answerable from
these captures directly.

### AC 10 — gates green, diff confined

PASS on the gates. One scope question, raised by the builder, restated here.

```
pnpm test            EXIT=0   115 pass / 0 fail / 42 suites
pnpm exec tsc --noEmit  EXIT=0   (no output)
pnpm build           EXIT=0   compiled successfully, 17/17 static pages
```

Exit codes read directly, not through a pipe. Logs in `work/gate_*.log`.

Diff (code only):

```
app/lab/experiments.tsx                             AC 10: "app/lab/*"          OK
app/components/aurora-transition.{tsx,module.scss}  AC 10: new experiment       OK
app/components/aurora-riser.{tsx,module.scss}       AC 10: extracted riser      OK
app/components/aurora-sweep.{tsx,module.scss}       AC 10: an importer          OK
tests/aurora-transition.test.ts                     AC 10: "any tests"          OK
tests/em-dash-budget.test.ts                        AC 10: "any tests"          OK
app/components/_aurora.scss                         NOT in AC 10's list      -> see Finding 1
```

Self-containment scan of all seven artifacts: `grep -nE "https?://|url\(|@import"`
→ **exit 1, 0 matches**. No external resources.

Responsive: `/lab` at 375px `scrollWidth=375 clientWidth=375 overflow=false`;
at 1280 likewise. No horizontal overflow introduced.

Console on `/lab`: the only failures are `404 /_vercel/insights/script.js` and
`404 /_vercel/speed-insights/script.js` — expected under a local `next start`,
present at `fcb3cb2` too, not a T-012 defect. No page errors, no React warnings.

## Findings

**1. `_aurora.scss` scope — reported, not adjudicated (my read: in scope).**
The builder flagged this and asked. AC 10's file list does not enumerate
`_aurora.scss`; AC 2 names it as one of the two sanctioned sources and says the
extraction must add no third. The two additions are `$aurora-ease` (moved out of
`aurora-sweep.module.scss`, where it was already marked "kept local while this is
a prototype") and `@mixin aurora-veil` (the translucency the miniature also
needs). Both are moves into the already-sanctioned shared file, and both are
consumed by two or three seats. Copying `opacity: 0.75 / 0.6` into the lab
instead would have created exactly the third source AC 2 forbids. Verified
consequence: the mixin's dark override emits at the same specificity as before
and the computed `opacity` at the route seat is unchanged (0.75 light, 0.6 dark),
so it costs AC 6 nothing. **My read is that AC 2 governs and this is in scope.
The call is the human's at the gate.**

**2. Low-severity defect: switching gesture mid-run swaps the layer in flight.**
`setGesture` is not guarded by `running.current` the way `go()` is.
Repro: `/lab`, click `02 work`, wait ~120ms, click `sweep`.
Expected: the run in progress finishes as a rise. Actual: the rise element is
unmounted mid-flight and a fresh band mounts from its `from` keyframe — observed
DOM after the toggle: `layer child = "…__band …__forward"`. The page still swaps
correctly and the run still ends cleanly (`heading="Notes"` afterwards), so no
state corruption. Cosmetic, reachable in two clicks. No AC covers it. Not fixed —
I am not the builder.

**3. Coverage gap: AC 2's lab seat is unpinned. This is the missing test.**
See below.

**4. Adversarial passes that found nothing.** Double-activation mid-run is
swallowed as designed (`heading="Work"`, the second click ignored). Timers are
cleared on unmount (`useEffect(() => clearTimers, [clearTimers])`). Reduced-motion
preference is re-read on `change`, so toggling the OS setting with the page open
switches the experiment. `matchMedia` is read after mount, not during render, so
hydration is honest. No `<a>` and no router import anywhere in the experiment.

## The missing test

**Nothing pins that the LAB seat renders the shared riser.**

I deleted the riser from experiment 02 —
`<AuroraRiser ms={RISE_MS} />` → `<div className={styles.layer} />` — and all
115 tests stayed green. The suite has the mirror assertion for the route seat
("the shipped seat renders the shared riser, not a local one", which checks the
import and that the seat's module declares no `.riser`), but no equivalent for
the lab. AC 2 is "one definition, **two seats**"; only one seat is pinned.

What it would catch: the exact regression AC 2 exists to prevent and that the
Method warned about — the demo quietly drifting into a lookalike, so the lab
stops demonstrating the thing it claims to demonstrate. It is also the cheapest
possible test: `assert.match(read(LAB_COMPONENT), /from '\.\/aurora-riser'/)`
plus `assert.match(read(LAB_COMPONENT), /<AuroraRiser\b/)` and
`assert.ok(!compile(LAB_MODULE).includes('.riser'))`, three lines beside the
route-seat test it mirrors, in `tests/aurora-transition.test.ts`.

Ranked behind it, from the same mutation run (full log in
`work/MUTATION-LOG.txt`):

- **2nd:** deleting `--rise-viewport: 100vh` from the route seat is undetected.
  The riser then falls back to `100cqh` with no query container. Identical on
  desktop; divergent on a mobile browser with a dynamic toolbar — precisely the
  case the build note says the override exists to preserve. One line pinning
  that the seat sets `--rise-viewport` would hold it.
- **3rd:** deleting the entire `@media (prefers-reduced-motion: reduce)` block
  from `aurora-riser.module.scss` is undetected. AC 7's "legible static state" is
  capture-verified only, never pinned.
- **4th:** the lab dropping `@include aurora-veil` for hardcoded values is
  undetected (a third source of the layer skin).
- **5th:** the skin test catches a fork by *replacement* but not by *override* —
  appending a later `.riserBar { background: … }` rule stays green, because
  `declValue()` reads the first `background:` in the first matching block.

All eleven caught mutations, including the six the build note claimed, were
re-run independently by me and confirmed; the corrected detail is that the
build note's "riser forks the bar gradient" is caught only when the fork
replaces `@include aurora-bar`, not when it overrides it afterwards.

## not_verified

- **AC 9's judgment** — whether the experiment "reads as a considered piece
  rather than a rainbow in a box" is the critic's call. I produced the captures
  and the measurements; I did not rule.
- **AC 4's comparative bar** — whether experiment 02's prompt matches 01's in
  quality is judgment. Only the enumerated mechanical clauses were checked.
- **AC 6 on a mobile browser with a dynamic toolbar.** Both trees were compared
  at 1280x800 desktop Chromium. The `vh`-vs-`cqh` decision the build note
  describes only differs there, and I had no device or emulated dynamic-toolbar
  environment to exercise it. Desktop invariance is proven; mobile invariance is
  argued, not observed.
- **Real assistive-technology output.** AT semantics were verified structurally
  (roles, `aria-current`, `aria-live`, `aria-hidden`, focus order); no screen
  reader was actually driven, so what VoiceOver *says* on a page change is
  unverified.
- **Safari / Firefox.** Chromium 1200 only. `container-type: size` + `cqh` on the
  riser is the newest thing in this ticket and is untested off Blink.
- **Wall-clock AC 6 sampling.** My first attempt sampled screenshots on the wall
  clock and the capture latency (~1.4s to the first frame) made the samples
  unmatched; those files are not evidence and are not in the gate set. The
  frozen-frame method replaced it and is what the PASS rests on.
- **The suite as a whole.** I re-ran and mutation-checked the T-012 tests, but I
  did not audit the other 34 suites' ability to fail.

## Gate captures — open these for the human

All under `.sagan/ledger/T-012/gate/`. 26 files; the twelve AC 9 ones are the
critic's evidence.

**AC 9 — the gesture at frame scale (12):**
`AC9_lab-1280_{light,dark}_{rise,sweep}_at-rest.png`,
`AC9_lab-1280_{light,dark}_{rise,sweep}_mid-gesture-at-swap.png`.
Mid-gesture frames are the animation frozen at the swap point
(`PUSH_AT x RISE_MS` for the rise, `BAND_PUSH_AT x BAND_MS` for the sweep).

**AC 9 — narrow, where the blur question bites (4):**
`AC9_lab-375_{light,dark}_rise_{at-rest,mid-gesture-at-swap}.png`.

**AC 9 — the comparative bar (2):**
`AC9_lab-fullpage_{light,dark}_experiment01-vs-02.png` — both experiments on one
page, which is the comparison AC 9 names.

**AC 6 — the invariance pair (4):** `AC6_route-transition_{light,dark}_at-PUSH_AT_
{A-baseline-fcb3cb2,B-worktree}.png`. A and B are pixel-identical; they are here
so the human can see the transition they are being asked to sign off as
unchanged. The numeric proof is `work/AC6_pixel-diff.txt`.

**AC 7 — reduced motion (6):**
`AC7_reduced-motion_{light,dark}_rise_page01.png`,
`…_rise_page02-after-nav.png` (proves the nav still changes content with no
animation), `…_sweep-parked.png`.

**AC 8 — focus (2):** `AC8_focus-ring_nav-button.png`,
`AC8_focus-ring_gesture-toggle.png`.

Working evidence (not for the gate) is in `.sagan/ledger/T-012/work/`:
`AC6_pixel-diff.txt`, `AC6_veil-dom-and-computed-styles.json`, all 20 AC 6
frames, `AC6_natural-navigation.log`, `AC8_keyboard-and-AT.log`,
`AC9_blur-vs-scale-measurements.txt`, `MUTATION-LOG.txt`, `gate_pnpm-test.log`,
`gate_tsc-noEmit.log`, `gate_pnpm-build.log`,
`AC7_glow-focus-wake_normal-motion.png`. Tree state: `TREE-STATE.txt`.

Servers are down. Per the role spec, live serving at the gate is the PM's job
(`gates.promote_preview`, `pnpm start`).

---

# QA — T-012, round r1.1 (amendment, DELTA verify)

**Overall: PASS.** AC 11 PASS, AC 12 PASS, gates green at 116 tests. Every
other AC item carries its round-1 verdict forward, and the carry is justified
by file hashes rather than by assumption. Two evidence requests from the
round-1 critic are answered: the AC 6 motion pairs are now IN the gate set
under gate-quality names, and the 375px sweep captures the critic asked for
now exist.

- Verifier: `verify-qa` — persona `~/.claude/agents/qa/` (present;
  `agent/instructions.md` + all four skills loaded). Role spec wins: report
  only, no source or test file edited, nothing committed, no branch, no push.
  The four mutation runs below mutated the tree and restored it byte for byte
  (`shasum -a 256 -c` OK on both files after every one, suite back to 116).
- Evidence SHA: `fcb3cb25b51d56d4f47ed6e06d00103556f9edd0`, working tree
  **DIRTY**, as in round 1. Per-file sha256 for this round:
  `.sagan/ledger/T-012/TREE-STATE-r11.txt` (round 1's `TREE-STATE.txt` still
  stands as written).
- Environment: Chromium 1200 via the npx Playwright 1.62.1, `next start -p
  4313` (never `next dev`). Server killed at end of run; port 4313 has no
  listener. Round 1's baseline server on 4311 was not needed this round (see
  AC 6).

## Delta scope, established by hash before anything else

`shasum -a 256` over every T-012 artifact against round 1's `TREE-STATE.txt`:

```
app/components/aurora-transition.tsx   647c5737… -> 93a08970…   CHANGED
tests/aurora-transition.test.ts        0eee12ae… -> e8a2e6da…   CHANGED
app/components/aurora-riser.tsx        1f5417d4…               unchanged
app/components/aurora-riser.module.scss 92dc454c…              unchanged
app/components/aurora-transition.module.scss e21e596e…         unchanged
app/components/aurora-sweep.tsx        d0b0c2fb…               unchanged
app/components/aurora-sweep.module.scss 74c0000a…              unchanged
app/components/_aurora.scss            f247d86f…               unchanged
app/lab/experiments.tsx                f8ce6d1e…               unchanged
tests/em-dash-budget.test.ts           5d0bfa97…               unchanged
copy-prompt / aurora-bars / lab page,frame,module / footer-reveal  unchanged
```

Exactly the two files the build note claims, and no others. That hash table is
what licenses every "carried forward" verdict below.

## Per-AC verdicts, this round

| AC | Result | Decided by |
|---|---|---|
| 11 | **PASS** | live repro at 1280 + reduced motion in both schemes; `work/AC11_in-flight-toggle_r11.log` |
| 12 | **PASS** | M1–M4 re-executed independently; `work/MUTATION-LOG-r11.txt`, `work/AC12_override-gap-proof_r11.txt` |
| 10 | **PASS** | three gates re-run green at 116 tests; diff still confined |
| 6 | **PASS (carried, hash-justified)** | `aurora-sweep.*` and `aurora-riser.*` sha256-identical to round 1; see below |
| 1, 7, 8 | **PASS (re-executed)** | the one changed rendering file could disturb these, so they were re-run, not carried: `work/AC1-7-8_delta-recheck_r11.log` |
| 2, 3, 4, 5 | PASS (carried) | their subject files are hash-identical; AC 2 additionally strengthened by AC 12 |
| 9 | PASS (mechanical half) | new 375 sweep captures added; the judgment remains the critic's |

### AC 11 — the in-flight toggle: PASS

The builder chose DEFER over ignore/restart. Verified on all four claims.

**1. The filed repro no longer reproduces.** `/lab`, click `02 work`, wait
120ms, click `sweep`. The layer was sampled every 30ms for the remaining 880ms
by reading the first child's CSS-module hash prefix, which names the FILE the
class came from (`aurora-riser.module.scss` = RISE, `aurora-transition…__band`
= SWEEP), so this is not a guess about what is on screen:

```
at +120ms, before the toggle press: RISE  rise=true,sweep=false
IMMEDIATELY after the press:        layer=RISE   pressed=[rise=false,sweep=true]
t=+  0 … +557ms   layer=RISE  (19 consecutive samples)
t=+590 … +879ms   layer=none  (the run ended and the layer unmounted)
distinct layer values seen after the press: ["RISE","none"]
VERDICT swap-in-flight: did NOT reproduce
after the run: heading="Work", aria-current="02work"
```

Round 1 recorded the old behaviour as `layer child = "…__band …__forward"`
appearing mid-flight. That value never appears now. Note also the last two
samples: RISE goes straight to `none`, never through SWEEP, so there is no
one-frame flash of the other gesture as the run tears down.

**2. The pressed state moves under the finger.** Read in the same tick as the
click: `pressed = rise=false,sweep=true` while `layer = RISE`. The control is
not dead and does not lie about being pressed; it lies about nothing, because
what it selects is which gesture plays NEXT. One capture shows exactly this
state: `gate/AC11_in-flight-toggle_pressed-moved_layer-held.png` — the toggle
reads `sweep`, the rise is on screen mid-flight.

**3. The next navigation plays the new gesture.** Clicking `03 notes` right
after: `+1ms … +467ms layer=SWEEP` for every sample, heading `Work -> Notes`.

**4. Reduced motion.** `playing` is never true there, so the parked still
follows the toggle immediately. Both schemes:

```
at rest      layer child = aurora-riser…__riser      (RISE)   anims 0
press sweep  layer child = aurora-transition…__band  (SWEEP)  anims 0  — same tick
nav 02 work  heading Randy -> Work, still SWEEP, anims 0
press rise   back to aurora-riser…__riser            (RISE)   anims 0
```

**Adversarial pass (beyond the AC).** Six alternating toggle presses inside one
running rise: `layer=RISE` on all six, pressed state flipped on all six. The
run is not restartable by hammering the control, and the control is not
blockable by the run.

**On the missing AC 11 test: I agree the omission is honest, and I would still
name it as a gap.** The builder is right that a source-level regex pin ("the
layer reads `shown`") is theatre — it asserts a variable name, not a behaviour,
and any rename defeats it while any real regression that keeps the name walks
straight past it. The harness has no DOM (`tests/resolve-ts.mjs` resolves bare
`.ts` only, and cannot import a `.tsx` that imports a stylesheet), so the
cheapest layer that could catch this bug does not exist in this project yet.
That is the honest statement of it. But the behaviour is exactly the kind that
decays silently: `shown = playing ? runGesture : gesture` is one line, three
states, and a future refactor collapsing the two gesture states back into one
would reintroduce the defect with the suite green. So: not a defect in the
build, and not something the builder should have faked — a standing coverage
gap that belongs to the project's test harness, and my named missing test this
round (see below).

### AC 12 — the lab seat's assertion: PASS

Re-executed independently. I did not take the build note's table on trust; the
four mutations were applied by my own script to my own copies of the two
targets, run, and restored (`work/MUTATION-LOG-r11.txt` is my run, not the
builder's).

```
baseline  93a08970…  app/components/aurora-transition.tsx
          92dc454c…  app/components/aurora-riser.module.scss

M1  delete <AuroraRiser ms={RISE_MS} /> from the lab seat   EXIT=1  115 pass / 1 fail
    failing: "aurora-transition.tsx places AuroraRiser and declares no riser of its own"
M2  M1 + drop AuroraRiser from the import list              EXIT=1  115 pass / 1 fail
    same test, same message — proof the import assertion alone never fires
M3  keep @include aurora-bar, add background-image after it EXIT=1  115 pass / 1 fail
    failing: "bar spectrum is one definition (_aurora.scss), not two"   (OVERRIDE)
M4  restate the gradient, one stop 40% -> 44%               EXIT=1  115 pass / 1 fail
    same test                                                          (REPLACEMENT)

restore: shasum -a 256 -c OK on both files after every mutation
final:   pnpm test  116 pass / 0 fail
```

AC 12's named mutation is M1 and it fails the suite. Round 1's finding was that
this same deletion left all 115 green; that is now closed.

**The `bgDecls()` helper genuinely closes the gap — checked, not accepted.** I
ran the OLD `declValue` helper (copied verbatim from round 1's file) against the
M3-overridden CSS, in memory, touching no repo file
(`work/AC12_override-gap-proof_r11.txt`):

```
OLD declValue(mutatedCss, '.riserBar', 'background') === mixin  ->  true
    (true means the old assertion PASSED a genuinely forked skin)
NEW bgDecls(mutatedCss, '.riserBar')  -> 2 declarations:
      linear-gradient(to top, var(--aurora-1) 0%, …)      the mixin's
      linear-gradient(to top, red, blue)                  the override
    count = 2, assertion wants exactly [mixin]  -> fails on the count
NEW bgDecls(cleanCss, '.riserBar')    -> 1 declaration, equals [mixin]  -> true
the override does change what paints: background-image beats the preceding
    shorthand in the same block                          -> true
```

So the builder's claim is exact: the gap was real, the old test passed a forked
bar, and the new one fails it on the count while still failing a replacement on
the value. Both halves proven by M3 and M4 respectively.

**The route-seat element assertion, beyond AC 12's literal text: my read is IN
scope, and I would have named it if the builder had not added it.** AC 12's
text is about the lab seat, but its reason is AC 2's "one definition, two
seats". M2 is the argument: an import assertion alone never fires, so before
this round the ROUTE seat's test would also have passed with `<AuroraRiser`
deleted — it was pinning an import, not a seat. Adding one line to a test the
builder was already editing, to close the identical hole on the other side of a
symmetry claim, is the claim being pinned properly rather than scope creep. It
also reverts on its own if the human disagrees. Flagged, not adjudicated.

### AC 10 — gates, this round

Exit codes read directly, not through a pipe. Logs in `work/gate_*_r11.log`.

```
pnpm test               EXIT=0   116 pass / 0 fail / 43 suites   (115 / 42 in r1)
pnpm exec tsc --noEmit  EXIT=0   0 lines of output
pnpm build              EXIT=0   ✓ Compiled successfully, 17/17 static pages
```

The +1 test / +1 suite is family 5, the lab seat. Diff this round is
`app/components/aurora-transition.tsx` (AC 10's "the new experiment
component(s)") and `tests/aurora-transition.test.ts` (AC 10's "any tests") —
both already inside AC 10's list, so this round adds no new scope question. The
round-1 `_aurora.scss` question stands exactly as filed and is still the
human's call.

### AC 6 — re-confirmed by hash, comparison NOT re-run

`app/components/aurora-sweep.tsx` (`d0b0c2fb…`),
`aurora-sweep.module.scss` (`74c0000a…`), `aurora-riser.tsx` (`1f5417d4…`) and
`aurora-riser.module.scss` (`92dc454c…`) are sha256-identical to round 1, as
is `_aurora.scss` (`f247d86f…`). The one file that changed renders nothing on
any route the AC 6 capture visits: it is lab experiment 02, which lives inside
a `LabFrame` on `/lab`, and the AC 6 comparison navigates `/notes` ->
`/notes/building-conan`.

**Stated plainly: I did NOT re-run the five-point pixel comparison against
`main @ fcb3cb2` this round.** I am citing round 1's, above. No hash moved, so
there was nothing to re-shoot. What I did re-run is the pixel arithmetic over
the promoted files themselves, so the gate set carries its own numbers —
`gate/AC6_motion_PIXEL-DIFF.txt`, 0/1024000 differing pixels at all ten
promoted points.

### AC 1, 7, 8 — re-executed, not carried

`aurora-transition.tsx` is the file these three ACs are about, so carrying them
on a hash would have been dishonest. All re-run at the current tree
(`work/AC1-7-8_delta-recheck_r11.log`); every reading matches round 1.

```
AC 1  url /lab -> /lab, history.length 2 -> 2, 0 <a> in the experiment,
      no site-wide veil, heading Randy -> Work, aria-current -> 02work
      failed requests on /lab: only the two /_vercel 404s (present at fcb3cb2)
AC 8  tab order  rise, sweep, 01base, 02work, 03notes   (DOM order identical)
      focus rings 2px solid rgb(229,72,77), offset 2px (toggle) / 3px (nav)
      Enter -> sweep=true;  Space -> rise=true;  Enter on nav -> heading "Notes"
      h3 aria-live=polite;  gesture layer absent at rest, aria-hidden while playing
AC 7  reduce, light AND dark: layer present, display block, riser animation-name
      "none", bar animation-name "none", bar transform matrix(1,0,0,0.39,0,0),
      running animations 0, timers scheduled during a nav activation []
      heading still changes Randy -> Work
```

### AC 9 — the narrow sweep captures the critic asked for

Round 1's 375 set covered the rise only. Now shot, both schemes, at rest and
mid-gesture, frozen at the band's own swap moment (`BAND_PUSH_AT x BAND_MS`,
both read out of the source at capture time rather than typed from memory:
0.4 x 620 = 248ms).

**A treatment problem I hit and fixed rather than papered over.** The `LabFrame`
only mounts its experiment once the frame wakes (T-011), so an unhovered
capture shows the frame's placeholder icons and no experiment at all. My first
sweep pair was therefore shot hovered, which put the glow ground at full
opacity and made it not comparable with round 1's unhovered-looking rise pair.
The fix: wake the frame, then park the pointer outside its bounding box and let
the glow settle, and shoot BOTH gestures in the same run under that one
treatment. The rise half of that run is in the gate set as
`AC9_lab-375_*_rise_*_r11-matched-control.png` — that, not round 1's 375 rise
pair, is what the new sweep pair should be compared against. Against round 1's
copies the ground differs by ~5% of pixels at >8/255 with no alignment offset
that resolves it, so I am not claiming the two rounds' 375 shots are
interchangeable, and I am supplying my own control instead of asserting they
are. The hovered versions are kept as
`AC9_lab-375_*_sweep_mid-gesture-at-swap_glow-awake.png` — they are the "do
the glow and the aurora fight each other" question at 375, which is a real AC 9
input on its own.

**Measurement to go with the picture** (round 1 measured the sweep at 1280 and
the rise at 375; the sweep at 375 was the missing cell):

| gesture | viewport | step / bar width | blur | solid core |
|---|---|---|---|---|
| sweep | 1280 | 82.97px (11 steps) | 10px | 75.9% |
| sweep | **375** | **34.39px** (11 steps) | 10px | **41.8%** |
| rise (r1) | 375 | 24.3px (12 bars) | 6px | 51% |

At 375 the sweep's eleven steps read as a two-colour yellow-to-blue wash: the
solid core is 41.8% of a step, the lowest figure anywhere in this ticket, and
the capture shows it. Round 1's finding 2 (the sweep reads as a gradient rather
than eleven steps at frame scale) is not just true at 1280, it is roughly twice
as pronounced at 375. The rise survives the reduction better in kind — it still
reads as an arc — though it too loses its columns at 375. I retuned nothing;
these are inputs to AC 9's judgment, which is the critic's.

## Findings, this round

1. **No new defects.** The round-1 finding 2 is fixed and verified fixed. The
   round-1 finding 1 (`_aurora.scss` scope) is untouched this round and stands
   as filed for the human.
2. **AC 11 has no automated pin, and the reason is the harness, not the
   builder.** See AC 11 above. This is my named missing test for r1.1.
3. **The 375 glow-awake case may not be reachable on a real phone.** The frame
   wakes on hover and on focus; a touch device has no hover, so the
   `glow-awake` 375 captures represent the keyboard-focus path and desktop
   narrow windows, not a phone at rest. Not a defect — a caveat on how to read
   those two files.

## The missing test (r1.1)

**Nothing pins that a run finishes in the gesture it started with.**

`shown = playing ? runGesture : gesture` is the whole of AC 11, and it is
un-pinned. What would catch it: any future collapse of `gesture` and
`runGesture` back into one state — the exact refactor that would reintroduce
the defect verify filed in round 1 — with the suite staying green.

Where it belongs: not in `tests/aurora-transition.test.ts`, which is a
source-and-CSS-agreement suite with no DOM. It belongs at a layer this project
does not have yet: a component test with a DOM (`jsdom` or Playwright
component testing) able to render `<AuroraTransition />`, click a nav button,
advance fake timers 120ms, click the toggle, and assert the rendered layer is
still the riser. That is one test plus one new harness. The harness is the
real cost and the real decision, and it would immediately also pay for the
round-1 ranked gaps 2 and 3 (`--rise-viewport` on the route seat, and the
reduced-motion block in the riser module), both of which are also
DOM-or-capture-only today.

Ranked behind it, unchanged from round 1 and still open: `--rise-viewport`
undetected if deleted (2nd), the riser's `prefers-reduced-motion` block
undetected if deleted (3rd), the lab dropping `@include aurora-veil` for
hardcoded values (4th). Round 1's 5th — the override-vs-replacement gap — is
now CLOSED and re-proven closed above.

## not_verified (r1.1)

- **AC 6 was not re-shot.** Carried on file hashes, as stated in AC 6 above.
  If anyone touches `aurora-sweep.*`, `aurora-riser.*` or `_aurora.scss` after
  this line, that carry is void.
- **AC 11 on a touch device.** The repro was driven with a mouse and with the
  keyboard on desktop Chromium. A double-tap on a phone was not exercised.
- **AC 2, 3, 4, 5 were not re-executed**, only hash-carried; AC 2 additionally
  gained the AC 12 pin, which I did execute.
- Everything in round 1's `not_verified` block still stands: AC 9's judgment,
  AC 4's comparative bar, AC 6 on a mobile browser with a dynamic toolbar, real
  assistive-technology output, Safari/Firefox, and the other 34 suites'
  ability to fail.

## Gate captures — where the re-critique should look

All under `.sagan/ledger/T-012/gate/`. The two additions this round are the
answer to the critic's evidence request.

**AC 6 — the growth curve and the travel phase, promoted from `work/` (20 PNGs
+ 1 txt). THIS IS THE NEW EVIDENCE FOR THE AC 6 NEEDS_EVIDENCE.**
`AC6_motion_{light,dark}_p{1..5}-t{000,025,055,080,100}-{run-start,bars-growing,PUSH_AT-swap,panel-travelling,run-end}_{A-baseline-fcb3cb2,B-worktree}.png`
plus `AC6_motion_PIXEL-DIFF.txt`. They sort into the sequence, A and B adjacent
at each point. The critic's objection was that `PUSH_AT` is a fixed endpoint
that proves nothing about motion: `p2-t025-bars-growing` is 45% through the
growth phase and `p4-t080-panel-travelling` is 56% through the travel, so both
are mid-easing and would diverge on any change of duration, easing or travel
distance. Both are 0/1024000 differing pixels.
(The four older `AC6_route-transition_*_at-PUSH_AT_*.png` files are byte-identical
duplicates of the `p3` pair, kept only so round 1's summary still resolves.
They are not a sixth sample point.)

**AC 9 — the sweep at 375, new this round (4 PNGs + 2 comparison controls +
2 glow-awake).**
`AC9_lab-375_{light,dark}_sweep_{at-rest,mid-gesture-at-swap}.png` — the gate
pair, glow asleep.
`AC9_lab-375_{light,dark}_rise_{at-rest,mid-gesture-at-swap}_r11-matched-control.png`
— the rise shot in the same run under the same treatment; compare the sweep
against THESE, not against round 1's 375 rise pair.
`AC9_lab-375_{light,dark}_sweep_mid-gesture-at-swap_glow-awake.png` — the same
frame with the frame's glow ground awake, for the "do they fight each other"
question at 375.

**AC 11 — one capture (1 PNG).**
`AC11_in-flight-toggle_pressed-moved_layer-held.png` — the toggle reading
`sweep` while the rise is still on screen mid-flight. That single image is the
deferred contract.

Round 1's gate captures (AC 7, AC 8, AC 9 at 1280 and full page, AC 9 at 375
rise) are unchanged and still stand.

Working evidence for this round, not for the gate:
`work/AC11_in-flight-toggle_r11.log`, `work/MUTATION-LOG-r11.txt`,
`work/AC12_override-gap-proof_r11.txt`,
`work/AC9_sweep-at-375-measurements_r11.txt`,
`work/AC1-7-8_delta-recheck_r11.log`, `work/AC9_375-sweep-captures_r11.log`,
`work/gate_pnpm-test_r11.log`, `work/gate_tsc-noEmit_r11.log`,
`work/gate_pnpm-build_r11.log`, the four `_treatment-control-r11.png` frames
and the two `_glow-awake` at-rest frames. Tree state:
`TREE-STATE-r11.txt`.

Server is down (port 4313 has no listener). Live serving at the gate remains
the PM's job (`gates.promote_preview`).
