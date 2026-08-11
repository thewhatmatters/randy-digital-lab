// Parser contract tests for the shared MDX data layer (lib/mdx.ts) and the
// two pipelines that consume it (app/notes/utils.ts, app/work/utils.ts).
// T-003 AC 1 — pins the frontmatter contract five verify passes asked for.
//
// Seam notes:
// - parseFrontmatter is pure — tested directly with inline strings.
// - getBlogPosts/getWorkProjects hard-code `path.join(process.cwd(), ...)`,
//   so process.cwd() IS the seam: each pipeline test stubs it (t.mock.method,
//   auto-restored per test) to point at tests/fixtures/site, a hermetic tree
//   mirroring both real content directories. Zero production code touched.
// - One non-hermetic block ("real content contract") runs against the real
//   app/work/projects — it pins the thumbnail-first convention the tile→modal
//   morph depends on. If it fails after a content edit, the convention (not
//   the test) is what broke.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFrontmatter, type MetaItem } from 'lib/mdx'
import { getWorkProjects } from 'app/work/utils'
import { getBlogPosts } from 'app/notes/utils'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const fixtureSiteRoot = path.join(testDir, 'fixtures', 'site')

/** Wrap a frontmatter block in the --- fences the parser expects. */
const md = (front: string, body = 'Body.') => `---\n${front}\n---\n\n${body}\n`

describe('parseFrontmatter — scalar values', () => {
  it('strips matching single quotes and keeps internal punctuation (colon, em dash, ASCII double quotes)', () => {
    const { metadata } = parseFrontmatter<{ title: string }>(
      md(`title: 'Dashboard Confessional: I built one — with "quotes" inside'`)
    )
    assert.equal(
      metadata.title,
      'Dashboard Confessional: I built one — with "quotes" inside'
    )
  })

  it('keeps curly apostrophes and smart quotes inside a single-quoted scalar', () => {
    const { metadata } = parseFrontmatter<{ summary: string }>(
      md(`summary: 'I’d “actually” want to stare at it'`)
    )
    assert.equal(metadata.summary, 'I’d “actually” want to stare at it')
  })

  it('strips matching double quotes', () => {
    const { metadata } = parseFrontmatter<{ title: string }>(
      md(`title: "Plain title"`)
    )
    assert.equal(metadata.title, 'Plain title')
  })

  it('passes unquoted scalars through verbatim (dates, URLs containing colons)', () => {
    const { metadata } = parseFrontmatter<{
      publishedAt: string
      liveUrl: string
    }>(md(`publishedAt: 2026-08-10\nliveUrl: https://knav.app`))
    assert.equal(metadata.publishedAt, '2026-08-10')
    assert.equal(metadata.liveUrl, 'https://knav.app')
  })

  it('returns the body with the frontmatter block removed and trimmed', () => {
    const { content, metadata } = parseFrontmatter<{ title: string }>(
      md(`title: 'T'`, 'First paragraph.\n\n## Heading\n\nSecond paragraph.')
    )
    assert.equal(content, 'First paragraph.\n\n## Heading\n\nSecond paragraph.')
    assert.equal(metadata.title, 'T')
  })
})

describe('parseFrontmatter — label: value block lists', () => {
  it('parses meta rows into ordered {label, value} pairs (work shape)', () => {
    const { metadata } = parseFrontmatter<{ meta: MetaItem[] }>(
      md(`title: 'T'\nmeta:\n  - Status: Placeholder\n  - Type: Layout proof\n  - Year: 2026`)
    )
    assert.deepEqual(metadata.meta, [
      { label: 'Status', value: 'Placeholder' },
      { label: 'Type', value: 'Layout proof' },
      { label: 'Year', value: '2026' },
    ])
  })

  it('parses stack and authors rows including unicode labels (notes shape)', () => {
    const { metadata } = parseFrontmatter<{
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
    const { metadata } = parseFrontmatter<{ stack: MetaItem[] }>(
      md(`title: 'T'\nstack:\n  - Terminal: xterm.js: v5`)
    )
    assert.deepEqual(metadata.stack, [
      { label: 'Terminal', value: 'xterm.js: v5' },
    ])
  })

  it('reads a bare list item (no ": ") as label-only with empty value — the raw images shape', () => {
    const { metadata } = parseFrontmatter<{ images: MetaItem[] }>(
      md(`title: 'T'\nimages:\n  - /work/perchhq/01.avif\n  - /work/perchhq/02.avif`)
    )
    assert.deepEqual(metadata.images, [
      { label: '/work/perchhq/01.avif', value: '' },
      { label: '/work/perchhq/02.avif', value: '' },
    ])
  })

  it('omits a key whose value is empty when no indented items follow', () => {
    const { metadata } = parseFrontmatter<Record<string, unknown>>(
      md(`title: 'T'\nmeta:\nsummary: 'S'`)
    )
    assert.equal('meta' in metadata, false)
    assert.equal(metadata.summary, 'S')
  })
})

describe('getWorkProjects — images normalization (fixture pipeline)', () => {
  it('normalizes the images block list to ordered string paths, thumbnail first', (t) => {
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

  it('falls back to [thumbnail] when a project declares no images', (t) => {
    t.mock.method(process, 'cwd', () => fixtureSiteRoot)
    const project = getWorkProjects().find((p) => p.slug === 'no-images')
    assert.ok(project, 'fixture no-images.mdx not found by slug')
    assert.deepEqual(project.metadata.images, ['/work/fallback/thumb.avif'])
  })

  it('rejoins an image path that contains ": " into one string', (t) => {
    t.mock.method(process, 'cwd', () => fixtureSiteRoot)
    const project = getWorkProjects().find((p) => p.slug === 'colon-path')
    assert.ok(project, 'fixture colon-path.mdx not found by slug')
    assert.deepEqual(project.metadata.images, [
      '/work/odd/cover: retina.avif',
      '/work/odd/second.avif',
    ])
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

describe('real content contract (app/work/projects)', () => {
  it('every shipped project normalizes to a nonempty ordered string[] with the thumbnail first', () => {
    const projects = getWorkProjects()
    assert.ok(projects.length >= 1, 'no projects found — pipeline broken?')
    for (const project of projects) {
      const { images, thumbnail } = project.metadata
      assert.ok(
        Array.isArray(images) && images.length >= 1,
        `${project.slug}: images did not normalize to a nonempty array`
      )
      for (const image of images) {
        assert.equal(
          typeof image,
          'string',
          `${project.slug}: non-string image entry — normalization regressed`
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
