---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-003
title: Hygiene — pin the shared foundations T-001/T-002 created (tests, token mirror, evidence gap)
status: Done
priority: Low
assignee:
labels: [hygiene, tests]
parent:
url:
linear_updated_at:
# ── mirror-script-owned (stamped by sagan-plan, never by hand) ──────────────
fetched_at:
mirror_version: 1
# ── repo-owned (carried across every fetch; set by the run, not the tracker) ─
builder_id: qabuild-hamilton-r1 (+pm-direct docs line)
verifier_id: verify-bare-r1
evidence_sha: 0a8f7f135e9c8a86faa2375b929c1b04bfd68777
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

Close the carry-forwards the T-001/T-002 runs accumulated (listed in
`.sagan/MEMORY.md`): the shared MDX frontmatter parser and the shared
style partials are now load-bearing for two pipelines each, and nothing
pins either. Add the missing tests, mirror the one drifted token into
DESIGN.md, and capture the one piece of render evidence T-002 promoted
without.

Tests over machinery: no new frameworks unless gated, tests must be
provably able to fail, and nothing about the site's rendered output
changes — this ticket ships zero behavior.

Done means: a test command exists and runs green in the gates; the
parser contract and the two style donors are pinned; DESIGN.md carries
--scrim and the drift check comes back clean; the perchhq WorkFigure
render is captured. If any test can't be written honestly without
changing production code, stop and tell me which and why.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->
## AC

1. **Parser contract test:** unit tests pin `lib/mdx.ts` —
   frontmatter scalar parsing (quote stripping, single-quoted strings
   with internal punctuation), `label: value` block lists (`meta`,
   `stack`, `authors`), plain-list normalization as consumed by
   `app/work/utils.ts` (`images` → ordered string paths, thumbnail
   fallback), and fixture files representing both real pipelines (a
   notes-shaped and a work-shaped frontmatter). Every test is proven
   able to fail (builder demonstrates one deliberate mutation per test
   family failing, then reverts).
2. **Style-donor snapshot test:** the compiled CSS of the two shared-
   partial donors (`services.module.scss`, `command-bar.module.scss`)
   is snapshotted to committed baseline files; a test compiles them
   (sass, already a dep) and fails on any drift from baseline;
   updating a baseline is an explicit, reviewable act. Work-index is
   excluded deliberately (it is a consumer, expected to evolve).
3. **Test wiring:** `pnpm test` runs items 1–2 via the runner chosen at
   the gate (no new dependency unless the gate approved one); the
   command is added to `sagan.yaml` `gates.verify_commands.test` so
   every future verify runs it as part of the standing floor.
4. **Token mirror:** `--scrim` (light + dark values) is mirrored into
   DESIGN.md exactly as `app/global.css` defines it; a
   `/design-token-drift` pass reports clean (or its remaining findings
   are pre-existing and listed in the QA block).
5. **Evidence gap closed:** a render capture of `/work/perchhq`
   (full-page, 1440, light) showing the WorkFigure with its Fig. 001
   caption is stored under `.sagan/ledger/T-002/` (it closes T-002's
   AC 5 render gap; a pointer line is added to T-002's Decisions block
   by the PM at promote).
6. **Zero behavior change:** `pnpm exec tsc --noEmit`, `pnpm build`,
   and the new `pnpm test` all exit 0; the notes/work rendered HTML is
   byte-identical before/after this ticket (verify re-runs the
   region-extract `cmp` against a HEAD-worktree baseline) — the only
   non-test diffs are DESIGN.md and package.json/sagan.yaml wiring.

## Method

- **items:** (1) parser tests + fixtures (AC 1), (2) style snapshots
  (AC 2), (3) runner wiring + sagan.yaml gate (AC 3), (4) DESIGN.md
  mirror + drift check (AC 4), (5) perchhq capture (AC 5, verify-side)
  — built and checked individually.
