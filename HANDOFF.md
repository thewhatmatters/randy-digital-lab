# Handoff — Services icon-bento (text+icons) + footer map + Work route

_Updated 2026-06-21 · home/footer build-out_

## Goal

Randy's personal site (Next 16 App Router + Tailwind v4). This stretch reworked
the **home Services section** (long detour: bento → graphic/video tile →
text-only list → back to an **icon bento**) and earlier built an **interactive
footer map** and the **/work** route. Next visible task: swap the Services
**placeholder icons** for real bold pictograms.

## Current state (home Services — latest, uncommitted until this push)

`app/components/services.{tsx,module.scss}` — an **icon bento** on the page's
12-col grid:
- Layout (per-tile `--col`/`--row`): row 1 `Design` cols 1–7 (span 7) +
  `Development` cols 8–12 (span 5); row 2 `Strategy` 1–4 · `Motion` 5–8 ·
  `Systems` 9–12. Hairline-bordered tiles, `var(--radius)`.
- Each tile: a **monochrome line pictogram** (top) + Title-case label + a longer
  **first-person blurb**. Blurb is **0.875rem / line-height 1.5** (the app's
  small-secondary size, matches Experience metadata).
- **Tile padding: flat `1rem`** (Randy's pick over the earlier clamp).
- Hover-wake (border + icon → fg, label nudge, blurb brightens), rise-in
  stagger, reduced-motion-aware. Pure markup + tokens → **Server Component**.
- **Icons are PLACEHOLDERS** — geometric marks (circle/square/triangle/globe/
  house) in the `MARKS` array in services.tsx. **← next task: real pictograms.**

Also this session: **footer description** (`A portfolio of work…`,
`footer.module.scss .desc`) set to the same **0.875rem/1.5** so the two read as
one type system.

## Don't redo (rejected this Services detour)

- **Graphic/video tile** — imported a Paper `ShaderDithering` dot-sphere, made it
  a **transparent animated WebP** (the long road: mp4 has no alpha → blurry
  `fill-outline` → VP9-alpha kept dropping → animated WebP was the only
  cross-browser transparent format; ~700K, high-entropy noise compresses badly).
  Randy rejected it. **`public/services/design.webp` deleted; `public/` removed.**
  Lesson if revisited: transparency + every browser = animated WebP only, and
  it's heavy.
- **Text-only variants** (editorial 3-col list; oversized wordmarks; run-in
  manifesto) — built the 3-col list; Randy liked it but wanted the **bento box
  back**, keeping the icon idea. Current state = bento + icons + original copy.
- **first-person LONG labels** like "digital spaces"/"design systems" — reverted
  to original Title-case Design/Development/Strategy/Motion/Systems.

## Next steps

1. **Real pictograms** — replace the 5 placeholder SVGs in `MARKS`
   (services.tsx). Source TBD: Randy provides SVGs / export from Paper / pull a
   bold open set (Phosphor bold, Iconoir) / draw a custom eye-occult set.
2. **/work data layer** — MDX per project + `utils.ts` like `notes/`; replace the
   COMING SOON placeholder with a numbered index.
3. **Footer map** — CARTO **attribution** still off (parked; add
   `© OpenStreetMap · CARTO` before prod). `ZOOM`/`HAIRLINE` are the knobs.
4. Earlier-standing: swap the two footer **logo placeholders** for real art.

## Earlier shipped (already pushed)

- **Interactive footer map** (`footer-map.{tsx,module.scss}`, commit b896e33):
  MapLibre strip above the world clocks, floating CARTO outlines (transparent
  ocean = page bg, crisp coastline + country hairlines), hover a clock city →
  flyTo + accent marker → back to Austin; theme-aware, lazy-loaded,
  reduced-motion jump. Tunables `ZOOM=0.8`, `HAIRLINE=0.8`, `CITY_COORDS`.
- **/work** placeholder route; **nav** `01 base · 02 work · 03 lab · 04 notes`;
  **footer** EXPLORE synced + `● AVAILABLE FOR WORK` indicator under the clocks.

## Files & commands in play

- Services: `app/components/services.{tsx,module.scss}` (`MARKS` = icons,
  `SERVICES` = copy + col/row). Home: `app/page.tsx`.
- Footer: `app/components/footer.{tsx,module.scss}`,
  `footer-map.{tsx,module.scss}`, `world-clock.{tsx,module.scss}`.
- Work: `app/work/page.tsx`. Nav: `app/components/nav.tsx`.
- `pnpm dev` / `pnpm build`. Headless verify via `automate-browser` (Lenis
  intercepts `window.scrollTo`; use element `scroll_into_view`/screenshot. Map
  `ZOOM` only re-reads on a full reload — Fast Refresh keeps the old instance).
- Dep added earlier: `maplibre-gl`. `ffmpeg` (homebrew) used for the abandoned
  WebP pipeline.

## Git state

Branch `main` (tracks `origin/main`). Prior pushes this work: 908adf8, cb235ff,
226eced, b896e33. Committing + pushing the Services icon-bento + footer type now
(services.{tsx,scss}, footer.module.scss, page.tsx; design.webp deleted). After
push: tree clean, in sync.
