import { ImageResponse } from 'next/og'
import { SITE } from '@/lib/site'
import { TRIMS } from '@/lib/store'

export const alt = `${SITE.name} — all-electric grand tourer`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  const best = Math.max(...TRIMS.map((t) => t.range))
  const sprint = Math.min(...TRIMS.map((t) => t.sprint))
  const stats = [
    [`${best} km`, 'Range (ARAI)'],
    [`${sprint} s`, '0–100 km/h'],
    [`${SITE.chargeMinutes} min`, '10–80% charge'],
  ]
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'radial-gradient(ellipse at 50% 120%, #2a2112 0%, #07080b 60%)',
          color: '#eef0f3',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 12, fontWeight: 700 }}>VOLTA</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 26, color: '#ffb547', letterSpacing: 4, textTransform: 'uppercase' }}>The all-electric grand tourer</div>
          <div style={{ fontSize: 180, fontWeight: 700, letterSpacing: 24, lineHeight: 1 }}>ARC</div>
        </div>
        <div style={{ display: 'flex', gap: 72 }}>
          {stats.map(([v, l]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 56, fontWeight: 300 }}>{v}</div>
              <div style={{ fontSize: 24, color: '#8b9099' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
