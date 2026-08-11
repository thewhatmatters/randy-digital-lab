import path from 'path'
import { getMDXData, type MetaItem } from 'lib/mdx'

// Work schema — same filesystem MDX pipeline as notes (lib/mdx.ts), with
// extended frontmatter for case pages: a 16:10 thumbnail for the index card,
// an ordered `images` list for the detail carousel, an optional live-site URL
// (no liveUrl → no CTA rendered), and `meta` "label: value" rows, authored as
// indented block lists:
//   meta:
//     - Status: Placeholder
//   images:
//     - /work/<slug>/thumb.svg
//     - /work/<slug>/carousel-02.svg
export type WorkMetadata = {
  title: string
  publishedAt: string
  summary: string
  /** Index-card image, 16:10, under public/work/<slug>/. By convention it is
   *  also the FIRST carousel entry, so the tile→modal morph is seamless (the
   *  image the modal opens on is the one that grew out of the grid). */
  thumbnail: string
  /** Live-site URL — renders the "Visit site ↗" CTA when present. */
  liveUrl?: string
  /** At-a-glance rows for the detail content section. */
  meta?: MetaItem[]
  /** Ordered carousel images (16:10 each). Normalized below; falls back to
   *  [thumbnail] if a project declares none. */
  images: string[]
}

// What the shared parser actually produces for `images`: its block-list rule
// reads every "- item" as a {label, value} pair split on ": " — a bare path
// has no ": " so it lands whole in `label` (and any accidental split is
// rejoined below). The parser stays byte-identical for notes (AC 1); the
// work layer owns this normalization.
type RawWorkMetadata = Omit<WorkMetadata, 'images'> & { images?: MetaItem[] }

const itemToPath = (item: MetaItem) =>
  item.value ? `${item.label}: ${item.value}` : item.label

export function getWorkProjects() {
  return getMDXData<RawWorkMetadata>(
    path.join(process.cwd(), 'app', 'work', 'projects')
  ).map((project) => ({
    ...project,
    metadata: {
      ...project.metadata,
      images: project.metadata.images?.length
        ? project.metadata.images.map(itemToPath)
        : [project.metadata.thumbnail],
    } as WorkMetadata,
  }))
}
