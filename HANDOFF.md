# Handoff — Home build-out: kinetic intro, experience, studio footer

_Updated 2026-06-20 · session refresh checkpoint_

## Goal

Rebuild Randy's personal site (Next 16 App Router + Tailwind v4). This session
heavily built out the **home page**: a kinetic intro, a real Experience table, a
numbered grid nav, and a studio-style world-clock footer — plus a project-wide
motion stack. Randy drove the direction iteratively (lots of reject/redo).

## Current state (shipped this session — all committed + pushed)

1. **Motion stack adopted** (heavy, by request — Randy chose "full Adcker"):
   `gsap` + `lenis` (smooth scroll, `smooth-scroll.tsx`, GSAP-ticker-driven) +
   `next-view-transitions` (route crossfade — **Barba is incompatible with App
   Router**, this is the Next-native replacement; CSS in `global.css` §12).
   All reduced-motion-aware. CWV cost accepted.
2. **Kinetic hero** (`hero.tsx`): masked line-reveal of the display headline
   **"Pixels to / production."** + bio (matches the site description) + green
   pulsing "Available for work" dot. Plays after the **preloader** veil
   (`preloader.tsx`, once/session, fires `preloader:done`). No video (removed).
3. **Numbered grid nav** (`nav.tsx`): 01 base / 02 notes / 03 lab on grid lines
   1·3·5 (subgrid; `column-gap: normal` to inherit the gutter — don't set 0).
4. **Experience** (`experience.tsx`): 9 real roles, grid-aligned 4-col table
   (No./Role/Company/Focus/Years), current roles render open-ended "2024 –"
   (no "NOW"), WhatMatters is the single accent. Rise-in stagger + hover.
5. **Notes index** (`posts.tsx`) + shared **`SectionLabel`** + `/notes` intro;
   both index sections grid-aligned. **Note-body reading measure** fixed to a
   grid-derived 7 cols (`margin.module.scss`) so prose stops at line 8.
6. **Studio footer** (`footer.tsx`, pengon.dev style): logo-lockup placeholders
   (RANDY.DIGITAL / WHATMATTERS), description, **live world clocks**
   (`world-clock.tsx`: SF/LA · **Austin** accent · Paris · Tokyo, 1-col each on
   grid lines, scramble-settles on first view), EXPLORE + CONNECT columns (real
   social URLs). The columns' top aligns with the description (lockup on its own
   row). **Footer motion**: scroll-into-view stagger, link hover (underline wipe
   + ↗ slide), reveal-bloom parallax (`--bloom` set by `footer-reveal.tsx`).
7. **StackMatrix** chart (`charts/stack-matrix.tsx`) — BUILT + registered in
   mdx, but **hidden on the home page** (kept for later).
8. **Docs**: CLAUDE.md + DESIGN.md motion sections rewritten for the real stack.

Verified each step: `pnpm build` passes, `/` + `/notes` prerender static
(client islands hydrate), light/dark + reduced-motion checked via headless
screenshots (`automate-browser`).

## Next steps

1. **Swap footer logo placeholders** for real randy.digital + whatmatters art
   (replace the two `.logo` divs in `footer.tsx` with `<img>`/SVG; drop the
   dashed placeholder styling).
2. Voice/polish pass; build the `/lab` experiments; portfolio/projects index.
3. Optional: bring StackMatrix back somewhere, or other catalog charts.

## Key decisions (and why)

- **Heavy motion is intentional** — Randy explicitly opted into the rich,
  client-heavy direction over the original restraint. Reduced-motion always has
  a real path; CWV watched via Speed Insights.
- **next-view-transitions over Barba** — Barba hijacks routing, incompatible
  with Next App Router/RSC. Use its `Link` for internal nav.
- **Footer = studio invite, not billboard** — landed on the pengon.dev
  world-clock layout after rejecting (in order) a giant wordmark, a "corporate"
  CTA, and a Matter.js draggable-photo guestbook.

## Open questions / risks

- Footer logos are **placeholders**; world-clock + nav alignment relies on
  subgrid + `column-gap: normal` (a 0 gap silently breaks line alignment).
- Motion stack depends on `blockJS:false` (charts) staying set, and on the
  client islands not regressing the static prerender.

## Files & commands in play

- Hero/intro: `app/components/{hero,preloader,smooth-scroll}.tsx` + scss;
  `app/layout.tsx`; `app/global.css` (Lenis §11, View-Transitions §12).
- Footer: `app/components/{footer,world-clock,footer-reveal}.tsx` + scss.
- Index: `app/components/{experience,posts,section-label}.tsx` + scss;
  `app/components/margin.module.scss`; `app/notes/page.tsx`; `app/page.tsx`.
- Nav: `app/components/nav.tsx`. Charts: `app/components/charts/stack-matrix.*`.
- `pnpm dev` / `pnpm build`. Headless verify via `automate-browser`
  (Lenis intercepts `window.scrollTo` in normal mode → use element.screenshot /
  scroll_into_view; reduced-motion disables Lenis).

## Don't redo (rejected this session)

- **Matter.js guestbook cards** in the footer — built then removed (dep gone).
- **Giant-wordmark footer** and **"corporate" CTA footer** — both rejected.
- **Bundled-edge flow chart** for the stack — rejected for the dot matrix.
- **Centered footer status bar** — removed; footer is flush-left on the grid.
- Hero **sticky video** — removed. Hero **bottom-anchored** layout — moved to
  top-loaded. Headline scroll-out fade — removed (felt inconsistent).

## Git state

Branch `main` (tracks `origin/main`), in sync after this session's push. Tree
clean. New deps: `gsap`, `lenis`, `next-view-transitions` (matter-js was added
then removed). Committed in focused commits + pushed.
