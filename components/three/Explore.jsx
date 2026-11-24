'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ACCENT, prefersReducedMotion, scene } from '@/lib/store'
import { getExplore, input, setExplore } from '@/lib/explore'
import { PART, INSIDE_PINS } from '@/lib/parts'
import { isShownFor } from './exploreModel'

const { damp, clamp, lerp, degToRad } = THREE.MathUtils

// The page's normal camera. Must match the <Canvas camera> in Scene.jsx.
export const HOME = { pos: new THREE.Vector3(0, 1.7, 9.2), look: new THREE.Vector3(0, 0.55, 0), fov: 32, near: 0.1 }

// Eye positions in car space (x forward, y up, z right) and where each one first looks.
export const SEATS = {
  driver: { eye: new THREE.Vector3(0.14, 0.92, 0), yaw: 0, pitch: -0.16 },
  left: { eye: new THREE.Vector3(-0.53, 0.92, -0.5), yaw: -0.22, pitch: -0.14 },
  right: { eye: new THREE.Vector3(-0.53, 0.92, 0.5), yaw: 0.22, pitch: -0.14 },
  rear: { eye: new THREE.Vector3(-1.3, 0.9, 0), yaw: 0, pitch: -0.12 },
}
const DOORWAY = new THREE.Vector3(-0.2, 1.15, 2.6) // the camera gets in and out past here
const TRAVEL = prefersReducedMotion ? 0.01 : 1.5 // seconds to fly between the page, the parts view and the cabin
const ORBIT = { theta: degToRad(38), phi: degToRad(72) }
const PINS = Object.entries(INSIDE_PINS).map(([id, at]) => ({ id, at: new THREE.Vector3(...at) }))
const PIN_AT = Object.fromEntries(PINS.map((p) => [p.id, p.at]))
const smooth = (t) => t * t * (3 - 2 * t)

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))

