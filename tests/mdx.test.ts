// Parser contract tests for the shared MDX data layer (lib/mdx.ts) and the
// two pipelines that consume it (app/notes/utils.ts, app/work/utils.ts).
// T-003 AC 1 pinned the original frontmatter contract; T-006 deepened it and
// this file migrated with it (2026-08-11):
//
// - REPLACED (deliberately): the T-003 pins of the raw-pair quirk — a bare
//   block item (no ": ") returning {label, value: ''}, and the colon-path
//   rejoin through work's itemToPath shim. Those tests pinned an accident the
//   work pipeline had to invert; T-006 makes bare items parse as plain
//   strings natively and DELETED the shim, so the quirk pins are replaced by
//   string-list contract pins below. An image path containing ": " is now a
//   named validation error instead of a silent mangle-and-rejoin.
// - REPLACED: the [thumbnail] fallback pin for a project with no images —
//   the work validation floor now requires images (≥1), so the fallback is
//   gone and the no-images case is an error-contract test.
// - NEW families (one deliberate mutation demonstrated per family,
//   transcripts in .sagan/ledger/T-006/qabuild/):
//   1. error contract        — ContentFileError, filename asserted in every
//                              message (mutation: drop the path from the
//                              message)
//   2. validation floor      — per-pipeline required-field lists (mutation:
//                              remove 'summary' from the notes schema)
//   3. string lists + issues — bare items as strings; skips are reported
//                              (mutation: bare item back to {label, value:''})
//   (4. date agreement lives in tests/dates.test.ts with lib/dates.ts.)
//
// Seam notes (unchanged from T-003):
// - parseFrontmatter is pure — tested directly with inline strings. Since
//   T-006 it returns null for missing frontmatter (never throws) and carries
//   a ParseIssue[] alongside the metadata.
// - getBlogPosts/getWorkProjects hard-code `path.join(process.cwd(), ...)`,
//   so process.cwd() IS the seam: pipeline tests stub it (t.mock.method,
//   auto-restored per test) at a hermetic fixture root. Error-contract tests
//   drive getMDXData directly at tests/fixtures/errors/ dirs instead — the
//   throwing layer takes a plain dir path, no cwd needed.
// - One non-hermetic block ("real content contract") runs against the real
//   content dirs — it pins that all shipped content passes the floor and
//   keeps the thumbnail-first convention the tile→modal morph depends on.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseFrontmatter,
  getMDXData,
  ContentFileError,
  type ContentSchema,
  type MetaItem,
} from 'lib/mdx'
import { getWorkProjects } from 'app/work/utils'
import { getBlogPosts } from 'app/notes/utils'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const fixtureSiteRoot = path.join(testDir, 'fixtures', 'site')
const errorFixtures = (name: string) =>
  path.join(testDir, 'fixtures', 'errors', name)
const floorRoot = (name: string) => path.join(testDir, 'fixtures', 'floor', name)

/** Wrap a frontmatter block in the --- fences the parser expects. */
const md = (front: string, body = 'Body.') => `---\n${front}\n---\n\n${body}\n`

/** Parse and assert a frontmatter block was found (null = no fence pair). */
function parse<T>(source: string) {
  const parsed = parseFrontmatter<T>(source)
  assert.ok(parsed, 'expected a frontmatter block to parse')
  return parsed
}

/** The notes-shaped floor, for driving getMDXData directly in error tests. */
const basicSchema: ContentSchema = {
  title: 'scalar',
  publishedAt: 'date',
  summary: 'scalar',
}

/** Assert fn throws a ContentFileError whose message names file + problem. */
function assertContentFileError(
  fn: () => unknown,
  filename: string,
  problem: RegExp
) {
  assert.throws(fn, (error: unknown) => {
    assert.ok(
      error instanceof ContentFileError,
      `expected ContentFileError, got ${String(error)}`
    )
    assert.equal(error.name, 'ContentFileError')
    assert.match(error.message, new RegExp(filename.replace('.', '\\.')))
    assert.match(error.message, problem)
    assert.ok(error.filePath.endsWith(filename))
    return true
  })
}

