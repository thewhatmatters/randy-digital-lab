// Em-dash budget gate (T-010) — holds reader-facing copy at ZERO em dashes
// (U+2014) so the density can never creep back (Randy's call, 2026-08-12:
// however well one dash reads, the density is an AI-writing tell).
//
// Two families, mirroring the ticket's ACs:
//
// 1. MDX content (AC 1–2): every app/**/*.mdx — notes, work projects, and
//    anything added later — is scanned by glob with zero tolerance,
//    frontmatter included. No allowlist applies to MDX.
// 2. Reader-visible UI strings (AC 3–4): the enumerated string-site files
//    are scanned with code comments stripped (comments are out of scope —
//    no reader attributes them to the author) and an explicit (file,
//    pattern) allowlist for the surviving typographic separators:
//    title-pattern separators and image aria/alt labels (AC 4a–b).
//    app/components/code-window.tsx is a FILE-level carve-out (AC 4c): its
//    display strings depict code comments and follow them out of scope.
//
// Adding a new em dash anywhere in scope fails this test. The fix is to
// re-punctuate the sentence in the site's voice (colon, comma, period,
// parentheses — see .sagan/tickets/T-010/ticket.md). Only a genuinely
// typographic separator (a title template, an image alt/aria label) may
// instead be added to the allowlist below, deliberately, with a reason.
//
// Comment stripping is a small state machine, not a TS parser: it tracks
// line/block comments and '/"/` strings. Known limit: a straight apostrophe
// in bare JSX text would open a bogus string state — the scanned files use
// curly quotes in JSX text, and the stale-allowlist test below plus the
// mutation proof (.sagan/ledger/T-010/) keep the scanner honest.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const EM_DASH = '—'
const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Recursively collect every file under dir. */
function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

/** 1-based line numbers of every line containing an em dash. */
function emDashLines(source: string): { line: number; text: string }[] {
  return source
    .split('\n')
    .map((text, i) => ({ line: i + 1, text }))
    .filter(({ text }) => text.includes(EM_DASH))
}

/**
 * Blank out // and /* *\/ comment contents while preserving string literals
 * and newlines (so line numbers in reports stay true to the file).
 */
function stripComments(source: string): string {
  let out = ''
  let i = 0
  type State = 'code' | 'line' | 'block' | 'single' | 'double' | 'template'
  let state: State = 'code'
  while (i < source.length) {
    const ch = source[i]
    const next = source[i + 1]
    if (state === 'code') {
      if (ch === '/' && next === '/') {
        state = 'line'
        i += 2
      } else if (ch === '/' && next === '*') {
        state = 'block'
        i += 2
      } else {
        if (ch === "'") state = 'single'
        else if (ch === '"') state = 'double'
        else if (ch === '`') state = 'template'
        out += ch
        i += 1
      }
    } else if (state === 'line') {
      if (ch === '\n') {
        state = 'code'
        out += ch
      }
      i += 1
    } else if (state === 'block') {
      if (ch === '*' && next === '/') {
        state = 'code'
        i += 2
      } else {
        if (ch === '\n') out += ch
        i += 1
      }
    } else {
      // Inside a string literal: honor escapes, close on the matching quote.
      if (ch === '\\') {
        out += ch + (next ?? '')
        i += 2
        continue
      }
      if (
        (state === 'single' && ch === "'") ||
        (state === 'double' && ch === '"') ||
        (state === 'template' && ch === '`')
      ) {
        state = 'code'
      }
      out += ch
      i += 1
    }
  }
  return out
}

// ── AC-3 string sites + AC-4 carve-out hosts (repo-relative) ────────────────
// The carve-out hosts are scanned too: a NEW em dash there, outside its
// allowlisted pattern, still fails.
const stringSites = [
  'app/layout.tsx',
  'app/notes/page.tsx',
  'app/work/page.tsx',
  'app/lab/page.tsx',
  'app/lab/experiments.tsx',
  'app/components/command-bar.tsx',
  'app/components/design-canvas.tsx',
  'app/components/work-carousel.tsx',
  'app/components/work-detail.tsx',
  // AT-visible SVG <desc> (amendment r1.1) — no allowlist entry: scans clean.
  'app/components/sagan-loop.tsx',
  // NOT listed: app/components/code-window.tsx — file-level carve-out (AC 4c).
]

