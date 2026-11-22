// Mutable state read by the 3D scene every frame.
export const scene = {
  stage: 'hero', // hero | design | perf | config | reserve
  orbit: 0, // 0..1 progress through the design tour
  door: false,
  lights: true,
  pointer: { x: 0, y: 0 },
}

export const PAINTS = [
  { id: 'glacier', name: 'Glacier White', hex: '#e9ecef', rough: 0.25, price: 0 },
  { id: 'obsidian', name: 'Obsidian Black', hex: '#0d0e10', rough: 0.2, price: 0 },
  { id: 'aurora', name: 'Aurora Blue', hex: '#1f4fd8', rough: 0.22, price: 95000 },
  { id: 'ember', name: 'Ember Red', hex: '#b3191f', rough: 0.22, price: 95000 },
  { id: 'dune', name: 'Dune Satin', hex: '#b9a888', rough: 0.55, price: 145000 },
  { id: 'graphite', name: 'Graphite Matte', hex: '#3a3d42', rough: 0.75, price: 145000 },
]

export const WHEELS = [
  { id: 'aero', name: '20" Aero', note: '+12 km range', price: 0 },
  { id: 'turbine', name: '21" Turbine', note: 'Forged, polished', price: 120000 },
  { id: 'sport', name: '21" Sport', note: 'Five-spoke, gloss black', price: 160000 },
]

export const TRIMS = [
  { id: 'rwd', name: 'Standard RWD', range: 520, sprint: 5.9, power: 286, price: 5490000 },
  { id: 'lr', name: 'Long Range AWD', range: 640, sprint: 4.4, power: 410, price: 6490000 },
  { id: 'perf', name: 'Performance', range: 590, sprint: 3.2, power: 580, price: 7990000 },
]

export const ACCENT = '#ffb547'

export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN')
export const lakh = (n) => `₹${(n / 100000).toFixed(2)} L`

export const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
