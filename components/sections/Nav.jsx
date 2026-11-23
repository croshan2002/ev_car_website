'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const LINKS = [
  ['design', 'Design'],
  ['perf', 'Performance'],
  ['config', 'Configure'],
  ['specs', 'Specs'],
  ['faq', 'FAQ'],
]

const Sun = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
  </svg>
)
const Moon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
  </svg>
)

export default function Nav({ go, theme, toggleTheme }) {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Real links so crawlers can follow them; clicks get the curtain transition instead.
  const link = (id, label) => (e) => {
    e.preventDefault()
    go(id, label)
  }
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <motion.header
      className={`nav ${solid ? 'nav--solid' : ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <a className="logo" href="#top" onClick={link('top', 'VOLTA')} aria-label="VOLTA Arc home">
        VOLTA
      </a>
      <nav className="nav__links" aria-label="Sections">
        {LINKS.map(([id, l]) => (
          <a key={id} href={`#${id}`} onClick={link(id, l)}>
            {l}
          </a>
        ))}
      </nav>
      <div className="nav__actions">
        <button className="theme-btn" onClick={toggleTheme} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
              transition={{ duration: 0.25 }}
            >
              {theme === 'dark' ? <Moon /> : <Sun />}
            </motion.span>
          </AnimatePresence>
        </button>
        <a className="btn btn--sm" href="#reserve" onClick={link('reserve', 'Reserve')}>
          Reserve
        </a>
      </div>
    </motion.header>
  )
}
