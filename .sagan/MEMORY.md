# Project memory — rolling synthesis

(The PM appends synthesized learnings here after each ticket; raw
per-task retros in `.sagan/memory/` are pruned once absorbed. Durable
project truths get promoted to the project's entry-point doc; cross-project
insights are proposed to the vault through its gate.)

## T-001 — "The Sagan Method" note (run-20260810-181514, promoted round 1)

- **Render-verification on this site:** the preloader veil plays on EVERY
  full page load, all routes — captures must wait for
  `window.__introDone === true` (or `html.intro-done`), never just
  `networkidle`, or the top third ships blank. Dark scheme is
  `localStorage.theme = 'dark'` via next-themes (`data-theme` readback to
  confirm). Localhost console 404s for `/_vercel/insights` +
  `/_vercel/speed-insights` are expected on every page — compare against a
  reference route before calling a console error a defect.
- **Content tickets: measure the house shape into the AC.** Quoting both
  reference notes' real numbers (word band, H2 count, Margin/PullQuote
  budget) turned shape from judgment into mechanics, and cut the outline
  from 9 sections to 5 before any drafting was wasted.
- **Cold-open pattern when no real anecdote exists:** second-person
  shared-experience frame ("If you've run a coding agent…") — honest,
  hook-shaped, no invented specifics.
- **Known gaps, not blocking, carried forward:** (1) no frontmatter-shape
  validation for `app/notes/posts/*.mdx` — malformed notes surface only at
  build or as a rendered Invalid Date (cheap unit test, or the planned
  Velite migration); (2) pre-existing 375px overlap of the floating
  grid/lite chrome chips with the PullQuote/margin region on note pages —
  house UI fix, stop re-flagging per note; (3) the named bench has no
  written one-line specialties for content tickets to cite.
