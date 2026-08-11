# Project memory — rolling synthesis

(The PM appends synthesized learnings here after each ticket; raw
per-task retros in `.sagan/memory/` are pruned once absorbed. Durable
project truths get promoted to the project's entry-point doc; cross-project
insights are proposed to the vault through its gate.)

## T-002 — Work foundation (run-20260810-194454, promoted 2026-08-11, round 2 + 6 gated amendments)

- **"Make X look like Y" = extract, don't imitate:** the `_chip.scss` /
  `_card.scss` mixin pattern (donor module rewired onto the partial,
  consumers include it) keeps one visual language with zero forks. Proof
  standard: `sass`-compile diff of the donor, HEAD vs working — order-only
  shifts with no overlapping-property crossings = cascade-equivalent. Say
  "computed-equivalent", never "byte-equivalent", unless you ran `cmp`.
- **Declarations equal ≠ pixels equal:** a `height:0; display:flex`
  overlay lane with default `align-items: stretch` collapses children
  (the 12px ESC chip). Pin shared components with a RECT check against
  the sibling instance, not a computed-style diff alone.
- **Shared-element morphs:** lock both ends to one aspect ratio (16:10
  tile ↔ modal header = one uniform scale, no distortion handling);
  measure geometry live at open (rect + computed radius) instead of
  encoding it twice — the morph then survives container redesigns; the
  house VT root crossfade and a per-element morph can't share one nav
  (plain `next/link` + WAAPI, `fill:'both'` + `Animation.reverse()` for
  free interruptible close).
- **next/image traps:** local SVG needs per-image `unoptimized` (else the
  optimizer 500s); non-default-ratio body images need explicit
  width/height props or the figure layout-shifts on load.
