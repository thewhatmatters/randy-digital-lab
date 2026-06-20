# Handoff — Interactive footer map (MapLibre) + Services bento + Work route

_Updated 2026-06-20 · home/footer build-out_

## Goal

Continue Randy's personal site (Next 16 App Router + Tailwind v4). This session
built an **interactive footer map** (MapLibre, floating-outline aesthetic, hover
a world-clock city → fly there), on top of earlier work this day: a Services
bento, a placeholder /work route, nav/footer sync, and a footer availability
indicator. Randy will do a broader **visuals pass** (real imagery) later.

## Current state (shipped — committed + pushed)

### Interactive footer map (this session's focus — `footer-map.{tsx,module.scss}`)
- A thin **4rem strip above the world clocks**, spanning the 4 clock columns
  (`.map`, `grid-column: 1 / 5`). **No border, no gradient** — it's transparent,
  so the page background reads as the ocean ("floating continents").
- **MapLibre**, lazy-loaded (dynamic `import('maplibre-gl')`) so it stays off the
  initial bundle / static prerender. `interactive: false` (hover-driven only).
- **Floating-outline restyle** (`applyFloating`): loads a CARTO vector style,
  then on `load` hides background + all fills + labels + roads, and draws
  **crisp coastlines as LINE layers** off the water geometry (NOT
  `fill-outline-color` — that renders blurry and ignores width). Keeps only the
  **solid country border** (drops CARTO's dashed state/county lines + the lighter
  `boundary_country_outline` halo — those were the "grayed out" lines). All
  strokes one token colour (`--muted`) at width `HAIRLINE = 0.8`.
- **Theme-aware**: CARTO positron (light) / dark-matter (dark) via next-themes
  `resolvedTheme`; line colour resolved from `--muted` at runtime via a probe
  span (tokens may be oklch; `getComputedStyle().color` → rgb maplibre can parse).
- **Hover-to-fly**: `WorldClock` emits the hovered city via `onCity` → `footer.tsx`
  holds `activeCity` state → `FooterMap` flies there (`flyTo`, 1400ms) and moves
  the single **accent marker**; mouse-leave → back to Austin (home/default).
  Reduced-motion → `jumpTo`. Tunables: `ZOOM = 2.5`, `HAIRLINE = 0.8`, city
  coords in `CITY_COORDS`.
- **Clock affordance** (`world-clock.{tsx,module.scss}`): zones get
  `cursor: pointer` and `:hover .city` → accent (Austin stays accent as home).

### Earlier today (already pushed: 908adf8, cb235ff, 226eced)
- **Services bento** (`services.{tsx,module.scss}`) on the home page 12-col grid:
  row 1 `01`(1–7) `02`(8–12); row 2 `03`/`04`/`05` quarters; 100×100 placeholders
  + title + blurb; **hairline-bordered** (Randy rejected borderless), hover-wake.
- **/work** placeholder route; **nav** `01 base · 02 work · 03 lab · 04 notes`;
  **footer** EXPLORE synced + **availability indicator** under the clocks.

Verified: `pnpm build` passes; `/`,`/work` prerender static; map hover-fly +
accent + pointer + theme + crispness checked via `automate-browser` screenshots.

## Next steps

1. **CARTO attribution** — currently `attributionControl: false` (parked at
   Randy's request). Before production, credit `© OpenStreetMap · CARTO`
   (lean: a tiny line in the footer fine print). Decision pending.
2. **Map feel** — `ZOOM`/`HAIRLINE` are single knobs in `footer-map.tsx` if more
   tuning wanted. Optional: two-tone coast vs border; keyboard/touch trigger
   (hover-only today — zones aren't focusable).
3. **Services bento** — swap the 5 `.media` placeholders for real art.
4. **/work data layer** — MDX per project + `utils.ts` like `notes/`; replace
   COMING SOON with a numbered index.
5. Earlier-standing: swap the two footer **logo placeholders** for real art.

## Key decisions (and why)

- **Stayed on CARTO** (not Natural Earth GeoJSON) for the floating outlines —
  Randy's pick; tradeoff = attribution still owed (parked).
- **Coastlines as line layers, not fill-outline** — fill-outline-color is the
  fuzzy/blurry renderer; line layers are crisp + width-controllable.
- **Single accent marker moves** to the hovered city, returns to Austin on
  leave (Austin = home/default).
- **HMR caveat (dev only)**: the map instance is created once (effect keyed on
  `resolvedTheme`), so editing `ZOOM` needs a **hard refresh** to show — Fast
  Refresh keeps the old map. Not a production issue.

## Don't redo (rejected/parked this session)

- **Natural Earth GeoJSON** route — considered (would drop CARTO + kill the
  attribution need); Randy chose to stay on CARTO instead.
- **Top/bottom gradient mask** on the map — added, then removed (transparent
  floating map needs no fade).
- **`fill-outline-color` coastlines** — looked blurry; replaced with line layers.
- **Dashed admin borders + country halo** — hidden (the "grayed out" lines).

## Files & commands in play

- Map: `app/components/footer-map.{tsx,module.scss}` (tunables: `ZOOM`,
  `HAIRLINE`, `CITY_COORDS`, `MAP_STYLE`, `applyFloating`).
- Footer: `app/components/footer.{tsx,module.scss}` (holds `activeCity` state,
  `.map` slot). Clocks: `app/components/world-clock.{tsx,module.scss}` (`onCity`).
- Services: `app/components/services.{tsx,module.scss}`. Work: `app/work/page.tsx`.
  Nav: `app/components/nav.tsx`. Home: `app/page.tsx`.
- New dep: `maplibre-gl`. `pnpm dev` / `pnpm build`. Headless verify via
  `automate-browser` (full reloads — needed to pick up `ZOOM` changes; Lenis
  intercepts `window.scrollTo`, use element `scroll_into_view`/screenshot).

## Git state

Branch `main` (tracks `origin/main`). Earlier pushes this session: 908adf8,
cb235ff, 226eced. Committing + pushing the footer-map feature now (new
`footer-map.*`, `footer.*`, `world-clock.*`, `package.json`/lockfile). After
push: tree clean, in sync.
