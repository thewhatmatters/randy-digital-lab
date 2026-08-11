'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  WORK_TILE_SYNC,
  clampIndex,
  parseIndexParam,
  type WorkTileSyncDetail,
} from './work-carousel-position'
import styles from './work-carousel.module.scss'

// Work carousel — ONE implementation, three seats (T-004: no second
// carousel). The shared core is the track + arrows + live region below;
// `WorkCarousel` composes them into the modal / full-page header, and the
// /work tile (work-tile.tsx) composes the same pieces around its link so the
// arrows can be SIBLINGS of the link, never nested inside it. Hand-rolled on
// purpose (T-002 AC 10: no new dependencies): a translated flex track,
// prev/next arrows, position dots, document-level arrow keys (modal/full
// page only — tiles scope their own keys), and touch swipe with drag-follow.
// Transform-only motion; the slide transition is cut to an instant switch
// under prefers-reduced-motion (in the module). 16:10 is enforced by the
// root's aspect-ratio, so the header can never open a gap between itself and
// the content below it.
//
// The root carries [data-work-carousel] — the modal measures it as the
// morph's shared-element target.

type WorkCarouselProps = {
  /** Ordered image paths (16:10 each) from the work frontmatter. */
  images: string[]
  /** Project title — labels the region and the images. */
  title: string
  /** Eager-load the first image (full-page use, where it is the LCP). */
  priority?: boolean
  /** Hairline border + house radius (full-page use; the modal panel clips
   *  its own corners instead). */
  framed?: boolean
  /** Open at this slide — the intercepted modal route parses ?i= server-side
   *  and passes it down, so the first paint is already at slide N and the
   *  morph grows into the image the tile was showing (AC 3/4). Clamped. */
  initialIndex?: number
  /** Full-page use: adopt ?i= from location after hydration. The page stays
   *  statically generated (reading searchParams server-side would make it
   *  dynamic); the static HTML paints slide 0 — its priority image stays the
   *  LCP — and this jumps to slide N transition-suppressed (AC 3). */
  indexFromUrl?: boolean
  /** Broadcast index changes as `work-tile:sync` so the source tile follows —
   *  closing on slide M then lands the reverse morph on a tile already
   *  showing M (AC 5). Modal use only. */
  syncSlug?: string
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ')

// ---------------------------------------------------------------------------
// Shared core — the pieces both seats compose. Styles stay in this module so
// the tile's controls are the same objects, not lookalikes.
// ---------------------------------------------------------------------------

type CarouselTrackProps = {
  images: string[]
  title: string
  index: number
  /** Live drag offset in px while a touch swipe is in flight (0 at rest). */
  drag?: number
  /** Suppress the slide transition — drag-follow, or an instant jump
   *  (URL adoption, tile write-back). */
  instant?: boolean
  /** How many slides are in the DOM. Tiles mount 1 until first engagement
   *  (AC 2); the index can never point past this (engagement precedes any
   *  step). Defaults to all. */
  mountedCount?: number
  priority?: boolean
  sizes: string
  /** Tile use: slides are decorative (alt="") — they render inside the
   *  card's link, whose accessible name must stay the title + summary text,
   *  and the tile's live region already announces position. */
  decorative?: boolean
  /** Tile use: slides mounted after the first load eagerly — mounting IS the
   *  preload signal, and laterally-offset slides sit outside the lazy
   *  loader's viewport heuristics. */
  eagerBeyondFirst?: boolean
  /** Pointer handlers for swipe (modal/full page; tiles omit — a tile swipe
   *  would fight the link's tap-to-navigate). */
  viewportProps?: React.ComponentPropsWithoutRef<'div'>
}

export function CarouselTrack({
  images,
  title,
  index,
  drag = 0,
  instant = false,
  mountedCount,
  priority = false,
  sizes,
  decorative = false,
  eagerBeyondFirst = false,
  viewportProps,
}: CarouselTrackProps) {
  const count = images.length
  const shown = images.slice(0, mountedCount ?? count)

  return (
    <div className={styles.viewport} {...viewportProps}>
      <ul
        className={cx(styles.track, instant && styles.dragging)}
        style={{
          transform: `translateX(calc(${index * -100}% + ${drag}px))`,
        }}
      >
        {shown.map((src, i) => (
          <li
            key={src}
            className={styles.slide}
            aria-hidden={i !== index || undefined}
          >
            <Image
              src={src}
              alt={decorative ? '' : `${title} — image ${i + 1} of ${count}`}
              width={1200}
              height={750}
              priority={priority && i === 0}
              loading={eagerBeyondFirst && i > 0 ? 'eager' : undefined}
              sizes={sizes}
              unoptimized={src.endsWith('.svg')}
              draggable={false}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CarouselArrows({
  index,
  count,
  onStep,
  project,
  className,
}: {
  index: number
  count: number
  onStep: (delta: number) => void
  /** Names the arrows for AT — "Previous image, <project>" (AC 6). The modal
   *  omits it: one carousel on screen needs no disambiguation. */
  project?: string
  /** Consumer skin on top of the shared arrow object (the tile's
   *  hover-reveal + touch sizing live in its own module). */
  className?: string
}) {
  return (
    <>
      <button
        type="button"
        className={cx(styles.arrow, styles.prev, className)}
        onClick={() => onStep(-1)}
        disabled={index === 0}
        aria-label={project ? `Previous image, ${project}` : 'Previous image'}
      >
        ←
      </button>
      <button
        type="button"
        className={cx(styles.arrow, styles.next, className)}
        onClick={() => onStep(1)}
        disabled={index === count - 1}
        aria-label={project ? `Next image, ${project}` : 'Next image'}
      >
        →
      </button>
    </>
  )
}

// One polite region per carousel: it only speaks when ITS text changes, so
// a grid of tiles never cross-announces (AC 6).
export function CarouselStatus({
  index,
  count,
}: {
  index: number
  count: number
}) {
  return (
    <p className="sr-only" aria-live="polite">
      Image {index + 1} of {count}
    </p>
  )
}

// ---------------------------------------------------------------------------
// The modal / full-page seat.
// ---------------------------------------------------------------------------

export function WorkCarousel({
  images,
  title,
  priority = false,
  framed = false,
  initialIndex = 0,
  indexFromUrl = false,
  syncSlug,
}: WorkCarouselProps) {
  const count = images.length
  const [index, setIndex] = useState(() => clampIndex(initialIndex, count - 1))
  // Live drag offset in px while a touch swipe is in flight (0 at rest).
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  // One-commit transition suppression for the full page's URL adoption —
  // the post-hydration jump to ?i=N must cut, not animate slide 0 → N.
  const [snapped, setSnapped] = useState(false)
  const pointer = useRef<{
    id: number
    startX: number
    startY: number
    width: number
    locked: boolean
  } | null>(null)

  const step = (delta: number) =>
    setIndex((i) => clampIndex(i + delta, count - 1))

  // Full-page hard load of /work/[slug]?i=N: the page is static (slide 0 in
  // the HTML), so the position is adopted client-side, before this commit
  // paints. See `indexFromUrl` above.
  useLayoutEffect(() => {
    if (!indexFromUrl) return
    const raw = new URLSearchParams(window.location.search).get('i')
    const n = clampIndex(parseIndexParam(raw), count - 1)
    if (n <= 0) return
    setSnapped(true)
    setIndex(n)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Restore the slide transition on the commit after a snap.
  useEffect(() => {
    if (snapped) setSnapped(false)
  }, [snapped])

  // Close write-back (AC 5): tell the source tile where we are, every time
  // we move (and once on mount). The tile updates under the backdrop, so the
  // reverse morph always lands on the image the modal was showing.
  useEffect(() => {
    if (!syncSlug) return
    window.dispatchEvent(
      new CustomEvent<WorkTileSyncDetail>(WORK_TILE_SYNC, {
        detail: { slug: syncSlug, index },
      })
    )
  }, [syncSlug, index])

  // Arrow keys navigate from anywhere on the page — in the modal, focus
  // starts on the close button, and demanding a click into the carousel
  // first would make the keys feel broken. Guarded against modifiers and
  // editable targets; single-image carousels never bind. (Document-level is
  // a modal/full-page behavior only — tiles scope keys to themselves.)
  useEffect(() => {
    if (count < 2) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.isContentEditable ||
          /^(input|textarea|select)$/i.test(target.tagName))
      ) {
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        step(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        step(1)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  // Touch/pen swipe with drag-follow: the track tracks the finger (direct
  // manipulation, so it stays honest under reduced motion), rubber-bands at
  // the ends, and snaps on release past a quarter-viewport threshold. Mouse
  // is excluded — mouse users have the arrows, and a mouse drag would fight
  // text/image selection.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' || count < 2) return
    pointer.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      width: e.currentTarget.clientWidth,
      locked: false,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointer.current
    if (!p || e.pointerId !== p.id) return
    const dx = e.clientX - p.startX
    const dy = e.clientY - p.startY
    if (!p.locked) {
      // Wait for a clear direction; vertical wins → let the page scroll.
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      if (Math.abs(dy) > Math.abs(dx)) {
        pointer.current = null
        return
      }
      p.locked = true
      e.currentTarget.setPointerCapture(p.id)
      setDragging(true)
    }
    const atEdge =
      (index === 0 && dx > 0) || (index === count - 1 && dx < 0)
    setDrag(atEdge ? dx / 3 : dx)
  }

  const settle = (e: React.PointerEvent<HTMLDivElement>, commit: boolean) => {
    const p = pointer.current
    if (!p || e.pointerId !== p.id) return
    pointer.current = null
    if (commit && p.locked) {
      const dx = e.clientX - p.startX
      const threshold = Math.min(p.width / 4, 96)
      if (dx <= -threshold) step(1)
      else if (dx >= threshold) step(-1)
    }
    setDrag(0)
    setDragging(false)
  }

  return (
    <div
      className={cx(styles.carousel, framed && styles.framed)}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${title} — images`}
      data-work-carousel=""
    >
      <CarouselTrack
        images={images}
        title={title}
        index={index}
        drag={drag}
        instant={dragging || snapped}
        priority={priority}
        sizes="(min-width: 64rem) 832px, 100vw"
        viewportProps={{
          onPointerDown,
          onPointerMove,
          onPointerUp: (e) => settle(e, true),
          onPointerCancel: (e) => settle(e, false),
        }}
      />

      {count > 1 && (
        <>
          <CarouselArrows index={index} count={count} onStep={step} />
          <div className={styles.dots}>
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={cx(styles.dot, i === index && styles.dotActive)}
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index || undefined}
              />
            ))}
          </div>
          <CarouselStatus index={index} count={count} />
        </>
      )}
    </div>
  )
}
