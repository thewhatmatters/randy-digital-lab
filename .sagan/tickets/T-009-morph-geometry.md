---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-009
title: Morph geometry — one owner for the constants and selectors the tile→modal morph rides on
status: Done
priority: Low
assignee:
labels: [refactor, motion, work]
parent:
url:
linear_updated_at:
# ── mirror-script-owned (stamped by sagan-plan, never by hand) ──────────────
fetched_at:
mirror_version: 1
# ── repo-owned (carried across every fetch; set by the run, not the tricker) ─
builder_id: frontend-dieter-r1
verifier_id: verify-hamilton-r1
evidence_sha: 80b333c89421122f1bc14572ff87b5d643ff978f
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

Close review candidate #4. The tile→modal morph's geometry contract has
no owner: 16:10 is declared in three SCSS files, the arrow layer
hand-copies the card frame inset from _card.scss (drift-prone, ~1px off
already per the T-004 critic), a JS radius fallback disagrees with the
CSS truth (6px vs 8px), and the morph finds its endpoints via four
data-attribute strings no module owns. Change one file and the morph
silently skews; nothing asserts any of it. Also bundled (same files):
delete the inert reduced-motion "force visible" declarations in the
five gated modules — T-007's builder proved by specificity they can't
rescue an armed page; they're a lying safety net.

One owner, pinned cross-language the way the intro gate pinned its
inline script: constants live once, everything else consumes or is
test-pinned against them. Zero visual change anywhere — this ticket
ships ownership, not pixels.

Done means: the aspect ratio, frame inset, radii, and morph selector
names each have exactly one source; the stale JS fallback agrees with
CSS truth or dies; a test catches cross-language drift; the inert
declarations are gone; and the byte-compare set plus a live morph check
prove nothing visible moved. If single-sourcing any constant can't be
done without visual change, stop and tell me which and why.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->
## AC

