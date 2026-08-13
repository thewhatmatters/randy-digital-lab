# Copy build note — T-010, round 1 (copy builder)

Persona note: `~/.claude/agents/copy/agent/instructions.md` loaded; the
persona's `agent/skills/` directory is empty on this machine, so no skill
overlays applied — bare persona + role contract.

Outcome: every in-scope surface is em-dash-free outside the AC-4
carve-outs. 65 reader-facing em dashes removed across 12 files; 0 remain
in scope; 5 allowlisted separators retained (plus code-window.tsx's
depicted-code strings, AC 4c). Gate test authored at
`tests/em-dash-budget.test.ts` — NOT run (execution belongs to verify).
No `--`, no ` - ` stand-ins, no en dashes introduced anywhere.

## Per-file counts (reader-facing em dashes, before → after)

| File | Before | After |
|---|---|---|
| app/notes/posts/the-sagan-method.mdx | 25 | 0 |
| app/notes/posts/figma-to-paper.mdx | 14 | 0 |
| app/notes/posts/building-conan.mdx | 12 | 0 |
| app/work/projects/knav.mdx | 1 | 0 |
| app/work/projects/shift.mdx | 1 | 0 |
| app/work/projects/perchhq.mdx | 1 | 0 |
| app/layout.tsx (description ×2) | 2 | 0 (title template retained, AC 4a) |
| app/notes/page.tsx (description ×2) | 2 | 0 |
| app/work/page.tsx (description ×2) | 2 | 0 |
| app/lab/page.tsx (description + intro) | 2 | 0 |
| app/lab/experiments.tsx (one blurb, two dashes) | 2 | 0 |
| app/components/command-bar.tsx (tooltip) | 1 | 0 |

Code comments in these files keep their dashes (out of scope per the
ticket). Baseline matches the ticket's 2026-08-12 measurement.

## Edits, before → after, with the reader-effect reason

Punctuation was chosen per sentence (aside → parens/comma pair, reveal →
colon, splice → period), never one uniform substitute — the mix across the
three notes is roughly: 9 parenthetical asides, 8 colons, 8 periods/new
sentences, 12 commas, 2 restructures.

### the-sagan-method.mdx (25 → 0)

1. Summary: "…me at the gate — because extraordinary claims…" → "…me at
   the gate, because extraordinary claims…". A reason clause; a comma
   attaches it without the beat of drama the dash was faking.
2. "…ready to ship* — stated with total confidence…" → "…ready to
   ship.* Stated with total confidence…". The italics are the agent's
   utterance; ending it and starting fresh puts the narrator's judgment in
   its own sentence.
3. "…what the agent *said* — which is precisely…" → "…*said*, which is
   precisely…". Plain relative clause; comma is its native punctuation.
4. "the Sagan method — [sagan.run ↗](…) — a small standard" → "the Sagan
   method ([sagan.run ↗](…)), a small standard". The link is a pointer,
   not a beat; parens file it, the comma apposition carries the definition.
5. "acceptance criteria — a ticket that says exactly what done means —
   and" → "acceptance criteria (a ticket that says exactly what done
   means), and". True aside; parens keep the main clause's spine readable.
6. "does the work — and never grades its own" → "does the work. It never
   grades its own." The rule deserves its own sentence; the period is the
   emphasis the dash was borrowing.
7. "A **critic** — a fresh instance, with no access… — reviews" → "A
   **critic** (a fresh instance, with no access…) reviews". Aside between
   subject and verb; parens restore the sentence's spine.
8. "still be broken — reading is not judging — so" → "still be broken
   (reading is not judging), so". Same aside pattern.
9. SaganLoop caption: "The Sagan loop — four stations around one ledger:"
   → "The Sagan loop. Four stations around one ledger:". Caption register:
   name, then the anatomy; the period keeps the existing colon list clean.
10. "Correctness loops converge fast — three to five rounds," → "converge
    fast: three to five rounds,". A reveal of what "fast" means; colon.
11. "allows that — but only as a choice" → "allows that, but only as a
    choice". Ordinary contrast; comma + but.
12. "three for quality — and the caps live in the runtime," → "three for
    quality. The caps live in the runtime,". Two claims (the numbers,
    where they live); a period lets each land.
13. "a role spec — mission, boundaries, output contract, rubric — is the
    contract" → "a role spec (mission, boundaries, output contract,
    rubric) is the contract". List-aside; parens.
14. "So the named bench I already had — Dieter, Dijkstra, Hamilton,
    Strunk — slotted" → "So Dieter, Dijkstra, Hamilton, and Strunk, the
    named bench I already had, slotted". Restructure: leading with the
    names avoids a second parenthetical in the paragraph and reads more
    like naming colleagues than footnoting them.
15. "what the role is called — if the agent that built" → "what the role
    is called. If the agent that built". The conditional is the rule
    itself; its own sentence.
