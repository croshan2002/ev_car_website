import './globals.css'
import { SITE, SITE_URL } from '@/lib/site'
import { THEME_BG, themeScript } from '@/lib/theme-config'

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
    <html lang="en-IN" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" href="/models/car.glb" as="fetch" type="model/gltf-binary" crossOrigin="anonymous" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable summary" />
      </head>
      <body>{children}</body>
    </html>
  )
}
