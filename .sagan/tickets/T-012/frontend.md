# Frontend build note — T-012, round 1

Persona: `~/.claude/agents/frontend/` (present; `instructions.md` +
`house-context.md` / `foundations.md` / `microinteractions.md` /
`flow-critique.md` loaded). Role spec wins where they conflict: no
render-checking below, nothing self-approved, AC/QA blocks untouched.

## What was built

The extraction first, then the miniature around it (Method's ordering).

**1. The shared riser (AC 2).** New `app/components/aurora-riser.tsx` +
`aurora-riser.module.scss`. The riser is now the single home of the
gesture: panel proportions, the growth, the travel, the bottom feather,
the curve, the timing constants. Both seats consume it:

- `app/components/aurora-sweep.tsx` (the shipped route transition)
- `app/components/aurora-transition.tsx` (lab experiment 02)

The move that makes one geometry fit two sizes: every figure in the
riser module is a multiple of `$viewport: var(--rise-viewport, 100cqh)`.
The route seat overrides that with `100vh` (so the shipped result is
arithmetically what shipped, not a re-derivation); the lab seat declares
its miniature viewport `container-type: size` and sets nothing at all.
`130vh` became `calc(1.3 * var(--rise-viewport, 100cqh))`, `-145vh`
became `calc(-1.45 * …)`. No seat restates a panel number.

Why not put `100cqh` on the route seat too and drop the override: on
mobile browsers with a dynamic toolbar, `cqh` tracks the fixed
containing block while `vh` tracks the large viewport. Arguably an
improvement, definitely a change, and AC 6 says unchanged. Kept `vh`.

`_aurora.scss` gained two things rather than letting a second copy
exist: `$aurora-ease` (the transition curve, which had shipped and was
still marked "kept local while this is a prototype", and which both
gestures need) and `@mixin aurora-veil` (the layer's translucency plus
the dark-theme step, which the miniature's veil and its sweep band both
need). **Flag:** AC 10's diff list does not enumerate `_aurora.scss`,
but AC 2 names it as one of the two sanctioned sources, and the
alternative was hand-copying `opacity: 0.75 / 0.6` into the lab. I took
AC 2's instruction over AC 10's file list; say so if that reads wrong.

**2. Experiment 02 (AC 1, 3).** `app/components/aurora-transition.tsx` +
module, registered in `app/lab/experiments.tsx`. `app/lab/page.tsx`,
`frame.tsx`, `page.module.scss` and `copy-prompt.tsx` are untouched —
the existing rendering path took the entry as-is.

A miniature site: a window with the real site's own numbered nav
(`01 base / 02 work / 03 notes`), three visibly different page layouts,
and the aurora clipped to the window's own viewport. Pages are content,
not routes — `useState`, no router, no `next/link`, no history. The nav
items are `<button>`s, so `sweepTarget()` in the shipped interceptor
(which requires `closest('a')`) cannot see them: the demo can neither
navigate the real site nor wake the real transition.

Two composition decisions worth the critic's eye (AC 9):

- **The window is centred at 44rem and does not spill sideways.** A page
  transition originates at the bottom edge of a viewport; if the window
  overflowed the frame the way experiment 01's card does, the rise would
  start off-screen and the gesture would stop reading. 44rem is
  experiment 01's own measure, so the lab index reads as one centred
  column across both frames.
- **The aurora is clipped to the miniature; the glow ground is
  everything around it.** That is the answer to "do not fight each
  other": they occupy disjoint regions and read as figure and ground.
  The window's `--bg` fill and its shadow separate the planes.
- The window still runs off the frame's bottom edge (no bottom border,
  square bottom corners) because that edge IS the miniature's floor,
  which is where the light comes from.

**3. The sweep left production (AC 5).** `GESTURE` and the `'sweep'`
branch are gone from `aurora-sweep.tsx`; the band's markup, `$steps`,
`.band/.step/.forward/.back` and its keyframes moved into the lab module
(moved, not duplicated — nothing about the band exists in two places
now), with `vw/vh` swapped for `cqw/cqh`. In the lab it is a viewer
toggle: `gesture` label + a two-segment control above the window.

