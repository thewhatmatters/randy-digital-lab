import path from 'path'
import { getMDXData, type MetaItem } from 'lib/mdx'

// The generic frontmatter parser + directory reader live in lib/mdx.ts
// (shared with app/work/utils.ts); shared date helpers (formatDate,
// newestFirst) live in lib/dates.ts. This file keeps ONLY the notes
// schema; getBlogPosts() behaves exactly as before.

type StackItem = MetaItem

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  // Optional supplemental "at a glance" rows, rendered in the post's right
  // rail. Authored in frontmatter as an indented YAML-style list:
  //   stack:
  //     - Desktop shell: Tauri
  //     - Terminal: xterm.js
  stack?: StackItem[]
  // Optional call-to-action button at the foot of the right rail.
  ctaLabel?: string
  ctaHref?: string
  // Co-author credits, rendered as a byline + a roles block in the right rail.
  // Authored like `stack` — an indented list of "Name: role" rows. List the
  // human(s) and any AI collaborator as distinct authors, e.g.:
  //   authors:
  //     - Randy: direction, editing, final call
  //     - Claude · Opus 4.8: drafting, research, code
  authors?: StackItem[]
  // Honest "how much AI" calibration label shown beside the byline, e.g.
  // "Co-written with Claude" / "Human-written · AI-edited". Set per note;
  // never fabricate it — it only means anything if it's true.
  aiDegree?: string
}

export function getBlogPosts() {
  return getMDXData<Metadata>(path.join(process.cwd(), 'app', 'notes', 'posts'))
}
