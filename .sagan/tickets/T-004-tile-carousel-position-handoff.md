---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-004
title: Work tiles — on-tile carousel arrows + position handoff into the modal
status: Done
priority: Medium
assignee:
labels: [frontend, work]
parent:
url:
linear_updated_at:
# ── mirror-script-owned (stamped by sagan-plan, never by hand) ──────────────
fetched_at:
mirror_version: 1
# ── repo-owned (carried across every fetch; set by the run, not the tracker) ─
builder_id: frontend-dieter-r1+r1.1
verifier_id: verify-hamilton-r1
evidence_sha: 42b5eebedcd476fbd8a84fe1a0ab86c35748a6fe
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

Add right/left nav arrows on the default tiles in /work (prior to the
modal being open), and remember which image/position the user is on so
clicking the tile opens the modal at that same image/position. The
Airbnb-card pattern: browse a project's images without leaving the grid;
the tile's current slide becomes the image the morph grows from.

Reuse, don't rebuild: the existing work-carousel gains a tile variant and
an initial-index capability instead of a second carousel. Position lives
in the URL (?i=N) so the modal, the full-page variant, and a shared or
refreshed link all open at the same slide — no hidden client state. The
tile restructure must stay accessible: arrows are never nested inside the
link, and one tile's keys can't drive another's.

Done means: tiles page through their images with arrows, the modal opens
at the tile's slide, the URL carries the position, closing the modal
leaves the tile on the slide you left, nothing regresses on CWV-relevant
image loading, and the a11y floor holds. If the accessible structure and
the morph can't both survive the restructure, stop and tell me which and
why.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->
## AC

1. **Tile carousel:** each /work tile pages through its project's
   `images` with left/right arrows (visibility per gate decision);
   arrows are real `<button>`s that are **siblings of, never nested
   inside, the tile's link** (no interactive-inside-interactive);
   arrow presses never navigate. Reuses `work-carousel` via a tile
   variant (or a cleanly-shared core) — no second carousel
   implementation, no new dependencies. Wrap-around vs end-stop
   matches the modal carousel's existing behavior.
2. **Lazy loading discipline:** at rest each tile loads ONLY its first
   slide (as today); remaining slides mount/load on first interaction
   with that tile's arrows (or hover-preload, builder's call — stated
   in the build note). Verify measures: initial /work HTML/network
   requests exactly one image per tile.
3. **Position handoff via URL:** arrow state is reflected as `?i=N` on
   the tile's link target; clicking the tile opens `/work/[slug]?i=N`
   — the intercepted modal AND the full-page variant both open their
   carousel at slide N (invalid/out-of-range N clamps safely to 0/max,
   never crashes). Plain `/work/[slug]` still opens at slide 0.
4. **Morph continuity:** the shared-element morph grows from the
   tile's CURRENT slide image into the modal carousel already
   positioned at that slide — no visible slide-jump during or after
   the morph (reduced motion: instant open at slide N, as today).
5. **Close write-back:** closing the modal on slide M leaves the
   source tile showing slide M (and the reverse morph lands on that
   image); Escape, backdrop, and ESC-chip close all behave the same.
6. **Keyboard + a11y floor:** arrows have accessible names
   ("Previous/Next image, <project>"); arrow-key handling is scoped to
   the focused tile (focus-within), never document-level — two tiles
   can't fight; tab order stays sane (link, then arrows, or per gate
   decision); focus-visible states present; tap targets ≥44px on
   coarse pointers; `aria-live` position announcement per tile
   (reusing the carousel's existing pattern) without triple-announcing
   across tiles.
7. **Gates:** `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm test` all
   exit 0 (the T-003 suite is part of the standing floor now).
8. **Render floor:** /work at 375/1440, light+dark: no horizontal
   overflow, no console errors beyond the known `/_vercel/*` noise;
   reduced-motion: slides cut instantly on the tile exactly as in the
   modal.
9. **Craft, judged by the fresh critic on verify's captures:** (a) the
   arrows join the tile's Services-card language (chip/keycap-family
   affordance, not foreign chrome) and don't fight the hover wake;
   (b) the grid at rest is visually unchanged from T-002's shipped
   state when nobody has interacted (arrows per gate decision aside);
   (c) the handoff feels continuous — tile slide → morph → modal slide
   reads as one object the whole way (judged on verify's staged
   captures at slide 2+).

