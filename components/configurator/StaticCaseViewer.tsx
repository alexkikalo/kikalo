'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center } from '@react-three/drei'

/**
 * Loads the static case.gltf model
 * Place the file at: public/models/case.gltf
 */
function CaseModel() {
  const { scene } = useGLTF('/models/case.gltf')
  return <primitive object={scene} />
}

export function StaticCaseViewer() {
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
          <CaseModel />
        </Center>

        <OrbitControls enableDamping dampingFactor={0.12} />
      </Canvas>
    </div>
  )
}
