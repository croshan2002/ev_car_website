'use client'

import { useEffect, useRef } from 'react'
import { animate, useInView } from 'motion/react'
import { prefersReducedMotion } from '@/lib/store'

// Counts up when first seen, then animates between values when `value` changes.
export default function Counter({ value, decimals = 0, delay = 0 }) {
  const ref = useRef(null)
  const shown = useRef(0)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const fmt = (v) => v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

  useEffect(() => {
    if (!inView) return
    if (prefersReducedMotion) {
      ref.current.textContent = fmt(value)
      shown.current = value
      return
    }
    const c = animate(shown.current, value, {
      duration: shown.current === 0 ? 1.6 : 0.7,
      delay: shown.current === 0 ? delay : 0,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        shown.current = v
        if (ref.current) ref.current.textContent = fmt(v)
      },
    })
    return () => c.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value])

  return <span ref={ref}>{fmt(0)}</span>
}
