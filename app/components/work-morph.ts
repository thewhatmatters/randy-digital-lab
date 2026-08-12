// The tile→modal morph contract (T-009) — one owner for the names and
// numbers the shared-element morph rides on. Deliberately NOT a 'use client'
// module (same reasoning as work-carousel-position.ts): the producers span
// both sides of the client boundary — work-tile.tsx / work-carousel.tsx are
// client islands, work-detail.tsx is a Server Component — so the constants
// live here, directive-free, and both sides import them.
//
// The morph itself measures live rects at open (T-002/T-004 design: encode
// geometry once, in CSS; JS reads the computed truth). What it cannot
// measure it finds or falls back through these constants:
//
// - The four data-attributes are how work-modal.tsx locates its endpoints in
//   a portal'd, CSS-Modules-hashed DOM. Producers attach them via computed
//   JSX spreads; the consumer builds querySelector strings from them.
//   tests/work-morph.test.ts scans app/ + lib/ for hand-typed `data-work-*`
//   string literals so the vocabulary cannot fork (the intro-gate idiom).
// - The two radius fallbacks are the morph's clip-path rounding for the case
//   where `parseFloat(getComputedStyle(...).borderRadius)` yields nothing
//   (an unparseable/zero computed value — no live path today). They mirror
//   the CSS truth at the default 16px root em: the tile panel's
//   $card-panel-radius (0.5rem, _card.scss) and the modal panel's
//   calc(var(--radius) * 3) (0.375rem × 3, work-modal.module.scss +
//   global.css). tests/work-morph.test.ts pins both against the compiled
//   SCSS so neither language can drift alone — the previous hand-typed
//   fallback said 6px against an 8px truth for exactly this reason.

/** Marks a tile's link on /work; valued with the project slug. */
export const WORK_TILE_ATTR = 'data-work-tile'

/** The tile's inset 16:10 media panel — the rect the morph grows from. */
export const WORK_TILE_IMAGE_ATTR = 'data-work-tile-image'

/** The detail carousel root — the morph's shared-element target. */
export const WORK_CAROUSEL_ATTR = 'data-work-carousel'

/** The detail text block the open morph fades in after the image leads. */
export const WORK_DETAIL_CONTENT_ATTR = 'data-work-detail-content'

/** Tile media-panel corner radius in px (== $card-panel-radius at 16px em). */
export const WORK_TILE_RADIUS_PX = 8

/** Modal panel corner radius in px (== --radius × 3 at 16px em). */
export const WORK_PANEL_RADIUS_PX = 18
