'use client'

import { motion } from 'motion/react'
import Counter from './Counter'

export default function Performance({ trim }) {
  const STATS = [
    { v: trim.range, unit: 'km', label: 'Range on one charge' },
    { v: trim.sprint, d: 1, unit: 's', label: '0–100 km/h' },
    { v: trim.power, unit: 'kW', label: 'Peak power' },
    { v: 350, unit: 'kW', label: 'Peak DC charging' },
  ]
  return (
    <section id="perf" className="section perf" data-stage="perf">
      <div className="perf__col">
        <p className="mono">Performance · {trim.name}</p>
        <h2 className="h2">Quiet until you ask.</h2>
        <p className="lead">
          Two motors, an 800-volt platform and a battery that sits under the floor. Low, planted, and fast
          when you need to pass.
        </p>
        <div className="perf__grid">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="pstat"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="pstat__v">
                <Counter value={s.v} decimals={s.d ?? 0} delay={i * 0.08} />
                <small>{s.unit}</small>
              </span>
              <span className="pstat__l">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
