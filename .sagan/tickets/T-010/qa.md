# QA — T-010, round 1 (verify)

- **Verifier:** verify-useragent-r1 (persona: `~/.claude/agents/qa/agent/`)
- **Evidence SHA:** `247f58ad3be7d73668851543486bb3f37fe20a5b` (HEAD)
- **Tree state:** evidence is against HEAD **plus the uncommitted build in the
  working tree** — the T-010 changes are not yet committed. The exact
  `git status --short` + `git diff --stat` are pinned in
  `.sagan/ledger/T-010/tree-state.txt` (14 modified files, 308+/45−, plus
  untracked `tests/em-dash-budget.test.ts`).
- **Overall: PASS** (all executable AC items green; one adversarial finding
  reported below, outside the AC letter).
- **Visual captures:** none — this is a copy-only ticket with no visual AC;
  no rendering was performed or claimed.

## Per-AC verdicts

### AC 1 — zero em dashes in `app/notes/posts/*.mdx` — PASS

`grep -o '—' <file> | wc -l` per file (working tree):

```
building-conan.mdx   12 → 0
figma-to-paper.mdx   14 → 0
the-sagan-method.mdx 25 → 0
```

Before-counts recomputed from `git show HEAD:<file>` and they match the
ticket baseline exactly. Full table:
`.sagan/ledger/T-010/emdash-counts-before-after.txt`.

### AC 2 — zero em dashes in `app/work/projects/*.mdx` (frontmatter incl.) — PASS

```
knav.mdx    1 → 0
perchhq.mdx 1 → 0
shift.mdx   1 → 0
```

The single dash per file was in `summary:`; all three now re-punctuated
(colon ×2, comma ×1), confirmed by `git diff -U0 -- app/work/projects`.

### AC 3 — zero em dashes in enumerated UI strings (outside AC-4) — PASS

`grep -n '—'` on all six enumerated files. Remaining hits, each verified in
context:

| File | Remaining | Disposition |
|---|---|---|
| `app/layout.tsx` | 2 | line 28 = allowlisted title template (AC 4a); line 77 = inside a JSX `{/* */}` comment (out of scope) |
| `app/notes/page.tsx` | 0 | — |
| `app/work/page.tsx` | 0 | — |
| `app/lab/page.tsx` | 2 | both JSX comments (lines 34, 43) |
| `app/lab/experiments.tsx` | 1 | `//` code comment (line 19) |
| `app/components/command-bar.tsx` | 0 | tooltip now `Theme: ${themeLabel}. Click to cycle (t)` |

### AC 4 — carve-outs are exactly the enumerated ones — PASS

Every non-comment em dash in the carve-out hosts, confirmed by the
comment-stripping scan (`.sagan/ledger/T-010/adversarial-fullscan.txt`):

- `app/layout.tsx:28` — `'%s — randy.digital'` (4a) ✓
- `app/components/design-canvas.tsx:37` — `'Design System — randy.digital'` (4a) ✓
- `app/components/work-carousel.tsx:124` — alt `` `${title} — image ${i + 1} of ${count}` `` (4b) ✓
- `app/components/work-carousel.tsx:363` — `` aria-label={`${title} — images`} `` (4b) ✓
- `app/components/work-detail.tsx:64` — `` `Visit site — ${title} (opens in a new tab)` `` (4b) ✓
- `app/components/code-window.tsx:17,21,39` — depicted code-comment display strings (4c, file-level) ✓

Nothing else. No extra em-dash string exists in any enumerated or carve-out
file.

### AC 5 (mechanical half) — no dash stand-ins — PASS

- `grep -n -- '--'` across all in-scope MDX: only the `---` frontmatter
  fences (legitimate).
- `grep -n '–'` (U+2013): zero in all in-scope MDX.
- Added-lines-only diff scan (`git diff -U0 -- app/ | grep '^+' | grep -E ' - |--|–'`):
  **no artifacts in added lines** — no `--`, no loose ` - `, no en dashes
  introduced anywhere in the change.
- Voice/meaning judgment half: **critic's lane**, verdict APPROVED at
  `.sagan/tickets/T-010/verdicts/round-1.json` — not re-judged here.

### AC 6 — standing gate test + mutation proof — PASS

