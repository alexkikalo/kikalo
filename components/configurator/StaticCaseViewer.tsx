'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center } from '@react-three/drei'

interface StaticCaseViewerProps {
  dimensions?: {
    width: number
    depth: number
    height: number
  }
}

/**
 * Loads case.gltf and applies real-time scaling based on dimensions (in inches)
 * Original model is assumed to be exported at ~4.72 x 3.74 x 1.77 inches
 */
function CaseModel({ dimensions }: { dimensions?: { width: number; depth: number; height: number } }) {
  const { scene } = useGLTF('/models/case.gltf')

  // Original exported size (in inches) - adjust these if your export was different
  const ORIGINAL = { width: 4.72, depth: 3.74, height: 1.77 }

  let scaleX = 1
  let scaleY = 1
  let scaleZ = 1

  if (dimensions) {
    scaleX = dimensions.width / ORIGINAL.width
    scaleY = dimensions.height / ORIGINAL.height
    scaleZ = dimensions.depth / ORIGINAL.depth
  }

  return (
    <primitive
      object={scene}
      scale={[scaleX, scaleY, scaleZ]}
    />
  )
}

export function StaticCaseViewer({ dimensions }: StaticCaseViewerProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
      <Canvas
        camera={{ position: [0.18, 0.14, 0.18], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[6, 10, 6]} intensity={1.3} />
        <directionalLight position={[-6, 4, -8]} intensity={0.6} />

        <Center>
          <CaseModel dimensions={dimensions} />
        </Center>

        <OrbitControls enableDamping dampingFactor={0.12} />
      </Canvas>
    </div>
  )
}
