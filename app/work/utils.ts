import path from 'path'
import { getMDXData, type ContentSchema, type MetaItem } from 'lib/mdx'

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
// Since T-006 the parser reads bare list items as plain strings natively, so
// `images` arrives as string[] straight from the parser — the old
// RawWorkMetadata/itemToPath inverse shim is gone, and the validation floor
// below guarantees the shape at read time.
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
  /** Ordered carousel images (16:10 each). Required, ≥1 entry — enforced by
   *  the validation floor, so every project declares its carousel
   *  explicitly (the pre-T-006 [thumbnail] fallback is gone). */
  images: string[]
}

// Validation floor for work (T-006): notes' floor plus the case-page fields.
// 'string-list' also rejects an image path containing ": " (it would parse
// as a {label, value} pair) with a named error instead of mangling it.
const workSchema: ContentSchema = {
  title: 'scalar',
  publishedAt: 'date',
  summary: 'scalar',
  thumbnail: 'scalar',
  images: 'string-list',
}

export function getWorkProjects() {
  return getMDXData<WorkMetadata>(
    path.join(process.cwd(), 'app', 'work', 'projects'),
    workSchema
  )
}
