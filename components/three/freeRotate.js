import * as THREE from 'three'
import { easing } from 'maath'
import { AUTO_SPEED, STAGES, drag, isAutoRotating, pixelsPerTurn } from '@/lib/turntable'

/*
 * The car's orientation is split over two groups: `yaw` (heading, about its own up axis) inside
 * `tumble` (any tilt away from upright). Each drag turns the car about the screen's axes, then
 * the result is split back into the two, so the car always follows the mouse even upside down.
 */

const START_AFTER = { hero: 2.4, config: 1.4 } // seconds; let the car arrive in its pose first
const LEVEL_AFTER = 1 // seconds after letting go before it settles back onto its wheels
const MAX_SPIN = 9 // rad/s
const Y = new THREE.Vector3(0, 1, 0)
const IDENTITY = new THREE.Quaternion()

const damp = THREE.MathUtils.damp

export function createFreeRotate() {
  const q = new THREE.Quaternion()
  const step = new THREE.Quaternion()
  const twist = new THREE.Quaternion()
  const axis = new THREE.Vector3()
  const corner = new THREE.Vector3()
  const spin = new THREE.Vector2() // momentum about screen X and Y, rad/s
  let t = 0
  let idle = 0
  let turn = 0 // auto rotation added to the section's pose
  let auto = 0 // current auto speed, rad/s
  let dir = 1
  let free = false // the visitor has taken over the car in this section

  function rotate(ax, ay) {
    const a = Math.hypot(ax, ay)
    if (a < 1e-6) return
    q.premultiply(step.setFromAxisAngle(axis.set(ax / a, ay / a, 0), a))
  }

  // Split q into tumble * yaw.
  function split(tumble, yaw) {
    const len = Math.hypot(q.y, q.w)
    if (len > 1e-3) twist.set(0, q.y / len, 0, q.w / len)
    else twist.identity() // exactly upside down: any heading will do
    yaw.rotation.y = 2 * Math.atan2(twist.y, twist.w)
    tumble.quaternion.copy(q).multiply(step.copy(twist).invert()).normalize()
  }

  function update({ stage, tumble, yaw, pose, parallax, dt }) {
    if (stage !== drag.stage) {
      drag.stage = stage
      drag.moved = false
      drag.active = false
      drag.dx = drag.dy = 0
      document.documentElement.classList.remove('is-turning', 'over-car')
      t = idle = turn = auto = 0
      dir = 1
      free = false
      spin.set(0, 0)
    }
    const enabled = STAGES.includes(stage)
    t += dt

    if (enabled && drag.moved && !free) {
      free = true // from here on the car keeps whatever angle it has, so nothing jumps
      delete yaw.rotation.__damp
    }

    const wantAuto = enabled && isAutoRotating() && !drag.active && (free || t > START_AFTER[stage])

    if (!free) {
      auto = damp(auto, wantAuto ? AUTO_SPEED : 0, 1.6, dt)
      turn += auto * dt
      const settled = enabled ? THREE.MathUtils.clamp((t - 1.4) / 1.6, 0, 1) : 0
      easing.dampAngle(yaw.rotation, 'y', pose + turn + parallax, 0.6 - 0.5 * settled, dt)
      tumble.quaternion.slerp(IDENTITY, 1 - Math.exp(-5 * dt))
      return
    }

    q.copy(tumble.quaternion).multiply(yaw.quaternion)

    if (drag.active) {
      // Apply the movement over a couple of frames, which hides uneven mouse events.
      const k = 1 - Math.exp(-35 * dt)
      const radPerPx = (Math.PI * 2) / pixelsPerTurn()
      const ax = drag.dy * k
      const ay = drag.dx * k
      drag.dx -= ay
      drag.dy -= ax
      rotate(ax * radPerPx, ay * radPerPx)
      spin.x = damp(spin.x, (ax * radPerPx) / dt, 20, dt)
      spin.y = damp(spin.y, (ay * radPerPx) / dt, 20, dt)
      spin.clampLength(0, MAX_SPIN)
      idle = 0
      auto = 0
      if (Math.abs(spin.y) > 0.3) dir = Math.sign(spin.y) // keep turning the way it was thrown
    } else {
      drag.dx = drag.dy = 0
      idle += dt
      rotate(spin.x * dt, spin.y * dt)
      spin.multiplyScalar(Math.exp(-2.2 * dt))
      auto = damp(auto, wantAuto ? AUTO_SPEED * dir : 0, 1.2, dt)
    }

    split(tumble, yaw)

    if (!drag.active) {
      yaw.rotation.y += auto * dt
      // While rotating by itself the car returns to the floor. Paused, it stays as it was left.
      if (wantAuto && idle > LEVEL_AFTER) {
        const ramp = Math.min(1, (idle - LEVEL_AFTER) / 1)
        tumble.quaternion.slerp(IDENTITY, 1 - Math.exp(-3.2 * ramp * dt))
      }
    }
  }

  // How far the tipped car reaches below where its tyres stand. 0 when it stands level.
  function lowest(box, tumble, yaw) {
    q.copy(tumble.quaternion).multiply(step.setFromAxisAngle(Y, yaw.rotation.y))
    let min = Infinity
    for (let i = 0; i < 8; i++) {
      corner.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z)
      min = Math.min(min, corner.applyQuaternion(q).y)
    }
    return min - box.min.y
  }

  return { update, lowest }
}

// Box around every mesh of `model`, in the space of `frame`.
export function boxIn(frame, model) {
  frame.updateWorldMatrix(true, true)
  const toFrame = frame.matrixWorld.clone().invert()
  const m = new THREE.Matrix4()
  const part = new THREE.Box3()
  const box = new THREE.Box3()
  model.traverse((o) => {
    if (!o.isMesh || !o.visible) return
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox()
    part.copy(o.geometry.boundingBox).applyMatrix4(m.multiplyMatrices(toFrame, o.matrixWorld))
    box.union(part)
  })
  return box
}

// Returns (clientX, clientY) => whether that point is over the box. Cheap enough for every mouse move.
export function boxHitTest(box, frame, camera, canvas) {
  const padded = box.clone().expandByScalar(0.08)
  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const inv = new THREE.Matrix4()
  return (cx, cy) => {
    const r = canvas.getBoundingClientRect()
    ndc.set(((cx - r.left) / r.width) * 2 - 1, 1 - ((cy - r.top) / r.height) * 2)
    ray.setFromCamera(ndc, camera)
    ray.ray.applyMatrix4(inv.copy(frame.matrixWorld).invert())
    return ray.ray.intersectsBox(padded)
  }
}
