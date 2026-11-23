'use client'

import { motion } from 'motion/react'
import Counter from './Counter'
import { useAutoRotate } from '@/lib/turntable'

const ease = [0.22, 1, 0.36, 1]

const STATS = [
  { v: 640, unit: 'km', label: 'Range (ARAI)' },
  { v: 3.2, d: 1, unit: 's', label: '0–100 km/h' },
  { v: 18, unit: 'min', label: '10–80% charge' },
]

export default function Hero({ go }) {
  const [spin, setSpin] = useAutoRotate()
  return (
    <section id="top" className="section hero" data-stage="hero">
      <div className="hero__top">
        <motion.p className="mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.6 }}>
          The all-electric grand tourer
        </motion.p>
        <h1 className="hero__name">
          <span className="sr-only">VOLTA Arc — the all-electric grand tourer</span>
          {'ARC'.split('').map((c, i) => (
            <motion.span
              key={i}
              className="hero__letter"
              aria-hidden="true"
              initial={{ opacity: 0, y: 80, rotateX: -60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.1 + i * 0.08 }}
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
          transition={{ duration: 0.8, ease, delay: 0.35 }}
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

        <motion.button
          className="spin-btn"
          type="button"
          aria-label={spin ? 'Pause 360° rotation' : 'Play 360° rotation'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          onClick={() => setSpin(!spin)}
        >
          <span className="spin-btn__icon">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
              {spin ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M7 4l13 8-13 8z" />}
            </svg>
          </span>
          <span className="spin-btn__label">Drag the car to rotate 360°</span>
        </motion.button>

        <motion.dl
          className="stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {STATS.map((s, i) => (
            <div key={s.label} className="stat">
              <dt className="stat__v">
                <Counter value={s.v} decimals={s.d ?? 0} delay={0.5 + i * 0.1} />
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