describe('parseFrontmatter — scalar values', () => {
  it('strips matching single quotes and keeps internal punctuation (colon, em dash, ASCII double quotes)', () => {
    const { metadata } = parse<{ title: string }>(
      md(`title: 'Dashboard Confessional: I built one — with "quotes" inside'`)
    )
    assert.equal(
      metadata.title,
      'Dashboard Confessional: I built one — with "quotes" inside'
    )
  })

  it('keeps curly apostrophes and smart quotes inside a single-quoted scalar', () => {
    const { metadata } = parse<{ summary: string }>(
      md(`summary: 'I’d “actually” want to stare at it'`)
    )
    assert.equal(metadata.summary, 'I’d “actually” want to stare at it')
  })

  it('strips matching double quotes', () => {
    const { metadata } = parse<{ title: string }>(md(`title: "Plain title"`))
    assert.equal(metadata.title, 'Plain title')
  })

  it('passes unquoted scalars through verbatim (dates, URLs containing colons)', () => {
    const { metadata } = parse<{
      publishedAt: string
      liveUrl: string
    }>(md(`publishedAt: 2026-08-10\nliveUrl: https://knav.app`))
    assert.equal(metadata.publishedAt, '2026-08-10')
    assert.equal(metadata.liveUrl, 'https://knav.app')
  })

  it('returns the body with the frontmatter block removed and trimmed', () => {
    const { content, metadata } = parse<{ title: string }>(
      md(`title: 'T'`, 'First paragraph.\n\n## Heading\n\nSecond paragraph.')
    )
    assert.equal(content, 'First paragraph.\n\n## Heading\n\nSecond paragraph.')
    assert.equal(metadata.title, 'T')
  })

  it('returns null (does NOT throw) when the file has no frontmatter fence pair', () => {
    assert.equal(parseFrontmatter('Just a body, no fences.'), null)
  })
})

describe('parseFrontmatter — label: value block lists', () => {
  it('parses meta rows into ordered {label, value} pairs (work shape)', () => {
    const { metadata } = parse<{ meta: MetaItem[] }>(
      md(`title: 'T'\nmeta:\n  - Status: Placeholder\n  - Type: Layout proof\n  - Year: 2026`)
    )
    assert.deepEqual(metadata.meta, [
      { label: 'Status', value: 'Placeholder' },
      { label: 'Type', value: 'Layout proof' },
      { label: 'Year', value: '2026' },
    ])
  })

  it('parses stack and authors rows including unicode labels (notes shape)', () => {
    const { metadata } = parse<{
      stack: MetaItem[]
      authors: MetaItem[]
    }>(
      md(
        `title: 'T'\nstack:\n  - Desktop shell: Tauri\n  - Terminal: xterm.js\nauthors:\n  - Randy: direction, editing, final call\n  - Claude · Opus 4.8: drafting, research, code`
      )
    )
    assert.deepEqual(metadata.stack, [
      { label: 'Desktop shell', value: 'Tauri' },
      { label: 'Terminal', value: 'xterm.js' },
    ])
    assert.deepEqual(metadata.authors, [
      { label: 'Randy', value: 'direction, editing, final call' },
      { label: 'Claude · Opus 4.8', value: 'drafting, research, code' },
    ])
  })

  it('splits an item on the FIRST ": " and rejoins the rest into the value', () => {
    const { metadata } = parse<{ stack: MetaItem[] }>(
      md(`title: 'T'\nstack:\n  - Terminal: xterm.js: v5`)
    )
    assert.deepEqual(metadata.stack, [
      { label: 'Terminal', value: 'xterm.js: v5' },
    ])
  })
})