## Method

- **items:** (1) tile restructure — link + sibling arrow layer (AC 1,
  6), (2) carousel tile-variant + `initialIndex` (AC 1, 3), (3) lazy
  slide mounting (AC 2), (4) `?i=` plumbing through link, modal, and
  full page (AC 3), (5) morph-from-current-slide + close write-back
  (AC 4, 5) — built and checked individually.
- **lane:** quality — interaction craft governs, round cap 3.
- **builder:** frontend role.
- **round-1 evidence:** /work at rest (one-image-per-tile network
  proof), tile at slide 2 (arrows visible state), modal opened FROM
  slide 2 (capture during + after morph), full-page `/work/<slug>?i=2`
  hard load, close-on-slide-3 → tile-at-slide-3 capture, reduced-motion
  load, keyboard-only traversal transcript, gate runs — with the first
  build so critique never waits.
- **sources (pointers, not paraphrase):** `app/components/work-index.*`
  + `work-carousel.*` + `work-modal.*` + `work-detail.*` (the system
  being extended) · `app/work/@modal/(.)[slug]/page.tsx` +
  `app/work/[slug]/page.tsx` (where `?i=` lands) · `_card.scss`/
  `_chip.scss` (affordance language for the arrows) · `.sagan/MEMORY.md`
  (dev-server interception gotcha, capture recipes, test floor) ·
  `.sagan/tickets/T-002-work-foundation.md` (the shipped contract this
  extends).

## Frontend

(builder appends its build note here — what was built, key choices,
anything the AC left ambiguous. Builders never render-check their own work.)

### Build note — frontend-dieter-r1 (round 1, 2026-08-11)

