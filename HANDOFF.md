# Handoff — Editorial margin + SCSS-module refactor

_Updated 2026-06-18 · session refresh checkpoint_

## Goal

Rebuild Randy's personal site (Next.js App Router + Tailwind v4): portfolio,
MDX **notes**, and a **lab** of experiments. This session reworked how notes
present supplemental content and reorganized the whole styling architecture.

## Current state (all committed + pushed this session)

1. **Notes are single-author — byline + credits removed.** Dropped the visible
   byline and the end-of-note "How this was made" colophon entirely (Randy's
   call: it's his page, no guest authors, so constant attribution is noise).
   Removed the dead logic (`humanSharePct`, author-splitting) and the
   `authors`/`aiDegree`/`ctaLabel`/`ctaHref` frontmatter from both notes. Kept
   an invisible JSON-LD `author: Randy Daniel` for SEO.
2. **Editorial margin system** (the note right column). Inline MDX components —
   `<Margin>` / `<PullQuote>` / `<Figure>` (app/components/margin.tsx, wired in
   app/components/mdx.tsx) — authored in the note body and floated into the
   right column, **grid-aligned to columns 9–12** (width derived from the grid,
   not a fixed rem), collapsing inline below 1024px. The article spans full width
   with prose text capped at `--reading-measure` (declared on `.article` in the
   module). Verified visually both themes. Examples live in `building-conan.mdx`
   (CTA margin, pull quote, an SVG "60% rule" mini-chart).
3. **Component CSS → co-located SCSS Modules.** Every component now owns a
   `*.module.scss` next to its `.tsx` (button, command-bar, grid-overlay,
   footer-reveal, margin, dev-overlay, lab/page). `app/global.css` shrank
   901→~300 lines and holds ONLY the shared layer: `@theme` tokens, `:root` +
   dark palette, `--aurora-*`/`--sh-*`, `grid-page`/`band` utilities, base
   resets, and `.prose` MDX typography. `sass` added as a devDependency.
4. **Docs.** `global.css` now has a header TOC + 10 numbered section banners.
   `CLAUDE.md` gained a "Component styles" bullet codifying the SCSS-module
   convention (+ "do not add component rules to global.css").

All verified: `pnpm build` passes (TS clean, 11 routes prerender), no orphaned
class refs, visual parity confirmed across notes / lab / footer aurora / grid
overlay / command bar.

## Next steps

1. Refresh the **Paper canvas** — stale vs the rainbow aurora AND now the notes
   lost their byline/credits + gained the editorial margin. Code is canonical;
   canvas is downstream docs. Run `/design-token-drift` first.
2. Voice pass on the two notes; build the portfolio/projects index.
3. More lab experiments + the remaining island wrappers (`Sketch`/`Canvas`/
   `Playground` per CLAUDE.md).
4. Confirm the Vercel deploy reached `randy.digital` (DNS may still be pending).

## Key decisions (and why)

- **No visible attribution on notes** — single-author site, never guest authors;
  see memory `note-attribution-and-margin`.
- **Editorial margin = inline-anchored, not a sticky rail.** Marginalia sits
  next to the passage it's about. A sticky/"follows you down" variant was
  prototyped and **rejected — too jerky** (see Don't redo).
- **SCSS modules for components; global.css stays plain CSS** because it's the
  Tailwind v4 entry (`@import 'tailwindcss'`, `@theme`, `@apply`, `@utility`) —
  Sass would break those. See memory `css-architecture`.
- **`--aurora-*` stay in global `:root`** (drift-checked, Paper-mirrored), but
  `--reading-measure` moved into the margin module (component-private).

## Open questions / risks

- Margin width is grid-derived (`(100% − 2·gutter)/3` = cols 9–12); re-check if
  the article column span ever changes.
- Pull-quote accent color relies on a doubled-class rule `.pullquote.margin p`
  out-specifying `.prose p` — preserved through the SCSS nesting; keep it.

## Files & commands in play

- Notes route: `app/notes/[slug]/page.tsx`; note bodies: `app/notes/posts/*.mdx`.
- Margin: `app/components/margin.tsx` + `margin.module.scss`; MDX map:
  `app/components/mdx.tsx`.
- Styling: `app/global.css` (TOC'd) + the seven `*.module.scss` files.
- `pnpm dev` / `pnpm build`. Headless screenshots via the `automate-browser`
  skill (Playwright in `~/.claude/skills/automate-browser`, not a project dep).

## Git state

Branch `main` (tracks `origin/main`). Committed + pushed this session — working
tree clean after the commit.

## Don't redo

- **Sticky / "follows-you-down" margins** — built as a JS island
  (`sticky-margins.tsx`, zone-clamped to avoid overlap), Randy found it **too
  jerky and reverted it**. Don't re-propose without a fundamentally smoother
  approach.
- Serif body + drop cap on notes — tried earlier, rejected; body stays Geist.
- Credits-in-the-rail — tried, then the whole credits concept was removed.
