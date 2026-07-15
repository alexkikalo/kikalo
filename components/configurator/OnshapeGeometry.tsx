'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

interface OnshapeGeometryProps {
  geometryData: any
  isLoading?: boolean
  error?: string | null
  className?: string
}

/**
 * Component for rendering real geometry from Onshape
 * This is the foundation - we'll expand it to properly parse and render tessellated data
 */
export function OnshapeGeometry({ geometryData, isLoading, error, className = '' }: OnshapeGeometryProps) {
  // For now, create a simple placeholder mesh while we build the real parser
  const placeholderMesh = useMemo(() => {
    if (!geometryData) return null

    // TODO: Replace this with proper parsing of Onshape tessellated data
    // For now we show a simple box as placeholder
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({
      color: '#c8c8c8',
      metalness: 0.9,
      roughness: 0.3,
    })

    return { geometry, material }
  }, [geometryData])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 ${className}`}>
        <div className="text-center">
          <div className="text-sm text-zinc-400">Loading precise geometry...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 ${className}`}>
        <div className="text-center text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  if (!geometryData || !placeholderMesh) {
    return null
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 ${className}`}>
      <Canvas
        camera={{ position: [3, 2, 3], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <mesh geometry={placeholderMesh.geometry} material={placeholderMesh.material} />
        <OrbitControls enableDamping dampingFactor={0.1} />
      </Canvas>

      <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-zinc-400">
        Real Onshape geometry (placeholder)
      </div>
    </div>
  )
}
