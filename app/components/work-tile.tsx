'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import {
  CarouselArrows,
  CarouselStatus,
  CarouselTrack,
} from './work-carousel'
import {
  WORK_TILE_SYNC,
  clampIndex,
  type WorkTileSyncDetail,
} from './work-carousel-position'
import { WORK_TILE_ATTR, WORK_TILE_IMAGE_ATTR } from './work-morph'
import styles from './work-index.module.scss'

// One /work tile (T-004) — the Airbnb-card pattern: page through a project's
// images without leaving the grid; the slide you land on is the image the
// modal morph grows from. Structure rule (AC 1/6): the card link and the
// arrow <button>s are SIBLINGS — the arrow layer sits over the media panel,
// outside the link, so there is no interactive-inside-interactive and an
// arrow press can never navigate. Tab order follows DOM order: link first,
// then prev, then next (gate left this to the builder; link-first keeps the
// primary action primary).
//
// Position handoff (AC 3): the current slide is reflected into the link's
// href as ?i=N (index 0 stays the plain path), so the intercepted modal, the
// full page, and a shared link all open at the same slide — the URL is the
// only position store.
//
// Lazy discipline (AC 2): at rest only slide 1 is mounted, so the initial
// /work request loads exactly one image per tile. The rest mount on first
// engagement — pointerenter/focusin (hover-preload: by the time the revealed
// arrow is pressed, slide 2 is usually already loaded) or the modal's sync
// event — and load eagerly from there (mounting IS the preload signal).
//
// Write-back (AC 5): the modal carousel broadcasts `work-tile:sync` as the
// user pages; this tile follows instantly (transition-suppressed — it sits
// under the backdrop, animating there would be motion nobody sees), so
// closing on slide M reverse-morphs onto a tile already showing M.

type WorkTileProps = {
  slug: string
  title: string
  summary: string
  /** Ordered carousel images; images[0] is the thumbnail by the work-schema
   *  convention, so the at-rest tile is unchanged from T-002. */
  images: string[]
  /** Entrance stagger position (--i). */
  order: number
}

export function WorkTile({ slug, title, summary, images, order }: WorkTileProps) {
  const count = images.length
  const [index, setIndex] = useState(0)
  // Slides 2..N mount on first engagement (AC 2).
  const [engaged, setEngaged] = useState(false)
  // One-commit transition suppression for modal write-back jumps.
  const [snapped, setSnapped] = useState(false)

  const engage = () => setEngaged(true)

  const step = (delta: number) => {
    setEngaged(true)
    setIndex((i) => clampIndex(i + delta, count - 1))
  }

  // Follow the modal (AC 5). Scoped by slug — other tiles ignore the event.
  useEffect(() => {
    if (count < 2) return
    const onSync = (e: Event) => {
      const detail = (e as CustomEvent<WorkTileSyncDetail>).detail
      if (!detail || detail.slug !== slug) return
      setEngaged(true)
      setSnapped(true)
      setIndex(clampIndex(detail.index, count - 1))
    }
    window.addEventListener(WORK_TILE_SYNC, onSync)
    return () => window.removeEventListener(WORK_TILE_SYNC, onSync)
  }, [slug, count])

  // Restore the slide transition on the commit after a snap.
  useEffect(() => {
    if (snapped) setSnapped(false)
  }, [snapped])

  // Arrow keys page ONLY this tile, and only while focus is inside it (the
  // link or an arrow) — scoping comes free from event bubbling, so two tiles
  // can never fight and the document keeps its keys (memory: document-level
  // arrow keys stay a modal-only behavior).
  const onKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (count < 2 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    }
  }

  return (
    <li
      className={styles.tile}
      style={{ '--i': order } as CSSProperties}
      onKeyDown={onKeyDown}
      onPointerEnter={count > 1 ? engage : undefined}
      onFocus={count > 1 ? engage : undefined}
    >
      <Link
        className={styles.card}
        href={index > 0 ? `/work/${slug}?i=${index}` : `/work/${slug}`}
        scroll={false}
        {...{ [WORK_TILE_ATTR]: slug }}
      >
        {/* Slides are decorative here — the card's text carries the
            accessible name; the inset media panel enforces the 16:10 aspect
            and stays the morph's measured source ([data-work-tile-image]). */}
        <span className={styles.thumb} {...{ [WORK_TILE_IMAGE_ATTR]: '' }}>
          <CarouselTrack
            images={images}
            title={title}
            index={index}
            instant={snapped}
            mountedCount={engaged ? count : 1}
            sizes="(min-width: 48rem) 50vw, 100vw"
            decorative
            eagerBeyondFirst
          />
        </span>
        <span className={styles.body}>
          <span className={styles.title}>{title}</span>
          <span className={styles.summary}>{summary}</span>
        </span>
      </Link>
      {count > 1 && (
        <>
          {/* Sibling arrow layer — mirrors the media panel's box (same
              border-box 16:10 inside the card's 0.25rem frame). The layer
              itself is click-transparent; only the buttons take the pointer. */}
          <div className={styles.arrowLayer}>
            <CarouselArrows
              index={index}
              count={count}
              onStep={step}
              project={title}
              className={styles.tileArrow}
            />
          </div>
          <CarouselStatus index={index} count={count} />
        </>
      )}
    </li>
  )
}
