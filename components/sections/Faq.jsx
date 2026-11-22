'use client'

import { motion } from 'motion/react'
import { FAQ, SITE } from '@/lib/site'

// Same questions as the FAQPage JSON-LD, shown in full so answer engines can quote them.
export default function Faq() {
  return (
    <section id="faq" className="info" data-stage="reserve" aria-labelledby="faq-title">
      <div className="info__inner">
        <p className="mono">FAQ</p>
        <h2 id="faq-title" className="h2">
          {SITE.name}, answered
        </h2>
        <dl className="faq">
          {FAQ.map(({ q, a }, i) => (
            <motion.div
              key={q}
              className="faq__item"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: Math.min(i, 3) * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <dt>
                <h3>{q}</h3>
              </dt>
              <dd>{a}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  )
}
