---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-001
title: Note — "The Sagan Method" — agent management, loops, and the human gate
status: Done
priority: Medium
assignee:
labels: [content, notes]
parent:
url:
linear_updated_at:
# ── mirror-script-owned (stamped by sagan-plan, never by hand) ──────────────
fetched_at:
mirror_version: 1
# ── repo-owned (carried across every fetch; set by the run, not the tracker) ─
builder_id: copy-strunk-r1
verifier_id: verify-hamilton-r1
evidence_sha: 6aacafeb60704185c239756e6225e506cba6e021
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

Write a new note (blog entry) introducing my Sagan method — the agent-work
verification standard at https://sagan.run. It should work as an
introduction to agent management for someone who runs coding agents but has
never structured the work: why claims aren't proof, how the
builder → critic → verifier → human loop works, how I use my existing named
agents inside it, and what being the human-in-the-loop actually looks like
during a run.

Voice and format match the existing notes (first-person, wry, concrete —
see `building-conan.mdx`): MDX in `app/notes/posts/`, `<Margin>` /
`<PullQuote>` for the editorial right column, no byline. Ground every claim
about the method in the real design (vault:
`ideas/agent-org-pm-sme-fleet.md` v3.4) and the live site copy — invent no
capabilities the standard doesn't have.

Done means: the note exists at the planned slug with valid frontmatter,
covers the approved outline below, reads in my voice, links to sagan.run,
and the site's gates pass. If a section can't be written honestly from the
source material, stop and tell me which and why.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->
## Outline (approved scope — mirrors the house note shape:
## prose cold-open, then 4 H2 sections, ~800 words total)

- **Cold open (prose before the first H2).** The agent that swore it was
  done — claims vs. proof, scrollback is not an audit trail. Name the
  method and the namesake in one line: extraordinary claims require
  extraordinary evidence — [sagan.run ↗].
- **H2 — Four stations, one rule.** Builder → fresh critic → verifier →
  human gate; critic flags, never fixes; verifier is never the builder.
  The four verdicts in a breath — and why APPROVED means *verified*, not
  *plausible*. AC-before-dispatch folded in as the opening beat: you brief
  in plain language, a PM compiles the done-criteria, you confirm, then
  work starts.
- **H2 — Loops with circuit breakers.** Correctness converges in 3–5
  rounds; quality can run 10–40 — but only as a deliberate human choice.
  Caps live in the runtime, not a model's memory; the same finding failing
  three times means "your strategy may be wrong," not round six.
- **H2 — Bring the agents you already have.** Roles vs. bindings: the role
  spec is the contract, the agent is the binding — the named bench
  (Dieter, Dijkstra, Hamilton, Strunk…) slots into `.sagan/roles/`
  unchanged. Builder ≠ verifier is about identity, not job titles.
- **H2 — You hold the gates.** Human-in-the-loop ≠ approving keystrokes:
  the Needs-you queue (structured questions, recommended defaults),
  mid-run escalations, the promote gate with a preview bundle. Ledger in
  one line — tickets and `events.jsonl` commit, evidence binds to a SHA.
  Close on the dogfood kicker: this note itself shipped through a Sagan
  run, one directory to add, one to delete.

## AC

1. `app/notes/posts/the-sagan-method.mdx` exists with frontmatter matching
   the house shape (`title`, `publishedAt`, `summary` — single quotes, like
   the existing notes); it appears on `/notes` and renders at its slug with
   no MDX/runtime errors.
2. Every outline item above is present as a section, in order; none padded,
   none silently dropped (a cut requires a Decisions entry).
3. Factual floor: every claim about the method traces to sagan.run or the
   design thesis (verdict names, round caps 5/3, builder≠verifier,
   AC-before-dispatch, ledger path). No invented features, no fabricated
   run anecdotes — the cold-open incident and any numbers come from Randy
   or are framed as hypothetical.
4. Shape and length mimic the existing notes, measured against both
   (`building-conan.mdx` 775w/4 H2s/2 Margin/1 PullQuote;
   `figma-to-paper.mdx` 816w/5 H2s/1 PullQuote): 700–950 words, 4–5 H2s,
   prose cold-open before the first H2, 1–2 `<Margin>`s, exactly one
   `<PullQuote>` — density matched, never exceeded.
