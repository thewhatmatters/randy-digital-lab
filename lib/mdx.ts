import fs from 'fs'
import path from 'path'
import { asLocalInstant } from 'lib/dates'

// Shared MDX data layer — the generic frontmatter parser + directory reader
// (filesystem MDX, no CMS), consumed by app/notes/utils.ts and
// app/work/utils.ts. T-006 deepened the contract:
//
// - Every failure is a named ContentFileError carrying the file path and the
//   specific problem, thrown from the layer that knows the path (readMDXFile /
//   getMDXData) — a malformed file fails the build loudly and actionably,
//   never with an anonymous TypeError.
// - Each pipeline declares a validation floor (ContentSchema) enforced here,
//   at read time, through ONE mechanism: per-field rules 'scalar' | 'date' |
//   'string-list'. Invalid dates are rejected before they can reach the
//   newestFirst comparator as NaN.
// - Block-list items WITHOUT a ": " separator parse as plain strings; items
//   with one keep the {label, value} shape. (Before T-006 a bare item came
//   back as {label, value: ''} and work re-derived its images with an
//   inverse shim — deleted.)
// - Unknown/malformed frontmatter lines still skip, but each skip is
//   reported: parseFrontmatter collects ParseIssues, and getMDXData warns at
//   build time naming file and line — no more fully-silent drops.

// One "label: value" row from an indented block list in frontmatter, e.g.
//   meta:
//     - Status: Placeholder
// Notes call these `stack` / `authors`; Work calls them `meta`.
export type MetaItem = { label: string; value: string }

// What one block-list item parses to: "- Status: Placeholder" → MetaItem,
// "- /work/knav/01.avif" (no ": ") → plain string.
export type BlockItem = string | MetaItem

// A frontmatter line the parser skipped, and why. `line` is the 1-based file
// line assuming the standard shape (fence on line 1); `raw` is the real
// locator either way.
export type ParseIssue = { line: number; raw: string; reason: string }

// Per-field validation rules — a pipeline's required-field floor.
//   'scalar'      → nonempty string
//   'date'        → nonempty string that parses to a valid instant under the
//                   site-wide local-midnight rule (lib/dates.ts asLocalInstant)
//   'string-list' → block list with ≥1 entry, every entry a plain string
export type FieldRule = 'scalar' | 'date' | 'string-list'
export type ContentSchema = Readonly<Record<string, FieldRule>>

/** Named failure for one content file: message = `<path>: <problem>`. */
export class ContentFileError extends Error {
  readonly filePath: string
  readonly problem: string

  constructor(filePath: string, problem: string) {
    super(`${filePath}: ${problem}`)
    this.name = 'ContentFileError'
    this.filePath = filePath
    this.problem = problem
  }
}

/**
 * Pure parse of one file's text. Returns null when there is no frontmatter
 * fence pair — the caller (which knows the file path) turns that into a
 * ContentFileError; this function never throws.
 *
 * The fence regex is anchored to the START of the file (T-008): frontmatter
 * is a header, not a floating block. Unanchored, a fence-less file whose
 * body contained two thematic-break `---` lines would have the prose
 * between them "parsed" as frontmatter and misdiagnosed as missing fields;
 * anchored, it diagnoses correctly as "no frontmatter".
 */
