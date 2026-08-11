import { getWorkProjects } from 'app/work/utils'
import { newestFirst } from 'lib/dates'
import { WorkTile } from './work-tile'
import styles from './work-index.module.scss'

// Work index — a 2-up card grid (gate decision), Newest-first (lib/dates:
// publishedAt descending, slug ascending on ties — with all three projects
// sharing one date, the grid order is knav → perchhq → shift by
// specification), in the
// Services card language (round-2.6 decision): each tile is the same "tool
// card" object as a Services tile — rounded keycap-bordered card, the 16:10
// image inside its own inset media panel, title + muted one-liner below in
// the card's padding (no numbering — round-2 decision). This stays a Server
// Component (it reads the filesystem); each tile is a client island
// (work-tile.tsx) because since T-004 it carries its own carousel — arrows
// page through the project's images in place and the current slide rides the
// link's href as ?i=N, so the modal opens at the image the eye is already on.
//
// The tiles are still the morph source for the project modal: clicking one
// soft-navigates to /work/[slug], which the @modal slot intercepts; the modal
// finds the tile via [data-work-tile] / [data-work-tile-image] and grows the
// image from its position. Plain next/link (not the view-transitions Link)
// on purpose: the morph IS the transition here, and the site-wide route
// crossfade would fade/lift the index underneath it. scroll={false} keeps the
// index parked under the overlay instead of jumping to top. At rest each tile
// renders only images[0] — by the work-schema convention that IS the
// thumbnail — so the resting grid and its network cost are unchanged.
export function WorkProjects() {
  let projects = newestFirst(getWorkProjects())

  return (
    <ul className={styles.grid}>
      {projects.map((project, i) => (
        <WorkTile
          key={project.slug}
          slug={project.slug}
          title={project.metadata.title}
          summary={project.metadata.summary}
          images={project.metadata.images}
          order={i}
        />
      ))}
    </ul>
  )
}
