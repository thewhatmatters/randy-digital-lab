# Handoff — Services bento + Work route + nav/footer sync

_Updated 2026-06-20 · short session on top of the home build-out_

## Goal

Continue Randy's personal site (Next 16 App Router + Tailwind v4). This session
added a **Services bento** to the home page, scaffolded a placeholder **/work**
route, reordered the primary nav, synced the footer (added Work + an
availability indicator), and nudged footer spacing. Randy will do the **visuals
pass later today** (real imagery + final polish).

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
   03 lab · 04 notes`. Added `/work`; numbering index-derived (`String(i+1)`),
   placement array extended to 4 subgrid slots (col 1/3/5/7).
4. **Footer synced** (`app/components/footer.tsx` + `.module.scss`):
   - EXPLORE column now `Base · Work · Lab · Notes` (Work added, order matches nav).
   - **Availability indicator** — `● AVAILABLE FOR WORK` placed **under the
     world-clock row** in the left intro column (`md:col-span-full`). Reuses the
     leftover `.status` + `.statusDot` (pulsing `#29a36a`, same semantic green as
     the hero cue) + its reduced-motion guard; `.status` given its own mono-caps
     type treatment (it previously inherited from the removed status bar).
   - Bottom `margin-bottom` bumped `1.5rem` → `clamp(2.5rem, 7vh, 5rem)` so the
     footer no longer kisses the viewport edge.

Verified: `pnpm build` passes; `/`, `/work` prerender static; headless
screenshots of the bento, Work page, and footer checked via `automate-browser`.

## Next steps (Randy: visuals later today)

1. **Services bento** — swap the 5 `.media` placeholders for **real art**
   (replace the `.media` block with `<img>`/`<figure>`; drop the surface/label).
2. **/work data layer** — when real projects exist: MDX per project in
   `app/work/posts/` (or `projects/`) + a `utils.ts` like `notes/utils.ts`;
   replace the COMING SOON block with a numbered project index.
3. Earlier-standing: swap the two footer **logo placeholders**
   (RANDY.DIGITAL / WHATMATTERS dashed boxes) for real art.

## Key decisions (and why)

- **Page named "Work"** — short lowercase editorial noun matching
  `base/lab/notes`; covers both design + engineering. Nav #02 (primary content).
- **Nav order base · work · lab · notes** — Randy's call; work primary, notes last.
- **Bento keeps borders** — Randy previewed a borderless variant and rejected it
  ("definitely need the border"). Tiles are hairline-bordered.
- **Availability indicator under the clocks** — Randy first asked whether it fit
  in CONNECT, then moved it under the world clocks. It reads as a status line
  (mono caps, like the clock labels), not a link, so it belongs in the identity
  column rather than the social-links column.
- **Bento beat the earlier 2×2 quadrant** — first Services attempt (big empty
  placeholder boxes) was rejected as templated SaaS chrome.

## Don't redo (rejected this session)

- **2×2 quadrant Services with large empty placeholder boxes** — built, deleted.
- **Borderless bento tiles** — previewed at Randy's request, rejected.
- **Availability indicator in the CONNECT column** — tried, then moved under the
  world clocks instead.
- **05 Systems alone on row 3** (3×5-col misread) — corrected to 7+5 / 4+4+4.

## Files & commands in play

- Services: `app/components/services.{tsx,module.scss}`; placement in the
  `SERVICES` array (each tile's `col`/`row` is one line).
- Work: `app/work/page.tsx`. Nav: `app/components/nav.tsx`.
- Footer: `app/components/footer.{tsx,module.scss}`; clocks in
  `app/components/world-clock.tsx`.
- Home: `app/page.tsx`. `pnpm dev` / `pnpm build`. Headless verify via
  `automate-browser` (Lenis intercepts `window.scrollTo`; use element
  `scroll_into_view` / element screenshot — reduced-motion disables Lenis).

## Git state

Branch `main` (tracks `origin/main`). Earlier this session pushed `908adf8`
(bento + /work + nav) and `cb235ff` (footer EXPLORE + Work). Committing +
pushing the availability indicator + footer type now. After push: tree clean,
in sync.
