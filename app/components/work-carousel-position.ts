// Shared position vocabulary for the work carousels (T-004). Deliberately
// NOT a 'use client' module: the intercepted modal route is a Server
// Component and must parse ?i= with the exact same rules the client islands
// use — importing helpers across the client boundary would turn them into
// opaque references, so they live here, directive-free.

/** Clamp a slide index into [0, max] (max = count - 1). */
export const clampIndex = (n: number, max: number) =>
  Math.max(0, Math.min(max, n))

/** Parse a raw ?i= search param into a non-negative integer. Anything
 *  unparseable (missing, arrays, junk, negatives) is slide 0 — a bad link
 *  must never crash, per AC 3. Upper clamping happens where the image count
 *  is known (inside the carousel). */
export function parseIndexParam(raw: unknown): number {
  if (typeof raw !== 'string') return 0
  const n = Number.parseInt(raw, 10)
  return Number.isInteger(n) && n > 0 ? n : 0
}

/** Window event the modal carousel broadcasts as the user pages, so the
 *  source tile follows along under the backdrop — by close time the tile is
 *  already showing slide M and the reverse morph lands on it (AC 5). */
export const WORK_TILE_SYNC = 'work-tile:sync'

export type WorkTileSyncDetail = { slug: string; index: number }
