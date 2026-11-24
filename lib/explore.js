'use client'

import { useSyncExternalStore } from 'react'

/*
 * The explorer: look at every part, or sit inside the car. UI state lives here; the 3D side
 * (components/three/Explore.jsx) reads it every frame. No three.js in this file.
 */
let state = {
  open: false,
  view: 'parts', // parts | inside
  part: null, // selected part id
  exploded: false,
  doors: false,
  seat: 'driver',
}
const listeners = new Set()

export const getExplore = () => state
export function setExplore(patch) {
  state = { ...state, ...patch }
  listeners.forEach((fn) => fn())
}
const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const useExplore = () => useSyncExternalStore(subscribe, getExplore, getExplore)

export const openExplore = (view) => setExplore({ open: true, view, part: null, exploded: false, doors: false, seat: 'driver' })
export const closeExplore = () => setExplore({ open: false, part: null, exploded: false, doors: false })

// Pointer input waiting to be used by the next 3D frame, and what the UI covers.
export const input = {
  dx: 0,
  dy: 0,
  zoom: 1,
  tap: null, // { x, y } in px
  inset: { left: 0, bottom: 0 }, // px of the screen covered by the panel
  pins: {}, // part id -> element placed over that part
}