**Slightly beyond AC 5's literal text:** with the sweep gone, `NAV_ORDER`,
`rank()` and the `Direction` type in `aurora-sweep.tsx` were dead —
they existed only to give the band a direction ("`rise` has one
direction", as the file's own comment said). They are deleted, and the
`direction` state that doubled as the run flag is now a boolean
`playing`. The concept survives where it means something: the
miniature's nav order gives the band forward/back. If the critic reads
that as scope, it reverts cleanly without touching anything else.

**4. Reduced motion (AC 7).** No timer is ever scheduled: `go()` returns
after `setPage` when reduced. The gesture layer is rendered permanently
instead of per-run, parked as a **real frame of the real animation**, not
a bespoke static graphic:

- rise: `animation: none` on the panel (so it is at rest) and
  `scaleY(0.39)` on the bars. 0.39 is derived, not chosen —
  `0.5 / (0.99 × 1.3)` is the growth that puts the crest exactly on the
  seat's mid-line.
- sweep: the band parked at `70cqw`, late in its run, off to the right.

Both leave the page's heading and its left-aligned content clear, which
is the point: freezing at the swap would be the more dramatic frame and
the wrong one (fully grown, the arc covers the whole seat and a
reduced-motion viewer is left looking at a rainbow with the page hidden
behind it). Nothing in the frame's glow wake (T-011) was touched in any
motion mode.

**5. Keyboard/AT (AC 8).** Nav and toggle are real `<button>`s in DOM
order (tools row, then nav), each with a `:focus-visible` outline in the
house form (`2px solid var(--accent)`). Current page carries
`aria-current="page"` (accent index + fg name, the site's own nav
signal). The gesture layer is `aria-hidden`. The page heading is a
persistent, unkeyed node with `aria-live="polite"`, so the change is
announced as one short string; the wireframe bodies are `aria-hidden`
(they are placeholders, not content worth announcing).

**6. Tests.** New `tests/aurora-transition.test.ts` (8 tests) plus the
new component added to T-010's em-dash string sites. See below.

## AC 6 — what I can and cannot claim

The role spec forbids me render-checking my own work, so **I make no
pixel claim**. What I did establish, by compiling both trees:

Baseline `git show fcb3cb2:app/components/aurora-sweep.module.scss`
compiled against its `_aurora.scss`, vs the working tree's
`aurora-sweep.module.scss` + `aurora-riser.module.scss` compiled the
same way. Declaration-level comparison of the rise path:

| | HEAD fcb3cb2 | working tree |
|---|---|---|
| `.riser` height | `130vh` | `calc(1.3 * var(--rise-viewport, 100cqh))`, seat sets `100vh` |
| `aurora-rise` 100% | `translate3d(0, -145vh, 0)` | `translate3d(0, calc(-1.45 * var(--rise-viewport, 100cqh)), 0)` |
| `.riser` other decls | grid/blur/inset/mask/will-change/animation | identical, `--sweep-ms` → `--rise-ms` |
| `.riserBar` | 6 decls | identical, `--sweep-ms` → `--rise-ms` |
| `.veil` | pos/inset/z/overflow/pointer/contain/opacity | same set, `contain` before `overflow`, `--sweep-alpha` → `--aurora-alpha` |
| dark override | `[data-theme=dark] .veil { --sweep-alpha: .6 }` | same rule, same specificity, emitted earlier in file |

Every delta is a custom-property rename, a `calc` form that evaluates to
the identical length, or an order-only shift with no overlapping
properties. **Computed-equivalent, not byte-equivalent** (house
vocabulary). Timing is unchanged by construction: `SWEEP_MS` and
`PUSH_AT` are now bound to `RISE_MS` / `RISE_PUSH_AT`, still 760 / 0.55,
and a test pins them against the compiled keyframes.

**One DOM-bytes change verify should expect:** the per-bar inline
`--sweep-ms` is gone. It was redundant (custom properties inherit); the
riser sets `--rise-ms` once on the panel. Computed animation durations
are unchanged; the `<span>` elements simply no longer carry a duplicate
style attribute.

**Two things only a capture can settle**, both deliberate:

1. The route seat's rendered result under the above. I believe it is
   identical; I did not look.
2. The blur constants are absolute (`--aurora-blur: 6px`,
   `--sweep-blur: 10px`) while the miniature is roughly a 2.6x
   reduction, so at frame scale the melt is proportionally stronger:
   6px on ~59px bars (44rem / 12) against 6px on ~120px bars at
   1440. Solid core drops from ~90% of a column to ~80%, so the columns
   should still read as columns rather than as a smooth gradient. The
   ticket says stop rather than quietly retune, so **I retuned nothing** —
   flagging the arithmetic instead. If the critic's captures show mush,
   the fix is a decision, not a nudge.

## Checks run (real results)

- `pnpm test` — **115 pass, 0 fail**. The new file contributes 8 of
  those; the pre-existing
  suite is unchanged and still green, including T-010's em-dash gate
  with the new component added to its enumerated string sites.
- `pnpm exec tsc --noEmit` — clean.
- `pnpm build` — compiled successfully, 17/17 static pages.
- Sass compile of every touched module — no warnings (the band's
  `length()`/`nth()` globals were migrated to `list.length`/`list.nth`
  on the way across, so the move did not carry the deprecation warnings
  into the lab module).
- **Mutation demos for the new tests** (house recipe: sha256 the
  targets, mutate, run, restore, `shasum -c`). Six mutations, six
  distinct failures, tree byte-identical afterwards:

  | mutation | caught by |
  |---|---|
  | `RISE_MS` 760 → 700 | timing agreement |
  | `$push-at` 0.55 → 0.5 | timing agreement (grow + keyframe hold) |
  | riser forks the bar gradient (one stop moved) | skin agreement |
  | `GESTURE` re-added to `aurora-sweep.tsx` | AC 5 |
  | arc array restated in the lab component | arc vocabulary |
  | `BAND_MS` 620 → 500 in TS only | band duration agreement |

- Diff confined to (AC 10): `app/lab/experiments.tsx`,
  `app/components/aurora-transition.{tsx,module.scss}` (new),
  `app/components/aurora-riser.{tsx,module.scss}` (new),
  `app/components/aurora-sweep.{tsx,module.scss}`,
  `app/components/_aurora.scss` (see the flag above),
  `tests/aurora-transition.test.ts` (new), `tests/em-dash-budget.test.ts`.
  Nothing committed, no branch, no push.

## Ambiguities flagged, not guessed

1. **`_aurora.scss` is not in AC 10's file list** but is named by AC 2 as
   a sanctioned source. Resolved toward AC 2. (Above.)
2. **Test-harness limit:** `tests/resolve-ts.mjs` resolves bare `.ts`
   only, so a test cannot `import` a `.tsx` that imports a stylesheet.
   `RISE_MS` / `RISE_PUSH_AT` are therefore read out of the riser's
   source by regex rather than imported. The pin is equally strong on
   value; it is weaker on form, and says so in its own failure message.
3. **AC 5 removals beyond the literal text** (`NAV_ORDER`, `rank`,
   `Direction`). Called out above; trivially revertible.
4. **`aria-live` volume:** one short heading string per activation. If
   the critic wants silence there instead, `aria-current` alone still
   satisfies AC 8's "perceivable" via the nav state.

## Proposed subtractions

1. **Rename `aurora-sweep.tsx`.** The sweep left; the file that keeps the
   rise is still called the sweep, and it is the file anyone chasing the
   transition opens first. `route-aurora.tsx` (or similar) buys a name
   that stops lying. Deliberately NOT done: AC 6's evidence names this
   file, and AC 10 confines the diff.
2. **Derive the band's eleven steps from `aurora-bar`.** The `$steps`
   list plus its `@for` loop is ~25 lines re-expressing the spectrum in
   a second form; one element with `@include aurora-bar`, rotated 90deg
   under the same blur, would delete all of it. NOT done here because
   AC 5 says the variant *survives*, and rebuilding its construction is
   not the same as preserving it. Worth a follow-up ticket, with a
   capture to confirm the stepped look survives the derivation.
3. **`SWEEP_MS` / `PUSH_AT` in `aurora-sweep.tsx`** are two alias lines
   kept only so AC 6's named vocabulary still exists at the shipped
   seat. Once verify's captures are bound, they can go and the riser's
   exports used directly.
4. **`--sweep-blur`** in the band has no setter anywhere in the codebase
   and never had one. It could be a plain `blur(10px)`.

---

# Frontend build note — T-012, round r1.1 (amendment)

Two items, both from verify's findings, both now ACs. Nothing else in the
round-1 build was touched; the note above stands as written.

Files changed this round: `app/components/aurora-transition.tsx`,
`tests/aurora-transition.test.ts`. Nothing else. No commit, no branch, no
push. `aurora-sweep.tsx`, `aurora-riser.*` and every stylesheet are
byte-identical to what verify captured, so AC 6's comparison against
`main` @ fcb3cb2 is untouched by this round — the only file I changed that
renders anything at all is the lab experiment, which is not on any route
the AC 6 capture visits.

## AC 11 — the in-flight toggle

**The defect.** `running.current` guarded `go()` but nothing guarded
`setGesture`. The layer rendered `gesture === 'rise' ? <AuroraRiser/> :
<band/>`, so pressing the toggle mid-run re-rendered the layer with the
other branch: React unmounts a half-played gesture and mounts a fresh one,
whose CSS animation starts from its own from-state. On screen: the rise
vanishes at 40% and a band appears at the left edge and crosses, with no
page change to explain it. Repro as filed (`02 work`, ~120ms, other
gesture).

**The choice: neither "ignore" nor "restart" — defer.** The AC allows
either; both read badly here, so I took the third door the AC's own
wording leaves open ("cannot swap the layer in flight"):

- *Ignore* is the cheap fix and it makes the control lie. The user presses
  `sweep`, the pressed state stays on `rise`, and nothing on screen
  explains why. That is precisely the "broken or unresponsive" outcome the
  dispatch rules out.
- *Restart* is worse than it sounds. This is a page transition, and the
  swap it covers has usually already happened by the time a human can
  press a second control (the swap is at 55% of 760ms, so ~420ms in).
  Restarting would replay a cover over a change that is already made — the
  glitch again, this time deliberate.
- *Defer* separates the two questions the one state was answering. There
  are now two: `gesture`, what the toggle says, which follows the click
  **immediately** — the pressed state moves under the finger, so the
  control is never unresponsive; and `runGesture`, captured at `go()` and
  frozen for the length of the run, which is what the layer reads
  (`shown = playing ? runGesture : gesture`). The in-flight run finishes
  as the gesture it began as; the new choice takes the screen on the very
  next nav, under a second away.

Why this reads best, by effect rather than taste: a toggle that selects
*which gesture plays* is answered honestly by "the next one plays it." The
run underway is a completed thought, and letting it finish is what makes
the two gestures comparable at all — a viewer switching mid-run wants to
see the other gesture properly, not to see this one cut off. It also
matches the persona's own rule about interruption: the thing that must be
interruptible is the user's *choice*, and that is instant; the 600ms
animation is not a hover.

Reduced motion is unaffected and slightly better: `playing` is never true
there, so `shown` falls through to `gesture` and the parked still switches
the instant the toggle is pressed — no run, no defer, no wait.

`go()`'s own `running.current` guard is untouched, and the band's `ms`,
`pushAt` and `direction` are still read at `go()` from the same value that
gets frozen, so a run's timers and its layer can never disagree.

**Not added:** a test for AC 11. It is a two-state React interaction and
the harness has no DOM; a source-level regex pin ("the layer reads
`shown`") would be theatre that any rename defeats. Verify can reproduce it
by hand in one click sequence, which is how it was found. Flagging rather
than guessing.

## AC 12 — the lab seat's riser assertion

**The hole.** `tests/aurora-transition.test.ts` asserted that
`aurora-sweep.tsx` imports `./aurora-riser` and that its module declares no
`.riser`. Nothing said anything about the lab seat, so AC 2's "one
definition, two seats" was pinned at one seat.

**Added:** a fifth family, `the lab seat renders the shared riser too
(T-012 AC 2)`, mirroring the route seat's test — import present, module
free of a local `.riser`, and, the load-bearing one, the ELEMENT
`<AuroraRiser` actually rendered. Source is comment-stripped first (a new
`stripComments` helper, the idiom already used twice in this file): the
component's own prose names `AuroraRiser`, and prose is not use.

The element assertion, not the import, is what carries this. An unused
import typechecks and would have kept a hollow test green — mutation M2
below proves exactly that.

**One line added to the route seat's existing test:** the same
`<AuroraRiser` element assertion. The identical hole existed on that side
(its test would pass with the element deleted), it is one line in a test I
was already editing, and leaving one seat weaker than the other after a
ticket about symmetry would be odd. Called out because it is beyond AC 12's
literal text; it reverts on its own.

### Mutation proof (house recipe: sha256, mutate, run, restore, `shasum -c`)

| # | mutation | result |
|---|---|---|
| M1 | **AC 12's named mutation** — delete `<AuroraRiser ms={RISE_MS} />` from `aurora-transition.tsx` | 115 pass / **1 fail** — `the lab seat renders the shared riser too` |
| M2 | same, plus the import dropped from the import list | 115 / **1 fail**, same test, same message — the import assertion alone never fires |
| M3 | riser keeps `@include aurora-bar`, then adds `background-image: …` after it (OVERRIDE) | 115 / **1 fail** — `bar spectrum is one definition` |
| M4 | riser restates the gradient with one stop moved 40% → 44% (REPLACEMENT) | 115 / **1 fail** — same test (the r1 pin, still live) |

Restore verified: `shasum -a 256 -c` OK on both mutated files, suite back to
116/116. The working tree is byte-identical to before the mutation run.

Before: 115 tests, all green with the riser element deleted (verify's
finding, reproduced). After: 116 tests, and that deletion fails.

## The override-vs-replacement gap — CLOSED

Verify was right, and it was small, so I closed it inside the same file.

The skin test compared `declValue(css, '.riserBar', 'background')` against
the mixin's own output. `declValue` reads the **first** `background` in the
**first** block matching the selector, which catches a fork by replacement
and is blind to a fork by override — keep the mixin's value, add
`background-image: linear-gradient(to top, red, blue)` on the next line,
and the surfaces no longer paint the same bar while the test happily
compares the untouched first declaration.

**Proof the gap was real:** I compiled the module with M3's override applied
and ran the OLD helper verbatim against it —
`declValue(mutatedCss, '.riserBar', 'background') === mixin` returned
`true`. The old assertion passed a genuinely forked skin.

**The close:** a new `bgDecls(css, selector)` collects **every** background
that lands on the selector — shorthand or `-image`/`-color` longhand, same
block or a later one, top level or inside an at-rule (`@media` bodies are
matched because expanded Sass output has no nested braces at the rule
level) — and the assertion becomes `deepEqual(list, [mixin])`. A changed
value fails on the value; an added override fails on the count. Both
surfaces (riser and footer bloom) are asserted this way; M3 and M4 above
are the two halves of the proof. Written as `exec` loops rather than
`matchAll` because this tsconfig targets es5 without `downlevelIteration`
(tsc caught it; noted so the next person does not "modernise" it back).

Scope kept: one helper and two assertions inside
`tests/aurora-transition.test.ts`. No other file was opened for it.

## Gates (real results, this round)

- `pnpm test` — **116 pass, 0 fail** (115 before; the lab-seat test is the
  one addition).
- `pnpm exec tsc --noEmit` — clean.
- `pnpm build` — `✓ Compiled successfully`, 17/17 static pages.
- Diff this round: `app/components/aurora-transition.tsx`,
  `tests/aurora-transition.test.ts`. Nothing committed, no branch, no push.
- Not render-checked (role spec): I make no claim about how the deferred
  toggle looks on screen, only about what the code now does.

## Proposed subtraction (r1.1)

`tests/aurora-transition.test.ts` now spells the comment-stripping idiom
three times: family 3's arc scan, family 4's `GESTURE` check, and the new
`stripComments` helper. Families 3 and 4 could take the helper (family 3
keeps its extra template-literal blank on top). Deliberately not done —
this round's scope is two items, and rewriting two passing tests is not one
of them. It is a four-line change whenever someone is next in the file.
