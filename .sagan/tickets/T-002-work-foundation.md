---
# ── tracker-owned (regenerated on every /sagan-plan fetch; edit in Linear) ──
id: T-002
title: Work foundation — /work index + [slug] case pages, MDX data layer, 3 placeholders
status: Done
priority: Medium
assignee:
labels: [frontend, work]
parent:
url:
linear_updated_at:
# ── mirror-script-owned (stamped by sagan-plan, never by hand) ──────────────
fetched_at:
mirror_version: 1
# ── repo-owned (carried across every fetch; set by the run, not the tracker) ─
builder_id: frontend-dieter-r1…r2.6
verifier_id: verify-hamilton-r2…r2g
evidence_sha: 62a9374d8a7991a85f51b466b65ac1c0354ac8d8
---

<!-- sagan:linear-owned:start — regenerated on every fetch; edit in Linear -->

Build the foundation for Work, where my portfolio items go. The /work page
is a thumbnail, title and brief description per project; clicking into one
shows more imagery and a short writeup including metadata like the site's
live address. Seed it with 3 placeholder projects so the layout is proven
before real content exists.

Content is MDX like our notes — same filesystem pipeline, no CMS, extended
frontmatter (thumbnail, liveUrl, meta rows). Reuse what the site already
has: the notes frontmatter parser, the right-rail meta/CTA pattern, the
Fig. NNN figcaption treatment, the grid and rise-in entrance language.
Placeholders must be honest placeholders — never fake case studies that
could be mistaken for shipped client work.

Done means: /work lists the three placeholders with thumbnails, each opens
a detail page with imagery, writeup, meta rows and a live-site CTA slot;
notes keep rendering identically after the parser refactor; the site's
gates pass and both routes hold the render floor. If any part can't be
built inside existing conventions, stop and tell me which and why.

<!-- sagan:linear-owned:end -->

<!-- sagan:repo-owned:start — agents write below; a fetch never touches this region -->
## AC

1. **Shared data layer:** the generic frontmatter parser + `getMDXData`
   move to `lib/mdx.ts`; `app/notes/utils.ts` consumes it with zero
   behavior change (both existing notes render byte-identically — verify
   diffs the rendered HTML body before/after); `app/work/utils.ts` exports
   `getWorkProjects()` with the work schema: `title`, `summary`,
   `publishedAt`, `thumbnail`, `liveUrl?`, `meta` rows (existing
   `label: value` block syntax), and **[amended, round 2]** `images` —
   an ordered list of image paths for the modal carousel (thumbnail may
   double as the first entry); every placeholder carries ≥2 images.
2. **[Amended — see Decisions, round 2.4] Three honest stand-in
   projects** (`knav`, `shift`, `perchhq`) at `app/work/projects/*.mdx`
   with imagery under `public/work/<slug>/` — Randy-supplied real
   imagery allowed; every stand-in is self-evidently a placeholder via
   its body ("This is not a real project…") and `Status: Placeholder`
   meta row. No invented client names, metrics, or testimonials; the
   orphaned `placeholder-project-0*` asset folders are removed.
3. **/work index:** each project renders as thumbnail (enforced aspect
   per gate decision) + title + one-line summary on the 12-column grid,
   Server Component, layout per gate decision; rows/cards use the shared
   `rise-in` entrance language (same ease/keyframe family as
   Notes/Experience) and honor `prefers-reduced-motion`; each links to
   its detail route. The "Coming soon" placeholder block is gone.
   **[Amended, rounds 2–2.6]:** no numbers next to project titles (the
   01/02/03 mono numbering and its number→accent hover cue are removed).
   Tile treatment per the round-2.6 Decisions entry: the **Services card
   language** — rounded bordered card (surface bg), the image inside its
   own keycap-inset media panel, title + muted one-liner below inside
   the card's padding; hover matches whatever the Services tiles do, so
   /work and Services read as one system. (Supersedes the r2.4
   traveling border and the r2 surface frame.)
4. **[Amended — see Decisions, round 2] /work/[slug] as morph-modal:**
   clicking a tile expands it into a centered modal over the dimmed
   index (App Store "Today" morph — the card becomes the modal, reverse
   morph on close), implemented with intercepting/parallel routes so
   `/work/[slug]` remains a real URL: direct visit/refresh/share renders
   the same content full-page. Modal anatomy: **image carousel** header
   (all `images` from frontmatter), then a white content section holding
   title, prose writeup, `meta` rows and the "Visit site ↗" CTA when
   `liveUrl` is set (absent → no dead button) — no empty band between
   header and content at any width (round-1 advisory resolved by
   construction). `generateStaticParams`; per-page `metadata`
   (title/description/OG via the existing og route); unknown slug → 404.
5. **`WorkFigure` component** (`src`, `alt`, `fig`, `caption`) rendering
   image + `Fig. NNN` figcaption in the same visual register as the
   note's SaganLoop caption (mono/uppercase prefix, muted, reading
   measure), via `next/image`; registered in the MDX map; used in at
   least one placeholder body.
6. **SEO wiring:** sitemap includes `/work` and all three project routes.
7. **Gates:** `pnpm exec tsc --noEmit` and `pnpm build` both exit 0.
8. **Render floor:** `/work` and one detail page at 375px and 1440px,
   light + dark: no horizontal overflow, no console errors beyond the
   known localhost `/_vercel/*` 404s.
9. **Craft, judged by the fresh critic on verify's captures:** (a) the
   index reads as one disciplined system — uniform thumbnail aspect,
   aligned type baselines, spacing on the grid; (b) placeholders are
   unmistakably placeholders at a glance; (c) the detail page's
   hierarchy is imagery-first with a scannable meta rail — a stranger
   finds the live-site link inside two seconds of looking.
10. **[Added, round 2] Morph + carousel behavior:** tile→modal is a
    shared-element morph (image grows from grid position, backdrop dims;
    reverse on close; Escape and backdrop-click close it; reduced
    motion → instant open/close, no morph). Carousel: prev/next arrows,
    position dots, arrow-key navigation, touch swipe — hand-rolled, no
    new dependencies; reduced-motion slides cut instantly; images keep
    16:10; carousel is the modal's only client island beyond the modal
    shell itself. Body scroll locks while the modal is open; focus is
    trapped and returns to the source tile on close.

## Method

- **items:** (1) parser extraction + work data layer (AC 1), (2)
  placeholder content + local imagery (AC 2), (3) index route (AC 3),
  (4) detail route + rail (AC 4), (5) WorkFigure (AC 5), (6) SEO +
  gates (AC 6–7) — built and checked individually.
- **lane:** quality — layout craft governs, round cap 3.
- **builder:** frontend role (this is UI + data plumbing, not copy;
  placeholder text is structural filler, exempt from the copy role's
  facts rule precisely because AC 2 forbids it looking real).
- **round-1 evidence:** captures of /work at 375/1440 in light + dark,
  one detail page at both widths, a reduced-motion load, the /notes
  regression check (AC 1), and both gate runs — shipped with the first
  build so critique never waits.
- **sources (pointers, not paraphrase):** `app/notes/utils.ts` (parser
  to extract) · `app/notes/[slug]/page.tsx` + `app/components/margin.*`
  (rail + measure pattern) · `app/components/posts.*` (index row
  language) · `app/components/sagan-loop.*` (figcaption register) ·
  `app/work/page.tsx` (placeholder to replace) · `DESIGN.md` +
  `app/global.css` (tokens/grid).

## Frontend

(builder appends its build note here — what was built, key choices,
anything the AC left ambiguous. Builders never render-check their own work.)

### Build note — frontend-dieter-r1, round 1 (2026-08-10)

**Per AC:**

