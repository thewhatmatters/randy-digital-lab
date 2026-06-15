import type { ComponentType } from 'react'
import { DevOverlay } from 'app/components/dev-overlay'

/**
 * Lab registry. Each experiment is a self-contained project exploring a single
 * UI element / interaction. The index (lab/page.tsx) renders every entry live,
 * with its visual element clipping inside a grid-bound frame and a metadata
 * caption below. There's no per-experiment route; the index IS the gallery. As
 * the Lab grows this can migrate to the blog's MDX pattern; a typed registry is
 * enough for now.
 */
export type Experiment = {
  number: string // "01"
  slug: string
  title: string
  summary: string // short blurb under the experiment
  stack: string[] // what it's built with
  fonts: string[]
  colors: string[] // CSS color values — token refs (var(--x)) theme automatically
  prompt: string // agent-ready spec to recreate it (the "copy prompt")
  component: ComponentType
}

export const experiments: Experiment[] = [
  {
    number: '01',
    slug: 'dev-overlay',
    title: 'Dev Overlay',
    summary:
      "A faithful rebuild of the Next.js / Turbopack build-error overlay — paginator, status pill, syntax-highlighted code frame and caret — themed with the site's tokens and gently subverted: the errors are developer in-jokes, not real crashes.",
    stack: ['React', 'sugar-high'],
    fonts: ['Geist Mono', 'Geist Sans'],
    colors: [
      'var(--accent)',
      'var(--fg)',
      'var(--muted)',
      'var(--surface)',
      'var(--border)',
    ],
    prompt: `Build a React client component that recreates the Next.js / Turbopack build-error overlay as a reusable, themeable UI element.

Layout:
- A card on a tinted backdrop. Top-left: a paginator tab ("‹ n/total ›"). Top-right: a status pill (status dot + "Next.js x.y.z (stale)" + "Turbopack").
- A "Build Error" badge, a row of copy/docs/more icon buttons, then a red error title.
- A code frame with a file-path header (icon + path + external-link button) and a numbered code block: syntax highlighting, a ">" pointer on the error line, a "^^^^" caret underline beneath it, an import trace, and a doc link.

Requirements:
- Drive every color from CSS custom properties so it themes light/dark; the error red is the design system's accent color.
- Syntax highlighting via the "sugar-high" package (highlight() per line).
- The paginator cycles N mock error frames; include a working copy button.
- Honor prefers-reduced-motion for the entrance animation.
- Subvert the content: the "errors" are developer in-jokes (e.g. Can't resolve 'work/life-balance'), never real crashes.`,
    component: DevOverlay,
  },
]