`tests/em-dash-budget.test.ts` is reached by `pnpm test` (suites 7–8 in TAP
output, 5 tests: glob guard, MDX zero-tolerance, string-sites-vs-allowlist,
stale-allowlist, carve-out-file-exists). Baseline run: **106/106 pass, exit 0**
(`.sagan/ledger/T-010/pnpm-test-baseline.txt`). Prior suite was 101; 101 + 5
new = 106 ✓.

**Mutation proof 1 (MDX), T-003 standard:** appended an em-dash sentinel line
to `app/notes/posts/building-conan.mdx` → `pnpm test` **exit 1**,
`not ok 2 - every app/**/*.mdx is em-dash-free, frontmatter included (AC 1–2)`
(`.sagan/ledger/T-010/mutation-mdx-fail.txt`). Reverted from a byte copy;
SHA-256 identical before/after:
`c30f2ebc… == c30f2ebc…` (`mutation-mdx-{pre,post}-hash.txt`).

**Mutation proof 2 (string site):** replaced the colon with an em dash in the
`app/notes/page.tsx` metadata description → `pnpm test` **exit 1**,
`not ok 1 - the enumerated string sites carry no em dash outside the AC-4 allowlist (AC 3)`
(`.sagan/ledger/T-010/mutation-string-fail.txt`). Reverted; SHA-256 identical:
`0be98dcd… == 0be98dcd…` (`mutation-string-{pre,post}-hash.txt`).

Post-mutation re-run: **106/106 pass, exit 0**
(`.sagan/ledger/T-010/pnpm-test-post-mutation-green.txt`), and
`git diff --stat` for the touched files matches the pinned tree state exactly
— the tree left byte-identical.

### AC 7 — gates green at the evidence SHA — PASS

Exact `gates.verify_commands` from `.sagan/sagan.yaml`:

| Command | Exit | Evidence |
|---|---|---|
| `pnpm test` | 0 (106/106) | `pnpm-test-baseline.txt` |
| `pnpm exec tsc --noEmit` | 0, no output | `tsc-noemit.txt` |
| `pnpm build` | 0, all routes emitted | `pnpm-build.txt` |

### AC 8 — string content + the new test file are the only changes — PASS

Full `git diff -- app/` reviewed (pinned at
`.sagan/ledger/T-010/app-diff.txt`): every hunk in the six TSX sites changes
only string-literal/JSX-text content; MDX hunks are prose plus two string
prop values (`<PullQuote from=…>`, one `<Caption>` text). No JSX structure,
imports, styles, or logic touched. Non-`app/` changes are the new
`tests/em-dash-budget.test.ts` and `.sagan/` bookkeeping only.

## Adversarial pass (beyond the AC)

Wrote a repo-wide comment-stripping em-dash scanner (same state machine as
the gate test) over ALL `app/**/*.{ts,tsx}` + `lib/**` — not just the
enumerated files (`.sagan/ledger/T-010/adversarial-fullscan.txt`):

