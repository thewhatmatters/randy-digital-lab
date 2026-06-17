import './global.css'
import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { FooterReveal } from './components/footer-reveal'
import { UIChrome } from './components/command-bar'
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
            overlay and owns their shared toggle state. */}
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UIChrome>
            <main className="flex-auto min-w-0 flex flex-col">
              {/* Content fills at least one viewport so the footer lands at the
                  bottom and the curtain below it stays off-screen — this is what
                  gives short pages the scroll room to hide the reveal. */}
              <div className="flex min-h-[100dvh] flex-col pt-12">
                <Navbar />
                <div className="flex-auto">{children}</div>
                <Footer />
              </div>
              {/* Decorative aurora "curtain": a real in-flow section below the
                  footer, hidden at rest, pulled into view on overscroll, then
                  the scroll position springs back. See footer-reveal.tsx. */}
              <FooterReveal />
              <Analytics />
              <SpeedInsights />
            </main>
          </UIChrome>
        </ThemeProvider>
      </body>
    </html>
  )
}
