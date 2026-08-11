'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from './work-carousel.module.scss'

// Work detail carousel — the image header of the project modal and of the
// full-page detail. Hand-rolled on purpose (AC 10: no new dependencies): a
// translated flex track, prev/next arrows, position dots, document-level
// arrow keys, and touch swipe with drag-follow. Transform-only motion; the
// slide transition is cut to an instant switch under prefers-reduced-motion
// (in the module). 16:10 is enforced by the root's aspect-ratio, so the
// header can never open a gap between itself and the content below it.
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
}

const clamp = (n: number, max: number) => Math.max(0, Math.min(max, n))

export function WorkCarousel({
  images,
  title,
  priority = false,
  framed = false,
}: WorkCarouselProps) {
  const count = images.length
  const [index, setIndex] = useState(0)
  // Live drag offset in px while a touch swipe is in flight (0 at rest).
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const pointer = useRef<{
    id: number
    startX: number
    startY: number
    width: number
    locked: boolean
  } | null>(null)

  const step = (delta: number) =>
    setIndex((i) => clamp(i + delta, count - 1))

  // Arrow keys navigate from anywhere on the page — in the modal, focus
  // starts on the close button, and demanding a click into the carousel
  // first would make the keys feel broken. Guarded against modifiers and
  // editable targets; single-image carousels never bind.
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
      className={[styles.carousel, framed ? styles.framed : '']
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${title} — images`}
      data-work-carousel=""
    >
      <div
        className={styles.viewport}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => settle(e, true)}
        onPointerCancel={(e) => settle(e, false)}
      >
        <ul
          className={[styles.track, dragging ? styles.dragging : '']
            .filter(Boolean)
            .join(' ')}
          style={{
            transform: `translateX(calc(${index * -100}% + ${drag}px))`,
          }}
        >
          {images.map((src, i) => (
            <li
              key={src}
              className={styles.slide}
              aria-hidden={i !== index || undefined}
            >
              <Image
                src={src}
                alt={`${title} — image ${i + 1} of ${count}`}
                width={1200}
                height={750}
                priority={priority && i === 0}
                sizes="(min-width: 64rem) 832px, 100vw"
                unoptimized={src.endsWith('.svg')}
                draggable={false}
              />
            </li>
          ))}
        </ul>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.prev}`}
            onClick={() => step(-1)}
            disabled={index === 0}
            aria-label="Previous image"
          >
            ←
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            onClick={() => step(1)}
            disabled={index === count - 1}
            aria-label="Next image"
          >
            →
          </button>
          <div className={styles.dots}>
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={[styles.dot, i === index ? styles.dotActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index || undefined}
              />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Image {index + 1} of {count}
          </p>
        </>
      )}
    </div>
  )
}
