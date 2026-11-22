'use client'

import { motion } from 'motion/react'
import Counter from './Counter'

const ease = [0.22, 1, 0.36, 1]

const STATS = [
  { v: 640, unit: 'km', label: 'Range (ARAI)' },
  { v: 3.2, d: 1, unit: 's', label: '0–100 km/h' },
  { v: 18, unit: 'min', label: '10–80% charge' },
]

export default function Hero({ go }) {
  return (
    <section id="top" className="section hero" data-stage="hero">
      <div className="hero__top">
        <motion.p className="mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.8 }}>
          The all-electric grand tourer
        </motion.p>
        <h1 className="hero__name">
          <span className="sr-only">VOLTA Arc — the all-electric grand tourer</span>
          {'ARC'.split('').map((c, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              initial={{ opacity: 0, y: 80, rotateX: -60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1.2, ease, delay: 1.0 + i * 0.1 }}
            >
              {c}
            </motion.span>
          ))}
        </h1>
      </div>

      <div className="hero__bottom">
        <motion.div
          className="hero__copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 1.5 }}
        >
          <p className="lead">Electric, without the compromise. Five seats, up to 640 km of range, 18-minute fast charging and a cabin as quiet as a library.</p>
          <div className="row">
            <motion.a
              className="btn"
              href="#config"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.preventDefault()
                go('config', 'Configure')
              }}
            >
              Configure yours
            </motion.a>
            <a
              className="btn btn--ghost"
              href="#design"
              onClick={(e) => {
                e.preventDefault()
                go('design', 'Design')
              }}
            >
              Explore design
            </a>
          </div>
        </motion.div>

        <motion.dl
          className="stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.8 }}
        >
          {STATS.map((s, i) => (
            <div key={s.label} className="stat">
              <dt className="stat__v">
                <Counter value={s.v} decimals={s.d ?? 0} delay={1.7 + i * 0.12} />
                <small>{s.unit}</small>
              </dt>
              <dd>{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}