- **Finding (reported, not fixed): `app/components/sagan-loop.tsx:17–18`** —
  the SVG `<desc id="sagan-loop-d">` carries **two em dashes** in prose-voice
  copy ("A circular circuit of four stations — ticket plus acceptance
  criteria, build, critique, promote gate — with a…"). The SVG is
  `role="img" aria-labelledby="sagan-loop-t sagan-loop-d"`, so this text IS
  reader-visible to assistive technology, and the component renders inside
  `the-sagan-method.mdx` — a note AC 1 covers. It is outside the AC-3
  enumeration (so **no AC fails**), it is not allowlisted, and the gate test
  does not scan it. It reads as prose (a parenthetical dash pair), not as a
  typographic separator like the 4b labels. The critic independently flagged
  the same site (round-1.json, finding 2). **Recommend a PM decision:**
  either enumerate + rewrite it, or add it to the allowlist deliberately as
  an image-description carve-out.
- Glob recursion: proven live — the walk found files two directories deep and
  the MDX mutation at that depth failed the suite; the guard test also pins
  both content dirs against a silently-empty scan.
- Remaining `lib/` hits (`intro-gate.ts`, `mdx.ts`, `rss.ts`) are the
  dev-only console/error strings + comments the ticket names out of scope.
- Critic's low finding on per-line (vs per-occurrence) allowlist granularity
  confirmed by reading the test (line 209): a second em dash on an
  already-allowlisted line would pass. Tiny blast radius; ticket's
  (file, pattern) requirement is satisfied as written.

## not_verified

- AC 5 voice/meaning quality ("reads like the site", comparative bar): a
  prose judgment routed to the critic, not executable here. Critic verdict
  APPROVED on record.
- Live rendering of any page: not performed — no visual AC on this ticket;
  no screenshots exist and none are claimed.
- Whether the sagan-loop `<desc>` should be in scope: a scope decision, not
  an executable check — surfaced above for the PM/human.

## Gate-relevant evidence (what the human should see)

All under `.sagan/ledger/T-010/`:

- **Gate:** `mutation-mdx-fail.txt` + `mutation-string-fail.txt` (the test
  can fail), `pnpm-test-post-mutation-green.txt` (and returns to green),
  `emdash-counts-before-after.txt` (the copy change itself),
  `adversarial-fullscan.txt` (the sagan-loop finding).
- **Working evidence:** `tree-state.txt`, `pnpm-test-baseline.txt`,
  `tsc-noemit.txt`, `pnpm-build.txt`, `app-diff.txt`, the four
  `mutation-*-hash.txt` files.

## Delta r1.1 — sagan-loop.tsx amendment (AC 3/6 amended at the promote gate)

- **Verifier:** verify-useragent-r1. **Evidence SHA:** unchanged,
  `247f58ad3be7d73668851543486bb3f37fe20a5b` (HEAD) + dirty tree, re-pinned
  in `.sagan/ledger/T-010/delta-r1.1-tree-state.txt` (delta vs round 1:
  `app/components/sagan-loop.tsx` now modified, 12 lines).
- **Overall: PASS** on all four delta items.

### 1. Zero U+2014 in `app/components/sagan-loop.tsx` — PASS

`grep -n '—' app/components/sagan-loop.tsx` → no matches (grep exit 1). The
round-1 finding (2 em dashes in the SVG `<desc>`) is resolved: the desc is
re-punctuated (colon + sentence split), the diff touches only the `<desc>`
JSX text — the AC-8 string-only invariance still holds for the amendment.

### 2. Gate test scans the new site + mutation proof — PASS

`tests/em-dash-budget.test.ts:132` now lists
`'app/components/sagan-loop.tsx'` in `stringSites`, with **no allowlist
entry** (grep for `sagan-loop` in the test matches only the stringSites
line). Baseline `pnpm test`: **106/106, exit 0**
(`delta-r1.1-pnpm-test-baseline.txt`).

**Mutation proof (T-003 standard):** re-inserted an em dash into the desc
(line 17, `four stations:` → `four stations —`) → `pnpm test` **exit 1**,
`not ok 1 - the enumerated string sites carry no em dash outside the AC-4
allowlist (AC 3)`, violation output naming
`app/components/sagan-loop.tsx:17` (`delta-r1.1-mutation-fail.txt`).
Reverted from a byte copy; SHA-256 identical before/after:
`3f3f1591… == 3f3f1591…` (`delta-r1.1-mutation-{pre,post}-hash.txt`).
Re-run: **106/106, exit 0** (`delta-r1.1-pnpm-test-green.txt`).

### 3. Gates still green — PASS

| Command | Exit | Evidence |
|---|---|---|
| `pnpm exec tsc --noEmit` | 0 | `delta-r1.1-tsc-noemit.txt` |
| `pnpm build` | 0 | `delta-r1.1-pnpm-build.txt` |

### 4. Tree state re-pinned — PASS

HEAD confirmed unchanged at `247f58ad3be7`; `git status --short` +
`git diff --stat` captured in `delta-r1.1-tree-state.txt`.

### Delta gate-relevant evidence

`delta-r1.1-mutation-fail.txt` (the new site can fail the gate),
`delta-r1.1-pnpm-test-green.txt` (and returns to green). Working:
`delta-r1.1-pnpm-test-baseline.txt`, `delta-r1.1-tsc-noemit.txt`,
`delta-r1.1-pnpm-build.txt`, `delta-r1.1-tree-state.txt`, the two
hash files.