export function parseFrontmatter<T>(
  fileContent: string
): { metadata: T; content: string; issues: ParseIssue[] } | null {
  let frontmatterRegex = /^---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  if (!match) return null
  let frontMatterBlock = match[1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let lines = frontMatterBlock.trim().split('\n')
  let metadata: Record<string, any> = {}
  let issues: ParseIssue[] = []

  // Line 1 is the opening fence, so block line i (0-based) is file line i+2.
  const fileLine = (i: number) => i + 2

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (!line.trim()) continue

    let keyMatch = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line)
    if (!keyMatch) {
      issues.push({
        line: fileLine(i),
        raw: line.trim(),
        reason: 'not a "key: value" line — skipped',
      })
      continue
    }

    let key = keyMatch[1]
    let value = keyMatch[2].trim()

    if (value === '') {
      // Block value — collect the following indented "- item" lines. An item
      // WITH a ": " separator is a {label, value} pair (split on the FIRST
      // ": ", remainder rejoined); one without is a plain string.
      let keyLineIndex = i
      let items: BlockItem[] = []
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        let item = lines[++i].replace(/^\s+-\s+/, '').trim()
        if (item.includes(': ')) {
          let [label, ...rest] = item.split(': ')
          items.push({ label: label.trim(), value: rest.join(': ').trim() })
        } else {
          items.push(item)
        }
      }
      if (items.length) {
        metadata[key] = items
      } else {
        issues.push({
          line: fileLine(keyLineIndex),
          raw: line.trim(),
          reason: `key "${key}" has an empty value and no list items — skipped`,
        })
      }
    } else {
      value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
      metadata[key] = value
    }
  }

  return { metadata: metadata as T, content, issues }
}

/** The validation floor — one mechanism, per-pipeline field lists. */
function validate(
  metadata: Record<string, any>,
  schema: ContentSchema,
  filePath: string
) {
  for (let [field, rule] of Object.entries(schema)) {
    let value = metadata[field]

    if (rule === 'string-list') {
      if (!Array.isArray(value) || value.length === 0) {
        throw new ContentFileError(
          filePath,
          `missing required field "${field}" (need a block list with at least one entry)`
        )
      }
      value.forEach((entry, index) => {
        if (typeof entry !== 'string') {
          throw new ContentFileError(
            filePath,
            `"${field}" entry ${index + 1} parsed as a "label: value" pair — ` +
              `entries of "${field}" must be plain strings (a ": " inside an entry is not supported)`
          )
        }
      })
      continue
    }

    if (value === undefined) {
      throw new ContentFileError(filePath, `missing required field "${field}"`)
    }
    if (typeof value !== 'string' || value === '') {
      throw new ContentFileError(
        filePath,
        `field "${field}" must be a nonempty scalar string`
      )
    }
    if (rule === 'date') {
      let instant = asLocalInstant(value)
      if (Number.isNaN(instant.getTime())) {
        throw new ContentFileError(
          filePath,
          `unparseable ${field} "${value}" — expected an ISO date like 2026-08-10`
        )
      }
      // Roll detection (T-008): JS Date arithmetic silently rolls a
      // calendar-impossible day forward (2026-02-30 parses as March 2, this
      // engine included), so NaN alone can't catch it. Parse, then verify
      // the round trip: the instant must land on the exact Y/M/D the string
      // named. Scoped to values WITHOUT an explicit zone designator —
      // those are read under the local-midnight rule (asLocalInstant), so
      // local components are comparable; a Z/offset value is outside the
      // site's date contract and its local Y/M/D legitimately differs.
      let ymd = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/.exec(value)
      if (
        ymd &&
        !/(?:[Zz]|[+-]\d{2}:?\d{2})$/.test(value) &&
        (instant.getFullYear() !== Number(ymd[1]) ||
          instant.getMonth() + 1 !== Number(ymd[2]) ||
          instant.getDate() !== Number(ymd[3]))
      ) {
        throw new ContentFileError(
          filePath,
          `calendar-impossible ${field} "${value}" — no such day exists ` +
            `(JS Date would roll it into the next month)`
        )
      }
    }
  }
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile<T>(filePath: string, schema: ContentSchema) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  let parsed = parseFrontmatter<T>(rawContent)
  if (parsed === null) {
    throw new ContentFileError(
      filePath,
      'no frontmatter block found (expected the file to open with a "---" fence pair)'
    )
  }
  for (let issue of parsed.issues) {
    console.warn(
      `[content] ${filePath}:${issue.line} — ${issue.reason}: "${issue.raw}"`
    )
  }
  validate(parsed.metadata as Record<string, any>, schema, filePath)
  return parsed
}

export function getMDXData<T>(dir: string, schema: ContentSchema) {
  let mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile<T>(path.join(dir, file), schema)
    let slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}
