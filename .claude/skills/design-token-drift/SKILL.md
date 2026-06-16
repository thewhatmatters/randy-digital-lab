---
name: design-token-drift
description: Read-only checker that verifies the Paper "randy.digital" design canvas still matches the canonical code design tokens (the CSS custom properties in app/global.css, cross-checked against the DESIGN.md color table). Use to confirm design-system parity — "check design drift", "is Paper in sync with the code", "did the canvas drift from the tokens", "verify design tokens", "are the swatches still right" — and before committing a token/color change, after editing the accent or palette, or when reconnecting Paper Desktop. Code is the single source of truth; the Paper canvas is regenerable documentation downstream of it. Reports a drift table plus the fix direction (canvas ← code) and NEVER writes to code or canvas. v1 covers the six semantic color tokens (bg/surface/fg/muted/border/accent) across light and dark.
---

# design-token-drift

Read-only check that the Paper design canvas still matches the canonical code design tokens — reports drift, never writes.

## What it does

Compares the project's design tokens across three places — the CSS custom
properties in `app/global.css`, the `DESIGN.md` color table, and the swatches on
the Paper "randy.digital" canvas — and reports where they disagree. **Code is
canonical; the canvas is downstream documentation.** The only fix direction is
**canvas ← code**. This skill is a *detector*: it reads and reports, and never
edits code or the canvas. v1 scope is the six semantic color tokens
(`bg surface fg muted border accent`) × light/dark; see "Future extensions".

The generic core (parse CSS custom properties, compare values) lives in
`scripts/parse_tokens.py`. The randy-digital specifics (file paths, theme
selectors, canvas swatch structure) live in `references/randy-digital-profile.md`
— keep that seam clean so the skill can graduate to a user-level tool later.

## How to run

Say "check design drift", "is Paper in sync with the code?", "verify the design
tokens", or run `/design-token-drift`. Good moments: before committing a
token/color change, after editing the accent or palette, or when you reconnect
Paper Desktop.

## Flags

| Flag | Meaning |
|------|---------|
| `--agent` | non-interactive; no prompts/pauses (spec A7b/A9) |
| `--code-only` | skip the canvas side; run the headless code checks only |

(No `--out`: this is an inline checker — it prints a drift table, it does not
emit a file artifact. See handoff §4.)

## Hard guardrail — READ-ONLY

This skill MUST NOT modify anything. No `Edit`/`Write` on code, no
`update_styles`/`set_text_content`/`write_html`/`delete_nodes` on the canvas. If
drift is found it **names** the fix (canvas ← code) and stops. Applying a fix is
a separate, explicit action the user takes.

## Step 0 — Mode probe

`needs_scripts` is true. Probe `python3 --version`; if present use the script in
`scripts/` (SCRIPTS mode). Otherwise (NATIVE) read the same tokens with the
built-in file tools using the regexes documented in the profile.

## Steps

1. **Code side (headless, always runs).** Run
   `python3 scripts/parse_tokens.py --json` from the repo root (defaults:
   `--css app/global.css --design DESIGN.md`). It returns the light/dark token
   maps from CSS, the same from the DESIGN.md table, and any `css_doc_drift`.
   Report css↔doc mismatches first — they need no design tool.
2. **Canvas side (only if Paper is connected).** Call `get_basic_info`
   (`plugin:paper-desktop:paper`). If it fails / no file open → print the
   code-side result and mark the canvas side **"skipped — open Paper Desktop
   with the randy.digital file"**; do not error. If connected → **discover
   swatches by name** (see profile): find the `Swatches · Light` / `Swatches ·
   Dark` frames, then the child frames named `bg surface fg muted border
   accent`. For each, read (a) the swatch `Rectangle` fill via
   `get_computed_styles` and (b) the `--token: value;` declaration text. **Never
   hardcode node IDs** — the canvas may be restructured.
3. **Compare + report.** Three-way per token×theme: code vs canvas-fill vs
   canvas-declaration, **case-insensitive hex**. Print a table —
   `token | theme | code | fill | decl | verdict (✓ / DRIFT)` — and a one-line
   summary. On drift, state the direction (**canvas ← code**) and the exact
   value to set. Write nothing.

## Gotchas (encoded — these caused real bugs)

- **Derived states are NOT tokens.** `color-mix(...)` hover/tint colors (e.g.
  button `:hover` = `color-mix(in srgb, var(--accent) 88%, #000)`) follow
  `--accent` automatically. Do not flag them.
- **Dark accent `#ff6369` ≠ light `#e5484d` is intentional**, not drift. Compare
  light-to-light and dark-to-dark only.
- **Each swatch holds the value twice** — the rectangle fill AND the declaration
  text — with no binding. Check both; flag if they disagree with each other.
- **Hex compare is case-insensitive** (`#E5484D` == `#e5484d`).
- **Paper MCP is local-only**: it connects only when Paper Desktop is running
  with the file open. Absence is "skipped", never an error.

## Future extensions (NOT in v1)

Typography scale, spacing/radius tokens, and component-structure parity. Each is
a new comparator; the code-side parser and the profile are the seams to extend.

## Conventions this skill follows

- Spec is `~/.claude/skills/skill-architecture.md`.
- Scripts: JSON stdout / diagnostics stderr / graceful failure (spec A4).
- Project specifics live in `references/randy-digital-profile.md` (progressive
  disclosure, spec A1); the script's logic is generic.
