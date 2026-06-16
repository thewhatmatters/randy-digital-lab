# randy-digital profile

The project-specific bindings for `design-token-drift`. The script logic is
generic (parse CSS custom properties, compare); everything that ties it to *this*
repo and *this* canvas lives here. To reuse the skill on another project, copy
this file and change the values — the seam is deliberate.

## Source of truth

**Code is canonical.** The Paper canvas is regenerable documentation downstream
of it. The only fix direction is **canvas ← code**.

## Code side (headless)

| Thing | Value |
|---|---|
| Token file | `app/global.css` |
| Light selector | `:root { … }` — the block that contains `--bg` (NOT the `@media` `:root` grid blocks) |
| Dark selector | `[data-theme='dark'] { … }` |
| Tokens (v1) | `--bg --surface --fg --muted --border --accent` |
| Doc table | `DESIGN.md` color table: `\| \`token\` \| \`#light\` \| \`#dark\` \| usage \|` |

Notes:
- The `@theme { --color-*: var(--*) }` block is indirection, not values — it
  never matches the token regex, so it's ignored automatically.
- Run `python3 scripts/parse_tokens.py --json` from the repo root.

## Canvas side (Paper "randy.digital")

MCP: `plugin:paper-desktop:paper` — **local only**, connects when Paper Desktop
is open with the `randy.digital` file. Absence = "skipped", never an error.

Discover swatches **by name/structure, never by hardcoded node IDs** (the canvas
may be restructured — e.g. Components moved to its own page):

1. Find the `Swatches · Light` and `Swatches · Dark` frames (under the Color
   section). Use `get_tree_summary` / `get_children` to locate them by name.
2. Under each, the child frames are named `bg surface fg muted border accent`.
3. Per swatch, read **both** value carriers (they are independent, unbound):
   - the `Rectangle` fill → `get_computed_styles` → `backgroundColor`
   - the declaration text node `--token: value;` → parse the hex after `:`

## What is NOT drift (do not flag)

- **Derived states** — `color-mix(...)` hover/tint colors. They follow
  `--accent`; they are not tokens. (See the canvas "Derived states" note and
  `app/global.css` `.btn--accent:hover`.)
- **Dark accent `#ff6369` vs light `#e5484d`** — intentional per-theme values.
  Compare light↔light and dark↔dark only.

## Comparison rule

Three-way per token×theme: **code vs canvas-fill vs canvas-declaration**,
case-insensitive hex. Any mismatch → DRIFT, fix direction **canvas ← code**.
