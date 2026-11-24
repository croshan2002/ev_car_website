'use client'

import { useSyncExternalStore } from 'react'
import { prefersReducedMotion } from './store'

/*
 * Rotating the car. This file holds the input and the auto-rotate switch (no three.js, since the
 * page sections import it); components/three/freeRotate.js turns it into motion.
 *
 * - Auto: a slow showroom turntable in the sections below.
 * - Drag: press on the car and pull any way; it turns that way, right round if you keep going.
 */
export const STAGES = ['hero', 'config']
export const AUTO_SPEED = 0.45 // rad/s, about 14 s per full turn

// Dragging this many pixels turns the car a full 360°.
export const pixelsPerTurn = () => Math.min(1000, Math.max(420, window.innerWidth))

export const drag = {
  stage: null, // section the car is in, set every frame
  active: false, // pressed on the car
  moved: false, // pulled far enough in this section to count as a rotation
  dx: 0, // movement not yet applied to the car, in px
  dy: 0,
  hit: null, // (clientX, clientY) => is the car there? Set by the 3D scene.
}

let auto = !prefersReducedMotion
const listeners = new Set()
export function setAutoRotate(on) {
  auto = on
  listeners.forEach((fn) => fn())
}
const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const isAutoRotating = () => auto
export const useAutoRotate = () => [useSyncExternalStore(subscribe, isAutoRotating, () => true), setAutoRotate]

const CONTROLS = 'a, button, input, label, .nav, .cpanel, .xp'
const DEAD_ZONE = 4 // px, so a plain click doesn't count as a drag

export function initTurntableDrag() {
  const root = document.documentElement
  let id = null
  let x = 0
  let y = 0
  let travelled = 0

  const onCar = (target, cx, cy) =>
    STAGES.includes(drag.stage) &&
    !!target?.closest?.(`[data-stage="${drag.stage}"]`) &&
    !target.closest(CONTROLS) &&
    !!drag.hit?.(cx, cy)

  const down = (e) => {
    if (id !== null || (e.pointerType === 'mouse' && e.button !== 0)) return
    if (!onCar(e.target, e.clientX, e.clientY)) return
    id = e.pointerId
    x = e.clientX
    y = e.clientY
    travelled = 0
    drag.active = true
    root.classList.add('is-turning')
  }
  const move = (e) => {
    if (id === null) {
      if (e.pointerType === 'mouse') root.classList.toggle('over-car', onCar(e.target, e.clientX, e.clientY))
      return
    }
    if (e.pointerId !== id || !drag.active) return
    const dx = e.clientX - x
    const dy = e.clientY - y
    x = e.clientX
    y = e.clientY
    travelled += Math.hypot(dx, dy)
    if (travelled < DEAD_ZONE) return
    drag.moved = true
    drag.dx += dx
    drag.dy += dy
  }
  const end = () => {
    id = null
    drag.active = false
    root.classList.remove('is-turning')
  }
  const up = (e) => {
    if (e.pointerId === id) end()
  }
  // Touching the car rotates it; touching anywhere else still scrolls the page.
  const touch = (e) => {
    const t = e.changedTouches[0]
    if (e.touches.length === 1 && e.cancelable && onCar(e.target, t.clientX, t.clientY)) e.preventDefault()
  }

  window.addEventListener('pointerdown', down)
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
  window.addEventListener('blur', end)
  window.addEventListener('touchstart', touch, { passive: false })
  return () => {
    window.removeEventListener('pointerdown', down)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
    window.removeEventListener('blur', end)
    window.removeEventListener('touchstart', touch)
    end()
    root.classList.remove('over-car', 'is-tilted')
  }
}
