'use client'

import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EnclosureModel } from './EnclosureModel'
import type { NovaShellVariant } from '@/lib/variants'
import { RotateCw, Maximize2 } from 'lucide-react'

interface ThreeDViewerProps {
  variant: NovaShellVariant
  className?: string
}

export function ThreeDViewer({ variant, className = '' }: ThreeDViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true)
  const [key, setKey] = useState(0)

  const resetView = useCallback(() => {
    setKey(k => k + 1)
    setAutoRotate(true)
  }, [])

  const { width, depth, height } = variant.dimensions
  // Treat dimensions as mm for camera framing (consistent with EnclosureModel)
  const maxDim = Math.max(width, depth, height)
  const cameraDistance = Math.max(180, maxDim * 1.35)
  const cameraPosition: [number, number, number] = [cameraDistance * 0.85, cameraDistance * 0.55, cameraDistance * 0.95]

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <Canvas
        key={key}
        camera={{ position: cameraPosition, fov: 42, near: 10, far: 2000 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, toneMapping: 3, toneMappingExposure: 1.1 }}
        shadows
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[120, 180, 90]} intensity={1.35} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-140, 60, -110]} intensity={0.45} />
        <EnclosureModel variant={variant} autoRotate={autoRotate} />
        <OrbitControls
          key={key}
          enablePan={false}
          enableZoom={true}
          minDistance={Math.max(60, maxDim * 0.6)}
          maxDistance={Math.max(420, maxDim * 2.2)}
          target={[0, height * 0.42, 0]}
          autoRotate={autoRotate}
          autoRotateSpeed={0.28}
          enableDamping
          dampingFactor={0.12}
        />
        <Environment preset="studio" />
      </Canvas>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <div className="hidden sm:block">Drag to orbit • Scroll to zoom</div>
            <div className="sm:hidden">Touch to orbit</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.985] ${autoRotate ? 'border-zinc-700 bg-zinc-900 text-white' : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'}`}
            >
              <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin [animation-duration:2.2s]' : ''}`} />
              <span className="hidden sm:inline">Auto</span>
            </button>
            <button
              onClick={resetView}
              className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:text-white active:scale-[0.985]"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-mono tracking-[1.5px] text-zinc-400 backdrop-blur">
        PRESET PREVIEW
      </div>
      <div className="absolute right-4 top-4 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-right text-xs backdrop-blur">
        <div className="font-mono text-[10px] text-zinc-500">EXTERNAL</div>
        <div className="font-medium text-white tabular-nums">
          {width} × {depth} × {height} <span className="text-[10px] text-zinc-400">mm</span>
        </div>
      </div>
    </div>
  )
}