export default function Explore({ info, fog, env }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const world = useThree((s) => s.scene)
  const lamp = useRef()

  const s = useMemo(
    () => ({
      mode: 'home', // home | parts | inside
      key: '',
      // orbit camera: g* is the goal, the rest is where it is now
      target: new THREE.Vector3(0, 0.55, 0),
      gTarget: new THREE.Vector3(0, 0.55, 0),
      theta: ORBIT.theta,
      gTheta: ORBIT.theta,
      phi: ORBIT.phi,
      gPhi: ORBIT.phi,
      dist: 9,
      gDist: 9,
      fit: 9,
      // seat camera
      eye: SEATS.driver.eye.clone(),
      yaw: 0,
      gYaw: 0,
      pitch: 0,
      gPitch: 0,
      seatFov: 70,
      // flight between modes
      t: 1,
      fromPos: new THREE.Vector3(),
      fromLook: new THREE.Vector3(),
      via: null,
      // the rest
      idle: 0,
      explode: 0,
      glow: 0,
      isolated: null,
      insetX: 0,
      insetY: 0,
      fogPush: 0,
      envBoost: 1,
      lampPower: 0,
      seen: {}, // pins not hidden behind something from this seat
      seenSeat: null,
      toCheck: [],
    }),
    []
  )
  const v = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(), ndc: new THREE.Vector2(), ray: new THREE.Raycaster() }), [])
  const lastLook = useMemo(() => HOME.look.clone(), [])

  // A thin glowing skin over the part that was just picked.
  const glow = useMemo(
    () => ({
      mat: new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, toneMapped: false }),
      skins: [],
    }),
    []
  )
  const clearGlow = () => {
    glow.skins.forEach((k) => k.removeFromParent())
    glow.skins.length = 0
  }

  function isolate(id) {
    if (id === s.isolated) return
    s.isolated = id
    for (const e of info.meshes) e.mesh.visible = id ? isShownFor(e, PART[id]) || !!PART[id].with?.includes(e.part) : true
  }

  function light(id) {
    clearGlow()
    if (!id) return
    for (const e of info.meshes) {
      if (!isShownFor(e, PART[id])) continue
      const skin = new THREE.Mesh(e.mesh.geometry, glow.mat)
      skin.raycast = () => {}
      e.mesh.add(skin)
      glow.skins.push(skin)
    }
    s.glow = 1
  }

  useEffect(
    () => () => {
      clearGlow()
      isolate(null)
      info.pieces.forEach((p) => p.node.position.copy(p.base))
      glow.mat.dispose()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [info]
  )

  // How far back the camera must be for a ball of radius r to fit beside the panel.
  function fitDistance(r, fov) {
    const w = Math.max(0.3, 1 - input.inset.left / size.width)
    const h = Math.max(0.3, 1 - input.inset.bottom / size.height)
    const tan = Math.tan(degToRad(fov) / 2)
    return r / Math.min(tan * h, tan * (size.width / size.height) * w)
  }
  const orbitFov = () => (size.width < size.height ? 46 : 34)

  function frame(id, exploded) {
    const b = id && info.boxes[id]
    if (b) {
      b.getCenter(s.gTarget)
      const r = b.getSize(v.a).length() / 2
      s.fit = Math.max(0.7, fitDistance(r * 1.12, orbitFov()))
      const [around, above] = PART[id].from
      s.gTheta = s.theta + wrap(degToRad(around) - s.theta)
      s.gPhi = degToRad(90 - above)
    } else {
      s.gTarget.set(-0.1, exploded ? 0.75 : 0.5, 0)
      s.fit = fitDistance((exploded ? 3.5 : 2.3) * (size.width < size.height ? 1.12 : 1), orbitFov())
      s.gPhi = degToRad(exploded ? 62 : 74)
      s.gTheta = s.theta + wrap(ORBIT.theta - s.theta)
    }
    s.gDist = s.fit
  }

  function fly(mode) {
    s.fromPos.copy(camera.position)
    s.fromLook.copy(lastLook)
    s.via = s.mode === 'inside' || mode === 'inside' ? DOORWAY : null
    s.t = 0
    s.mode = mode
  }

  function pick(tap) {
    v.ndc.set((tap.x / size.width) * 2 - 1, 1 - (tap.y / size.height) * 2)
    v.ray.setFromCamera(v.ndc, camera)
    const hit = v.ray.intersectObjects(info.meshes.filter((e) => e.mesh.visible).map((e) => e.mesh), false)[0]
    const id = hit && info.byMesh.get(hit.object)?.part
    if (id) setExplore({ part: id })
  }

  // What can be seen depends on the seat only, so test each dot once per seat, one a frame.
  function checkPins(seat) {
    const eye = SEATS[seat].eye
    if (s.seenSeat !== seat) {
      if (s.eye.distanceTo(eye) > 0.05) return
      s.seenSeat = seat
      s.seen = {}
      s.toCheck = [...PINS]
    }
    const pin = s.toCheck.pop()
    if (!pin) return
    const dist = v.a.subVectors(pin.at, eye).length()
    v.ray.set(eye, v.a.normalize())
    const hit = v.ray
      .intersectObjects(info.meshes.map((e) => e.mesh), false)
      .find((h) => h.object.material.name !== 'Glass')
    s.seen[pin.id] = !hit || hit.distance > dist - 0.15 || info.byMesh.get(hit.object)?.part === pin.id
  }

  // Runs whenever the UI state changes.
  function apply(st) {
    const key = [st.open, st.view, st.part, st.exploded, st.seat].join()
    if (key === s.key) return
    const [wasOpen, wasView, wasPart, , wasSeat] = s.key.split(',')
    s.key = key
    const mode = !st.open ? 'home' : st.view
    if (mode !== s.mode) {
      if (mode === 'parts') {
        s.theta = s.gTheta = ORBIT.theta
        s.phi = s.gPhi = ORBIT.phi
        frame(st.part, st.exploded)
        s.target.copy(s.gTarget)
        s.dist = s.gDist
      }
      fly(mode)
    }
    s.idle = 0

    if (mode === 'parts') frame(st.part, st.exploded)
    if (mode === 'inside') {
      if (wasSeat !== st.seat) s.seen = {}
      const seat = SEATS[st.seat]
      if (wasSeat !== st.seat || wasView !== st.view || wasOpen !== 'true') {
        s.gYaw = seat.yaw
        s.gPitch = seat.pitch
        s.seatFov = size.width < size.height ? 82 : 70
        if (s.t === 0) {
          s.eye.copy(seat.eye)
          s.yaw = s.gYaw
          s.pitch = s.gPitch
        }
      }
      if (st.part && String(st.part) !== wasPart && info.boxes[st.part]) {
        if (PIN_AT[st.part]) v.a.copy(PIN_AT[st.part])
        else info.boxes[st.part].getCenter(v.a)
        v.a.sub(seat.eye).normalize()
        s.gYaw = s.yaw + wrap(Math.atan2(-v.a.z, v.a.x) - s.yaw)
        s.gPitch = clamp(Math.asin(v.a.y), -1.2, 1.2)
      }
    }

    isolate(mode === 'parts' ? st.part : null)
    light(mode === 'home' ? null : st.part)
  }

  useFrame((_, rawDt) => {
    const st = getExplore()
    apply(st)
    const dt = Math.min(rawDt, 1 / 20)
    const atHome = s.mode === 'home'
    if (atHome && s.t >= 1 && s.explode === 0) return

    if (input.tap) {
      if (!atHome && s.t >= 1) pick(input.tap)
      input.tap = null
    }
    const { dx, dy, zoom } = input
    input.dx = input.dy = 0
    input.zoom = 1
    const touched = dx !== 0 || dy !== 0 || zoom !== 1
    s.idle = touched ? 0 : s.idle + dt

    // Exploded view. The floor drops so the pieces and the camera have room underneath.
    const explodeTo = s.mode === 'parts' && st.exploded && !st.part ? 1 : 0
    s.explode = damp(s.explode, explodeTo, 4.5, dt)
    if (!explodeTo && s.explode < 1e-3) s.explode = 0
    info.pieces.forEach((p) => p.node.position.copy(p.base).addScaledVector(p.offset, s.explode))
    scene.exploreFloor = damp(scene.exploreFloor, s.mode === 'parts' ? (st.part ? -1.8 : -0.95 * explodeTo) : 0, 4, dt)

    // Where the camera wants to be
    let fov = HOME.fov
    if (s.mode === 'parts') {
      s.gTheta -= dx * 0.0065
      s.gPhi = clamp(s.gPhi - dy * 0.0055, 0.12, st.part ? 2.6 : 1.5)
      s.gDist = clamp(s.gDist * zoom, Math.max(0.45, s.fit * 0.35), s.fit * 1.6)
      if (st.part && s.idle > 2 && !prefersReducedMotion) s.gTheta += 0.35 * dt
      const k = s.idle < 0.25 ? 14 : 5
      s.theta = damp(s.theta, s.gTheta, k, dt)
      s.phi = damp(s.phi, s.gPhi, k, dt)
      s.dist = damp(s.dist, s.gDist, 6, dt)
      s.target.lerp(s.gTarget, 1 - Math.exp(-5 * dt))
      v.look.copy(s.target)
      // theta 0 looks at the car's right side, 90 degrees at its nose
      v.pos.set(Math.sin(s.theta) * Math.sin(s.phi), Math.cos(s.phi), Math.cos(s.theta) * Math.sin(s.phi)).multiplyScalar(s.dist).add(s.target)
      v.pos.y = Math.max(v.pos.y, scene.exploreFloor + 0.12)
      fov = orbitFov()
    } else if (s.mode === 'inside') {
      const k = 0.0042 * (s.seatFov / 70)
      s.gYaw += dx * k
      s.gPitch = clamp(s.gPitch + dy * k, -1.25, 1.25)
      s.seatFov = clamp(s.seatFov * zoom, 28, 88)
      const f = s.idle < 0.25 ? 16 : 5
      s.yaw = damp(s.yaw, s.gYaw, f, dt)
      s.pitch = damp(s.pitch, s.gPitch, f, dt)
      s.eye.lerp(SEATS[st.seat].eye, 1 - Math.exp(-4 * dt))
      v.pos.copy(s.eye)
      v.look.set(Math.cos(s.pitch) * Math.cos(s.yaw), Math.sin(s.pitch), -Math.cos(s.pitch) * Math.sin(s.yaw)).add(s.eye)
      fov = s.seatFov
    } else {
      v.pos.copy(HOME.pos)
      v.look.copy(HOME.look)
    }

    // Flying between modes: a straight line, or a bend through the doorway.
    if (s.t < 1) {
      s.t = Math.min(1, s.t + dt / (s.via ? TRAVEL * 1.6 : TRAVEL))
      const t = smooth(s.t)
      if (s.via) {
        v.a.lerpVectors(s.fromPos, s.via, t)
        v.b.lerpVectors(s.via, v.pos, t)
        v.pos.lerpVectors(v.a, v.b, t)
      } else v.pos.lerpVectors(s.fromPos, v.pos, t)
      v.look.lerpVectors(s.fromLook, v.look, t)
    }
    scene.enteringCar = s.t < 0.95 && !!s.via
    camera.position.copy(v.pos)
    camera.lookAt(v.look)
    lastLook.copy(v.look)

    // Lens. The near plane comes in close for the cabin; the view shifts clear of the panel.
    const done = atHome && s.t >= 1
    const inset = atHome ? { left: 0, bottom: 0 } : input.inset
    s.insetX = done ? 0 : damp(s.insetX, inset.left, 5, dt)
    s.insetY = done ? 0 : damp(s.insetY, inset.bottom, 5, dt)
    camera.fov = done ? HOME.fov : damp(camera.fov, fov, s.t < 1 ? 4 : 10, dt)
    camera.near = s.mode === 'inside' || s.via ? 0.03 : HOME.near
    if (done) {
      camera.near = HOME.near
      camera.clearViewOffset()
      s.via = null
    } else camera.setViewOffset(size.width, size.height, -s.insetX / 2, s.insetY / 2, size.width, size.height)
    camera.updateProjectionMatrix()

    s.fogPush = done ? 0 : damp(s.fogPush, atHome ? 0 : 14, 4, dt)
    if (world.fog) {
      world.fog.near = fog[0] + s.fogPush
      world.fog.far = fog[1] + s.fogPush
    }

    // Black parts need more to reflect once they are on their own or pulled apart.
    const boost = s.mode === 'parts' && (st.part || st.exploded) ? 2.2 / env : s.mode === 'inside' ? 1.3 : 1
    s.envBoost = done ? 1 : damp(s.envBoost, boost, 4, dt)
    world.environmentIntensity = env * s.envBoost

    // A soft light: by the camera for parts, overhead in the cabin. Off on the page.
    const power = s.mode === 'inside' ? 0.9 : s.mode === 'parts' ? (st.part ? Math.max(1.2, s.dist * s.dist * 3) : 22) : 0
    s.lampPower = done ? 0 : damp(s.lampPower, power, 4, dt)
    lamp.current.intensity = s.lampPower
    if (s.mode === 'inside') lamp.current.position.set(s.eye.x + 0.05, 0.82, s.eye.z * 0.8)
    else lamp.current.position.copy(camera.position)

    // Highlight fades out
    if (s.glow > 0) {
      s.glow = Math.max(0, s.glow - dt / 1.6)
      glow.mat.opacity = 0.55 * smooth(s.glow)
      if (s.glow === 0) clearGlow()
    }

    // Dots over the parts seen from the seat
    const showPins = s.mode === 'inside' && s.t >= 1
    if (showPins) checkPins(st.seat)
    for (const { id, at } of PINS) {
      const el = input.pins[id]
      if (!el) continue
      let on = showPins && s.seen[id]
      if (on) {
        camera.updateMatrixWorld()
        v.a.copy(at)
        on = v.b.copy(v.a).applyMatrix4(camera.matrixWorldInverse).z < -0.15
        v.a.project(camera)
        on = on && Math.abs(v.a.x) < 1 && Math.abs(v.a.y) < 1
        if (on) el.style.transform = `translate(${((v.a.x + 1) / 2) * size.width}px, ${((1 - v.a.y) / 2) * size.height}px)`
      }
      el.style.visibility = on ? 'visible' : 'hidden'
    }
  })

  // Always present (at zero) so switching it on never forces every shader to recompile.
  return <pointLight ref={lamp} intensity={0} distance={0} decay={2} />
}
