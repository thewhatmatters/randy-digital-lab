// The aurora equalizer's bar arc — one definition, two consumers.
//
// Deliberately NOT a 'use client' module (the work-morph.ts /
// work-carousel-position.ts idiom): both consumers are client islands today,
// but the numbers are data, not behavior, and keeping them directive-free
// means a Server Component could read them tomorrow without a boundary hop.
//
// The shape is a raised half-sine: it peaks at the center columns and tapers
// to the edges, one entry per grid column (--grid-cols is 12). The footer
// bloom stands this arc up when you push past the end of the page; the route
// sweep stands the same arc up across the viewport on a navigation. Same arc,
// same spectrum, two gestures — change it here and both move together.
export const AURORA_BARS = [39, 57, 73, 86, 95, 99, 99, 95, 86, 73, 57, 39]
