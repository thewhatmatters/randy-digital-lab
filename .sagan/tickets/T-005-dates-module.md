---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-005
title: lib/dates.ts — newest-first ordering with a stated tiebreak + formatDate home
status: Done
priority: Medium
assignee:
labels: [refactor, correctness]
parent:
url:
linear_updated_at:
# ── mirror-script-owned (stamped by sagan-plan, never by hand) ──────────────
fetched_at:
mirror_version: 1
# ── repo-owned (carried across every fetch; set by the run, not the tracker) ─
builder_id: frontend-dieter-r1
verifier_id: verify-hamilton-r1
evidence_sha: f0f05887d4c1ad4810624996aecfd07e0250f78d
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

Give dates a home. The site's ordering rule is currently an inconsistent
comparator (never returns 0) copy-pasted at three call sites — with all
three work projects sharing one publishedAt, /work's grid order is
undefined-by-spec today. formatDate lives in notes while work imports it.

Design locked via the architecture review + grilling loop (candidate #3;
decisions in CONTEXT.md and this ticket's Decisions block): one module,
lib/dates.ts, exporting newestFirst(items) — sorted copy, publishedAt
descending, slug ascending on ties, comparator internal — and formatDate,
moved with all imports updated. Dates only: no SEO/feed fixes ride along.

Done means: the three inline sorts are gone, /work orders
knav → perchhq → shift by specification, formatDate's notes home is
empty, the new invariant is unit-pinned with today's equal-date content
as the fixture, and every rendered surface except /work's now-specified
order is byte-identical. If the move can't be made without behavior
change beyond that order, stop and tell me which and why.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->
## AC

1. **Module:** `lib/dates.ts` exports exactly `newestFirst<T extends
   {metadata: {publishedAt: string}, slug: string}>(items: T[]): T[]`
   (sorted copy — input not mutated; `publishedAt` descending; ties
   broken by `slug` ascending; comparator not exported) and `formatDate`
   (moved verbatim from `app/notes/utils.ts`, behavior unchanged).
2. **Adoption:** the inline sorts in `app/components/work-index.tsx`,
   `app/components/posts.tsx`, and `app/rss/route.ts` are replaced by
   `newestFirst`; grep finds zero remaining `new Date(` comparisons in
   sort callbacks under `app/`.
3. **Import hygiene:** `formatDate` is gone from `app/notes/utils.ts`;
   all importers (`posts.tsx`, `work-detail.tsx`, any others found)
   point at `lib/dates`; no `app/work/* → app/notes/*` import remains
   (grep-verified).
4. **Unit pin (house mutation standard):** tests in the T-003 suite
   cover: descending order, the slug tiebreak on equal dates (fixture
   mirrors today's real content — three entries, one date), input
   non-mutation, single-item and empty lists, and formatDate's moved
   behavior (existing expectations still hold). One deliberate mutation
   per family demonstrated failing, transcripts to the ledger.
5. **Behavior delta is exactly one thing:** `/work` renders
   knav → perchhq → shift (now by specification); verify byte-compares
   rendered `<main>` regions vs a HEAD-worktree baseline for the three
   notes routes, `/notes` index, and `/work/knav` detail (unchanged),
   and attests /work's order change is the ordering only (same tiles,
   same markup shape). RSS item order for notes is unchanged (distinct
   dates → same sequence).
6. **Gates:** `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm test` all
   exit 0.

## Method

- **items:** (1) `lib/dates.ts` + unit tests (AC 1, 4), (2) three-site
  adoption (AC 2), (3) formatDate move + import updates (AC 3) — built
  and checked individually.
- **lane:** correctness — mechanical, round cap 5.
- **builder:** frontend role (small cross-cutting refactor in its
  territory; test authorship follows the T-003 conventions in tests/).
- **round-1 evidence:** green `pnpm test` + mutation transcripts, gate
  runs, the HEAD-worktree byte-compare set, and a /work capture showing
  the now-specified order — with the first build.
- **sources (pointers, not paraphrase):** `CONTEXT.md` (the newest-first
  invariant's definition) · `app/components/work-index.tsx:25-30` +
  `app/components/posts.tsx:12-19` + `app/rss/route.ts:8-13` (the three
  broken sorts) · `app/notes/utils.ts:41` (formatDate to move) ·
  `tests/mdx.test.ts` + `tests/register.mjs` (test conventions) ·
  `.sagan/MEMORY.md` (worktree-baseline recipe, capture recipes).

## Frontend

(builder appends its build note here; builders never verify their own work.)

### Build note — frontend-dieter-r1, round 1 (2026-08-11)

**Built (all three Method items):**

- `lib/dates.ts` (new) — `newestFirst<T>` returns a sorted copy
  (`[...items].sort`), publishedAt descending via epoch delta, slug
  ascending on ties; comparator `byNewestFirst` is module-internal, not
  exported. `formatDate` moved verbatim (byte-identical body) from
  `app/notes/utils.ts`. Comments use the CONTEXT.md "Newest-first"
  vocabulary.
- Three-site adoption: `app/components/work-index.tsx` (now
  `newestFirst(getWorkProjects())`), `app/components/posts.tsx`,
  `app/rss/route.ts` — all three inline never-returns-0 comparators
  deleted. Grep: zero `.sort(` calls of any kind remain under `app/`;
  remaining `new Date(` uses are non-sort (sitemap lastModified, RSS
  pubDate, world-clock ticker).
- formatDate move: deleted from `app/notes/utils.ts`; importers repointed
  to `lib/dates` — `posts.tsx`, `work-detail.tsx`, **and
  `app/notes/[slug]/page.tsx`** (a third importer the ticket's grep-for-
  others clause caught). Zero `app/work/* → app/notes/*` imports remain
  (grep exit 1, no matches).

**Tests:** `tests/dates.test.ts`, 11 tests in 6 suites following the
T-003 conventions (node:test + strip-types + register.mjs baseUrl hook;
imports `lib/dates` exactly like the app). Families: descending order
(real notes dates as data), slug tiebreak (fixture mirrors today's real
work content — knav/perchhq/shift, one shared date, two permutations
asserted identical), input non-mutation, single/empty lists (copy
contract pinned there too), formatDate moved behavior (default format,
ISO-datetime passthrough, `Ny ago`, `Today`). One deliberate mutation per
family demonstrated failing — five transcripts in
`.sagan/ledger/T-005/qabuild/mutation-family-{1..5}-*.md`, module
restored and diff-verified pristine afterward.

**Gates run by builder:** `pnpm exec tsc --noEmit` exit 0 · `pnpm test`
44/44 exit 0. NOT run (verify's lane per role spec): `pnpm build`, any
render/byte-compare — AC 5's byte-identity claim is verify's to prove; I
kept the change surgical (ordering call sites and import lines only, no
markup or styling touched) so the only render delta should be /work's
now-specified knav → perchhq → shift order.

**Judgment calls (flagging, not guessing silently):**

- Tiebreak compares slugs with plain `<`/`>` (code-unit order), not
  `localeCompare` — deterministic across machines/ICU builds; slugs are
  ASCII kebab-case so the two never differ.
- Ties compare epoch times (`getTime()` delta), so date-only strings
  (parsed UTC) and datetime strings (parsed local) each order internally
  consistently — same semantics the old comparators had, minus the
  never-0 bug.
- formatDate relative-branch tests compute expectations against the real
  clock (the function reads `new Date()` — no seam to inject); the
  `Today` test builds today's date from the same clock, so it can't go
  stale.

**Proposed subtraction (persona duty, for the backlog not this ticket):**
`formatDate`'s relative arithmetic (`monthsAgo`/`daysAgo` as raw field
differences) mislabels e.g. "June 30 → July 1" as `1mo ago`; every
current call site except notes detail passes `includeRelative = false`.
Dropping the relative branch entirely would delete ~20 lines and the only
clock-dependent behavior in the module — candidate for the SEO/nits
ticket, not done here (moved verbatim per AC 1).

## QA

(verify appends the evidence summary here, bound to `evidence_sha`.)

### QA — verify-hamilton-r1, round 1

**Overall: PASS.** Evidence bound to `f0f0588` (dirty tree — the T-005
change itself is uncommitted; dirty files: posts.tsx, work-detail.tsx,
work-index.tsx, notes/[slug]/page.tsx, notes/utils.ts, rss/route.ts +
untracked lib/dates.ts, tests/dates.test.ts).

| AC | Verdict | Decided by |
|----|---------|-----------|
| 1 — module | PASS | Runtime import: exports exactly `["formatDate","newestFirst"]`, comparator internal. formatDate body `cmp` vs `git show HEAD:app/notes/utils.ts` extract: BYTE-IDENTICAL. |
| 2 — adoption | PASS | `grep -rn '\.sort(' app/` → exit 1, ZERO matches (builder's stronger claim confirmed). Remaining `new Date(` under app/ (4): sitemap lastModified, rss pubDate, world-clock ×2 — none in sorts. |
| 3 — import hygiene | PASS | `export function formatDate` gone from notes/utils (comment mention only). Importers → lib/dates: posts.tsx, work-detail.tsx, notes/[slug]/page.tsx. Zero work→notes imports (grep exit 1). |
| 4 — unit pin | PASS | Ran `pnpm test` myself: 44/44, exit 0. Five builder transcripts present in `.sagan/ledger/T-005/qabuild/`. My independent mutation (distinct from all five): dropped the tiebreak (`return delta` unconditionally) → 42/44, exit 1, tiebreak family caught it → reverted, cmp-clean, 44/44 green. |
| 5 — behavior delta | PASS with a finding | Worktree baseline at HEAD, both builds exit 0. `<main>` cmp: 3 notes routes + /notes + /work/knav IDENTICAL. **/work ALSO byte-identical** — the old undefined-by-spec order already rendered knav→perchhq→shift on this engine, so the delta is "now specified", zero rendered bytes changed; live-DOM readback confirms tile order. RSS (dynamic route, served both builds on :3010): byte-identical, notes sequence unchanged (sagan-method → figma-to-paper → building-conan). |
| 6 — gates | PASS | tsc exit 0 · `pnpm build` exit 0 · `pnpm test` exit 0 (44 tests). |

**Gate capture (the one the human should see):**
`.sagan/ledger/T-005/gate-t5-work-order-1440-light.png` — /work at 1440,
light pinned (`data-theme` readback = light), `__introDone` + 2.5s settle,
tiles KNav → PerchHQ → Shift. Everything else in scratchpad is working
evidence.

**Adversarial finding (reported, not fixed; not a regression):** malformed
`publishedAt` → comparator returns NaN → engines clamp to +0 → the slug
tiebreak is silently bypassed (demo: `['zzz','aaa']` with junk dates stays
`zzz,aaa`). Belongs with the standing frontmatter-validation carry-forward.

**The missing test:** nothing pins newestFirst's behavior on an invalid
date string — cheap to add next to the tiebreak family once validation
decides what the contract IS (reject vs. stable-order).

**Not executed:** /work order-only diff (moot — byte-identical);
cross-engine check of the old comparator (irrelevant post-change). Servers:
:3010 used for RSS + capture, stopped and verified refused; :3000 dev
server untouched (readback 200 before/after).

## Decisions

- 2026-08-11 — Ticket compiled from the architecture review (candidate
  #3) + the grilling loop, all five design decisions confirmed by Randy
  there: tiebreak **slug ascending**; home **lib/dates.ts**; formatDate
  **moves, imports updated** (no shim); scope **dates only** (SEO nits
  stay candidate #7); interface **newestFirst(items)** returning a
  sorted copy, comparator internal. Vocabulary recorded in CONTEXT.md
  ("Newest-first"). Nothing left open for the gate beyond AC
  confirmation.

- 2026-08-11 — **Promoted** (round 1: verify all-6-PASS at `f0f0588`
  incl. an independent tiebreak-deletion mutation caught; critic
  APPROVED, 5 advisory findings, envelope validated). Best-case AC 5:
  every rendered surface byte-identical — /work's old undefined order
  already matched the specification, so the change ships as pure spec.
  Routed to the frontmatter-validation carry-forward: NaN tiebreak
  bypass (deferral explicitly judged correct by the critic) and the
  UTC-vs-local parse split between newestFirst and formatDate.
  Status → Done.

<!-- sagan:repo-owned:end -->
