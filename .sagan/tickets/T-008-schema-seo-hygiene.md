---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-008
title: Schema + SEO/feed hygiene — delete the dead, own the origin, escape the feed
status: Done
priority: Low
assignee:
labels: [refactor, seo, hygiene]
parent:
url:
linear_updated_at:
# ── mirror-script-owned (stamped by sagan-plan, never by hand) ──────────────
fetched_at:
mirror_version: 1
# ── repo-owned (carried across every fetch; set by the run, not the tracker) ─
builder_id: frontend-hopper-r1
verifier_id: verify-hamilton-r1
evidence_sha: d5ee1695938556431b4e51c0acef2162a8339712
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

Close review candidates #6 and #7 plus the parser strays. The notes
schema documents a right rail that was never built (stack, ctaLabel,
authors, aiDegree — twenty lines of authoring instructions for renderers
that don't exist, with tests pinning parse shapes nothing consumes);
PullQuote silently drops a `from` prop that shipped content passes. The
SEO cluster: the OG route still says "Next.js Portfolio Starter" and
ignores the site's tokens, notes JSON-LD emits a relative image URL
(work gets it right — the duplicated generateMetadata diverged), RSS
interpolates titles unescaped, and baseUrl — the canonical origin —
lives in the sitemap generator. The parser has two known warts from
T-006's verify: 2026-02-30 rolls to a valid date, and an unanchored
fence regex misdiagnoses fence-less files.

Decisions per the gate round in this ticket's Decisions block. The
change is contract/metadata only except where a decision explicitly
allows a visible delta (OG images; PullQuote attribution if chosen) —
everything else stays byte-identical.

Done means: the notes schema equals what renders, PullQuote's `from` is
resolved per the gate (never silently dropped), one site module owns
baseUrl + shared page metadata, the feed is escaped and valid with the
gate-decided item set, the OG route speaks this site's language, the
two parser warts are fixed with tests, and the byte-compare set proves
nothing else moved. If any piece can't be done inside its decision,
stop and tell me which and why.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->
## AC

1. **Schema equals render (per gate decision a):** the unrendered notes
   fields and their tests are resolved as decided — deletion removes
   the fields from `app/notes/utils.ts`, their authoring docs, and the
   `tests/mdx.test.ts` families pinning them (dated replacement note in
   the test file); implementation would instead render them. Optional
   pair-lists that remain typed `MetaItem[]` get the T-006 `BlockItem`
   union honestly (the typing leak closes either way).
2. **PullQuote `from` (per gate decision b):** rendered or removed —
   the silent drop is gone; shipped content (`building-conan.mdx`) is
   consistent with the outcome.
3. **One site module:** `lib/site.ts` (or equivalent) owns `baseUrl`
   and a shared `pageMetadata()` helper; `sitemap.ts`, `robots.ts`,
   `rss/route.ts`, `layout.tsx`, and both `[slug]/page.tsx` consume it;
   the notes JSON-LD relative-image bug dies with the unification
   (absolute URLs everywhere, grep-verified).
4. **Feed hygiene:** RSS output XML-escapes every interpolated field
   (`&` in a title can no longer break the feed), carries `<guid>` per
   item and `<lastBuildDate>`, and includes the item set per gate
   decision c. Feed validates (verify runs it through a validator or
   asserts well-formedness + escaping on a hostile-title fixture).
5. **OG route:** the starter title/branding is gone; the template
   renders this site's name and uses its color values (static hex
   mirroring the tokens is acceptable — ImageResponse can't read CSS);
   `md:` classes inside the fixed-size image are removed. OG images
   changing appearance is the expected, allowed delta.
6. **Parser warts:** `publishedAt` validation rejects
   calendar-impossible dates (2026-02-30 → named error, test + mutation
   proof); the frontmatter fence regex anchors to file start
   (fence-less files with mid-file `---` breaks now diagnose as
   "no frontmatter", not "missing field") — behavior-preserving for all
   real content, test-pinned.
7. **formatDate subtraction:** the relative branch (`includeRelative`)
   is deleted — zero callers pass `true` (grep-proven at T-006); the
   function collapses; its tests update deliberately.
8. **Gates + byte-compare:** tsc, `pnpm build`, `pnpm test` exit 0;
   verify byte-compares the standing `<main>` set — identical except
   deltas explicitly allowed by gate decisions; RSS byte-diff shows
   only the escaping/guid/item-set changes.

## Method

- **items:** (1) schema + tests resolution (AC 1), (2) PullQuote (AC 2),
  (3) lib/site.ts + consumers (AC 3), (4) feed (AC 4), (5) OG (AC 5),
  (6) parser warts (AC 6), (7) formatDate subtraction (AC 7) — built
  and checked individually.
- **lane:** correctness — round cap 5.
- **builder:** frontend role, hopper-shaped (schema/seams work).
- **round-1 evidence:** gate runs, byte-compare set with the allowed
  deltas attested hunk-by-hunk, a hostile-title RSS fixture
  demonstration, an OG image render before/after, mutation transcripts
  for new test families.
- **sources (pointers, not paraphrase):** `app/notes/utils.ts` +
  `tests/mdx.test.ts` (dead fields + pins) · `app/components/margin.tsx`
  + `app/notes/posts/building-conan.mdx` (PullQuote) · `app/sitemap.ts`
  `app/robots.ts` `app/rss/route.ts` `app/og/route.tsx` + both
  `[slug]/page.tsx` (the cluster) · `lib/mdx.ts` + `lib/dates.ts`
  (warts + subtraction) · `.sagan/MEMORY.md` (carry-forward list this
  closes).

## Frontend

(builder appends its build note here; builders never verify their own work.)

### Build note — frontend-hopper-r1, round 1 (2026-08-11)

Persona note: staffed as hopper (schema/seams), per the Method's
"hopper-shaped" call — the role spec's Dieter default was overridden by
dispatch; role-spec boundaries (no self-verify, no render checks) followed
as written.

All seven Method items built and checked individually. Gates:
`pnpm exec tsc --noEmit` → exit 0; `pnpm test` → exit 0 (94 tests, was 79:
+12 rss, +6 parser, −2 formatDate, −1 notes-shape pin folded into a rekeyed
parser pin). `pnpm build` and all render/byte-compare verification left to
verify per the dispatch (build deliberately not run here).

**AC 1 — schema equals render (DELETE per gate a).** `app/notes/utils.ts`:
stack/ctaLabel/ctaHref/authors/aiDegree + their 20 lines of authoring docs
deleted; Metadata is now title/publishedAt/summary/image? — exactly what
renders. Dated replacement note in `tests/mdx.test.ts` (T-006 precedent);
the unicode-label and first-": "-split parser pins survive REKEYED to the
work `meta` shape (parser contract unchanged, schema pin gone); the notes
fixture + pipeline test dropped the dead fields. Typing leak closed:
`WorkMetadata.meta` is now honestly `BlockItem[]` (optional ⇒ outside the
validation floor ⇒ bare items really can be strings) and
`work-detail.tsx` narrows to pairs — filter is a no-op for all shipped
content.

**AC 2 — PullQuote `from` (RENDER per gate b).** `margin.tsx` renders it as
a `<footer>` under the quote; new `.pullquoteFrom` in `margin.module.scss`
in the house caption register (0.8125rem, `--muted`, 0.5rem gap — the
figureCaption recipe), resetting the pullquote's inherited 1.25rem.
`building-conan.mdx` NOT touched — its existing `from="— the brief, to
myself"` now renders (the author supplies the dash). This is one of the two
allowed visible deltas.

**AC 3 — one site module.** New `lib/site.ts` owns `baseUrl`, `siteName`,
`pageMetadata()` (the shared generateMetadata shape both [slug] routes now
call — the diverged copies deleted), and `ogImageUrl()` (absolute always).
`sitemap.ts`, `robots.ts`, `layout.tsx`, `lib/rss.ts`, both [slug] pages
consume it; zero `from 'app/sitemap'` importers remain (grep-verified).
The notes JSON-LD relative `/og?…` image is dead — NOTE FOR VERIFY: this is
a byte delta inside notes pages' `<main>` (the ld+json script gains the
`https://randy.digital` prefix on `image`), explicitly licensed by AC 3
("absolute URLs everywhere") though it is not one of the two *visible*
deltas.

