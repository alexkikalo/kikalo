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
 * Renders real geometry from Onshape
 * Correctly parses the actual Onshape tessellated faces response structure
 */
export function OnshapeGeometry({ geometryData, isLoading, error, className = '' }: OnshapeGeometryProps) {
  // Parse real Onshape tessellated data
  const realGeometry = useMemo(() => {
    if (!geometryData?.raw?.bodies) return null

    const allVertices: number[] = []
    let faceCount = 0

    try {
      geometryData.raw.bodies.forEach((body: any) => {
        if (!body.faces) return

        body.faces.forEach((face: any) => {
          if (!face.facets) return

          face.facets.forEach((facet: any) => {
            if (!facet.vertices || facet.vertices.length !== 3) return

            // Each facet is a triangle with exactly 3 vertices
            facet.vertices.forEach((v: any) => {
              allVertices.push(v.x, v.y, v.z)
            })

            faceCount++
          })
        })
      })
    } catch (e) {
      console.warn('Error parsing Onshape geometry:', e)
      return null
    }

    if (allVertices.length === 0) return null

    // Create one large BufferGeometry for performance
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(allVertices, 3))
    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: '#c8c8c8',
      metalness: 0.85,
      roughness: 0.35,
      side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(geometry, material)

    return {
      mesh,
      faceCount,
      vertexCount: allVertices.length / 3,
    }
  }, [geometryData])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 ${className}`}>
        <div className="text-center">
          <div className="text-sm text-zinc-400">Loading precise preview…</div>
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

  // Render real geometry if successfully parsed
  if (realGeometry && realGeometry.mesh) {
    return (
      <div className={`relative w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 ${className}`}>
        <Canvas
          camera={{ position: [0.15, 0.12, 0.15], fov: 45 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[0.2, 0.3, 0.2]} intensity={1.4} />
          <directionalLight position={[-0.2, 0.1, -0.25]} intensity={0.7} />

          <primitive object={realGeometry.mesh} />

          <OrbitControls enableDamping dampingFactor={0.12} />
        </Canvas>

        <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-emerald-400">
          Real Onshape geometry ({realGeometry.faceCount.toLocaleString()} faces)
        </div>
      </div>
    )
  }

  // Fallback placeholder
  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 ${className}`}>
      <Canvas
        camera={{ position: [0.12, 0.09, 0.12], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[0.2, 0.3, 0.2]} intensity={1.2} />
        <mesh>
          <boxGeometry args={[0.08, 0.06, 0.04]} />
          <meshStandardMaterial color="#c8c8c8" metalness={0.9} roughness={0.3} />
        </mesh>
        <OrbitControls enableDamping dampingFactor={0.1} />
      </Canvas>

      <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-zinc-400">
        Real geometry loading...
      </div>
    </div>
  )
}
