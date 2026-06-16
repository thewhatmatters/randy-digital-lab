# Handoff — randy-digital

_Updated 2026-06-16 · session: built the note **"Credits" colophon**
(co-author attribution + degree-driven contribution bar), **resolved the accent
to `#e5484d`** across code + Paper canvas, mirrored the colophon onto the Paper
design-system canvas, made the swatches show `--token: value` declarations + a
"Derived states" note, added a read-only **`design-token-drift`** skill, and
committed + pushed to deploy._

## Goal

Rebuild Randy's personal site (Next.js App Router + Tailwind v4): **portfolio**,
**MDX notes**, and a **lab** of interactive experiments. Built on the Vercel
portfolio-starter-kit; leans on skills + the **Paper Desktop** design-canvas MCP.

## Source of truth (important)

- **Code is canonical** for design tokens — `app/global.css` `:root` (light) +
  `[data-theme='dark']` (dark), with the `DESIGN.md` table as the spec. The
  **Paper canvas is regenerable documentation downstream**, never authoritative.
  (Now stated in `CLAUDE.md`.)
- Check parity with **`/design-token-drift`** (read-only skill) before committing
  a token/color change. It parses the CSS tokens + DESIGN.md table (headless),
  and — when Paper is open — three-way compares code vs swatch fill vs the
  swatch's `--token: value;` declaration. Never writes.
- The accent demo is **RESOLVED**: `--accent` is `#e5484d` (light) / `#ff6369`
  (dark) everywhere — code, DESIGN.md, and every Paper accent node. No pending
  magenta.

## Current state

- **Git:** branch `main`. New commits this session:
  - `18eab0a` — note colophon + co-author attribution
  - `61b5605` — design-token-drift skill + code-canonical token rule
  - (+ this handoff) then pushed to `origin/main` → triggers Vercel deploy.
- **Build:** `pnpm build` green (10 routes).
- **Notes colophon** (`app/notes/[slug]/page.tsx`): `CREDITS` eyebrow + byline
  (from `authors` frontmatter) + a **degree-driven** contribution split bar
  (from `aiDegree`, via `humanSharePct()` — NOT a measured %). Title + date are
  grouped in one `<header>` so the 24px grid baseline rhythm sits between header
  and body. JSON-LD: author = Person, Claude = `SoftwareApplication` contributor.
  First note frontmatter: authors `Randy Daniel` / `Claude · Opus 4.8`; aiDegree
  `Co-written with Claude`.
- **Paper "randy.digital" file** (MCP is LOCAL — only connects when Paper Desktop
  is open with the file): Design System page now has the **Colophon** component
  (under `03 · Components`), swatches read `--token: value;` (mirror of the
  `:root` / dark blocks), a **"Derived states"** note documenting the `color-mix`
  recipes (e.g. button `:hover = color-mix(in srgb, var(--accent) 88%, #000)`),
  and every accent node is red `#e5484d`.

## Next steps

1. **Confirm the Vercel deploy reached `randy.digital`** — older notes said the
   domain attach + DNS may still be pending (Settings → Domains). Verify the
   production deployment + domain are green.
2. Voice on notes; portfolio/projects index; more lab experiments + island
   wrappers (`Sketch`/`Canvas`/`Playground`).
3. `design-token-drift` v2: extend beyond colors to typography/spacing/components.

## Carried-forward context

- Frontmatter parser (`app/notes/utils.ts`) is **custom, NOT real YAML** —
  supports `authors`/`stack` indented block lists + `aiDegree`/`ctaLabel`/
  `ctaHref` scalars.
- Shared `Button` (`app/components/button.tsx`): polymorphic, icon leading.
- Serif body + drop cap were tried and **REJECTED** — body stays Geist Sans.
- Remotion is its own framework (remotion.dev), NOT a Claude skill.
- `.claude/settings.local.json` + `.claude/current-task.txt` are gitignored;
  `__pycache__/`/`*.pyc` now gitignored too.

## Git state

- Branch `main` (tracks `origin/main`). Pushed this session.
- Working tree clean after the handoff commit.
