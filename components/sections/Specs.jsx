'use client'

import { motion } from 'motion/react'
import { TRIMS, inr } from '@/lib/store'
import { HIGHLIGHTS, PRICE_RANGE, SITE } from '@/lib/site'

const rise = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
}

export default function Specs() {
  return (
    <section id="specs" className="info" data-stage="reserve" aria-labelledby="specs-title">
      <motion.div className="info__inner" {...rise}>
        <p className="mono">Specifications</p>
        <h2 id="specs-title" className="h2">
          {SITE.name} at a glance
        </h2>
        <p className="lead">
          The {SITE.name} is a {SITE.seats}-seat all-electric grand tourer with up to{' '}
          {Math.max(...TRIMS.map((t) => t.range))} km of range, {SITE.peakCharge} kW DC charging and an ex-showroom price
          from {PRICE_RANGE.lowText} to {PRICE_RANGE.highText}.
        </p>

        <div className="table-wrap">
          <table className="spec-table">
            <caption className="sr-only">{SITE.name} versions compared</caption>
            <thead>
              <tr>
                <th scope="col">Version</th>
                <th scope="col">Range (ARAI)</th>
                <th scope="col">0–100 km/h</th>
                <th scope="col">Peak power</th>
                <th scope="col">Ex-showroom</th>
              </tr>
            </thead>
            <tbody>
              {TRIMS.map((t) => (
                <tr key={t.id}>
                  <th scope="row">{t.name}</th>
                  <td>{t.range} km</td>
                  <td>{t.sprint} s</td>
                  <td>{t.power} kW</td>
                  <td>{inr(t.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="facts">
          <div>
            <dt>Charging</dt>
            <dd>10–80% in {SITE.chargeMinutes} min · {SITE.peakCharge} kW DC · 800 V</dd>
          </div>
          <div>
            <dt>Seats</dt>
            <dd>{SITE.seats}</dd>
          </div>
          <div>
            <dt>Boot</dt>
            <dd>{SITE.boot} litres</dd>
          </div>
          <div>
            <dt>Drag coefficient</dt>
            <dd>{SITE.dragCd}</dd>
          </div>
        </dl>

        <ul className="highlights">
          {HIGHLIGHTS.map((h) => (
            <li key={h.k}>
              <strong>{h.k}</strong>
              <span>{h.text}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