1. Parser + `getMDXData` extracted verbatim to `lib/mdx.ts`, generic over
   the metadata type (`getMDXData<T>`); parsing logic is line-for-line the
   original, so notes output should be byte-identical (verify diffs).
   `app/notes/utils.ts` keeps only the notes schema + `formatDate`;
   `app/work/utils.ts` exports `getWorkProjects()` with
   `title/summary/publishedAt/thumbnail/liveUrl?/meta` (same
   `label: value` block syntax, parsed by the shared reader).
2. Three placeholders at `app/work/projects/placeholder-project-0{1,2,3}.mdx`.
   Imagery is script-drawn deterministic SVG (no network, no stock):
   `public/work/<slug>/{thumb,figure}.svg`, all 1200×750 (16:10), abstract
   line motifs in the site's engraving register with "PLACEHOLDER" and
   "NOT A REAL PROJECT" drawn into the artwork itself — illegibility of
   intent is impossible at a glance. No client names, metrics, or
   testimonials; each body says outright it isn't a real project.
   `liveUrl` points at `example.com` (IANA-reserved — honest) on 01/03;
   02 deliberately omits it to prove the no-dead-button path.
3. Index: 2-up card grid (`app/components/work-index.{tsx,module.scss}`),
   Server Component, newest-first, numbered `01/02/03` in the house mono
   register. Card columns split the 12-col track exactly in half with the
   page gutter, so card edges land on grid lines 1/7/13. Entrance mirrors
   `posts.module.scss` exactly: same `rise-in` keyframe, same ease, same
   `intro-armed`/`intro-revealed` gating, stagger by `--i`, reduced-motion
   renders in place. "Coming soon" block deleted.
   **Mid-run tile refinement applied** (Randy's reference-tiles.png):
   image-top + title/muted-one-liner text row; hover is a rounded
   `--surface` frame around the whole tile (light grey light / raised grey
   dark), implemented as constant padding + equal negative margin so the
   image edges stay on the grid lines at rest and the frame bleeds outward
   with zero layout shift; background-color transition only. Kept exactly
   one companion cue (mono number → accent, the notes-row vocabulary) and
   removed the title-nudge + hairline-sharpen so the hover doesn't shout.
4. Detail (`app/work/[slug]/page.tsx` + module): header, full-width 16:10
   hero (`next/image`, priority), writeup at the reading measure, rail in
   the notes geometry — measure cols 1–8, rail cols 9–13, col 8 gutter,
   same 64rem breakpoint as `margin.module.scss`. **Choice:** the rail is
   grid-placed rather than float-based — notes float marginalia because
   they anchor to inline prose positions; the work rail is page-level
   frontmatter, so grid placement is the truthful implementation of the
   same visual geometry (also avoids `.prose a` fighting the Button CSS).
   Rail renders `meta` rows as a `<dl>` (mono uppercase labels, hairline
   rows) + accent "Visit site ↗" Button only when `liveUrl` exists. On
   narrow viewports the rail sits between hero and writeup, so the live
   link is scannable immediately. `generateStaticParams`, per-page
   metadata (OG via `/og?title=` — SVG thumbnails are ignored by link
   unfurlers, so the raster og route is the right image), unknown slug →
   `notFound()`. JSON-LD as `CreativeWork`.
5. `WorkFigure` (`app/components/work-figure.{tsx,module.scss}`): src/alt/
   fig/caption via `next/image`; caption register copied from
   `sagan-loop.module.scss` (mono uppercase `Fig. NNN` prefix, muted,
   0.8125rem, reading-measure cap). Registered in the MDX map; used in all
   three placeholder bodies. SVG sources get `unoptimized` — the optimizer
   refuses SVG without `dangerouslyAllowSVG`, and vectors gain nothing
   from it; this avoided adding a `next.config` just for placeholders.
6. Sitemap now emits `/work` + all three project routes.
7. `pnpm exec tsc --noEmit` → exit 0 (only check run; role forbids more).
   `pnpm build` + render floor left to verify.

**Ambiguities flagged:**
- `formatDate` stays in `app/notes/utils.ts` (AC 1 names only the parser +
  `getMDXData` for extraction, and demands zero notes churn); the work
  detail imports it from there. If the coupling bothers anyone, next
  refactor moves it to `lib/` with a re-export.
- AC 4 "hero image" — no separate hero asset in the schema, so the detail
  hero reuses `thumbnail`. A future `hero` frontmatter field is a
  five-line change in `utils.ts` + `page.tsx`.
- OG uses the `/og?title=` route, not the SVG thumbnails (unfurler
  support) — flagging since AC 4 says "via the existing og route", which
  I read as endorsing exactly this.

**Proposed subtraction:** the index page's intro paragraph ("Selected
work — projects across design and engineering…") now duplicates what the
three cards say better with imagery. Cutting it lifts the grid one line
closer to the masthead and lets the work speak first — the reference
layout has no intro copy either. Left in place pending the gate.

### Build note — frontend-dieter-r2, round 2 (2026-08-10)

**Per amended AC:**

1. (`images` schema) `WorkMetadata.images: string[]` added in
   `app/work/utils.ts`. The shared parser stays byte-identical (AC 1's
   notes guarantee holds by construction — `lib/mdx.ts` untouched); its
   block-list rule reads a bare `- /path` item as `{label: path, value:
   ''}`, so the work layer normalizes `MetaItem[] → string[]` (rejoining
   any accidental `": "` split). Falls back to `[thumbnail]` if a project
   declares none. By convention `thumbnail` IS `images[0]` in all three
   placeholders, so the morph opens on the exact image that grew out of
   the grid.
2. (placeholders ≥2 images) 01 carries three images (proves arrows, dots,
   and a swipe with a real middle stop), 02 and 03 two each. Four new
   deterministic SVGs (`public/work/<slug>/carousel-0{2,3}.svg`, all
   1200×750, no randomness, no network): rose curve + halftone field
   (01), ruled baseline sheet (02), sampled-stem waveform (03) — same
   ground/hairline/marker register as round 1, with "PLACEHOLDER",
   "PROJECT NN — CAROUSEL VIEW 0N", and the red-dot "NOT A REAL PROJECT"
   drawn into every artwork. MDX body copy updated where it described
   the retired anatomy (02's rail paragraph, 01's "hero", 03's motion
   description) — placeholders must not lie about the layout they prove.
3. (no numbers) `01/02/03` spans and the number→accent hover rule
   deleted from `work-index.{tsx,module.scss}`; the card's internal grid
   collapsed to a plain stack (image, title, one-liner). Surface frame is
   the sole hover cue; the stale line-6 hover comment is rewritten
   (round-1 critic nit).
4. (morph-modal via intercepting/parallel routes) `app/work/layout.tsx`
   declares the `@modal` slot; `app/work/@modal/(.)[slug]/page.tsx`
   intercepts soft navs; `app/work/@modal/default.tsx` → null on hard
   loads; `app/work/default.tsx` re-exports the index so a soft nav
   into `/work/[slug]` from outside the section still dims a sensible
   page. Direct visit/refresh renders the reworked full page
   (`app/work/[slug]/page.tsx`): same components (carousel +
   `WorkDetailContent`), laid out as a centered 52rem sheet so both
   presentations read as one design. Modal anatomy: carousel header →
   content section (title/date, "Visit site ↗" only when `liveUrl` — 02
   still proves absence), prose, meta rows. The content section starts
   flush under the 16:10 header (padding only inside itself) — no empty
   band at any width, by construction, in both presentations.
   `generateStaticParams`/metadata/OG/404/JSON-LD carried over (JSON-LD
   `image` now lists all carousel images).
5. –9. untouched from round 1 (WorkFigure, sitemap, notes, index grid
   language). Gates: `pnpm exec tsc --noEmit` → exit 0 (after clearing
   stale `.next/dev/types` generated before the `@modal` slot existed —
   they regenerate on verify's build). `pnpm build` + render floor left
   to verify, per role.
10. (morph + carousel behavior) Open morph is hand-rolled WAAPI in
    `work-modal.tsx`: the panel starts transformed (uniform scale — tile
    and header are both 16:10) and clipped to header-only, so the scaled
    panel exactly covers the clicked tile's image, then grows to rest
    while the backdrop fades in and the content section fades in over
    the back half (f2's mid-state: image leading, white section growing
    out of it, backdrop dimming). Close calls `reverse()` on the same
    animations — interruptible mid-open — at 1.4× (exits deserve less
    ceremony), then `router.back()`. Transform/clip-path/opacity only.
    Escape + backdrop click close; Tab is trapped in the panel; focus
    starts on the close chip and returns to the source tile (which
    stayed mounted under the overlay). Scroll locks via `html` overflow
    + scrollbar-gutter compensation + a new `lenis:stop/start` window
    event pair in `smooth-scroll.tsx`; the panel is the scroller and
    carries `data-lenis-prevent`. Reduced motion: no animations are
    created at all — instant open/close — and the carousel transition is
    cut by media query. Carousel (`work-carousel.tsx`, no new deps):
    translated flex track, prev/next chips (disabled at ends), dot pill,
    document-level arrow keys (guarded against modifiers/editable
    targets), touch/pen swipe with drag-follow + end rubber-banding
    (mouse excluded — arrows serve it, drag would fight selection),
    `aria-live` position announcement, 16:10 enforced by aspect-ratio.
    Client islands in the detail: modal shell + carousel, nothing else.

**Key choices (effect-based):**
- Tiles use plain `next/link` with `scroll={false}`, not the
  view-transitions Link: the morph IS the transition, and the site-wide
  VT crossfade would fade/lift the index underneath the growing card.
  Deliberate, scoped deviation from the CLAUDE.md default — every other
  internal nav keeps the VT Link.
- Modal renders through a portal to `<body>` — the footer-reveal
  transforms `<main>`, which would re-anchor `position: fixed`.
- New `--scrim` token (light/dark) in `global.css` §6/§7 — flagging for
  `DESIGN.md` + the Paper canvas mirror (/design-token-drift will report
  it until mirrored).
- Modal z-index 90: above the command-bar chips (70 — chrome must not
  float over a modal), below the preloader veil (100).
- Panel width 52rem, not the reference-scale 60rem: the content
  section's 40rem measure nearly fills it; wider left a dead right
  column beside the prose.
- On close after internal scrolling, the panel scroll is parked at top
  before the reverse morph — the simultaneous content fade masks the
  jump, and the image the tile gets back is the one it gave.

**Ambiguities flagged:**
- AC 4's "full-page variant" is not further specified; I read "same
  content" as same anatomy (carousel + content section as a centered
  sheet), replacing round 1's hero + right-rail geometry so the round-1
  empty-band advisory can't survive anywhere. If Randy wants the
  approved rail back on the full page, it's a contained swap in
  `[slug]/page.tsx`.
- Arrow keys are document-level (not focus-scoped to the carousel):
  in the modal, focus starts on the close chip and focus-scoped keys
  would feel broken. On the full page this means arrows always drive
  the carousel — no other horizontal-scroll consumer exists there.
- Browser Back while the modal is open closes it instantly (no reverse
  morph) — history unwinds before any animation can run. Reads as the
  reduced path, not a defect; noted for verify.
- `formatDate` coupling (work importing from `app/notes/utils`) carries
  over from round 1, still flagged for a future `lib/` home.

**Proposed subtraction:** the carousel's position dots. Arrows + swipe +
arrow keys + the live-region announcement already cover every input, the
reference modal ships no dots, and removing the pill returns the image
bottom edge to the artwork. Kept because AC 10 names them explicitly —
but if the gate ever reopens carousel scope, they're the first thing I'd
cut.

#### Round 2.1 — ESC chip (frontend-dieter-r2.1)

Modal ✕ replaced by the command-bar keycap chip (ESC keycap + "close"
label): chip visuals extracted verbatim to `app/components/_chip.scss`
mixins, consumed by both `command-bar.module.scss` (byte-equivalent
output) and `work-modal.module.scss`; same real `<button>` in the same
sticky top-right lane, `aria-label="Close"`, focus-trap/Escape wiring
untouched; translucent surface + blur keep it legible over the artwork,
and the mixins' touch query makes it the ≥44px tap target on coarse
pointers. Second amendment: the writeup's `max-width: 40rem` deleted
from `work-detail.module.scss` — judgment call was deletion over a
`fullWidth` prop, since both presentations are the same 52rem sheet and
"type spans the section" can be one rule (modal ≈47rem inside card
padding, page 52rem inside grid margins). tsc exit 0; sass compile
checked; render left to verify.

#### Round 2.2 — chip consistency (frontend-dieter-r2.2)

Root cause of the "washed-out ESC pill" confirmed as geometry, not
color: verify's delta measured 0 computed-style diffs across all chip +
keycap props, and the 3× diag captures prove the size — `diag-esc-3x.png`
is 276×36 (element 92×12 CSS px) vs `diag-grid-3x.png` 231×102 (77×34).
`.closeWrap` is a `height: 0; display: flex` lane, and the flex default
`align-items: stretch` sized the button's cross axis to the zero-height
line: a 12px pill (10px block padding + 2px borders around a collapsed
content box) with the 22px keycap overflowing it. Fix: `align-items:
flex-start` on `.closeWrap` (`work-modal.module.scss`) so the chip keeps
natural height and hangs below the sticky lane — one declaration,
commented. `_chip.scss` untouched; no context variant added: at natural
height the modal chip is construction-identical to the command-bar chips,
whose translucent surface is *designed* to float over arbitrary content
(they're fixed-position over scrolled pages already) — light theme
composites ~#f6f6f6 surface + #e5e5e5 border + bordered white keycap
over the light artwork, dark theme a clearly-separated dark chip over
it. PM's translucency hypothesis rejected on that evidence. Coarse
≥44px target now actually renders (min-height was being stretched away);
semantics/aria, focus trap, Escape, themes, reduced-motion untouched.
Verify's two cascade nits acknowledged, no action: `font-family` on the
chip mixin (computed value unchanged) and cascade-safe @media reorders.
tsc exit 0 (TSC_CLEAN); both consumer modules sass-compile clean; render
left to verify.

#### Round 2.3 — border-only hover (frontend-dieter-r2.3)

Surface-fill hover removed per the ledgered decision; hover/:focus-visible
is now a border-color shift alone. Placement call: the border sits on the
**padded box** (the frame-era geometry, `padding: 1rem` around image +
text), not the image box — the thumb already carries its always-on
`--border` figure hairline, so a hover grey on that same edge would be
invisible; the outer box is the only place the token can register.
`border: 1px solid transparent` at rest → `var(--border)` on hover
(token resolves per theme — dark matched for free). Grid alignment held
by widening the negative margin to `calc(-1rem - 1px)`: block width
resolves as track − borders + margins, so without compensation the image
box shrinks 2px and the edges drift 1px off the grid lines; with it the
padding box — and the image edges — sit exactly on lines 1/7/13 at rest,
zero layout shift on hover. Transition is `border-color 0.18s` only,
declared inside `@media (prefers-reduced-motion: no-preference)` (reduce
gets an instant cut, not a missing state); hover-contract comments
rewritten in both files (they described the frame). Numbers, entrance
language, and `data-work-tile*` morph hooks untouched. No UA focus ring
is suppressed anywhere, so keyboard users keep the native ring on top of
the border parity — deliberate, since a 1px `#e5e5e5` line alone is a
weak focus indicator. tsc exit 0; module sass-compiles clean; render
left to verify.

#### Round 2.4 — single-border tile + perchhq (frontend-dieter-r2.4)

Tile rebuilt per the gated decision + the ledgered mid-round correction
(the border MOVES, it doesn't just recolor). Structure: ONE container —
image flush to the tile's top/side edges, description row inside below it
with 16px padding (`.body`); the thumb's own hairline and r2.3's outer
padded border are both gone. The single border is an overlay pseudo
(`.card::after`, `position: absolute`, `pointer-events: none` — paint,
not layout): at rest it wraps the IMAGE box; on hover/:focus-visible its
bottom edge travels down to enclose the whole tile, and the grey deepens
to the house hover-border step (`color-mix(in srgb, var(--fg) 24%,
var(--border))` — the Button/chip vocabulary, token-resolved dark);
unhover travels back. Mechanism: tile and image share side edges (image
is flush), so only `bottom` moves — the card is a `container-type:
inline-size` query container and the pseudo parks at `bottom: calc(100% -
62.5cqw)` (16:10 ⇒ image height = 62.5cqw), pure CSS, no JS, no magic
number beyond the aspect the AC already fixes. Transition is `bottom` +
`border-color` (0.18s, house ease) declared under `no-preference` only —
reduce gets an instant jump between the same two states. Engines without
container units drop the parked `bottom` and the border quietly wraps the
whole tile at rest (acceptable fallback). Judgment call flagged: the
correction says the border moves, the r2.4 gate text said it recolors — I
did both (travel + the color step), since travel alone in `--border` grey
is near-invisible over light imagery. Grid alignment: the overlay has no
layout box, so the flush image edges sit on lines 1/7/13 with NO margin
compensation — the r2.3 `calc(-1rem - 1px)` math is deleted, not
reworked. Morph geometry: `[data-work-tile-image]` still targets `.thumb`,
whose outer box (16:10) and declared `border-radius: var(--radius)` are
unchanged, so the modal's rect measurement and start-clip radius read are
untouched — no work-modal edit needed. Two cosmetic implications for the
critic: (a) the thumb rect no longer includes a 1px own-border, same
outer box as before; (b) at click time the tile is hovered, so its
expanded border around the description remains faintly visible under the
dimming backdrop while the panel grows out of the image region.
Content: `app/work/projects/perchhq.mdx` created mirroring knav/shift
(same honest stand-in body, `Status: Placeholder`, `publishedAt:
2026-08-10`, title PerchHQ, thumbnail `/work/perchhq/01.avif`, all six
supplied AVIFs in `images`); `liveUrl` omitted — nothing supplied
warrants one, and it restores the no-CTA proof that placeholder-02
carried (its body clause says so honestly instead of claiming a live
link). Noted for the PM, not changed: `shift.mdx` (Randy-supplied)
carries `liveUrl: https://knav.app` — looks like a copy-paste from knav.
Cleanup: `public/work/placeholder-project-0{1,2,3}/` deleted; grep finds
no remaining references outside the ledger. tsc exit 0; module
sass-compiles clean; render left to verify.

#### Round 2.5 — WorkFigure restored (frontend-dieter-r2.5)

AC 5 usage restored: one `<WorkFigure>` added to the perchhq body (the
r2.4 content swap had removed the component's last in-body usage) —
`src="/work/perchhq/02.avif"` (not the 01 thumbnail), `fig="001"`, alt +
caption kept in the stand-in register (caption says what the slot proves,
invents no project facts). Placed between the writeup and the closing
"gets replaced" line, where a figure lands in a real case. Explicit
`width={5586} height={4947}` passed — the supplied AVIF is ~1.13:1, and
the component's 16:10 default would have reserved the wrong box
(layout-shift on load). tsc exit 0; render left to verify.

#### Round 2.6 — Services-card tiles (frontend-dieter-r2.6)

/work tiles restyled to the Services card language per the round-2.6
pivot — same object, not a lookalike: the shared skin is extracted to
`app/components/_card.scss` as mixins (`card-shell`, `card-panel`,
`card-body`, `card-title`, `card-blurb` + `$ease`/`$wake-border`),
verbatim from services.module.scss following the `_chip.scss` precedent;
services.module.scss now consumes the mixins (compiled output diffed vs
HEAD — only declaration order shifts within rules, no overlapping
properties, computed styles identical) and stays the reference
implementation. Card anatomy in work-index.module.scss: keycap shell
(bg, 1px/2px-bottom border, 0.75rem radius, 0.25rem frame) → `.thumb`
as the inset media panel (surface bg + hairline, 0.5rem radius, media
variant: no padding, 16:10 enforced on the border box, image fills) →
`.body` on Services' inset + type metrics (title clamp 1.125–1.25rem /
600 / -0.015em; summary 0.875rem / 1.5 / muted / 52ch — supersedes the
old 0.9375rem summary). Hover/focus-visible is the Services wake
verbatim: panel hairline → `$wake-border`, title translateX(3px),
summary → fg; 0.18s house ease; transforms nulled under reduced motion
(color steps still land), same as Services. The r2.4 traveling-border
overlay is fully retired: `.card::after`, `container-type`, the
`62.5cqw` parked-bottom math, and their comments are deleted, TSX
comments rewritten. Geometry: no compensation math remains — the card
is the grid item, so its border-box edges land on lines 1/7/13 by
construction; the image now sits INSET by the card frame rather than on
the lines (that is the language). Grid gaps matched to the Services
bento (1rem mobile, `--grid-gutter` both axes desktop — supersedes the
3rem row gap; closed cards space like the bento; column geometry
untouched). Morph note for verify/critic: `[data-work-tile-image]`
still targets `.thumb`; the modal measures its live rect + computed
border-radius at open, so the morph adapts automatically — but the
modal now visibly grows out of the inset panel while the card shell
(border, bg, title) stays behind under the backdrop; thumb radius the
morph clip reads is now 0.5rem (was `--radius` 0.375rem), and the
thumb's border-box is exactly 16:10 while its 1px border makes the
inner image box ~2px off-ratio (sub-pixel scale mismatch, invisible).
tsc exit 0; both modules + partial sass-compile clean; NO render checks
run (role constraint) — render left to verify.

## QA

(verify appends the evidence summary here — per-AC PASS/FAIL with the
command or observation that decided it, bound to `evidence_sha`.)

### QA — verify-hamilton-r1, round 1

Bound to SHA `62a9374` (HEAD = pre-change baseline; all T-002 artifacts
uncommitted in the working tree at verification time — that is what makes
the AC 1 baseline diff possible). Build served on :3010 (stopped after);
every capture taken after `window.__introDone === true` with `data-theme`
readback confirmed.

| AC | Result | Deciding evidence |
|----|--------|-------------------|
| 1 | PASS | Baseline worktree at HEAD built; `<article>` of all **three** notes routes (the-sagan-method, building-conan, figma-to-paper) + notes index `<main>` byte-identical (`cmp`) vs working-tree build. `lib/mdx.ts` consumed by both utils; `getWorkProjects()` exports title/summary/publishedAt/thumbnail/liveUrl?/meta. |
| 2 | PASS | 3 MDX placeholders; 6 local SVGs all 1200×750 (16:10) under `public/work/<slug>/`; "PLACEHOLDER" + "NOT A REAL PROJECT" drawn into every thumb+figure and legible in captures; no external fetches; liveUrl `example.com` on 01/03, absent on 02. |
| 3 | PASS (mechanical) | 2-up Server-Component grid in captures; `rise-in` keyframe + `cubic-bezier(0.22,1,0.36,1)` + `prefers-reduced-motion` block in `work-index.module.scss`; reduced-motion load renders in place (computed opacity 1 / transform none); "Coming soon" grep = 0 matches. Grid-discipline judgment → critic. |
| 4 | PASS | Detail 01: hero, writeup, `<dl>` rail, "Visit site ↗" count = 1. Detail 02: rail with **zero** Visit-site nodes (no dead button). `/work/does-not-exist` → 404; `og:image` → `/og?title=` (route answers 200); JSON-LD `CreativeWork`. |
| 5 | PASS | `WorkFigure` registered (`mdx.tsx` lines 9, 113), used in all 3 bodies; rendered `FIG. 001` caption visible in both detail captures, mono/uppercase muted register. |
| 6 | PASS | `curl /sitemap.xml` lists `/work` + all 3 project routes. |
| 7 | PASS | `pnpm exec tsc --noEmit` exit 0; `pnpm build` exit 0 (16/16 pages; all 3 work routes prerendered). |
| 8 | PASS | 375+1440, light+dark: scrollWidth = innerWidth = 375 on /work and detail 01; only console errors are the known `/_vercel/insights` + `/_vercel/speed-insights` 404s (URLs attributed via response listener). |
| 9 | NOT-EXECUTABLE | Routed to critic — craft judgment on the gate captures. |

**Overall: PASS** (mechanical halves; AC 9 + AC 3 judgment await critic).

**Gate captures** (the ones Randy should see), all in `.sagan/ledger/T-002/`:
`gate-work-index-1440-light.png`, `gate-work-index-1440-dark.png`,
`gate-work-tile-hover-1440-light.png`, `gate-work-tile-hover-1440-dark.png`
(frame + accent-number hover on tile 01), `gate-work-detail01-1440-light.png`
(CTA present), `gate-work-detail02-1440-light.png` (no CTA),
`gate-work-index-375-light.png`, `gate-work-index-375-dark.png`,
`gate-work-detail01-375-light.png`,
`gate-work-index-1440-reduced-motion.png`. Working evidence (diff outputs,
curl transcripts) lives in the run transcript.

**Adversarial pass findings (report-only, none blocking):**
- Pre-existing house issue, not T-002: at 375 the floating grid/lite chips
  overlap content (card 02 thumb on the index; prose on the detail) — same
  chrome overlap MEMORY.md says to stop re-flagging per ticket.
- Adjacent routes healthy: `/`, `/notes`, `/notes/the-sagan-method`, `/rss`
  all answer (308 trailing-slash redirects are Next defaults).
- Self-containment: no external URLs in new code beyond the deliberate
  `example.com` liveUrl and the schema.org `@context` string (data, not a
  fetch).
- In the reduced-motion capture tile 01 shows its hover frame — the
  Playwright cursor was still parked over it from the prior step; cosmetic
  artifact of the capture, not a defect.
- The missing test: nothing pins the work frontmatter schema — a malformed
  `app/work/projects/*.mdx` (missing thumbnail, bad meta block) surfaces
  only at build or as a broken card. Same gap already logged for notes in
  MEMORY.md; one cheap unit test over `getWorkProjects()` would cover both
  once the parser is shared.

### QA — verify-hamilton-r2, round 2

Bound to SHA `62a9374` (HEAD unchanged since round 1; all T-002 artifacts
still uncommitted in the working tree — noted honestly). Build served on
:3010 (stopped after; the human's :3000 dev server untouched); every
capture taken after `window.__introDone === true`, themes pinned via
`localStorage.theme` with `data-theme` readback.

| AC (amended) | Result | Deciding evidence |
|----|--------|-------------------|
| 1 — `images` schema | PASS | `getWorkProjects()` **executed** (node type-stripping; only the `lib/mdx` import specifier inlined): 01→3 images, 02→2, 03→2, frontmatter order preserved, thumbnail first; all files exist under `public/work/<slug>/`. |
| 1 — notes regression | PASS | No committed round-1 snapshot exists, so "empty git diff vs round-1" is not executable — re-ran the **baseline HTML diff** instead (worktree at HEAD, built): `<article>` of all three notes routes + notes index `<main>` byte-identical vs the round-2 build. |
| 3 — numbering gone | PASS | DOM query: 0 leaf elements in any tile with text exactly `01/02/03`; grep of `work-index.{tsx,module.scss}` finds numbering only in the retirement comment (stale line-6 comment is rewritten, round-1 nit closed). Hover frame present both schemes: card bg transparent→`rgb(245,245,245)` light / →`rgb(23,23,23)` dark. |
| 4 — modal + real URL | PASS | Click tile 01 → dialog over dimmed index (index stays mounted beneath), `location` = `/work/placeholder-project-01`; Escape → `/work`. Same at 375 and in dark. |
| 4 — hard loads | PASS | Direct visit and reload-while-modal-open both render the full page (no dialog shell, carousel + content sheet + h1). Unknown slug → 404. Sitemap lists `/work` + all 3 routes. |
| 4 — CTA truth | PASS | 01 modal and full page: exactly **one** "Visit site". 02 modal and full page: **zero**. |
| 7 — gates | PASS | `pnpm exec tsc --noEmit` exit 0; `pnpm build` exit 0 — 16/16 pages, `/work/(.)[slug]` interception route + 3 SSG detail routes in the manifest. Types regenerated cleanly after the builder's stale `.next/dev/types` deletion. |
| 8 — render floor (r2 surfaces) | PASS | scrollWidth = innerWidth = 375 on /work and the full-page detail; console errors on index, modal-open, and full-page detail are only the known `/_vercel/*` 404s (URL-attributed via response listener). |
| 10 — morph | PASS | Mid-morph frame captured 167ms after click (panel image-led, content section still fading, backdrop mid-dim); `document.getAnimations()` = 9 during open. Reduced motion: **0 morph animations** (the single animation present was the tile's own hover background-color transition, attributed), dialog opens instantly. |
| 10 — close / focus / scroll lock | PASS | Escape closes and focus returns to the source tile (asserted `activeElement`); backdrop click closes; while open `html` overflow=hidden and wheel does not move `scrollY` (the panel scrolls internally instead — observed); both restored on close. Focus starts on the close chip; Tab trapped 8/8 presses + Shift+Tab. |
| 10 — carousel | PASS | Arrows advance/retreat with disabled ends; aria-live announces 1→2→3→2 of 3; dots track `aria-current`; ArrowRight/ArrowLeft work; CDP touch swipe → slide 2; reduced motion: track `transition-duration: 0s` (slides cut). |
| 9 — craft / morph fidelity | NOT-EXECUTABLE | Routed to critic — judgment on the gate-r2 captures vs `reference-modal-f2/f3`. |

**Overall: PASS** (mechanical halves; AC 9 + morph-fidelity judgment await
the critic).

**Gate captures** (what Randy should see), all `.sagan/ledger/T-002/`:
`gate-r2-work-index-1440-light.png`, `gate-r2-work-index-1440-dark.png`
(no numbering), `gate-r2-work-tile-hover-1440-{light,dark}.png`,
`gate-r2-modal-midmorph-1440-light.png` (the morph mid-flight),
`gate-r2-modal-open-1440-{light,dark}.png`,
`gate-r2-carousel-slide2-1440-light.png` (dot 2 active),
`gate-r2-modal-open-375-light.png`, `gate-r2-work-index-375-light.png`,
`gate-r2-detail01-fullpage-1440-light.png` (hard-load presentation),
`gate-r2-modal-open-1440-reduced-motion.png`. Working evidence (JSON
assertion dumps, curl transcripts, baseline diff) lives in the run
transcript.

**Adversarial pass findings (report-only, none blocking):**
- Focus trap holds in both directions (8 Tabs + Shift+Tab never leave the
  panel).
- Browser Back while the modal is open → `/work`, dialog gone, page
  healthy — matches the builder's "instant close" note; reads as the
  reduced path, not a defect.
- Escape 100ms into the open morph (interrupt) closes cleanly to `/work`
  with scroll unlocked — the `reverse()` path is genuinely interruptible.
- Touch swipe (CDP-emulated) advances slides; vertical-intent guard not
  exercised.
- Capture-hygiene trap found in my own tooling, not the site: the
  automate-browser persistent profile carries `localStorage.theme` across
  sessions — a dark run poisoned four later "-light" captures (all
  retaken with the theme pinned + `data-theme` readback; profile reset
  after). Functional assertions were theme-independent and stand.
- The missing test (unchanged, now three rounds standing): nothing pins
  the shared `lib/mdx.ts` frontmatter contract — one unit test would
  cover notes + work; the `images` MetaItem→string normalization in
  `app/work/utils.ts` is exactly the kind of quiet coupling it would pin.

#### QA delta — verify-hamilton-r2d (round 2.1)

Bound to SHA `62a9374` (HEAD unchanged; T-002 artifacts still uncommitted).
Build served on :3010 (stopped after; :3000 untouched — confirmed 200
after teardown); every capture after `window.__introDone === true`,
theme pinned per capture via `localStorage.theme` + `data-theme` readback.
Delta scope only — r2 evidence stands for everything untouched.

| Delta check | Result | Deciding evidence |
|----|--------|-------------------|
| Gates | PASS | `tsc --noEmit` exit 0; `pnpm build` exit 0 (16/16 pages, interception route + 3 SSG details in manifest). |
| Chip anatomy | PASS | `<button aria-label="Close">` with `<kbd>ESC</kbd>` + "close" label, sticky top-right of panel, 1440 light + dark + 375 light (all three captured). |
| Chip behavior | PASS | Click closes → `/work`, focus returns to source tile; Escape independently closes with same focus return; focus opens on the chip; 12-press Tab cycle stays in panel and includes the chip. |
| Chip ≥44px @ coarse | PASS | `has_touch` context (`matchMedia('(pointer: coarse)')` true — CDP media-feature emulation does NOT cover pointer/hover): min-height 44px applies, rect h = 44, tap closes. |
| Chip = same object | **FAIL** | Computed declarations identical (0 diffs over 17 chip + 11 keycap props) — but rendered geometry differs: `.closeWrap { height: 0; display: flex }` + default `align-items: stretch` collapses the button's content-box to 0, so the pill is **12px tall** at fine pointer (padding+border only) and the 22px ESC keycap overflows it; command-bar chips render ~32px with the keycap inside. Visible in the 3× crops. Corroborates the REVISE already dispatched to frontend-dieter-r2.2. Coarse pointer masks it (min-height clamps). |
| Command-bar byte-equivalence | **FAIL (claim), equivalent (behavior)** | `sass` compile of HEAD vs working `command-bar.module.scss`: NOT byte-identical — `.chip` gains `font-family: var(--font-mono)` (previously inherited from `.bar`; computed output unchanged) and two `@media` blocks reordered (no shared properties → cascade-safe). In-browser computed styles equal; grid toggle works (`data-active` false→true→false, overlay renders). |
| Full-width type | PASS | Modal: paragraph 750px = section inner 750 (52rem panel; `max-width: none`, 40rem cap gone). Full page: paragraph 832 = sheet 832. scrollWidth = 375 on modal-open and full-page detail at 375. |
| Ticket QA intact | PASS | `## QA` heading + both prior summaries (r1, r2) present and uncorrupted (read-only structure check). |

**Overall: FAIL** — one criterion (chip rendered geometry ≠ command-bar
chips); every behavioral AC passes. The defect is already Randy-flagged
(ledgered REVISE → frontend-dieter-r2.2); this pass pins the root cause
for the fix: give `.closeWrap` `align-items: flex-start` (or a non-zero
lane) so the chip takes its natural height.

**Gate captures** (`.sagan/ledger/T-002/`):
`gate-r21-modal-open-1440-light.png`, `gate-r21-modal-open-1440-dark.png`,
`gate-r21-modal-open-375-light.png`, `gate-r21-modal-content-1440-light.png`,
`gate-r21-detail-fullpage-1440-light.png`,
`gate-r21-command-chips-1440-light.png`. Working evidence (sass diff,
JSON assertion dumps, 3× crops) in the run transcript/scratchpad.

**Adversarial notes:** second open after chip-close works (reused for the
Escape re-assert); the squash is invisible on touch devices and at a
squint on 375 — it would have shipped past a coarse-only check; the
byte-equivalence claim was falsifiable in one `sass | cmp` and should be
phrased "computed-equivalent" in future build notes.

#### QA final — verify-hamilton-r2e (round 2.2)

Bound to sha `62a9374` (still uncommitted) + build `BUILD_ID` 21:13:03,
served on :3010 (stopped after; :3000 confirmed 200 before and after).
Every measurement after `window.__introDone === true`, theme pinned per
capture (`localStorage.theme` + `data-theme` readback), fresh
non-persistent contexts. Delta scope: the r2.1 FAIL only — `.closeWrap`
`align-items: flex-start` fix (work-modal.module.scss:63).

| Final check | Result | Deciding evidence |
|----|--------|-------------------|
| Gates | PASS | `tsc --noEmit` exit 0; `pnpm build` exit 0 — but manifest is now **17 pages** (a 4th route `/work/knav`; see moving-target note). |
| Chip geometry fixed | **PASS** | Modal Close pill **91.6 × 34.0 px** at fine pointer, light AND dark (was 12 px); ESC keycap 22 px tall, fully inside the pill both themes. |
| Chip = footer chip | **PASS** | Footer `G grid` chip on /work: pill **h = 34.0**, keycap 22×22 inside. Modal chip: **h = 34.0**, keycap h = 22 inside. r2.1's 0-diff computed styles now come with equal pixels — same object, closed. |
| Chip ≥44px @ coarse | PASS | `has_touch` context, `matchMedia('(pointer: coarse)')` true: `min-height: 44px` computed, rect h = 44.0, keycap 28 px inside; tap closes → `/work`. |
| Focus trap + Escape | PASS | Focus opens on the chip; 8 Tabs + Shift+Tab all stay inside the dialog; Escape closes → `/work`, focus returns to the source tile. |

**Overall: PASS** — the single r2.1 failing criterion is fixed and
re-proven; all quick re-asserts hold.

**Gate captures** (`.sagan/ledger/T-002/`, visually confirmed):
`gate-r22-modal-open-1440-light.png`, `gate-r22-modal-open-1440-dark.png`,
`gate-r22-chip-close-3x.png` (full-height pill, keycap inside),
`gate-r22-chips-footer-3x.png` (footer chip for side-by-side).

**Moving target — PM attention required:** the working tree mutated
*during* this verify. `app/work/projects/` placeholders 01–03 were
deleted between 21:14:43 and 21:15:57 and replaced by `knav.mdx` +
`shift.mdx` (real-sounding names; `public/work/` now also holds
`knav/`, `shift/`, `perchhq/`). Because the interception route is
dynamic (reads MDX from disk per request), placeholder modals now 404
on client nav against my build while the SSG full pages still serve
the build snapshot — this is what killed my first measurement run
mid-flight. The four gate captures (21:14:50–21:15:02) predate the
deletion and show the placeholder-01 modal on the fixed build — valid;
rect numbers were re-measured against `/work/knav` (chip geometry is
content-independent). But AC 2/3's three-placeholder universe no
longer exists on disk: any subsequent full-ticket judgment (critic)
is judging a state that has already been overwritten. Not a defect in
the fix; a run-hygiene fact the PM must resolve before promote.

#### QA final-state — verify-hamilton-r2f (round 2.4)

Bound to sha `62a9374` (T-002 artifacts still uncommitted) + build
`BUILD_ID sfazCY71aPh8ZwtxzZ_QKA` (21:31:49); all touched source mtimes
(21:14–21:28) predate the build and were re-stat'd unchanged after
teardown — no moving target this pass. Served on :3010 (stopped after;
:3000 confirmed 200 before and after). Fresh non-persistent contexts,
theme pinned per capture (`localStorage.theme` + `data-theme` readback),
every capture after `window.__introDone === true`, mouse parked at 0,0
for rest states. This is the FINAL evidence pass for the critic — the
notes-regression diff and the full carousel/focus/morph suite were NOT
redone per brief (r2/r2.2 evidence stands; `lib/mdx.ts`, `work-modal`,
`work-carousel` untouched since).

| Check | Result | Deciding evidence |
|----|--------|-------------------|
| Gates + manifest + sitemap (AC 6/7) | PASS | `tsc --noEmit` exit 0; `pnpm build` exit 0 — 16/16 pages; manifest: static `/work`, dynamic `/work/(.)[slug]`, SSG `/work/{knav,perchhq,shift}`; sitemap lists `/work` + all three. |
| AC 2 — honest stand-ins | PASS | knav/shift/perchhq MDX on disk; every body contains "This is not a real project"; every meta carries `Status: Placeholder`; all 12 frontmatter image paths exist as AVIFs under `public/work/<slug>/` (4/2/6); `placeholder-project-0*` folders gone, zero references in app/lib/public. **Flag (report-only):** `shift.mdx` `liveUrl: https://knav.app` — renders as Shift's "Visit site" target; reads as a copy-paste from knav. perchhq renders **zero** Visit-site nodes (no-dead-button proof restored). |
| AC 3 — traveling border | PASS | `getComputedStyle(card,'::after')`: rest `bottom` = 103.5px → pseudo bottom edge **659.5 = image bottom exactly** (tile bottom 763); hover AND keyboard `:focus-visible` (`matches(':focus-visible')` true) `bottom` = **0px = tile bottom**, border-color `rgb(229,229,229)` → the `color-mix` step (srgb .698); **mid-hover 3.7px at 90ms proves the border travels**, not jumps; dark token-resolved (`rgb(38,38,38)` → srgb .336); reduced-motion context: `transition-duration: 0s` and `bottom` = 0px immediately on hover — instant jump between the same two states. |
| AC 8 — render floor (final state) | PASS | scrollWidth = innerWidth on `/work` and hard-loaded `/work/knav` at 375 + 1440, light + dark, plus modal-open at 1440; every console error on every page is exactly the known `/_vercel/insights` + `/_vercel/speed-insights` 404 pair (URL-attributed via response listener); hard loads render the full page (no dialog, `h1` present). |
| Modal spot-check on real content (knav) | PASS | Click knav tile → `role="dialog"` at `/work/knav`; carousel imgs = 4 and dots = 4 (matches frontmatter); ESC chip present (`kbd` ESC + "close") at **91.6 × 34.0 px**; focus opens on the chip; Escape → `/work`, dialog gone, focus returned to the source tile. CTA truth on served pages: knav + shift render "Visit site", perchhq zero; unknown slug → 404. |
| AC 9 — craft | NOT-EXECUTABLE | Routed to critic — judgment on the gate-r2f captures. |
| Adversarial — AC 5 usage clause | **FAIL (report-only, PM)** | `WorkFigure` still registered (`mdx.tsx:9,113`) but the round-2.4 content swap removed its last usage — no stand-in body uses it, so AC 5's "used in at least one placeholder body" no longer holds. The 2.4 decision amended AC 2 but never touched AC 5: amend AC 5 or add one `WorkFigure` to a stand-in body. |

**Overall: PASS on all briefed checks**; one standing AC regression
flagged for the PM (AC 5 usage clause, report-only).

**Gate captures** (`.sagan/ledger/T-002/`, all visually confirmed):
`gate-r2f-tiles-rest-1440-light.png` (border closes at image bottom),
`gate-r2f-tile-hover-1440-light.png` (border encloses title + summary),
`gate-r2f-tile-hover-1440-dark.png`, `gate-r2f-tile-focus-1440-light.png`
(expanded border + native UA ring, keyboard Tab), 
`gate-r2f-modal-knav-1440-light.png`, `gate-r2f-work-index-1440-dark.png`,
`gate-r2f-work-index-375-light.png`,
`gate-r2f-knav-fullpage-1440-{light,dark}.png`,
`gate-r2f-knav-fullpage-375-light.png`. Working evidence (JSON assertion
dumps, curl transcripts, build log) in the run scratchpad.

**Adversarial notes:** shift's CTA pointing at knav.app is the one
content lie left in an otherwise honest set — flagged, not fixed. The
missing test (four rounds standing): nothing pins the shared
`lib/mdx.ts` frontmatter contract; it would also have caught the
shift liveUrl copy-paste via a cheap uniqueness assertion.

#### QA delta — verify-hamilton-r2g (round 2.6)

Bound to sha `62a9374` (T-002 artifacts still uncommitted) + build
`BUILD_ID mKCQ6SgldLQHrJl-2Qegx`. Served on :3010 (stopped after,
verified down; :3000 confirmed 200 before and after). Fresh
non-persistent contexts, theme pinned per capture (`localStorage.theme`
+ `data-theme` readback), every capture after `window.__introDone ===
true`, mouse parked 0,0 for rest states. Delta scope: the round-2.6
Services-card tile restyle + the `_card.scss` refactor; r2/r2.2/r2f
evidence stands for everything untouched.

| Delta check | Result | Deciding evidence |
|----|--------|-------------------|
| Gates | PASS | `tsc --noEmit` exit 0; `pnpm build` exit 0 — 16/16 pages; manifest: static `/work`, dynamic `/work/(.)[slug]`, SSG `/work/{knav,perchhq,shift}`. |
| AC 3 — card language | PASS | Computed on tile 1: shell radius **12px** (0.75rem), bg `--bg`, 1px border + **2px keycap bottom**, 4px frame; thumb panel radius **8px**, surface bg, 1px hairline, aspect exactly **1.6000**. Hover AND keyboard `:focus-visible` (`matches(':focus-visible')` true) = the Services wake verbatim: panel border → **srgb .69851** light / **.33631** dark (the shared color-mix step), title `translateX(3px)`, summary → fg; UA focus ring preserved. **No traveling border:** `::after` content `none`, `container-type: normal`, zero live cqw code (grep: retirement comments only). |
| AC 3 — reduced motion | PASS | `reduced_motion=reduce` context: entrance `animation: none`/opacity 1; on hover title `transform: none` (nulled) while the color steps still land (panel .69851, summary → fg) — same contract as Services. |
| Services regression | PASS | Ground truth for "computed-identical": `sass` compile of HEAD vs working services.module.scss — diff is declaration-order shifts only within `.tile`/`.panel`, no property reordered past an overlapping one → cascade-equivalent. Live on `/`: shell 12px + 1px/2px keycap border, panel 1px `rgb(229,229,229)` hairline radius 8px, title **20px/600/-0.3px** (clamp at 1440); hover wake full (title 3px, blurb → fg, panel .69851); intro cascade unaffected — section expanded to 928px, `rise-in` animation ran, all 4 tiles render. |
| Morph spot-check | PASS | Thumb radius the morph clip reads = **8px** (adapts from the live read, as claimed; was 6px pre-2.6). Click knav → dialog at `/work/knav`, index mounted beneath, `html` overflow hidden; capture shows the modal grown from the inset panel with the card shells dimmed behind, no geometry glitch at the panel radius. Escape → `/work`; **second open/close cycle** healthy, overflow restored. |
| Floor + console | PASS | scrollWidth = innerWidth = 375 on /work; every console error on /work (375+1440, light+dark), home, and modal-open is exactly the known `/_vercel/insights` + `/_vercel/speed-insights` 404 pair (URL-attributed). |
| Adversarial — geometry | PASS | Card border-box edges **216/708** and **732/1224** at 1440 = grid lines 1/7/13 by construction (compensation math gone); grid gaps **24px both axes** = `--grid-gutter` (bento parity); `_card.scss` consumed by exactly services + work-index. |

**Overall: PASS on all delta checks** (AC 9 one-system judgment → critic).

**Gate captures** (`.sagan/ledger/T-002/`, all visually confirmed):
`gate-r26-tiles-rest-1440-light.png`, `gate-r26-tiles-rest-1440-dark.png`,
`gate-r26-tile-hover-1440-light.png` (wake: hairline step + title nudge,
no traveling border), `gate-r26-tile-focus-1440-light.png` (wake + UA
ring), `gate-r26-work-index-375-light.png`,
`gate-r26-services-regression-1440-light.png`,
`gate-r26-modal-open-1440-light.png`. Working evidence (sass diff, JSON
assertion dumps, build log) in the run scratchpad.

**Not executed:** full morph/carousel/focus-trap suite (r2/r2.2 stands —
work-modal/work-carousel untouched); notes-regression diff (lib/mdx.ts
untouched); dark hover capture (dark wake asserted numerically);
touch/coarse pointer. **Adversarial notes:** first probe of the Services
title matched a Sankey chart label via `[class*='label']` (hashed CSS-module
class names make substring selectors lie — re-probed with `h3`); the 375
capture shows the known pre-existing grid/lite chip overlap on tile 2
(MEMORY.md says stop re-flagging). The missing test (five rounds
standing): nothing pins the `lib/mdx.ts` frontmatter contract — and now
nothing pins `_card.scss` computed-equivalence either; the one-time sass
diff run here is exactly the check a tiny CI script could keep.

## Decisions

- 2026-08-10 — Ticket compiled by the PM from Randy's brief (chat) + the
  agreed Work plan, amended by Randy at open: seed with **3 placeholder
  projects** (supersedes the plan's one-real-project seed; real content
  arrives later as per-project copy tickets). Open at the gate:
  (a) index layout — 2-up card grid vs full-width rows; (b) thumbnail
  aspect ratio; (c) placeholder identity — fictional "Untitled Project
  01–03" style vs real project names (Conan, this site, sagan.run) with
  stub copy.
- 2026-08-10 — Gate resolved (run-20260810-194454, all four confirmed by
  Randy): **2-up card grid**; thumbnail aspect **16:10**; placeholders
  **fictional, clearly labeled** with generated abstract thumbnails; AC
  + Method **approved as drafted**.
- 2026-08-10 — Mid-run tile refinement from Randy (ledgered
  `decision.made`, relayed to the builder in round 1; refines AC 3/9a,
  contradicts nothing): tile = image top + title/muted one-liner below;
  hover = rounded light-grey surface framing the WHOLE tile (token
  equivalent in dark), background-transition only. Reference:
  `.sagan/ledger/T-002/reference-tiles.png`. Critic judges the hover
  capture against this.
- 2026-08-10 — Builder's proposed subtraction (drop the /work intro
  paragraph): Randy's response — dropping it on /work alone is not on
  the table; it would have to drop on /lab and /notes too for the index
  pages to stay one system. Decision: intro STAYS in T-002; a site-wide
  "index intros" subtraction is a separate future ticket if wanted.
- 2026-08-10 — Promote gate: **send back** (round 1 APPROVED by critic,
  but Randy rejects the detail page as a full route — direction change
  to a modal-based project view, reference pattern incoming; round-2
  scope to be gated once it lands). Additional round-2 direction: **no
  numbers next to project titles** on the /work index (drop the 01/02/03
  mono numbering — this also retires the number→accent hover cue; the
  surface frame stays the hover state).
- 2026-08-10 — Round-2 amendment gated and approved by Randy (all four):
  (1) tiles keep text-below-image + hover frame; the IMAGE morphs into
  the modal; (2) **intercepting/parallel routes** — `/work/[slug]` stays
  a real URL, click = morph modal, direct visit = full page; (3)
  carousel = arrows + dots + keyboard + swipe, hand-rolled, reduced-
  motion instant; (4) AC amended: AC 1 (`images` schema), AC 3 (no
  numbers), AC 4 (rewritten for modal+carousel; round-1 empty-band
  advisory resolved by construction), AC 10 (morph/carousel behavior +
  a11y: scroll lock, focus trap/return, Escape/backdrop close). Source
  of the direction: `recording.mov` (repo root) — App Store "Today"
  card-to-modal morph; frames materialized at
  `.sagan/ledger/T-002/reference-modal-f*.png`. Round-1 critic nits to
  fix in round 2: stale hover comment (work-index.module.scss:6);
  token-drift note on the date row stands as consistency-by-copy, not
  required to change.
- 2026-08-10 — Tile hover simplified by Randy (supersedes the surface-
  frame refinement above): hover changes the tile's **border color
  only** — no background fill. Tiles carry a border at rest (subtle /
  transparent) that shifts to the visible grey on hover; token-matched
  in dark; transition color-only, reduced-motion safe. Critic judges
  the hover capture against THIS, not the frame spec.
- 2026-08-10 — Round 2.4 (gated, all three confirmed by Randy):
  (1) tile hover refined again, superseding r2.3's outer border — ONE
  border only: the image's bordered box grows to enclose the
  description (description moves inside, 16px padding); hover animates
  that single border's color. (2) Content amendment: Randy replaced the
  SVG placeholders with real-imagery honest stand-ins `knav` + `shift`
  mid-run (bodies state "This is not a real project", `Status:
  Placeholder` meta) — AC 2 amended to match; builder creates the
  matching `perchhq` stand-in from its supplied images; orphaned
  `placeholder-project-0*` asset folders deleted. Caught by
  verify-hamilton-r2e when the tree moved under its measurement run.
- 2026-08-10 — Shift's `liveUrl: https://knav.app` (flagged by two QA
  passes as an apparent copy-paste) was put to Randy at a gate and
  **confirmed intentional — keep**. Recorded as the standing waiver.
- 2026-08-10 — Round 2.6 (Randy, mid-critique; prior critic instance
  stopped before judging the superseded spec): tiles pivot to the
  **Services card language** — rounded bordered card, image in a
  keycap-inset media panel, title + muted line inside the card padding,
  Services' own wake as the hover; supersedes the r2.4 traveling border.
  Reference: `.sagan/ledger/T-002/reference-services-card.png`.
  Implemented via the shared `_card.scss` partial; Services rewired onto
  it, verified cascade-equivalent (QA r2g).
- 2026-08-11 — Round-2b critic verdict APPROVED (envelope validated; 6
  low findings, none blocking): critic self-disclosed an input-set
  breach (read the whole ticket file, so the Frontend block entered its
  context — verdict grounded in permitted inputs, weighed at the gate);
  AC 5's restored WorkFigure has source-proof but no render capture
  (visible in the promote preview at /work/perchhq); `--scrim` token
  not yet mirrored to DESIGN.md (drift-check carry-forward); grid-level
  stand-in ambiguity named as residual, honesty carried by each tile's
  "stand-in case" summary line.
- 2026-08-11 — **Promoted** at the per-ticket gate. Preview bundle: seven
  gate captures opened + production build served at :3010 (stopped after
  the decision). Decision by Randy: promote + commit. Card-padding
  subtraction declined by default (identical padding = one system);
  T-003 hygiene ticket deferred — carry-forwards live in
  `.sagan/MEMORY.md` (lib/mdx contract test, _card equivalence check,
  --scrim → DESIGN.md, perchhq WorkFigure capture). Status → Done.

<!-- sagan:repo-owned:end -->
