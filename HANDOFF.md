# Handoff — randy-digital

_Updated 2026-06-16 · session: built the **footer "aurora curtain" reveal** —
the diabrowser.com / sui.io scroll-past-the-footer effect — as a
zero-dependency, accent-themed, reduced-motion-safe component. Verified live in
a real browser (light + dark, short + long pages), built green, committing +
pushing to deploy._

## Goal

Rebuild Randy's personal site (Next.js App Router + Tailwind v4): **portfolio**,
**MDX notes**, and a **lab** of interactive experiments. Built on the Vercel
portfolio-starter-kit; leans on skills + the **Paper Desktop** design-canvas MCP.

## This session — footer aurora reveal (DONE)

Replicated the Dia/Sui effect: scroll "past" the footer reveals a gradient
curtain, which then springs back. Researched both sites live first (Sui =
Lenis + GSAP ScrollTrigger + fixed `canvas-wrapper`; Dia = blurred radial-gradient
div in an overscroll zone). Randy chose: **accent aurora (Dia-style look)** +
**Motion scroll-spring feel**, but starting with a **zero-dependency** build
(Motion/Lenis version deferred — see Next steps).

**Mechanism (important — got corrected twice, this is the right model):**
- The aurora is a **real in-flow `<div className="footer-reveal">` section
  BELOW the footer**, height `--reveal-h` (60vh desktop / 42vh mobile). Being
  real DOM, it adds genuine scroll height — the **scrollbar actually travels**
  into it (this was Randy's key correction; an earlier fixed-layer version that
  *peeked at rest* was wrong).
- **Hidden at rest** like a curtain: at the rest scroll position the section
  sits exactly one viewport below the footer, off-screen.
- **Overscroll reveals it; release springs the scroll position back up** to the
  footer (re-hiding it) via a `requestAnimationFrame` ease (`easeOutCubic`,
  `dur: 460`, `120ms` idle debounce before snapping).
- **Short-page fix:** the content above the curtain is wrapped in a
  `min-h-[100dvh]` flex column (`<div className="flex min-h-[100dvh] flex-col
  pt-12">` with `{children}` in a `flex-auto` div). This pushes the footer to
  the viewport bottom AND the curtain off-screen, giving short pages (e.g. home)
  the scroll room to hide + reveal. Without it the curtain just sat glowing.

**Files touched:**
- `app/components/footer-reveal.tsx` — NEW `'use client'` island. Scroll
  listener + rAF spring. `restTop = scrollHeight - innerHeight - section.
  offsetHeight`. Guard is `if (rest < -1) return` (NOT `<= 0` — restTop is
  exactly 0 on viewport-fill short pages, which is valid and must still snap).
  Skips entirely under `prefers-reduced-motion` (static gradient remains).
- `app/layout.tsx` — wrapped Navbar+children+Footer in the `min-h-[100dvh]`
  flex column; `<FooterReveal />` is the in-flow block right after it.
- `app/global.css` — `.footer-reveal` (relative, `flex-shrink:0`, height
  `--reveal-h`, overflow hidden) + `.footer-reveal__aurora` (layered
  `radial-gradient`s in `color-mix(var(--accent) …)` warmed with peach/gold/pink,
  `blur(34px)`, oversized inset to hide blur edges). `--reveal-h` var in `:root`
  (60vh) + `@media (max-width:640px)` (42vh). NOTE: an earlier `--reveal-window`
  var was removed — don't reintroduce it.

**Verified live** (automate-browser / Playwright, headless):
- Long note `/notes/building-conan`: hidden at rest → scroll to `1959` reveals →
  springs back to exactly `1443`. Dark mode reads great (`#ff6369`).
- Home `/` (short): `restTop=0`, `maxScroll=516` → hidden, footer at viewport
  bottom → scroll to `516` reveals → springs back to `0`.
- `pnpm build` green (10 routes).

## Source of truth (unchanged, still important)

- **Code is canonical** for design tokens — `app/global.css` `:root` (light) +
  `[data-theme='dark']` (dark); `DESIGN.md` table is the spec; **Paper canvas is
  regenerable docs downstream**, never authoritative (stated in `CLAUDE.md`).
- Check parity with **`/design-token-drift`** before committing a token/color
  change. The aurora uses `var(--accent)` via `color-mix`, so it follows the
  tokens — no new hard-coded palette colors (only warm gradient tints).
- Accent is RESOLVED: `--accent` `#e5484d` (light) / `#ff6369` (dark).

## Next steps

1. **Randy may swap the graphic** in the reveal area later ("might work on
   another type of graphic for that area, but it's good for now"). The
   mechanism is decoupled from the visual — only `.footer-reveal__aurora`'s
   background needs changing; the scroll/spring logic stays.
2. **Optional Motion/Lenis variant** still on the table for a buttery
   smooth-scroll rubber-band (the "option 1" Randy deferred). Would add the
   `motion` dep that `CLAUDE.md` already designates but isn't yet installed.
3. **Confirm the Vercel deploy** reached `randy.digital` (domain attach + DNS
   may have been pending — verify production + domain are green).
4. Voice on notes; portfolio/projects index; more lab experiments + island
   wrappers (`Sketch`/`Canvas`/`Playground`).

## Carried-forward context

- **Motion is NOT installed** yet (no `motion` in `package.json`) though
  `CLAUDE.md` names it as the project's motion lib. This session stayed
  zero-dep deliberately.
- Tuning knobs for the reveal: `--reveal-h` (travel distance); in
  `footer-reveal.tsx` `dur`/`120`ms idle/`easeOutCubic` (snap feel); aurora
  gradients + `blur(34px)` (look).
- Frontmatter parser (`app/notes/utils.ts`) is **custom, NOT real YAML**.
- Shared `Button` (`app/components/button.tsx`): polymorphic, icon leading.
- Serif body + drop cap were tried and **REJECTED** — body stays Geist Sans.
- Notes colophon (`app/notes/[slug]/page.tsx`): degree-driven contribution bar.
- `.claude/settings.local.json` + `.claude/current-task.txt` are gitignored.
- Dev server: `pnpm dev` on :3000. Running `pnpm build` while dev is up can
  disturb `.next` — restart dev after a build.

## Git state

- Branch `main` (tracks `origin/main`).
- This session's commit (footer aurora reveal): `app/components/footer-reveal.tsx`
  (new), `app/layout.tsx`, `app/global.css`, `HANDOFF.md`. Committed + pushed
  → triggers Vercel deploy.