describe('parseFrontmatter — plain string lists + reported skips (T-006)', () => {
  // Replaces the T-003 pin that read a bare item as {label, value: ''}.
  it('parses block items WITHOUT a ": " separator as plain strings (the images shape)', () => {
    const { metadata } = parse<{ images: string[] }>(
      md(`title: 'T'\nimages:\n  - /work/perchhq/01.avif\n  - /work/perchhq/02.avif`)
    )
    assert.deepEqual(metadata.images, [
      '/work/perchhq/01.avif',
      '/work/perchhq/02.avif',
    ])
  })

  it('mixes shapes within one list: ": " items stay pairs, bare items stay strings', () => {
    const { metadata } = parse<{ mixed: unknown[] }>(
      md(`title: 'T'\nmixed:\n  - Status: Placeholder\n  - just-a-string`)
    )
    assert.deepEqual(metadata.mixed, [
      { label: 'Status', value: 'Placeholder' },
      'just-a-string',
    ])
  })

  it('reports a skipped malformed key line as a ParseIssue naming line and raw text', () => {
    const { metadata, issues } = parse<Record<string, unknown>>(
      md(`title: 'T'\nbad-key!: nope\nsummary: 'S'`)
    )
    assert.equal(metadata.summary, 'S')
    assert.equal('bad-key!' in metadata, false)
    assert.equal(issues.length, 1)
    assert.equal(issues[0].line, 3) // fence line 1 → block line 2 is title
    assert.equal(issues[0].raw, 'bad-key!: nope')
    assert.match(issues[0].reason, /not a "key: value" line/)
  })

  it('still omits a key whose value is empty with no indented items — but reports it', () => {
    const { metadata, issues } = parse<Record<string, unknown>>(
      md(`title: 'T'\nmeta:\nsummary: 'S'`)
    )
    assert.equal('meta' in metadata, false)
    assert.equal(metadata.summary, 'S')
    assert.equal(issues.length, 1)
    assert.match(issues[0].reason, /key "meta" has an empty value/)
  })

  it('reports zero issues for a clean file', () => {
    const { issues } = parse(
      md(`title: 'T'\npublishedAt: 2026-08-10\nsummary: 'S'`)
    )
    assert.deepEqual(issues, [])
  })
})

describe('error contract — ContentFileError names the file and the problem (T-006)', () => {
  it('throws ContentFileError (not TypeError) for a file with no frontmatter', () => {
    assertContentFileError(
      () => getMDXData(errorFixtures('no-frontmatter'), basicSchema),
      'broken.mdx',
      /no frontmatter block found/
    )
  })

  it('throws ContentFileError naming a missing required field', () => {
    assertContentFileError(
      () => getMDXData(errorFixtures('missing-field'), basicSchema),
      'no-summary.mdx',
      /missing required field "summary"/
    )
  })

  it('throws ContentFileError for an unparseable publishedAt, quoting the bad value', () => {
    assertContentFileError(
      () => getMDXData(errorFixtures('bad-date'), basicSchema),
      'nonsense.mdx',
      /unparseable publishedAt "not-a-date"/
    )
  })
})

describe('validation floor — per-pipeline required fields (T-006)', () => {
  it('notes: a note missing summary fails the notes floor with the file named', (t) => {
    t.mock.method(process, 'cwd', () => floorRoot('notes-missing-summary'))
    assertContentFileError(
      () => getBlogPosts(),
      'no-summary.mdx',
      /missing required field "summary"/
    )
  })

  it('work: a project with no images list fails the work floor (≥1 entry required — no thumbnail fallback)', (t) => {
    t.mock.method(process, 'cwd', () => floorRoot('work-no-images'))
    assertContentFileError(
      () => getWorkProjects(),
      'imageless.mdx',
      /missing required field "images" \(need a block list with at least one entry\)/
    )
  })

  it('work: an image path containing ": " fails as a named pair-entry error instead of being mangled', (t) => {
    t.mock.method(process, 'cwd', () => floorRoot('work-pair-image'))
    assertContentFileError(
      () => getWorkProjects(),
      'colon.mdx',
      /"images" entry 1 parsed as a "label: value" pair/
    )
  })
})

