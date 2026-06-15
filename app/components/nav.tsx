import Link from 'next/link'

const navItems = {
  '/': {
    name: 'base',
  },
  '/notes': {
    name: 'notes',
  },
  '/lab': {
    name: 'lab',
  },
}

export function Navbar() {
  return (
    <aside className="grid-page mb-16 tracking-tight">
      <div className="col-start-1 col-end-13 lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row gap-x-6 pr-10">
            {Object.entries(navItems).map(([path, { name }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1"
                >
                  {name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </aside>
  )
}
