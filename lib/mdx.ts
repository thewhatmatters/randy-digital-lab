import fs from 'fs'
import path from 'path'

// Shared MDX data layer — the generic frontmatter parser + directory reader
// extracted verbatim from app/notes/utils.ts so Notes and Work consume ONE
// pipeline (filesystem MDX, no CMS). Behavior is intentionally byte-identical
// to the original notes parser; only the metadata TYPE is generic now, so each
// content area (notes, work) declares its own schema in its own utils.ts.

// One "label: value" row from an indented block list in frontmatter, e.g.
//   meta:
//     - Status: Placeholder
// Notes call these `stack` / `authors`; Work calls them `meta`.
export type MetaItem = { label: string; value: string }

export function parseFrontmatter<T>(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let lines = frontMatterBlock.trim().split('\n')
  let metadata: Record<string, any> = {}

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (!line.trim()) continue

    let keyMatch = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line)
    if (!keyMatch) continue

    let key = keyMatch[1]
    let value = keyMatch[2].trim()

    if (value === '') {
      // Block value — collect the following indented "- label: value" items.
      let items: MetaItem[] = []
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        let item = lines[++i].replace(/^\s+-\s+/, '')
        let [label, ...rest] = item.split(': ')
        items.push({ label: label.trim(), value: rest.join(': ').trim() })
      }
      if (items.length) metadata[key] = items
    } else {
      value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
      metadata[key] = value
    }
  }

  return { metadata: metadata as T, content }
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile<T>(filePath: string) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter<T>(rawContent)
}

export function getMDXData<T>(dir: string) {
  let mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile<T>(path.join(dir, file))
    let slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}