16. "a recommended default — never buried in prose" → "a recommended
    default, never buried in prose". Trailing qualifier; comma.
17. "a preview bundle — the built thing itself, rendered at the evidence
    commit — rather than" → "a preview bundle (the built thing itself,
    rendered at the evidence commit) rather than". Aside; parens.
18. "And yes — this note is the dogfood." → "And yes, this note is the
    dogfood." Conversational turn; the comma keeps it offhand.

### figma-to-paper.mdx (14 → 0)

1. Summary: "Not because I stopped caring about design — because I
   started shipping it myself." → "…about design, but because I started
   shipping it myself." One added word ("but") makes the correction
   grammatical without the dash's crutch.
2. "go build the real thing in code — because the real thing was where" →
   "…in code, because the real thing was where". Reason clause; comma.
3. "Every great part of it — the polish, the components, the redlines —
   exists" → "Every great part of it (the polish, the components, the
   redlines) exists". List-aside; parens.
4. "remembered to update it — and I never remembered" → "remembered to
   update it. And I never remembered." The confession gets its own
   sentence; matches the note's existing short-sentence beats ("I closed
   the tab.").
5. "the one job I needed it to do — *tell me the truth about my own
   site* — was" → "…needed it to do, *tell me the truth about my own
   site*, was". Comma pair; the italics already isolate the appositive,
   so parens would double-wrap it.
6. "becomes "this flex container" — it already *is* one" → "becomes
   "this flex container". It already *is* one." The punchline stands
   alone; the period is the beat.
7. "The design tokens — color, type, grid — live in one `@theme` block"
   → "The design tokens (color, type, grid) live in one `@theme` block".
   List-aside; parens.
8. "I mirrored it onto the canvas afterward — as a record, not a spec" →
   "…afterward, as a record, not a spec". Trailing qualifier; comma.
9. "because Claude can drive Paper directly — it reads the canvas and
   writes real HTML nodes back into it — keeping the two in sync" →
   "…directly (it reads the canvas and writes real HTML nodes back into
   it), keeping the two in sync". Aside; parens (comma added where the
   closing dash sat, since the main clause resumes).
10. "assumes that instead of fighting it — one where the canvas and the
    code are two views" → "…fighting it: one where the canvas and the
    code are two views". A reveal of what such a tool is; colon.

### building-conan.mdx (12 → 0)

1. Summary: "I built one worth staring at — and somewhere in the mess of
   shipping it," → "I built one worth staring at. Somewhere in the mess
   of shipping it,". Two stories (the build, the surprise); a period
   splits them and drops a needless "and".
2. "when something broke — all of it real, all of it buried" → "when
   something broke: all of it real, all of it buried". Colon turns the
   list into evidence for the verdict.
3. PullQuote `from="— the brief, to myself"` → `from="From the brief, to
   myself"`. See the judgment flag below.
4. "telemetry ticking across the screen — I find it genuinely fun to
   watch" → "…across the screen. I find it genuinely fun to watch." The
   fragment-then-confession rhythm the note already uses.
5. "while the agent works — not a tool I'd check…, but a view" → "while
   the agent works: not a tool I'd check…, but a view". Reveal; colon.
6. "hands out licenses — three separate projects," → "hands out licenses:
   three separate projects,". The count is the reveal; colon.
7. "[Remotion](…) — a framework all its own" → "[Remotion](…), a
   framework all its own". Appositive; comma.
8. "I wrote a skill — basically a playbook that teaches… — and after
   that" → "I wrote a skill (basically a playbook that teaches…), and
   after that". Aside; parens.
9. Caption: "its reliability decays — slipping from the first tokens," →
   "its reliability decays, slipping from the first tokens,". Participial
   phrase; comma (the sentence already opens with "Context rot:").
10. "Not because the agent hits a wall — it doesn't crash, it just
    quietly starts to rot." → "…hits a wall: it doesn't crash, it just
    quietly starts to rot." The colon delivers what actually happens.
11. "wanted something nice to look at — and the looking is what changed"
    → "…nice to look at, and the looking is what changed". Plain
    coordination; comma.

### Work summaries (1 → 0 each)

- knav: "An AI command center for any website — one script tag, no AI
  expertise." → "…for any website: one script tag, no AI expertise." The
  second half explains the first; colon.
- shift: "See the careers you're already qualified for — and a 90-day
  plan to land one." → "…qualified for, and a 90-day plan to land one."
  Simple coordination; comma.
- perchhq: "Brand outreach for creators — find contacts, pitch
  personally, manage every deal." → "…for creators: find contacts, pitch
  personally, manage every deal." Category, then the verbs; colon.

### UI strings

- app/layout.tsx (description + openGraph.description): "…small
  interactive experiments — by Randy." → "…small interactive
  experiments, by Randy." Attribution tag; comma. Title template
  `'%s — randy.digital'` retained per AC 4a.
- app/notes/page.tsx (metadata + on-page intro, kept identical): "…the
  craft around it — design, tools, and…" → "…the craft around it:
  design, tools, and…". The list specifies "it"; colon.
