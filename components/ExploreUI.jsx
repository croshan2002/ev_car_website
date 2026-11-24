'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { PART, PARTS, PART_GROUPS, INSIDE_PINS } from '@/lib/parts'
import { closeExplore, getExplore, input, setExplore, useExplore } from '@/lib/explore'
import { pauseScroll } from '@/lib/smooth'

const ease = [0.22, 1, 0.36, 1]
const SEAT_NAMES = [
  ['left', 'Left'],
  ['driver', 'Driver'],
  ['right', 'Right'],
  ['rear', 'Rear'],
]

export default function ExploreUI() {
  const { open } = useExplore()
  return <AnimatePresence>{open && <Explorer key="explorer" />}</AnimatePresence>
}

function Explorer() {
  const { view, part, exploded, doors, seat } = useExplore()
  const root = useRef(null)
  const layer = useRef(null)
  const panel = useRef(null)
  const inside = view === 'inside'
  const selected = part && PART[part]

  // Take over the page while open: no scrolling, nothing behind can be focused.
  useEffect(() => {
    const before = document.activeElement
    const html = document.documentElement
    const behind = [...document.querySelectorAll('main, .nav, .footer')]
    html.classList.add('is-exploring')
    behind.forEach((el) => (el.inert = true))
    const resume = pauseScroll()
    root.current.focus({ preventScroll: true })
    return () => {
      html.classList.remove('is-exploring')
      behind.forEach((el) => (el.inert = false))
      resume()
      before?.focus?.({ preventScroll: true })
    }
  }, [])

  // Escape steps back: part, then out.
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        part ? setExplore({ part: null }) : closeExplore()
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [part])

  // Tell the camera how much of the screen the panel covers.
  useEffect(() => {
    const el = panel.current
    const measure = () => {
      const r = el.getBoundingClientRect()
      const sheet = window.innerWidth <= 820
      input.inset = { left: sheet ? 0 : r.width + r.left, bottom: sheet ? window.innerHeight - r.top : 0 }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Drag to turn, pinch or wheel to zoom, tap to pick.
  useEffect(() => {
    const el = layer.current
    const at = new Map()
    let travelled = 0
    let start = 0
    let multi = false
    const gap = () => {
      const [a, b] = [...at.values()]
      return Math.hypot(a.x - b.x, a.y - b.y)
    }
    const down = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      el.setPointerCapture(e.pointerId)
      at.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (at.size === 1) {
        travelled = 0
        start = performance.now()
        multi = false
      } else multi = true
    }
    const move = (e) => {
      const p = at.get(e.pointerId)
      if (!p) {
        // The dots let drags through to this layer, so their hover is handled here.
        const over = e.pointerType === 'mouse' ? pinAt(e.clientX, e.clientY) : null
        for (const id in input.pins) input.pins[id].classList.toggle('hover', id === over)
        el.style.cursor = over ? 'pointer' : ''
        return
      }
      const dx = e.clientX - p.x
      const dy = e.clientY - p.y
      const before = at.size === 2 ? gap() : 0
      p.x = e.clientX
      p.y = e.clientY
      travelled += Math.hypot(dx, dy)
      if (at.size === 2) input.zoom *= before / Math.max(1, gap())
      else if (at.size === 1 && travelled > 4) {
        input.dx += dx
        input.dy += dy
      }
    }
    const up = (e) => {
      if (!at.delete(e.pointerId)) return
      if (e.type !== 'pointerup' || multi || travelled >= 6 || performance.now() - start > 500) return
      const pin = pinAt(e.clientX, e.clientY)
      if (pin) setExplore({ part: getExplore().part === pin ? null : pin })
      else input.tap = { x: e.clientX, y: e.clientY }
    }
    const wheel = (e) => {
      e.preventDefault()
      input.zoom *= Math.exp(clampWheel(e) * 0.0012)
    }
    const key = (e) => {
      const step = 40
      const move = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key]
      if (move) {
        input.dx += move[0]
        input.dy += move[1]
      } else if (e.key === '+' || e.key === '=') input.zoom *= 0.88
      else if (e.key === '-') input.zoom *= 1.14
      else return
      e.preventDefault()
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    el.addEventListener('keydown', key)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('keydown', key)
    }
  }, [])

  // Keep the list where it was when returning from a part.
  const scroll = useRef(0)
  const body = useRef(null)
  useEffect(() => {
    if (body.current) body.current.scrollTop = part ? 0 : scroll.current
  }, [part, view])

  const step = (d) => {
    const i = PARTS.findIndex((p) => p.id === part)
    setExplore({ part: PARTS[(i + d + PARTS.length) % PARTS.length].id })
  }
  const choose = (id) => {
    scroll.current = body.current?.scrollTop ?? 0
    setExplore({ part: id })
  }

  return (
    <motion.div
      ref={root}
      className="xp"
      role="dialog"
      aria-modal="true"
      aria-label={inside ? 'Inside the VOLTA Arc' : 'Parts of the VOLTA Arc'}
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        ref={layer}
        className="xp__layer"
        tabIndex={0}
        role="application"
        aria-label={inside ? 'View from the seat. Arrow keys look around, plus and minus zoom.' : '3D car. Arrow keys turn it, plus and minus zoom.'}
      />

      {inside && (
        <div className="xp__pins">
          {Object.keys(INSIDE_PINS).map((id) => (
            <button
              key={id}
              ref={(el) => {
                if (el) input.pins[id] = el
                else delete input.pins[id]
              }}
              className={`xp__pin ${part === id ? 'on' : ''}`}
              style={{ visibility: 'hidden' }}
              onClick={() => setExplore({ part: part === id ? null : id })}
              aria-label={PART[id].name}
            >
              <i />
              <span>{PART[id].name}</span>
            </button>
          ))}
        </div>
      )}

      <motion.aside ref={panel} className="xp__panel" initial={{ x: -24 }} animate={{ x: 0 }} transition={{ duration: 0.5, ease }}>
        <div className="xp__tabs" role="tablist" aria-label="View">
          {[
            ['parts', 'All parts'],
            ['inside', 'Inside'],
          ].map(([id, l]) => (
            <button key={id} role="tab" aria-selected={view === id} className={`xp__tab ${view === id ? 'on' : ''}`} onClick={() => view !== id && setExplore({ view: id, part: null, exploded: false, seat: 'driver' })}>
              {l}
            </button>
          ))}
        </div>

        <div className="xp__body" ref={body} data-lenis-prevent>
          {selected ? (
            <motion.div key={part} className="xp__card" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
              <button className="xp__back" onClick={() => setExplore({ part: null })}>
                ← {inside ? 'Back to the cabin' : 'All parts'}
              </button>
              <p className="mono">{selected.group}</p>
              <h2 className="xp__title">{selected.name}</h2>
              <p className="xp__text">{selected.text}</p>
              <ul className="xp__specs">
                {selected.specs.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              {inside ? (
                <button className="btn btn--ghost btn--sm" onClick={() => setExplore({ view: 'parts' })}>
                  See it on its own
                </button>
              ) : (
                <div className="xp__steps">
                  <button className="btn btn--ghost btn--sm" onClick={() => step(-1)}>
                    ← Previous
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => step(1)}>
                    Next →
                  </button>
                </div>
              )}
            </motion.div>
          ) : inside ? (
            <div className="xp__card">
              <h2 className="xp__title">Sit inside</h2>
              <p className="xp__text">Drag to look around. Scroll or pinch to zoom. Tap a dot to learn about it.</p>
              <p className="xp__label">Seat</p>
              <div className="xp__seats" role="radiogroup" aria-label="Seat">
                {SEAT_NAMES.map(([id, l]) => (
                  <button key={id} role="radio" aria-checked={seat === id} className={`xp__seat ${seat === id ? 'on' : ''}`} onClick={() => setExplore({ seat: id })}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            PART_GROUPS.map((g) => (
              <section key={g} className="xp__group">
                <h3 className="xp__label">{g}</h3>
                <ul>
                  {PARTS.filter((p) => p.group === g).map((p) => (
                    <li key={p.id}>
                      <button className="xp__item" onClick={() => choose(p.id)}>
                        {p.name}
                        <span aria-hidden="true">→</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </motion.aside>

      <div className="xp__bar">
        {!inside && !part && (
          <button className={`xp__chip ${exploded ? 'on' : ''}`} aria-pressed={exploded} onClick={() => setExplore({ exploded: !exploded })}>
            {exploded ? 'Put it together' : 'Take it apart'}
          </button>
        )}
        {(inside || (!part && !exploded)) && (
          <button className={`xp__chip ${doors ? 'on' : ''}`} aria-pressed={doors} onClick={() => setExplore({ doors: !doors })}>
            {doors ? 'Close doors' : 'Open doors'}
          </button>
        )}
      </div>

      <button className="xp__close" onClick={closeExplore}>
        Exit
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>
    </motion.div>
  )
}

// The visible dot nearest to a point, within a finger's reach.
function pinAt(x, y) {
  let best = null
  let reach = 24
  for (const [id, el] of Object.entries(input.pins)) {
    if (el.style.visibility === 'hidden') continue
    const r = el.getBoundingClientRect()
    const d = Math.hypot(x - r.left - r.width / 2, y - r.top - r.height / 2)
    if (d < reach) {
      reach = d
      best = id
    }
  }
  return best
}

// Mouse wheels report lines or pages in some browsers; keep one notch to a sane size.
function clampWheel(e) {
  const px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY
  return Math.max(-240, Math.min(240, px))
}
