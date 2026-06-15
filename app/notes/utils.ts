import fs from 'fs'
import path from 'path'

type StackItem = { label: string; value: string }

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  // Optional supplemental "at a glance" rows, rendered in the post's right
  // rail. Authored in frontmatter as an indented YAML-style list:
  //   stack:
  //     - Desktop shell: Tauri
  //     - Terminal: xterm.js
  stack?: StackItem[]
  // Optional call-to-action button at the foot of the right rail.
  ctaLabel?: string
  ctaHref?: string
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let lines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (!line.trim()) continue

    let keyMatch = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line)
    if (!keyMatch) continue

    let key = keyMatch[1]
    let value = keyMatch[2].trim()

    if (value === '') {
      // Block value — collect the following indented "- label: value" items.
      let items: StackItem[] = []
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        let item = lines[++i].replace(/^\s+-\s+/, '')
        let [label, ...rest] = item.split(': ')
        items.push({ label: label.trim(), value: rest.join(': ').trim() })
      }
      if (items.length) metadata[key] = items as any
    } else {
      value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
      metadata[key as keyof Metadata] = value as any
    }
  }

  return { metadata: metadata as Metadata, content }
}

function getMDXFiles(dir) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile(filePath) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function getMDXData(dir) {
  let mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file))
    let slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}

export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), 'app', 'notes', 'posts'))
}

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  let daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}