- app/work/page.tsx (metadata + on-page intro, kept identical):
  "Selected work — projects across design and engineering." → "Selected
  work: projects across design and engineering."
- app/lab/page.tsx (metadata + on-page intro): "…experiments — each a
  small project poking at…" → "…experiments, each a small project poking
  at…". Distributive appositive; comma.
- app/lab/experiments.tsx (build-error blurb): "…build-error overlay —
  paginator, status pill, syntax-highlighted code frame and caret —
  themed with…" → "…build-error overlay (paginator, status pill,
  syntax-highlighted code frame and caret), themed with…". Inventory
  aside; parens keep the long sentence scannable.
- app/components/command-bar.tsx (theme tooltip): `Theme: ${themeLabel}
  — click to cycle (t)` → `Theme: ${themeLabel}. Click to cycle (t)`.
  State, then action, as two clean units; mirrors the terse register of
  the sibling "Toggle layout grid (g)".

## Gate test (AC 6)

`tests/em-dash-budget.test.ts`, house conventions (node:test, strict
assert). Family 1: recursive `app/**/*.mdx` scan, zero tolerance, with a
guard that the scan still finds notes and projects (an empty glob can't
pass silently). Family 2: the AC-3 string sites plus the AC-4 carve-out
hosts, scanned with comments stripped (comments are out of scope), against
the AC-4 allowlist as explicit (file, pattern, why) entries; code-window.tsx
is a documented file-level carve-out (AC 4c). A stale-allowlist test makes
carve-out removal deliberate. NOT executed here — mutation proof and the
pass run belong to verify.

## Escalations

None. Every dash in scope had a re-punctuation that preserves the
sentence; no ESCALATE-grade sentence found.

## Judgment flag (not an escalation — flagging, not guessing)

- building-conan.mdx PullQuote `from="— the brief, to myself"`: that
  leading dash is the typographic quote-attribution convention, kin to
  the AC-4 carve-outs, but it lives in an MDX file where AC 1 is
  zero-tolerance with no allowlist. I rewrote it to "From the brief, to
  myself", which reads clean in the muted attribution slot. If Randy
  prefers the classic attribution dash, the fix is a deliberate AC-4-style
  decision (and an MDX allowlist mechanism in the gate), not a copy edit.

## Facts needed from the human

None — no factual claims were added, removed, or altered; every edit is
re-punctuation or reordering of existing words (two function words
touched: "but" added in the figma summary, "and" dropped in the conan
summary).

## Voice notes

The surfaces already read in DESIGN.md's register (plain, precise,
understated confidence). The dash was doing rhythm work, not meaning
work; periods and colons carry the same beats. One deliberate echo:
"update it. And I never remembered." borrows the note's own
short-sentence pattern rather than importing a new one.

## Amendment r1.1 (human-gated; AC 3/6 amended)

- app/components/sagan-loop.tsx `<desc>` (AT-visible, read aloud): "A
  circular circuit of four stations — ticket plus acceptance criteria,
  build, critique, promote gate — with a verify satellite exchanging
  evidence with critique, a REVISE return arc, an ESCALATE ray to a
  human, and radial lines binding every station to the ledger at the
  center, in the manner of the Voyager Golden Record cover." → "A
  circular circuit of four stations: ticket plus acceptance criteria,
  build, critique, and promote gate. A verify satellite exchanges
  evidence with critique, a REVISE arc curves back, an ESCALATE ray
  reaches out to a human, and radial lines bind every station to the
  ledger at the center, in the manner of the Voyager Golden Record
  cover." Reader effect: the colon delivers the station list as a
  spoken sentence and a period splits the 55-word run into two
  breaths; the noun phrases become clauses ("curves back", "reaches
  out") mirroring the SaganLoop caption's own verbs ("REVISE arcs
  back, ESCALATE rays out to a human"), so ear and eye get one voice.
  One "and" added before "promote gate" for the read-aloud list. File
  count: 2 → 0. String content only; markup untouched.
- tests/em-dash-budget.test.ts: `app/components/sagan-loop.tsx` added
  to the scanned string sites with NO allowlist entry (per AC 6 as
  amended) — the file must scan clean.
- PullQuote attribution rewrite in building-conan: stands per Randy's
  finding disposition; no action.

## The omission (persona report)

AC 5 pins meaning and voice to the pre-change text, so cutting was held
to what the re-punctuation itself required: "and" cut from the conan
summary (the period does its work), "the named bench I already had"
demoted to an appositive in sagan-method (reads as people, not a list).
Still cuttable, NOT taken (out of AC scope, noted for a future pass):
"basically" in "basically a playbook" (building-conan) and "genuinely" in
"genuinely fun to watch" hedge nothing; "actually" appears 6 times across
the three notes and could lose half of them. Removal would buy a slightly
firmer voice at no cost to meaning.
