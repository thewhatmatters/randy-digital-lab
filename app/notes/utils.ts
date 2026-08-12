import path from 'path'
import { getMDXData, type ContentSchema } from 'lib/mdx'

// The generic frontmatter parser + directory reader live in lib/mdx.ts
// (shared with app/work/utils.ts); shared date helpers (formatDate,
// newestFirst) live in lib/dates.ts. This file keeps ONLY the notes
// schema: the TypeScript shape below and the validation floor the shared
// reader enforces at read time (T-006).
//
// The schema equals what renders (T-008): the old right-rail fields
// (stack, ctaLabel/ctaHref, authors, aiDegree) documented renderers that
// were never built — attribution now lives inline in the margin (see the
// note-attribution decision), so the fields, their authoring docs, and
// their parse-shape pins were DELETED, not implemented.

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
}

// Validation floor for notes (T-006): a note missing any of these fails the
// build with a ContentFileError naming the file and the problem.
const notesSchema: ContentSchema = {
  title: 'scalar',
  publishedAt: 'date',
  summary: 'scalar',
}

export function getBlogPosts() {
  return getMDXData<Metadata>(
    path.join(process.cwd(), 'app', 'notes', 'posts'),
    notesSchema
  )
}
