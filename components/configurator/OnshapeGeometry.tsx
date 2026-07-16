'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Center } from '@react-three/drei'

interface OnshapeGeometryProps {
  geometryData: any
  isLoading?: boolean
  error?: string | null
  className?: string
}

// Onshape tessellatedfaces returns meters. Convert to inches for our scene scale.
const M_TO_IN = 39.37007874

/**
 * Renders real tessellated geometry from Onshape.
 * Coordinates arrive in meters → we scale to inches and keep Z-up → Y-up rotation.
 */
export function OnshapeGeometry({ geometryData, isLoading, error, className = '' }: OnshapeGeometryProps) {
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

            facet.vertices.forEach((v: any) => {
              // meters → inches
              allVertices.push(v.x * M_TO_IN, v.y * M_TO_IN, v.z * M_TO_IN)
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

    return { mesh, faceCount }
  }, [geometryData])

  if (isLoading) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="mb-2 h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-white mx-auto" />
          <div className="text-sm text-zinc-400">Loading precise Onshape preview…</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <div className="text-center text-red-400 text-sm px-4">{error}</div>
      </div>
    )
  }

  if (realGeometry && realGeometry.mesh) {
    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`}>
        <Canvas
          camera={{ position: [8, 6, 8], fov: 42 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[6, 10, 6]} intensity={1.4} />
          <directionalLight position={[-6, 4, -8]} intensity={0.7} />

          <Center>
            {/*
              Onshape is Z-up. Rotate -90° around X so Z becomes world Y (up).
            */}
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <primitive object={realGeometry.mesh} />
            </group>
          </Center>

          <OrbitControls enableDamping dampingFactor={0.12} target={[0, 0, 0]} />
        </Canvas>

        <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-mono tracking-[1.5px] text-emerald-400 backdrop-blur">
          LIVE ONSHAPE
        </div>
        <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-emerald-400">
          {realGeometry.faceCount.toLocaleString()} faces
        </div>
        {geometryData?.clamped && (
          <div className="absolute bottom-3 left-3 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
            Clamped to Onshape limits
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [0.22, 0.18, 0.22], fov: 42 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 10, 6]} intensity={1.2} />
        <mesh>
          <boxGeometry args={[4.72, 1.77, 3.74]} />
          <meshStandardMaterial color="#c8c8c8" metalness={0.9} roughness={0.3} />
        </mesh>
        <OrbitControls enableDamping dampingFactor={0.1} />
      </Canvas>

      <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-mono tracking-[1.5px] text-zinc-400 backdrop-blur">
        WAITING FOR ONSHAPE
      </div>
    </div>
  )
}
