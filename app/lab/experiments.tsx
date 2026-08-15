import type { ComponentType } from 'react'
import { AuroraTransition } from 'app/components/aurora-transition'
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
      "A faithful rebuild of the Next.js / Turbopack build-error overlay (paginator, status pill, syntax-highlighted code frame and caret), themed with the site's tokens and gently subverted: the errors are developer in-jokes, not real crashes.",
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
  {
    number: '02',
    slug: 'aurora-transition',
    title: 'Aurora Page Transition',
    summary:
      "This site's own page transition, running live: a miniature three-page site with its own nav, and the real aurora riser (the same component and stylesheet the route transition uses, not a copy) covering the moment its content changes. Switch between the two gestures: the rise that shipped, and the horizontal sweep it replaced.",
    stack: ['React', 'CSS animations', 'Container queries'],
    fonts: ['Geist Mono', 'Geist Sans'],
    colors: [
      'var(--aurora-1)',
      'var(--aurora-3)',
      'var(--aurora-6)',
      'var(--fg)',
      'var(--border)',
    ],
    prompt: `Build the page transition for a Next.js App Router site: a translucent aurora that stands up across the viewport while the route swaps underneath it.

The gesture:
- One panel of 12 vertical bars, one per grid column, sitting on the bottom edge of the viewport. Bar heights follow a raised half-sine arc: 39, 57, 73, 86, 95, 99, 99, 95, 86, 73, 57, 39 (percent of the panel's height). It peaks at the centre and tapers at the edges, so the top corners of the screen stay open the whole way and the effect reads as light rising past you, not a door closing.
- Each bar is a vertical rainbow, bottom to top: #2756f0 at 0%, #5ea0ff at 20%, #ffe06a at 40%, #ff9d3c at 56%, #ff4d6a at 73%, #ff35e0 at 88%, transparent at 100%. Keep the stops in CSS custom properties so a theme can move them.
- The panel is a 12 column grid with filter: blur(6px). That combination IS the effect: solid columns melted just enough to bleed into each other while the column sides still read. Above roughly 10px of blur it becomes a plain gradient; below 4px it becomes a bar chart.
- The panel is 130% of the viewport height and hangs 24px below the bottom edge, so the bars' solid bottoms and their blur run off screen instead of ending on a hard line.

The run, 760ms end to end:
- 0 to 55%: every bar animates from scaleY(0) to scaleY(1) with transform-origin: 50% 100%, so the whole spectrum starts as a bright seam along the bottom edge and blooms into the arc.
- At 55%: swap the page. That is the densest moment of the light.
- 55% to 100%: the whole panel translates to -145% of the viewport height, carrying the bars off the top and uncovering the new page from the bottom up.
- Curve for both moves: cubic-bezier(0.65, 0, 0.35, 1). A standard entrance curve is wrong here; a transition that both arrives and leaves needs symmetry at both ends.

Wiring it to the router:
- Render the layer fixed (inset 0, overflow hidden, pointer-events none, contain: strict), above your app chrome and below any first-load preloader.
- Do not reach for the View Transitions API. A fixed DOM band is captured into the root snapshot and freezes exactly when it should be moving. Instead add a capture-phase click listener on document: take the closest anchor, ignore anything that is not a plain left click onto a different same-origin path (modified clicks, target, download, external origin, the current path), then preventDefault and stopPropagation, mount the layer, call router.push(href) after 760 * 0.55 ms, and unmount at 760ms.
- Capture phase plus stopPropagation is what keeps a routing Link from also pushing and running a second transition underneath the band.
- Allow one run at a time, clear the timers on unmount, and clear a half-run layer when the path changes for a reason you did not start (back and forward buttons).

Reduced motion:
- Under prefers-reduced-motion: reduce, do not attach the listener and render nothing. Links navigate normally. For an effect that IS motion, no motion is the honest answer rather than a faster version of it. Hide the layer in CSS too, so a missed code path cannot leave it on screen.

Two traps this build hit, both worth avoiding:
- Do not composite the layer with a lighten blend. mix-blend-mode: plus-lighter reads like "light laid on the page", which is the right idea and the wrong arithmetic: on a white ground white is already at the ceiling, so the aurora adds nothing to the page and only brightens the dark text. The aurora vanishes and the words turn magenta. Use plain alpha instead, around 0.75 on a light ground and 0.6 on a dark one (the same alpha reads much hotter against near black).
- The panel's bottom edge needs a bent fade, not a straight one. Mask the panel with a bottom-up gradient of four stops, not two: transparent at 0%, 35% opaque at 14%, 75% opaque at 25%, fully opaque at 36%. A straight two-stop ramp fades evenly and therefore lands its own soft edge exactly where it reaches full opacity, which crosses the screen as a visible line while the panel travels out. Weighting the middle bends the ramp so the aurora leaves the page slowly and arrives at full strength without a shoulder.

Worth building alongside it as a comparison: the same spectrum as eleven horizontal steps under a 10px blur, in a band 130% of the viewport width, crossing left to right over 620ms with the swap at 40%. Mix each neighbouring pair of stops 50/50 with color-mix so the ramp steps instead of banding hard from blue to yellow.`,
    component: AuroraTransition,
  },
]
