# Handoff — randy-digital

_Updated 2026-06-16 (session 2) · built the **footer "equalizer" overscroll
reveal** — the sui.io / diabrowser.com "push past the footer" effect — as a
zero-dependency, grid-aligned, velocity-driven component. Iterated through
several models with Randy's live feedback to the final look; verified in a real
browser (light + dark, short + long pages); committing + pushing to deploy._

## Goal

Rebuild Randy's personal site (Next.js App Router + Tailwind v4): **portfolio**,
**MDX notes**, and a **lab** of interactive experiments. Built on the Vercel
portfolio-starter-kit; leans on skills + the **Paper Desktop** design-canvas MCP.

## This session — footer overscroll reveal (DONE, final)

Goal: replicate the Dia/Sui "scroll past the footer → a gradient reveals and
springs back." Researched both live first (Sui = Lenis + GSAP + fixed
`canvas-wrapper`; Dia = blurred radial-gradient in an overscroll zone). Landed —
after several corrections from Randy — on this **final design**:

**Interaction (zero-dep, no scroll hijacking):**
- The page scrolls NORMALLY and rests at the footer's bottom edge. Earlier
  attempts that added real scroll height + snapped `scrollTop` back were
  rejected ("doesn't even scroll to the footer edge") — DON'T reintroduce that.
- The effect engages ONLY when already at the bottom and you keep pushing
  (`wheel`/`touchmove`). It lifts `<main>` up via a **transform** (no scroll
  distance), uncovering a fixed panel pinned behind it, and carries the footer's
  `© <year>` up with it. Releasing springs the lift back to 0.
- **Velocity-driven + hold:** a `pull → hold → release` state machine. Smoothed,
  normalized scroll velocity → lift, RATCHETING up to the peak (harder push =
  more). When input stops it DWELLS at the peak `HOLD_MS` (260ms) before the
  spring releases. Verified: gentle ≈ 32px, hard ≈ full.
- `overscroll-behavior-y: none` on `html` suppresses the native rubber-band.

**Visual — grid-aligned "equalizer" arc (the look Randy loved, from Sui):**
- A fixed `.footer-bloom` panel (height `--reveal-h` = 46vh) mirrors `grid-page`:
  centered, `max-width: var(--grid-maxw)` (72rem), `padding-inline:
  var(--grid-margin)`, `grid-template-columns: repeat(var(--grid-cols), 1fr)`.
  So the bars fall ON the grid columns, NOT full-viewport-width.
- 12 accent gradient bars (`BARS = [39,57,73,86,95,99,99,95,86,73,57,39]`) — a
  symmetric raised half-sine: **center columns peak, taper to the edges**. The
  JS sets `--p` (0→1) and the bars `scaleY(var(--p))`, so the whole arc grows
  with scroll velocity and the center bar reaches the top at a hard push.
- `MAX` lift = `panel.offsetHeight` (measured, re-measured on resize) so at peak
  velocity the gap reveals the WHOLE panel and the center bar (~99%) tops out.
- Bars are pure accent (`var(--accent)` → `transparent` up top). Rejected along
  the way: **film grain** (read as "gray" — removed) and **dotted column guides**
  (the "gray lines between columns" — removed; `--bloom-guide` token deleted).

**Files:**
- `app/components/footer-reveal.tsx` — NEW `'use client'` island. Grabs `<main>`
  via `document.querySelector('main')`, runs the velocity state machine, sets
  `main.style.transform` + the panel's `--p`/`opacity`. Renders the 12-bar grid.
  Skips entirely under `prefers-reduced-motion` (footer is then just normal).
- `app/layout.tsx` — `<FooterReveal />` is a sibling BEFORE `<main>`; `<main>` is
  `relative z-[1] bg-bg` (opaque surface covering the bloom) wrapping a
  `min-h-[100dvh]` flex column (Navbar / `flex-auto` children / Footer) so the
  footer sits at the bottom on short pages too.
- `app/global.css` — `.footer-bloom` / `__panel` / `__col` / `__bar`;
  `--reveal-h: 46vh` (+ 42vh mobile @640); `overscroll-behavior-y: none` on html.
- `app/components/footer.tsx` — UNCHANGED net (the © line stayed in the footer;
  a mid-session "move © into the bloom" was reverted).

**Verified live** (automate-browser / Playwright): rests at true bottom
(`scrollTop == max`, `main.transform: none`, © visible); overscroll lifts +
reveals the arc; springs back to 0; arc peaks center in both themes;
`pnpm build` green.

## Source of truth (unchanged)

- **Code is canonical** for design tokens — `app/global.css` `:root` (light) +
  `[data-theme='dark']` (dark); `DESIGN.md` is the spec; **Paper canvas is
  regenerable docs downstream**. The bloom uses `var(--accent)` only — no new
  hard-coded palette colors. Accent: `#e5484d` light / `#ff6369` dark.
- Run **`/design-token-drift`** before committing a token/color change.

## Next steps

1. **Optional polish on the bloom** (Randy is happy with it as-is): per-bar live
   animation/jitter while revealed; tune arc steepness via `BARS`, `HOLD_MS`,
   `GAIN`, or `--reveal-h`. Randy floated "another type of graphic for that area"
   earlier — the interaction is decoupled from the visual (only `.footer-bloom`
   markup/CSS changes).
2. **Motion/Lenis variant** still deferred (Randy chose zero-dep). `CLAUDE.md`
   designates `motion` but it's NOT installed.
3. **Confirm the Vercel deploy** reached `randy.digital` (domain attach + DNS may
   have been pending).
4. Voice on notes; portfolio/projects index; more lab experiments + island
   wrappers (`Sketch`/`Canvas`/`Playground`).

## Carried-forward context

- Frontmatter parser (`app/notes/utils.ts`) is **custom, NOT real YAML**.
- Serif body + drop cap were tried and **REJECTED** — body stays Geist Sans.
- Running `pnpm build` while `pnpm dev` is up can disturb `.next` — restart dev
  after a build (did so this session).
- `.claude/settings.local.json` + `.claude/current-task.txt` are gitignored.

## Git state

- Branch `main` (tracks `origin/main`).
- This session's commit: `app/components/footer-reveal.tsx` (new),
  `app/layout.tsx`, `app/global.css`, `HANDOFF.md`. (`footer.tsx` net-unchanged.)
  Committed + pushed → triggers Vercel deploy.
