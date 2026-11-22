'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { easing } from 'maath'
import { scene, ACCENT } from '@/lib/store'

/*
 * Real car model: "Car Concept" by Eric Chadwick / Darmstadt Graphics Group, CC BY 4.0
 * (Khronos glTF-Sample-Assets), compressed with glTF-Transform (meshopt + WebP).
 * The Khronos logos on the licence plate and rim caps are removed below, since the
 * licence excludes them.
 *
 * Model space: the body is Z-up with the nose at -Y; its root node turns that into
 * Y-up with the nose at +Z. We turn it once more so the nose points to +X, which is
 * what POSES and TOUR below were written for.
 */

export const CAR_URL = '/models/car.glb'
const WHEEL_R = 0.384
const CENTER_X = -0.23 // shifts the car so its wheelbase sits on the origin
const WHEEL_NODES = ['WheelFrontL', 'WheelFrontR', 'WheelRearL', 'WheelRearR']

// [color, roughness, metalness] for the polished face and the inner barrel of each rim.
const RIMS = {
  aero: { face: ['#c9ced6', 0.22, 1], inner: ['#2a2d33', 0.4, 0.3] },
  turbine: { face: ['#f3f5f8', 0.05, 1], inner: ['#5b616b', 0.28, 0.8] },
  sport: { face: ['#17191c', 0.16, 0.6], inner: ['#0a0b0d', 0.35, 0.2] },
}

function prepare(model) {
  if (model.userData.parts) return model.userData.parts // useMemo runs twice in Strict Mode

  const byMat = {}
  model.traverse((o) => {
    if (!o.isMesh) return
    o.castShadow = true
    o.receiveShadow = true
    ;(Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      ;(byMat[m.name] ??= new Set()).add(m)
    })
  })
  const mats = (name) => [...(byMat[name] ?? [])]

  // Remove third-party logos.
  const plate = model.getObjectByName('License Plate')
  if (plate) plate.visible = false
  ;[...mats('Rim1'), ...mats('Rim2')].forEach((m) => {
    m.emissiveMap = null
    m.emissive.set(0x000000)
    m.needsUpdate = true
  })

  // Brand-coloured brake calipers.
  mats('Brake').forEach((m) => {
    m.color.set(ACCENT)
    m.roughness = 0.35
  })

  // Wheels come out of the file steered and at random spin angles. Straighten them, then
  // put everything except the brake caliper in a group that we spin about the axle (local X).
  const wheels = WHEEL_NODES.map((n) => {
    const w = model.getObjectByName(n)
    w.quaternion.identity()
    const spin = new THREE.Group()
    ;[...w.children].forEach((c) => {
      if (!/BrakePad/.test(c.name)) spin.add(c)
    })
    w.add(spin)
    return spin
  })

  const parts = {
    paint: mats('Paint 1 Carmine'),
    head: mats('Headlight'),
    tail: mats('Brakelight'),
    rimFace: mats('Rim2'),
    rimInner: mats('Rim1'),
    door: model.getObjectByName('BodyDoorRColor1'), // right-hand (driver) door faces the camera
    wheels,
  }
  // Softer metallic flake: the file's flake normal map reads as grain at showroom distance.
  parts.paint.forEach((m) => m.normalScale?.setScalar(0.12))

  model.userData.parts = parts
  return parts
}

/* ------------------------------------------------------------------ */

const TOUR = [
  { ry: 0, tilt: 0 },
  { ry: -1.15, tilt: 0.02 },
  { ry: -3.85, tilt: 0.04 },
  { ry: -5.45, tilt: 0.42 },
]
function tourPose(p) {
  const n = TOUR.length - 1
  const f = Math.min(n - 0.0001, Math.max(0, p * n))
  const i = Math.floor(f)
  let t = f - i
  t = t * t * (3 - 2 * t)
  return {
    ry: THREE.MathUtils.lerp(TOUR[i].ry, TOUR[i + 1].ry, t),
    tilt: THREE.MathUtils.lerp(TOUR[i].tilt, TOUR[i + 1].tilt, t),
  }
}

const POSES = {
  hero: { x: 0.5, ry: -0.62 },
  design: { x: 0.6, ry: 0 },
  perf: { x: 1.4, ry: 0.02 },
  config: { x: -1.25, ry: -0.58 },
  reserve: { x: 16, ry: 0 },
}

export default function Car({ paint, wheel, rig, mobile }) {
  const car = useRef()
  const spin = useRef(0)
  const lastPos = useMemo(() => new THREE.Vector3(-14, 0, 0), [])
  const tmp = useMemo(() => new THREE.Color(), [])
  const fwd = useMemo(() => new THREE.Vector3(), [])
  const delta = useMemo(() => new THREE.Vector3(), [])

  const { scene: model } = useGLTF(CAR_URL, false)
  const parts = useMemo(() => prepare(model), [model])

  useEffect(() => {
    const r = RIMS[wheel.id] ?? RIMS.aero
    const set = (list, [c, rough, metal]) =>
      list.forEach((m) => {
        m.color.set(c)
        m.roughness = rough
        m.metalness = metal
      })
    set(parts.rimFace, r.face)
    set(parts.rimInner, r.inner)
  }, [wheel, parts])

  useFrame((_, dt) => {
    // Paint: gloss paints get metallic flake, satin/matte ones go flat.
    const matte = paint.rough > 0.5
    tmp.set(paint.hex)
    parts.paint.forEach((m) => {
      easing.dampC(m.color, tmp, 0.35, dt)
      m.roughness = THREE.MathUtils.damp(m.roughness, paint.rough, 5, dt)
      m.metalness = THREE.MathUtils.damp(m.metalness, matte ? 0.25 : 0.55, 5, dt)
      m.clearcoat = matte ? 0.1 : 1
      m.clearcoatRoughness = matte ? 0.6 : 0.04
    })

    // Lights
    const on = scene.lights
    parts.head.forEach((m) => (m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, on ? 6 : 0.1, 8, dt)))
    parts.tail.forEach((m) => (m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, on ? 3 : 0.4, 8, dt)))

    // Pose
    const p = POSES[scene.stage] ?? POSES.hero
    let ry = p.ry
    let tilt = 0
    if (scene.stage === 'design') {
      const tp = tourPose(scene.orbit)
      ry = tp.ry
      tilt = tp.tilt
    }
    const x = mobile && scene.stage !== 'reserve' ? 0 : p.x
    easing.damp3(car.current.position, [x, 0, 0], scene.stage === 'reserve' ? 1.2 : 0.75, dt)
    easing.dampAngle(car.current.rotation, 'y', ry + scene.pointer.x * 0.06, 0.6, dt)
    easing.dampAngle(rig.current.rotation, 'x', tilt, 0.6, dt)

    // Roll the wheels by the distance travelled along the car's heading.
    fwd.set(Math.cos(car.current.rotation.y), 0, -Math.sin(car.current.rotation.y))
    spin.current += delta.copy(car.current.position).sub(lastPos).dot(fwd) / WHEEL_R
    lastPos.copy(car.current.position)
    parts.wheels.forEach((w) => (w.rotation.x = -spin.current))

    // Door swings outward about its front hinge.
    if (parts.door) easing.dampAngle(parts.door.rotation, 'z', scene.door ? 1.0 : 0, 0.45, dt)
  })

  return (
    <group ref={car} position={[-14, 0, 0]}>
      <group position={[CENTER_X, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <primitive object={model} />
      </group>
    </group>
  )
}

useGLTF.preload(CAR_URL, false)
