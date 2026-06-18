# Handoff — randy-digital

_Updated 2026-06-17 (session 3) · Reworked the footer overscroll reveal from a
single-accent equalizer into a **full-bleed rainbow "aurora" equalizer** (the
diabrowser.com / Browser Company footer look), token-driven and tuned live with
Randy. Also wrote a second note (Figma→Paper) earlier this session. Drift check
clean; about to commit the aurora CSS._

## Goal

Rebuild Randy's personal site (Next.js App Router + Tailwind v4): **portfolio**,
**MDX notes**, and a **lab** of interactive experiments. Built on the Vercel
portfolio-starter-kit; leans on skills + the **Paper Desktop** design-canvas MCP.

## This session

### 1. Second note — "Figma to Paper" (DONE, committed `8277452`)

- `app/notes/posts/figma-to-paper.mdx` — slug `/notes/figma-to-paper`. Angle:
  the **Design Engineer** identity shift (Randy is both sides of the handoff now,
  so a handoff-shaped tool = ceremony) + Figma getting heavy/stale, vs Paper
  speaking HTML/CSS, lighter, Claude-drivable, canvas downstream of code.
- Title: _"Design Engineer: the day Figma stopped fitting."_ Colophon: Randy
  (direction/editing/final call) + Claude Opus 4.8 (drafting/research),
  `aiDegree: 'Co-written with Claude'`. Verified renders + indexes.
- Also dropped the now-unused `stack` frontmatter from `building-conan.mdx` (its
  right rail keeps the CTA — renderer is conditional, nothing broke).
- **Reminder learned:** slug = filename (`utils.ts` `path.basename`); `title` is
  display-only. They intentionally differ; keep slugs short/stable.

### 2. Footer rainbow aurora (DONE pending commit — `app/global.css` only)

Replaced the single-accent equalizer fill with a **vertical rainbow gradient per
bar + blur**, reusing the EXISTING velocity/`--p` machine in
`app/components/footer-reveal.tsx` **unchanged** (interaction decoupled from
visual, exactly as the prior handoff predicted). The reference was the Browser
Company footer — stepped columns + arc envelope + heavy blur = our equalizer, so
this was done in **CSS, not Paper Shaders** (shader plan parked; the ref is
stepped columns, not a flowing mesh).

**Final settled look (after several live tuning rounds with Randy):**
- **Full-bleed** — bars run edge-to-edge (Randy A/B'd grid-contained vs
  full-bleed and **chose full-bleed**). Panel `max-width: none`.
- **`--aurora-blur: 6px`** — crisp distinct steps + soft glow. (Tried 40→22→10→6;
  Randy kept saying "too soft." NOTE: Playwright screenshots render at 2× DPI so
  they look crisper than his display — trust his eye, go lower than a screenshot
  suggests.)
- **`--aurora-overflow: 24px`** — panel `bottom: calc(-1 * var(--aurora-overflow))`
  pushes the bars' solid bottoms below the fold so the blurred bottom bleeds
  off-screen instead of ending on a **hard horizontal cut** (Randy flagged this).
  `panel.offsetHeight` unchanged → JS lift math (MAX = panel height) unaffected.
- **Palette** — literal rainbow (Randy's pick over an on-brand accent ramp):
  `--aurora-1..6` = `#2756f0 #5ea0ff #ffe06a #ff9d3c #ff4d6a #ff35e0` (blue
  bottom → magenta top). Top gradient stop `transparent` so the blurred crest
  fades. `scaleY(var(--p))` compresses the spectrum at low push (≈1px/color seam)
  → blooms to full arc — the "retract/grow" Randy wanted, for free.

All CSS in `app/global.css`: `--aurora-*` tokens (next to `--reveal-h`),
`.footer-bloom__panel` (blur + negative bottom + full-bleed), `.footer-bloom__bar`
(rainbow fill). Comments note how to flip back to grid-contained (add
`max-width:var(--grid-maxw)` + `margin-inline:auto` + `padding-inline`).

**Verified** via headless Chromium (installed in `/tmp/pw`, NOT a project dep):
forced peak state light + dark, panel width 1680=full-bleed, `blur(6px)`,
`bottom:-24px`. Looks right both themes.

### 3. Drift check (DONE — clean)

`/design-token-drift`: **12/12 ✓**, code↔doc↔canvas in sync for the six semantic
tokens. The aurora is all-new `--aurora-*` tokens, so the semantic palette never
moved.

## ⚠️ Turbopack CSS HMR gotcha (cost real time this session)

Next 16 Turbopack dev **reliably hot-reloads `--token` value changes but DROPS
rule-body edits** to `.footer-bloom*` selectors (saw it 3×: edits on disk but
served CSS stale → a muddy red blob, then a `bottom:0` that should've been
`-24px`). **Fix: after editing `.footer-bloom` *rules* (not just tokens), bounce
dev:** `pkill -f "next dev"; rm -rf .next/dev; pnpm dev`. Token-only nudges HMR
fine.

## Source of truth (unchanged)

- **Code is canonical.** `app/global.css` `:root` (light) + `[data-theme='dark']`
  (dark); `DESIGN.md` is the spec; **Paper canvas is regenerable docs downstream**.
- The aurora is an **intentional** departure from the accent-only rule, made
  canonical via `--aurora-*` tokens. Run `/design-token-drift` before palette
  changes.

## Next steps

1. **Paper canvas is now STALE vs the rainbow aurora.** The "Footer · reveal"
   component (Design System page → `03 · Components`, artboard `1O-0`) still shows
   the OLD single-accent equalizer. Drift v1 is colors-only so it can't flag
   component parity — but per code-canonical rule the canvas should be refreshed
   to a dark full-bleed rainbow peak frame + a note that `--aurora-*` are new
   tokens. (Paper drops `%` heights + `flex` shorthand — set explicit px on bars.)
2. **Tuning knobs still open** (single tokens in `global.css`): `--aurora-blur`
   (4 = harder bars / 8–10 = softer), `--aurora-overflow` (bump to 32–40 if a hard
   edge peeks at the very bottom), the six `--aurora-N` stops. Randy settled at
   6px / 24px / literal rainbow.
3. **Confirm the Vercel deploy** reached `randy.digital` (domain/DNS may be
   pending from earlier sessions).
4. Voice on notes; portfolio/projects index; more lab experiments + island
   wrappers (`Sketch`/`Canvas`/`Playground`).
5. Paper Shaders footer remains a possible FUTURE "grainier" variant, but the CSS
   aurora matches the reference and is what shipped.

## Carried-forward context

- Frontmatter parser (`app/notes/utils.ts`) is **custom, NOT real YAML**.
- Serif body + drop cap were tried and **REJECTED** — body stays Geist Sans.
- Playwright is NOT a project dep; this session's headless browser lives in
  `/tmp/pw` (ephemeral). `automate-browser` skill is the sanctioned path.
- `.claude/settings.local.json` + `.claude/current-task.txt` are gitignored.

## Git state

- Branch `main` (tracks `origin/main`). This session committed + pushed the note
  (`8277452`) and a prior handoff refresh (`ae44432`).
- **Uncommitted before this commit:** `M app/global.css` (rainbow aurora) +
  `M HANDOFF.md` (this file) — committing + pushing now.
