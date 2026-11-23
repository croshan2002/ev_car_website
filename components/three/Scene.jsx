'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshReflectorMaterial, useProgress } from '@react-three/drei'
import { Suspense, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { easing } from 'maath'
import Car from './Car'
import { scene, isCarReady, onCarReady } from '@/lib/store'
import { initTurntableDrag } from '@/lib/turntable'

// Showroom look per theme: a dark gallery, or a bright white studio.
const LOOK = {
  dark: { bg: '#07080b', floor: '#0b0d11', mix: 30, mirror: 0, bias: 0.25, metal: 0.5, ambient: 0.25, key: 120, fog: [11, 24], bars: '#ffffff', env: 1 },
  light: { bg: '#eceef1', floor: '#c9cdd3', mix: 1.35, mirror: 0.3, bias: 1, metal: 0, ambient: 0.9, key: 90, fog: [12, 30], bars: '#ffffff', env: 1.35 },
}

// drei multiplies the reflection into the base colour. On a part-metal floor a bright reflection
// then pushes the specular colour past 1, where three's multi-scattering term flips sign and
// paints neon cyan / magenta / yellow patches. Capping the colour keeps it in range.
function capReflection(mat) {
  const compile = Object.getPrototypeOf(mat).onBeforeCompile
  mat.onBeforeCompile = function (shader) {
    compile.call(this, shader)
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_physical_fragment>',
      `if (metalness > 0.0) diffuseColor.rgb = min(diffuseColor.rgb, vec3(1.0));
      #include <lights_physical_fragment>`
    )
  }
}

function Floor({ look }) {
  const mat = useRef()
  const mesh = useRef()
  useFrame(() => {
    mesh.current.position.y = scene.floorY
  })
  // Set on the material directly: as props, these would make drei rebuild the reflection
  // buffers on every theme switch.
  useLayoutEffect(() => capReflection(mat.current), [])
  useLayoutEffect(() => {
    mat.current.mixStrength = look.mix
    mat.current.mirror = look.mirror
    mat.current.depthToBlurRatioBias = look.bias // 1 = no bright outline around the car's reflection
  }, [look])

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        ref={mat}
        blur={[300, 80]}
        resolution={512}
        mixBlur={1}
        roughness={1}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color={look.floor}
        metalness={look.metal}
      />
    </mesh>
  )
}

function Rig({ paint, wheel, look }) {
  const rig = useRef()
  const { size } = useThree()
  const mobile = size.width < 820

  useFrame((_, dt) => {
    const s = mobile ? Math.min(0.55, size.width / 800) : Math.min(0.95, size.width / 1600 + 0.06)
    const y = mobile ? 0.95 : -0.15
    easing.damp3(rig.current.scale, [s, s, s], 0.4, dt)
    easing.damp3(rig.current.position, [0, y, 0], 0.4, dt)
  })

  return (
    <group ref={rig}>
      {/* own boundary, so the showroom shows while the car downloads */}
      <Suspense fallback={null}>
        <Car paint={paint} wheel={wheel} rig={rig} mobile={mobile} />
      </Suspense>
      <Floor look={look} />
      {/* overhead light bars, mostly seen in reflections */}
      {[-2.4, 0, 2.4].map((z) => (
        <mesh key={z} position={[0, 5.2, z - 1]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[9, 0.12]} />
          <meshBasicMaterial color={look.bars} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function LoadBar() {
  const progress = useProgress((s) => s.progress)
  const ready = useSyncExternalStore(onCarReady, isCarReady, () => false)
  const shown = ready ? 100 : Math.max(10, progress * 0.9) // last 10% is shader warm-up
  return (
    <div className={`loadbar ${ready ? 'loadbar--done' : ''}`} role="progressbar" aria-label="Loading 3D car" aria-valuenow={Math.round(shown)}>
      <span style={{ transform: `scaleX(${shown / 100})` }} />
    </div>
  )
}

export default function Scene({ paint, wheel, theme = 'dark' }) {
  const look = LOOK[theme] ?? LOOK.dark

  useEffect(() => {
    const onMove = (e) => {
      scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      scene.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const stopDrag = initTurntableDrag()
    return () => {
      window.removeEventListener('pointermove', onMove)
      stopDrag()
    }
  }, [])

  return (
    <>
      <LoadBar />
      <div className="canvas-wrap" aria-hidden="true">
        <Canvas
          shadows="percentage"
          dpr={[1, 1.75]}
          camera={{ position: [0, 1.7, 9.2], fov: 32 }}
          gl={{ antialias: true }}
          onCreated={({ camera }) => camera.lookAt(0, 0.55, 0)}
        >
          <color attach="background" args={[look.bg]} />
          <fog attach="fog" args={[look.bg, ...look.fog]} />
          <Suspense fallback={null}>
            <ambientLight intensity={look.ambient} />
            <spotLight position={[0, 9, 2]} angle={0.5} penumbra={1} intensity={look.key} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0001} />
            <spotLight position={[-7, 3, 5]} angle={0.5} penumbra={1} intensity={40} color="#ffd9a8" />
            <Rig paint={paint} wheel={wheel} look={look} />
            <Environment resolution={256} environmentIntensity={look.env}>
              <Lightformer form="rect" intensity={4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 2, 1]} />
              <Lightformer form="rect" intensity={2} position={[0, 6, -3]} rotation-x={Math.PI / 2} scale={[12, 1, 1]} />
              <Lightformer form="rect" intensity={2} position={[0, 6, 3]} rotation-x={Math.PI / 2} scale={[12, 1, 1]} />
              <Lightformer form="rect" intensity={1.5} position={[-8, 1.5, 0]} rotation-y={Math.PI / 2} scale={[12, 1.2, 1]} />
              <Lightformer form="rect" intensity={1.5} position={[8, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[12, 1.2, 1]} />
              <Lightformer form="ring" intensity={1.2} color="#ffb547" position={[0, 2, 9]} scale={4} />
            </Environment>
          </Suspense>
        </Canvas>
      </div>
    </>
  )
}