**AC 4 — feed hygiene (NOTES ONLY per gate c).** Feed composition moved to
pure `lib/rss.ts` (`escapeXml` + `renderFeed`) so hygiene is unit-testable;
`app/rss/route.ts` is a thin shell. Escape approach: five-entity
replacement (`&` FIRST, then `< > " '`), applied to every interpolated
field including link/guid URLs; `<guid>` = permalink per item;
`<lastBuildDate>` (render time = build time; the route stays static).
pubDate arithmetic deliberately untouched (raw `new Date().toUTCString()`)
so the RSS byte-diff shows ONLY escaping/guid/lastBuildDate. 11-test suite
in `tests/rss.test.ts` incl. the hostile-title fixture (`Fish & Chips
<b>…</b>`, a `</description>` injection, tag-multiset balance).

**AC 5 — OG route.** Starter title/branding gone; card is `siteName` + an
accent tick + the title, colors as static hex each commented with the token
it mirrors (dark palette: `#0a0a0a`/`#ededed`/`#a3a3a3`/`#ff6369` =
`--bg`/`--fg`/`--muted`/`--accent`); `tw`/`md:` classes replaced with plain
style objects (fixed 1200×630 raster has no viewport). The second allowed
visible delta. Not render-checked here per role spec — verify should do the
before/after render.

