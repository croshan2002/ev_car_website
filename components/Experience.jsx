'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Nav from './sections/Nav'
import Hero from './sections/Hero'
import Design from './sections/Design'
import Performance from './sections/Performance'
import Configurator from './sections/Configurator'
import Reserve from './sections/Reserve'
import Specs from './sections/Specs'
import Faq from './sections/Faq'
import Footer from './sections/Footer'
import { PAINTS, TRIMS, WHEELS, scene, prefersReducedMotion } from '@/lib/store'
import { initSmoothScroll, ScrollTrigger, jumpToId } from '@/lib/smooth'
import { useTheme } from '@/lib/theme'

const Scene = dynamic(() => import('./three/Scene'), { ssr: false })

export default function Experience() {
  const [paint, setPaint] = useState(PAINTS[2])
  const [wheel, setWheel] = useState(WHEELS[0])
  const [trim, setTrim] = useState(TRIMS[1])
  const [curtain, setCurtain] = useState(null) // label shown during a section transition
  const [theme, toggleTheme] = useTheme()

  useEffect(() => {
    const stop = initSmoothScroll()
    const triggers = [...document.querySelectorAll('[data-stage]')].map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) scene.stage = el.dataset.stage
        },
      })
    )
    return () => {
      triggers.forEach((t) => t.kill())
      stop()
    }
  }, [])

  // Section "page transition": a curtain wipes up, we jump, the curtain wipes away.
  const go = useCallback((id, label) => {
    if (prefersReducedMotion) return jumpToId(id)
    setCurtain({ id, label })
  }, [])

  return (
    <>
      <Scene paint={paint} wheel={wheel} theme={theme} />
      <Nav go={go} theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero go={go} />
        <Design />
        <Performance trim={trim} />
        <Configurator
          paint={paint}
          setPaint={setPaint}
          wheel={wheel}
          setWheel={setWheel}
          trim={trim}
          setTrim={setTrim}
          go={go}
        />
        <Reserve paint={paint} wheel={wheel} trim={trim} />
        <Specs />
        <Faq />
      </main>
      <Footer />

      <AnimatePresence>
        {curtain && (
          <motion.div
            key={curtain.id}
            className="curtain"
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: 'inset(0% 0 0 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={(def) => {
              // Only act when the curtain has fully covered the screen.
              if (def.clipPath === 'inset(0% 0 0 0)') {
                jumpToId(curtain.id)
                setTimeout(() => setCurtain(null), 220)
              }
            }}
          >
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {curtain.label}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