describe('getWorkProjects — parser output read directly (fixture pipeline)', () => {
  it('delivers the images block list as ordered string paths straight from the parser, thumbnail first', (t) => {
    t.mock.method(process, 'cwd', () => fixtureSiteRoot)
    const project = getWorkProjects().find((p) => p.slug === 'with-images')
    assert.ok(project, 'fixture with-images.mdx not found by slug')
    assert.deepEqual(project.metadata.images, [
      '/work/fixture/01.avif',
      '/work/fixture/02.avif',
      '/work/fixture/03.avif',
    ])
    assert.equal(project.metadata.images[0], project.metadata.thumbnail)
    assert.equal(project.metadata.liveUrl, 'https://example.com')
  })

  it('passes meta block-list rows through untouched as {label, value}', (t) => {
    t.mock.method(process, 'cwd', () => fixtureSiteRoot)
    const project = getWorkProjects().find((p) => p.slug === 'with-images')
    assert.ok(project, 'fixture with-images.mdx not found by slug')
    assert.deepEqual(project.metadata.meta, [
      { label: 'Status', value: 'Fixture' },
      { label: 'Year', value: '2026' },
    ])
  })
})

describe('getBlogPosts — notes fixture pipeline', () => {
  it('parses a notes-shaped frontmatter end to end (scalars, stack, authors, slug from filename)', (t) => {
    t.mock.method(process, 'cwd', () => fixtureSiteRoot)
    const posts = getBlogPosts()
    assert.equal(posts.length, 1)
    const post = posts[0]
    assert.equal(post.slug, 'fixture-note')
    assert.equal(
      post.metadata.title,
      'Fixture: a note with — punctuation, "quotes", and it’s curly'
    )
    assert.equal(post.metadata.publishedAt, '2026-08-10')
    assert.equal(
      post.metadata.summary,
      'Summary with a colon: kept intact, plus “smart quotes”.'
    )
    assert.deepEqual(post.metadata.stack, [
      { label: 'Desktop shell', value: 'Tauri' },
      { label: 'Terminal', value: 'xterm.js' },
    ])
    assert.deepEqual(post.metadata.authors, [
      { label: 'Randy', value: 'direction, editing, final call' },
      { label: 'Claude · Opus 4.8', value: 'drafting, research, code' },
    ])
    assert.equal(post.metadata.aiDegree, 'Co-written with Claude')
    assert.ok(post.content.startsWith('Body paragraph one.'))
    assert.ok(post.content.endsWith('Body paragraph two.'))
  })
})

describe('real content contract (app/notes/posts + app/work/projects)', () => {
  it('every shipped note and project passes its validation floor unchanged', () => {
    // Both calls throw ContentFileError if any real file fails the floor —
    // the floor was sized to admit ALL current content (AC 2).
    assert.ok(getBlogPosts().length >= 1, 'no notes found — pipeline broken?')
    assert.ok(
      getWorkProjects().length >= 1,
      'no projects found — pipeline broken?'
    )
  })

  it('every shipped project declares a nonempty ordered string[] with the thumbnail first', () => {
    for (const project of getWorkProjects()) {
      const { images, thumbnail } = project.metadata
      assert.ok(
        Array.isArray(images) && images.length >= 1,
        `${project.slug}: images is not a nonempty array`
      )
      for (const image of images) {
        assert.equal(
          typeof image,
          'string',
          `${project.slug}: non-string image entry — string-list parsing regressed`
        )
      }
      assert.equal(
        images[0],
        thumbnail,
        `${project.slug}: thumbnail is not the first carousel entry — the tile→modal morph convention is broken (intentional? update the convention docs in app/work/utils.ts first)`
      )
    }
  })
})
