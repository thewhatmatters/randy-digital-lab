# Handoff — Services bento + Work route + nav reorder

_Updated 2026-06-20 · short session on top of the home build-out_

## Goal

Continue Randy's personal site (Next 16 App Router + Tailwind v4). This session
added a **Services bento** to the home page, scaffolded a placeholder **/work**
route, reordered the primary nav, and nudged footer spacing. Randy will do the
**visuals pass later today** (real imagery + final polish).

## Current state (shipped this session — committed + pushed)

1. **Services bento** (`app/components/services.{tsx,module.scss}`) — 5
   capabilities on the page's 12-col grid, registered on `app/page.tsx` below
   Experience (`mt-16`). Layout (Randy's exact spec, tiles placed per-tile via
   `--col`/`--row` custom props in the `SERVICES` array):
   - Row 1: `01 Design` cols 1–7 (span 7) · `02 Development` cols 8–12 (span 5)
   - Row 2: `03 Strategy` 1–4 · `04 Motion` 5–8 · `05 Systems` 9–12 (three quarters)
   - Each tile: **100×100 image placeholder** (`.media`, labelled with its index)
     + title + one-line blurb. **Hairline border** (`1px var(--border)` +
     `var(--radius)`), hover-wake (edge→fg, index→accent, title nudge). CSS-tier
     motion, reduced-motion-aware. Server Component.
2. **/work route** (`app/work/page.tsx`) — placeholder mirroring `notes/`:
   `Work` heading + intro + a mono **COMING SOON** marker where the project
   index will go. Prerenders static.
3. **Nav reordered** (`app/components/nav.tsx`) — now `01 base · 02 work ·
   03 lab · 04 notes`. Added `/work`; numbering is index-derived
   (`String(i+1)`), placement array extended to 4 subgrid slots (col 1/3/5/7).
   Uses `next-view-transitions` Link.
4. **Footer bottom spacing** (`app/components/footer.module.scss`) —
   `margin-bottom` bumped from flat `1.5rem` → `clamp(2.5rem, 7vh, 5rem)` so it
   doesn't kiss the viewport edge.

Verified: `pnpm build` passes; `/`, `/work` prerender static; headless
screenshots of the bento + Work page checked via `automate-browser`.

## Next steps (Randy: visuals later today)

1. **Services bento** — swap the 5 `.media` placeholders for **real art**
   (replace the `.media` block with `<img>`/`<figure>`; drop the surface/label).
2. **Footer EXPLORE column is out of sync** — still lists Base / Notes / Lab,
   missing **Work** and not reordered. Update to `Base · Work · Lab · Notes` in
   `footer.tsx`. Flagged to Randy, not yet done.
3. **/work data layer** — when real projects exist: MDX per project in
   `app/work/posts/` (or `projects/`) + a `utils.ts` like `notes/utils.ts`;
   replace the COMING SOON block with a numbered project index.
4. Earlier-standing: swap the two footer **logo placeholders** for real
   randy.digital + whatmatters art.

## Key decisions (and why)

- **Page named "Work"** (not Projects/Portfolio/Selected) — short lowercase
  editorial noun matching `base/lab/notes`; covers both design + engineering
  honestly. Sits at nav #02 (primary content after home).
- **Nav order base · work · lab · notes** — Randy's call; work is primary,
  notes last.
- **Bento keeps borders** — Randy previewed a borderless variant and rejected
  it ("definitely need the border"). Tiles are hairline-bordered.
- **Bento beat the earlier 2×2 quadrant** — the first Services attempt (big
  empty placeholder boxes) was rejected for reading as a templated SaaS feature
  grid; the small 100×100 placeholders + asymmetric bento fit the grid/aesthetic.

## Don't redo (rejected this session)

- **2×2 quadrant Services with large empty placeholder boxes** — built, then
  deleted; read as templated SaaS chrome, fought the hairline/flush-left system.
- **Borderless bento tiles** — previewed at Randy's request, rejected.
- **05 Systems alone on row 3** (from a 3×5-col misread) — corrected to the
  clean 7+5 / 4+4+4 two-row tiling above.

## Files & commands in play

- Services: `app/components/services.{tsx,module.scss}`; placement in the
  `SERVICES` array (each tile's `col`/`row` is one line).
- Work: `app/work/page.tsx`. Nav: `app/components/nav.tsx`.
- Footer: `app/components/footer.module.scss` (spacing). EXPLORE column lives in
  `app/components/footer.tsx` (the sync TODO).
- Home: `app/page.tsx`. `pnpm dev` / `pnpm build`. Headless verify via
  `automate-browser` (Lenis intercepts `window.scrollTo`; use element
  `scroll_into_view` / element screenshot — reduced-motion disables Lenis).

## Git state

Branch `main` (tracks `origin/main`). Committing + pushing this session's work
now (footer spacing, nav reorder, `page.tsx`, new `services.*` + `app/work/`).
After push: tree clean, in sync.
