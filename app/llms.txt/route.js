// /llms.txt — a plain-text brief for AI answer engines (GEO), generated from the same data as the page.
import { FAQ, HIGHLIGHTS, PRICE_RANGE, SITE, SITE_URL } from '@/lib/site'
import { PAINTS, TRIMS, WHEELS, inr } from '@/lib/store'

export const dynamic = 'force-static'

export function GET() {
  const body = `# ${SITE.name}

> ${SITE.description}

Official product page: ${SITE_URL}/

## Versions (ex-showroom, India)

${TRIMS.map((t) => `- ${SITE.name} ${t.name}: ${inr(t.price)} · ${t.range} km range (ARAI) · 0–100 km/h in ${t.sprint} s · ${t.power} kW`).join('\n')}

Price range: ${PRICE_RANGE.lowText} to ${PRICE_RANGE.highText}.

## Key facts

- Seats: ${SITE.seats}
- Boot space: ${SITE.boot} litres (seats up)
- Charging: 800-volt platform, up to ${SITE.peakCharge} kW DC, 10–80% in ${SITE.chargeMinutes} minutes
- Drag coefficient: ${SITE.dragCd}
- Paints: ${PAINTS.map((p) => p.name).join(', ')}
- Wheels: ${WHEELS.map((w) => w.name).join(', ')}
- Reservation: ${inr(SITE.reservation)}, fully refundable

## Highlights

${HIGHLIGHTS.map((h) => `- ${h.k}: ${h.text}`).join('\n')}

## FAQ

${FAQ.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
