'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { NovaShellVariant } from '@/lib/variants'

interface EnclosureModelProps {
  variant: NovaShellVariant
  customOverrides?: { wallThickness?: number; showVents?: boolean; portStyle?: 'pi5' | 'generic' | 'none' }
  autoRotate?: boolean
}

export function EnclosureModel({ variant, customOverrides, autoRotate = false }: EnclosureModelProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const { width, depth, height } = variant.dimensions
  const wallThickness = customOverrides?.wallThickness ?? 3.2
  const showVents = customOverrides?.showVents ?? true
  const portStyle = customOverrides?.portStyle ?? (variant.id.includes('pi') ? 'pi5' : variant.id.includes('proto') ? 'generic' : 'none')

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08
    }
  })

  const aluminumMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c8c8c8', metalness: 0.92, roughness: 0.28, envMapIntensity: 0.9 }), [])
  const darkerAluminum = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a8a8a8', metalness: 0.88, roughness: 0.35 }), [])
  const hardwareMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a4a4a', metalness: 0.95, roughness: 0.2 }), [])

  const centerY = height / 2

  return (
    <group ref={groupRef}>
      <RoundedBox args={[width, wallThickness + 0.8, depth]} radius={1.8} position={[0, wallThickness / 2 + 0.4, 0]} castShadow receiveShadow>
        <primitive object={aluminumMaterial} attach="material" />
      </RoundedBox>
      <RoundedBox args={[width + 0.6, wallThickness, depth + 0.6]} radius={1.6} position={[0, height - wallThickness / 2, 0]} castShadow receiveShadow>
        <primitive object={aluminumMaterial} attach="material" />
      </RoundedBox>
      <RoundedBox args={[wallThickness, height - wallThickness * 1.8, depth - wallThickness * 1.2]} radius={1.2} position={[-width / 2 + wallThickness / 2, centerY, 0]} castShadow receiveShadow>
        <primitive object={darkerAluminum} attach="material" />
      </RoundedBox>
      <RoundedBox args={[wallThickness, height - wallThickness * 1.8, depth - wallThickness * 1.2]} radius={1.2} position={[width / 2 - wallThickness / 2, centerY, 0]} castShadow receiveShadow>
        <primitive object={darkerAluminum} attach="material" />
      </RoundedBox>
      <group position={[0, centerY, -depth / 2 + wallThickness / 2]}>
        <RoundedBox args={[width - wallThickness * 1.6, height - wallThickness * 1.8, wallThickness]} radius={1.2} castShadow receiveShadow>
          <primitive object={darkerAluminum} attach="material" />
        </RoundedBox>
        {portStyle === 'pi5' && (
          <>
            <mesh position={[width * 0.22, -4, wallThickness / 2 + 0.1]} castShadow>
              <boxGeometry args={[22, 8, 1.5]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.8} />
            </mesh>
            <mesh position={[width * 0.22, 6, wallThickness / 2 + 0.1]} castShadow>
              <boxGeometry args={[18, 6, 1.5]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.8} />
            </mesh>
            <mesh position={[-width * 0.18, -2, wallThickness / 2 + 0.1]} castShadow>
              <boxGeometry args={[16, 10, 1.5]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.8} />
            </mesh>
          </>
        )}
      </group>
      <RoundedBox args={[width - wallThickness * 1.6, height - wallThickness * 1.8, wallThickness]} radius={1.2} position={[0, centerY, depth / 2 - wallThickness / 2]} castShadow receiveShadow>
        <primitive object={darkerAluminum} attach="material" />
      </RoundedBox>
      {showVents && (variant.id.includes('pi') || variant.id.includes('sbc') || variant.id.includes('tall')) && (
        <group>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={`left-vent-${i}`} position={[-width / 2 + wallThickness / 2 + 0.3, centerY - 18 + i * 9, 0]} castShadow>
              <boxGeometry args={[wallThickness + 0.4, 4.5, 11]} />
              <meshStandardMaterial color="#1f1f1f" metalness={0.6} roughness={0.6} />
            </mesh>
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={`right-vent-${i}`} position={[width / 2 - wallThickness / 2 - 0.3, centerY - 18 + i * 9, 0]} castShadow>
              <boxGeometry args={[wallThickness + 0.4, 4.5, 11]} />
              <meshStandardMaterial color="#1f1f1f" metalness={0.6} roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}
      {([-1, 1] as const).flatMap(x => ([-1, 1] as const).map(z => {
        const px = (width / 2 - 6) * x
        const pz = (depth / 2 - 6) * z
        return (
          <group key={`${x}-${z}`} position={[px, height - 4, pz]}>
            <mesh castShadow>
              <cylinderGeometry args={[2.8, 2.8, 1.8, 6]} />
              <primitive object={hardwareMaterial} attach="material" />
            </mesh>
            <mesh position={[0, -6, 0]} castShadow>
              <cylinderGeometry args={[1.6, 1.6, 8, 8]} />
              <primitive object={hardwareMaterial} attach="material" />
            </mesh>
          </group>
        )
      }))}
      <RoundedBox args={[width - wallThickness * 2.2, 1.5, depth - wallThickness * 2.2]} radius={0.8} position={[0, wallThickness + 3, 0]}>
        <primitive object={darkerAluminum} attach="material" />
      </RoundedBox>
    </group>
  )
}
