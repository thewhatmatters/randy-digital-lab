---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-006
title: lib/mdx.ts — deepen the parser contract (named errors, validation floor, string lists)
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
builder_id: frontend-hopper-r1
verifier_id: verify-hamilton-r1
evidence_sha: fb3dc5b72f72f65633abacec03a74aca511bc0e3
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

Deepen the frontmatter parser (architecture review candidate #1). Today
its return contract is shallow: a file with no frontmatter crashes the
whole build with an anonymous TypeError; block lists can only be
label/value pairs so work re-derives its images with an inverse shim;
unknown keys drop silently; and invalid dates flow downstream as NaN,
silently bypassing the newest-first tiebreak T-005 just specified.

Design decided at the gate (four decisions, Randy-confirmed): deepen the
hand-rolled parser — Velite stays the trigger-ready escalation for when
the lab (third content type) lands; malformed files fail the build
loudly with the filename and reason; each pipeline declares a required-
field floor and invalid dates are named errors; block items without a
": " separator come back as plain strings, deleting work's shim.

Done means: the crash is impossible (every failure is a named error
carrying the file path), the validation floor holds for both pipelines,
newestFirst and formatDate agree on what instant a date-only string is,
the itemToPath/RawWorkMetadata shim is deleted, the test suites are
updated deliberately (quirk pins replaced by contract pins), and every
rendered surface is byte-identical — this ticket ships contract, zero
pixels. If any part can't be done without a rendered change, stop and
tell me which and why.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->
## AC

1. **Named errors, never crashes:** a content file with no frontmatter,
   a missing required field, or an unparseable `publishedAt` produces a
   named error (e.g. `ContentFileError`) whose message carries the file
   path and the specific problem; the throw happens where the path is
   known (`getMDXData`/`readMDXFile` layer, not inside `parseFrontmatter`
   blind). The build still fails on bad content (fail-loudly decision) —
   but actionably. Proven with temporary fixtures in `tests/fixtures/`
   (never in the real content dirs).
2. **Validation floor:** each pipeline declares its required fields —
   notes: `title`, `publishedAt`, `summary`; work: those plus
   `thumbnail` and `images` (≥1 entry) — enforced at read time through
   the shared reader (one mechanism, per-pipeline field lists). All
   current real content passes unchanged.
3. **Date agreement:** `newestFirst` and `formatDate` interpret a
   date-only `publishedAt` as the SAME instant (mechanism is the
   builder's call — normalize at parse or align the two readers — but
   the invariant is tested), and rendered date strings do not change
   (AC 6 byte-check is the proof). Invalid dates can no longer reach
   the comparator (AC 1/2 reject them first) — the T-005 NaN bypass
   becomes unreachable by contract.
4. **Native string lists + shim deletion:** block items without a
   `": "` separator parse as plain strings; items with it keep the
   `{label, value}` shape; `app/work/utils.ts` loses `itemToPath` and
   `RawWorkMetadata` entirely — consumers read parser output directly.
   Unknown/malformed keys still skip, but now with a build-time warning
   naming file and line (no more fully-silent drops).
5. **Tests updated deliberately:** the T-003 pins of the raw-pair quirk
   (`{label, value: ''}` for bare items) are REPLACED by string-list
   contract tests — a dated note in the test file says why; new
   families cover the error contract (each failure mode, filename
   asserted in the message), the validation floor per pipeline, and
   the date-agreement invariant. House mutation standard per new
   family; full suite green.
6. **Zero rendered change:** `pnpm exec tsc --noEmit`, `pnpm build`,
   `pnpm test` all exit 0; verify byte-compares rendered `<main>`
   regions vs a HEAD-worktree baseline (three notes routes, `/notes`,
   `/work`, `/work/knav`) — all identical; RSS identical. The only
   diffs are `lib/`, `app/*/utils.ts`, and `tests/`.

## Method

- **items:** (1) error type + throw-with-path layer (AC 1), (2)
  validation floor via the shared reader (AC 2), (3) date agreement
  (AC 3), (4) string-list parse + shim deletion (AC 4), (5) test
  migration + new families (AC 5) — built and checked individually.
- **lane:** correctness — round cap 5.
- **builder:** frontend role (the module and both consumers are its
  territory; test conventions per tests/).
- **round-1 evidence:** green suite + mutation transcripts, gate runs,
  the HEAD-worktree byte-compare set, and a demonstration transcript of
  each named error firing on a temp fixture (exact message shown).
- **sources (pointers, not paraphrase):** `lib/mdx.ts` +
  `app/notes/utils.ts` + `app/work/utils.ts` (the contract + shim) ·
  `lib/dates.ts` (date agreement partner) · `CONTEXT.md` ·
  `tests/mdx.test.ts` + `tests/dates.test.ts` (suites to migrate) ·
  `.sagan/MEMORY.md` (mutation recipe, worktree baseline, carry-forward
  list this ticket closes).

## Frontend

(builder appends its build note here; builders never verify their own work.)

### Build note — frontend-hopper-r1, 2026-08-11

Built all five Method items. Diff surface: `lib/mdx.ts` (rewritten),
`lib/dates.ts`, `app/notes/utils.ts`, `app/work/utils.ts`, `tests/mdx.test.ts`
(rewritten), `tests/dates.test.ts` (extended), `tests/fixtures/` (2 obsolete
work fixtures deleted; `errors/` + `floor/` trees added). No production
component/route touched — zero rendered change is held by construction; the
byte-compare proof belongs to verify (AC 6).

**AC 1 — error contract.** `ContentFileError extends Error` in `lib/mdx.ts`:
`name = 'ContentFileError'`, fields `filePath` + `problem`, message
`<path>: <problem>`. `parseFrontmatter` never throws — it returns `null` for
a missing fence pair (plus a `ParseIssue[]` alongside metadata); the throw
lives in `readMDXFile`/`validate`, the layer that knows the path. All three
failure modes (no frontmatter, missing required field, unparseable
publishedAt) demonstrated with exact messages in
`.sagan/ledger/T-006/qabuild/named-errors-demo.md`, on fixtures under
`tests/fixtures/errors/` + `tests/fixtures/floor/` only.

**AC 2 — validation floor.** One mechanism: `ContentSchema =
Record<field, 'scalar' | 'date' | 'string-list'>`, enforced in the shared
reader; `getMDXData(dir, schema)` now requires it. Notes declares
title/publishedAt/summary; work adds thumbnail + images (`'string-list'` =
≥1 entry, every entry a plain string). Checked by reading all 6 real content
files: every note and project passes (also pinned by a real-content test).

**AC 3 — date agreement.** Mechanism: **align the readers on LOCAL midnight**
via a shared `asLocalInstant()` in `lib/dates.ts` (formatDate's longtime
`T00:00:00` injection, extracted; the comparator now uses it too).
Reasoning: formatDate renders through `toLocaleString`, so the UTC
interpretation would shift every date-only entry to the previous day
anywhere west of UTC (this machine is CDT — "August 10" would render
"August 9"); local keeps every rendered date string byte-identical, and
formatDate's behavior is unchanged rather than re-proven. Normalize-at-parse
was rejected because it rewrites the stored `publishedAt` string, which
callers render. Invalid dates are rejected by the `'date'` rule using the
SAME reader, so validity and rendering can't diverge — the T-005 NaN
tiebreak bypass is unreachable by contract.

**AC 4 — string lists + shim deletion.** Bare block items (`- /path`) parse
as plain strings; `": "` items keep `{label, value}` (first-separator split,
remainder rejoined — unchanged). `RawWorkMetadata` + `itemToPath` deleted;
`getWorkProjects` returns `getMDXData<WorkMetadata>` output directly.
Consequence accepted per the floor: the `[thumbnail]` fallback for a project
with no images is gone (AC 2 requires images ≥1 — all real projects declare
them), and an image path containing `": "` is now a named error instead of a
silent mangle-and-rejoin. Skipped frontmatter lines surface as
`console.warn` at read time naming file + line + raw text (the ticket says
"file and line", the dispatch said "file + key" — I emit file, line, the
key where known, and the raw line, covering both readings).

**AC 5 — tests.** `tests/mdx.test.ts` migrated with a dated header note
explaining exactly which T-003 pins were replaced and why (raw-pair quirk,
colon-path rejoin, thumbnail fallback). New families: error contract
(filename asserted in every message), validation floor per pipeline, string
lists + reported skips, date agreement (in `tests/dates.test.ts`). House
mutation standard: 4 transcripts in `.sagan/ledger/T-006/qabuild/`, each
restored from a saved pristine copy + diff-verified. Suite: 58/58 green.

**Gates run (verified, not reasoned):** `pnpm exec tsc --noEmit` → 0;
`pnpm test` → 0 (58 tests, 20 suites). `pnpm build` and byte-compares
deliberately NOT run — builder scope excludes them.

**Ambiguities flagged:**
- The date-agreement mutation pin is TZ-sensitive by design: on a UTC
  machine the pre-T-006 comparator is indistinguishable from the aligned
  one (local == UTC there), so the mutation demo only bites off-UTC. Noted
  in the transcript; the invariant itself holds everywhere.
- `ParseIssue.line` assumes the standard file shape (fence on line 1); a
  file with leading blank lines would drift the number. The raw line text
  in every warning is the real locator.
- AC 4's warning fires per `getMDXData` call (build renders call the
  pipelines more than once, so a warning can repeat). Deduping felt like
  scope invention; flagging instead.

