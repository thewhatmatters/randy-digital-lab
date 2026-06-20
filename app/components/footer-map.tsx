'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import type { Map as MlMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import styles from './footer-map.module.scss'

// Decorative footer map — a thin strip above the world clocks. Defaults to
// Austin (home), marked in the accent. Hovering a clock city (activeCity) flies
// the view there and moves the marker; leaving returns to Austin. MapLibre is
// lazy-loaded so it stays out of the initial bundle / off the static prerender.
//
// Look: "floating outlines" — we load a CARTO vector style, then strip it to a
// transparent canvas so the PAGE background reads as the ocean, keeping only
// coastlines (water-polygon outlines) + country borders as hairlines. Line
// colours resolve from the design tokens at runtime, so it stays theme-correct.

const CITY_COORDS: Record<string, [number, number]> = {
  'SF/LA': [-118.2437, 34.0522], // Los Angeles
  Austin: [-97.7431, 30.2672],
  Paris: [2.3522, 48.8566],
  Tokyo: [139.6917, 35.6895],
}
const DEFAULT_CITY = 'Austin'
const ZOOM = 2.5

// CARTO vector styles (keyless). We restyle them to outlines, so light/dark only
// really differ via the token-resolved line colours — but keep both for parity.
const MAP_STYLE = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
}

const coordsFor = (city: string | null): [number, number] =>
  CITY_COORDS[city ?? DEFAULT_CITY] ?? CITY_COORDS[DEFAULT_CITY]

// Resolve a CSS custom property to a concrete rgb() string (maplibre can't read
// CSS vars, and tokens may be authored in oklch — a probe gives us rgb()).
function resolveToken(name: string, fallback: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `color:var(${name});display:none`
  document.body.appendChild(probe)
  const c = getComputedStyle(probe).color
  probe.remove()
  return c || fallback
}

// Strip a CARTO style down to clean floating outlines: transparent everywhere,
// with coastlines + country borders as uniform, CRISP hairlines.
// - Coastlines are drawn as real LINE layers off the water geometry. (Using the
//   water fill's `fill-outline-color` renders a fuzzy 1px stroke that ignores
//   line-width — that's what looked blurry.)
// - CARTO draws state/county borders dashed + a lighter country halo; we hide
//   those and keep only the solid country line so every stroke matches.
const HAIRLINE = 0.8

function applyFloating(map: MlMap) {
  const line = resolveToken('--muted', 'rgb(150,150,150)')
  const layers = map.getStyle().layers ?? []

  const isCountryLine = (id: string) =>
    /(boundary_country_inner|admin[_-]?0)/i.test(id) && !/outline/i.test(id)

  // collect water geometry so we can restroke it crisply after the pass
  const coast: { source: string; sourceLayer?: string }[] = []
  const seen = new Set<string>()

  for (const layer of layers) {
    const { id, type } = layer
    try {
      if (type === 'background' || type === 'symbol') {
        map.setLayoutProperty(id, 'visibility', 'none')
      } else if (type === 'fill') {
        if (/water|ocean|sea|bay/i.test(id)) {
          map.setLayoutProperty(id, 'visibility', 'none') // hide fill; restroke below
          const src = (layer as { source?: string }).source
          const sl = (layer as { 'source-layer'?: string })['source-layer']
          const key = `${src}/${sl}`
          if (src && !seen.has(key)) {
            seen.add(key)
            coast.push({ source: src, sourceLayer: sl })
          }
        } else {
          map.setLayoutProperty(id, 'visibility', 'none') // land / landuse / buildings
        }
      } else if (type === 'line') {
        if (isCountryLine(id)) {
          map.setPaintProperty(id, 'line-color', line)
          map.setPaintProperty(id, 'line-opacity', 1)
          map.setPaintProperty(id, 'line-width', HAIRLINE)
        } else {
          map.setLayoutProperty(id, 'visibility', 'none') // dashed admin, halos, roads
        }
      } else {
        map.setLayoutProperty(id, 'visibility', 'none')
      }
    } catch {
      // schema drift — skip any layer that doesn't accept a given property
    }
  }

  // crisp coastlines as line layers (added on top; all fills are hidden)
  coast.forEach(({ source, sourceLayer }, i) => {
    const cid = `coast-${i}`
    if (map.getLayer(cid)) return
    try {
      map.addLayer({
        id: cid,
        type: 'line',
        source,
        ...(sourceLayer ? { 'source-layer': sourceLayer } : {}),
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': line, 'line-width': HAIRLINE },
      })
    } catch {
      // skip if this source can't be restroked
    }
  })
}

export function FooterMap({
  className,
  activeCity = null,
}: {
  className?: string
  activeCity?: string | null
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MlMap | null>(null)
  const markerRef = useRef<import('maplibre-gl').Marker | null>(null)
  const { resolvedTheme } = useTheme()

  // keep the latest activeCity for the (theme-keyed) init so a re-created map
  // starts on the right city
  const activeRef = useRef(activeCity)
  activeRef.current = activeCity

  // init / re-init on theme change
  useEffect(() => {
    if (!ref.current) return
    let cancelled = false
    let map: MlMap | undefined

    ;(async () => {
      const maplibregl = (await import('maplibre-gl')).default
      if (cancelled || !ref.current) return

      const start = coordsFor(activeRef.current)
      map = new maplibregl.Map({
        container: ref.current,
        style: resolvedTheme === 'dark' ? MAP_STYLE.dark : MAP_STYLE.light,
        center: start,
        zoom: ZOOM,
        interactive: false,
        attributionControl: false,
      })
      map.on('load', () => applyFloating(map!))

      // accent marker (home), styled with the design token so it flips with theme
      const el = document.createElement('div')
      el.className = styles.marker
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(start)
        .addTo(map)

      mapRef.current = map
      markerRef.current = marker
    })()

    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [resolvedTheme])

  // fly to the hovered city (or back to Austin); move the marker with it
  useEffect(() => {
    const map = mapRef.current
    const marker = markerRef.current
    if (!map || !marker) return

    const coords = coordsFor(activeCity)
    marker.setLngLat(coords)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      map.jumpTo({ center: coords, zoom: ZOOM })
    } else {
      map.flyTo({ center: coords, zoom: ZOOM, duration: 1400, essential: true })
    }
  }, [activeCity])

  return <div ref={ref} className={className} aria-hidden="true" />
}
