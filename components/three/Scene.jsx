'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshReflectorMaterial, useProgress } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'
import { easing } from 'maath'
import Car from './Car'
import { scene } from '@/lib/store'

// Showroom look per theme: a dark gallery, or a bright white studio.
const LOOK = {
  dark: { bg: '#07080b', floor: '#0b0d11', mix: 30, ambient: 0.25, key: 120, fog: [11, 24], bars: '#ffffff', env: 1 },
  light: { bg: '#eceef1', floor: '#c9cdd3', mix: 4, ambient: 0.9, key: 90, fog: [12, 30], bars: '#ffffff', env: 1.35 },
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
      <Car paint={paint} wheel={wheel} rig={rig} mobile={mobile} />
      {/* showroom floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={1024}
          mixBlur={1}
          mixStrength={look.mix}
          roughness={1}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color={look.floor}
          metalness={0.5}
        />
      </mesh>
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
  const { progress, active } = useProgress()
  return (
    <div className={`loadbar ${active ? '' : 'loadbar--done'}`} role="progressbar" aria-label="Loading 3D car" aria-valuenow={Math.round(progress)}>
      <span style={{ transform: `scaleX(${progress / 100})` }} />
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
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <>
      <LoadBar />
      <div className="canvas-wrap" aria-hidden="true">
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [0, 1.7, 9.2], fov: 32 }}
          gl={{ antialias: true }}
          onCreated={({ camera }) => camera.lookAt(0, 0.55, 0)}
        >
          <color attach="background" args={[look.bg]} />
          <fog attach="fog" args={[look.bg, ...look.fog]} />
          <Suspense fallback={null}>
            <ambientLight intensity={look.ambient} />
            <spotLight position={[0, 9, 2]} angle={0.5} penumbra={1} intensity={look.key} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
            <spotLight position={[-7, 3, 5]} angle={0.5} penumbra={1} intensity={40} color="#ffd9a8" />
            <Rig paint={paint} wheel={wheel} look={look} />
            <Environment resolution={512} environmentIntensity={look.env}>
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