- **Verify craft (house floor now):** baseline = `git worktree add … HEAD`
  when changes are uncommitted — region-extract + `cmp` beats claims;
  re-grep EVERY AC clause on the final tree (content amendments silently
  retire other ACs' usage clauses — the WorkFigure case); pin theme per
  capture + `data-theme` readback (the persistent profile leaks
  localStorage across runs); probe hashed CSS-module DOMs by tag/aria,
  never `[class*=…]`; evidence binds to BUILD_ID *and* unchurned source
  files — a dynamic interception route reads disk at request time, so a
  tree that moves under a pinned build 404s the modal while SSG pages
  still serve (that split is the signature).
- **Ticket hygiene under concurrency:** builders anchor Frontend-note
  appends inside their own section tail (one ate `## QA` anchoring on the
  next heading); critics must be handed block-scoped excerpts if true
  isolation matters — a whole-file Read leaks excluded blocks (r2b critic
  disclosed exactly this).
## T-006 — parser contract deepening (run-20260811-164147, promoted round 1)

- **Gate-locked design → single-round build:** four pre-decided choices
  left one judgment call, and it arrived pre-framed with a hard
  constraint ("rendered strings don't change") that made the answer
  derivable (local midnight, not UTC — UTC shifts rendered dates west of
  Greenwich). Decision quality at the gate is what buys one-round
  circuits.
- **Contract-changing tickets must name which old pins die:** the T-003
  colon-path fixture pinned behavior the new contract makes an error;
  the ticket's explicit "quirk pins get REPLACED deliberately" license
  is what let the builder proceed without an escalation. Always say it.
- **Null-then-throw seam:** pure functions return null/issues; the layer
  that knows the file path throws the named error. The right shape for
  "no blind TypeError" without threading paths into pure code.
- **An equivalent mutant is a result, not a failed check:** verify's
  surviving mutant was correctly diagnosed as unreachable defensive
  code guarding a stated contract term — keep it, comment it, report
  it. Also: mutation demos can be TZ-dependent; state the environment
  under which a mutation is observable.
- **Probe scripts ride the test harness:** `node
  --experimental-strip-types --import ./tests/register.mjs <script>`
  lets any verification probe import lib modules exactly like the app.
- **Role-spec gap flagged twice:** the frontend rubric (semantic HTML,
  375px) is dead weight for data-layer tickets — a library/module
  rubric variant is wanted; the spec also hardcodes the Dieter persona
  while staffing is per-dispatch. Overlay improvement for sagan.
- **Carry-forwards (open, post-T-006):** calendar-validity pin (Feb-30
  rolls valid) + fence-anchor fix → future validation ticket; BlockItem
  typing of unvalidated optional lists → candidate #6; formatDate
  relative-branch subtraction (zero callers pass true) → candidate #7;
  skip-warning dedupe (repeats per build render) — cosmetic.

## T-005 — lib/dates.ts (run-20260811-152912, promoted round 1; from the architecture review's top pick)

- **The review→grilling→ticket pipeline works:** five design decisions
  locked in the grilling loop meant a one-question gate and a
  zero-ambiguity dispatch; CONTEXT.md's "Newest-first" entry gave the
  builder vocabulary to code against.
- **Import-move spec shape:** name the known importers AND mandate "grep
  for others" — it caught a third formatDate importer. Pin the STRONGER
  grep invariant when the refactor achieves one (zero `.sort(` under
  app/ beat the AC's narrower phrasing).
- **Mutation-demo house recipe (blessed):** loop apply → scoped test →
  transcript → restore-from-saved-copy (not git checkout — new files
  are untracked), then diff against pristine.
- **"Expect DIFFERENT" is a hypothesis, not a criterion:** verify
  predicted a /work order diff; reality was byte-identical (the old
  undefined order happened to match spec). Report empirical results
  against the AC's wording, never force the predicted shape onto data.
- **Carry-forwards (open, → frontmatter-validation ticket / candidate
  #1):** NaN publishedAt silently bypasses the slug tiebreak (deferral
  judged correct — contract undecided); newestFirst parses date-only as
  UTC vs formatDate's local (normalize at the boundary); formatDate's
  relative-branch month/day arithmetic is boundary-buggy and clockless
  (subtraction candidate, → #7 ticket).

## T-004 — Tile carousel + position handoff (run-20260811-105606, promoted round 1 + gate fold-in)

- **"Measure live, don't encode twice" paid out:** the tile→modal morph
  needed ZERO edits for slide continuity — it reads live rects, so the
  problem reduced to "both ends render slide N" (props, not geometry).
- **Client-boundary pattern:** helpers exported from a `'use client'`
  module can't be called in Server Components — shared rules live in a
  directive-free sibling module both sides import
  (`work-carousel-position.ts`).
- **Sibling-control-over-a-link pattern:** hover chains don't cross
  siblings — the hover wake must live on the WRAPPER (`:hover`/
  `:focus-within`), or the card flickers when the cursor reaches an
  arrow. Cross-module class skinning is chunk-order-fragile: keep
  overrides at ≥(0,2,0) specificity so the cascade never depends on
  import order.
- **Sync at event time, not teardown time:** broadcasting the modal's
  index on every change (vs on close) made all three close paths
  identical for free and warms the tile image before the reverse morph.
- **Verify craft additions:** rest-state captures need `__introDone` +
  ~2.5s settle + computed-opacity readback (entrance stagger poisons
  early frames); disabled buttons vanish from tab order — stage slide ≥2
  before transcribing; evidence on a dirty tree must name the dirty file
  list. Spec note: name the interactions allowed to end an "at-rest"
  network state (hover-preload changes the waterfall a probe sees).
- **Carry-forwards (open):** arrow-layer inset duplicates `_card.scss`
  constants (~1px drift if the card frame changes — a styles test or
  shared variable); `thumbnail == images[0]` is discipline-only (a
  validation rule when frontmatter validation lands); modal paging not
  mirrored to the address bar (polish, judged beyond the bar); tile
  swipe deliberately omitted (drag-in-link vs tap conflict — revisit
  only on real mobile feedback).

## T-003 — Hygiene carry-forwards (run-20260811-095412, promoted round 1)

- **Test the seam, not an extraction:** both content pipelines hard-code
  `path.join(process.cwd(), …)` — `t.mock.method(process, 'cwd', …)`
  runs the REAL exported functions against a hermetic fixture tree, zero
  production edits. Zero-dep TS testing on Node 22.14: `node
  --experimental-strip-types --import ./tests/register.mjs --test` with
  a 20-line resolve hook mirroring tsconfig `baseUrl` (tests import
  `lib/mdx` exactly like the app; root tsc typechecks them free).
- **Pipeline tests alone can mask parser bugs:** `itemToPath` re-splices
  `": "` values, so a broken parser rejoin is invisible downstream —
  keep a direct parser-layer test beside every pipeline test. Mutation
  proof (run → capture → revert, transcripts in the ledger) is now the
  house standard for new tests; verify adds one independent mutation of
  its own.
- **Snapshot the donors, not the consumers:** compiling only the two
  reference modules pins the shared partials transitively (`@use`
  propagates). Baselines are untracked pre-commit — `git checkout --`
  can't revert perturbation demos until they land.
- **Byte-identical checks without servers:** prerendered SSG HTML lives
  at `.next/server/app/<route>.html`; extract `<main>` (not `<article>`
  — perchhq's article is 1.2 KB of 15 KB) and `cmp` vs a HEAD-worktree
  build.
- **Standing test floor:** `pnpm test` (18 tests) is now in
  `sagan.yaml` `gates.verify_commands.test` — every future verify runs
  it.
- **Carry-forwards (open, post-T-003):** frontmatter validation —
  `parseFrontmatter` on a no-frontmatter file crashes with a bare
  `TypeError` (`lib/mdx.ts:19`), deliberately unpinned (pinning would
  enshrine the crash; fix belongs with validation/Velite); `formatDate`
  lives in notes/utils, work imports it — bless a `lib/` home; parser
  can't express a plain string list; `"type"` field missing from
  package.json (MODULE_TYPELESS warnings in test output —
  behavior-adjacent); Paper-canvas drift half unrun (Conan file was
  open) — re-run `/design-token-drift` when randy.digital is open.
  CLOSED by T-003: parser contract test · style-donor snapshots ·
  `--scrim` mirror · perchhq WorkFigure capture.

- **Dev-only interception-route corruption:** editing files that touch the
  `app/work/@modal/(.)[slug]` tree while `next dev` runs makes the
  interception marker accumulate per recompile (`(.)(.)(.)…` → 500s →
  clicks hard-navigate to the full page, preloader plays). Production
  builds are immune. Fix: kill dev server, `rm -rf .next/dev`, restart.
  Symptom to recognize: "tile opens a page, not the modal." Recurred 3×
  in one run — it follows EVERY builder round that edits app/ files
  while dev runs. PM habit: bounce the dev server proactively after
  each build round lands, before the human previews.

## T-001 — "The Sagan Method" note (run-20260810-181514, promoted round 1)

- **Render-verification on this site:** the preloader veil plays on EVERY
  full page load, all routes — captures must wait for
  `window.__introDone === true` (or `html.intro-done`), never just
  `networkidle`, or the top third ships blank. Dark scheme is
  `localStorage.theme = 'dark'` via next-themes (`data-theme` readback to
  confirm). Localhost console 404s for `/_vercel/insights` +
  `/_vercel/speed-insights` are expected on every page — compare against a
  reference route before calling a console error a defect.
- **Content tickets: measure the house shape into the AC.** Quoting both
  reference notes' real numbers (word band, H2 count, Margin/PullQuote
  budget) turned shape from judgment into mechanics, and cut the outline
  from 9 sections to 5 before any drafting was wasted.
- **Cold-open pattern when no real anecdote exists:** second-person
  shared-experience frame ("If you've run a coding agent…") — honest,
  hook-shaped, no invented specifics.
- **Known gaps, not blocking, carried forward:** (1) no frontmatter-shape
  validation for `app/notes/posts/*.mdx` — malformed notes surface only at
  build or as a rendered Invalid Date (cheap unit test, or the planned
  Velite migration); (2) pre-existing 375px overlap of the floating
  grid/lite chrome chips with the PullQuote/margin region on note pages —
  house UI fix, stop re-flagging per note; (3) the named bench has no
  written one-line specialties for content tickets to cite.
