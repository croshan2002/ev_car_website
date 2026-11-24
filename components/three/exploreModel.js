import * as THREE from 'three'
import { EXPLODE, PARTS } from '@/lib/parts'

/*
 * Reads the car once, in its rest pose, and works out which mesh belongs to which part, where
 * each part is, and how each piece moves in the exploded view.
 *
 * "Car space" below is x forward, y up, z to the car's right: the world, when the car stands at
 * the origin facing +X.
 */
export function readModel(model, toCar) {
  model.updateWorldMatrix(true, true)
  const modelInv = model.matrixWorld.clone().invert()
  const m = new THREE.Matrix4()
  const box = new THREE.Box3()

  const meshes = []
  model.traverse((o) => {
    if (o.isMesh) meshes.push({ mesh: o, shown: o.visible, names: namesUp(o, model), part: null })
  })
  for (const e of meshes) e.part = partOf(e)

  const boxes = {}
  for (const p of PARTS) {
    const b = new THREE.Box3()
    for (const e of meshes) {
      if (!isShownFor(e, p)) continue
      const g = e.mesh.geometry
      if (!g.boundingBox) g.computeBoundingBox()
      m.multiplyMatrices(modelInv, e.mesh.matrixWorld).premultiply(toCar)
      b.union(box.copy(g.boundingBox).applyMatrix4(m))
    }
    if (!b.isEmpty()) boxes[p.id] = b
  }

  const pieces = []
  const q = new THREE.Quaternion()
  const carQ = new THREE.Quaternion().setFromRotationMatrix(toCar)
  const modelQ = new THREE.Quaternion().setFromRotationMatrix(modelInv)
  for (const [name, [fwd, up, right]] of Object.entries(EXPLODE)) {
    const node = model.getObjectByName(name)
    if (!node) continue
    // Parent space -> car space, so the offset can be turned back into parent space.
    node.parent.getWorldQuaternion(q).premultiply(modelQ).premultiply(carQ).invert()
    pieces.push({ node, base: node.position.clone(), offset: new THREE.Vector3(fwd, up, right).applyQuaternion(q) })
  }

  const list = meshes.filter((e) => e.shown)
  const byMesh = new Map(list.map((e) => [e.mesh, e]))
  return { meshes: list, byMesh, boxes, pieces }
}

function namesUp(o, root) {
  const names = []
  for (let n = o; n && n !== root; n = n.parent) if (n.name) names.push(n.name)
  return names
}

function partOf(e) {
  const mat = [].concat(e.mesh.material)[0]?.name ?? ''
  for (const name of e.names) {
    // The most specific match wins, e.g. mirror before door.
    const hits = PARTS.filter((p) => p.match.test(name) && (!p.mat || p.mat.test(mat)))
    if (hits.length) return hits.reduce((a, p) => (p.match.source.length > a.match.source.length ? p : a)).id
  }
  return null
}

// Is this mesh part of `p`, as it is viewed alone?
export function isShownFor(e, p) {
  return e.shown && e.part === p.id && (!p.focus || e.names.some((n) => p.focus.test(n)))
}
