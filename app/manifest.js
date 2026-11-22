import { SITE } from '@/lib/site'
import { THEME_BG } from '@/lib/theme-config'

export default function manifest() {
  return {
    name: SITE.title,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: THEME_BG.dark,
    theme_color: THEME_BG.dark,
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
