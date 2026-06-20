import './global.css'
import { ViewTransitions } from 'next-view-transitions'
import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { FooterReveal } from './components/footer-reveal'
import { UIChrome } from './components/command-bar'
import { SmoothScroll } from './components/smooth-scroll'
import { Preloader } from './components/preloader'
import { ThemeProvider } from 'next-themes'
import { baseUrl } from './sitemap'

// viewport-fit=cover lets the fixed command bar read safe-area insets on
// notched devices (see .cmdbar in global.css).
export const viewport: Viewport = {
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'randy.digital',
    template: '%s — randy.digital',
  },
  description:
    'Portfolio, notes, and a lab of small interactive experiments — by Randy.',
  openGraph: {
    title: 'randy.digital',
    description:
      'Portfolio, notes, and a lab of small interactive experiments — by Randy.',
    url: baseUrl,
    siteName: 'randy.digital',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      // next-themes sets data-theme before paint; this silences the expected
      // server/client mismatch on the <html> attribute.
      suppressHydrationWarning
      className={cx(
        'bg-bg text-fg',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="antialiased">
        {/* Full-width shell: each section composes `grid-page`, which centers
            its own 72rem content box. The old global max-w-xl lived here.
            ThemeProvider drives light/dark/auto via the [data-theme] attribute
            (no-flash inline script); UIChrome adds the fixed command bar + grid
            overlay and owns their shared toggle state. ViewTransitions wraps
            navigations in document.startViewTransition (crossfade in global.css
            §12). */}
        <ViewTransitions>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UIChrome>
           <Preloader />
           <SmoothScroll>
            {/* Aurora bloom pinned behind the page (z-0). Hidden until you push
                past the footer, when <main> lifts to uncover it. See
                footer-reveal.tsx. */}
            <FooterReveal />
            {/* <main> is the opaque page surface (z-1) that covers the bloom; the
                overscroll lift opens a gap at the bottom that reveals it. The
                min-h wrapper keeps the footer at the bottom on short pages. */}
            <main className="relative z-[1] flex flex-auto min-w-0 flex-col bg-bg">
              <div className="flex min-h-[100dvh] flex-col pt-12">
                <Navbar />
                <div className="flex-auto">{children}</div>
                <Footer />
              </div>
              <Analytics />
              <SpeedInsights />
            </main>
           </SmoothScroll>
          </UIChrome>
        </ThemeProvider>
        </ViewTransitions>
      </body>
    </html>
  )
}