- **lane:** correctness — mechanical work, round cap 5.
- **builder:** QA-shaped (test authorship is the bulk); the DESIGN.md
  mirror is a doc edit inside the same dispatch. Builder ≠ verifier is
  binding identity: if the builder is staffed with the hamilton
  persona, verify must staff differently (bare role contract or
  another persona) — decided at the sagan-run staffing round.
- **round-1 evidence:** `pnpm test` output green PLUS the
  mutation-failure demonstrations (AC 1), one deliberate baseline
  perturbation failing the snapshot test (AC 2), gate runs, the drift
  check report, and the perchhq capture — shipped with the first build.
- **sources (pointers, not paraphrase):** `lib/mdx.ts` +
  `app/notes/utils.ts` + `app/work/utils.ts` (contract under test) ·
  `app/components/{services,command-bar}.module.scss` + `_card.scss`/
  `_chip.scss` (donors) · `.sagan/MEMORY.md` (carry-forward list +
  verify's technique notes) · `DESIGN.md` + `app/global.css` (token) ·
  `.sagan/tickets/T-002-work-foundation.md` (the AC 5 gap being closed).

## QA-Build

(builder appends its build note here — what was written, mutation
demonstrations, key choices. Builders never verify their own work.)

### r1 build note — qabuild-hamilton-r1 (2026-08-11)

**Files.** `tests/mdx.test.ts` (parser + pipelines, 16 tests),
`tests/styles.test.ts` (2 snapshot tests), `tests/register.mjs` +
`tests/resolve-ts.mjs` (zero-dep module hooks), `tests/fixtures/site/`
(1 notes + 3 work fixture .mdx), `tests/__snapshots__/{services,command-bar}.module.css`
(committed baselines), `package.json` ("test" script), `.sagan/sagan.yaml`
(gate), `DESIGN.md` (scrim row + sync-check line). `lib/` and `app/`
untouched — `git status --porcelain lib/ app/` empty after all mutation
reverts.

**AC 1 — parser contract (tests/mdx.test.ts).** Location call: no test
dir existed; chose top-level `tests/` (mirrors the repo's "reusable stuff
outside app/" rule; co-locating under `lib/` would put test files inside
Next's source tree). Families: (a) scalars — single-quote strip with
internal colon/em-dash/ASCII-quotes, curly-quote preservation, double
quotes, unquoted date/URL passthrough, body extraction; (b) block lists —
meta/stack/authors shapes incl. unicode label (`Claude · Opus 4.8`),
first-`": "`-split-with-rejoin, bare-item raw shape (`{label, value:''}`),
empty-key omission; (c) work pipeline — images→ordered string paths,
thumbnail fallback, `": "` path rejoin, meta passthrough; (d) notes
pipeline end-to-end + slug. Pipelines tested through the REAL exported
functions by stubbing `process.cwd()` (the seam both utils hard-code) via
`t.mock.method`, auto-restored — production code untouched. Plus one
non-hermetic contract test pinning thumbnail-first across the real
`app/work/projects` (the tile→modal morph convention; failure message says
which slug and why it matters).

**AC 1 mutation proofs (run → captured → reverted, transcripts in
`.sagan/ledger/T-003/qabuild/t003-mut1..4.txt`):**
1. quote-strip disabled in lib/mdx.ts → exit 1, 9 fail (scalar family +
   every quoted-fixture consumer), assertion shows quoted-vs-bare diff.
2. `rest.join(': ')` → `rest[0]` → exit 1, 1 fail (the rejoin test).
   Finding: the pipeline colon-path test alone would NOT catch this —
   `itemToPath` re-splices two-segment paths, so only the direct
   three-segment parser test pins the rejoin. Kept both deliberately.
3. work thumbnail fallback → `[]` → exit 1, 1 fail (fallback test).
4. slug keeps extension in getMDXData → exit 1, 5 fail (both pipeline
   suites).

**AC 2 — snapshot test (tests/styles.test.ts).** `sass.compile` (JS API,
`style: 'expanded'`) of both donors, byte-compare against committed
baselines in `tests/__snapshots__/`. Sentinel-selector guard refuses to
compare a hollow compile. Update path is explicit: `UPDATE_SNAPSHOTS=1
pnpm test` + review the git diff (the failure message teaches this).
Work-index excluded per AC. Perturbation demo (transcript
`.sagan/ledger/T-003/qabuild/t003-mut5.txt`): `_card.scss`
border-radius 0.75→0.8rem → exit 1,
services snapshot fails naming the exact drifted line — proves the shared
partial is pinned transitively through the donor. Reverted.

**AC 3 — wiring.** Node v22.14.0 →
`node --experimental-strip-types --import ./tests/register.mjs --test "tests/**/*.test.ts"`.
Strip-types still needs its flag at 22.14 (default-on lands later);
`resolve-ts.mjs` is a resolve hook mirroring tsconfig `baseUrl: "."` for
bare extensionless specifiers (`lib/mdx` inside app/work/utils.ts — the
generalized version of T-002 verify's inline-the-specifier trick). Only
fires after default resolution fails; zero dependencies. sagan.yaml
`gates.verify_commands.test` → `"pnpm test"`. No tsconfig change needed:
tests import via the same baseUrl specifiers, so root
`pnpm exec tsc --noEmit` typechecks them clean as-is (exit 0). Known
cosmetic warnings in test output: ExperimentalWarning (the flag) +
MODULE_TYPELESS_PACKAGE_JSON (no `"type"` field in package.json; adding
one would touch how postcss.config.js et al. parse — out of this
ticket's zero-behavior scope).

**AC 4 — token mirror.** DESIGN.md color table gains
`| scrim | rgb(17 17 17 / 0.45) | rgb(0 0 0 / 0.6) | modal backdrop dim (work project modal) |`
(values copied exactly from `app/global.css` `:root` line 177 /
`[data-theme='dark']` line 203); sync-check footer now lists scrim.
Drift check NOT run by me — verify's per the dispatch.

**AC 5 / AC 6.** Not mine: perchhq capture, `pnpm build`, and the
byte-identical HTML cmp are verify-side. What I ran: `pnpm test` exit 0
(18/18, `.sagan/ledger/T-003/qabuild/t003-final-green.txt`) and
`pnpm exec tsc --noEmit` exit 0, both after all reverts.

**The missing test.** `parseFrontmatter` on a file with NO frontmatter
block throws `TypeError` (the `match![1]` non-null assertion) — a
malformed note crashes the build with an unhelpful stack. I did not pin
it: a test asserting "throws TypeError" would enshrine a crash as
contract. It belongs with the T-001 known-gap fix (frontmatter validation
or the Velite migration); the test to write then is "malformed/absent
frontmatter → named validation error listing the file".

## QA

(verify appends the evidence summary here — per-AC PASS/FAIL bound to
`evidence_sha`.)

### QA — verify-bare-r1, round 1

Evidence bound to `0a8f7f135e9c8a86faa2375b929c1b04bfd68777` (HEAD,
unchanged through the run). Bare role contract, no persona (hamilton
built; builder ≠ verifier identity). All artifacts uncommitted — the
tree carries them as working changes.

| AC | Result | Deciding command / observation |
|----|--------|-------------------------------|
| 1 | PASS | `pnpm test` exit 0 (18/18). Independent mutation, distinct from the builder's four: `lib/mdx.ts:42` `metadata[key] = items` → `items.slice().reverse()` (block-list ordering) → exit 1, 8 fail incl. "normalizes the images block list to ordered string paths, thumbnail first"; reverted, `git status --porcelain lib/ app/` empty, suite green again. |
| 2 | PASS | Perturbed `tests/__snapshots__/services.module.css:44` `0.75rem` → `0.76rem` → exit 1, exactly the services byte-identical test fails; reverted (manually — baselines are untracked pre-commit, `git checkout --` cannot restore them), suite green. |
| 3 | PASS | `pnpm test` runs both suites via `node --experimental-strip-types --import ./tests/register.mjs --test` (package.json); `.sagan/sagan.yaml:61` `gates.verify_commands.test: "pnpm test"` confirmed. |
| 4 | PASS | `--scrim` light `rgb(17 17 17 / 0.45)` (`app/global.css:177`, `:root`) + dark `rgb(0 0 0 / 0.6)` (`:203`, `[data-theme='dark']`) exactly match `DESIGN.md:36`; sync-check footer lists scrim. **Scope honesty:** this is the code↔DESIGN.md half only — the Paper-canvas `/design-token-drift` pass is PM-side at the gate. |
| 5 | PASS | Built site served at :3010, Playwright fresh non-persistent context, 1440 viewport, theme pinned light (`data-theme` readback `light`), waited `window.__introDone === true`, full-page capture; WorkFigure "Fig. 001" caption visible (count 1, visually confirmed). Console errors: 2× known `/_vercel/*` 404 noise only. Server stopped; :3000 returned 200 before and after. |
| 6 | PASS | Gates: tsc exit 0, build exit 0 (16/16 pages), test exit 0. Baseline: `git worktree add … HEAD` + build (exit 0); `<main>`-region extract of `.next/server/app/{notes/building-conan,notes/figma-to-paper,notes/the-sagan-method,work,work/perchhq}.html` from both builds; `cmp` → all 5 byte-identical. Only non-test diffs vs HEAD: DESIGN.md, package.json, `.sagan/` (sagan.yaml + ledger). Worktree removed. |

**Overall: PASS.**

**Promote-gate capture:**
`.sagan/ledger/T-002/gate-r3-perchhq-workfigure-1440-light.png` — this is
the gate capture the human should open (it also closes T-002's AC 5 gap;
PM adds the pointer line to T-002 Decisions at promote). No other
captures were produced.

**Not verified:** Paper-canvas half of `/design-token-drift` (PM-side);
the builder's five mutation transcripts under `.sagan/ledger/T-003/qabuild/`
were not re-executed — one independent mutation + one baseline
perturbation were re-proven instead; renders other than 1440/light (AC 5
specifies only that one).

**Findings (non-blocking):** untracked files outside this ticket's scope
sit in the tree (`.agents/`, `.claude/skills/sagan-wire`,
`docs/paper-tokens.md`, `skills-lock.json`, `recording.mov` ~19 MB) —
pre-existing/not the builder's per the git snapshot at run start; flag
`recording.mov` so it does not ride into a commit.

Persona note per role spec: none loaded — deliberately bare (builder ran
hamilton).

## Decisions

- 2026-08-11 — Ticket compiled by the PM from the accumulated
  carry-forwards in `.sagan/MEMORY.md` (parser test asked by verify in
  five separate passes across T-001/T-002). Open at the gate: (a) test
  runner — built-in `node:test` (zero dependency) vs vitest (one dev
  dependency, better DX); (b) scope — the four core carry-forwards
  only, or also the two soft retro items (`formatDate` → `lib/` home;
  parser plain-string-list support), which touch production code and
  would break this ticket's zero-behavior guarantee.
- 2026-08-11 — Gate resolved (all three confirmed by Randy): runner
  **`node:test` built-in** (zero new dependencies); scope **four core
  carry-forwards only** (soft items stay in `.sagan/MEMORY.md` for a
  future ticket); AC + Method **approved as drafted**.
- 2026-08-11 — **Promoted** (round 1: verify-bare-r1 all-PASS at
  `0a8f7f1` incl. its own independent mutation; critic-dijkstra-r1
  APPROVED, 6 low findings, envelope validated). Gate outcomes:
  DESIGN.md scrim footnote fixed pre-commit (pm-direct, the exact line
  specified by Randy at the gate — ledgered with rationale); the
  Paper-canvas half of the drift check **accepted as skipped** (Conan
  file was open; code↔DESIGN.md half verified clean — re-run
  /design-token-drift when randy.digital is next open in Paper).
  Carried forward to a future validation ticket: the no-frontmatter
  `TypeError` crash in `lib/mdx.ts:19` (deliberately unpinned);
  `formatDate` home + plain-string-list parser support (pre-existing).
  Status → Done.

<!-- sagan:repo-owned:end -->
