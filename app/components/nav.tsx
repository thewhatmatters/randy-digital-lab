import { Link } from 'next-view-transitions'

const navItems = [
  { path: '/', name: 'base' },
  { path: '/notes', name: 'notes' },
  { path: '/lab', name: 'lab' },
]

// Numbered, grid-aligned primary nav. Mobile: a simple numbered row. md+: each
// item snaps to the page's column lines (subgrid) — 01 at col 1, 02 at col 3,
// 03 at col 5 — matching the editorial 01/02/03 index rhythm used across the
// site (Experience, Notes).
const placement = [
  'md:col-start-1 md:col-end-3',
  'md:col-start-3 md:col-end-5',
  'md:col-start-5 md:col-end-7',
]

export function Navbar() {
  return (
    <aside className="grid-page mb-16 tracking-tight">
      <nav
        aria-label="Primary"
        className="col-start-1 col-end-13 flex gap-x-8 items-baseline md:grid md:grid-cols-subgrid md:[column-gap:normal] lg:sticky lg:top-20"
      >
        {navItems.map(({ path, name }, i) => (
          <Link
            key={path}
            href={path}
            className={`${placement[i]} group flex items-baseline gap-x-2 py-1 transition-colors hover:text-neutral-800 dark:hover:text-neutral-200`}
          >
            <span className="font-mono text-xs tabular-nums text-muted transition-colors group-hover:text-accent">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