**Simplification proposed (not applied):** `formatDate`'s
`includeRelative` branch — the clockless year/month/day subtraction T-005
already flagged as boundary-buggy — has NO caller passing `true` (grep
verified: three call sites, all default/`false`). Deleting the branch
collapses the function to three lines around `asLocalInstant`; that is
ticket #7's subtraction, and this build kept it byte-identical rather than
touching it.

**Persona note:** the role spec names Dieter; this run staffed the hopper
persona per dispatch (contract/seam work). Role-spec constraints (no
self-verify, no AC/QA edits) followed throughout.

## QA

(verify appends the evidence summary here, bound to `evidence_sha`.)

### QA — verify-hamilton-r1, round 1

**Overall: PASS.** All evidence bound to `fb3dc5b72f72f65633abacec03a74aca511bc0e3`
(uncommitted working tree; code diff surface exactly `lib/mdx.ts`,
`lib/dates.ts`, `app/notes/utils.ts`, `app/work/utils.ts`, `tests/*` —
in AC 6 scope). Gates: `pnpm exec tsc --noEmit` → 0, `pnpm build` → 0,
`pnpm test` → 0 with **58/58** (20 suites).

| AC | Verdict | Decided by |
|----|---------|-----------|
| 1 named errors | PASS | Fresh scratchpad fixtures (not the builder's) through real `getMDXData`: all 3 failure modes throw `ContentFileError` with path + problem in the message; `parseFrontmatter` called directly with 5 junk inputs (empty, no fences, lone fence, stray fence, 100k-char line) — never throws, returns null |
| 2 validation floor | PASS | Real content 6/6 passes both pipelines; per-pipeline floor fixtures fail correctly through the real `getBlogPosts`/`getWorkProjects` (cwd-swapped fixture trees) |
| 3 date agreement | PASS | Executed: comparator instant == formatDate's implied instant (1786338000000, CDT machine so a UTC read would diverge −5h — observable); `newestFirst` ties date-only vs explicit local midnight (slug tiebreak engaged); junk date is NaN under the shared reader and rejected by the `'date'` rule before the comparator |
| 4 string lists + shim | PASS | `getWorkProjects()`: `images` arrives as ordered plain `string[]` in all 3 projects; grep `itemToPath|RawWorkMetadata` → comment-only mentions, zero code; skip-warning fired with file + line + reason + raw text (exact text in the ledger event) |
| 5 tests deliberate | PASS | 58/58 re-run; 5 builder transcripts present + consistent; dated migration note verified at `tests/mdx.test.ts:1-26`; independent mutation cycle run (below) |
| 6 zero rendered change | PASS | HEAD worktree baseline built; `<main>` extract + `cmp` for `/notes/building-conan`, `/notes/figma-to-paper`, `/notes/the-sagan-method`, `/notes`, `/work`, `/work/knav` — **all byte-identical**; RSS via sequentially served builds on :3010 — **identical** (1759 B). Worktree removed, servers stopped |

**Independent mutation (finding worth keeping):** the planned mutation —
delete the `value.length === 0` clause from `validate`'s string-list rule —
**SURVIVED 58/58**. It is an *equivalent mutant*: `parseFrontmatter` only
sets a key when `items.length > 0`, so an empty-but-present list can never
reach `validate`; the observable floor (absent/empty `images:` → named
error) is pinned and held under the mutation. Defensive dead code, not a
coverage gap. Second mutation (break `asLocalInstant`'s `T00:00:00`
injection → raw UTC read) **killed**: 6 tests fail, exit 1, including the
date-agreement pin. Restored from saved pristine copies, diff-verified
clean, suite green.

**Adversarial pass (report-only, both pre-existing regex behavior):**
`publishedAt: 2026-02-30` passes the `'date'` rule (JS rolls to Mar 2,
renders "March 2, 2026") — impossible calendar days are accepted; and a
no-frontmatter prose file containing two `---` thematic breaks parses the
span between them as empty frontmatter (unanchored fence regex), still
failing loudly with a named error but misdiagnosed as missing-field. The
missing test: a calendar-validity pin on the `'date'` rule.

**Gate evidence** (what the human should see): the byte-compare table above
+ the ledger `evidence.recorded` event; mutation working evidence lives in
this run's transcript. No captures were required (zero-pixel ticket; no
rendered-surface judgment involved). Note: `builder_id` was blank in the
frontmatter; filled with `frontend-hopper-r1` from the dispatch record
while setting my own fields. Untracked `recording.mov` at repo root
predates this build (Aug 10 20:22) — user artifact, not builder scope
drift.

