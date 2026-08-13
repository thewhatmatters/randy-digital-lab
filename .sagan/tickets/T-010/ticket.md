---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-010
title: Copy pass — zero em dashes in reader-facing copy, with a standing gate
status: Done
priority: Medium
assignee:
labels: [copy, hygiene, gate]
parent:
url:
linear_updated_at:
# ── mirror-script-owned (stamped by sagan-plan, never by hand) ──────────────
fetched_at:
mirror_version: 1
# ── repo-owned (carried across every fetch; set by the run, not the tracker) ─
builder_id: copy-useragent-r1
verifier_id: verify-useragent-r1
evidence_sha: 247f58ad3be7d73668851543486bb3f37fe20a5b
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

Reader-facing copy leans on the em dash as its default connective: 51 in
the three notes alone (12 / 14 / 25), one in each work summary, and a
handful in page descriptions and UI strings (measured 2026-08-12 on the
working tree at 93ebf3e). Randy's call: however well an individual dash
reads, the density is a recognizable AI-writing tell, and this is a
personal site whose voice must read as his.

Rewrite the reader-facing surfaces so em dashes go to zero, with two
named typographic carve-outs (title-pattern separators and image
aria/alt labels, which are conventions rather than prose voice). The
rewrite is sentence-level re-punctuation in the site's voice, never a
mechanical glyph swap. Code comments and dev-only console/error strings
are out of scope: no reader attributes those to the author.

Done means: every in-scope surface is em-dash-free outside the
carve-outs, the prose still reads like the site (critic judges against
the pre-change text), no mechanical artifacts snuck in (no "--", no
loose hyphens standing in), a standing test in pnpm test holds the
budget at zero so the count cannot creep back, and the diff touches
string content only. If a sentence genuinely cannot lose its dash
without damage, stop and show me that sentence rather than shipping a
bad rewrite.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->

## AC

1. Zero em dashes (U+2014) in every `app/notes/posts/*.mdx`. Baseline,
   measured 2026-08-12 on the working tree at 93ebf3e:
   `building-conan` 12, `figma-to-paper` 14, `the-sagan-method` 25.
2. Zero em dashes in every `app/work/projects/*.mdx`, frontmatter
   included (baseline: 1 per file, all in `summary`).
3. Zero em dashes in reader-visible UI strings — the metadata
   descriptions (`app/layout.tsx`), page descriptions
   (`app/notes/page.tsx`, `app/work/page.tsx`, `app/lab/page.tsx`),
   lab blurbs (`app/lab/experiments.tsx`), tooltip strings
   (`app/components/command-bar.tsx`), and the AT-visible SVG
   description in `app/components/sagan-loop.tsx` (Amended — see
   Decisions, r1.1) — EXCEPT the carve-outs in AC 4.
4. Carve-outs (the only em dashes that may remain in reader-visible
   strings): (a) title-pattern separators — the metadata title template
   `'%s — randy.digital'` in `app/layout.tsx` and the
   `'Design System — randy.digital'` node label in
   `app/components/design-canvas.tsx`; (b) image aria/alt separator
   labels in `app/components/work-carousel.tsx` and the
   `aria-label={'Visit site — ...'}` in
   `app/components/work-detail.tsx`; (c) the code-sample display
   strings in `app/components/code-window.tsx`, which depict code
   comments and follow code comments out of scope.
5. Rewrites re-punctuate the sentence (colon, comma, period + new
   sentence, parentheses, or restructure). No mechanical artifacts: no
   `--`, no ` - ` standing in for a dash; en dash (U+2013) only in
   numeric ranges. Meaning and voice preserved — critic verdict
   APPROVED with the pre-change text as the comparative bar.
6. A standing budget test joins `pnpm test`: it scans every
   `app/**/*.mdx` for U+2014 (zero tolerance) and checks the AC-3
   string sites — including `sagan-loop.tsx` (Amended — see Decisions,
   r1.1) — against the AC-4 allowlist, failing on any new em dash.
   Proven able to fail by mutation evidence (T-003 standard: insert an
   em dash, watch it fail, remove it).
7. `pnpm test`, `pnpm exec tsc --noEmit`, and `pnpm build` green at the
   evidence SHA.
8. String content and the new test file are the only changes — no
   component structure, DOM, style, or behavior edits (the strings ACs
   1–3 mandate changing are the carve-out from this invariance).

## Method

- Lane: copy. One builder writes the prose and the test; critic reviews
  the rewrites as prose (comparative bar: the pre-change text, per
  AC 5); verify runs the mechanical floor and the AC-6 mutation proof.
- In scope: `app/notes/posts/*.mdx`, `app/work/projects/*.mdx`, and the
  reader-visible string sites enumerated in AC 3. Out of scope: code
  comments everywhere, dev-only console/error strings
  (`lib/mdx.ts`, `lib/intro-gate.ts`), `.sagan/`, `docs/`,
  `CLAUDE.md`, and anything under `tests/` except the new gate test.
- Rewrite discipline: work sentence by sentence; pick the punctuation
  the sentence wants rather than a uniform substitute (uniform
  replacement is its own tell). The voice reference is the existing
  notes and DESIGN.md's voice section. Where a dash marked a real
  aside, parentheses or a comma pair usually serve; where it marked a
  reveal, a colon; where it spliced two thoughts, a period.
- The gate test: one new file under `tests/` (name at the builder's
  discretion, e.g. `tests/em-dash-budget.test.ts`). MDX scan is
  zero-tolerance by glob; the string-site check reads the enumerated
  files and applies the AC-4 allowlist as explicit (file, pattern)
  pairs so a future legitimate separator must be added deliberately.
- Round-1 evidence: per-file before/after em-dash counts, the gate test
  output (pass), and the mutation proof (fail then pass).
- Escalation: a sentence that cannot lose its dash without damage goes
  to the human as a named question (ESCALATE), never a silent keep and
  never a bad rewrite.

## Decisions

- 2026-08-12 (gate, Randy): scope is reader-facing only — code comments
  and dev-only strings stay untouched.
- 2026-08-12 (gate, Randy): budget is ZERO everywhere in scope (stricter
  than the PM's ≤2-per-note recommendation).
- 2026-08-12 (gate, Randy): typographic separator patterns survive —
  title templates and image aria/alt labels, enumerated as the AC-4
  allowlist.
- 2026-08-12 (gate, Randy): the standing budget test ships with the
  pass (AC 6), not as a follow-up.
- 2026-08-12 (promote gate, Randy): PROMOTE at evidence SHA
  247f58ad3be7 — critic APPROVED r1 (4 low findings), verify PASS 8/8,
  106/106 tests, both mutation proofs.
- 2026-08-12 (amendment r1.1, Randy): the SaganLoop SVG `<desc>`
  (AT-visible, 2 em dashes, outside the original enumeration — flagged
  by critic and verify) is rewritten and `sagan-loop.tsx` joins the
  gate test's scanned sites. AC 3 and AC 6 amended accordingly.
- 2026-08-12 (finding disposition, Randy): the PullQuote attribution
  rewrite in building-conan stays; no attribution-dash carve-out.

<!-- sagan:repo-owned:end -->
