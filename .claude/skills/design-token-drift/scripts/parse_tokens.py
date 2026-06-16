#!/usr/bin/env python3
"""Extract design color tokens from CSS + the DESIGN.md table and compare them
(spec A4). Generic core: parses CSS custom properties; the randy-digital paths
and selectors are defaults that match references/randy-digital-profile.md.

READ-ONLY. Reads files, writes nothing. Code is canonical; this only reports.

I/O: stdout JSON · stderr human board · exit 0 always (read-only), exit 1 only
on its own failure to read an input file.
"""
import argparse
import json
import re
import sys

# The six semantic tokens this checker covers (v1 = colors).
TOKENS = ["bg", "surface", "fg", "muted", "border", "accent"]
TOKEN_RE = re.compile(
    r"--(" + "|".join(TOKENS) + r")\s*:\s*([^;]+);"
)


def _blocks(css, selector):
    """Yield the inner text of every `selector { ... }` block, brace-matched so
    nested blocks (e.g. @media wrapping :root) don't confuse the boundaries."""
    needle = selector + " {"
    i = 0
    while True:
        start = css.find(needle, i)
        if start == -1:
            return
        j = start + len(needle)
        depth = 1
        while j < len(css) and depth:
            c = css[j]
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
            j += 1
        yield css[start + len(needle): j - 1]
        i = j


def _tokens_from_block(block):
    out = {}
    for name, val in TOKEN_RE.findall(block):
        out[name] = val.strip().lower()
    return out


def parse_css(path):
    """Return {'light': {...}, 'dark': {...}}. Light = the :root block that
    actually contains --bg (skips the @media :root grid blocks); dark = the
    [data-theme='dark'] block. The @theme `--color-*: var(--*)` indirections
    never match TOKEN_RE, so they're ignored automatically."""
    css = open(path, encoding="utf-8").read()
    light = {}
    for blk in _blocks(css, ":root"):
        toks = _tokens_from_block(blk)
        if "bg" in toks:  # the real palette block, not @media grid-margin
            light = toks
            break
    dark = {}
    for blk in _blocks(css, "[data-theme='dark']"):
        toks = _tokens_from_block(blk)
        if toks:
            dark = toks
            break
    return {"light": light, "dark": dark}


_ROW_RE = re.compile(
    r"\|\s*`(" + "|".join(TOKENS) + r")`\s*\|\s*`?(#[0-9a-fA-F]{3,8})`?\s*"
    r"\|\s*`?(#[0-9a-fA-F]{3,8})`?\s*\|"
)


def parse_design(path):
    """Parse the DESIGN.md color table rows `| `token` | `#light` | `#dark` |`."""
    light, dark = {}, {}
    try:
        text = open(path, encoding="utf-8").read()
    except OSError:
        return {"light": {}, "dark": {}, "_missing": True}
    for name, lt, dk in _ROW_RE.findall(text):
        light[name] = lt.strip().lower()
        dark[name] = dk.strip().lower()
    return {"light": light, "dark": dark}


def diff(css, doc):
    """css↔doc drift, case-insensitive (values already lowercased)."""
    out = []
    for theme in ("light", "dark"):
        for tok in TOKENS:
            c = css.get(theme, {}).get(tok)
            d = doc.get(theme, {}).get(tok)
            if c is not None and d is not None and c != d:
                out.append({"token": tok, "theme": theme, "css": c, "doc": d})
    return out


def main():
    ap = argparse.ArgumentParser(description="Design color-token drift (code side).")
    ap.add_argument("--css", default="app/global.css")
    ap.add_argument("--design", default="DESIGN.md")
    ap.add_argument("--json", action="store_true", help="(default output is JSON)")
    args = ap.parse_args()

    try:
        css = parse_css(args.css)
    except OSError as e:
        print(f"design-token-drift: cannot read CSS {args.css}: {e}", file=sys.stderr)
        sys.exit(1)
    doc = parse_design(args.design)
    css_doc_drift = diff(css, doc)

    missing = [t for t in TOKENS if t not in css.get("light", {})] + \
              [t + "(dark)" for t in TOKENS if t not in css.get("dark", {})]

    # human board → stderr
    print("design-token-drift · code side", file=sys.stderr)
    for theme in ("light", "dark"):
        vals = " ".join(f"{t}={css[theme].get(t, '?')}" for t in TOKENS)
        print(f"  css {theme:<5} {vals}", file=sys.stderr)
    if doc.get("_missing"):
        print("  doc   DESIGN.md not found — css↔doc check skipped", file=sys.stderr)
    print(f"  css↔doc drift: {len(css_doc_drift)}", file=sys.stderr)
    if missing:
        print(f"  ⚠ tokens not found: {', '.join(missing)}", file=sys.stderr)

    print(json.dumps({
        "tokens": TOKENS,
        "css": css,
        "doc": {k: v for k, v in doc.items() if k != "_missing"},
        "design_md_found": not doc.get("_missing", False),
        "css_doc_drift": css_doc_drift,
        "missing_in_css": missing,
    }, indent=2))


if __name__ == "__main__":
    main()
