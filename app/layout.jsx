import './globals.css'
import { IBM_Plex_Mono, Sora } from 'next/font/google'
import { SITE, SITE_URL } from '@/lib/site'
import { THEME_BG, themeScript } from '@/lib/theme-config'

// Self-hosted at build time, so no render-blocking request to Google on first load.
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  keywords: SITE.keywords,
  applicationName: SITE.name,
  authors: [{ name: SITE.org, url: SITE_URL }],
  creator: SITE.org,
  publisher: SITE.org,
  category: 'automotive',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: SITE.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  formatDetection: { telephone: false },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: THEME_BG.dark },
    { media: '(prefers-color-scheme: light)', color: THEME_BG.light },
  ],
  colorScheme: 'dark light',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${sora.variable} ${mono.variable}`} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preload" href="/models/car.glb" as="fetch" type="model/gltf-binary" crossOrigin="anonymous" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable summary" />
      </head>
      <body>{children}</body>
    </html>
  )
}
