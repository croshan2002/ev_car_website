'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { inr } from '@/lib/store'

export default function Reserve({ paint, wheel, trim }) {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', city: '' })
  const valid = form.name.trim() && /^\d{10}$/.test(form.phone.replace(/\s/g, '')) && form.city.trim()

  const submit = (e) => {
    e.preventDefault()
    if (valid) setSent(true)
  }

  return (
    <section id="reserve" className="reserve" data-stage="reserve">
      <motion.div
        className="rcard"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="rcard__summary">
          <p className="mono">Your Arc</p>
          <h2 className="h2">{trim.name}</h2>
          <ul>
            <li>
              <span className="swatch" style={{ background: paint.hex }} /> {paint.name}
            </li>
            <li>{wheel.name} wheels</li>
            <li>
              {trim.range} km · 0–100 in {trim.sprint} s
            </li>
          </ul>
          <p className="muted small">Reservation amount {inr(25000)}, fully refundable.</p>
        </div>

        <div className="rcard__form">
          <AnimatePresence mode="wait" initial={false}>
            {!sent ? (
              <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, scale: 0.97 }} noValidate>
                <label>
                  Name
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
                </label>
                <label>
                  Mobile
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="10 digits"
                  />
                </label>
                <label>
                  City
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} autoComplete="address-level2" />
                </label>
                <motion.button className="btn btn--block" type="submit" disabled={!valid} whileTap={valid ? { scale: 0.97 } : {}}>
                  Reserve for {inr(25000)}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="done"
                className="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <svg viewBox="0 0 52 52" width="64" height="64" aria-hidden="true">
                  <motion.circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                  <motion.path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
                </svg>
                <h3>You’re in, {form.name.split(' ')[0]}.</h3>
                <p className="muted">A VOLTA host in {form.city} will call you within a day to book your test drive.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}
