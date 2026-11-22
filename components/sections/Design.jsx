'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ScrollTrigger } from '@/lib/smooth'
import { scene } from '@/lib/store'

const STEPS = [
  { k: 'Cd 0.21', title: 'Drawn by the wind', text: 'A single unbroken line from nose to tail. Flush handles, sealed underbody and aero wheels add 40 km of range.' },
  { k: 'Light bar', title: 'A face you remember', text: 'One 1.5-metre LED blade with 2,400 pixels. It greets you, shows charge, and dips itself for oncoming traffic.' },
  { k: 'Full-width tail', title: 'Seen from a kilometre', text: 'The rear light wraps edge to edge, and the hatch opens to 620 litres with the seats up.' },
  { k: 'Glass roof', title: 'Sky, all the way back', text: '2.1 m² of laminated glass that blocks 99% of UV and dims at a touch.' },
]

export default function Design() {
  const ref = useRef(null)
  const [p, setP] = useState(0)

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scene.orbit = self.progress
        setP(self.progress)
      },
    })
    return () => st.kill()
  }, [])

  const i = Math.min(STEPS.length - 1, Math.round(p * (STEPS.length - 1)))
  const s = STEPS[i]

  return (
    <section id="design" ref={ref} className="design" data-stage="design">
      <div className="design__sticky">
        <div className="design__head">
          <p className="mono">Design</p>
          <p className="design__count mono">
            0{i + 1} <span>/ 0{STEPS.length}</span>
          </p>
        </div>
        <div className="design__copy">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="pill">{s.k}</span>
              <h2 className="h2">{s.title}</h2>
              <p className="lead">{s.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="design__track" aria-hidden="true">
          <span style={{ transform: `scaleX(${p})` }} />
        </div>
      </div>
    </section>
  )
}
