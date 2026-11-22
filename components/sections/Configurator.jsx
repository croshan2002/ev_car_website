'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, motion } from 'motion/react'
import { PAINTS, TRIMS, WHEELS, inr, scene, prefersReducedMotion } from '@/lib/store'

const TABS = [
  ['paint', 'Paint'],
  ['wheels', 'Wheels'],
  ['trim', 'Powertrain'],
]
const spring = { type: 'spring', stiffness: 450, damping: 36 }

function Price({ value }) {
  const ref = useRef(null)
  const from = useRef(value)
  useEffect(() => {
    if (prefersReducedMotion) {
      ref.current.textContent = inr(value)
      from.current = value
      return
    }
    const c = animate(from.current, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        from.current = v
        if (ref.current) ref.current.textContent = inr(v)
      },
    })
    return () => c.stop()
  }, [value])
  return <span ref={ref}>{inr(value)}</span>
}

function Toggle({ label, on, onChange }) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span className="toggle__track">
        <motion.span className="toggle__knob" layout transition={spring} />
      </span>
      {label}
    </button>
  )
}

export default function Configurator({ paint, setPaint, wheel, setWheel, trim, setTrim, go }) {
  const [tab, setTab] = useState('paint')
  const [door, setDoor] = useState(false)
  const [lights, setLights] = useState(true)

  useEffect(() => {
    scene.door = door
  }, [door])
  useEffect(() => {
    scene.lights = lights
  }, [lights])
  // Close the door when the visitor leaves the configurator.
  useEffect(() => () => (scene.door = false), [])

  const total = trim.price + paint.price + wheel.price

  return (
    <section id="config" className="section config" data-stage="config">
      <div className="config__controls">
        <Toggle label="Driver door" on={door} onChange={setDoor} />
        <Toggle label="Lights" on={lights} onChange={setLights} />
      </div>

      <div className="cpanel">
        <p className="mono">Configure</p>
        <h2 className="cpanel__title">VOLTA Arc</h2>

        <div className="ctabs" role="tablist">
          {TABS.map(([id, l]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={`ctab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>
              {l}
              {tab === id && <motion.span layoutId="ctab-line" className="ctab__line" transition={spring} />}
            </button>
          ))}
        </div>

        <div className="cbody">
          {/* Keyed so each tab fades in; no exit wait, so a quick tab switch never stalls. */}
          <motion.div key={tab} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
              {tab === 'paint' && (
                <>
                  <div className="paints" role="radiogroup" aria-label="Paint">
                    {PAINTS.map((p) => (
                      <button
                        key={p.id}
                        role="radio"
                        aria-checked={p.id === paint.id}
                        aria-label={p.name}
                        className="paint"
                        onClick={() => setPaint(p)}
                      >
                        {p.id === paint.id && <motion.span layoutId="paint-ring" className="paint__ring" transition={spring} />}
                        <span
                          className="paint__fill"
                          style={{
                            background:
                              p.rough > 0.5
                                ? p.hex
                                : `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.75), ${p.hex} 45%, ${p.hex})`,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="cline">
                    <span>{paint.name}</span>
                    <span className="muted">{paint.price ? `+ ${inr(paint.price)}` : 'Included'}</span>
                  </div>
                </>
              )}
              {tab === 'wheels' &&
                WHEELS.map((w) => (
                  <button key={w.id} className={`row-opt ${w.id === wheel.id ? 'on' : ''}`} onClick={() => setWheel(w)}>
                    <span>
                      <strong>{w.name}</strong>
                      <em>{w.note}</em>
                    </span>
                    <span className="muted">{w.price ? `+ ${inr(w.price)}` : 'Included'}</span>
                  </button>
                ))}
              {tab === 'trim' &&
                TRIMS.map((t) => (
                  <button key={t.id} className={`row-opt ${t.id === trim.id ? 'on' : ''}`} onClick={() => setTrim(t)}>
                    <span>
                      <strong>{t.name}</strong>
                      <em>
                        {t.range} km · {t.sprint} s · {t.power} kW
                      </em>
                    </span>
                    <span className="muted">{inr(t.price)}</span>
                  </button>
                ))}
          </motion.div>
        </div>

        <div className="cfoot">
          <div>
            <span className="muted small">Ex-showroom price</span>
            <strong className="ctotal">
              <Price value={total} />
            </strong>
          </div>
          <motion.button className="btn" whileTap={{ scale: 0.97 }} onClick={() => go('reserve', 'Reserve')}>
            Reserve →
          </motion.button>
        </div>
      </div>
    </section>
  )
}
