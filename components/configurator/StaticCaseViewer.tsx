'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center } from '@react-three/drei'
import { useMemo } from 'react'

interface StaticCaseViewerProps {
  dimensions?: {
    width: number
    depth: number
    height: number
  }
  className?: string
}

/**
 * Loads case.gltf (CAD Z-up) and applies real-time scaling.
 * Height control maps to the vertical axis (world Y).
 *
 * Model is assumed Z-up (common from Onshape/SolidWorks):
 *   local X = width, local Y = depth, local Z = height
 * We rotate -90° around X so local Z becomes world Y (up).
 */
function CaseModel({ dimensions }: { dimensions?: { width: number; depth: number; height: number } }) {
  const { scene } = useGLTF('/models/case.gltf')

  // Original exported size in inches (model local axes before rotation)
  const ORIGINAL = { width: 4.72, depth: 3.74, height: 1.77 }

  const { scale, rotation } = useMemo(() => {
    let sx = 1
    let sy = 1
    let sz = 1

    if (dimensions) {
      // Map controls → model local axes (Z-up):
      // X = width, Y = depth, Z = height
      sx = dimensions.width / ORIGINAL.width
      sy = dimensions.depth / ORIGINAL.depth
      sz = dimensions.height / ORIGINAL.height
    }

    return {
      // After rotation[-π/2, 0, 0]: localZ → worldY (vertical)
      scale: [sx, sy, sz] as [number, number, number],
      rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
    }
  }, [dimensions])

  return (
    <group rotation={rotation}>
      <primitive object={scene} scale={scale} />
    </group>
  )
}

export function StaticCaseViewer({ dimensions, className = '' }: StaticCaseViewerProps) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [0.22, 0.18, 0.22], fov: 42 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[6, 10, 6]} intensity={1.3} />
        <directionalLight position={[-6, 4, -8]} intensity={0.6} />

        <Center>
          <CaseModel dimensions={dimensions} />
        </Center>

        <OrbitControls enableDamping dampingFactor={0.12} target={[0, 0, 0]} />
      </Canvas>

      <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-mono tracking-[1.5px] text-zinc-400 backdrop-blur">
        CUSTOM PREVIEW
      </div>
    </div>
  )
}