**What was built.** One carousel, three seats: `work-carousel.tsx` was
refactored into a shared core — `CarouselTrack` + `CarouselArrows` +
`CarouselStatus` (all styled by the existing `work-carousel.module.scss`,
so the tile's controls are the same objects, not lookalikes) — which
`WorkCarousel` (modal/full page) and the new `work-tile.tsx` client island
both compose. No second implementation, no new deps. New shared module
`work-carousel-position.ts` (deliberately directive-free) holds
`clampIndex` / `parseIndexParam` / the `work-tile:sync` event name so the
Server-Component modal route parses `?i=` with the exact rules the client
islands use. `work-index.tsx` stays a Server Component rendering `WorkTile`
islands.

Per AC:

- **AC 1 (structure):** each tile is now `li.tile > [Link.card, div.arrowLayer,
  p.sr-only]` — the arrows are real `<button>`s, siblings of the link, layered
  over the media panel (`.arrowLayer` mirrors the panel's border-box 16:10
  inside the 0.25rem card frame; `pointer-events: none` on the layer, `auto`
  on the buttons, so dead space still clicks through to the link). Arrow
  presses can't navigate by construction. End-stop + disabled-at-ends,
  matching the modal exactly (same `clampIndex`, same `.arrow:disabled`).
  Tile swipe was deliberately NOT added — a touch drag inside a link fights
  tap-to-navigate; the AC contract is arrows, and touch gets always-visible
  arrows instead.
- **AC 2 (lazy strategy — builder's call):** hover-preload. At rest exactly
  one slide (`mountedCount = 1`) is in the DOM → one image request per tile,
  same as T-002. Slides 2..N mount on first engagement: `pointerenter` or
  `focusin` on the tile (so by the time the hover-revealed arrow is pressed,
  slide 2 is usually loaded), or the modal's sync event. Late-mounted slides
  load `eager` — mounting IS the preload signal, and laterally-offset slides
  sit outside lazy-loading viewport heuristics.
- **AC 3 (URL):** tile href becomes `/work/[slug]?i=N` for N > 0 (index 0
  stays the plain path — plain URL = slide 0 by construction). The
  intercepted modal route is dynamic (soft-nav only), so it reads
  `searchParams` server-side and passes `initialIndex` — first client paint
  is already at slide N, which is what the morph needs. The full page stays
  SSG: `indexFromUrl` makes the carousel adopt `?i=` client-side in a
  pre-paint layout effect, transition-suppressed (one-commit `snapped` state
  reusing the drag's `transition: none` class). Static slide-0 HTML remains
  the LCP; a hard load at `?i=2` paints slide 0 for the pre-hydration
  interval inherent to SSG, then cuts (never animates) to 2. Invalid/OOR `i`
  clamps to 0/max via `parseIndexParam` + `clampIndex` (junk, arrays,
  negatives → 0).
- **AC 4 (morph geometry):** untouched on purpose — the morph measures
  `[data-work-tile-image]`'s live rect + computed radius (MEMORY: extend,
  don't hardcode), and that attribute stays on the same 16:10 inset panel;
  the carousel viewport/track fill it at 100%, so measured geometry is
  byte-for-byte the T-002 box. Continuity comes from both ends showing the
  same slide: tile at N ⇒ href `?i=N` ⇒ modal carousel first paint at N
  (initial render carries `translateX(-N·100%)` — no transition fires on
  first style resolution, so no jump during or after the morph). Reduced
  motion: modal opens instantly at N (existing contract, unchanged).
- **AC 5 (write-back):** the modal carousel broadcasts
  `work-tile:sync {slug, index}` on mount and every index change; the source
  tile follows immediately — instantly (transition-suppressed), since it
  updates under the backdrop where animation would be motion nobody sees.
  By close time the tile already shows slide M, so Escape / backdrop / ESC
  chip are identical for free (all funnel into the same `close()` →
  `anim.reverse()`, and the reverse lands on a tile already at M). Syncing
  continuously (not at close) also means slide M's image starts loading the
  moment the modal reaches it — the tile is warm before the reverse morph.
- **AC 6 (keys + a11y; tab-order call):** tab order is **link, then prev,
  then next** (the suggested order — DOM order does it; link-first keeps the
  card's primary action primary). Arrow keys are handled on the tile's `<li>`
  via React `onKeyDown` — scoping comes free from event bubbling (fires only
  while focus is inside that tile), so two tiles can't fight and nothing is
  document-level; modifier-guarded like the modal's handler. Names:
  "Previous/Next image, <title>" via `CarouselArrows`' `project` prop (modal
  labels unchanged — one carousel on screen needs no disambiguation).
  Focus-visible: arrows inherit the shared `.arrow:focus-visible` accent
  outline; the tile wake keys off `.tile:hover / .tile:focus-within` so
  focusing an arrow (or hovering it — it sits OUTSIDE the link, which would
  otherwise drop `:hover`) holds the card wake instead of flickering it.
  Coarse pointers: arrows always visible at 2.75rem (44px, WCAG 2.5.5).
  Slides inside the link are decorative (`alt=""` — non-empty alts would
  pollute the link's accessible name); position announcements reuse the
  carousel's existing `aria-live="polite"` pattern, one region per tile —
  it only speaks when its own text changes, so no cross-tile announcing.
  The tile viewport intentionally has no `role="group"`/carousel
  roledescription — that vocabulary inside a link reads as noise; the modal
  keeps it.
- **AC 7:** `pnpm exec tsc --noEmit` → 0; `pnpm test` → 18/18 pass (donor
  snapshots untouched — `_card.scss`/`_chip.scss` unchanged); both changed
  SCSS modules compile clean with `sass`. `pnpm build` not run (out of
  builder scope per run constraints) — verify's gate.
- **AC 8/9:** not self-verified (role boundary — no render checks). Design
  intent for 9: tile arrows are literally the modal's `.arrow` chip
  (composed class), so the control survives the morph in place; resting grid
  markup adds only the carousel viewport/track inside the same panel box and
  the entrance animation moved from `.card` to `.tile` so arrows rise with
  the card (visual rest state unchanged by intent).

**Ambiguities flagged (not guessed silently):**

- The tile now renders `images[0]`, not `metadata.thumbnail` — required for
  slide-k ⇔ slide-k morph continuity. The schema documents thumbnail ==
  images[0] as convention (and falls back to `[thumbnail]` when `images` is
  absent), and all three current projects comply, so the resting grid is
  unchanged. A project that broke the convention would previously have shown
  a divergent thumbnail; now it can't.
- Hard-loading the FULL page at `?i=N` shows slide 0 until hydration (SSG
  physics; the Method's chosen path). The cut to N is pre-paint
  post-hydration and never animated.
- Dev-server note for the PM: this round edits the interception tree —
  bounce `next dev` + `rm -rf .next/dev` before previewing (known dev-only
  corruption, MEMORY).

**Proposed subtraction (persona contract):** drop the `thumbnail`
frontmatter field and make `images` required with `images[0]` as the card
image. The tile no longer reads `thumbnail`; it survives only as the
no-images fallback plus a "must equal images[0]" convention — a drift trap
holding the morph's visual continuity by discipline instead of by
construction. Removing it buys one source of truth and deletes the only
convention this ticket had to trust. (Not done here — schema + content edits
are outside this AC.)

#### Round 1.1 — position-helper unit pin (frontend-dieter-r1.1)

Gate-approved fold-in closing QA's "missing test" note: added
`tests/work-carousel-position.test.ts` — 15 unit tests pinning
`parseIndexParam`/`clampIndex` (valid indices; the i=0-elision convention —
missing param and explicit "0" must agree; junk/empty/negative/array/
non-string → 0; parseInt radix-10 prefix semantics on floats/whitespace/
trailing junk; clampIndex bounds incl. the single-image max=0 case; and the
deliberate no-upper-clamp split — parseIndexParam passes highs through for
clampIndex). Zero production-code changes; the existing `tests/**/*.test.ts`
glob + register/resolve hooks picked it up with no package.json edit.
Mutation standard: two deliberate temporary mutations each failed the suite —
radix 10→16 in parseIndexParam (33 tests, 4 fail, exit 1) and dropping
clampIndex's lower bound (33 tests, 2 fail, exit 1) — reverted; transcripts
in `.sagan/ledger/T-004/qapin/`. Final gates: `pnpm test` 33/33 exit 0,
`pnpm exec tsc --noEmit` exit 0.

## QA

(verify appends the evidence summary here — per-AC PASS/FAIL bound to
`evidence_sha`.)

### QA — verify-hamilton-r1, round 1

**Target:** SHA `42b5eeb` + **uncommitted** builder changes (6 modified,
2 untracked source files — evidence binds to this dirty tree, not the
clean SHA). Own production build (`pnpm build`) served on :3010, headless
Chromium via automate-browser Playwright, fresh non-persistent contexts,
`__introDone` wait + `data-theme` readback per capture, mouse parked at
(0,0) for rest states. Server stopped after the run.

**Observed `?i=` convention: 0-indexed, `i=0` elided** — slide 3 ⇒
`?i=2`; plain `/work/<slug>` = slide 0.

| AC | Verdict | Deciding evidence |
| --- | --- | --- |
| 1 tile carousel | PASS | 2 sibling `<button>`s per tile, `a button` count 0 document-wide; arrow press never navigates; end-stop + disabled-at-ends on tile AND modal/full-page seat (`i=99` → next disabled); 8× ArrowRight mash on 2-image tile clamps at 2/2 |
| 2 lazy loading | PASS | Initial /work load: exactly 3 image requests (one per tile: `knav/01`, `perchhq/01`, `shift/01`); hover knav → 02/03/04 load, mounted slides 1→4 |
| 3 URL handoff | PASS | 2 arrow clicks → href `/work/knav?i=2`; click-through → dialog at "Image 3 of 4", dot 3, URL `?i=2`; hard load `?i=2` → slide 3; clamps: `i=99`→4/4, `i=-1`→1/4, `i=abc`→1/4, plain→1/4; zero pageerrors |
| 4 morph continuity | PASS | Mid-morph capture at ~150ms shows growing panel already at slide 3 (dot 3, 03.avif) — not slide 1; open-state transform identical at +1.2s (no jump); reduced-motion (matchMedia readback true): dialog opacity 1 at 120ms at slide N, 0 running animations |
| 5 close write-back | PASS | Escape from 4/4 → tile 4/4 `?i=3`; backdrop from 2/4 → tile 2/4; ESC-chip from 3/4 → tile 3/4; reopen from written-back tile → modal at 4/4 (round-trip); reverse-morph endpoints match (tile pre-synced) |
| 6 keyboard + a11y | PASS | Labels "Previous/Next image, \<title\>"; tab order link → prev → next (at slide 0 the disabled prev is skipped — native disabled-button behavior); keys scoped: focused knav steps, perchhq/shift frozen; blurred keys do nothing; coarse context (`has_touch`+`is_mobile`, `pointer:coarse` readback true): arrows visible without hover at 44×44px, tap works; 3 live regions (1/tile), only the stepped tile's text changed |
| 7 gates | PASS | `tsc --noEmit` exit 0 · `pnpm build` exit 0 (16/16 pages) · `pnpm test` exit 0, **18/18 pass** |
| 8 render floor | PASS | scrollWidth clean 375+1440 × light+dark; console: only known `/_vercel/*` 404 pair; CSS-preload + WebGL warnings identical on reference route /notes (pre-existing, site-wide); reduced-motion tile transition 0s |
| 9 craft | NOT-EXECUTABLE | Routed to fresh critic per ticket; staged captures below |

**Overall: PASS** (AC 9 excluded by routing).

**Gate captures** (the promote-gate bundle, `.sagan/ledger/T-004/`):
`gate-t4-tile-rest-1440-light.png` (settled grid, arrows opacity 0),
`gate-t4-tile-hover-arrows-1440-light.png`,
`gate-t4-midmorph-1440-light.png`,
`gate-t4-modal-from-slide-1440-light.png`,
`gate-t4-fullpage-i2-1440-light.png`,
`gate-t4-writeback-tile-1440-light.png`.
Working evidence: `work-tile-coarse-375-light.png`,
`work-floor-1440-{light,dark}.png`,
`work-midclose-reverse-morph-1440-light.png`.

**Not verified (honesty over green):** reverse-morph mid-flight image
identity (endpoints + working capture only, morph clone not
instrumented); real screen-reader audio (DOM live-region text change
only); duration of the builder-disclosed pre-hydration slide-0 window on
SSG hard loads of `?i=N`.

**Adversarial pass findings (all clean, none fixed):** slug-scoped sync
holds (modal paging moves no other tile); Escape returns URL to `/work`;
arrow-key mash clamps without wrap; second open (reopen after
write-back) lands correctly.

**The missing test:** nothing pins `parseIndexParam`/`clampIndex` at the
unit layer — the clamping contract (junk/negatives/arrays → 0, upper
clamp at count−1) is exactly the kind of pure-function seam the T-003
zero-dep suite was built for, and a regression there would only surface
as a rendered symptom. Belongs in `tests/` beside the parser tests;
would have caught e.g. a future `parseInt` radix or NaN slip silently.

## Decisions

- 2026-08-11 — Ticket compiled by the PM from Randy's brief (chat) +
  the agreed plan (Airbnb-card pattern; reuse work-carousel; URL as the
  position store). Open at the gate: (a) arrow visibility — hover-
  revealed on desktop / always-visible on touch, vs always visible
  everywhere; (b) dots on the tile — none (arrows only; dots stay a
  modal affordance) vs mirror the modal; (c) close write-back — yes
  (AC 5 as drafted) vs modal-only memory (drop AC 5); (d) tab order —
  link first then arrows, vs arrows first.
- 2026-08-11 — Gate resolved (confirmed by Randy): arrows
  **hover-revealed on desktop / always visible on touch**; **no dots**
  on tiles; close write-back **yes** (AC 5 stands); AC + Method
  **approved as drafted**. Tab order left to the builder within AC 6's
  constraints (link-then-arrows suggested), stated in the build note.
- 2026-08-11 — **Promoted** (round 1: verify-hamilton-r1 all-PASS at
  `42b5eeb` dirty-tree, critic-dijkstra-r1 APPROVED with 5 advisory
  findings, envelope validated). Gate outcomes: unit pin for
  `parseIndexParam`/`clampIndex` **folded in pre-commit**
  (frontend-dieter-r1.1: +15 tests, suite 33/33, two mutation demos in
  `.sagan/ledger/T-004/qapin/`). Builder's no-tile-swipe call stands.
  Carried forward (in `.sagan/MEMORY.md`): arrow-layer inset constants,
  `thumbnail == images[0]` validation, modal-URL mirroring polish.
  Status → Done.

<!-- sagan:repo-owned:end -->