## Decisions

- 2026-08-11 — Ticket compiled from architecture review candidate #1 +
  the T-005 carry-forwards. Four design decisions confirmed by Randy at
  the opening gate: **deepen hand-rolled** (Velite remains the
  documented escalation when the lab lands — CLAUDE.md's standing
  decision untouched); **fail loudly with filename**; **validation
  floor + date normalization both in**; **native string lists, shim
  deleted**. Closes carry-forwards: no-frontmatter crash, NaN tiebreak
  bypass (unreachable by contract), UTC-vs-local split, plain-list
  inexpressibility.

- 2026-08-11 — **Promoted** (round 1: verify executed all 6 ACs PASS at
  `fb3dc5b` — six routes + RSS byte-identical, zero pixels; critic
  APPROVED, 7 advisory findings, envelope validated). Gate outcomes:
  CONTEXT.md vocabulary applied ("Validation floor" added,
  "Newest-first" sharpened with the local-midnight clause). Closed
  carry-forwards: no-frontmatter crash, NaN tiebreak bypass, UTC/local
  split, plain-list tax. New follow-ups routed: calendar-validity pin +
  fence-anchor fix (future validation ticket), BlockItem typing of
  unvalidated optional lists → review candidate #6, formatDate
  relative-branch subtraction → candidate #7. Status → Done.

<!-- sagan:repo-owned:end -->
