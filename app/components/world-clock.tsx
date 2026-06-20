'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './world-clock.module.scss'

const ZONES = [
  { city: 'SF/LA', region: 'Pacific', tz: 'America/Los_Angeles' },
  { city: 'Austin', region: 'Central', tz: 'America/Chicago', home: true },
  { city: 'Paris', region: 'Europe', tz: 'Europe/Paris' },
  { city: 'Tokyo', region: 'Asia', tz: 'Asia/Tokyo' },
]

const pad = (n: number) => String(n).padStart(2, '0')
const randTime = () =>
  `${pad(Math.floor(Math.random() * 24))}:${pad(Math.floor(Math.random() * 60))}:${pad(Math.floor(Math.random() * 60))}`

// A row of live world clocks (HH:MM:SS, 24h). On first scroll-into-view the
// digits briefly scramble, then settle to the live time — a flip-board moment.
// Reduced-motion: straight to live, no scramble. Stable SSR placeholder.
export function WorldClock() {
  const ref = useRef<HTMLDListElement>(null)
  const [now, setNow] = useState<Date | null>(null)
  const [scrambling, setScrambling] = useState(false)
  const [, force] = useState(0)

  useEffect(() => {
    setNow(new Date())
    const tick = setInterval(() => setNow(new Date()), 1000)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let scrambleId: ReturnType<typeof setInterval> | undefined
    let stopId: ReturnType<typeof setTimeout> | undefined
    let io: IntersectionObserver | undefined

    if (!reduce && ref.current) {
      io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return
          io?.disconnect()
          setScrambling(true)
          scrambleId = setInterval(() => force((x) => x + 1), 55)
          stopId = setTimeout(() => {
            if (scrambleId) clearInterval(scrambleId)
            setScrambling(false)
          }, 600)
        },
        { threshold: 0.4 }
      )
      io.observe(ref.current)
    }

    return () => {
      clearInterval(tick)
      if (scrambleId) clearInterval(scrambleId)
      if (stopId) clearTimeout(stopId)
      io?.disconnect()
    }
  }, [])

  const fmt = (tz: string) => {
    if (scrambling) return randTime()
    return now
      ? new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: tz,
        }).format(now)
      : '--:--:--'
  }

  return (
    <dl ref={ref} className={styles.clock}>
      {ZONES.map((z) => (
        <div key={z.city} className={styles.zone}>
          <dt className={styles.time} suppressHydrationWarning>
            {fmt(z.tz)}
          </dt>
          <dd className={`${styles.city} ${z.home ? styles.home : ''}`}>
            {z.city}
          </dd>
          <dd className={styles.region}>{z.region}</dd>
        </div>
      ))}
    </dl>
  )
}