**AC 6 — parser warts.** Fence regex anchored (`/^---…/`) — fence-less
files with mid-file `---` breaks now diagnose "no frontmatter"; 3 new pins
incl. body-thematic-breaks-after-real-frontmatter (behavior-preserving for
real content). Calendar validity: the 'date' rule now round-trips Y/M/D
after parsing (2026-02-30 and non-leap 2026-02-29 → named
"calendar-impossible" ContentFileError; real leap day 2028-02-29 accepted
via fixture as the overreach control). Scoped to values without an explicit
zone designator — Z/offset values are outside the local-midnight contract
and their local Y/M/D legitimately differs. Mutation proofs (4 families,
apply→scoped-run→transcript→restore-from-pristine+diff, all surgical
kills): `.sagan/ledger/T-008/qabuild/mutation-family-{5-fence-anchor,
6-calendar-validity,7-rss-escaping,8-rss-anatomy}.md`.

**AC 7 — formatDate subtraction.** Zero `true` callers re-grep-proven; the
relative branch deleted, function collapsed to a 5-line absolute formatter;
`posts.tsx`'s explicit `, false` argument dropped (output identical); the
two includeRelative pins deleted with a dated REPLACED note in
`tests/dates.test.ts`.

**Ambiguities flagged (none blocking):**
- `pubDate` still reads date-only strings as UTC (`new Date` raw) while the
  site reads them as local elsewhere — left byte-identical on purpose (AC 8
  wants the RSS diff to show only escaping/guid changes). A one-line
  carry-forward if the date-agreement rule should ever reach the feed.
- `dev-overlay.tsx` hardcodes three `https://randy.digital/notes` doc URLs
  (lab demo data, not origin usage) — left alone as out of scope.
- The calendar check's zone-designator scoping is a judgment call the AC
  didn't specify; documented in lib/mdx.ts.

**Proposed subtraction (per persona, for the PM — not applied):**
`lib/site.ts#ogImageUrl`'s `image` parameter is exercised by ZERO shipped
content (no note declares `image:` frontmatter) — notes' `Metadata.image?`
and the parameter could both be deleted, collapsing ogImageUrl to
`ogCard(title)` and removing the last speculative field in the notes
schema. Same disease AC 1 just cured, one stage earlier.

## QA

(verify appends the evidence summary here, bound to `evidence_sha`.)

### QA — verify-hamilton-r1, round 1

Bound to `d5ee1695938556431b4e51c0acef2162a8339712` (uncommitted worktree —
19 modified + 4 new source/test files per `git status`; baseline = HEAD
worktree build). Overall: **PASS**, all 8 AC + gates + independent mutation.

