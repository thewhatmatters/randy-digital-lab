---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-009
title: Morph geometry — one owner for the constants and selectors the tile→modal morph rides on
status: Backlog
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
builder_id:
verifier_id:
evidence_sha:
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
4. **Zero visual change:** sass-diff equivalence for every touched
   module (order-only), the standing `<main>` byte-compare set
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

## QA

(verify appends the evidence summary here, bound to `evidence_sha`.)

## Decisions

- 2026-08-11 — Sprint-planned with T-008 (two-ticket slice confirmed by
  Randy); builds run in order T-008 → T-009, one at a time. Mechanism
  for the cross-language geometry pin left to the builder within AC 2's
  "one source, test-pinned" constraint (the intro-gate script pin and
  the styles snapshot are the two house idioms to draw from).

<!-- sagan:repo-owned:end -->
