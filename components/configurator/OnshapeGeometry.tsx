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
 * This version includes basic support for real tessellated data
 */
export function OnshapeGeometry({ geometryData, isLoading, error, className = '' }: OnshapeGeometryProps) {
  // Try to build real meshes from Onshape data
  const realMeshes = useMemo(() => {
    if (!geometryData?.raw?.bodies) return null

    const meshes: THREE.Mesh[] = []

    try {
      geometryData.raw.bodies.forEach((body: any, bodyIndex: number) => {
        if (!body.faces) return

        body.faces.forEach((face: any, faceIndex: number) => {
          if (!face.vertices || face.vertices.length === 0) return

          // Create geometry from vertices
          const vertices = new Float32Array(face.vertices.flat())
          const geometry = new THREE.BufferGeometry()
          geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

          // Create indices if available
          if (face.indices && face.indices.length > 0) {
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(face.indices.flat()), 1))
          }

          geometry.computeVertexNormals()

          const material = new THREE.MeshStandardMaterial({
            color: bodyIndex === 0 ? '#c8c8c8' : '#a8a8a8',
            metalness: 0.85,
            roughness: 0.35,
            side: THREE.DoubleSide,
          })

          const mesh = new THREE.Mesh(geometry, material)
          meshes.push(mesh)
        })
      })
    } catch (e) {
      console.warn('Error parsing Onshape geometry:', e)
      return null
    }

    return meshes.length > 0 ? meshes : null
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

  // Render real geometry if available
  if (realMeshes && realMeshes.length > 0) {
    return (
      <div className={`relative w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 ${className}`}>
        <Canvas
          camera={{ position: [4, 3, 4], fov: 45 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[8, 12, 6]} intensity={1.3} />
          <directionalLight position={[-6, 4, -8]} intensity={0.6} />

          {realMeshes.map((mesh, index) => (
            <primitive key={index} object={mesh} />
          ))}

          <OrbitControls enableDamping dampingFactor={0.12} />
        </Canvas>

        <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-emerald-400">
          Real Onshape geometry
        </div>
      </div>
    )
  }

  // Fallback placeholder while real data is not yet available
  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 ${className}`}>
      <Canvas
        camera={{ position: [3, 2, 3], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
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
