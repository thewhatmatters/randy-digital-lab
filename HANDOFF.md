# Handoff — Intro choreography: preloader → hero → cascading sections

_Updated 2026-06-22 · home intro sequencing + hero CTA_

## Goal

Build a Love-Death-Robots-style intro and choreograph the whole home-page entrance
off it. The preloader (committed in `976d645`) is done; **this session wired the
post-veil reveal sequence** and made hero tweaks. Randy signed off ("Awesome").
Committing + pushing now.

## The full intro choreography (current, end to end)

1. **Preloader** (already shipped): 3×3 slot-machine drum → blur-to-focus reveal →
   fires `preloader:done` + `window.__introDone`, and now also adds the `intro-done`
   class + the `intro-revealed` fallback (see below).
2. **Hero animates** (`hero.tsx`, GSAP island): masked line-reveal of the headline +
   bio/CTA/meta fades, plays on `preloader:done`. **On complete it adds
   `html.intro-revealed`** — this is the signal the sections wait for, so the hero
   goes FIRST and nothing shows below it during the hero.
3. **Sections cascade in** after the hero, **Experience then Services**, by position.

## The gating mechanism (key architecture)

A global, CSS-driven signal so Server Components can gate their entrance without
becoming client components — mirrors how the Hero self-gates:

- **`html.intro-armed`** — added **before paint** by an inline script in `layout.tsx`,
  ONLY when JS is on AND motion is allowed. So no-JS / reduced-motion never arm →
  everything renders in place (each module also has a reduced-motion `opacity:1`
  safety).
- **`html.intro-revealed`** — added by the **Hero** on its timeline `onComplete`
  (sequences sections after the hero). Fallback: `preloader.signalDone()` adds it
  immediately **if there's no `[data-hero]` on the page** (the Hero `<section>` carries
  `data-hero`), so hero-less pages still reveal at preloader-done.
- Sections gate on `:global(html.intro-armed.intro-revealed)`.

## Section reveal: collapse → cascade (Experience, Services)

Randy iterated to: don't show the section **labels** either until after the hero, no
reserved whitespace, and stagger by page position.

- Each section's contents (label + list) are wrapped in a **`.inner`** div
  (`overflow:hidden; min-height:0`). The `<section>` is `display:grid;
  grid-template-rows:1fr`; while armed it collapses to **`0fr`** (whole section 0
  height — nothing below the hero) and on `intro-revealed` expands to `1fr` (real
  height, content painted once + clipped, not re-laid-out).
- **`--section-order`** (set per section in `page.tsx`: Experience 0, Services 1)
  drives the cascade: expand `transition-delay` = `order * 0.55s`, and the row/tile
  rise-in `animation-delay` adds `order * 550ms`. So Experience opens, then Services
  ~0.55s later. Generalises to any new section (next index).
- Verified via headless heights: during hero both sections = 0; after, exp expands to
  730 while svc still 0, then svc cascades to 966.

Files touched for gating: `experience.{tsx,module.scss}`, `services.{tsx,module.scss}`,
`posts.module.scss` + `charts/stack-matrix.module.scss` (Notes/Stack — same
`intro-revealed` row gate, no collapse; they're not on home but kept consistent).
**Footer**: nothing to gate (its only animation is the infinite status-dot pulse).

## Hero content changes

- Headline capitalised: **"Pixels to Production."** (`HEADLINE` in `hero.tsx`).
- **New CTA** under the bio: **"Let's work together ↗"** — the shared `Button` with
  `variant="accent"` (the signal-red primary), `href="mailto:hey@randy.digital"`,
  wrapped in a `data-fade` div so it joins the hero reveal.
- **Button component gained a `trailingIcon` prop** (`button.{tsx,module.scss}`) — it
  only had a leading `icon`; trailing renders after the label and slides ↗ diagonally
  on hover (matches the footer arrow, reduced-motion-safe). Reusable site-wide.

## Verify / commands

- `pnpm exec tsc --noEmit` — **clean** (run from project ROOT; the shell `cd`s into the
  automate-browser skill dir during headless checks — `cd` back first).
- `pnpm dev` running. Headless verify via `automate-browser`: set
  `localStorage.theme='dark'`; do NOT clear sessionStorage. Rough timing: preloader
  done ~3.9s, hero done / `intro-revealed` ~5.4s, Experience expands ~5.5–5.9s,
  Services ~6.0–6.9s. Note `getBoundingClientRect` still reports a clipped element's
  box — measure the SECTION height (0 vs full) to confirm collapse, not the label.

## Open threads / caveats

1. **CWV / layout-animation caveat** (flag for `/audit-ui`): the section reveal animates
   `grid-template-rows` (a LAYOUT prop, not transform/opacity) and the blur reveal uses
   full-screen `backdrop-filter` — both are the heavy bits. Ran smoothly here; verify on
   a low-end device. Also a footer side-effect: during the ~1.5s hero window the sections
   are 0-height so the footer rides up under the hero, then gets pushed down. Randy was
   offered gating/pinning the footer — left as-is for now.
2. **Icon-pool redline** — preloader's 12 marks + per-route `TRIADS` (`reel-glyphs.tsx`)
   still first-draft.
3. **Internal-nav mini-reel** — still just the crossfade.
4. Tuning knobs: `--section-order` step (`0.55s`), the `0.6s` expand duration, hero
   timing, preloader `TURNS`/`HOLD`/`BLUR`.

## Git state

Branch `main` (tracks `origin/main`), last commit `976d645` (preloader). **Committing +
pushing now**: 13 modified files — `layout.tsx`, `page.tsx`, `hero.{tsx,module.scss}`,
`button.{tsx,module.scss}`, `preloader.tsx`, `experience.{tsx,module.scss}`,
`services.{tsx,module.scss}`, `posts.module.scss`, `charts/stack-matrix.module.scss`.
After push: tree clean, in sync.
