import path from 'path'
import { getMDXData, type MetaItem } from 'lib/mdx'

// The generic frontmatter parser + directory reader live in lib/mdx.ts
// (shared with app/work/utils.ts). This file keeps ONLY the notes schema
// and notes-specific helpers; getBlogPosts() behaves exactly as before.

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

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  let daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}