| Check | Verdict | Decided by |
|---|---|---|
| Gates | PASS | tsc exit 0 · `pnpm test` exit 0 (**94/94**, matches builder's count) · `pnpm build` exit 0 (16/16 pages) |
| AC 1 dead fields | PASS | grep stack/ctaLabel/ctaHref/authors/aiDegree in app/+lib/ → only deletion-note comments (lab's unrelated `stack` aside); `Metadata` = title/publishedAt/summary/image?; dated note at tests/mdx.test.ts:379; `meta?: BlockItem[]` + work-detail narrowing confirmed |
| AC 2 PullQuote from | PASS | :3010 live render, 1440px light (`data-theme` readback): building-conan shows one `<footer>` "— the brief, to myself" (13px, muted); the-sagan-method + figma-to-paper: zero footers — conditional render, no empty element |
| AC 3 one site module | PASS | `from 'app/sitemap'` importers → 0; both [slug] routes call `pageMetadata` from lib/site; all 3 notes' JSON-LD `image` = `https://randy.digital/og?...` (curl-asserted); sitemap 10 URLs + robots point at the origin |
| AC 4 feed hygiene | PASS | tests/rss.test.ts 11/11; independent register-trick probe fed `Fish & Chips <b>…` + a `</description></item>` injection through `renderFeed` → 9/9 assertions, python ET parses clean; live /rss: 3 items, `guid==link` each, `lastBuildDate` present, zero /work items |
| AC 5 OG route | PASS | `/og?title=Test` → 200 image/png 1200×630, visually confirmed (siteName + accent tick, dark-token hex); starter string 0 in source + response; HEAD source line 5 carried `'Next.js Portfolio Starter'` (before-attestation); no `md:` classes |
| AC 6 parser warts | PASS | own scratch fixtures through the REAL reader: 2026-02-30 and 2025-02-29 → `ContentFileError: calendar-impossible …` naming the file; 2024-02-29 control accepted; fence-less file with two mid-file `---` → "no frontmatter block found" |
| AC 7 formatDate | PASS | `includeRelative` → comments only; function collapsed to the absolute formatter; posts.tsx `, false` arg gone |
| AC 8 byte-compare | PASS | `<main>` cmp vs HEAD-worktree build: /notes, /work, /work/knav **IDENTICAL**; hunk inventory below — nothing outside the delta contract; RSS diff = +lastBuildDate, +3 `<guid>`, `&quot;` escaping in one description, item set + pubDates unchanged. `/rss` was ƒ (dynamic) at HEAD too — not a delta |
| Independent mutation | PASS (killed) | `escapeXml` `&` replacement moved LAST (double-escape corruption) → rss suite 8/11 (3 fail incl. hostile-title well-formedness); restored from pristine copy (file is untracked — git can't), diff clean, suite 94/94 |

**Attested hunk inventory (AC 8):**
- `building-conan` — 2 hunks: (1) ld+json `image` `/og?…` → `https://randy.digital/og?…` (AC-3-licensed, builder-flagged); (2) inserted `<footer class="…pullquoteFrom">— the brief, to myself</footer>` (allowed visible delta 2).
- `the-sagan-method`, `figma-to-paper` — 1 hunk each: ld+json `image` relative → absolute only (no `image:` frontmatter, so the /og fallback URL is the changed value — exactly as predicted).

**Gate captures** (the human should see these): `.sagan/ledger/T-008/gate-t8-pullquote-from-1440-light.png` · `.sagan/ledger/T-008/gate-t8-og-after.png`. Working evidence: `rss-before.xml` / `rss-after.xml` / `rss-before-after.diff` / `rss-hostile.xml` in the same dir; builder's 4 mutation transcripts present in `qabuild/`.

**Not executed:** OG *before*-image render (baseline worktree already removed; before-state attested from HEAD source instead) · external W3C feed validator (substituted xml.etree well-formedness + structural assertions).

**Incident (disclosed):** my cleanup `pkill -f "next-server"` was over-broad and killed the :3000 dev server (next dev runs a `next-server` process). Restarted with `pnpm dev`, / serves 200. PM should sanity-check the dev session; project memory recommends bouncing it post-round regardless. My :3010/:3011 servers are stopped; baseline worktree removed.

**The missing test (Hamilton's standing item):** nothing pins that `pageMetadata`/`ogImageUrl` output stays ABSOLUTE — the exact regression class AC 3 just fixed. A 5-line unit on `ogImageUrl` asserting the `https://` prefix (both branches) would make the relative-URL bug family unrepresentable; belongs in a future `tests/site.test.ts`.

## Decisions

- 2026-08-11 — Sprint-planned with T-009 (two-ticket slice confirmed by
  Randy). Open at the gate: (a) dead schema fields — delete vs
  implement; (b) PullQuote `from` — render vs remove (rendering adds a
  visible attribution line to a shipped note); (c) RSS item set —
  notes-only vs notes+work.

- 2026-08-11 — **Promoted** (round 1: verify all-8-PASS at `d5ee169`
  with an exhaustive hunk inventory — every site diff attested against
  the three licensed deltas; critic APPROVED, 7 low findings). Gate
  bundle: attribution render, OG card, RSS diff. Carried forward:
  zoned-date calendar subvariant (UTC round-trip closes it); feed
  pubDate outside the date-agreement rule; ogImageUrl image param —
  apply the subtraction or add the absoluteness pin (tests/site.test.ts);
  OG title clamping (latent past ~200 chars); rss test-name misattribution
  (cosmetic). QA pkill incident disclosed + handled. Status → Done.

<!-- sagan:repo-owned:end -->
