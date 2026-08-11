import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getWorkProjects } from 'app/work/utils'
import styles from './work-index.module.scss'

// Work index — a 2-up card grid (gate decision), newest first, in the
// Services card language (round-2.6 decision): each tile is the same "tool
// card" object as a Services tile — rounded keycap-bordered card, the 16:10
// image inside its own inset media panel, title + muted one-liner below in
// the card's padding (no numbering — round-2 decision). Server Component;
// entrance mirrors the notes index (rise-in family); hover is the Services
// wake (panel edge brightens, title nudges, summary lifts) — shared skin
// lives in _card.scss.
//
// Round 2: tiles are the morph source for the project modal. Clicking one
// soft-navigates to /work/[slug], which the @modal slot intercepts; the modal
// finds this tile via [data-work-tile] / [data-work-tile-image] and grows the
// image from its position — since round 2.6 that box sits INSET inside the
// card frame (the modal measures the panel's live rect + radius, so the morph
// tracks it automatically). Plain next/link (not the view-transitions Link)
// on purpose: the morph IS the transition here, and the site-wide route
// crossfade would fade/lift the index underneath it. scroll={false} keeps the
// index parked under the overlay instead of jumping to top.
export function WorkProjects() {
  let projects = getWorkProjects().sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1
    }
    return 1
  })

  return (
    <ul className={styles.grid}>
      {projects.map((project, i) => (
        <li key={project.slug}>
          <Link
            className={styles.card}
            href={`/work/${project.slug}`}
            scroll={false}
            data-work-tile={project.slug}
            style={{ '--i': i } as CSSProperties}
          >
            {/* Thumbnail is decorative here — the card's text carries the
                accessible name; the inset media panel enforces the 16:10
                aspect. */}
            <span className={styles.thumb} data-work-tile-image="">
              <Image
                src={project.metadata.thumbnail}
                alt=""
                width={1200}
                height={750}
                sizes="(min-width: 48rem) 50vw, 100vw"
                unoptimized={project.metadata.thumbnail.endsWith('.svg')}
              />
            </span>
            <span className={styles.body}>
              <span className={styles.title}>{project.metadata.title}</span>
              <span className={styles.summary}>{project.metadata.summary}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