5. Voice matches the existing notes: first-person single-author, no byline,
   links use the house `[text ↗](url)` pattern for external URLs; exactly
   one link to https://sagan.run in body copy.
6. `pnpm exec tsc --noEmit` and `pnpm build` both exit 0 (standing gates
   from sagan.yaml).
7. Craft, judged by the fresh critic on the rendered capture: (a) a reader
   who has never structured agent work can restate the four stations and
   the human's job from this note alone; (b) nothing reads as
   documentation pasted into a blog — it stays a story; (c) the title and
   summary would make Randy's existing audience click without overpromising.

## Method

- **items:** (1) draft per approved outline (AC 1–3), (2) voice +
  editorial-margin pass (AC 4), (3) render + gates (AC 1, 5) — built and
  checked individually.
- **lane:** quality — craft judgment governs, round cap 3.
- **builder:** copy role; frontend role only if a component gap surfaces
  (none expected — `<Margin>`/`<PullQuote>` exist).
- **round-1 evidence:** rendered capture of the note at desktop + 375px,
  the `/notes` index showing the entry, and the gate-command runs — shipped
  with the first draft so critique never waits.
- **sources (pointers, not paraphrase):** https://sagan.run · vault
  `ideas/agent-org-pm-sme-fleet.md` · vault
  `research/synthesis/agent-reviewer-refinement-loops.md` ·
  `app/notes/posts/building-conan.mdx` + `figma-to-paper.mdx` (voice,
  shape, and length references) ·
  `.sagan/sagan.yaml` (this repo's live config, for the dogfood close).

## Copy

(builder appends its build note here — what was written, key choices,
anything the AC left ambiguous. Builders never render-check their own work.)

### Build note — copy-strunk-r1, round 1 (2026-08-10)

**Written:** `app/notes/posts/the-sagan-method.mdx` — full draft per the
approved outline. Cold open (2 prose paras) + 4 H2s in outline order,
2 `<Margin>`s ("The four verdicts", "The breakers"), exactly 1
`<PullQuote>` ("Approved means verified, not plausible."), exactly one
external link (`[sagan.run ↗](https://sagan.run)`, house pattern), no
byline. Frontmatter single-quoted (`title` / `publishedAt: '2026-08-10'`
/ `summary`), curly quotes inside the summary so the single-quoted YAML
never needs escaping (matches both existing notes). Estimated ~845 body
words (~890 counting margin/pull-quote text) — inside the 700–950 band,
between the two reference notes in density.

**Key choices:**
- Cold open is honestly hypothetical per the gate decision: "If you've
  run a coding agent… you've gotten the message" — a shared-experience
  frame, no invented incident, no fabricated numbers.
- The PullQuote carries the thesis line ("verified, not plausible")
  rather than a decorative phrase — it's the sentence a skimmer must
  take away.
- Verdicts appear twice deliberately: terse definitions in a Margin
  (scannable), the NEEDS_EVIDENCE story in body prose (the "reading is
  not judging" beat from the thesis v3.3).
- Named bench listed as names only (Dieter, Dijkstra, Hamilton, Strunk)
  — no specialties attached, because the sources give me the names but
  not their domains. **Flagged, not invented**; if Randy wants "Dieter
  on design, Strunk on copy" etc., that's a one-line human addition.
- Dogfood close uses only what `.sagan/` in this repo actually shows:
  AC confirmed pre-draft, builder/critic/verifier/gate, tickets +
  `events.jsonl` committed, evidence bound to a SHA, one directory to
  add/delete (thesis v3.4 distribution story).

**Facts needed / nuance flagged (never invented):**
- "The caps live in the runtime, not in a model's memory" states the
  *standard's* design (sagan.run "Limits are circuit breakers" + thesis
  enforced tier). This repo's live `sagan.yaml` honestly says
  `enforced: []` at v0 (PM-interpreted). The note describes the method,
  not this repo's enforcement status — if the critic reads that as
  overclaiming, the softening is one clause ("the standard puts the
  caps in the runtime"); I chose the direct form because the sentence
  describes the method's rule, matching the outline's own wording.
- Bench specialties (above).

**Omission report (what was cut and what it buys):** drafted long
(~1,050), cut ~200: a second hypothetical failure vignette in the cold
open (one is enough to earn the thesis; two is throat-clearing); a
paragraph on lanes/pointer context packs (true but off-outline — this
is an intro, not the spec); "in effect" survived in the
strategy-may-be-wrong line because the flag's literal reason string is
`strategy-may-be-wrong` and the hedge marks the paraphrase honestly;
"occasionally even true" kept — it's the wry concession that stops the
open reading as agent-bashing.

**Voice notes:** matched to `building-conan.mdx` / `figma-to-paper.mdx`
— first person, short declaratives with one long build sentence per
para, italics for the interior voice, bold for the four station names
(mirrors figma-to-paper's bolded key terms), sentence-case H2s. Per
DESIGN.md §Voice: no hype adjectives; every claim is a checkable
specific (verdict names, 5/3 caps, 3–5 vs 10–40 rounds, SHA-bound
evidence).

Not render-checked (verify's job). Not marked done — awaiting critic.

## QA

(verify appends the evidence summary here — per-AC PASS/FAIL with the
command or observation that decided it, bound to `evidence_sha`.)

### QA — verify-hamilton-r1, round 1

**Target:** SHA `6aacafeb60704185c239756e6225e506cba6e021` + uncommitted
working tree — the artifact is untracked at this SHA (`git status
--porcelain` → `?? app/notes/posts/the-sagan-method.mdx`). Evidence binds
to SHA + that stated delta. Rendered from `pnpm build` output served by
`pnpm start` on :3000 (port confirmed free before, server stopped after).

| AC | Verdict | Decided by |
|----|---------|-----------|
| 1 | PASS | File exists; frontmatter `title`/`publishedAt`/`summary`, single-quoted, keys identical to both reference notes. `pnpm build` prerenders `/notes/the-sagan-method`; HTTP 200; renders light+dark at 375/1280 with no MDX/runtime errors — the only console 404s are `/_vercel/insights/script.js` + `/_vercel/speed-insights/script.js`, identical on `building-conan`, localhost-expected. `/notes` index lists the entry (locator count 1; `notes-index-1280.png`). |
| 2 | PASS | Section-by-section attestation below — all five outline items present, in order, none dropped or padded. |
| 3 | NOT-EXECUTABLE | Routed to critic (factual floor). |
| 4 | PASS (mechanical) | Body words excl. frontmatter: **857** (band 700–950, awk/wc). H2s: **4** (`grep -c '^## '`). Prose cold-open before first H2: yes (2 paras). `<Margin>`: **2**. `<PullQuote>`: **1**. Density judgment beyond the counts → critic. |
| 5 | PASS (mechanical) | No byline in rendered capture (title + date only). Only external URL in the file is `https://sagan.run`, exactly once, in body, house pattern `[sagan.run ↗](https://sagan.run)`. Voice-match judgment → critic. |
| 6 | PASS | `pnpm exec tsc --noEmit` exit 0; `pnpm build` exit 0 (13/13 pages). |
| 7 | NOT-EXECUTABLE | Routed to critic (craft, on the gate captures). |

**Overall: PASS** (all executable checks green; 3/7/judgment clauses of
4–5 routed to critic, listed in `not_verified`).

**AC 2 attestation (outline bullet → evidence in the MDX):**
- Cold open → paras 1–2 before the first H2: "*Done. Tests passing…*
  stated with total confidence" (claims vs proof), "scrollback is not an
  audit trail", namesake in one line + the `[sagan.run ↗]` link. TRUE
- Four stations, one rule → H2 at line 11: opens on AC-before-dispatch
  ("It starts before any agent moves… a PM compiles it into acceptance
  criteria… I confirm them"), builder/critic/verifier/human ("The last
  station is me"), "It flags; it never fixes", "A verifier, never the
  builder", four verdicts named in one sentence + Margin, "verified, not
  plausible". TRUE
- Loops with circuit breakers → H2 at line 27: "three to five rounds",
  "ten to forty" only "as a choice I make on purpose", "caps live in the
  runtime, not in a model's memory", same finding failing three times →
  "your strategy may be wrong… not round six". TRUE
- Bring the agents you already have → H2 at line 37: role spec is "the
  contract", agent "just the binding", bench "Dieter, Dijkstra, Hamilton,
  Strunk — slotted into `.sagan/roles/` unchanged", "builder ≠ verifier
  is about identity, not job titles". TRUE
- You hold the gates → H2 at line 43: "isn't approving keystrokes",
  Needs-you queue "structured questions, each with a recommended
  default", mid-run escalations, promote gate "preview bundle", ledger in
  one line (tickets + `events.jsonl` committed, evidence binds to a git
  SHA), dogfood kicker "One directory to add. One to delete". TRUE

**Gate captures** (what the human should see at promote —
`.sagan/ledger/T-001/`): `note-1280-light.png`, `note-1280-dark.png`,
`note-375-light.png`, `note-375-dark.png`, `notes-index-1280.png`.
Working evidence (context only): `working-preloader-veil-midrun.png`
(why the first capture attempt was blank up top),
`working-reference-conan-375.png` (chrome-chip comparison).

**Measurements:** `document.scrollWidth` at 375 = **375** in both themes —
no horizontal overflow. Dark scheme verified via `localStorage.theme =
'dark'` (next-themes; `data-theme="dark"` confirmed on `<html>`).

**Adversarial pass (found, not fixed):**
- The intro preloader plays on notes routes too — `preloader.tsx`'s own
  comment says "Plays on every full page load"; there is no
  session-storage gate. The dispatch note expected notes routes to skip
  it. Not an artifact defect, but every cold hit on a note permalink pays
  the ~2.5s veil; captures here wait on `window.__introDone`.
- At 375, the floating grid/lite chrome chips overlap the PullQuote
  region — pre-existing site chrome, pixel-identical on `building-conan`
  (see working capture). Not this ticket's defect; flagged for the house.
- Sitemap + RSS both include the note (`curl` grep: 1 hit each).
- Build-note discrepancy (cosmetic): the Copy block claims "curly quotes
  inside the summary"; the summary actually uses straight double quotes
  around "done". YAML is valid either way; no AC touches it.

**The missing test:** nothing pins the frontmatter contract for
`app/notes/posts/*.mdx` (three keys, single-quoted, parseable date). A
malformed note fails only at `pnpm build` — or worse, renders with an
Invalid Date. A tiny frontmatter-validation unit test over the posts dir
(or the planned Velite migration) would catch it at the cheapest layer.

## Decisions

- 2026-08-10 — Ticket compiled by the PM from Randy's brief; outline drafted
  from sagan.run + the v3.4 design thesis. Open at the gate: (a) working
  title "The Sagan Method" — alternatives welcome; (b) slug
  `the-sagan-method`; (c) `publishedAt` left to promote time; (d) whether
  the cold-open uses a real incident (Randy to supply) or stays
  hypothetical (default: hypothetical, honestly framed).
- 2026-08-10 — Gate resolved (run-20260810-181514, all four decisions
  confirmed by Randy): title **"The Sagan Method"**, slug
  `the-sagan-method`, cold-open **hypothetical, honestly framed** (no
  fabricated specifics), `publishedAt: '2026-08-10'` — fixed date
  overrides the "left to promote time" default above.
- 2026-08-10 — **Promoted** at the per-ticket gate (run-20260810-181514).
  Round 1: critic-dijkstra-r1 APPROVED (envelope validated; one low
  `(taste)` finding — pre-existing 375px chrome-chip overlap, out of
  scope, shared with building-conan). Verify overall PASS at
  `6aacafeb607` (gates exit 0, renders clean 375/1280 light+dark, no
  overflow). Preview bundle shown: five gate captures opened + live
  serve (`pnpm start`, :3000, stopped after the decision). Decision by
  Randy: promote + commit. builder_id copy-strunk-r1 stamped; status →
  Done. Carried forward, not blocking: frontmatter-contract test for
  `app/notes/posts/*.mdx` (verify's "missing test"); the chrome-chip
  overlap as a house fix candidate.

<!-- sagan:repo-owned:end -->
