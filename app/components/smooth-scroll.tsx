'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Lenis inertia/smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in
// sync (one RAF loop, no jitter). Side-effect provider — renders children
// untouched; Lenis controls the window scroll. Fully disabled under
// prefers-reduced-motion (native scroll, no inertia, no plugin churn).
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduce.matches) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)
    const onTick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // Overlay hook: the work project modal (and any future overlay) halts the
    // inertia loop while it owns the viewport — lenis.stop() also adds the
    // `lenis-stopped` class (overflow: clip, see global.css §11). Plain window
    // events keep the coupling one-way; under reduced motion Lenis never
    // exists and the overlay's own overflow lock is the whole story.
    const onStop = () => lenis.stop()
    const onStart = () => lenis.start()
    window.addEventListener('lenis:stop', onStop)
    window.addEventListener('lenis:start', onStart)

    return () => {
      window.removeEventListener('lenis:stop', onStop)
      window.removeEventListener('lenis:start', onStart)
      gsap.ticker.remove(onTick)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