1. **Selector ownership:** the four morph data-attributes
   (`data-work-tile`, `data-work-tile-image`, `data-work-carousel`,
   `data-work-detail-content`) are exported constants in one
   directive-free module (extend `work-carousel-position.ts` or a
   sibling — builder's call); every TSX producer and every
   `work-modal.tsx` consumer uses the constants; zero hand-typed
   occurrences remain in TS/TSX (grep-verified, scan-test pinned like
   AC 1 of T-007).
2. **Geometry single-source:** the 16:10 ratio, the card frame inset,
   and the tile-panel/modal radii each have ONE authoritative
   definition (SCSS variable(s) in the existing partial system is the
   natural home); the three duplicate 16:10 declarations and the
   arrow-layer's hand-copied inset consume it; the `work-modal.tsx`
   radius fallbacks either derive from a pinned constant or are
   corrected to CSS truth (the 6-vs-8px lie dies) — and a unit test
   pins the cross-language agreement (TS constant == compiled SCSS
   value, in the styles-test idiom).
3. **Inert declarations deleted:** the reduced-motion `opacity: 1;
   animation: none` "force visible" blocks in the five gated modules
   are removed with a comment explaining why they were inert
   (specificity — the collapse lives on the armed selector chain);
   reduced-motion behavior is proven unchanged (it never armed).
4. **[Amended — see Decisions] Zero visual change:** sass-diff
   equivalence for every touched module — byte-identical, except the
   five gated modules whose only delta is exactly the AC-3-mandated
   inert-block deletion (attested per module), the standing `<main>` byte-compare set
   identical, and a live morph spot-check (open + close on a tile at
   slide 2) shows the same geometry as shipped — plus the T-004 hover
   and T-007 reduced-motion captures' scenarios re-checked.
5. **Gates:** tsc, `pnpm build`, `pnpm test` exit 0; new tests follow
   the mutation standard (one per family, transcripts to the ledger).

## Method

- **items:** (1) selector constants + scan test (AC 1), (2) geometry
  single-source + cross-language pin (AC 2), (3) inert-declaration
  deletion (AC 3) — built and checked individually.
- **lane:** correctness — mechanical single-sourcing, round cap 5;
  the morph's visual identity is verify-provable, not taste.
- **builder:** frontend role (dieter-shaped — its morph, its files).
- **round-1 evidence:** gate runs, sass diffs, the cross-language pin
  test + mutation transcript, live morph spot-check capture,
  reduced-motion load, byte-compare set.
- **sources (pointers, not paraphrase):** `app/components/work-modal.tsx`
  (fallbacks + selectors) · `work-index.module.scss` +
  `work-carousel.module.scss` + `_card.scss` (the duplicated geometry) ·
  `work-tile.tsx` `work-carousel.tsx` `work-detail.tsx` (producers) ·
  the five gated `*.module.scss` (inert declarations) ·
  `tests/styles.test.ts` + `tests/intro-gate.test.ts` (pin idioms) ·
  `.sagan/MEMORY.md` (T-004 critic finding, T-007 subtraction).

## Frontend

(builder appends its build note here; builders never verify their own work.)

### Build note — frontend-dieter-r1, round 1 (2026-08-12)

**Mechanism chosen (the Decisions' open call):** SCSS stays the geometry's
single source; TS carries test-pinned mirrors. New sibling module
`app/components/work-morph.ts` (directive-free, same boundary reasoning as
`work-carousel-position.ts` — work-detail.tsx is a Server Component) owns
the four morph data-attributes plus two radius-fallback constants.
`tests/work-morph.test.ts` pins both directions: an intro-gate-idiom scan
(no hand-typed `data-work-*` in TS/TSX outside the module, comments
stripped, four roots + existsSync) and styles-test-idiom compile pins
(probe-compile the partials, extract values, assert TS px == compiled SCSS
at the default 16px em).

**Geometry single-source (AC 2):**
- 16:10 → `$work-aspect-ratio` in new `app/components/_work-geometry.scss`
  (as `string.unquote('16/10')` — Sass numbers would divide to 1.6; this
  form emits the exact shipped bytes). Consumed by work-index `.thumb` +
  `.arrowLayer` and work-carousel `.carousel`. Test asserts every compiled
  `aspect-ratio` in both modules equals the source (counts pinned: 2 + 1).
- Card frame inset → `$card-frame: 0.25rem` in `_card.scss`; `card-shell`
  padding and the arrow layer's top/left/right consume it (the hand-copy
  the T-004 critic flagged is gone). Test asserts arrowLayer's three sides
  == compiled card-shell padding.
- Tile-panel radius → `$card-panel-radius: 0.5rem` in `_card.scss`; modal
  panel radius stays its one declaration (`calc(var(--radius) * 3)`,
  work-modal.module.scss). Tests pin `WORK_TILE_RADIUS_PX` (8) == compiled
  card-panel radius and `WORK_PANEL_RADIUS_PX` (18) == `--radius`
  (global.css, 0.375rem) × the multiplier regex-extracted from the
  compiled modal module.

**Fallback resolution:** derived-from-pinned-constant, not just corrected —
`|| 6` → `|| WORK_TILE_RADIUS_PX` (8, the CSS truth; the lie is dead) and
`|| 18` → `|| WORK_PANEL_RADIUS_PX`. Live path unchanged: the computed
style is still read first and the fallback only lands on an unparseable
value, so the 6→8 change is invisible by construction.

**Producers/consumer (AC 1):** work-tile / work-carousel / work-detail
attach the attributes via computed JSX spreads (`{...{ [WORK_TILE_ATTR]:
slug }}`); work-modal builds all three querySelector strings from the
constants. NOTE a deliberate divergence from the T-007 hero.tsx precedent
(which kept a literal + pin, fearing spreads change rendered bytes): AC 1
here explicitly demands producers use the constants, so spreads it is —
each spread sits at the exact position of the old literal attribute, so
React emits the same attribute order; the byte-compare set is the proof
and belongs to verify.

**Inert declarations (AC 3):** the `opacity: 1; animation: none` blocks are
deleted from all five gated modules (services, experience, posts,
work-index, charts/stack-matrix), each with a comment explaining the
specificity argument (the hide lives on the `html.intro-armed` chains; a
bare class rule can never outrank them, and reduced-motion loads never
arm). The functional reduced-motion rules (hover `transform: none`,
carousel `transition: none`) are untouched.

**Ambiguity flagged — AC 4 wording:** "sass-diff equivalence (order-only)"
cannot literally hold for the five inert-deletion modules: their diffs are
deletions, not reorderings. Builder-side compile diffs (ledger:
`sass-diffs-builder.txt`) show each touched module is byte-identical
EXCEPT exactly the deleted inert block — the geometry refactor itself is
byte-invisible everywhere (work-carousel, work-modal: fully
byte-identical). Verify should read AC 4 as "geometry refactor = identical;
inert deletion = exactly the block AC 3 mandates."

**Snapshot:** the services donor baseline caught the deletion (as designed);
regenerated via `UPDATE_SNAPSHOTS=1`, git diff reviewed = only the four
deleted lines. The regenerated baseline is part of this change set.

**Gates run by builder:** `pnpm exec tsc --noEmit` exit 0 · `pnpm test`
exit 0 — 101/101 (94 standing + 7 new). Mutations (house recipe, one per
family, transcripts + manifest in `.sagan/ledger/T-009/qabuild/`):
(1) hand-typed `data-work-tile={slug}` reintroduced → scan fails naming
the file; (2) `WORK_TILE_RADIUS_PX` set back to 6 (the exact pre-ticket
bug) → radius pin fails. Both restored, diff-vs-pristine clean. NOT run
here (verify's lane per constraints): `pnpm build`, byte-compare set, live
morph spot-check, reduced-motion load.

**Proposed subtraction:** `work-carousel.module.scss` line 9 still declares
its own `$ease: cubic-bezier(0.22, 1, 0.36, 1)`, a private fork of the
house ease that `_motion.scss` already owns (services/work-index consume
it via `@use`). Swapping it for `@use './motion' as *;` deletes the last
hand-copied ease in the work family — compiled bytes identical, one fewer
place for the house motion signature to drift. Left undone: out of this
ticket's named scope.

## QA

(verify appends the evidence summary here, bound to `evidence_sha`.)

### QA — verify-hamilton-r1, round 1 (2026-08-12)

**Target:** uncommitted working-tree delta on `80b333c` (baseline = HEAD;
HEAD-worktree used for every comparison). Overall: **PASS**, all five AC.
Full itemization in `events.jsonl` (evidence.recorded, run-20260811-225832).

- **AC 5 (gates):** `pnpm exec tsc --noEmit` exit 0 · `pnpm build` exit 0
  (16/16 pages) · `pnpm test` exit 0, **101/101** (count as expected).
- **AC 1:** my own comment-stripped grep (perl stripper, distinct from the
  test's) over app/+lib/ TS/TSX excluding work-morph.ts → **zero** hand-typed
  `data-work-*`; scan suite 7/7; prerendered /work + /work/knav HTML carries
  all four attributes at the same elements (tile ×3 with slug values on the
  `<a>`s, tile-image ×3, carousel ×1, detail-content ×1).
- **AC 2:** pin tests pass; independent recompute — own sass probe of
  `card-panel` → `border-radius: 0.5rem` = 8px == `WORK_TILE_RADIUS_PX`;
  `$card-frame` 0.25rem == card-shell padding == arrowLayer top/left/right.
  Code read confirms computed-first (`parseFloat(getComputedStyle(…)) ||
  CONST`); live morph measured panel **18px** / tile image **8px** — parseable,
  so the fallbacks sit only on the unparseable path. The 6-vs-8 lie is dead.
- **AC 3:** compiled-CSS diffs show each of the five gated modules lost
  exactly the inert `opacity: 1; animation: none` block, nothing else;
  explanation comments present. Reduced-motion loads of / and /work:
  `html.intro-armed` absent, every section/tile computed opacity 1, zero
  hidden text leaves — nothing armed, no watchdog. *Cosmetic finding:*
  experience + posts kept the OLD comment above the new one — experience's
  stale line still claims "Force the rows visible" about rules that no longer
  exist. Report-only.
- **AC 4 (core):** (i) sass-diff HEAD vs working, 8 modules:
  work-carousel / work-modal / command-bar **byte-identical**; the five gated
  modules identical **except** the deleted AC-3 block
  (`.sagan/ledger/T-009/sass-diffs-verify.txt`). **Adjudication:** the
  builder's reading is adopted as the AC-amendment-in-effect — AC 4's literal
  "order-only equivalence" is unsatisfiable for modules whose whole change is
  the deletion AC 3 itself mandates; the evidence standard applied is
  "geometry refactor = byte-identical everywhere; gated modules = identical
  except exactly the mandated block", and both halves hold. (ii) The spreads
  reading is likewise proven by evidence: HEAD-worktree build, `<main>`
  extract + `cmp` on 3 notes, /notes, /work, /work/knav → **6/6
  byte-identical** — computed JSX spreads changed zero rendered bytes,
  attribute order preserved. (iii) Live morph on :3010 (light, 1440,
  `data-theme` readback): knav → slide 2 (`?i=1`, "Image 2 of 4") → open:
  dialog at slide 2 (status + active dot), carousel 830×518.8 = 1.6000
  (16:10), panel radius 18px, in viewport → ESC: dialog gone, tile still at
  `?i=1`, focus returned — write-back holds. (iv) Hover re-check: next arrow
  reveals to opacity 1, disabled prev at 0.35, frame intact; reduced-motion
  re-checked as above.
- **Mutation (independent, distinct from the builder's two):** V1 —
  `.arrowLayer` aspect-ratio hand-drifted to `16/9` → work-morph pin fails
  naming the module (exit 1). V2 (dispatch-named probe) — `$card-frame` →
  0.3rem → the new pins are **equivalent** (both consumers derive from the
  variable) but the standing T-003 style-donor snapshot catches it (100/101):
  the absolute value is pinned at the snapshot layer; the new tests pin
  cross-language/cross-consumer *agreement*. Layering sound. Both restored,
  cmp-clean, final suite 101/101 exit 0. Transcripts:
  `.sagan/ledger/T-009/mutation-verify-independent.txt`.

**Gate captures** (the human should see these):
`gate-t9-morph-slide2-1440-light.png` (dialog at slide 2, geometry sane),
`gate-t9-hover-1440-light.png` (arrow reveal, frame intact). Working
evidence: `t9-reduced-motion-home-1440-light.png`.

**Not verified:** reduced-motion observed live on / and /work only (posts /
stack-matrix legs proven by deletion-only diff + never-armed, not per-page
loads); dark scheme + 375px not re-captured (zero-visual-change ticket —
markup pinned by 6/6 identical mains, CSS by sass-diff); the unparseable-
radius fallback branch never exercised live (no live path today — unit-pinned
only).

**Carry-forwards (pre-existing, byte-identical to HEAD, report-only):**
(1) `work-detail.tsx` renders `class="undefined …"` — `styles.content`
resolves undefined (`work-detail.module.scss` defines no `.content` class);
(2) the arrowLayer sits 1px outside the media panel's border box (the card's
1px border is unaccounted — the T-004 critic's ~1px; the new pin asserts
inset == padding, not rect == rect). **The missing test:** a live RECT
comparison (T-002 idiom) of arrowLayer vs `[data-work-tile-image]` would pin
what the inset pin cannot — it belongs beside the frame pin in
tests/work-morph.test.ts as a Playwright-layer check, and would have caught
the border-unaccounted offset when it was introduced. My servers: :3010
started and killed by port; dev on :3000 untouched.

## Decisions

- 2026-08-11 — Sprint-planned with T-008 (two-ticket slice confirmed by
  Randy); builds run in order T-008 → T-009, one at a time. Mechanism
  for the cross-language geometry pin left to the builder within AC 2's
  "one source, test-pinned" constraint (the intro-gate script pin and
  the styles snapshot are the two house idioms to draw from).

- 2026-08-12 — **Promoted** (round 1: verify all-5-PASS at `80b333c`
  incl. the explicit AC-4 adjudication and layered independent
  mutations; critic APPROVED, 7 low — its channel finding fixed by the
  PM's dated AC-4 amendment above; its stale-comment finding fixed
  pre-commit, pm-direct, gate-specified). Sprint run-20260811-225832
  closes with this ticket — architecture review 8/8 resolved. Carried
  forward: work-detail `class="undefined"` (pre-existing, structural
  proof); arrowLayer ~1px offset + the live-rect pin that should land
  with its fix; snapshot-held absolute frame value (regeneration
  discipline). Status → Done.

<!-- sagan:repo-owned:end -->