// ── AC-4 allowlist: every surviving em dash, as explicit (file, pattern) ────
// pairs. A future legitimate separator must be added here on purpose.
const allowlist: { file: string; pattern: RegExp; why: string }[] = [
  {
    file: 'app/layout.tsx',
    pattern: /'%s — randy\.digital'/,
    why: 'metadata title template separator (AC 4a)',
  },
  {
    file: 'app/components/design-canvas.tsx',
    pattern: /'Design System — randy\.digital'/,
    why: 'depicted canvas node label, title-pattern separator (AC 4a)',
  },
  {
    file: 'app/components/work-carousel.tsx',
    pattern: /\$\{title\} — image \$\{i \+ 1\} of \$\{count\}/,
    why: 'slide alt-text separator (AC 4b)',
  },
  {
    file: 'app/components/work-carousel.tsx',
    pattern: /aria-label=\{`\$\{title\} — images`\}/,
    why: 'carousel region aria-label separator (AC 4b)',
  },
  {
    file: 'app/components/work-detail.tsx',
    pattern: /`Visit site — \$\{title\} \(opens in a new tab\)`/,
    why: 'visit-site aria-label separator (AC 4b)',
  },
]

describe('em-dash budget (T-010) — MDX content, zero tolerance', () => {
  const mdxFiles = walk(path.join(repoRoot, 'app')).filter((file) =>
    file.endsWith('.mdx')
  )

  it('the glob still sees the content (guard against a silently empty scan)', () => {
    const rel = mdxFiles.map((f) => path.relative(repoRoot, f))
    assert.ok(
      rel.some((f) => f.startsWith(path.join('app', 'notes', 'posts'))),
      'no notes found under app/notes/posts — the scan is broken, not the copy'
    )
    assert.ok(
      rel.some((f) => f.startsWith(path.join('app', 'work', 'projects'))),
      'no projects found under app/work/projects — the scan is broken, not the copy'
    )
  })

  it('every app/**/*.mdx is em-dash-free, frontmatter included (AC 1–2)', () => {
    const violations: string[] = []
    for (const file of mdxFiles) {
      for (const { line, text } of emDashLines(fs.readFileSync(file, 'utf8'))) {
        violations.push(
          `${path.relative(repoRoot, file)}:${line}: ${text.trim()}`
        )
      }
    }
    assert.deepEqual(
      violations,
      [],
      `em dash in MDX content (budget is zero — re-punctuate the sentence,` +
        ` never swap in "--" or " - "):\n${violations.join('\n')}`
    )
  })
})

describe('em-dash budget (T-010) — reader-visible UI strings vs allowlist', () => {
  it('the enumerated string sites carry no em dash outside the AC-4 allowlist (AC 3)', () => {
    const violations: string[] = []
    for (const site of stringSites) {
      const full = path.join(repoRoot, site)
      const original = fs.readFileSync(full, 'utf8').split('\n')
      const stripped = stripComments(original.join('\n')).split('\n')
      stripped.forEach((strippedLine, i) => {
        if (!strippedLine.includes(EM_DASH)) return // comments are out of scope
        const originalLine = original[i]
        const allowed = allowlist.some(
          (entry) => entry.file === site && entry.pattern.test(originalLine)
        )
        if (!allowed) {
          violations.push(`${site}:${i + 1}: ${originalLine.trim()}`)
        }
      })
    }
    assert.deepEqual(
      violations,
      [],
      `em dash in a reader-visible string outside the allowlist —` +
        ` re-punctuate it, or (typographic separators ONLY) add a deliberate` +
        ` allowlist entry in this file:\n${violations.join('\n')}`
    )
  })

  it('every allowlist entry still matches its file (no stale carve-outs)', () => {
    for (const entry of allowlist) {
      const source = fs.readFileSync(path.join(repoRoot, entry.file), 'utf8')
      assert.ok(
        entry.pattern.test(source),
        `stale allowlist entry — ${entry.file} no longer matches` +
          ` ${entry.pattern} (${entry.why}); remove or update the entry`
      )
    }
  })

  it('the AC-4c file-level carve-out still exists where the allowlist expects it', () => {
    // code-window.tsx is deliberately unscanned; if it moves or goes away,
    // this gate should be revisited rather than silently narrowing.
    assert.ok(
      fs.existsSync(path.join(repoRoot, 'app/components/code-window.tsx')),
      'app/components/code-window.tsx moved or was deleted — update the T-010 gate'
    )
  })
})
